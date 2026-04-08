import { getPayload } from "payload"
import config from "@payload-config"

async function run() {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: "hero-slides",
    limit: 200,
    depth: 0,
    pagination: false,
  })

  const docs = Array.isArray(result.docs) ? result.docs : []
  if (docs.length === 0) {
    console.log("[backfill-hero-slides-seo] No hero-slides found. Nothing to update.")
    return
  }

  let updated = 0
  for (const doc of docs) {
    const meta =
      doc && typeof doc.meta === "object" && doc.meta !== null
        ? (doc.meta as Record<string, unknown>)
        : {}

    const title =
      typeof meta.title === "string" && meta.title.length > 0
        ? meta.title
        : typeof doc.headlineLine1 === "string"
          ? doc.headlineLine1
          : ""
    const description =
      typeof meta.description === "string" && meta.description.length > 0
        ? meta.description
        : typeof doc.sub === "string"
          ? doc.sub
          : ""
    const image = meta.image ?? doc.image ?? undefined

    await payload.update({
      collection: "hero-slides",
      id: doc.id,
      data: {
        meta: {
          title,
          description,
          image,
        },
      },
      depth: 0,
    })
    updated += 1
  }

  console.log(`[backfill-hero-slides-seo] Updated ${updated} hero-slides docs.`)
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("[backfill-hero-slides-seo] Failed:", error)
    process.exit(1)
  })

