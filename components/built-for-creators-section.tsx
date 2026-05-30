"use client"

import { Mic, Video, GraduationCap, Users, Tv, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useContactModal } from "@/components/contact-modal-context"

const creatorTypes = [
  {
    icon: Mic,
    title: "Podcasters",
    description: "Ready to organize and showcase their content",
  },
  {
    icon: Video,
    title: "Content Creators",
    description: "Tired of relying on social platforms",
  },
  {
    icon: GraduationCap,
    title: "Coaches",
    description: "Building a media presence",
  },
  {
    icon: Users,
    title: "First-Time Launchers",
    description: "Creators launching their first platform",
  },
  {
    icon: Tv,
    title: "Network Builders",
    description: "Want a professional, network-style presentation",
  },
]

export function BuiltForCreatorsSection() {
  const { openContactModal } = useContactModal()

  return (
    <section 
      className="py-24 lg:py-32 relative bg-surface-1 msc-section msc-surface-1"
      data-divi-section="built-for-creators"
      data-divi-modules="blurb,cta"
    >
      <div id="msc-creators" className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 border border-accent/20 px-4 py-1.5 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="text-xs font-medium uppercase tracking-wider text-accent">
              For You
            </span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Built for Creators Like You
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Whether you&apos;re just starting or ready to grow, this platform is designed 
            for creators who want more control. Creators come to My Studio Channel at 
            different stages, but they all have one thing in common — they want a platform 
            they can own, control, and grow.
          </p>
        </div>

        {/* Creator Types Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {creatorTypes.map((type, index) => (
            <div
              key={type.title}
              className={`bento-card rounded-2xl border border-border/50 p-6 ${
                index === 0 ? "glass-card" : "bg-card/30"
              }`}
            >
              <div className="h-12 w-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-4">
                <type.icon className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{type.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{type.description}</p>
            </div>
          ))}
          
          {/* CTA Card */}
          <div className="bento-card rounded-2xl border border-accent/30 bg-accent/5 p-6 flex flex-col justify-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Ready to get started?
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Book a consultation to discuss your vision.
            </p>
            <Button
              type="button"
              className="bg-accent text-accent-foreground hover:bg-accent/90 glow-accent-sm w-fit"
              // ORIGINAL CODE (commented out for temporary redirect):
              // onClick={() => openContactModal()}
              // TEMPORARY REDIRECT - Remove when restoring original behavior:
              onClick={() => window.open('https://docs.google.com/forms/d/e/1FAIpQLSe1xo__uQrR6_T0VNmbP8julRgHRZGHsaoW8xqFbJYVtWV1dQ/viewform', '_blank', 'noopener,noreferrer')}
            >
              Start Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
