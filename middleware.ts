import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Single-segment slugs that must never rewrite to `/pages/:slug` (marketing CMS).
 * `/admin` is handled first via `pathname.startsWith("/admin")` so the CMS rewrite never runs.
 * Logic is **host-agnostic** (pathname only) — same behavior on `localhost`, `mystudiochannel.com`, or Spaceship.
 * Keep in sync with path roots: admin, api, _next, media (plus dev tools).
 * Static legal pages (privacy-policy, terms-of-service) are served by dedicated app/(site)/ routes.
 */
const RESERVED_PATHS = [
  "admin",
  "api",
  "_next",
  "media",
  "dev",
  "privacy-policy",
  "terms-of-service",
] as const

/**
 * URL prefixes for the same roots as {@link RESERVED_PATHS}, except `admin` (handled by `startsWith` only).
 */
const RESERVED_PATH_PREFIXES = ["/api", "/_next", "/media", "/dev"] as const

function pathnameMatchesReservedPrefix(pathname: string): boolean {
  return RESERVED_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
}

/**
 * Shared hosts / reverse proxies often cache HTML for `/` while `/api/*` stays fresh.
 * That matches "globals API shows v111 but homepage does not" — force no-store on document routes.
 */
function isDocumentPath(pathname: string): boolean {
  if (pathname === "/") return true
  if (pathname.startsWith("/api")) return false
  if (pathname.startsWith("/_next")) return false
  if (pathname.startsWith("/media/")) return false
  // Public files with extensions (e.g. robots.txt, files in /public)
  if (/\.[a-z0-9]{2,5}$/i.test(pathname)) return false
  return true
}

const RESERVED_SINGLE_SEGMENT = new Set<string>(RESERVED_PATHS)

/**
 * Map pretty URLs `/privacy-policy` → internal `/pages/privacy-policy` so `app/(site)/[slug]`
 * never competes with `/admin` (Payload). Browser URL stays `/privacy-policy`.
 */
function rewriteMarketingPageToPagesGroup(
  request: NextRequest,
): NextResponse | null {
  const { pathname } = request.nextUrl
  if (pathname.startsWith("/admin")) return null
  if (pathnameMatchesReservedPrefix(pathname)) return null
  if (pathname === "/" || pathname === "") return null

  const match = pathname.match(/^\/([^/]+)$/)
  if (!match) return null

  const segment = decodeURIComponent(match[1])
  if (segment.includes(".")) return null
  if (RESERVED_SINGLE_SEGMENT.has(segment)) return null

  const url = request.nextUrl.clone()
  url.pathname = `/pages/${encodeURIComponent(segment)}`
  return NextResponse.rewrite(url)
}

function nextWithDocumentCacheHeaders(pathname: string): NextResponse {
  if (!isDocumentPath(pathname)) {
    return NextResponse.next()
  }
  const res = NextResponse.next()
  res.headers.set(
    "Cache-Control",
    "private, no-cache, no-store, max-age=0, must-revalidate",
  )
  res.headers.set("Vary", "Cookie")
  return res
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // `/admin/.../` → `/admin/...` so `[...segments]` matches the same route as the no-slash URL.
  if (pathname.startsWith("/admin") && pathname.length > 1 && pathname.endsWith("/")) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.replace(/\/+$/, "") || "/"
    return NextResponse.redirect(url, 308)
  }

  // Payload admin: forward the pathname on the request so `admin/[...segments]` can recover
  // segments if Next ever omits `params.segments` (avoids Payload RootPage `notFound` for globals).
  // Always derive from `nextUrl` (never omit) — mirrors `request.url` path for proxies.
  if (pathname.startsWith("/admin")) {
    const requestHeaders = new Headers(request.headers)
    const pathForPayload =
      pathname || new URL(request.url).pathname || "/admin"
    requestHeaders.set("x-msc-request-pathname", pathForPayload)
    // Explicit slug for `admin/globals/*` — helps `[...segments]` recovery for non-static globals.
    const globalsSlugMatch = pathForPayload.match(/^\/admin\/globals\/([^/]+)\/?$/i)
    if (globalsSlugMatch?.[1]) {
      try {
        requestHeaders.set(
          "x-msc-admin-globals-slug",
          decodeURIComponent(globalsSlugMatch[1].trim()),
        )
      } catch {
        requestHeaders.set("x-msc-admin-globals-slug", globalsSlugMatch[1].trim())
      }
    }
    const res = NextResponse.next({
      request: { headers: requestHeaders },
    })
    if (isDocumentPath(pathname)) {
      res.headers.set(
        "Cache-Control",
        "private, no-cache, no-store, max-age=0, must-revalidate",
      )
      res.headers.set("Vary", "Cookie")
    }
    return res
  }

  if (process.env.MSC_DEBUG_MIDDLEWARE === "1") {
    console.log("[msc] Middleware hit:", pathname)
  }
  if (pathnameMatchesReservedPrefix(pathname)) {
    return nextWithDocumentCacheHeaders(pathname)
  }

  const rewritten = rewriteMarketingPageToPagesGroup(request)
  if (rewritten) {
    if (!isDocumentPath(pathname)) {
      return rewritten
    }
    rewritten.headers.set(
      "Cache-Control",
      "private, no-cache, no-store, max-age=0, must-revalidate",
    )
    rewritten.headers.set("Vary", "Cookie")
    return rewritten
  }

  return nextWithDocumentCacheHeaders(pathname)
}

export const config = {
  matcher: [
    /*
     * Never run on `/_next/*` (includes dev HMR, `/_next/static/chunks/fallback/*`, CSS, fonts) or `/api/*`.
     * Single `_next/` prefix avoids path-to-regexp edge cases that could still match some `/_next/...` requests.
     */
    "/((?!api/|_next/|favicon\\.ico).*)",
  ],
}
