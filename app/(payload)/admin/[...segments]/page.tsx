/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD (pattern updated for route precedence). */
import type { Metadata } from "next"

import config from "@payload-config"
import {
  normalizeAdminSegmentParams,
  resolvePayloadAdminRouteSegments,
} from "@/lib/payload-normalize-admin-params"
import { RootPage, generatePageMetadata } from "@payloadcms/next/views"
import { importMap } from "../importMap.js"

/** Avoid any static caching oddities for Payload admin sub-routes (e.g. globals). */
export const dynamic = "force-dynamic"

const configPromise = Promise.resolve(config)

type Args = {
  params: Promise<{
    segments?: string[] | string
  }>
  searchParams: Promise<{
    [key: string]: string | string[]
  }>
}

export async function generateMetadata(props: Args): Promise<Metadata> {
  const resolvedParams = await props.params
  return generatePageMetadata({
    config: configPromise,
    params: normalizeAdminSegmentParams(resolvedParams),
    searchParams: props.searchParams,
  })
}

export default async function AdminSegmentsPage(props: Args) {
  const resolvedParams = await props.params
  const segments = await resolvePayloadAdminRouteSegments(resolvedParams)
  return RootPage({
    config: configPromise,
    params: Promise.resolve({ segments }),
    searchParams: props.searchParams,
    importMap,
  })
}
