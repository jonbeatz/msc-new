/**
 * Cursor `stop` hook: after an agent turn completes, run `npm run verify:next`
 * when runtime-related files changed — but only if port 3000 is free, so we
 * never wipe `.next` while `next dev` is running.
 *
 * stdin: { status, workspace_roots, ... }
 * stdout: optional JSON { followup_message?: string }
 */

import net from 'node:net'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function readStdin() {
  return new Promise((resolve, reject) => {
    const chunks = []
    process.stdin.on('data', (c) => chunks.push(c))
    process.stdin.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    process.stdin.on('error', reject)
  })
}

function portInUse(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = net.createConnection({ port, host }, () => {
      socket.destroy()
      resolve(true)
    })
    socket.on('error', () => resolve(false))
    socket.setTimeout(800, () => {
      socket.destroy()
      resolve(false)
    })
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

function getChangedFiles(repoRoot) {
  try {
    const diff = spawnSync('git', ['diff', '--name-only', 'HEAD'], {
      cwd: repoRoot,
      encoding: 'utf8',
      shell: false,
    })
    const untracked = spawnSync('git', ['ls-files', '-o', '--exclude-standard'], {
      cwd: repoRoot,
      encoding: 'utf8',
      shell: false,
    })
    if (diff.status !== 0 && diff.stderr) {
      console.error('[verify-after-agent]', diff.stderr.trim())
    }
    const a = (diff.stdout || '').split(/\r?\n/).filter(Boolean)
    const b = (untracked.stdout || '').split(/\r?\n/).filter(Boolean)
    return [...new Set([...a, ...b])]
  } catch (e) {
    console.error('[verify-after-agent] git failed:', e.message)
    return null
  }
}

function hasGitDir(repoRoot) {
  return fs.existsSync(path.join(repoRoot, '.git'))
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

  const files = getChangedFiles(repoRoot)
  if (files === null) {
    process.exit(0)
  }

  const touched = files.filter(isRuntimePath)
  if (touched.length === 0) {
    process.exit(0)
  }

  if (await portInUse(3000)) {
    const msg =
      'Port 3000 is in use (likely `next dev`). Skipped `npm run verify:next` so `.next` is not deleted under a running server. Stop dev, then run `npm run verify:next`, then `npm run dev`.'
    console.log(JSON.stringify({ followup_message: msg }))
    process.exit(0)
  }

  console.error('[verify-after-agent] Runtime files changed; running npm run verify:next …')
  const r = spawnSync(
    process.platform === 'win32' ? 'npm.cmd' : 'npm',
    ['run', 'verify:next'],
    {
      cwd: repoRoot,
      stdio: 'inherit',
      shell: false,
      env: { ...process.env },
    },
  )
  process.exit(typeof r.status === 'number' ? r.status : 1)
}

main().catch((e) => {
  console.error('[verify-after-agent]', e)
  process.exit(0)
})
