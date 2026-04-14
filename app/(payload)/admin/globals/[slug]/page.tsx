/**
 * Dedicated route for `/admin/globals/:slug` (e.g. homepage).
 * Next.js matches this before `admin/[...segments]`, so `params.slug` is always present —
 * avoids Payload RootPage `notFound()` when the catch-all omits or mis-parses `segments`
 * after HMR or on some browsers.
 */
import type { Metadata } from "next"
import { headers } from "next/headers"
import { notFound } from "next/navigation"

import config from "@payload-config"
import {
  authAwareHomepageGlobalsSegments,
  finalizePayloadRootSegments,
  normalizeAdminSegmentParams,
  nuclearHomepageGlobalsSegmentsFromPathname,
  recoverAdminGlobalSlugFromPathname,
} from "@/lib/payload-normalize-admin-params"
import { RootPage, generatePageMetadata } from "@payloadcms/next/views"
import { importMap } from "../../importMap.js"

export const dynamic = "force-dynamic"
/** Payload admin expects async config in some code paths — keep a real Promise. */
const configPromise = Promise.resolve(config)

type Args = {
  params: Promise<{ slug?: string | string[] }>
  searchParams: Promise<{ [key: string]: string | string[] }>
}

function slugToGlobalsSegments(one: string): string[] {
  const trimmed = one.trim()
  if (!trimmed) return []
  let decoded = trimmed
  try {
    decoded = decodeURIComponent(trimmed)
  } catch {
    /* keep trimmed */
  }
  // Payload global slugs are lowercase in config; Windows/browsers may vary casing in the URL.
  const slug = decoded.toLowerCase()
  return finalizePayloadRootSegments(["globals", slug])
}

async function segmentsForGlobalsPage(
  slug: string | string[] | undefined,
): Promise<string[]> {
  try {
    const pathname = (await headers()).get("x-msc-request-pathname")
    const auth = await authAwareHomepageGlobalsSegments(pathname)
    if (auth) return auth
    const nuclear = nuclearHomepageGlobalsSegmentsFromPathname(pathname)
    if (nuclear) return nuclear
  } catch {
    /* no request context */
  }
  const resolved = await recoverAdminGlobalSlugFromPathname(slug)
  if (!resolved) return []
  return slugToGlobalsSegments(resolved)
}

export async function generateMetadata(props: Args): Promise<Metadata> {
  const { slug } = await props.params
  const segments = await segmentsForGlobalsPage(slug)
  if (segments.length !== 2) {
    // Do not call `notFound()` here — Next would show the generic 404 for metadata-only failures.
    return { title: "Admin" }
  }
  try {
    return await generatePageMetadata({
      config: configPromise,
      params: normalizeAdminSegmentParams(Promise.resolve({ segments })),
      searchParams: props.searchParams,
    })
  } catch {
    return { title: "Admin" }
  }
}

const FALLBACK_HOMEPAGE_GLOBAL_SEGMENTS = ["globals", "homepage"] as const

export default async function AdminGlobalsBySlugPage(props: Args) {
  const { slug } = await props.params
  let segments = await segmentsForGlobalsPage(slug)
  if (process.env.NODE_ENV !== "production") {
    console.log("[msc] SERVER-SIDE SEGMENTS (admin/globals)", {
      segments,
      slug,
    })
  }
  if (segments.length === 0) {
    segments = [...FALLBACK_HOMEPAGE_GLOBAL_SEGMENTS]
    if (process.env.NODE_ENV !== "production") {
      console.log("[msc] SERVER-SIDE SEGMENTS empty → forced homepage global", {
        segments,
      })
    }
  }
  if (segments.length !== 2) {
    notFound()
  }
  return RootPage({
    config: configPromise,
    params: Promise.resolve({ segments }),
    searchParams: props.searchParams,
    importMap,
  })
}
