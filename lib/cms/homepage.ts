import { getPayload } from "payload"
import config from "@payload-config"

import type { HeroSlideContent, HeroStatContent } from "./content-types"

export type { HeroSlideContent, HeroStatContent } from "./content-types"

/** Same-origin `/api/media/...` works with `next/image`; absolute only when already provided. */
function normalizeMediaSrc(pathOrUrl: string): string {
  if (
    pathOrUrl.startsWith("http://") ||
    pathOrUrl.startsWith("https://")
  ) {
    return pathOrUrl
  }
  return pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`
}

export async function getHomepageCmsData(): Promise<{
  heroSlides: HeroSlideContent[] | null
  heroStats: HeroStatContent[] | null
}> {
  try {
    const payload = await getPayload({ config })
    const doc = await payload.findGlobal({
      slug: "homepage",
      depth: 2,
    })

    const rawSlides = doc?.heroSlides
    if (!Array.isArray(rawSlides) || rawSlides.length === 0) {
      return { heroSlides: null, heroStats: null }
    }

    const heroSlides: HeroSlideContent[] = []
    for (const row of rawSlides) {
      if (!row || typeof row !== "object") continue
      const img = row.image
      if (typeof img !== "object" || img === null || !("url" in img)) continue
      const url = (img as { url?: string }).url
      if (!url) continue
      const alt =
        typeof (img as { alt?: string }).alt === "string"
          ? (img as { alt: string }).alt
          : "Hero image"
      const h1 = row.headlineLine1
      const h2 = row.headlineLine2
      const h3 = row.headlineLine3
      if (
        typeof h1 !== "string" ||
        typeof h2 !== "string" ||
        typeof h3 !== "string"
      ) {
        continue
      }
      heroSlides.push({
        image: normalizeMediaSrc(url),
        alt,
        eyebrow:
          typeof row.eyebrow === "string" ? row.eyebrow : "",
        headline: [h1, h2, h3],
        sub: typeof row.sub === "string" ? row.sub : "",
      })
    }

    const rawStats = doc?.heroStats
    let heroStats: HeroStatContent[] | null = null
    if (Array.isArray(rawStats) && rawStats.length > 0) {
      const mapped: HeroStatContent[] = []
      for (const s of rawStats) {
        if (!s || typeof s !== "object") continue
        if (typeof s.value !== "string" || typeof s.label !== "string") continue
        mapped.push({
          value: s.value,
          label: s.label,
          highlight: Boolean(s.highlight),
        })
      }
      if (mapped.length > 0) heroStats = mapped
    }

    return {
      heroSlides: heroSlides.length > 0 ? heroSlides : null,
      heroStats,
    }
  } catch {
    return { heroSlides: null, heroStats: null }
  }
}
