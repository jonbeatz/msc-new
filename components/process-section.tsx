"use client"

import Image from "next/image"
import { Calendar, FileText, Layers, Rocket, CheckCircle2 } from "lucide-react"

const steps = [
  {
    number: "01",
    icon: Calendar,
    title: "Book Your Consultation",
    description: "We start with a call to understand your goals and determine the right setup for your platform.",
  },
  {
    number: "02",
    icon: FileText,
    title: "Submit Your Materials",
    description: "Provide your content, links, and assets so we can begin building your platform.",
  },
  {
    number: "03",
    icon: Layers,
    title: "Build & Review",
    description: "We build your site with you, review it together, and make revisions based on your package.",
  },
  {
    number: "04",
    icon: Rocket,
    title: "Launch Your Platform",
    description: "Your site is finalized, delivered, and ready for you to manage and grow.",
  },
]

const whoWeWorkedWith = [
  "Creators and entrepreneurs through My Creative Space",
  "Content creators, filmmakers, and brands through Inavizion Media",
  "Clients from website builds, content capture, and coaching programs",
  "Ongoing work with creators launching platforms through My Studio Channel",
]

export function ProcessSection() {
  return (
    <>
      {/* How It Works */}
      <section 
        className="py-24 lg:py-32 relative bg-surface-1 msc-section msc-surface-1"
        data-divi-section="process"
        data-divi-modules="text,blurb"
      >
        <div id="msc-process" className="relative mx-auto max-w-7xl px-6 lg:px-8">
          {/* Section Header - centered */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 border border-accent/20 px-4 py-1.5 mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              <span className="text-xs font-medium uppercase tracking-wider text-accent">How It Works</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              A Simple, Guided Process
            </h2>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">
              Get your platform built and ready to launch in four straightforward steps.
            </p>
          </div>

          {/* Process Steps */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="relative bento-card rounded-3xl border border-border/50 p-6 lg:p-8 bg-card/30 hover:bg-card/50 transition-all duration-300"
              >
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 -right-3 w-6 h-[1px] bg-gradient-to-r from-border/60 to-transparent z-10" />
                )}

                <div className="flex items-center justify-between mb-6">
                  <div className="h-14 w-14 rounded-2xl bg-secondary/50 border border-border/50 flex items-center justify-center">
                    <step.icon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <span className="text-4xl font-bold text-accent/20">{step.number}</span>
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-3">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>

                <div className="mt-6 pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <div className={`h-1.5 flex-1 rounded-full ${index === 0 ? "bg-accent" : "bg-secondary/50"}`} />
                    <span className="text-xs text-muted-foreground font-medium">Step {index + 1} of 4</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Built on Experience */}
      <section 
        className="py-24 lg:py-32 relative bg-surface-0 msc-section msc-surface-0"
        data-divi-section="experience"
        data-divi-modules="text,image"
      >
        <div id="msc-experience" className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-6 lg:gap-10 items-center">

            {/* Left - images stacked */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-3">
              <div className="relative rounded-2xl overflow-hidden aspect-[4/5] col-span-1">
                <Image
                  src="/media/creator-in-mind.jpg"
                  alt="Creator setting up a professional cinema camera in studio"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col gap-3">
                <div className="relative rounded-2xl overflow-hidden aspect-square">
                  <Image
                    src="/media/camera-crew.jpg"
                    alt="Film crew operating cinema camera"
                    fill
                    className="object-cover"
                  />
                </div>
                {/* Stat badge */}
                <div className="rounded-2xl border border-accent/30 bg-accent/10 p-5 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-bold text-accent">Since</span>
                  <span className="text-4xl font-bold text-accent">2000</span>
                  <span className="text-xs text-muted-foreground mt-1 leading-snug">Building for creators</span>
                </div>
              </div>
            </div>

            {/* Right - text */}
            <div className="lg:col-span-7 flex flex-col">
              <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 border border-accent/20 px-4 py-1.5 mb-6 self-start">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                <span className="text-xs font-medium uppercase tracking-wider text-accent">Our Background</span>
              </div>

              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl leading-tight">
                Built on Experience,<br />
                <span style={{ color: "#F5B841" }}>Not Guesswork</span>
              </h2>

              <p className="mt-6 text-base leading-relaxed text-muted-foreground">
                We&apos;ve been creating content and working with creators for over two decades. From early content production with <strong className="text-foreground">Every Way Woman</strong> to building platforms through <strong className="text-foreground">Inavizion Media</strong> and <strong className="text-foreground">My Creative Space</strong>, our work has always centered around helping creators bring their ideas to life.
              </p>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                Since 2000, we&apos;ve designed and built websites for clients across industries, with a focus on creators, entrepreneurs, and media-based businesses. Today, My Studio Channel brings that experience together — helping creators launch their own platform with structure, clarity, and real support.
              </p>

              {/* Who We've Worked With */}
              <div className="mt-8 rounded-2xl border border-border/50 bg-card/30 p-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-accent mb-4">
                  Who We&apos;ve Worked With
                </h3>
                <ul className="space-y-3">
                  {whoWeWorkedWith.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
