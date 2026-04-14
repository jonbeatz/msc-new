/**
 * Default Homepage gallery rows: filenames under `public/media` (after `npm run media:sync`).
 * Used by `globals/Homepage.ts` (default labels + afterRead hydration) and
 * `components/services-section.tsx` (static fallbacks when a slot is empty / null).
 */
export const HOMEPAGE_PROGRAMMING_STYLES_SEED = [
  {
    filename: "demo-talkshow.jpg",
    label: "Talk Show",
    alt: "Talk show programming style",
  },
  {
    filename: "demo-podcast.jpg",
    label: "Podcast",
    alt: "Podcast programming style",
  },
  {
    filename: "demo-cooking.jpg",
    label: "Cooking",
    alt: "Cooking show programming style",
  },
  {
    filename: "demo-documentary.jpg",
    label: "Documentary",
    alt: "Documentary programming style",
  },
  {
    filename: "show-artwork.jpg",
    label: "Network Style",
    alt: "Network-style programming grid",
  },
  {
    filename: "on-air-bg.jpg",
    label: "Live & Studio",
    alt: "Live studio programming",
  },
  {
    filename: "camera-crew.jpg",
    label: "Production",
    alt: "Production programming",
  },
] as const

/** Channel preview bento — same order as `SERVICES_GALLERY_FALLBACK` / layout indices 0–6. */
export const HOMEPAGE_SERVICES_GALLERY_SEED = [
  {
    filename: "Screenshot 2026-04-06 123304.jpg",
    label: "Workspace",
    alt: "MSC Engine — main workspace view",
  },
  {
    filename: "Screenshot 2026-04-06 123343.jpg",
    label: "Data & migration",
    alt: "MSC Engine — Data and migration",
  },
  {
    filename: "Screenshot 2026-04-06 123438.jpg",
    label: "Layout",
    alt: "MSC Engine — layout options",
  },
  {
    filename: "Screenshot 2026-04-06 123623.jpg",
    label: "System status",
    alt: "MSC Engine — system status",
  },
  {
    filename: "Screenshot 2026-04-06 123829.jpg",
    label: "Tutorials",
    alt: "MSC Engine — tutorials",
  },
  {
    filename: "Screenshot 2026-04-06 123858.jpg",
    label: "Tools",
    alt: "MSC Engine — tools and export",
  },
  {
    filename: "Screenshot 2026-04-06 123929.jpg",
    label: "Operations",
    alt: "MSC Engine — operations",
  },
] as const
