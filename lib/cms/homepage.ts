import { getPayload } from "payload"
import config from "@payload-config"

import { toRelativePublicMediaUrl } from "@/lib/media-url"

import type {
  HeroSlideContent,
  HeroStatContent,
  ServicesGalleryItem,
} from "./content-types"

export type {
  HeroSlideContent,
  HeroStatContent,
  ServicesGalleryItem,
} from "./content-types"

export type HomepageActiveSlideSeo = {
  title: string | null
  description: string | null
  image: string | null
}

/** Align with Media `afterRead`: always same-origin paths (e.g. `/media/...`). */
function normalizeMediaSrc(pathOrUrl: string): string {
  return toRelativePublicMediaUrl(pathOrUrl)
}

function mapServicesGallery(
  doc: Record<string, unknown> | null | undefined,
): ServicesGalleryItem[] | null {
  if (!doc) return null
  const raw = doc.servicesGallery
  if (!Array.isArray(raw) || raw.length === 0) return null
  const out: ServicesGalleryItem[] = []
  for (const row of raw) {
    if (!row || typeof row !== "object") continue
    const img = (row as { image?: unknown }).image
    if (typeof img !== "object" || img === null || !("url" in img)) continue
    const media = img as unknown as { url?: string; alt?: string }
    const url = media.url
    if (!url) continue
    const alt =
      typeof media.alt === "string" ? media.alt : "Gallery image"
    const labelRaw = (row as { label?: string }).label
    const label =
      typeof labelRaw === "string" && labelRaw.trim().length > 0
        ? labelRaw.trim()
        : "Preview"
    out.push({
      src: normalizeMediaSrc(url),
      alt,
      label,
    })
  }
  return out.length > 0 ? out : null
}

export async function getHomepageCmsData(): Promise<{
  heroSlides: HeroSlideContent[] | null
  heroStats: HeroStatContent[] | null
  servicesGallery: ServicesGalleryItem[] | null
}> {
  try {
    const payload = await getPayload({ config })
    const doc = await payload.findGlobal({
      slug: "homepage",
      depth: 2,
    })

    const rawSlides = doc?.heroSlides
    if (!Array.isArray(rawSlides) || rawSlides.length === 0) {
      const d = doc as unknown as Record<string, unknown>
      const rawStatsEarly = d.heroStats
      let heroStatsEarly: HeroStatContent[] | null = null
      if (Array.isArray(rawStatsEarly) && rawStatsEarly.length > 0) {
        const mapped: HeroStatContent[] = []
        for (const s of rawStatsEarly) {
          if (!s || typeof s !== "object") continue
          if (typeof s.value !== "string" || typeof s.label !== "string") continue
          mapped.push({
            value: s.value,
            label: s.label,
            highlight: Boolean(s.highlight),
          })
        }
        if (mapped.length > 0) heroStatsEarly = mapped
      }
      return {
        heroSlides: null,
        heroStats: heroStatsEarly,
        servicesGallery: mapServicesGallery(d),
      }
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
        secondaryCtaLabel:
          typeof row.secondaryCtaLabel === "string" &&
          row.secondaryCtaLabel.trim().length > 0
            ? row.secondaryCtaLabel.trim()
            : undefined,
        secondaryCtaLink:
          typeof row.secondaryCtaLink === "string" &&
          row.secondaryCtaLink.trim().length > 0
            ? row.secondaryCtaLink.trim()
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
      servicesGallery: mapServicesGallery(doc as unknown as Record<string, unknown>),
    }
  } catch {
    return { heroSlides: null, heroStats: null, servicesGallery: null }
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
