"use client"

import Image from "next/image"
import { ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ReadyToStartSection() {
  return (
    <section 
      id="msc-cta" 
      className="py-24 lg:py-32 relative overflow-hidden msc-section"
      data-divi-section="ready-to-start"
      data-divi-modules="cta,text,button"
      data-divi-background="on-air-bg.jpg"
    >
      {/* Darkened Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/on-air-bg.jpg"
          alt="On Air Studio Background"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-background/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-background" />
      </div>
      
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center lg:text-left lg:mx-0">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/20 border border-accent/30 px-4 py-1.5 mb-6 backdrop-blur-sm glow-accent-sm">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-accent">
              Ready to get started?
            </span>
          </div>
          
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Ready to Launch Your Channel?
          </h2>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Build a platform you own, control, and grow — without relying on 
            social media platforms. Schedule a consultation to discuss your vision 
            and get started today.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            <Button 
              size="lg" 
              className="bg-accent text-accent-foreground hover:bg-accent/90 glow-accent px-8"
              asChild
            >
              <a href="#msc-contact">
                Start With a Consultation
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-border/50 text-foreground hover:bg-secondary/50 backdrop-blur-sm"
              asChild
            >
              <a href="#msc-packages">View Packages</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
