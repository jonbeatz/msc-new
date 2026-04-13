"use client"

import Image from "next/image"
import { MessageSquare, Layout, Puzzle } from "lucide-react"

const benefits = [
  {
    icon: MessageSquare,
    title: "Consulting & Revisions",
    description: "Guided consulting calls and included revisions to ensure your site is built correctly, efficiently, and ready for launch.",
  },
  {
    icon: Layout,
    title: "Studio-Style Website Layout",
    description: "A professionally designed homepage and show pages that present your content with a clean, network-inspired structure.",
  },
  {
    icon: Puzzle,
    title: "Custom Plugin & Media Setup",
    description: "Includes installation and setup of our proprietary Studio Channel plugin, developed in house to support studio style layouts, content presentation, and professional video and audio embedding.",
  },
]

export function WhatYouGetSection() {
  return (
    <section 
      className="py-24 lg:py-32 relative overflow-hidden msc-section"
      data-divi-section="what-you-get"
      data-divi-modules="text,blurb"
      data-divi-background="msc-background.jpg"
    >
      {/* Darkened Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/media/msc-background.jpg"
          alt="Background"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-background/85" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      </div>
      
      <div id="msc-benefits" className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 border border-accent/20 px-4 py-1.5 mb-6 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="text-xs font-medium uppercase tracking-wider text-accent">
              Deliverables
            </span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            What You Get with My Studio Channel
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Launch your own professional media website with everything you need 
            to look like a network.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-3 gap-4 lg:gap-6">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.title}
              className={`bento-card rounded-2xl border border-border/50 p-6 lg:p-8 ${
                index === 1 ? "glass-card" : "bg-card/50 backdrop-blur-sm"
              }`}
            >
              <div className="h-14 w-14 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-6">
                <benefit.icon className="h-7 w-7 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {benefit.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
