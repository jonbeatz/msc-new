/**
 * Local audit: create Media with no `alt` in `data` (simulates admin leaving Alt blank).
 * Expects hooks in `collections/Media.ts` to fill `alt` from filename before validation.
 *
 * Local (repo root): node scripts/verify-media-blank-alt.mjs
 */
import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { tmpdir } from "node:os"

import { createJiti } from "jiti"
import { loadEnv } from "payload/node"
import { getPayload } from "payload"

process.env.DISABLE_PAYLOAD_HMR = "true"
loadEnv()

const root = process.cwd()
const jiti = createJiti(fileURLToPath(import.meta.url), {
  alias: { "@": root },
})

const config = await jiti.import(path.resolve(root, "payload.config.ts"), {
  default: true,
})
const payload = await getPayload({ config })

const src = path.resolve(root, "public", "media", "demo-talkshow.jpg")
const auditName = `Demos-1b-audit-preview-${Date.now()}.jpg`
const dest = path.join(tmpdir(), auditName)

await fs.copyFile(src, dest)
const buf = await fs.readFile(dest)

let createdId = null
try {
  const doc = await payload.create({
    collection: "media",
    data: {},
    file: {
      data: buf,
      mimetype: "image/jpeg",
      name: auditName,
      size: buf.length,
    },
    overrideAccess: true,
    depth: 0,
  })
  createdId = doc.id
  const alt = typeof doc.alt === "string" ? doc.alt : null
  const ok =
    alt &&
    alt.toLowerCase().includes("demos") &&
    alt.toLowerCase().includes("audit")
  if (!ok) {
    console.error(
      `[verify-media-blank-alt] Unexpected alt after create: ${JSON.stringify(alt)} (expected filename-based text)`,
    )
    process.exitCode = 1
  } else {
    console.log(`[verify-media-blank-alt] OK create id=${doc.id} alt=${JSON.stringify(alt)}`)
  }
} catch (e) {
  console.error("[verify-media-blank-alt] Create failed:", e)
  process.exitCode = 1
} finally {
  await fs.unlink(dest).catch(() => {})
  if (createdId != null) {
    try {
      await payload.delete({
        collection: "media",
        id: createdId,
        overrideAccess: true,
      })
      console.log(`[verify-media-blank-alt] Cleaned up media id=${createdId}`)
    } catch (e) {
      console.warn("[verify-media-blank-alt] Cleanup delete failed:", e)
    }
  }
  await payload.destroy()
}
