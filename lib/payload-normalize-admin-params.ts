import { cookies, headers } from "next/headers"

/** Canonical Payload admin URL for the Homepage global editor. */
const HOMEPAGE_GLOBAL_ADMIN_PATH = "/admin/globals/homepage"

function isHomepageGlobalsEditorPathname(
  pathname: string | null | undefined,
): boolean {
  const pathOnly = pathname?.split("?")[0]?.replace(/\/+$/, "") ?? ""
  return pathOnly.toLowerCase() === HOMEPAGE_GLOBAL_ADMIN_PATH
}

/** Payload session cookie names (v3 + common secure variants). */
async function readPayloadTokenCookie(): Promise<string | undefined> {
  try {
    const jar = await cookies()
    const names = [
      "payload-token",
      "__Secure-payload-token",
      "__Host-payload-token",
    ] as const
    for (const name of names) {
      const v = jar.get(name)?.value
      if (typeof v === "string" && v.length > 0) return v
    }
  } catch {
    /* outside request context */
  }
  return undefined
}

/**
 * v1.0.21: logged-in (or partially logged-in) session on the Homepage global URL → always
 * `['globals','homepage']` so Payload `RootPage` never hits `notFound()` from bad `params`.
 */
export async function authAwareHomepageGlobalsSegments(
  pathname: string | null | undefined,
): Promise<string[] | null> {
  if (!isHomepageGlobalsEditorPathname(pathname)) return null
  if (await readPayloadTokenCookie()) {
    return ["globals", "homepage"]
  }
  return null
}

/**
 * Payload `RootPage` matches `segments[0] === "globals"` / `"collections"` for paths **under**
 * `/admin` only. If Next ever passes a leading `"admin"` (e.g. `["admin","globals","homepage"]`),
 * globals never resolve → `notFound()` (often only when logged in). Strip the prefix.
 */
export function stripAdminSegmentPrefix(segments: string[]): string[] {
  const out = [...segments]
  while (out.length > 0 && out[0] === "admin") {
    out.shift()
  }
  return out
}

/**
 * Trim each segment, drop empties, strip leading `admin` until `globals` / `collections` wins.
 * Call this on every `params.segments` array passed into Payload `RootPage` / metadata.
 */
export function finalizePayloadRootSegments(segments: string[]): string[] {
  const trimmed = segments.map((s) => String(s).trim()).filter(Boolean)
  return stripAdminSegmentPrefix(trimmed)
}

/**
 * Payload admin: `app/(payload)/admin/page.tsx` (dashboard) + `admin/[...segments]/page.tsx`.
 * `RootPage` expects `params.segments` as `string[]` (e.g. `["globals","homepage"]`).
 *
 * Next.js 15+ passes `params` as a Promise; catch-all `[...segments]` should set `segments` to
 * `string[]` (or occasionally a single string). Coerce defensively so Payload never sees `[]`
 * when the URL clearly has segments (which would trigger `notFound()` for globals).
 */
export function parseAdminRouteSegments(params: unknown): string[] {
  if (!params || typeof params !== "object") return []
  const p = params as Record<string, unknown>
  const raw = p.segments
  if (Array.isArray(raw)) {
    return stripAdminSegmentPrefix(
      raw.map((s) => String(s).trim()).filter(Boolean),
    )
  }
  if (typeof raw === "string") {
    return stripAdminSegmentPrefix(
      raw.split("/").map((s) => s.trim()).filter(Boolean),
    )
  }
  // Fallback: some Next builds only expose the catch-all under the dynamic key name — pick the first string[].
  for (const v of Object.values(p)) {
    if (
      Array.isArray(v) &&
      v.length > 0 &&
      v.every((x) => typeof x === "string")
    ) {
      return stripAdminSegmentPrefix(v.map((s) => s.trim()).filter(Boolean))
    }
  }
  return []
}

/** `/admin/globals/homepage` → `["globals","homepage"]` (no leading "admin"). */
function segmentsFromAdminPathname(pathname: string): string[] {
  const base = "/admin"
  if (!pathname.startsWith(base)) return []
  const rest = pathname.slice(base.length).replace(/^\/+/, "").replace(/\/+$/, "")
  if (!rest) return []
  return rest
    .split("/")
    .map((s) => decodeURIComponent(s.trim()))
    .filter(Boolean)
}

/**
 * v1.0.20 nuclear: if middleware pathname is the canonical Homepage global editor URL, return
 * segments immediately — bypasses empty/malformed `params` so Payload never hits `notFound()`.
 * Does not match `/admin/globals/homepage/versions` (etc.); those need full segment lists.
 */
export function nuclearHomepageGlobalsSegmentsFromPathname(
  pathname: string | null | undefined,
): string[] | null {
  const raw = pathname?.trim()
  if (!raw) return null
  const pathOnly = raw.split("?")[0]?.replace(/\/+$/, "") ?? ""
  const lower = pathOnly.toLowerCase()
  const needle = HOMEPAGE_GLOBAL_ADMIN_PATH
  if (!lower.includes(needle)) return null
  const i = lower.indexOf(needle)
  const after = pathOnly.slice(i + needle.length)
  // Only the editor URL (`…/homepage` or `…/homepage/`), not `…/homepage/versions`, etc.
  if (after === "" || after === "/") {
    return ["globals", "homepage"]
  }
  return null
}

/** v1.0.19: if URL is clearly Site → Homepage global, force Payload segments (emergency 404 fix). */
function emergencyHomepageGlobalsSegments(
  segments: string[],
  pathname: string | null | undefined,
): string[] {
  const raw = pathname?.trim() ?? ""
  if (!raw) return segments
  const pathOnly = raw.split("?")[0]?.replace(/\/+$/, "") ?? ""
  const lower = pathOnly.toLowerCase()
  const isHomepageGlobal =
    lower === HOMEPAGE_GLOBAL_ADMIN_PATH.toLowerCase() ||
    lower.includes(`${HOMEPAGE_GLOBAL_ADMIN_PATH}/`)
  if (!isHomepageGlobal) return segments
  const ok =
    segments.length >= 2 &&
    segments[0] === "globals" &&
    segments[1].toLowerCase() === "homepage"
  if (ok) return segments
  return ["globals", "homepage"]
}

/**
 * Prefer `params.segments`; if empty, fall back to {@link middleware.ts} `x-msc-request-pathname`
 * so Payload always receives real segments for `/admin/globals/:slug` after updates/HMR edge cases.
 */
export async function resolvePayloadAdminRouteSegments(
  params: unknown,
): Promise<string[]> {
  let segments = parseAdminRouteSegments(params)
  let pathname: string | null | undefined
  let globalsSlugFromMw: string | null | undefined
  try {
    const h = await headers()
    pathname = h.get("x-msc-request-pathname")
    const authPinned = await authAwareHomepageGlobalsSegments(pathname)
    if (authPinned) {
      return authPinned
    }
    const nuclear = nuclearHomepageGlobalsSegmentsFromPathname(pathname)
    if (nuclear) {
      return nuclear
    }
    globalsSlugFromMw = h.get("x-msc-admin-globals-slug")?.trim() || undefined
    if (segments.length === 0 && pathname) {
      const fromPath = segmentsFromAdminPathname(pathname)
      if (fromPath.length > 0) {
        segments = stripAdminSegmentPrefix(fromPath)
      }
    }
    if (
      globalsSlugFromMw &&
      (segments.length < 2 || segments[0] !== "globals")
    ) {
      segments = stripAdminSegmentPrefix([
        "globals",
        globalsSlugFromMw.toLowerCase(),
      ])
    }
  } catch {
    /* outside request context */
  }
  return finalizePayloadRootSegments(
    emergencyHomepageGlobalsSegments(segments, pathname),
  )
}

export async function normalizeAdminSegmentParams(
  params:
    | Promise<{ segments?: string[] | string }>
    | { segments?: string[] | string },
): Promise<{ segments: string[] }> {
  const p = await Promise.resolve(params)
  const segments = await resolvePayloadAdminRouteSegments(p)
  return { segments }
}

/**
 * When `admin/globals/[slug]` params are empty (HMR / edge param bugs), recover the slug from
 * {@link middleware.ts} `x-msc-request-pathname` so we never pass `[]` into Payload.
 */
export async function recoverAdminGlobalSlugFromPathname(
  preferred: string | string[] | undefined,
): Promise<string> {
  let h: Awaited<ReturnType<typeof headers>> | null = null
  try {
    h = await headers()
  } catch {
    h = null
  }

  if (h) {
    const fromMw = h.get("x-msc-admin-globals-slug")?.trim()
    if (fromMw) {
      try {
        return decodeURIComponent(fromMw)
      } catch {
        return fromMw
      }
    }
  }

  const first = Array.isArray(preferred) ? preferred[0] : preferred
  if (typeof first === "string" && first.trim()) {
    try {
      return decodeURIComponent(first.trim())
    } catch {
      return first.trim()
    }
  }

  if (h) {
    const raw = h.get("x-msc-request-pathname") ?? ""
    const pathOnly = raw.split("?")[0]?.replace(/\/+$/, "") ?? ""
    const m = pathOnly.match(/\/admin\/globals\/([^/?#]+)/i)
    if (m?.[1]) {
      try {
        return decodeURIComponent(m[1].trim())
      } catch {
        return m[1].trim()
      }
    }
  }
  return ""
}
