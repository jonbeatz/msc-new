/**
 * Move files from redundant folders into `public/media`:
 * - `<repo>/media` (project root)
 * - `<repo>/public/images`
 *
 * If `public/media/<filename>` already exists, does not overwrite; removes the
 * redundant source file so duplicates are not left behind.
 *
 * Local (Cursor / repo root): npm run media:consolidate
 */

import fs from "fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, "..")
const DEST = path.join(ROOT, "public", "media")

const SOURCES = [path.join(ROOT, "media"), path.join(ROOT, "public", "images")]

async function exists(p) {
  try {
    await fs.access(p)
    return true
  } catch {
    return false
  }
}

/**
 * @param {string} srcPath
 * @param {string} baseName
 */
async function ingestFile(srcPath, baseName) {
  if (baseName === ".gitkeep") {
    return
  }
  const destPath = path.join(DEST, baseName)
  if (!(await exists(destPath))) {
    await fs.rename(srcPath, destPath)
    console.log(`moved: ${baseName}`)
    return
  }
  await fs.unlink(srcPath)
  console.log(`duplicate removed (already in public/media): ${baseName}`)
}

/**
 * @param {string} dirPath
 */
async function ingestFlatDir(dirPath) {
  if (!(await exists(dirPath))) {
    console.log(`skip (missing): ${path.relative(ROOT, dirPath)}`)
    return
  }
  const entries = await fs.readdir(dirPath, { withFileTypes: true })
  for (const ent of entries) {
    const full = path.join(dirPath, ent.name)
    if (ent.isDirectory()) {
      console.warn(`skip subdirectory (move files manually if needed): ${path.relative(ROOT, full)}`)
      continue
    }
    if (ent.isFile()) {
      await ingestFile(full, ent.name)
    }
  }
}

async function main() {
  await fs.mkdir(DEST, { recursive: true })
  for (const src of SOURCES) {
    await ingestFlatDir(src)
  }

  const mediaRoot = path.join(ROOT, "media")
  if (await exists(mediaRoot)) {
    await fs.rm(mediaRoot, { recursive: true, force: true })
    console.log("removed: media/")
  }

  const imagesDir = path.join(ROOT, "public", "images")
  if (await exists(imagesDir)) {
    await fs.rm(imagesDir, { recursive: true, force: true })
    console.log("removed: public/images/")
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
