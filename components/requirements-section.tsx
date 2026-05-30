"use client"

import { useState } from "react"
import NextImage from "next/image"
import type { LucideIcon } from "lucide-react"
import { Image, Film, Video, Globe, Server, CheckCircle2, ArrowRight, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { useContactModal } from "@/components/contact-modal-context"
import { Button } from "@/components/ui/button"

type RequirementCard = {
  id: number
  icon: LucideIcon
  title: string
  subtitle: string
  description: string
  specs: string[]
  highlight: boolean
  hasImage?: boolean
}

const requirements: RequirementCard[] = [
  {
    id: 1,
    icon: Image,
    title: "Images & Show Artwork",
    subtitle: "(or select the add-on)",
    description: "High-resolution logos, professional headshots, and any specific branding graphics (layered .PSD or .AI files are preferred if available).",
    specs: ["High-resolution files", "Layered .PSD or .AI preferred", "Logo variations", "Professional headshots"],
    highlight: true,
    hasImage: true,
  },
  {
    id: 2,
    icon: Film,
    title: "Thumbnails",
    subtitle: "(or select the add-on)",
    description: "Eye-catching, high-contrast images (1920 x 1080px) that clearly represent your episodes or categories at a glance.",
    specs: ["1920 x 1080px resolution", "High-contrast visuals", "Episode representations", "Category images"],
    highlight: false
  },
  {
    id: 3,
    icon: Video,
    title: "Video and/or Audio Files",
    subtitle: "",
    description: "Direct download links (Dropbox/Drive) or hosted URLs (YouTube/Vimeo) for the primary media content you want featured on the site.",
    specs: ["Dropbox/Drive links", "YouTube/Vimeo URLs", "Direct download access", "Primary media content"],
    highlight: false
  },
  {
    id: 4,
    icon: Globe,
    title: "Domain Name",
    subtitle: "",
    description: "The registered web address (URL) you intend to use, along with the login credentials for your registrar (e.g., SiteGround or Spaceship).",
    specs: ["Registered URL", "Registrar login access", "DNS management", "Secure credentials"],
    highlight: false
  },
  {
    id: 5,
    icon: Server,
    title: "Hosting Account Access",
    subtitle: "",
    description: "Temporary administrative login details for your web hosting provider so we can configure the server environment and install WordPress.",
    specs: ["Admin login details", "Server access", "WordPress installation", "Temporary credentials"],
    highlight: false
  }
]

export function RequirementsSection() {
  const [activeItem, setActiveItem] = useState<number | null>(null)
  const { openContactModal } = useContactModal()

  return (
    <section 
      className="py-32 relative overflow-hidden bg-surface-1 msc-section msc-surface-1"
      data-divi-section="requirements"
      data-divi-modules="text,blurb,image"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-accent/3 rounded-full blur-[150px]" />
      </div>

      <div id="msc-requirements" className="mx-auto max-w-7xl px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-border/50 mb-6">
            <CheckCircle2 className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-muted-foreground">Project Requirements</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
            What We Need From You
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            To build your Studio Channel, you&apos;ll need to provide the following materials. We&apos;ll guide you through each step.
          </p>
        </div>

        {/* Requirements Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-12">
          {requirements.map((item) => (
            <div
              key={item.id}
              className={cn(
                "group relative glass-card rounded-2xl border transition-all duration-500 cursor-pointer",
                activeItem === item.id
                  ? "border-accent/50 glow-accent-sm"
                  : "border-border/50 hover:border-accent/30",
                item.highlight && "lg:col-span-2"
              )}
              onMouseEnter={() => setActiveItem(item.id)}
              onMouseLeave={() => setActiveItem(null)}
            >
              {/* Number Badge */}
              <div className="absolute -top-3 -left-3 h-8 w-8 rounded-full bg-background border border-border flex items-center justify-center z-10">
                <span className="text-sm font-bold text-accent">{item.id}</span>
              </div>
        {/* Card with optional image layout */}
              {item.hasImage ? (
                <div className="flex flex-col lg:flex-row">
                  {/* Left: text content */}
                  <div className="p-8 flex flex-col justify-between flex-1">
                    <div className="flex items-start gap-4 mb-6">
                      <div className={cn(
                        "h-14 w-14 rounded-xl border flex items-center justify-center flex-shrink-0 transition-all duration-300",
                        activeItem === item.id
                          ? "bg-accent/20 border-accent/30"
                          : "bg-secondary/50 border-border/50 group-hover:bg-accent/10 group-hover:border-accent/20"
                      )}>
                        <item.icon className={cn(
                          "h-7 w-7 transition-colors",
                          activeItem === item.id ? "text-accent" : "text-muted-foreground group-hover:text-accent"
                        )} />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-foreground mb-1">{item.title}</h3>
                        {item.subtitle && <span className="text-sm text-accent">{item.subtitle}</span>}
                        <p className="text-muted-foreground mt-3 leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {item.specs.map((spec, specIndex) => (
                        <div key={specIndex} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/30 border border-border/30">
                          <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" />
                          <span className="text-sm text-foreground">{spec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Right: image */}
                  <div className="relative lg:w-80 h-56 lg:h-auto flex-shrink-0 overflow-hidden rounded-b-2xl lg:rounded-b-none lg:rounded-r-2xl">
                    <NextImage
                      src="/media/podcast.jpg"
                      alt="Professional podcaster recording in studio"
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-card/40 via-transparent to-transparent lg:bg-gradient-to-l" />
                    <div className="absolute bottom-4 left-4 lg:bottom-4 lg:left-auto lg:right-4 lg:text-right">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/20 border border-accent/30 backdrop-blur-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                        <span className="text-xs font-medium text-accent">Branding Assets</span>
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className={cn(
                      "h-14 w-14 rounded-xl border flex items-center justify-center flex-shrink-0 transition-all duration-300",
                      activeItem === item.id
                        ? "bg-accent/20 border-accent/30"
                        : "bg-secondary/50 border-border/50 group-hover:bg-accent/10 group-hover:border-accent/20"
                    )}>
                      <item.icon className={cn(
                        "h-7 w-7 transition-colors",
                        activeItem === item.id ? "text-accent" : "text-muted-foreground group-hover:text-accent"
                      )} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-1">{item.title}</h3>
                      {item.subtitle && <span className="text-sm text-accent">{item.subtitle}</span>}
                      <p className="text-muted-foreground mt-3 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {item.specs.map((spec, specIndex) => (
                      <div key={specIndex} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/30 border border-border/30">
                        <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" />
                        <span className="text-sm text-foreground">{spec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Guidance Note */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 border border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex items-start sm:items-center gap-4 flex-1">
              <div className="h-12 w-12 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Don&apos;t have everything ready?</h3>
                <p className="text-muted-foreground text-sm sm:text-base">Thumbnail and artwork creation is available as an add-on. We&apos;ll guide you through each step of the process.</p>
              </div>
            </div>
            <div className="flex-shrink-0 flex justify-center md:justify-end">
              <Button
                type="button"
                className="inline-flex items-center gap-2 px-6 py-3 h-auto rounded-xl bg-accent text-accent-foreground font-medium hover:bg-accent/90 transition-all duration-300 glow-accent-sm hover:glow-accent"
                // ORIGINAL CODE (commented out for temporary redirect):
                // onClick={() => openContactModal()}
                // TEMPORARY REDIRECT - Remove when restoring original behavior:
                onClick={() => window.open('https://docs.google.com/forms/d/e/1FAIpQLSe1xo__uQrR6_T0VNmbP8julRgHRZGHsaoW8xqFbJYVtWV1dQ/viewform', '_blank', 'noopener,noreferrer')}
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
