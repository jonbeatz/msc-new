import type { ProjectsHome } from "@/payload-types"

export type DemoProject = {
  id: string
  title: string
  category: string
  subtitle: string
  image: string
  demoUrl: string
  isFeatured: boolean
}

type ProjectItem = NonNullable<NonNullable<ProjectsHome["projectItems"]>>[number]

export function normalizeMediaSrc(pathOrUrl: string): string {
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl
  }
  return pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`
}

/** Match hero fallbacks (`components/hero-section.tsx`); files live under `public/media`. */
export const FALLBACK_DEMOS: DemoProject[] = [
  {
    id: "fallback-1",
    title: "Talk Show Studio",
    category: "Interview Format",
    subtitle:
      "Professional talk show layout with guest management, episode scheduling, and live audience interaction features.",
    image: "/media/hero-studio.jpg",
    demoUrl: "#msc-demos",
    isFeatured: true,
  },
  {
    id: "fallback-2",
    title: "Culinary Channel",
    category: "Cooking Show",
    subtitle:
      "Recipe-driven content platform with ingredient lists, step-by-step guides, and meal planning integration.",
    image: "/media/show-artwork.jpg",
    demoUrl: "#msc-demos",
    isFeatured: false,
  },
  {
    id: "fallback-3",
    title: "Audio Network",
    category: "Podcast Platform",
    subtitle:
      "Audio-first streaming experience with playlist support, transcriptions, and subscriber management.",
    image: "/media/on-air-bg.jpg",
    demoUrl: "#msc-demos",
    isFeatured: false,
  },
  {
    id: "fallback-4",
    title: "Film Studio",
    category: "Documentary Series",
    subtitle:
      "Cinematic storytelling platform with chapter navigation, behind-the-scenes content, and filmmaker profiles.",
    image: "/media/creator-in-mind.jpg",
    demoUrl: "#msc-demos",
    isFeatured: false,
  },
]

/**
 * Maps `projects-home.projectItems` to public-site demo cards.
 * Each row is resolved by **array index** + its own `row.image` value only (no global filename lookup).
 * IDs are stable for React: Payload row `id` when present, always disambiguated with index.
 */
export function mapProjectItemsToDemos(
  rows: ProjectItem[] | null | undefined,
): DemoProject[] {
  if (!Array.isArray(rows)) return []

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
          ? ((media as { url?: string }).url ?? null)
          : null

      if (!title || !demoUrl || !imageUrl) return null
      if (row.isVisible === false) return null

      const rowId =
        typeof row.id === "string" && row.id.length > 0 ? row.id : null
      const id = `projects-home-${index}-${rowId ?? "row"}`

      return {
        id,
        title,
        subtitle,
        category,
        image: normalizeMediaSrc(imageUrl),
        demoUrl,
        isFeatured: row.isFeatured === true,
      } satisfies DemoProject
    })
    .filter((row): row is DemoProject => row !== null)

  if (mapped.length === 0) return []

  const featured = mapped.find((row) => row.isFeatured) ?? mapped[0]
  const rest = mapped.filter((row) => row.id !== featured.id)
  return [{ ...featured, isFeatured: true }, ...rest]
}
