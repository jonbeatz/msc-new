"use client"

import { ImageIcon, Share2, Settings, Globe, Server, Video, Headphones } from "lucide-react"

const addons = [
  {
    icon: ImageIcon,
    title: "Thumbnails & Show Artwork",
    price: "Starting at our rates per show",
    description: "Includes custom video thumbnails, show artwork, episode artwork, and featured images designed for your platform.",
    note: "Thumbnails are strongly recommended to achieve the intended studio-style layout. Without thumbnails, the visual presentation may be simplified.",
  },
  {
    icon: Share2,
    title: "Social Media Graphics Package",
    price: "Starting at industry standard rates",
    description: "Includes professionally designed website headers, profile images, cover images, and promotional graphics so your brand looks consistent across platforms.",
  },
]

const recommendations = [
  { icon: Globe, label: "Domain name" },
  { icon: Server, label: "Hosting" },
  { icon: Video, label: "Video hosting" },
  { icon: Video, label: "Professional video player" },
  { icon: Headphones, label: "Audio setup" },
]

export function AddonsSection() {
  return (
    <section 
      className="py-24 lg:py-32 relative bg-surface-2 msc-section msc-surface-2"
      data-divi-section="addons"
      data-divi-modules="blurb,text"
    >
      <div id="msc-addons" className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 border border-accent/20 px-4 py-1.5 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="text-xs font-medium uppercase tracking-wider text-accent">
              Extras
            </span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Add-Ons & Recommendations
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Enhance your platform with additional tools and services that help 
            your channel look polished and launch successfully.
          </p>
        </div>

        {/* Add-ons Grid */}
        <div className="grid lg:grid-cols-2 gap-4 lg:gap-6 mb-8">
          {addons.map((addon, index) => (
            <div
              key={addon.title}
              className={`bento-card rounded-2xl border border-border/50 p-6 lg:p-8 ${
                index === 0 ? "glass-card" : "bg-card/30"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                  <addon.icon className="h-6 w-6 text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">{addon.title}</h3>
                  <p className="text-sm text-accent mt-1">{addon.price}</p>
                </div>
              </div>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                {addon.description}
              </p>
              {addon.note && (
                <p className="mt-3 text-sm text-muted-foreground/80 italic border-l-2 border-accent/30 pl-4">
                  {addon.note}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Recommendations Card */}
        <div className="bento-card rounded-2xl border border-border/50 bg-card/30 p-6 lg:p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="h-12 w-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
              <Settings className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Our Recommendations</h3>
              <p className="text-sm text-muted-foreground mt-1">
                We guide you through the setup and configuration of key elements needed to launch your channel
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {recommendations.map((rec) => (
              <div
                key={rec.label}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-secondary/30 border border-border/30"
              >
                <rec.icon className="h-4 w-4 text-accent flex-shrink-0" />
                <span className="text-sm text-foreground">{rec.label}</span>
              </div>
            ))}
          </div>
          
          <p className="mt-6 text-muted-foreground text-sm">
            We don&apos;t just build the website — we help ensure everything is configured 
            properly so your platform works smoothly from day one.
          </p>
        </div>
      </div>
    </section>
  )
}
