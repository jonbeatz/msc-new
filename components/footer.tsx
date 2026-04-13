"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"

import {
  resolveNavHashHref,
  scrollPropForResolvedNav,
  shouldReplaceHashLink,
} from "@/lib/hash-nav"
import { onHashAnchorClick } from "@/lib/utils"
import { MSC_ADMIN_VERSION } from "@/lib/msc-admin-version"
const footerLinks = {
  company: [
    { label: "About", href: "#msc-about" },
    { label: "Services", href: "#msc-services" },
    { label: "Packages", href: "#msc-packages" },
    { label: "Demos", href: "#msc-demos" },
  ],
  resources: [
    { label: "FAQ", href: "#msc-faq" },
    { label: "Testimonials", href: "#msc-testimonials" },
    { label: "Contact", href: "#msc-contact" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms of Service", href: "/terms-of-service" },
  ],
}

type FooterProps = {
  logoSrc?: string | null
  siteName?: string
}

export function Footer({ logoSrc, siteName = "My Studio Channel" }: FooterProps) {
  const pathname = usePathname()
  const path = pathname ?? "/"

  return (
    <footer 
      className="bg-surface-0 relative msc-section"
      data-divi-section="footer"
      data-divi-modules="footer-widget"
    >
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8 py-16">
        <div id="msc-footer" className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-6 group">
              <div className="relative h-10 w-10 shrink-0">
                <Image src={logoSrc || "/media/msc-icon.png"} alt={`${siteName} logo`} fill className="object-contain group-hover:drop-shadow-lg transition-all duration-300" />
              </div>
              <div>
                <span className="block text-base font-semibold tracking-tight text-foreground">
                  {siteName}
                </span>
                <span className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
                  Creator Platforms
                </span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Build a platform you own, control, and grow — without relying on social media platforms.
            </p>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => {
                const href = resolveNavHashHref(path, link.href)
                return (
                  <li key={link.label}>
                    <Link
                      href={href}
                      replace={shouldReplaceHashLink(path, href)}
                      scroll={scrollPropForResolvedNav(path, href)}
                      className="text-sm text-muted-foreground hover:text-accent transition-colors"
                      onClick={(e) => {
                        if (path === "/" && href.startsWith("#")) {
                          onHashAnchorClick(e, href)
                        }
                      }}
                    >
                      {link.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => {
                const href = resolveNavHashHref(path, link.href)
                return (
                  <li key={link.label}>
                    <Link
                      href={href}
                      replace={shouldReplaceHashLink(path, href)}
                      scroll={scrollPropForResolvedNav(path, href)}
                      className="text-sm text-muted-foreground hover:text-accent transition-colors"
                      onClick={(e) => {
                        if (path === "/" && href.startsWith("#")) {
                          onHashAnchorClick(e, href)
                        }
                      }}
                    >
                      {link.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-border/50">
          <p className="text-sm text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} {siteName}. All rights reserved.
          </p>
          <p className="mt-2 text-center text-xs text-muted-foreground/80 tabular-nums">
            Release v{MSC_ADMIN_VERSION}
          </p>
        </div>
      </div>

      {/* Large Brand Text */}
      <div className="border-t border-border/30 py-12 overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-5xl sm:text-7xl lg:text-8xl font-bold text-foreground/3 tracking-tighter select-none whitespace-nowrap text-center">
            MY STUDIO CHANNEL
          </div>
        </div>
      </div>
    </footer>
  )
}
