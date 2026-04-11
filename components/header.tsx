"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu, X, ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  resolveNavHashHref,
  scrollPropForResolvedNav,
  shouldReplaceHashLink,
} from "@/lib/hash-nav"

export type HeaderNavItem = {
  label: string
  link: string
  submenu?: Array<{
    label: string
    link: string
  }>
}

type HeaderProps = {
  navItems: HeaderNavItem[]
  logoSrc?: string | null
  siteName?: string
  /** From Site settings → Enable Sticky Header (default true). */
  stickyHeader?: boolean
}

export function Header({
  navItems,
  logoSrc,
  siteName = "My Studio Channel",
  stickyHeader = true,
}: HeaderProps) {
  const pathname = usePathname()
  const path = pathname ?? "/"
  const ctaDemosHref = resolveNavHashHref(path, "#msc-demos")
  const ctaContactHref = resolveNavHashHref(path, "#msc-contact")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)
  const closeTimerRef = useRef<number | null>(null)

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("[MSC] Enable Sticky Header (prop):", stickyHeader)
    }
  }, [stickyHeader])

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current)
      }
    }
  }, [])

  return (
    <header
      id="msc-header"
      className={cn(
        "left-0 right-0 msc-section border-b border-white/10",
        /* z-[100] stays above hero carousel controls (z-[60]) and section layers */
        stickyHeader
          ? "sticky top-0 z-100 bg-black/70 backdrop-blur-md"
          : "relative z-50 bg-background",
      )}
      data-divi-section="header"
      data-divi-modules="global-header"
    >
      <div className="w-full px-6 lg:px-12">
        <div className="flex h-20 items-center justify-between">
          {/* Logo - Always show full branding */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
            <div className="relative h-8 w-8 sm:h-10 sm:w-10 shrink-0">
              <Image src={logoSrc || "/media/msc-icon.png"} alt={`${siteName} logo`} fill className="object-contain group-hover:drop-shadow-lg transition-all duration-300" />
            </div>
            <div>
              <span className="text-sm sm:text-base font-semibold tracking-tight text-foreground block">
                {siteName}
              </span>
              <span className="block text-[8px] sm:text-[10px] uppercase tracking-[0.15em] sm:tracking-[0.2em] text-muted-foreground font-medium">
                Creator Platforms
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const topHref = resolveNavHashHref(path, item.link)
              return (
              <div
                key={`${item.label}-${item.link}`}
                className="relative"
                onMouseEnter={() => {
                  if (closeTimerRef.current) {
                    window.clearTimeout(closeTimerRef.current)
                    closeTimerRef.current = null
                  }
                  if (item.submenu && item.submenu.length > 0) {
                    setOpenSubmenu(item.label)
                  }
                }}
                onMouseLeave={() => {
                  if (item.submenu && item.submenu.length > 0) {
                    closeTimerRef.current = window.setTimeout(() => {
                      setOpenSubmenu((current) => (current === item.label ? null : current))
                    }, 160)
                  }
                }}
              >
                {item.submenu && item.submenu.length > 0 ? (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 px-4 py-2 text-sm text-muted-foreground transition-colors rounded-lg hover:bg-secondary/50 hover:text-foreground"
                  >
                    {item.label}
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 transition-transform duration-200",
                        openSubmenu === item.label ? "rotate-180" : "rotate-0"
                      )}
                    />
                  </button>
                ) : (
                  <Link
                    href={topHref}
                    replace={shouldReplaceHashLink(path, topHref)}
                    scroll={scrollPropForResolvedNav(path, topHref)}
                    className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50"
                  >
                    {item.label}
                  </Link>
                )}

                {item.submenu && item.submenu.length > 0 && openSubmenu === item.label && (
                  <div className="absolute left-0 top-full mt-2 min-w-[220px] rounded-xl border border-white/10 bg-[#111216]/95 p-2 shadow-xl backdrop-blur-md animate-in fade-in-0 zoom-in-95 duration-150">
                    {item.submenu.map((subItem) => {
                      const subHref = resolveNavHashHref(path, subItem.link)
                      return (
                        <Link
                          key={`${item.label}-${subItem.label}-${subItem.link}`}
                          href={subHref}
                          replace={shouldReplaceHashLink(path, subHref)}
                          scroll={scrollPropForResolvedNav(path, subHref)}
                          className="block rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
                        >
                          {subItem.label}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
              )
            })}
          </nav>

          {/* CTA Button */}
          <div className="hidden lg:flex items-center gap-3">
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              asChild
            >
              <Link
                href={ctaDemosHref}
                replace={shouldReplaceHashLink(path, ctaDemosHref)}
                scroll={scrollPropForResolvedNav(path, ctaDemosHref)}
              >
                View Demos
              </Link>
            </Button>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 glow-accent-sm hover:glow-accent transition-all duration-300" asChild>
              <Link
                href={ctaContactHref}
                replace={shouldReplaceHashLink(path, ctaContactHref)}
                scroll={scrollPropForResolvedNav(path, ctaContactHref)}
              >
                Book Consultation
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
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
        <div
          className={cn(
            "lg:hidden border-t border-white/10",
            stickyHeader ? "bg-black/70 backdrop-blur-md" : "bg-background",
          )}
        >
          <nav className="flex flex-col px-6 py-6 gap-1">
            {navItems.map((item) => {
              const topHref = resolveNavHashHref(path, item.link)
              return (
              <div key={`${item.label}-${item.link}`}>
                <Link
                  href={topHref}
                  replace={shouldReplaceHashLink(path, topHref)}
                  scroll={scrollPropForResolvedNav(path, topHref)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors py-3 px-4 rounded-lg hover:bg-secondary/50 block"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
                {item.submenu && item.submenu.length > 0 && (
                  <div className="pl-4 pb-2">
                    {item.submenu.map((subItem) => {
                      const subHref = resolveNavHashHref(path, subItem.link)
                      return (
                        <Link
                          key={`${item.label}-${subItem.label}-${subItem.link}`}
                          href={subHref}
                          replace={shouldReplaceHashLink(path, subHref)}
                          scroll={scrollPropForResolvedNav(path, subHref)}
                          className="text-xs text-muted-foreground/90 hover:text-foreground transition-colors py-2 px-4 rounded-lg hover:bg-secondary/40 block"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {subItem.label}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
              )
            })}
            <div className="flex flex-col gap-3 pt-6 mt-4 border-t border-border/50">
              <Button
                variant="outline"
                className="border-border text-foreground hover:bg-secondary w-full justify-center"
                asChild
              >
                <Link
                  href={ctaDemosHref}
                  replace={shouldReplaceHashLink(path, ctaDemosHref)}
                  scroll={scrollPropForResolvedNav(path, ctaDemosHref)}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  View Demos
                </Link>
              </Button>
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90 w-full justify-center glow-accent-sm" asChild>
                <Link
                  href={ctaContactHref}
                  replace={shouldReplaceHashLink(path, ctaContactHref)}
                  scroll={scrollPropForResolvedNav(path, ctaContactHref)}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Book Consultation
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
