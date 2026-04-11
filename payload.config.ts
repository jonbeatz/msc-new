import path from "path"
import type { Field } from "payload"
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

/** Site origin for admin previews and Payload internals. Public asset URLs use relative `/media/...` via Media `afterRead`. */
const serverURL = (
  process.env.NEXT_PUBLIC_SERVER_URL?.trim() ||
  process.env.PAYLOAD_PUBLIC_SERVER_URL?.trim() ||
  "http://localhost:3000"
).replace(/\/+$/, "")

/**
 * Cookie auth (login / refresh-token / logout) checks `Origin` against this list.
 * If `.env` still points at production but you browse `localhost` or `127.0.0.1`, requests 403 without these.
 * @see https://payloadcms.com/docs/authentication/cookies
 */
const csrf: string[] = Array.from(
  new Set([
    serverURL,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ]),
)

type SiteSettingsData = {
  siteName?: string | null
  tagline?: string | null
}

function pageHeroDataFromDoc(doc: Record<string, unknown> | null | undefined) {
  if (!doc) return null
  const ph = doc.pageHero
  if (Array.isArray(ph) && ph.length > 0) {
    const row = ph[0]
    if (row && typeof row === "object") return row as Record<string, unknown>
    return null
  }
  if (ph && typeof ph === "object" && !Array.isArray(ph)) {
    return ph as Record<string, unknown>
  }
  return null
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
  serverURL,
  csrf,
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
      /**
       * Payload maps `Logo` → login screen, `Icon` → navigation/sidebar (see `Config.admin.components.graphics` in payload types).
       * Both use `public/media/msc-icon.png` via unified `/media/` URLs.
       */
      graphics: {
        Logo: "@/components/msc-payload-graphics#MscPayloadAdminLogo",
        Icon: "@/components/msc-payload-graphics#MscPayloadAdminIcon",
      },
      providers: ["@/components/msc-payload-admin-enhancements#MscPayloadAdminEnhancements"],
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
  // Spaceship/cPanel: set PAYLOAD_DISABLE_SHARP=true when native sharp binaries are unavailable.
  ...(process.env.PAYLOAD_DISABLE_SHARP === "true" ? {} : { sharp }),
  plugins: [
    seoPlugin({
      collections: ["pages"],
      uploadsCollection: "media",
      tabbedUI: true,
      // Plugin defaults set `localized: true` on meta title/description/image. This project does
      // not use Payload localization; leaving them localized can break saves from the admin UI.
      fields: ({ defaultFields }) =>
        defaultFields.map((field) => {
          let next = field as Field
          if (
            typeof field === "object" &&
            field !== null &&
            "localized" in field &&
            (field as { localized?: boolean }).localized === true
          ) {
            next = { ...field, localized: false } as Field
          }
          // Empty meta must not block saves; Overview "issues" are advisory, not required input.
          if (
            typeof next === "object" &&
            next !== null &&
            "name" in next &&
            typeof (next as { name?: string }).name === "string" &&
            ["title", "description", "image"].includes(
              (next as { name: string }).name,
            )
          ) {
            next = { ...next, required: false } as Field
          }
          // Hide scorecard + preview UI (advisory only); keeps the SEO tab from surfacing ghost "issues".
          if (
            typeof next === "object" &&
            next !== null &&
            "name" in next &&
            typeof (next as { name?: string }).name === "string" &&
            ["overview", "preview"].includes((next as { name: string }).name)
          ) {
            next = {
              ...next,
              admin: {
                ...(typeof (next as { admin?: object }).admin === "object"
                  ? (next as { admin?: Record<string, unknown> }).admin
                  : {}),
                condition: () => false,
              },
            } as Field
          }
          return next
        }),
      generateTitle: async ({ doc, req }) => {
        const fallback = await getSiteSettingsFallback(req)
        const siteName = fallback.siteName || "My Studio Channel"
        const d =
          doc && typeof doc === "object"
            ? (doc as Record<string, unknown>)
            : null
        const hero = pageHeroDataFromDoc(d)
        const pageTitle =
          (d && typeof d.title === "string" && d.title) ||
          (hero &&
            typeof hero.headlineLine1 === "string" &&
            hero.headlineLine1) ||
          siteName
        return `${pageTitle} | ${siteName}`
      },
      generateDescription: async ({ doc, req }) => {
        const fallback = await getSiteSettingsFallback(req)
        const d =
          doc && typeof doc === "object"
            ? (doc as Record<string, unknown>)
            : null
        const hero = pageHeroDataFromDoc(d)
        return (
          (d && typeof d.description === "string" && d.description) ||
          (hero && typeof hero.sub === "string" && hero.sub) ||
          fallback.tagline ||
          "My Studio Channel"
        )
      },
    }),
  ],
})
