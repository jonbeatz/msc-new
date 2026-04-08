/** Shared shapes for marketing sections (safe to import from Client Components). */

export type HeroSlideContent = {
  image: string
  alt: string
  eyebrow: string
  headline: [string, string, string]
  sub: string
}

export type HeroStatContent = {
  value: string
  label: string
  highlight: boolean
}
