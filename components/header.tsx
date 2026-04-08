"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type HeaderNavItem = {
  label: string
  link: string
}

export function Header({ navItems }: { navItems: HeaderNavItem[] }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      id="msc-header"
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 msc-section",
        isScrolled
          ? "border-b border-white/6"
          : "bg-transparent"
      )}
      style={isScrolled ? { backgroundColor: "rgba(13,13,15,0.92)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)" } : undefined}
      data-divi-section="header"
      data-divi-modules="global-header"
    >
      <div className="w-full px-6 lg:px-12">
        <div className="flex h-20 items-center justify-between">
          {/* Logo - Always show full branding */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
            <div className="relative h-8 w-8 sm:h-10 sm:w-10 shrink-0">
              <Image src="/images/msc-icon.png" alt="MSC Logo" fill className="object-contain group-hover:drop-shadow-lg transition-all duration-300" />
            </div>
            <div>
              <span className="text-sm sm:text-base font-semibold tracking-tight text-foreground block">
                My Studio Channel
              </span>
              <span className="block text-[8px] sm:text-[10px] uppercase tracking-[0.15em] sm:tracking-[0.2em] text-muted-foreground font-medium">
                Creator Platforms
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={`${item.label}-${item.link}`}
                href={item.link}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden lg:flex items-center gap-3">
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              asChild
            >
              <a href="#msc-demos">View Demo</a>
            </Button>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 glow-accent-sm hover:glow-accent transition-all duration-300" asChild>
              <a href="#msc-contact">
                Book Consultation
                <ChevronRight className="ml-1 h-4 w-4" />
              </a>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-foreground rounded-lg hover:bg-secondary/50 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-white/6" style={{ backgroundColor: "rgba(13,13,15,0.97)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)" }}>
          <nav className="flex flex-col px-6 py-6 gap-1">
            {navItems.map((item) => (
              <Link
                key={`${item.label}-${item.link}`}
                href={item.link}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors py-3 px-4 rounded-lg hover:bg-secondary/50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex flex-col gap-3 pt-6 mt-4 border-t border-border/50">
              <Button
                variant="outline"
                className="border-border text-foreground hover:bg-secondary w-full justify-center"
                asChild
              >
                <a href="#msc-demos" onClick={() => setIsMobileMenuOpen(false)}>View Demo</a>
              </Button>
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90 w-full justify-center glow-accent-sm" asChild>
                <a href="#msc-contact" onClick={() => setIsMobileMenuOpen(false)}>
                  Book Consultation
                  <ChevronRight className="ml-1 h-4 w-4" />
                </a>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
