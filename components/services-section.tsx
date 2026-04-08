"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { Mic, Utensils, Clapperboard, Video, Smile, Sparkles, Film, Camera, Check, X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react"

const programmingStyles = [
  { icon: Mic, label: "Interview Talk Show" },
  { icon: Video, label: "Daytime Talk Show" },
  { icon: Smile, label: "Panel Talk Show" },
  { icon: Sparkles, label: "Late-Night Show" },
  { icon: Camera, label: "Lifestyle Show" },
  { icon: Clapperboard, label: "DIY Creative" },
  { icon: Utensils, label: "Cooking Show" },
  { icon: Film, label: "Drama Series" },
]

const platformFeatures = [
  "Network-style layout that organizes your shows like a professional channel",
  "Custom video players designed for a polished viewing experience",
  "Structured programming layout that makes it easy for viewers to explore",
  "Scalable platform design that can grow with your channel",
]

const galleryImages = [
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202026-04-06%20123343-J2xAeqCTOar8kd1Xz2YrB7ug7RGVau.jpg",
    alt: "MSC Engine Settings - Data & Migration panel",
    label: "Data & Migration",
  },
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202026-04-06%20123304-ON0KD84GQUlobg82W0PMVslGQITyT6.jpg",
    alt: "MSC Engine Settings - Layout Tuning panel",
    label: "Layout Tuning",
  },
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202026-04-06%20123623-t7h1mvyerwRVftlwpNw4ckS8jxYQ2P.jpg",
    alt: "MSC Engine Settings - System Status panel",
    label: "System Status",
  },
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202026-04-06%20123829-09VrzbfSvmmjuLymabUUCZf94e6zov.jpg",
    alt: "MSC Tutorials panel",
    label: "Tutorials",
  },
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202026-04-06%20123438-eN1sVFcpuppRNXGOzJte053aWaR16N.jpg",
    alt: "MSC Layout Tuning - green toggles",
    label: "Layout Tuning (Alt)",
  },
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202026-04-06%20123858-RAT3hdKYuhO5bqiClVQ0BjZvtwHmzj.jpg",
    alt: "MSC Data & Migration - Export & Import tools",
    label: "Export & Import",
  },
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202026-04-06%20123929-DQ4uEII1pw6PLwjSlqxTGLOnj5nWH6.jpg",
    alt: "MSC System Operations accordion",
    label: "System Operations",
  },
]

export function ServicesSection() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const openLightbox = (index: number) => setLightboxIndex(index)
  const closeLightbox = () => setLightboxIndex(null)

  const prev = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i - 1 + galleryImages.length) % galleryImages.length))
  }, [])

  const next = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i + 1) % galleryImages.length))
  }, [])

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
      id="msc-services" 
      className="py-24 lg:py-32 relative bg-surface-0 msc-section msc-surface-0"
      data-divi-section="services"
      data-divi-modules="text,blurb,gallery,code"
    >
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
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

        {/* Programming Styles - Bento Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4 mb-20">
          {programmingStyles.map((style) => (
            <div
              key={style.label}
              className="bento-card group p-5 rounded-2xl border border-border/50 bg-card/30 hover:bg-card/50 hover:border-accent/30 transition-all duration-300 text-center"
            >
              <div className="h-12 w-12 rounded-xl bg-secondary/50 border border-border/50 flex items-center justify-center mx-auto mb-3 group-hover:bg-accent/10 group-hover:border-accent/20 transition-all duration-300">
                <style.icon className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
              </div>
              <span className="text-sm font-medium text-foreground">{style.label}</span>
            </div>
          ))}
        </div>

        {/* Platform Preview Section */}
        <div className="grid lg:grid-cols-12 gap-4 lg:gap-6">
          {/* Preview Visual with clickable gallery */}
          <div className="lg:col-span-7 bento-card rounded-3xl border border-border/50 overflow-hidden relative">
            <div className="aspect-[4/3] sm:aspect-video lg:aspect-auto lg:h-full bg-card relative p-3 sm:p-4 lg:p-5 flex flex-col gap-2 sm:gap-3">
              {/* Top row: large featured + 2 stacked small */}
              <div className="flex-1 grid grid-cols-3 gap-2 sm:gap-3 min-h-0">
                {/* Large featured - index 0 */}
                <button
                  onClick={() => openLightbox(0)}
                  className="col-span-2 rounded-xl overflow-hidden relative border border-border/30 group/thumb cursor-zoom-in"
                >
                  <Image
                    src={galleryImages[0].src}
                    alt={galleryImages[0].alt}
                    fill
                    className="object-cover object-top transition-transform duration-300 group-hover/thumb:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                    <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-300" />
                  </div>
                </button>
                {/* 2 stacked - index 1 & 2 */}
                <div className="flex flex-col gap-2 sm:gap-3">
                  {[1, 2].map((i) => (
                    <button
                      key={i}
                      onClick={() => openLightbox(i)}
                      className="flex-1 rounded-lg overflow-hidden relative border border-border/30 group/thumb cursor-zoom-in"
                    >
                      <Image
                        src={galleryImages[i].src}
                        alt={galleryImages[i].alt}
                        fill
                        className="object-cover object-top transition-transform duration-300 group-hover/thumb:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                        <ZoomIn className="h-5 w-5 text-white opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-300" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bottom row: 4 thumbnails - index 3-6 */}
              <div className="grid grid-cols-4 gap-2 sm:gap-3">
                {[3, 4, 5, 6].map((i) => (
                  <button
                    key={i}
                    onClick={() => openLightbox(i)}
                    className="h-[60px] sm:h-[90px] rounded-lg overflow-hidden relative border border-border/30 group/thumb cursor-zoom-in"
                  >
                    <Image
                      src={galleryImages[i].src}
                      alt={galleryImages[i].alt}
                      fill
                      className="object-cover object-top transition-transform duration-300 group-hover/thumb:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                      <ZoomIn className="h-4 w-4 text-white opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-300" />
                    </div>
                  </button>
                ))}
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
