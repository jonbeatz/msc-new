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
    preferredImageFilenames: ["demo-talkshow.jpg", "hero-studio.jpg"],
    demoUrl: "#msc-demos",
    isFeatured: true,
  },
  {
    title: "Culinary Channel",
    subtitle:
      "Recipe-driven content platform with ingredient lists, step-by-step guides, and meal planning integration.",
    category: "cooking-show",
    preferredImageFilenames: ["demo-cooking.jpg", "show-artwork.jpg"],
    demoUrl: "#msc-demos",
    isFeatured: false,
  },
  {
    title: "Audio Network",
    subtitle:
      "Audio-first streaming experience with playlist support, transcriptions, and subscriber management.",
    category: "podcast-platform",
    preferredImageFilenames: ["demo-podcast.jpg", "on-air-bg.jpg"],
    demoUrl: "#msc-demos",
    isFeatured: false,
  },
  {
    title: "Film Studio",
    subtitle:
      "Cinematic storytelling platform with chapter navigation, behind-the-scenes content, and filmmaker profiles.",
    category: "documentary-series",
    preferredImageFilenames: ["demo-documentary.jpg", "creator-in-mind.jpg"],
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

  const projectItems: Array<{
    title: string
    subtitle: string
    category: string
    image: number
    demoUrl: string
    isFeatured: boolean
    isVisible: boolean
  }> = []

  for (let i = 0; i < STARTER_PROJECTS.length; i += 1) {
    const starter = STARTER_PROJECTS[i]

    const matchedMediaId =
      starter.preferredImageFilenames
        .map((name) => mediaByFilename.get(name))
        .find(Boolean) ?? mediaDocs[i % mediaDocs.length]?.id

    if (matchedMediaId === undefined || matchedMediaId === null) {
      throw new Error(`No media available for starter project "${starter.title}".`)
    }

    const imageId =
      typeof matchedMediaId === "number"
        ? matchedMediaId
        : Number(matchedMediaId)
    if (!Number.isFinite(imageId)) {
      throw new Error(`Invalid media id for "${starter.title}".`)
    }

    projectItems.push({
      title: starter.title,
      subtitle: starter.subtitle,
      category: starter.category,
      image: imageId,
      demoUrl: starter.demoUrl,
      isFeatured: starter.isFeatured,
      isVisible: true,
    })
  }

  await payload.updateGlobal({
    slug: "projects-home",
    data: {
      projectItems,
    },
  })

  console.log(
    `[seed-projects] Updated global projects-home with ${projectItems.length} project row(s).`,
  )
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("[seed-projects] Failed:", error)
    process.exit(1)
  })
