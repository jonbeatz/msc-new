"use client"

import Image from "next/image"
import { Users, Tv, BookOpen, Headphones, ArrowUpRight } from "lucide-react"
import { onHashAnchorClick } from "@/lib/utils"

const features = [
  {
    icon: Tv,
    title: "Network-Style Layouts",
    description: "Present your content like a professional streaming network with structured shows and episodes.",
  },
  {
    icon: Users,
    title: "Creator Community",
    description: "Access our exclusive creator community for continued learning and support as your channel grows.",
  },
  {
    icon: BookOpen,
    title: "Built-In Tutorials",
    description: "Custom plugin with step-by-step tutorials so you never feel left figuring things out alone.",
  },
  {
    icon: Headphones,
    title: "Ongoing Support",
    description: "Direct communication with the team building your site, plus guided walkthrough after launch.",
  },
]

export function AboutSection() {
  return (
    <section 
      className="py-24 lg:py-32 relative bg-surface-1 msc-section msc-surface-1"
      data-divi-section="about"
      data-divi-modules="text,blurb,image"
    >
      <div id="msc-about" className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* What We Do - Main Content */}
        <div className="grid lg:grid-cols-12 gap-4 lg:gap-6 mb-20">
          {/* Main Content Card - spans 7 columns */}
          <div className="lg:col-span-7 bento-card glass-card rounded-3xl p-8 lg:p-10 border border-border/50">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 border border-accent/20 px-4 py-1.5 mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              <span className="text-xs font-medium uppercase tracking-wider text-accent">
                What We Do
              </span>
            </div>
            
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl leading-tight">
              About My Studio Channel
            </h2>
            
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              My Studio Channel helps creators launch their own television-style 
              platforms online. From talk shows and cooking shows to podcasts and 
              documentaries, we design clean, organized websites that showcase 
              programming the way a real network would.
            </p>
            
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Because we&apos;re creators too, we understand what it takes to present 
              your work professionally. Every platform includes a custom built-in 
              plugin with step-by-step tutorials, plus access to our creator 
              community for continued learning and support.
            </p>

            <div className="mt-8 flex items-center gap-4">
              <a
                href="#msc-process"
                onClick={(e) => onHashAnchorClick(e, "#msc-process")}
                className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent/80 transition-colors"
              >
                Learn more about our process
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Image Card - spans 5 columns - WhatWeDo.jpg */}
          <div className="lg:col-span-5 bento-card rounded-3xl overflow-hidden border border-border/50 relative min-h-[300px] lg:min-h-0">
            <Image
              src="/media/what-we-do.jpg"
              alt="Professional production crew filming in studio"
              fill
              className="object-cover"
            />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="glass rounded-xl p-4">
                <p className="text-sm font-medium text-foreground">Built for creators, by creators</p>
                <p className="text-xs text-muted-foreground mt-1">20+ years of media experience</p>
              </div>
            </div>
          </div>

          {/* Feature Cards - 4 across */}
          {features.map((feature) => (
            <div
              key={feature.title}
              className="lg:col-span-3 bento-card group p-6 rounded-2xl border border-border/50 bg-card/30 hover:bg-card/50 transition-all duration-300"
            >
              <div className="h-12 w-12 rounded-xl bg-secondary/50 border border-border/50 flex items-center justify-center mb-4 group-hover:bg-accent/10 group-hover:border-accent/20 transition-all duration-300">
                <feature.icon className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>


      </div>
    </section>
  )
}
