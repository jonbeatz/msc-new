import { unstable_noStore as noStore } from "next/cache"
import { getPayload } from "payload"
import config from "@payload-config"

export type DemoProject = {
  id: string
  title: string
  category: string
  subtitle: string
  image: string
  demoUrl: string
  isFeatured: boolean
}

function normalizeMediaSrc(pathOrUrl: string): string {
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl
  }
  return pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`
}

/** Match hero fallbacks (`components/hero-section.tsx`) so local assets exist when CMS has no projects. */
const FALLBACK_DEMOS: DemoProject[] = [
  {
    id: "fallback-1",
    title: "Talk Show Studio",
    category: "Interview Format",
    subtitle:
      "Professional talk show layout with guest management, episode scheduling, and live audience interaction features.",
    image: "/images/tv-wall.jpg",
    demoUrl: "#msc-demos",
    isFeatured: true,
  },
  {
    id: "fallback-2",
    title: "Culinary Channel",
    category: "Cooking Show",
    subtitle:
      "Recipe-driven content platform with ingredient lists, step-by-step guides, and meal planning integration.",
    image: "/images/show-cards.jpg",
    demoUrl: "#msc-demos",
    isFeatured: false,
  },
  {
    id: "fallback-3",
    title: "Audio Network",
    category: "Podcast Platform",
    subtitle:
      "Audio-first streaming experience with playlist support, transcriptions, and subscriber management.",
    image: "/images/on-air.jpg",
    demoUrl: "#msc-demos",
    isFeatured: false,
  },
  {
    id: "fallback-4",
    title: "Film Studio",
    category: "Documentary Series",
    subtitle:
      "Cinematic storytelling platform with chapter navigation, behind-the-scenes content, and filmmaker profiles.",
    image: "/images/creator-solo.jpg",
    demoUrl: "#msc-demos",
    isFeatured: false,
  },
]

export async function getDemoProjects(): Promise<DemoProject[]> {
  noStore()
  try {
    const payload = await getPayload({ config })
    const doc = await payload.findGlobal({
      slug: "projects-home",
      depth: 1,
    })

    const rows = Array.isArray(doc?.projectItems) ? doc.projectItems : []
    const mapped = rows
      .map((row, index) => {
        if (!row || typeof row !== "object") return null
        const title = typeof row.title === "string" ? row.title.trim() : ""
        const subtitle =
          typeof row.subtitle === "string" ? row.subtitle.trim() : ""
        const demoUrl = typeof row.demoUrl === "string" ? row.demoUrl.trim() : ""
        const category =
          typeof row.category === "string" && row.category.trim().length > 0
            ? row.category.trim()
            : "Project"

        const media = row.image
        const imageUrl =
          media && typeof media === "object" && "url" in media
            ? (media as { url?: string }).url
            : null

        if (!title || !demoUrl || !imageUrl) return null
        if (row.isVisible === false) return null

        return {
          id:
            typeof (row as { id?: string }).id === "string"
              ? (row as { id: string }).id
              : `row-${index}`,
          title,
          subtitle,
          category,
          image: normalizeMediaSrc(imageUrl),
          demoUrl,
          isFeatured: row.isFeatured === true,
        } satisfies DemoProject
      })
      .filter((row): row is DemoProject => row !== null)

    if (mapped.length === 0) return FALLBACK_DEMOS

    const featured = mapped.find((row) => row.isFeatured) ?? mapped[0]
    const rest = mapped.filter((row) => row.id !== featured.id)
    return [{ ...featured, isFeatured: true }, ...rest]
  } catch {
    return FALLBACK_DEMOS
  }
}

