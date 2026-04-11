import path from "path"

import type { CollectionConfig } from "payload"

import { toRelativePublicMediaUrl } from "@/lib/media-url"

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
      "Central media library (site-wide). Files live in public/media and are addressed as /media/... (afterRead URL rewrite). Add files on disk, then run npm run media:sync (or migrate:media:from-public-images) to create matching Media rows for Payload. Hero, header/footer logo, Services, Pages, and Projects pick files here.",
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
