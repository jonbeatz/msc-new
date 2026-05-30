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

export function getPublicOrigin(): string {
  return normalizeOriginString(
    process.env.PAYLOAD_PUBLIC_SERVER_URL?.trim() ||
      process.env.NEXT_PUBLIC_SERVER_URL?.trim() ||
      "",
  )
}

export function getPublicOriginClient(): string {
  return normalizeOriginString(process.env.NEXT_PUBLIC_SERVER_URL?.trim() || "")
}

export function resolvePublicUrl(pathname: string): string {
  const origin = getPublicOrigin()
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`
  return new URL(path, origin).toString()
}
