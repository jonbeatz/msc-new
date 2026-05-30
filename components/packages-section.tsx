"use client"

import { Check, Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useContactModal } from "@/components/contact-modal-context"

const packages: Array<{
  name: string
  price: string
  description: string
  bestFor: string
  featured: boolean
  features: string[]
}> = [
  {
    name: "Creator Launch",
    price: "$5,800",
    description: "Professional streaming-style website using YouTube video hosting.",
    bestFor: "Creators who already host videos on YouTube and want a premium presentation layer.",
    featured: false,
    features: [
      "Cinematic network-style website design",
      "Custom YouTube video player layout",
      "YouTube videos embedded without suggested videos",
      "Streaming-style layout (like Netflix rows)",
      "Mobile optimized",
      "Brand colors & typography setup",
      "Revision rounds included",
      "Built on WordPress + Divi",
      "Tutorial walkthrough after launch",
    ],
  },
  {
    name: "Studio Pro",
    price: "$10,800",
    description: "Professional video platform with your own hosted player.",
    bestFor: "Creators who want their own professional streaming environment without relying on YouTube.",
    featured: true,
    features: [
      "Everything in Creator Launch plus",
      "Custom Video Player",
      "Video hosting via Bunny.net",
      "Video delivery powered by Presto Player",
      "No ads or platform branding",
      "Faster streaming performance",
      "Advanced video playback controls",
    ],
  },
  {
    name: "Network Platform",
    price: "$18,800",
    description: "A full content platform with private member access.",
    bestFor: "Creators launching their own streaming platform, academy, or subscription content network.",
    featured: false,
    features: [
      "Everything in Studio Pro plus",
      "Custom Membership Website",
      "Private login portal",
      "Member-only video libraries",
      "Paid subscriber access capability",
      "Content protection",
      "Structured video categories",
      "Scalable platform structure",
    ],
  },
]

export function PackagesSection() {
  const { openContactModal } = useContactModal()

  return (
    <section 
      className="py-24 lg:py-32 relative bg-surface-0 msc-section msc-surface-0"
      data-divi-section="packages"
      data-divi-modules="pricing-tables"
    >
      <div id="msc-packages" className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 border border-accent/20 px-4 py-1.5 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="text-xs font-medium uppercase tracking-wider text-accent">
              Investment
            </span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Build Packages
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            A professional streaming-style website built for you one time. No platform 
            lock-in, no monthly subscriptions, and no per-subscriber fees.
          </p>
        </div>

        {/* Packages Grid */}
        <div className="grid lg:grid-cols-3 gap-4 lg:gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg.name}
              className={`bento-card relative rounded-3xl border p-6 lg:p-8 flex flex-col ${
                pkg.featured
                  ? "glass-card border-accent/30 lg:scale-105 z-10"
                  : "bg-card/30 border-border/50"
              }`}
            >
              {pkg.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 glow-accent-sm">
                    <Sparkles className="h-3.5 w-3.5 text-accent-foreground" />
                    <span className="text-xs font-semibold text-accent-foreground">
                      Most Popular
                    </span>
                  </div>
                </div>
              )}

              <div className="mb-6 pt-2 text-center lg:text-left">
                <h3 className="text-xl font-bold text-foreground">{pkg.name}</h3>
                <div className="mt-4 flex items-baseline justify-center lg:justify-start gap-1">
                  <span className={`text-4xl font-bold ${pkg.featured ? "text-accent" : "text-foreground"}`}>
                    {pkg.price}
                  </span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  {pkg.description}
                </p>
              </div>

              <div className="flex-1">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4 font-medium">
                  Payment: 50% Deposit / 25% Midway / 25% Final
                </p>
                <ul className="space-y-3">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className={`h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        pkg.featured 
                          ? "bg-accent/20 border border-accent/30" 
                          : "bg-secondary/50 border border-border/50"
                      }`}>
                        <Check className={`h-3 w-3 ${pkg.featured ? "text-accent" : "text-muted-foreground"}`} />
                      </div>
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-border/50">
                <p className="text-xs text-muted-foreground mb-4">
                  <span className="font-semibold text-foreground">Best For:</span> {pkg.bestFor}
                </p>
                <Button
                  type="button"
                  className={`w-full cursor-pointer ${
                    pkg.featured
                      ? "bg-accent text-accent-foreground hover:bg-accent/90 glow-accent-sm"
                      : "bg-secondary/50 text-foreground hover:bg-secondary/80 border border-border/50"
                  }`}
                  // ORIGINAL CODE (commented out for temporary redirect):
                  // onClick={() =>
                  //   openContactModal({
                  //     fromPackage: { name: pkg.name, price: pkg.price },
                  //   })
                  // }
                  // TEMPORARY REDIRECT - Remove when restoring original behavior:
                  onClick={() => window.open('https://docs.google.com/forms/d/e/1FAIpQLSe1xo__uQrR6_T0VNmbP8julRgHRZGHsaoW8xqFbJYVtWV1dQ/viewform', '_blank', 'noopener,noreferrer')}
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
