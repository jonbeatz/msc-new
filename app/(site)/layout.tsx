import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "../globals.css"
import { getSiteSettingsCms } from "@/lib/cms/site-settings"
import { getHomepageActiveSlideSeo } from "@/lib/cms/homepage"
import { ScrollToTop } from "@/components/scroll-to-top"
import { HomeHashScroll } from "@/components/home-hash-scroll"

/** CMS-backed routes: no full route cache; no fetch/Data cache defaults that could stale Payload reads on shared hosting. */
export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["300", "400", "500", "600", "700", "800"],
})

const defaultDescription =
  "We build studio-style websites that give creators the look and structure of a major network—powered by a custom plugin and professional video setup."
const metadataBaseURL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000"

export async function generateMetadata(): Promise<Metadata> {
  const [settings, slideSeo] = await Promise.all([
    getSiteSettingsCms(),
    getHomepageActiveSlideSeo(),
  ])

  const siteName = settings?.siteName || "My Studio Channel"
  const titleSuffix =
    settings?.siteTitleSuffix && settings.siteTitleSuffix.trim().length > 0
      ? settings.siteTitleSuffix.trim()
      : `| ${siteName}`
  const homeFallbackTitle = `${siteName} | Professional Creator Platforms`
  const titleFromSlide = slideSeo?.title
    ? `${slideSeo.title} ${titleSuffix}`.trim()
    : homeFallbackTitle
  const descriptionFromSlide =
    slideSeo?.description || settings?.tagline || defaultDescription
  const defaultOgImage = settings?.ogImage || slideSeo?.image || undefined

  return {
    metadataBase: new URL(metadataBaseURL),
    title: titleFromSlide,
    description: descriptionFromSlide,
    icons: settings?.favicon
      ? {
          icon: settings.favicon,
          shortcut: settings.favicon,
          apple: settings.favicon,
        }
      : undefined,
    openGraph: {
      title: titleFromSlide,
      description: descriptionFromSlide,
      images: defaultOgImage ? [defaultOgImage] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: titleFromSlide,
      description: descriptionFromSlide,
      images: defaultOgImage ? [defaultOgImage] : undefined,
    },
    generator: "v0.app",
  }
}

export default function SiteRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={montserrat.variable} suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        {children}
        <HomeHashScroll />
        <ScrollToTop />
        {process.env.NODE_ENV === "production" &&
          process.env.VERCEL === "1" && <Analytics />}
      </body>
    </html>
  )
}
