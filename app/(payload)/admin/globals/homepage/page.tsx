/**
 * v1.0.22: Static route for `/admin/globals/homepage` — no `[slug]` dynamic segment.
 * Hard-coded segments so Payload `RootPage` never depends on `params.slug` or segment resolvers.
 */
import type { Metadata } from "next"

import config from "@payload-config"
import { RootPage, generatePageMetadata } from "@payloadcms/next/views"
import { importMap } from "../../importMap.js"

export const dynamic = "force-dynamic"

const configPromise = Promise.resolve(config)

const HOMEPAGE_GLOBAL_SEGMENTS = ["globals", "homepage"] as const

type Args = {
  searchParams: Promise<{ [key: string]: string | string[] }>
}

export async function generateMetadata(props: Args): Promise<Metadata> {
  return generatePageMetadata({
    config: configPromise,
    params: Promise.resolve({ segments: [...HOMEPAGE_GLOBAL_SEGMENTS] }),
    searchParams: props.searchParams,
  })
}

export default async function AdminGlobalsHomepagePage(props: Args) {
  return RootPage({
    config: configPromise,
    params: Promise.resolve({ segments: [...HOMEPAGE_GLOBAL_SEGMENTS] }),
    searchParams: props.searchParams,
    importMap,
  })
}
