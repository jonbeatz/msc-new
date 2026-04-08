import { getPayload } from "payload"
import config from "@payload-config"

import type { HeroSlideContent, HeroStatContent } from "./content-types"

export type { HeroSlideContent, HeroStatContent } from "./content-types"

export type HomepageActiveSlideSeo = {
  title: string | null
  description: string | null
  image: string | null
}

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
      const h1 =
        typeof row.headlineLine1 === "string"
          ? row.headlineLine1
          : ""
      const h2 =
        typeof row.headlineLine2 === "string" ? row.headlineLine2 : ""
      const h3 =
        typeof row.headlineLine3 === "string" ? row.headlineLine3 : ""
      if (
        typeof h1 !== "string" ||
        typeof h2 !== "string" ||
        typeof h3 !== "string"
      ) {
        continue
      }

      let seoImage: string | undefined
      if (row.seo && typeof row.seo === "object") {
        const seoImg = (row.seo as { image?: unknown }).image
        if (seoImg && typeof seoImg === "object" && "url" in seoImg) {
          const seoImageUrl = (seoImg as { url?: string }).url
          if (typeof seoImageUrl === "string" && seoImageUrl.length > 0) {
            seoImage = normalizeMediaSrc(seoImageUrl)
          }
        }
      }

      heroSlides.push({
        image: normalizeMediaSrc(url),
        alt,
        isActive: row.isActive !== false,
        eyebrow:
          typeof row.eyebrow === "string" && row.eyebrow.length > 0
            ? row.eyebrow
            : "Featured Slide",
        headline: [h1, h2, h3],
        sub: typeof row.sub === "string" ? row.sub : "",
        ctaLink:
          typeof row.ctaLink === "string" && row.ctaLink.trim().length > 0
            ? row.ctaLink.trim()
            : undefined,
        seo:
          row.seo && typeof row.seo === "object"
            ? {
                title:
                  typeof (row.seo as { title?: string }).title === "string"
                    ? (row.seo as { title: string }).title
                    : undefined,
                description:
                  typeof (row.seo as { description?: string }).description ===
                  "string"
                    ? (row.seo as { description: string }).description
                    : undefined,
                image: seoImage,
              }
            : undefined,
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

export async function getHomepageActiveSlideSeo(): Promise<HomepageActiveSlideSeo | null> {
  try {
    const payload = await getPayload({ config })
    const doc = await payload.findGlobal({
      slug: "homepage",
      depth: 2,
    })

    const rawSlides = Array.isArray(doc?.heroSlides) ? doc.heroSlides : []
    const activeSlide =
      rawSlides.find(
        (row) => row && typeof row === "object" && row.isActive !== false
      ) ?? null

    if (!activeSlide || typeof activeSlide !== "object") return null

    const seo =
      activeSlide.seo && typeof activeSlide.seo === "object"
        ? (activeSlide.seo as Record<string, unknown>)
        : {}

    const fallbackTitle =
      typeof activeSlide.headlineLine1 === "string"
        ? activeSlide.headlineLine1.trim()
        : ""
    const fallbackDescription =
      typeof activeSlide.sub === "string" ? activeSlide.sub.trim() : ""

    const seoImageRelation = seo.image
    const slideImageRelation = activeSlide.image

    let image: string | null = null
    if (seoImageRelation && typeof seoImageRelation === "object" && "url" in seoImageRelation) {
      const url = (seoImageRelation as { url?: string }).url
      if (typeof url === "string" && url.length > 0) image = normalizeMediaSrc(url)
    } else if (slideImageRelation && typeof slideImageRelation === "object" && "url" in slideImageRelation) {
      const url = (slideImageRelation as { url?: string }).url
      if (typeof url === "string" && url.length > 0) image = normalizeMediaSrc(url)
    }

    return {
      title:
        typeof seo.title === "string" && seo.title.trim().length > 0
          ? seo.title.trim()
          : fallbackTitle || null,
      description:
        typeof seo.description === "string" && seo.description.trim().length > 0
          ? seo.description.trim()
          : fallbackDescription || null,
      image,
    }
  } catch {
    return null
  }
}
