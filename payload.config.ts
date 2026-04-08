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
import { HeroSlides } from "./collections/HeroSlides"
import { Homepage } from "./globals/Homepage"
import { HeaderGlobal } from "./globals/Header"
import { SiteSettings } from "./globals/SiteSettings"

const sqliteUrl = process.env.DATABASE_URL || "file:./payload.sqlite"

type SiteSettingsData = {
  siteName?: string | null
  tagline?: string | null
}

async function backfillHeroSlidesSEO(payload: {
  find: Function
  update: Function
}): Promise<void> {
  const result = await payload.find({
    collection: "hero-slides",
    depth: 0,
    limit: 200,
    pagination: false,
  })

  const docs = Array.isArray(result?.docs) ? result.docs : []
  for (const doc of docs) {
    const meta =
      doc && typeof doc.meta === "object" && doc.meta !== null
        ? (doc.meta as Record<string, unknown>)
        : {}

    const titlePresent =
      typeof meta.title === "string" && meta.title.trim().length > 0
    const descriptionPresent =
      typeof meta.description === "string" && meta.description.trim().length > 0
    const imagePresent = meta.image !== null && meta.image !== undefined

    if (titlePresent && descriptionPresent && imagePresent) continue

    await payload.update({
      collection: "hero-slides",
      id: doc.id,
      depth: 0,
      data: {
        meta: {
          title: titlePresent
            ? meta.title
            : typeof doc.headlineLine1 === "string"
              ? doc.headlineLine1
              : "",
          description: descriptionPresent
            ? meta.description
            : typeof doc.sub === "string"
              ? doc.sub
              : "",
          image: imagePresent ? meta.image : doc.image ?? undefined,
        },
      },
    })
  }
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
      afterNavLinks: ["@/components/msc-payload-nav-logout#MscPayloadNavLogout"],
    },
    importMap: {
      baseDir: path.resolve(process.cwd()),
    },
  },
  collections: [Users, Media, Bookings, Leads, Pages, HeroSlides],
  globals: [Homepage, HeaderGlobal, SiteSettings],
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
      collections: ["pages", "hero-slides"],
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
  onInit: async (payload) => {
    try {
      await backfillHeroSlidesSEO(payload)
    } catch (error) {
      payload.logger.warn(
        `[seo-backfill] hero-slides metadata initialization skipped: ${
          error instanceof Error ? error.message : "unknown error"
        }`
      )
    }
  },
})
