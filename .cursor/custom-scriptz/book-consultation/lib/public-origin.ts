import { getCanonicalSiteOriginFallback } from "./site-origin-defaults"

function normalizeOriginString(raw: string): string {
  const fallback = getCanonicalSiteOriginFallback()
  if (!raw) return fallback
  const cleaned = raw.replace(/\/+$/, "")
  try {
    const u = new URL(cleaned)
    if (u.protocol !== "http:" && u.protocol !== "https:") return fallback
    return cleaned
  } catch {
    return fallback
  }
}

/**
 * Payload CSRF allowlist: every distinct origin from env that should accept admin cookies.
 * No hardcoded hosts — local dev is covered when `NEXT_PUBLIC_SERVER_URL` (or extras) includes it.
 */
export function buildPayloadCsrfOriginList(primaryServerUrl: string): string[] {
  const set = new Set<string>()
  const add = (s: string | undefined) => {
    const t = s?.trim()
    if (!t) return
    set.add(t.replace(/\/+$/, ""))
  }
  add(primaryServerUrl)
  add(process.env.NEXT_PUBLIC_SERVER_URL)
  add(process.env.PAYLOAD_PUBLIC_SERVER_URL)
  const extras = process.env.PAYLOAD_CSRF_EXTRA_ORIGINS?.split(",") ?? []
  for (const x of extras) add(x)
  return [...set]
}

/**
 * Canonical public origin for server-only code: emails, `generateMetadata`, Payload `serverURL`,
 * and any absolute URL built outside `"use client"` trees.
 *
 * Order (keep in sync with `payload.config.ts`):
 * 1. `PAYLOAD_PUBLIC_SERVER_URL` — runtime on cPanel / Node (often preferred for live email links).
 * 2. `NEXT_PUBLIC_SERVER_URL` — build-time / local `.env.local` (set to **`http://localhost:3000`**
 *    for Cursor dev so metadata and email links match your dev origin).
 * 3. `MSC_CANONICAL_SITE_ORIGIN` or default `https://mystudiochannel.com` — production-safe fallback
 *    when both are unset (no hardcoded localhost in code). On Live (cPanel), set
 *    **`PAYLOAD_PUBLIC_SERVER_URL`** and/or **`NEXT_PUBLIC_SERVER_URL`** to **`https://mystudiochannel.com`**.
 *
 * Client Components: use {@link getPublicOriginClient} so SSR and the browser bundle match.
 */
export function getPublicOrigin(): string {
  return normalizeOriginString(
    process.env.PAYLOAD_PUBLIC_SERVER_URL?.trim() ||
      process.env.NEXT_PUBLIC_SERVER_URL?.trim() ||
      "",
  )
}

/**
 * Client-safe origin (`NEXT_PUBLIC_*` only). If unset, same canonical fallback as server so
 * production builds never hydrate with a mismatched host. Local dev: set `NEXT_PUBLIC_SERVER_URL`
 * in `.env.local`.
 */
export function getPublicOriginClient(): string {
  return normalizeOriginString(process.env.NEXT_PUBLIC_SERVER_URL?.trim() || "")
}

/**
 * Absolute URL for a same-origin path (e.g. `/api/leads/verify/...`).
 */
export function resolvePublicUrl(pathname: string): string {
  const origin = getPublicOrigin()
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`
  return new URL(path, origin).toString()
}
