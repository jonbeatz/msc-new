import Image from "next/image"
import { ArrowRight, Play } from "lucide-react"
import { Button } from "@/components/ui/button"

export type PageHeroBannerProps = {
  image: { url: string; alt: string }
  eyebrow: string
  headline: [string, string, string]
  sub: string
  ctaLink: string
  /** Shown with the hero for accessibility / context */
  overline?: string | null
}

export function PageHeroBanner({
  image,
  eyebrow,
  headline,
  sub,
  ctaLink,
  overline,
}: PageHeroBannerProps) {
  return (
    <section
      className="relative min-h-[min(100vh,56rem)] flex items-center justify-center overflow-hidden border-b border-white/10"
      aria-label="Page hero"
    >
      <div className="absolute inset-0 z-0">
        <Image
          src={image.url}
          alt={image.alt}
          fill
          className="object-cover object-center pointer-events-none select-none"
          priority
          draggable={false}
        />
      </div>

      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/75 via-black/80 to-black pointer-events-none" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-r from-black/70 via-black/30 to-transparent pointer-events-none" />

      <div
        className="absolute inset-0 z-[1] opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 w-full px-6 lg:px-16 pt-28 sm:pt-36 pb-20">
        {overline && overline.trim().length > 0 ? (
          <p className="mb-10 text-center text-xs uppercase tracking-[0.25em] text-[#D4AF37]">
            {overline.trim()}
          </p>
        ) : null}

        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-6 inline-flex items-center gap-3 rounded-full px-5 py-2.5 border border-white/10 bg-white/5 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-accent" />
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {eyebrow}
            </span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.07]">
            <span className="block">{headline[0]}</span>
            <span className="block mt-1">{headline[1]}</span>
            <span className="block mt-1" style={{ color: "#F5B841" }}>
              {headline[2]}
            </span>
          </h1>

          {sub.trim().length > 0 ? (
            <p className="mt-6 max-w-2xl mx-auto text-base leading-relaxed text-muted-foreground sm:text-lg">
              {sub}
            </p>
          ) : null}

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 h-14 px-8 text-base font-semibold glow-accent-sm hover:glow-accent transition-all duration-300 cursor-pointer"
              asChild
            >
              <a href={ctaLink}>
                Start With a Consultation
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 text-foreground hover:bg-white/10 h-14 px-8 text-base font-medium backdrop-blur-sm cursor-pointer"
              asChild
            >
              <a href="#msc-demos">
                <Play className="mr-2 h-5 w-5 fill-current" />
                View the Demo
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
