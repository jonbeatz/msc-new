/** Shared shapes for marketing sections (safe to import from Client Components). */

export type HeroSlideContent = {
  image: string
  alt: string
  isActive: boolean
  eyebrow: string
  headline: [string, string, string]
  sub: string
  ctaLink?: string
  /** Outline CTA (play icon row); defaults to View Demos → #msc-demos */
  secondaryCtaLabel?: string
  secondaryCtaLink?: string
  seo?: {
    title?: string
    description?: string
    image?: string
  }
}

export type HeroStatContent = {
  value: string
  label: string
  highlight: boolean
}

/**
 * Image + label tile used for:
 * - Site → Homepage → Programming styles (7)
 * - Site → Homepage → Channel preview gallery (7 in bento layout)
 */
export type ServicesGalleryItem = {
  src: string
  alt: string
  /** Lightbox / UI caption; Media supplies alt for accessibility. */
  label: string
}

/** One Homepage gallery row: CMS image or empty slot (frontend uses fallback for that index). */
export type ServicesGallerySlot = ServicesGalleryItem | null
