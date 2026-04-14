/**
 * Explicit `/admin` leaf route for Payload. Marketing CMS pages live under `app/(site)/pages/[slug]`
 * with middleware rewriting `/{slug}` → `/pages/{slug}` so `/admin` is never a CMS slug.
 */
import type { Metadata } from "next"

import config from "@payload-config"
import { RootPage, generatePageMetadata } from "@payloadcms/next/views"
import { importMap } from "./importMap.js"

const configPromise = Promise.resolve(config)

type Args = {
  searchParams: Promise<{
    [key: string]: string | string[]
  }>
}

/**
 * Must not pass `segments: []`: RootPage builds `path` as `/${segments.join("/")}` which becomes
 * `/`, and `formatAdminURL` then yields `/admin/` while `routes.admin` is `/admin`, so the dashboard
 * view never matches and Payload calls `notFound()`. Omit `segments` so `path` is null → `/admin`.
 */
const dashboardParams = Promise.resolve({}) as Promise<{
  segments: string[]
}>

export const generateMetadata = ({
  searchParams,
}: Args): Promise<Metadata> =>
  generatePageMetadata({
    config: configPromise,
    params: dashboardParams,
    searchParams,
  })

export default function AdminDashboardPage({ searchParams }: Args) {
  return RootPage({
    config: configPromise,
    params: dashboardParams,
    searchParams,
    importMap,
  })
}
