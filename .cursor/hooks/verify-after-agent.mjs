/**
 * Cursor `stop` hook: after an agent turn completes, if Git shows runtime-related
 * changes (including **new commits** since the last hook run — not only dirty
 * files), spawn **`npm run dev`** detached when **port 3000 is free** (same as
 * local `dev`: free **3000** then **`next dev`** — no **`clean:next`**). If **3000**
 * is already in use**, emit a follow-up only (do not kill your server). Use
 * **`npm run dev:fresh`** / **`dev:recover`** manually when chunks are stale.
 *
 * stdin: { status, workspace_roots, ... }
 * stdout: optional JSON { followup_message?: string }
 */

import { spawn, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import net from 'node:net'
import path from 'node:path'

function readStdin() {
  return new Promise((resolve, reject) => {
    const chunks = []
    process.stdin.on('data', (c) => chunks.push(c))
    process.stdin.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    process.stdin.on('error', reject)
  })
}

const RUNTIME_PATH = /^(app|components|lib|collections|globals)\//
const RUNTIME_FILE =
  /^(middleware\.(ts|js)|next\.config\.(mjs|js|ts)|payload\.config\.(ts|js)|package\.json|package-lock\.json|tsconfig\.json|postcss\.config\.(mjs|js)|tailwind\.config\.(ts|js|mjs))$/

function isRuntimePath(file) {
  const f = file.replace(/\\/g, '/')
  if (RUNTIME_PATH.test(f)) return true
  if (RUNTIME_FILE.test(f)) return true
  if (f.startsWith('scripts/')) return true
  if (f.startsWith('src/')) return true
  return false
}

const HOOK_HEAD_FILE = '.last-stop-hook-commit'

function hookHeadPath(repoRoot) {
  return path.join(repoRoot, '.cursor', HOOK_HEAD_FILE)
}

function readPrevHookHead(repoRoot) {
  try {
    const t = fs.readFileSync(hookHeadPath(repoRoot), 'utf8').trim()
    return t || null
  } catch {
    return null
  }
}

function writeHookHead(repoRoot, sha) {
  const dir = path.join(repoRoot, '.cursor')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(hookHeadPath(repoRoot), `${sha}\n`, 'utf8')
}

function gitRevParseHead(repoRoot) {
  const r = spawnSync('git', ['rev-parse', 'HEAD'], {
    cwd: repoRoot,
    encoding: 'utf8',
    shell: false,
  })
  if (r.status !== 0) return null
  return (r.stdout || '').trim() || null
}

function getChangedFiles(repoRoot, prevHookHead) {
  const names = new Set()
  const add = (s) => {
    for (const line of (s || '').split(/\r?\n/)) {
      if (line) names.add(line)
    }
  }

  try {
    const diff = spawnSync('git', ['diff', '--name-only', 'HEAD'], {
      cwd: repoRoot,
      encoding: 'utf8',
      shell: false,
    })
    if (diff.status !== 0 && diff.stderr) {
      console.error('[verify-after-agent]', diff.stderr.trim())
    }
    add(diff.stdout)

    const untracked = spawnSync('git', ['ls-files', '-o', '--exclude-standard'], {
      cwd: repoRoot,
      encoding: 'utf8',
      shell: false,
    })
    add(untracked.stdout)

    if (prevHookHead) {
      const curr = gitRevParseHead(repoRoot)
      if (curr && prevHookHead !== curr) {
        const range = spawnSync(
          'git',
          ['diff', '--name-only', `${prevHookHead}..${curr}`],
          { cwd: repoRoot, encoding: 'utf8', shell: false },
        )
        if (range.status === 0) add(range.stdout)
      }
    }
  } catch (e) {
    console.error('[verify-after-agent] git failed:', e.message)
    return null
  }

  return [...names]
}

function hasGitDir(repoRoot) {
  return fs.existsSync(path.join(repoRoot, '.git'))
}

function isPort3000InUse() {
  return new Promise((resolve) => {
    const socket = net.createConnection({ port: 3000, host: '127.0.0.1' })
    const finish = (v) => {
      try {
        socket.removeAllListeners()
        socket.destroy()
      } catch {
        // ignore
      }
      resolve(v)
    }
    socket.setTimeout(900)
    socket.once('connect', () => finish(true))
    socket.once('timeout', () => finish(false))
    socket.once('error', () => finish(false))
  })
}

async function main() {
  const raw = await readStdin()
  let input = {}
  try {
    input = raw ? JSON.parse(raw) : {}
  } catch {
    process.exit(0)
  }

  if (input.status && input.status !== 'completed') {
    process.exit(0)
  }

  const roots = input.workspace_roots
  const repoRoot = Array.isArray(roots) && roots[0] ? roots[0] : process.cwd()

  if (!hasGitDir(repoRoot)) {
    process.exit(0)
  }

  const currHead = gitRevParseHead(repoRoot)
  if (!currHead) {
    process.exit(0)
  }

  const prevHookHead = readPrevHookHead(repoRoot)
  const files = getChangedFiles(repoRoot, prevHookHead)
  if (files === null) {
    process.exit(0)
  }

  /** Always advance so the next run only diffs new commits since this hook. */
  writeHookHead(repoRoot, currHead)

  const touched = files.filter(isRuntimePath)
  if (touched.length === 0) {
    process.exit(0)
  }

  const portBusy = await isPort3000InUse()
  if (portBusy) {
    const followup =
      'Runtime-related files changed since the last Cursor stop hook snapshot, but **port 3000 is already in use** — skipped auto `npm run dev` so your current dev server is not killed. If `/` or `/admin` look stale (500s, missing vendor chunks), run **`npm run dev:fresh`** or **`npm run dev:recover`** from the repo root. Build gate for agents remains **`npm run verify:next`** or **`verify:next:safe`**.'
    console.error(
      '[verify-after-agent] Runtime files changed; port 3000 busy — not spawning dev.',
    )
    console.log(JSON.stringify({ followup_message: followup }))
    process.exit(0)
  }

  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'
  console.error(
    '[verify-after-agent] Runtime files changed; port 3000 free — spawning npm run dev (detached) …',
  )

  const child = spawn(npmCmd, ['run', 'dev'], {
    cwd: repoRoot,
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
    env: { ...process.env },
  })
  child.on('error', (err) => {
    console.error('[verify-after-agent] spawn failed:', err)
  })
  child.unref()

  const followup =
    'Started `npm run dev` in the background (frees port 3000 if needed, then `next dev` — no `clean:next`). When the log shows Ready, open http://127.0.0.1:3000/ — if you see vendor-chunk 500s, run `npm run dev:fresh`. Agents should still run `npm run verify:next` before finishing for a production build gate.'
  console.log(JSON.stringify({ followup_message: followup }))
  process.exit(0)
}

main().catch((e) => {
  console.error('[verify-after-agent]', e)
  process.exit(0)
})
