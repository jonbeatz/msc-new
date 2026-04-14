/**
 * v1.0.24 — Isolated static route for the Homepage global.
 * Lives at `/admin/msc-homepage` (outside `globals/`) so Next.js never
 * confuses it with `globals/[slug]`. next.config.mjs redirects
 * `/admin/globals/homepage` → here.
 *
 * Root cause of the long-running 404: the `homepage` table was missing
 * the `is_styles_visible` column added with the `isStylesVisible` checkbox
 * field. Drizzle's SELECT failed with "no such column: is_styles_visible",
 * getDocumentData() silently returned null, and DocumentView threw
 * new Error('not-found'). Fix: npm run migrate:sqlite:homepage-is-styles-visible
 */
import config from "@payload-config"
import { RootPage } from "@payloadcms/next/views"
import { importMap } from "../importMap.js"

export const dynamic = "force-dynamic"

type Args = {
  searchParams: Promise<{ [key: string]: string | string[] }>
}

export default async function MscHomepageAdminPage(props: Args) {
  return RootPage({
    config: Promise.resolve(config),
    params: Promise.resolve({ segments: ["globals", "homepage"] }),
    searchParams: props.searchParams,
    importMap,
  })
}
