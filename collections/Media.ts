import path from "path"

import type { CollectionConfig } from "payload"

import { toRelativePublicMediaUrl } from "@/lib/media-url"

/**
 * Developer reference (not shown in admin UI):
 * - Uploads are stored under `public/media` (`upload.staticDir`).
 * - `afterRead` rewrites `url` (and size URLs) to site-relative `/media/...` for consistent same-origin delivery.
 * - To register files that were added on disk without using the admin uploader, run from repo root:
 *   `npm run media:sync` (alias: `npm run migrate:media:from-public-images`), or `npm run media:rebuild`
 *   for batched / low-memory sync (`scripts/rebuild-media.mjs`).
 * - `upload.filesRequiredOnCreate: false` allows Payload rows to be created when syncing existing files (see migrate script).
 * - Hero, header/footer logo, Services gallery, Pages, and Projects consume Media relationships elsewhere.
 */

function rewriteMediaDocUrls(doc: Record<string, unknown>): void {
  if (typeof doc.url === "string" && doc.url.length > 0) {
    doc.url = toRelativePublicMediaUrl(doc.url)
  }
  const sizes = doc.sizes
  if (!sizes || typeof sizes !== "object" || Array.isArray(sizes)) return
  for (const key of Object.keys(sizes)) {
    const entry = (sizes as Record<string, unknown>)[key]
    if (!entry || typeof entry !== "object") continue
    const e = entry as Record<string, unknown>
    if (typeof e.url === "string" && e.url.length > 0) {
      e.url = toRelativePublicMediaUrl(e.url)
    }
  }
}

export const Media: CollectionConfig = {
  slug: "media",
  admin: {
    description:
      "Manage and organize the central media library for My Studio Channel. Uploaded assets are automatically optimized for use across the platform.",
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterRead: [
      ({ doc }) => {
        if (doc && typeof doc === "object") {
          rewriteMediaDocUrls(doc as Record<string, unknown>)
        }
        return doc
      },
    ],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
    },
  ],
  upload: {
    staticDir: path.resolve(process.cwd(), "public", "media"),
    // Allows `payload.create` without `file`/`filePath` when syncing DB rows to files already on disk (see scripts/migrate-public-images-to-media.mjs).
    filesRequiredOnCreate: false,
  },
}
