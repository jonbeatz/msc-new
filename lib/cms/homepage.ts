import { getPayload } from "payload"
import type { Payload } from "payload"
import config from "@payload-config"

import { toRelativePublicMediaUrl } from "@/lib/media-url"
import { resolvePublicUrl } from "@/lib/public-origin"

import type { HeroSlideContent, HeroStatContent, ServicesGallerySlot } from "./content-types"

export type {
  HeroSlideContent,
  HeroStatContent,
  ServicesGalleryItem,
  ServicesGallerySlot,
} from "./content-types"

const HOMEPAGE_GALLERY_SLOT_COUNT = 7

function readIsStylesVisible(
  doc: Record<string, unknown> | null | undefined,
): boolean {
  if (!doc) return true
  return doc.isStylesVisible !== false
}

export type HomepageActiveSlideSeo = {
  title: string | null
  description: string | null
  image: string | null
}

/** Align with Media `afterRead`: always same-origin paths (e.g. `/media/...`). */
function normalizeMediaSrc(pathOrUrl: string): string {
  return toRelativePublicMediaUrl(pathOrUrl)
}

/**
 * Hero slide `image` may be a populated Media doc, a plain id, or `{ id }` when depth is low.
 * Resolves to a usable `url` so the public hero never receives a bare number/string.
 */
async function resolveMediaDocUrl(
  payload: Payload,
  raw: unknown,
): Promise<{ url: string; alt?: string } | null> {
  if (raw === null || raw === undefined) return null
  if (typeof raw === "object" && raw !== null && "url" in raw) {
    const u = (raw as { url?: unknown }).url
    if (typeof u === "string" && u.length > 0) {
      const alt = (raw as { alt?: unknown }).alt
      return {
        url: u,
        alt: typeof alt === "string" ? alt : undefined,
      }
    }
  }
  let id: string | null = null
  if (typeof raw === "string" || typeof raw === "number") id = String(raw)
  else if (typeof raw === "object" && raw !== null && "id" in raw) {
    const i = (raw as { id: unknown }).id
    if (typeof i === "string" || typeof i === "number") id = String(i)
  }
  if (!id) return null
  try {
    const doc = await payload.findByID({
      collection: "media",
      id,
      depth: 0,
    })
    if (doc && typeof doc === "object" && "url" in doc) {
      const url = (doc as { url?: unknown }).url
      if (typeof url === "string" && url.length > 0) {
        const alt = (doc as { alt?: unknown }).alt
        return {
          url,
          alt: typeof alt === "string" ? alt : undefined,
        }
      }
    }
  } catch {
    /* missing or invalid media id */
  }
  return null
}

/**
 * Maps Homepage `programmingStyles` / `servicesGallery` to **7 fixed indices** so an empty row
 * lines up with the matching hardcoded fallback tile on the frontend.
 */
function mapMediaLabelGallerySlots(
  doc: Record<string, unknown> | null | undefined,
  key: "programmingStyles" | "servicesGallery",
  defaultLabel: string,
): ServicesGallerySlot[] | null {
  if (!doc) return null
  const raw = doc[key]
  if (!Array.isArray(raw) || raw.length === 0) return null
  const slots: ServicesGallerySlot[] = []
  for (let i = 0; i < HOMEPAGE_GALLERY_SLOT_COUNT; i++) {
    const row = raw[i]
    if (!row || typeof row !== "object") {
      slots.push(null)
      continue
    }
    const img = (row as { image?: unknown }).image
    if (
      img === null ||
      img === undefined ||
      typeof img === "number" ||
      typeof img === "string"
    ) {
      slots.push(null)
      continue
    }
    if (typeof img !== "object" || !("url" in img)) {
      slots.push(null)
      continue
    }
    const media = img as unknown as { url?: string; alt?: string }
    const url = media.url
    if (!url || typeof url !== "string") {
      slots.push(null)
      continue
    }
    const alt =
      typeof media.alt === "string" ? media.alt : "Gallery image"
    const labelRaw = (row as { label?: string }).label
    const label =
      typeof labelRaw === "string" && labelRaw.trim().length > 0
        ? labelRaw.trim()
        : defaultLabel
    const rel = normalizeMediaSrc(url)
    const src =
      key === "servicesGallery" ? resolvePublicUrl(rel) : rel
    slots.push({ src, alt, label })
  }
  return slots
}

export async function getHomepageCmsData(): Promise<{
  heroSlides: HeroSlideContent[] | null
  heroStats: HeroStatContent[] | null
  /** When false, the public site hides the Programming Styles header + 7 tiles (see `ServicesSection`). */
  isStylesVisible: boolean
  programmingStyles: ServicesGallerySlot[] | null
  servicesGallery: ServicesGallerySlot[] | null
}> {
  try {
    const payload = await getPayload({ config })
    /** Populate hero slide Media + nested `seo.image` (use 1 only if you add manual ID resolution everywhere). */
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
        isStylesVisible: readIsStylesVisible(d),
        programmingStyles: mapMediaLabelGallerySlots(
          d,
          "programmingStyles",
          "Programming style",
        ),
        servicesGallery: mapMediaLabelGallerySlots(
          d,
          "servicesGallery",
          "Preview",
        ),
      }
    }

    const heroSlides: HeroSlideContent[] = []
    for (const row of rawSlides) {
      if (!row || typeof row !== "object") continue
      const resolvedImg = await resolveMediaDocUrl(payload, row.image)
      if (!resolvedImg) continue
      const url = resolvedImg.url
      const alt = resolvedImg.alt?.trim() ? resolvedImg.alt.trim() : "Hero image"
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
        const seoResolved = await resolveMediaDocUrl(
          payload,
          (row.seo as { image?: unknown }).image,
        )
        if (seoResolved?.url) {
          seoImage = normalizeMediaSrc(seoResolved.url)
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

    const d = doc as unknown as Record<string, unknown>
    return {
      heroSlides: heroSlides.length > 0 ? heroSlides : null,
      heroStats,
      isStylesVisible: readIsStylesVisible(d),
      programmingStyles: mapMediaLabelGallerySlots(
        d,
        "programmingStyles",
        "Programming style",
      ),
      servicesGallery: mapMediaLabelGallerySlots(
        d,
        "servicesGallery",
        "Preview",
      ),
    }
  } catch {
    return {
      heroSlides: null,
      heroStats: null,
      isStylesVisible: true,
      programmingStyles: null,
      servicesGallery: null,
    }
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

    const seoResolved = await resolveMediaDocUrl(payload, seo.image)
    const slideResolved = await resolveMediaDocUrl(payload, activeSlide.image)
    let image: string | null = null
    if (seoResolved?.url) image = normalizeMediaSrc(seoResolved.url)
    else if (slideResolved?.url) image = normalizeMediaSrc(slideResolved.url)

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
