"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { DemoProject } from "@/lib/cms/projects"
import { cn, onHashAnchorClick } from "@/lib/utils"

/** Same-tab for hashes and internal paths; new tab only for off-site URLs. */
function demoLinkProps(url: string): { target?: string; rel?: string } {
  const u = url.trim()
  if (
    u.startsWith("http://") ||
    u.startsWith("https://") ||
    u.startsWith("//")
  ) {
    return { target: "_blank", rel: "noreferrer" }
  }
  return {}
}

type DemosSectionProps = {
  demos: DemoProject[]
}

export function DemosSection({ demos }: DemosSectionProps) {
  const [activeDemoId, setActiveDemoId] = useState<string>(demos[0]?.id ?? "")
  const activeDemo = useMemo(() => {
    return demos.find((demo) => demo.id === activeDemoId) ?? demos[0]
  }, [activeDemoId, demos])

  useEffect(() => {
    if (demos.length === 0) return
    if (!demos.some((d) => d.id === activeDemoId)) {
      setActiveDemoId(demos[0]!.id)
    }
  }, [demos, activeDemoId])

  const listDemos = demos
  const featuredDemo = activeDemo
  const hasScrollableRail = listDemos.length > 4
  if (!featuredDemo) return null

  return (
    <section
      className="py-24 lg:py-32 relative bg-surface-2 msc-section msc-surface-2"
      data-divi-section="demos"
      data-divi-modules="gallery,image,text"
    >
      {/* Use padding (not margin) for vertical rhythm so this section’s background fills the gap — margin would show `main`’s darker bg as a strip */}
      <div
        id="msc-demos"
        className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 pointer-events-auto"
      >
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 border border-accent/20 px-4 py-1.5 mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              <span className="text-xs font-medium uppercase tracking-wider text-accent">
                Our Work
              </span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              View Demos
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
              Take a look at some of the creator platforms and studio-style 
              websites we&apos;ve been building. More projects launching soon.
            </p>
          </div>
          <Button variant="outline" className="border-border/50 text-foreground hover:bg-secondary/50 w-fit glass" asChild>
            <a
              href="#msc-demos"
              onClick={(e) => onHashAnchorClick(e, "#msc-demos")}
            >
              View All Demos
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>

        {/* MOBILE: single-column stacked cards (hidden on lg+) */}
        <div className="flex flex-col gap-4 lg:hidden">
          {demos.map((demo, index) => (
            <article
              key={demo.id}
              className="bento-card group relative aspect-5/4 w-full overflow-hidden rounded-2xl border border-border/50 bg-transparent p-0 text-left transition-all duration-300"
            >
              {/* Image Background */}
              <div className="absolute inset-0 pointer-events-none">
                <Image
                  src={demo.image}
                  alt={demo.title}
                  fill
                  className="object-cover select-none"
                  draggable={false}
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/50 to-black/20" />
              </div>

              {/* Content */}
              <div className="absolute inset-0 z-10 p-5 flex flex-col justify-between pointer-events-none">
                {/* Category */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium uppercase tracking-wider text-gray-300">
                    {demo.category}
                  </span>
                  {index === 0 && (
                    <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                  )}
                </div>

                {/* Title, Description, CTA */}
                <div>
                  <h3 className="text-xl font-bold text-white transition-colors drop-shadow-md group-hover:text-accent">
                    {demo.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-200 line-clamp-2 drop-shadow-sm">
                    {demo.subtitle}
                  </p>
                  <div className="mt-3">
                    <a
                      href={demo.demoUrl}
                      {...demoLinkProps(demo.demoUrl)}
                      className="pointer-events-auto inline-flex items-center gap-1 text-xs font-semibold text-[#D4AF37] no-underline transition-opacity hover:opacity-90"
                    >
                      View Live Demo
                      <ArrowUpRight className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* DESKTOP: featured left + right-hand grid */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-6 lg:items-stretch">
          {/* Large Featured Card - left 7 columns */}
          <div className="lg:col-span-7 bento-card group rounded-3xl border border-border/50 overflow-hidden relative">
            <div className="aspect-video lg:aspect-auto lg:absolute lg:inset-0 relative">
              <div className="absolute inset-0 pointer-events-none">
                <Image
                  src={featuredDemo.image}
                  alt={featuredDemo.title}
                  fill
                  className="object-cover select-none"
                  priority
                  draggable={false}
                />
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 z-10 p-8 pointer-events-auto">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-medium uppercase tracking-wider text-accent">
                    {featuredDemo.category}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-border" />
                  <span className="text-xs text-gray-400">
                    Featured Project
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-white">
                  {featuredDemo.title}
                </h3>
                <p className="mt-2 text-sm text-gray-200 leading-relaxed max-w-lg">
                  {featuredDemo.subtitle}
                </p>
                <div className="mt-5 flex items-center gap-4">
                  <a
                    href={featuredDemo.demoUrl}
                    {...demoLinkProps(featuredDemo.demoUrl)}
                    className="inline-flex items-center rounded-xl border border-[#D4AF37]/55 bg-[#D4AF37]/14 px-4 py-2 text-sm font-semibold text-[#D4AF37] no-underline transition-all hover:bg-[#D4AF37]/20"
                  >
                    View Live Demo
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </a>
                  <span className="text-sm text-gray-400">
                    Choose a demo in the list to preview it here
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right-hand project list with scrollbar */}
          <div
            className={cn(
              "lg:col-span-5 flex flex-col gap-3 pr-3",
              hasScrollableRail
                ? "h-[560px] overflow-y-auto [scrollbar-color:#6F5A1B_rgba(0,0,0,0.45)] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#6F5A1B] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-black/45 [&::-webkit-scrollbar]:w-2"
                : "overflow-visible"
            )}
            style={{ scrollbarWidth: "thin" }}
          >
            {listDemos.map((demo) => (
              <div
                key={demo.id}
                role="button"
                tabIndex={0}
                aria-pressed={demo.id === featuredDemo.id}
                onClick={() => setActiveDemoId(demo.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    setActiveDemoId(demo.id)
                  }
                }}
                className={cn(
                  "bento-card group min-h-[112px] shrink-0 overflow-hidden rounded-2xl border bg-card/30 text-left transition-all duration-300 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  demo.id === featuredDemo.id
                    ? "border-accent/55 ring-1 ring-accent/30"
                    : "border-border/50 hover:border-accent/35"
                )}
              >
                <div className="flex h-full">
                  {/* Thumbnail */}
                  <div className="w-1/3 relative min-h-[100px] pointer-events-none">
                    <Image
                      src={demo.image}
                      alt={demo.title}
                      fill
                      className="object-cover select-none"
                      draggable={false}
                    />
                    <div className="absolute inset-0 bg-linear-to-r from-transparent to-card/80" />
                  </div>

                  {/* Text */}
                  <div className="flex-1 p-4 bg-card/50 flex flex-col justify-center">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        {demo.category}
                      </span>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                          demo.id === featuredDemo.id
                            ? "border border-accent/45 bg-accent/18 text-accent"
                            : "border border-[#D4AF37]/40 bg-[#D4AF37]/12 text-[#D4AF37]"
                        )}
                      >
                        {demo.id === featuredDemo.id ? "Featured" : "Visible"}
                      </span>
                    </div>
                    <h3 className={cn(
                      "mt-1.5 text-base font-semibold transition-colors group-hover:text-accent",
                      demo.id === featuredDemo.id ? "text-accent" : "text-foreground"
                    )}>
                      {demo.title}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {demo.subtitle}
                    </p>
                    <div className="mt-2">
                      <a
                        href={demo.demoUrl}
                        {...demoLinkProps(demo.demoUrl)}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#D4AF37] no-underline transition-opacity hover:opacity-90"
                      >
                        View Live Demo
                        <ArrowUpRight className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
