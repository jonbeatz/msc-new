import path from "path"
import { buildConfig } from "payload"
import { sqliteAdapter } from "@payloadcms/db-sqlite"
import { resendAdapter } from "@payloadcms/email-resend"
import { seoPlugin } from "@payloadcms/plugin-seo"
import { lexicalEditor } from "@payloadcms/richtext-lexical"
import sharp from "sharp"

import { Users } from "./collections/Users"
import { Media } from "./collections/Media"
import { Bookings } from "./collections/Bookings"
import { Leads } from "./collections/Leads"
import { Pages } from "./collections/Pages"
import { Homepage } from "./globals/Homepage"
import { HeaderGlobal } from "./globals/Header"
import { ProjectsGlobal } from "./globals/Projects"
import { SiteSettings } from "./globals/SiteSettings"

const sqliteUrl = process.env.DATABASE_URL || "file:./payload.sqlite"

type SiteSettingsData = {
  siteName?: string | null
  tagline?: string | null
}

async function getSiteSettingsFallback(req: Parameters<NonNullable<Parameters<typeof seoPlugin>[0]["generateTitle"]>>[0]["req"]): Promise<SiteSettingsData> {
  try {
    return (await req.payload.findGlobal({
      slug: "site-settings",
      req,
      depth: 0,
    })) as SiteSettingsData
  } catch {
    return {}
  }
}

export default buildConfig({
  email: resendAdapter({
    apiKey: process.env.RESEND_API_KEY || "",
    defaultFromAddress: "onboarding@resend.dev",
    defaultFromName: "My Studio Channel",
  }),
  admin: {
    user: Users.slug,
    // Lock admin to dark UI (no light / system toggle).
    theme: "dark",
    // Brave/Chrome extensions often inject attributes on <html> (e.g. webcrx).
    // Stops false hydration mismatch warnings in dev.
    suppressHydrationWarning: true,
    components: {
      beforeNavLinks: ["@/components/msc-payload-nav-dashboard#MscPayloadNavDashboard"],
      afterNavLinks: ["@/components/msc-payload-nav-logout#MscPayloadNavLogout"],
    },
    importMap: {
      baseDir: path.resolve(process.cwd()),
    },
  },
  collections: [Users, Media, Bookings, Leads, Pages],
  globals: [Homepage, HeaderGlobal, ProjectsGlobal, SiteSettings],
  editor: lexicalEditor(),
  // Must be set in production via PAYLOAD_SECRET (.env.local).
  secret: process.env.PAYLOAD_SECRET || "dev-only-change-me-in-env",
  typescript: {
    outputFile: path.resolve(process.cwd(), "payload-types.ts"),
  },
  db: sqliteAdapter({
    push: false,
    client: {
      url: sqliteUrl,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    },
    wal: true,
  }),
  sharp,
  plugins: [
    seoPlugin({
      collections: ["pages"],
      uploadsCollection: "media",
      tabbedUI: true,
      generateTitle: async ({ doc, req }) => {
        const fallback = await getSiteSettingsFallback(req)
        const siteName = fallback.siteName || "My Studio Channel"
        const pageTitle =
          (typeof doc?.title === "string" && doc.title) ||
          (typeof doc?.headlineLine1 === "string" && doc.headlineLine1) ||
          siteName
        return `${pageTitle} | ${siteName}`
      },
      generateDescription: async ({ doc, req }) => {
        const fallback = await getSiteSettingsFallback(req)
        return (
          (typeof doc?.description === "string" && doc.description) ||
          (typeof doc?.sub === "string" && doc.sub) ||
          fallback.tagline ||
          "My Studio Channel"
        )
      },
    }),
  ],
})
