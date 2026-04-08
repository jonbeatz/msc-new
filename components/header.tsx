"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, ChevronRight, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "#msc-about", label: "About" },
  { 
    label: "Services",
    submenu: [
      { href: "#msc-services", label: "What We Do" },
      { href: "#msc-own-platform", label: "Own Your Platform" },
      { href: "#msc-packages", label: "Packages" },
      { href: "#msc-requirements", label: "Requirements" },
    ]
  },
  { href: "#msc-demos", label: "Demos" },
  { 
    label: "Resources",
    submenu: [
      { href: "#msc-testimonials", label: "Testimonials" },
      { href: "#msc-faq", label: "FAQ" },
    ]
  },
  { href: "#msc-contact", label: "Contact" },
]

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)
  const [mobileOpenSubmenu, setMobileOpenSubmenu] = useState<string | null>(null)

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
          ? "border-b border-white/[0.06]"
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
            <div className="relative h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
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
            {navLinks.map((link) => (
              link.submenu ? (
                <div 
                  key={link.label} 
                  className="relative"
                  onMouseEnter={() => setOpenSubmenu(link.label)}
                  onMouseLeave={() => setOpenSubmenu(null)}
                >
                  <button
                    className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50 inline-flex items-center gap-1"
                  >
                    {link.label}
                    <ChevronDown className={cn(
                      "h-4 w-4 transition-transform",
                      openSubmenu === link.label && "rotate-180"
                    )} />
                  </button>
                  
                  {/* Dropdown */}
                  {openSubmenu === link.label && (
                    <div className="absolute top-full left-0 pt-2">
                      <div className="rounded-xl border border-border/50 p-2 min-w-[200px]" style={{ backgroundColor: "rgba(13,13,15,0.97)", backdropFilter: "blur(18px)" }}>
                        {link.submenu.map((sublink) => (
                          <Link
                            key={sublink.href}
                            href={sublink.href}
                            className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
                          >
                            {sublink.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href!}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50"
                >
                  {link.label}
                </Link>
              )
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
        <div className="lg:hidden border-t border-white/[0.06]" style={{ backgroundColor: "rgba(13,13,15,0.97)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)" }}>
          <nav className="flex flex-col px-6 py-6 gap-1">
            {navLinks.map((link) => (
              link.submenu ? (
                <div key={link.label}>
                  <button
                    onClick={() => setMobileOpenSubmenu(mobileOpenSubmenu === link.label ? null : link.label)}
                    className="w-full flex items-center justify-between text-sm text-muted-foreground hover:text-foreground transition-colors py-3 px-4 rounded-lg hover:bg-secondary/50"
                  >
                    {link.label}
                    <ChevronDown className={cn(
                      "h-4 w-4 transition-transform",
                      mobileOpenSubmenu === link.label && "rotate-180"
                    )} />
                  </button>
                  {mobileOpenSubmenu === link.label && (
                    <div className="ml-4 border-l border-border/50 pl-4 mt-1 mb-2">
                      {link.submenu.map((sublink) => (
                        <Link
                          key={sublink.href}
                          href={sublink.href}
                          className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-2.5 px-4 rounded-lg hover:bg-secondary/50"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {sublink.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href!}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors py-3 px-4 rounded-lg hover:bg-secondary/50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              )
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
