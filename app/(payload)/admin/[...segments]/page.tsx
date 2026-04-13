/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD (pattern updated for route precedence). */
import type { Metadata } from "next"

import config from "@payload-config"
import {
  normalizeAdminSegmentParams,
  parseAdminRouteSegments,
} from "@/lib/payload-normalize-admin-params"
import { RootPage, generatePageMetadata } from "@payloadcms/next/views"
import { importMap } from "../importMap.js"

/** Avoid any static caching oddities for Payload admin sub-routes (e.g. globals). */
export const dynamic = "force-dynamic"

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
    config,
    params: normalizeAdminSegmentParams(resolvedParams),
    searchParams: props.searchParams,
  })
}

export default async function AdminSegmentsPage(props: Args) {
  const resolvedParams = await props.params
  console.log("DEBUG ADMIN ROUTE:", resolvedParams.segments)
  const segments = parseAdminRouteSegments(resolvedParams)
  if (process.env.NODE_ENV === "development") {
    console.log("[payload admin] parsed segments:", segments, "| raw params:", resolvedParams)
  }
  return RootPage({
    config,
    params: Promise.resolve({ segments }),
    searchParams: props.searchParams,
    importMap,
  })
}
