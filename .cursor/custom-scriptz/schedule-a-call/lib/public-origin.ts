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
