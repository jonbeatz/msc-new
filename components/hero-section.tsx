"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import Image from "next/image"
import { ArrowRight, Play, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn, onHashAnchorClick } from "@/lib/utils"
import type { HeroSlideContent, HeroStatContent } from "@/lib/cms/content-types"
import { useContactModal } from "@/components/contact-modal-context"

/** Primary CTA opens the contact modal when the slide targets `#msc-contact` (or default empty). */
function heroPrimaryOpensContactModal(href: string): boolean {
  const t = href.trim()
  if (!t) return true
  if (/^mailto:/i.test(t)) return false
  if (/^https?:\/\//i.test(t)) return false
  const hashIdx = t.indexOf("#")
  const frag = hashIdx >= 0 ? t.slice(hashIdx) : t.startsWith("#") ? t : ""
  return frag === "#msc-contact"
}

/** Fallback slides use files that exist under `public/media/` (repo may not ship legacy names like tv-wall.jpg). */
const defaultSlides: HeroSlideContent[] = [
  {
    image: "/media/msc-background.jpg",
    alt: "My Studio Channel cinematic studio background",
    isActive: true,
    eyebrow: "For Creators Who Want More",
    headline: ["Your Content.", "Your Channel.", "Your Studio."],
    sub: "We build studio-style websites that give creators the look and structure of a major network — powered by a custom plugin, built once and owned by you.",
  },
  {
    image: "/media/creator-in-mind.jpg",
    alt: "Creator operating professional cinema camera in studio",
    isActive: true,
    eyebrow: "Look Like a Real Network",
    headline: ["Your Shows.", "Your Brand.", "Your Network."],
    sub: "Your platform can be organized like a professional streaming network — with structured shows, episodes, and categories that rival any major broadcaster.",
  },
  {
    image: "/media/Demos-4-preview.jpg",
    alt: "Netflix-style show cards and streaming network grid",
    isActive: true,
    eyebrow: "Podcasters & Talk Show Hosts",
    headline: ["Your Voice.", "Your Platform.", "Your Audience."],
    sub: "Launch your podcast or talk show with a professional-grade platform that rivals any major network — without monthly platform fees or subscriber charges.",
  },
  {
    image: "/media/camera-crew.jpg",
    alt: "Professional film crew with cinema camera on set",
    isActive: true,
    eyebrow: "Built for Every Creator",
    headline: ["Your Vision.", "Your Platform.", "Your Legacy."],
    sub: "Showcase your productions on a cinema-quality platform built to present your work exactly the way you intend it to be experienced.",
  },
]

const defaultStats: HeroStatContent[] = [
  { value: "20+", label: "Years Experience", highlight: false },
  { value: "100%", label: "Platform Ownership", highlight: true },
  { value: "24/7", label: "Creator Support", highlight: false },
  { value: "$0", label: "Monthly Platform Fees", highlight: false },
]

type HeroSectionProps = {
  cmsSlides?: HeroSlideContent[] | null
  cmsStats?: HeroStatContent[] | null
  /** Match Site settings sticky header (affects hero height math). */
  stickyHeaderEnabled?: boolean
}

export function HeroSection({
  cmsSlides,
  cmsStats,
  stickyHeaderEnabled = true,
}: HeroSectionProps) {
  const slides = useMemo(() => {
    if (!cmsSlides || cmsSlides.length === 0) return defaultSlides
    const active = cmsSlides.filter((s) => s.isActive)
    if (active.length === 0) return defaultSlides
    return active
  }, [cmsSlides])
  const stats = useMemo(
    () =>
      cmsStats && cmsStats.length > 0 ? cmsStats : defaultStats,
    [cmsStats],
  )

  const { openContactModal } = useContactModal()
  const [current, setCurrent] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    setCurrent((c) =>
      slides.length === 0 ? 0 : Math.min(c, slides.length - 1),
    )
  }, [slides.length])

  const goTo = useCallback((index: number) => {
    setIsTransitioning(true)
    setCurrent(index)
    window.setTimeout(() => setIsTransitioning(false), 350)
  }, [])

  const prev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length)
  }, [current, goTo, slides.length])

  const next = useCallback(() => {
    goTo((current + 1) % slides.length)
  }, [current, goTo, slides.length])

  if (slides.length === 0) {
    return null
  }

  const slide = slides[current]
  const primaryCtaHref = slide.ctaLink?.trim() || "#msc-contact"
  const primaryUsesContactModal = heroPrimaryOpensContactModal(primaryCtaHref)
  const secondaryCtaHref =
    slide.secondaryCtaLink?.trim() || "#msc-demos"

  return (
    <section
      id="msc-hero"
      className={cn(
        "relative flex items-center justify-center overflow-hidden msc-section",
        stickyHeaderEnabled
          ? "min-h-[calc(100dvh-5rem)]"
          : "min-h-screen",
      )}
      data-divi-section="hero"
      data-divi-module="fullwidth-header"
    >
      {/* Slides - never capture clicks (opacity-0 layers still hit-test by default) */}
      {slides.map((s, i) => (
        <div
          key={i}
          className={cn(
            "absolute inset-0 z-0 pointer-events-none transition-opacity duration-700",
            i === current ? "opacity-100" : "opacity-0"
          )}
          aria-hidden={i !== current}
        >
          <Image
            src={s.image}
            alt={s.alt}
            fill
            className="object-cover pointer-events-none select-none"
            priority={i === 0}
            draggable={false}
          />
        </div>
      ))}

      {/* Overlays */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/75 via-black/80 to-black pointer-events-none" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-r from-black/70 via-black/30 to-transparent pointer-events-none" />

      <div
        className="absolute inset-0 z-[1] opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full px-6 lg:px-16 pt-6 sm:pt-10 pb-24">
        <div
          className={cn(
            "max-w-3xl mx-auto text-center transition-all duration-500",
            isTransitioning ? "opacity-0 translate-y-3" : "opacity-100 translate-y-0"
          )}
        >
          <div className="mb-6 inline-flex items-center gap-3 rounded-full px-5 py-2.5 border border-white/10 bg-white/5 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-accent" />
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {slide.eyebrow}
            </span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.07]">
            <span className="block">{slide.headline[0]}</span>
            <span className="block mt-1">{slide.headline[1]}</span>
            <span className="block mt-1" style={{ color: "#F5B841" }}>{slide.headline[2]}</span>
          </h1>

          <p className="mt-6 max-w-2xl mx-auto text-base leading-relaxed text-muted-foreground sm:text-lg">
            {slide.sub}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {primaryUsesContactModal ? (
              <Button
                type="button"
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90 h-14 px-8 text-base font-semibold glow-accent-sm hover:glow-accent transition-all duration-300"
                // ORIGINAL CODE (commented out for temporary redirect):
                // onClick={() => openContactModal()}
                // TEMPORARY REDIRECT - Remove when restoring original behavior:
                onClick={() => window.open('https://docs.google.com/forms/d/e/1FAIpQLSe1xo__uQrR6_T0VNmbP8julRgHRZGHsaoW8xqFbJYVtWV1dQ/viewform', '_blank', 'noopener,noreferrer')}
              >
                Start With a Consultation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            ) : (
              <Button
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90 h-14 px-8 text-base font-semibold glow-accent-sm hover:glow-accent transition-all duration-300"
                asChild
              >
                <a
                  href={primaryCtaHref}
                  onClick={(e) => onHashAnchorClick(e, primaryCtaHref)}
                >
                  Start With a Consultation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
            )}
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 text-foreground hover:bg-white/10 h-14 px-8 text-base font-medium backdrop-blur-sm"
              asChild
            >
              <a
                href={secondaryCtaHref}
                onClick={(e) => onHashAnchorClick(e, secondaryCtaHref)}
              >
                <Play className="mr-2 h-5 w-5 fill-current" />
                {slide.secondaryCtaLabel?.trim() || "View Demos"}
              </a>
            </Button>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-center gap-3 relative z-20">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={cn(
                "rounded-full transition-all duration-500",
                i === current
                  ? "w-8 h-2 bg-accent"
                  : "w-2 h-2 bg-white/30 hover:bg-white/60"
              )}
            />
          ))}
          <span className="ml-2 text-xs text-muted-foreground font-medium tabular-nums">
            {String(current + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
          </span>
        </div>

        <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={cn(
                "rounded-2xl border border-white/10 p-5 text-center backdrop-blur-sm",
                stat.highlight ? "bg-accent/10 border-accent/30" : "bg-white/5"
              )}
            >
              <div
                className="text-2xl font-bold sm:text-3xl"
                style={stat.highlight ? { color: "#F5B841" } : { color: "#fff" }}
              >
                {stat.value}
              </div>
              <div className="mt-1.5 text-xs text-muted-foreground leading-snug">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Arrows: standalone controls, above header (z-50) so nothing stacks on top */}
      <button
        type="button"
        onClick={prev}
        className="absolute left-2 sm:left-4 lg:left-8 top-1/2 z-[60] -translate-y-1/2 h-10 w-10 sm:h-12 sm:w-12 rounded-full border border-white/20 bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-accent hover:border-accent hover:text-accent-foreground transition-all duration-300"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 pointer-events-none" />
      </button>
      <button
        type="button"
        onClick={next}
        className="absolute right-2 sm:right-4 lg:right-8 top-1/2 z-[60] -translate-y-1/2 h-10 w-10 sm:h-12 sm:w-12 rounded-full border border-white/20 bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-accent hover:border-accent hover:text-accent-foreground transition-all duration-300"
        aria-label="Next slide"
      >
        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 pointer-events-none" />
      </button>

      <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
        <span className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-medium">Scroll</span>
        <div className="h-8 w-[1px] bg-gradient-to-b from-accent/50 to-transparent" />
      </div>
    </section>
  )
}
