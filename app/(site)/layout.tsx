import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "../globals.css"
import { getSiteSettingsCms } from "@/lib/cms/site-settings"
import { getHomepageActiveSlideSeo } from "@/lib/cms/homepage"

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["300", "400", "500", "600", "700", "800"],
})

const defaultTitle = "My Studio Channel | Professional Creator Platforms"
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
  const titleFromSlide = slideSeo?.title
    ? `${slideSeo.title} | ${siteName}`
    : `${siteName} | Professional Creator Platforms`
  const descriptionFromSlide =
    slideSeo?.description || settings?.tagline || defaultDescription

  return {
    metadataBase: new URL(metadataBaseURL),
    title: titleFromSlide,
    description: descriptionFromSlide,
    openGraph: {
      title: titleFromSlide,
      description: descriptionFromSlide,
      images: slideSeo?.image ? [slideSeo.image] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: titleFromSlide,
      description: descriptionFromSlide,
      images: slideSeo?.image ? [slideSeo.image] : undefined,
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
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
