import Link from "next/link"
import type { ReactNode } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { getHeaderNavItems } from "@/lib/cms/header"
import { getSiteSettingsCms } from "@/lib/cms/site-settings"

const LAST_UPDATED = "April 12, 2026"

const legalBodyClass =
  "pb-16 text-sm sm:text-base leading-relaxed text-muted-foreground [&_h2]:text-foreground [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-10 [&_h2]:mb-3 [&_h2:first-of-type]:mt-0 [&_h3]:text-foreground [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-8 [&_h3]:mb-2 [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_a]:text-[#D4AF37] [&_a]:underline-offset-2 hover:[&_a]:text-[#e4c46b]"

type LegalDocumentShellProps = {
  pageTitle: string
  children: ReactNode
}

/**
 * Optional shell for static legal layouts. Primary Privacy / Terms routes are
 * Payload `pages` with slugs `privacy-policy` and `terms-of-service` (see `npm run seed:legal-pages`).
 */
export async function LegalDocumentShell({
  pageTitle,
  children,
}: LegalDocumentShellProps) {
  const [navItems, settings] = await Promise.all([
    getHeaderNavItems(),
    getSiteSettingsCms(),
  ])
  const siteName = settings?.siteName || "My Studio Channel"
  const stickyHeaderEnabled = settings?.stickyHeader !== false

  return (
    <>
      <Header
        navItems={navItems}
        logoSrc={settings?.siteLogo}
        siteName={siteName}
        stickyHeader={stickyHeaderEnabled}
      />
      <main className="min-h-screen bg-background">
        <div className="overflow-x-clip">
          <div className="relative border-b border-white/10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.12),transparent_50%)]" />
            <div className="relative mx-auto max-w-3xl px-6 pt-24 pb-10 sm:pt-28 lg:px-8">
              <p className="mb-3 text-xs uppercase tracking-[0.25em] text-[#D4AF37]">
                Legal
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {pageTitle}
              </h1>
              <p className="mt-3 text-sm text-muted-foreground">
                Last updated: {LAST_UPDATED}
              </p>
              <Link
                href="/"
                className="mt-6 inline-flex text-sm font-medium text-[#D4AF37] transition-colors hover:text-[#e4c46b]"
              >
                ← Back to home
              </Link>
            </div>
          </div>
          <article className={`mx-auto max-w-3xl px-6 pt-10 lg:px-8 ${legalBodyClass}`}>
            {children}
          </article>
          <Footer logoSrc={settings?.siteLogo} siteName={siteName} />
        </div>
      </main>
    </>
  )
}
