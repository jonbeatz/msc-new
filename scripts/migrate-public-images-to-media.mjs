/**
 * Sync-only migration: align Payload `media` documents with files already in `public/media`.
 *
 * - Recursively scans `public/media` for common image extensions.
 * - Skips if a Media doc with the same `filename` already exists.
 * - Otherwise creates a Media row with metadata derived from the file on disk (no `filePath` / no upload pipeline).
 *
 * Local (Cursor / repo root):
 *   npm run migrate:media:from-public-images
 *   npm run migrate:media:from-public-images -- --dry-run
 *
 * Env:
 *   PAYLOAD_CONFIG_PATH — optional override for payload.config path
 *   MIGRATE_DRY_RUN=true — log only, no DB writes
 *
 * Requires `filesRequiredOnCreate: false` on the Media collection upload config (see collections/Media.ts).
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

function altFromFilename(filename) {
  const base = path.basename(filename, path.extname(filename))
  const spaced = base.replace(/[-_]+/g, " ").trim()
  return spaced.length > 0 ? spaced : filename
}

/** DB `filename` as stored by Payload: posix path relative to `upload.staticDir` (e.g. `hero-slide-2.jpg` or `sub/photo.jpg`). */
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

/**
 * @param {string} absPath
 * @param {string} filename — basename on disk / DB `filename`
 * @param {string} serverURL
 */
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

  /** @type {{ width?: number; height?: number }} */
  const dims = {}
  try {
    const dim = imageSize(buf)
    if (dim && typeof dim.width === "number" && typeof dim.height === "number") {
      dims.width = dim.width
      dims.height = dim.height
    }
  } catch {
    // optional for odd formats
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
      console.warn(`[migrate-public-images-to-media] Directory missing (nothing to do): ${dir}`)
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

async function mediaExistsByFilename(payload, filename) {
  const found = await payload.find({
    collection: "media",
    where: {
      filename: {
        equals: filename,
      },
    },
    limit: 1,
    depth: 0,
    pagination: false,
  })
  return (found.docs?.length ?? 0) > 0
}

async function syncMediaFromDisk(payload) {
  const dry = isDryRun()
  const serverURL = serverUrlFromPayload(payload)

  await fs.mkdir(MEDIA_ROOT, { recursive: true })

  const files = await walkImageFiles(MEDIA_ROOT)
  files.sort((a, b) => a.localeCompare(b))

  console.log(`[migrate-public-images-to-media] Sync scan: ${MEDIA_ROOT} — ${files.length} image file(s). dryRun=${dry}`)

  let created = 0
  let skippedExisting = 0
  let failed = 0

  for (const filePath of files) {
    const filename = mediaFilenameFromAbsPath(filePath)

    const exists = await mediaExistsByFilename(payload, filename)
    if (exists) {
      console.log(`[migrate-public-images-to-media] Skip (already in Media): ${filename}`)
      skippedExisting += 1
      continue
    }

    if (dry) {
      console.log(`[migrate-public-images-to-media] Would create Media (DB only): ${filename}  ←  ${filePath}`)
      created += 1
      continue
    }

    try {
      const data = await buildMediaDataFromExistingFile(filePath, filename, serverURL)
      await payload.create({
        collection: "media",
        data,
        overrideAccess: true,
        depth: 0,
      })
      console.log(`[migrate-public-images-to-media] Created Media (DB only): ${filename}`)
      created += 1
    } catch (err) {
      failed += 1
      console.error(`[migrate-public-images-to-media] Failed: ${filename}`, err)
    }
  }

  console.log(
    `[migrate-public-images-to-media] Done. created=${created} skippedExisting=${skippedExisting} failed=${failed}`,
  )
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
  console.error("[migrate-public-images-to-media] Failed:", error)
  process.exitCode = 1
} finally {
  await payload.destroy()
}
