const FALLBACK_ORIGIN = "http://localhost:3000"

/**
 * Canonical public site origin for absolute URLs (emails, admin preview links, metadata).
 * Always use NEXT_PUBLIC_* so the value is available on the client where needed.
 * Invalid env values fall back so `new URL()` in `generateMetadata` never throws a 500.
 */
export function getPublicOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_SERVER_URL?.trim()
  if (!raw || raw.length === 0) return FALLBACK_ORIGIN
  const cleaned = raw.replace(/\/+$/, "")
  try {
    const u = new URL(cleaned)
    if (u.protocol !== "http:" && u.protocol !== "https:") return FALLBACK_ORIGIN
    return cleaned
  } catch {
    return FALLBACK_ORIGIN
  }
}
