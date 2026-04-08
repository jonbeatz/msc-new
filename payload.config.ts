import path from "path"
import { buildConfig } from "payload"
import { sqliteAdapter } from "@payloadcms/db-sqlite"
import { lexicalEditor } from "@payloadcms/richtext-lexical"
import sharp from "sharp"

import { Users } from "./collections/Users"
import { Media } from "./collections/Media"
import { Bookings } from "./collections/Bookings"
import { Leads } from "./collections/Leads"
import { Homepage } from "./globals/Homepage"
import { SiteSettings } from "./globals/SiteSettings"

const sqliteUrl = process.env.DATABASE_URL || "file:./payload.sqlite"

export default buildConfig({
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
  collections: [Users, Media, Bookings, Leads],
  globals: [Homepage, SiteSettings],
  editor: lexicalEditor(),
  // Must be set in production via PAYLOAD_SECRET (.env.local).
  secret: process.env.PAYLOAD_SECRET || "dev-only-change-me-in-env",
  typescript: {
    outputFile: path.resolve(process.cwd(), "payload-types.ts"),
  },
  db: sqliteAdapter({
    client: {
      url: sqliteUrl,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    },
    wal: true,
  }),
  sharp,
  plugins: [],
})
