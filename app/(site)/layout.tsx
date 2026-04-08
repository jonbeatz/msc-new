import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "../globals.css"
import { getSiteSettingsCms } from "@/lib/cms/site-settings"

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["300", "400", "500", "600", "700", "800"],
})

const defaultTitle = "My Studio Channel | Professional Creator Platforms"
const defaultDescription =
  "We build studio-style websites that give creators the look and structure of a major network—powered by a custom plugin and professional video setup."

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettingsCms()
  if (!settings) {
    return {
      title: defaultTitle,
      description: defaultDescription,
      generator: "v0.app",
    }
  }
  return {
    title: `${settings.siteName} | Professional Creator Platforms`,
    description: settings.tagline ?? defaultDescription,
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
