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
