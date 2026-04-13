/**
 * Register files on disk under `public/media` as Payload `media` documents (SQLite / low-RAM friendly).
 *
 * - Loads existing `filename` values in paginated batches (one pass).
 * - Creates missing rows in small batches using Promise.allSettled (bounded parallelism).
 *
 * Use plain Node (not `npx tsx`): @payloadcms/db-sqlite pulls `payload/node` → Next `loadEnvConfig`,
 * which breaks under tsx’s CJS hook on some setups.
 *
 * Local (Cursor / repo root):
 *   node scripts/rebuild-media.mjs
 *   node scripts/rebuild-media.mjs --dry-run
 *
 * Live (cPanel → Terminal), after venv + cd to app:
 *   source …/nodevenv/.../activate
 *   cd /path/to/app
 *   node scripts/rebuild-media.mjs
 *   node scripts/rebuild-media.mjs --dry-run
 *
 * Env:
 *   PAYLOAD_CONFIG_PATH — optional path to payload config (default: ./payload.config.ts)
 *   REBUILD_MEDIA_CONCURRENCY — parallel creates per batch (default: 3)
 *   MIGRATE_DRY_RUN=true — same as --dry-run
 */

import fs from "fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { createJiti } from "jiti"
import { fileTypeFromFile } from "file-type"
import imageSize from "image-size"
import { loadEnv } from "payload/node"
import { getPayload } from "payload"

const IMAGE_EXT = new Set([
  ".apng",
  ".avif",
  ".bmp",
  ".gif",
  ".ico",
  ".jpg",
  ".jpeg",
  ".png",
  ".svg",
  ".webp",
])

const MIME_BY_EXT = {
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".bmp": "image/bmp",
}

const MEDIA_ROOT = path.resolve(process.cwd(), "public", "media")

function resolvePayloadConfigPath() {
  const env = process.env.PAYLOAD_CONFIG_PATH
  if (env && env.length > 0) {
    return path.isAbsolute(env) ? env : path.resolve(process.cwd(), env)
  }
  return path.resolve(process.cwd(), "payload.config.ts")
}

function isDryRun() {
  return process.argv.includes("--dry-run") || process.env.MIGRATE_DRY_RUN === "true"
}

function concurrency() {
  const raw = process.env.REBUILD_MEDIA_CONCURRENCY
  const n = raw ? Number.parseInt(raw, 10) : 3
  if (!Number.isFinite(n) || n < 1) return 1
  return Math.min(n, 8)
}

function altFromFilename(filename) {
  const base = path.basename(filename, path.extname(filename))
  const spaced = base.replace(/[-_]+/g, " ").trim()
  return spaced.length > 0 ? spaced : filename
}

function mediaFilenameFromAbsPath(absPath) {
  return path.relative(MEDIA_ROOT, absPath).split(path.sep).join("/")
}

function serverUrlFromPayload(payload) {
  const u = payload.config?.serverURL
  if (typeof u === "string" && u.length > 0) {
    return u.replace(/\/+$/, "")
  }
  return (
    process.env.NEXT_PUBLIC_SERVER_URL?.trim()?.replace(/\/+$/, "") ||
    process.env.PAYLOAD_PUBLIC_SERVER_URL?.trim()?.replace(/\/+$/, "") ||
    process.env.MSC_CANONICAL_SITE_ORIGIN?.trim()?.replace(/\/+$/, "") ||
    "https://mystudiochannel.com"
  )
}

function apiFileUrl(serverURL, filename) {
  return `${serverURL}/api/media/file/${encodeURIComponent(filename)}`
}

async function buildMediaDataFromExistingFile(absPath, filename, serverURL) {
  const st = await fs.stat(absPath)
  const buf = await fs.readFile(absPath)

  let mimeType = MIME_BY_EXT[path.extname(filename).toLowerCase()] ?? "application/octet-stream"
  try {
    const ft = await fileTypeFromFile(absPath)
    if (ft?.mime) {
      mimeType = ft.mime
    }
  } catch {
    // keep fallback
  }

  const dims = {}
  try {
    const dim = imageSize(buf)
    if (dim && typeof dim.width === "number" && typeof dim.height === "number") {
      dims.width = dim.width
      dims.height = dim.height
    }
  } catch {
    // optional
  }

  return {
    alt: altFromFilename(filename),
    filename,
    mimeType,
    filesize: st.size,
    url: apiFileUrl(serverURL, filename),
    ...(dims.width != null && dims.height != null ? dims : {}),
    sizes: {},
  }
}

async function walkImageFiles(dir) {
  const out = []
  let entries
  try {
    entries = await fs.readdir(dir, { withFileTypes: true })
  } catch (e) {
    if (e && e.code === "ENOENT") {
      console.warn(`[rebuild-media] Directory missing (nothing to do): ${dir}`)
      return out
    }
    throw e
  }

  for (const ent of entries) {
    const full = path.join(dir, ent.name)
    if (ent.isDirectory()) {
      out.push(...(await walkImageFiles(full)))
    } else if (ent.isFile()) {
      const ext = path.extname(ent.name).toLowerCase()
      if (IMAGE_EXT.has(ext)) {
        out.push(full)
      }
    }
  }
  return out
}

async function loadExistingFilenames(payload) {
  const set = new Set()
  let page = 1
  const limit = 250
  for (;;) {
    const res = await payload.find({
      collection: "media",
      limit,
      page,
      depth: 0,
      pagination: true,
      overrideAccess: true,
    })
    for (const doc of res.docs) {
      if (typeof doc.filename === "string" && doc.filename.length > 0) {
        set.add(doc.filename)
      }
    }
    if (!res.hasNextPage) break
    page += 1
  }
  return set
}

function chunk(arr, size) {
  const out = []
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size))
  }
  return out
}

async function runBatchCreates(payload, batch, serverURL, dry) {
  let created = 0
  let failed = 0

  const tasks = batch.map(({ absPath, filename }) =>
    (async () => {
      if (dry) {
        console.log(`[rebuild-media] Would create Media: ${filename}`)
        return
      }
      const data = await buildMediaDataFromExistingFile(absPath, filename, serverURL)
      await payload.create({
        collection: "media",
        data,
        overrideAccess: true,
        depth: 0,
      })
      console.log(`[rebuild-media] Created Media: ${filename}`)
      created += 1
    })().catch((err) => {
      failed += 1
      console.error(`[rebuild-media] Failed: ${filename}`, err)
    }),
  )

  await Promise.allSettled(tasks)
  return { created, failed }
}

async function syncMediaFromDisk(payload) {
  const dry = isDryRun()
  const parallel = concurrency()
  const serverURL = serverUrlFromPayload(payload)

  await fs.mkdir(MEDIA_ROOT, { recursive: true })

  const [existing, files] = await Promise.all([loadExistingFilenames(payload), walkImageFiles(MEDIA_ROOT)])

  files.sort((a, b) => a.localeCompare(b))

  const missing = []
  for (const absPath of files) {
    const filename = mediaFilenameFromAbsPath(absPath)
    if (!existing.has(filename)) {
      missing.push({ absPath, filename })
    }
  }

  console.log(
    `[rebuild-media] ${MEDIA_ROOT} — scanned ${files.length} image(s), ${existing.size} in DB, ${missing.length} to create. dryRun=${dry} concurrency=${parallel}`,
  )

  let created = 0
  const skippedExisting = files.length - missing.length
  let failed = 0

  const batches = chunk(missing, parallel)
  for (const batch of batches) {
    const r = await runBatchCreates(payload, batch, serverURL, dry)
    if (dry) {
      created += batch.length
    } else {
      created += r.created
      failed += r.failed
    }
  }

  if (dry) {
    console.log(`[rebuild-media] Done (dry run). wouldCreate=${created} alreadyInDb=${skippedExisting}`)
  } else {
    console.log(`[rebuild-media] Done. created=${created} skippedExisting=${skippedExisting} failed=${failed}`)
  }
}

process.env.DISABLE_PAYLOAD_HMR = "true"
loadEnv()

const root = process.cwd()
const jiti = createJiti(fileURLToPath(import.meta.url), {
  alias: {
    "@": root,
  },
})

const config = await jiti.import(resolvePayloadConfigPath(), { default: true })
const payload = await getPayload({ config })

try {
  await syncMediaFromDisk(payload)
} catch (error) {
  console.error("[rebuild-media] Failed:", error)
  process.exitCode = 1
} finally {
  await payload.destroy()
}
