import { getPayload } from "payload"
import config from "@payload-config"

type StarterProject = {
  title: string
  subtitle: string
  category:
    | "interview-format"
    | "cooking-show"
    | "podcast-platform"
    | "documentary-series"
  preferredImageFilenames: string[]
  demoUrl: string
  isFeatured: boolean
}

const STARTER_PROJECTS: StarterProject[] = [
  {
    title: "Talk Show Studio",
    subtitle:
      "Professional talk show layout with guest management, episode scheduling, and live audience interaction features.",
    category: "interview-format",
    preferredImageFilenames: ["demo-talkshow.jpg", "tv-wall.jpg"],
    demoUrl: "#msc-demos",
    isFeatured: true,
  },
  {
    title: "Culinary Channel",
    subtitle:
      "Recipe-driven content platform with ingredient lists, step-by-step guides, and meal planning integration.",
    category: "cooking-show",
    preferredImageFilenames: ["demo-cooking.jpg", "show-cards.jpg"],
    demoUrl: "#msc-demos",
    isFeatured: false,
  },
  {
    title: "Audio Network",
    subtitle:
      "Audio-first streaming experience with playlist support, transcriptions, and subscriber management.",
    category: "podcast-platform",
    preferredImageFilenames: ["demo-podcast.jpg", "on-air.jpg"],
    demoUrl: "#msc-demos",
    isFeatured: false,
  },
  {
    title: "Film Studio",
    subtitle:
      "Cinematic storytelling platform with chapter navigation, behind-the-scenes content, and filmmaker profiles.",
    category: "documentary-series",
    preferredImageFilenames: ["demo-documentary.jpg", "creator-solo.jpg"],
    demoUrl: "#msc-demos",
    isFeatured: false,
  },
]

async function run() {
  const payload = await getPayload({ config })

  const mediaResult = await payload.find({
    collection: "media",
    depth: 0,
    limit: 200,
    pagination: false,
  })

  const mediaDocs = Array.isArray(mediaResult.docs) ? mediaResult.docs : []
  if (mediaDocs.length === 0) {
    throw new Error("No media found. Upload at least one image before seeding projects.")
  }

  const mediaByFilename = new Map<string, number | string>()
  for (const media of mediaDocs) {
    if (typeof media.filename === "string" && media.filename.length > 0) {
      mediaByFilename.set(media.filename, media.id)
    }
  }

  let created = 0
  let updated = 0

  for (let i = 0; i < STARTER_PROJECTS.length; i += 1) {
    const starter = STARTER_PROJECTS[i]

    const matchedMediaId =
      starter.preferredImageFilenames
        .map((name) => mediaByFilename.get(name))
        .find(Boolean) ?? mediaDocs[i % mediaDocs.length]?.id

    if (!matchedMediaId) {
      throw new Error(`No media available for starter project "${starter.title}".`)
    }

    const existing = await payload.find({
      collection: "projects",
      depth: 0,
      limit: 1,
      pagination: false,
      where: {
        title: {
          equals: starter.title,
        },
      },
    })

    const data = {
      title: starter.title,
      subtitle: starter.subtitle,
      category: starter.category,
      image: matchedMediaId,
      demoUrl: starter.demoUrl,
      isFeatured: starter.isFeatured,
      isVisible: true,
    }

    const existingDoc = existing.docs[0]
    if (existingDoc) {
      await payload.update({
        collection: "projects",
        id: existingDoc.id,
        data,
        depth: 0,
      })
      updated += 1
    } else {
      await payload.create({
        collection: "projects",
        data,
        depth: 0,
      })
      created += 1
    }
  }

  console.log(
    `[seed-projects] Complete. Created ${created}, updated ${updated}, total configured ${STARTER_PROJECTS.length}.`
  )
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("[seed-projects] Failed:", error)
    process.exit(1)
  })

