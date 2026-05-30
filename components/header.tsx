"use client"

import { useState, useEffect, useRef, type MouseEvent } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu, X, ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn, handleScroll } from "@/lib/utils"
import {
  canonicalFragmentIdFromHref,
  resolveNavHashHref,
  scrollPropForResolvedNav,
  shouldReplaceHashLink,
} from "@/lib/hash-nav"
import { useContactModal } from "@/components/contact-modal-context"

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
  const { openContactModal } = useContactModal()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  /** Desktop flyout only (hover). */
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)
  /** Mobile accordion: which top-level row is expanded (tap to open). */
  const [mobileExpandedLabel, setMobileExpandedLabel] = useState<string | null>(null)
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

  useEffect(() => {
    if (!isMobileMenuOpen) {
      setMobileExpandedLabel(null)
    }
  }, [isMobileMenuOpen])

  const closeNavDropdowns = () => {
    setOpenSubmenu(null)
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  /**
   * Same-page `#section` links on `/`: smooth scroll + offset + clean URL; closes flyouts.
   * Mobile: pass `deferMs` so the drawer can close before we measure `#msc-header` and scroll.
   */
  const onHashNavLinkClick = (
    e: MouseEvent<HTMLAnchorElement>,
    resolvedHref: string,
    scrollOpts?: { deferMs?: number },
  ) => {
    if (path !== "/") return
    const h = resolvedHref.trim()
    if (/^https?:\/\//i.test(h) || h.startsWith("mailto:")) return
    if (!h.includes("#")) return
    if (!h.startsWith("#")) return
    const id = canonicalFragmentIdFromHref(h)
    if (!id) return
    e.preventDefault()
    closeNavDropdowns()
    handleScroll(`#${id}`, scrollOpts)
  }

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
                    onClick={(e) => onHashNavLinkClick(e, topHref)}
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
                          onClick={(e) => onHashNavLinkClick(e, subHref)}
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
                onClick={(e) => onHashNavLinkClick(e, ctaDemosHref)}
              >
                View Demos
              </Link>
            </Button>
            <Button
              type="button"
              className="bg-accent text-accent-foreground hover:bg-accent/90 glow-accent-sm hover:glow-accent transition-all duration-300"
              // ORIGINAL CODE (commented out for temporary redirect):
              // onClick={() => openContactModal()}
              // TEMPORARY REDIRECT - Remove when restoring original behavior:
              onClick={() => window.open('https://docs.google.com/forms/d/e/1FAIpQLSe1xo__uQrR6_T0VNmbP8julRgHRZGHsaoW8xqFbJYVtWV1dQ/viewform', '_blank', 'noopener,noreferrer')}
            >
              Book Consultation
              <ChevronRight className="ml-1 h-4 w-4" />
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
              const hasSub = Boolean(item.submenu && item.submenu.length > 0)
              return (
              <div key={`${item.label}-${item.link}`}>
                {hasSub ? (
                  <>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-2 text-left text-sm text-muted-foreground hover:text-foreground transition-colors py-3 px-4 rounded-lg hover:bg-secondary/50"
                      aria-expanded={mobileExpandedLabel === item.label}
                      onClick={() =>
                        setMobileExpandedLabel((cur) =>
                          cur === item.label ? null : item.label,
                        )
                      }
                    >
                      <span>{item.label}</span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 shrink-0 transition-transform duration-200",
                          mobileExpandedLabel === item.label && "rotate-180",
                        )}
                        aria-hidden
                      />
                    </button>
                    {mobileExpandedLabel === item.label && (
                      <div className="border-l border-border/50 ml-4 pl-3 pb-2 space-y-0.5">
                        {(item.submenu ?? []).map((subItem) => {
                          const subHref = resolveNavHashHref(path, subItem.link)
                          return (
                            <Link
                              key={`${item.label}-${subItem.label}-${subItem.link}`}
                              href={subHref}
                              replace={shouldReplaceHashLink(path, subHref)}
                              scroll={scrollPropForResolvedNav(path, subHref)}
                              className="text-xs text-muted-foreground/90 hover:text-foreground transition-colors py-2.5 px-3 rounded-lg hover:bg-secondary/40 block"
                              onClick={(e) => {
                                onHashNavLinkClick(e, subHref, { deferMs: 72 })
                                setIsMobileMenuOpen(false)
                              }}
                            >
                              {subItem.label}
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={topHref}
                    replace={shouldReplaceHashLink(path, topHref)}
                    scroll={scrollPropForResolvedNav(path, topHref)}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors py-3 px-4 rounded-lg hover:bg-secondary/50 block"
                    onClick={(e) => {
                      onHashNavLinkClick(e, topHref, { deferMs: 72 })
                      setIsMobileMenuOpen(false)
                    }}
                  >
                    {item.label}
                  </Link>
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
                  onClick={(e) => {
                    onHashNavLinkClick(e, ctaDemosHref, { deferMs: 72 })
                    setIsMobileMenuOpen(false)
                  }}
                >
                  View Demos
                </Link>
              </Button>
              <Button
                type="button"
                className="bg-accent text-accent-foreground hover:bg-accent/90 w-full justify-center glow-accent-sm"
                onClick={() => {
                  // ORIGINAL CODE (commented out for temporary redirect):
                  // openContactModal()
                  // TEMPORARY REDIRECT - Remove when restoring original behavior:
                  window.open('https://docs.google.com/forms/d/e/1FAIpQLSe1xo__uQrR6_T0VNmbP8julRgHRZGHsaoW8xqFbJYVtWV1dQ/viewform', '_blank', 'noopener,noreferrer')
                  setIsMobileMenuOpen(false)
                }}
              >
                Book Consultation
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
