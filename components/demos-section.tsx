"use client"

import { useState } from "react"
import Image from "next/image"
import { ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const demos = [
  {
    id: 0,
    title: "Talk Show Studio",
    category: "Interview Format",
    description: "Professional talk show layout with guest management, episode scheduling, and live audience interaction features.",
    image: "/images/demo-talkshow.jpg",
    features: ["Guest Profiles", "Episode Archive"],
  },
  {
    id: 1,
    title: "Culinary Channel",
    category: "Cooking Show",
    description: "Recipe-driven content platform with ingredient lists, step-by-step guides, and meal planning integration.",
    image: "/images/demo-cooking.jpg",
    features: ["Recipe Database", "Shopping Lists"],
  },
  {
    id: 2,
    title: "Audio Network",
    category: "Podcast Platform",
    description: "Audio-first streaming experience with playlist support, transcriptions, and subscriber management.",
    image: "/images/demo-podcast.jpg",
    features: ["Playlist Builder", "Transcripts"],
  },
  {
    id: 3,
    title: "Film Studio",
    category: "Documentary Series",
    description: "Cinematic storytelling platform with chapter navigation, behind-the-scenes content, and filmmaker profiles.",
    image: "/images/demo-documentary.jpg",
    features: ["Chapter Navigation", "BTS Content"],
  },
]

export function DemosSection() {
  const [activeDemo, setActiveDemo] = useState(0)
  const selectedDemo = demos[activeDemo]

  return (
    <section 
      id="msc-demos" 
      className="py-24 lg:py-32 relative bg-surface-2 msc-section msc-surface-2"
      data-divi-section="demos"
      data-divi-modules="gallery,image,text"
    >
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 pointer-events-auto">
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
            <a href="#msc-demos">
              View All Demos
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>

        {/* MOBILE: single-column stacked cards (hidden on lg+) */}
        <div className="flex flex-col gap-4 lg:hidden">
          {demos.map((demo, index) => (
            <button
              key={demo.id}
              type="button"
              onClick={() => setActiveDemo(index)}
              className={cn(
                "bento-card group rounded-2xl border overflow-hidden relative cursor-pointer transition-all duration-300 aspect-[5/4] w-full text-left p-0 appearance-none bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-2",
                activeDemo === index
                  ? "border-accent/50 ring-1 ring-accent/20"
                  : "border-border/50 hover:border-border"
              )}
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
              </div>

              {/* Content */}
              <div className="absolute inset-0 z-10 p-5 flex flex-col justify-between pointer-events-none">
                {/* Category */}
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-xs font-medium uppercase tracking-wider transition-colors",
                    activeDemo === index ? "text-accent" : "text-gray-300"
                  )}>
                    {demo.category}
                  </span>
                  {activeDemo === index && (
                    <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                  )}
                </div>

                {/* Title, Description, Features, CTA */}
                <div>
                  <h3 className={cn(
                    "text-xl font-bold transition-colors drop-shadow-md",
                    activeDemo === index ? "text-accent" : "text-white group-hover:text-accent"
                  )}>
                    {demo.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-200 line-clamp-2 drop-shadow-sm">
                    {demo.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {demo.features.map((feature) => (
                      <span
                        key={feature}
                        className="inline-flex text-xs font-medium px-2.5 py-1 rounded bg-black/40 text-white border border-white/30 backdrop-blur-sm"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                  <div className={cn(
                    "mt-3 inline-flex items-center gap-1 text-xs font-medium transition-all",
                    activeDemo === index
                      ? "text-accent opacity-100"
                      : "text-accent opacity-0 group-hover:opacity-100"
                  )}>
                    {activeDemo === index ? "Currently Viewing" : "View Demo"}
                    <ArrowUpRight className="h-3 w-3" />
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* DESKTOP: original 7+5 featured + sidebar selector (hidden below lg) */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-6 lg:items-stretch">

          {/* Large Featured Card - left 7 columns */}
          <div className="lg:col-span-7 bento-card group rounded-3xl border border-border/50 overflow-hidden relative">
            <div className="aspect-video lg:aspect-auto lg:absolute lg:inset-0 relative">
              {/* Crossfading images */}
              <div className="absolute inset-0 pointer-events-none">
                {demos.map((demo) => (
                  <div
                    key={demo.id}
                    className={cn(
                      "absolute inset-0 transition-opacity duration-500 pointer-events-none",
                      activeDemo === demo.id ? "opacity-100" : "opacity-0"
                    )}
                  >
                    <Image
                      src={demo.image}
                      alt={demo.title}
                      fill
                      className="object-cover select-none"
                      priority={demo.id === 0}
                      draggable={false}
                    />
                  </div>
                ))}
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 z-10 p-8 pointer-events-auto">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-medium uppercase tracking-wider text-accent">
                    {selectedDemo.category}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-border" />
                  <span className="text-xs text-gray-400">
                    Demo {activeDemo + 1} of {demos.length}
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-white">
                  {selectedDemo.title}
                </h3>
                <p className="mt-2 text-sm text-gray-200 leading-relaxed max-w-lg">
                  {selectedDemo.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedDemo.features.map((feature) => (
                    <span
                      key={feature}
                      className="inline-flex items-center rounded-lg bg-white/10 border border-white/20 backdrop-blur-sm px-3 py-1.5 text-sm font-medium text-white"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
                <div className="mt-5 flex items-center gap-4">
                  <Button
                    type="button"
                    className="bg-accent hover:bg-accent/90 text-accent-foreground glow-accent"
                    data-demo-link={selectedDemo.id}
                  >
                    View Live Demo
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Button>
                  <span className="text-sm text-gray-400">Use the list to switch demos</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Selector - right 5 columns */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            {demos.map((demo, index) => (
              <button
                key={demo.id}
                type="button"
                onClick={() => setActiveDemo(index)}
                className={cn(
                  "bento-card group rounded-2xl border overflow-hidden cursor-pointer transition-all duration-300 flex-1 w-full text-left p-0 appearance-none bg-card/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-2",
                  activeDemo === index
                    ? "border-accent/50 bg-accent/5 ring-1 ring-accent/20"
                    : "border-border/50 hover:border-border"
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
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/80" />
                    {activeDemo === index && (
                      <div className="absolute inset-0 bg-accent/10" />
                    )}
                  </div>

                  {/* Text */}
                  <div className="flex-1 p-4 bg-card/50 flex flex-col justify-center">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-[10px] font-medium uppercase tracking-wider transition-colors",
                        activeDemo === index ? "text-accent" : "text-muted-foreground"
                      )}>
                        {demo.category}
                      </span>
                      {activeDemo === index && (
                        <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                      )}
                    </div>
                    <h3 className={cn(
                      "mt-1.5 text-base font-semibold transition-colors",
                      activeDemo === index ? "text-accent" : "text-foreground group-hover:text-accent"
                    )}>
                      {demo.title}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {demo.description}
                    </p>
                    <div className={cn(
                      "mt-2 inline-flex items-center gap-1 text-xs font-medium transition-all",
                      activeDemo === index
                        ? "text-accent opacity-100"
                        : "text-accent opacity-0 group-hover:opacity-100"
                    )}>
                      {activeDemo === index ? "Currently Viewing" : "View Demo"}
                      <ArrowUpRight className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Progress dots - desktop only */}
        <div className="hidden lg:flex items-center justify-center gap-2 mt-8">
          {demos.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveDemo(index)}
              className={cn(
                "h-2.5 rounded-full transition-all duration-300 cursor-pointer",
                activeDemo === index
                  ? "w-8 bg-accent"
                  : "w-2.5 bg-border hover:bg-muted-foreground"
              )}
              aria-label={`View demo ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
