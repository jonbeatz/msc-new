"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Image from "next/image"
import { Check, X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react"
import type { ServicesGalleryItem, ServicesGallerySlot } from "@/lib/cms/content-types"
import {
  HOMEPAGE_PROGRAMMING_STYLES_SEED,
  HOMEPAGE_SERVICES_GALLERY_SEED,
} from "@/lib/cms/homepage-gallery-seed"

/** Root-relative URL for files in `public/media` (handles spaces in filenames). */
function mediaPublicSrc(filename: string): string {
  return `/media/${encodeURIComponent(filename)}`
}

const PROGRAMMING_STYLE_COUNT = 7

/** Fallback when a programming-style slot is null / empty — matches `HOMEPAGE_PROGRAMMING_STYLES_SEED`. */
const PROGRAMMING_STYLES_FALLBACK: ServicesGalleryItem[] =
  HOMEPAGE_PROGRAMMING_STYLES_SEED.map(({ filename, label, alt }) => ({
    src: mediaPublicSrc(filename),
    alt,
    label,
  }))

/** Per-index hybrid: empty CMS slot → static fallback for that tile (7 slots). */
function mergeProgrammingStyles(
  cms: ServicesGallerySlot[] | null | undefined,
): ServicesGalleryItem[] {
  if (!cms || cms.length === 0) {
    return PROGRAMMING_STYLES_FALLBACK
  }
  return Array.from({ length: PROGRAMMING_STYLE_COUNT }, (_, i) => {
    const row = cms[i]
    return row ?? PROGRAMMING_STYLES_FALLBACK[i]!
  })
}

const platformFeatures = [
  "Network-style layout that organizes your shows like a professional channel",
  "Custom video players designed for a polished viewing experience",
  "Structured programming layout that makes it easy for viewers to explore",
  "Scalable platform design that can grow with your channel",
]

/**
 * Fallback when Site → Homepage → Services gallery has no rows yet (or partial list).
 * Matches synced Media files under `public/media` — prefer configuring the Homepage global in Payload.
 * Order: [0] = large featured, [1–2] = stacked smalls, [3–6] = bottom row (see grid layout below).
 */
const SERVICES_GALLERY_COUNT = 7

/** Fallback when a channel-preview slot is null / empty — matches `HOMEPAGE_SERVICES_GALLERY_SEED`. */
const SERVICES_GALLERY_FALLBACK: ServicesGalleryItem[] =
  HOMEPAGE_SERVICES_GALLERY_SEED.map(({ filename, label, alt }) => ({
    src: mediaPublicSrc(filename),
    alt,
    label,
  }))

/** Build absolute URL for static fallbacks using the same origin as {@link getPublicOrigin} on the server. */
function servicesGalleryAbsoluteSrc(path: string, origin: string): string {
  if (/^https?:\/\//i.test(path)) return path
  const base = origin.replace(/\/+$/, "")
  const p = path.startsWith("/") ? path : `/${path}`
  return `${base}${p}`
}

/**
 * Per-index hybrid: empty CMS slot → static fallback for that bento cell (7 slots).
 * CMS `src` values are already absolute from the server (`resolvePublicUrl` / getPublicOrigin).
 */
function mergeServicesGalleryHybrid(
  cms: ServicesGallerySlot[] | null | undefined,
  origin: string,
): ServicesGalleryItem[] {
  const fallbackAbs = SERVICES_GALLERY_FALLBACK.map((item) => ({
    ...item,
    src: servicesGalleryAbsoluteSrc(item.src, origin),
  }))
  if (!cms || cms.length === 0) {
    return fallbackAbs
  }
  return Array.from({ length: SERVICES_GALLERY_COUNT }, (_, i) => {
    const row = cms[i]
    return row ?? fallbackAbs[i]!
  })
}

type ServicesSectionProps = {
  /** Site → Homepage → Show Programming Styles block (header + 7 tiles). Default true. */
  programmingStylesVisible?: boolean
  /** Site → Homepage → Programming styles (7 slots; null entry = fallback for that index). */
  cmsProgrammingStyles?: ServicesGallerySlot[] | null
  /** Site → Homepage → Channel preview bento (7 slots; null entry = fallback for that index). */
  cmsGallery?: ServicesGallerySlot[] | null
  /** From server `getPublicOrigin()` — absolutizes fallback `/media/*` paths for Next/Image. */
  servicesGalleryPublicOrigin: string
}

export function ServicesSection({
  programmingStylesVisible = true,
  cmsProgrammingStyles,
  cmsGallery,
  servicesGalleryPublicOrigin,
}: ServicesSectionProps) {
  const programmingTiles = useMemo(
    () => mergeProgrammingStyles(cmsProgrammingStyles),
    [cmsProgrammingStyles],
  )

  const galleryImages = useMemo(
    () =>
      mergeServicesGalleryHybrid(cmsGallery, servicesGalleryPublicOrigin),
    [cmsGallery, servicesGalleryPublicOrigin],
  )

  const bento = useMemo(
    () => galleryImages.slice(0, SERVICES_GALLERY_COUNT),
    [galleryImages],
  )

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const openLightbox = (index: number) => setLightboxIndex(index)
  const closeLightbox = () => setLightboxIndex(null)

  const prev = useCallback(() => {
    setLightboxIndex((i) =>
      i === null ? null : (i - 1 + galleryImages.length) % galleryImages.length,
    )
  }, [galleryImages.length])

  const next = useCallback(() => {
    setLightboxIndex((i) =>
      i === null ? null : (i + 1) % galleryImages.length,
    )
  }, [galleryImages.length])

  useEffect(() => {
    if (lightboxIndex === null) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox()
      if (e.key === "ArrowLeft") prev()
      if (e.key === "ArrowRight") next()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [lightboxIndex, prev, next])

  return (
    <section 
      className="py-24 lg:py-32 relative bg-surface-0 msc-section msc-surface-0"
      data-divi-section="services"
      data-divi-modules="text,blurb,gallery,code"
    >
      <div id="msc-services" className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header — Programming Styles (always visible) */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 border border-accent/20 px-4 py-1.5 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="text-xs font-medium uppercase tracking-wider text-accent">
              Designed for Every Genre
            </span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Programming Styles We Support
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Whether you&apos;re launching a talk show, cooking show, podcast, or full series,
            your channel can be organized and presented like a professional network.
          </p>
        </div>

        {/* Programming Styles — 7 image tiles; hidden when isStylesVisible is unchecked in admin */}
        {programmingStylesVisible && (
          <div
            className="mb-20 -mx-6 px-6 md:mx-0 md:px-0"
            aria-label="Programming styles we support"
          >
            <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 [-webkit-overflow-scrolling:touch] scrollbar-thin md:grid md:grid-cols-2 md:gap-3 md:overflow-visible md:snap-none md:pb-0 lg:grid-cols-4 xl:grid-cols-7 xl:gap-4">
              {programmingTiles.map((tile, index) => (
                <div
                  key={`${tile.src}-${index}`}
                  className="flex w-[min(82vw,18rem)] shrink-0 snap-center flex-col overflow-hidden rounded-2xl border border-border/50 bg-card/30 md:w-auto"
                >
                  <div className="relative aspect-[4/3] w-full">
                    <Image
                      src={tile.src}
                      alt={tile.alt}
                      fill
                      sizes="(max-width: 768px) 82vw, (max-width: 1024px) 25vw, 12vw"
                      className="object-cover object-center"
                    />
                  </div>
                  <div className="border-t border-border/40 bg-black/20 px-2 py-2.5 text-center backdrop-blur-sm">
                    <span className="text-xs font-medium leading-tight text-foreground sm:text-sm">
                      {tile.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Platform Preview Section */}
        <div className="grid lg:grid-cols-12 gap-4 lg:gap-6">
          {/* Preview Visual with clickable gallery */}
          <div className="lg:col-span-7 bento-card rounded-3xl border border-border/50 overflow-hidden relative">
            <div className="aspect-[4/3] sm:aspect-video lg:aspect-auto lg:h-full bg-card relative p-3 sm:p-4 lg:p-5 flex flex-col gap-2 sm:gap-3">
              {/* Top row: large featured + 2 stacked small */}
              <div className="flex-1 grid grid-cols-3 gap-2 sm:gap-3 min-h-0">
                <button
                  type="button"
                  onClick={() => openLightbox(0)}
                  className="col-span-2 rounded-xl overflow-hidden relative border border-border/30 group/thumb cursor-zoom-in"
                >
                  <Image
                    src={bento[0]!.src}
                    alt={bento[0]!.alt}
                    fill
                    className="object-cover object-top transition-transform duration-300 group-hover/thumb:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                    <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-300" />
                  </div>
                </button>
                <div className="flex flex-col gap-2 sm:gap-3">
                  {bento.slice(1, 3).map((tile, j) => {
                    const i = j + 1
                    return (
                      <button
                        type="button"
                        key={`${tile.src}-${i}`}
                        onClick={() => openLightbox(i)}
                        className="flex-1 rounded-lg overflow-hidden relative border border-border/30 group/thumb cursor-zoom-in"
                      >
                        <Image
                          src={tile.src}
                          alt={tile.alt}
                          fill
                          className="object-cover object-top transition-transform duration-300 group-hover/thumb:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                          <ZoomIn className="h-5 w-5 text-white opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-300" />
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 sm:gap-3">
                {bento.slice(3, 7).map((tile, j) => {
                  const i = j + 3
                  return (
                    <button
                      type="button"
                      key={`${tile.src}-${i}`}
                      onClick={() => openLightbox(i)}
                      className="h-[60px] sm:h-[90px] rounded-lg overflow-hidden relative border border-border/30 group/thumb cursor-zoom-in"
                    >
                      <Image
                        src={tile.src}
                        alt={tile.alt}
                        fill
                        className="object-cover object-top transition-transform duration-300 group-hover/thumb:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                        <ZoomIn className="h-4 w-4 text-white opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-300" />
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-5 bento-card glass-card rounded-3xl p-8 border border-border/50">
            <h3 className="text-2xl font-bold text-foreground sm:text-3xl leading-tight">
              See What Your Channel Could Look Like
            </h3>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Your platform can be organized like a professional streaming network
              with structured shows, episodes, and categories. Everything is designed
              to help your content feel intentional, organized, and ready for a
              professional audience from day one.
            </p>
            <ul className="mt-8 space-y-4">
              {platformFeatures.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-accent" />
                  </div>
                  <span className="text-sm text-muted-foreground leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={closeLightbox}
        >
          {/* Close */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Prev */}
          <button
            onClick={(e) => { e.stopPropagation(); prev() }}
            className="absolute left-4 h-10 w-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Image */}
          <div
            className="relative w-full max-w-5xl max-h-[85vh] mx-16"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full" style={{ paddingBottom: "62.5%" }}>
              <Image
                src={galleryImages[lightboxIndex].src}
                alt={galleryImages[lightboxIndex].alt}
                fill
                className="object-contain rounded-xl"
                priority
              />
            </div>
            {/* Caption */}
            <div className="mt-3 text-center">
              <p className="text-sm text-white/70">{galleryImages[lightboxIndex].label}</p>
              <p className="text-xs text-white/40 mt-1">{lightboxIndex + 1} / {galleryImages.length}</p>
            </div>
          </div>

          {/* Next */}
          <button
            onClick={(e) => { e.stopPropagation(); next() }}
            className="absolute right-4 h-10 w-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
            aria-label="Next image"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {galleryImages.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setLightboxIndex(i) }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === lightboxIndex ? "w-6 bg-accent" : "w-1.5 bg-white/30 hover:bg-white/50"
                }`}
                aria-label={`View image ${i + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
