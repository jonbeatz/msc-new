/**
 * Single place for “no env set” public origin defaults (Spaceship / production).
 * Local dev: set `NEXT_PUBLIC_SERVER_URL` in `.env.local` (e.g. to your dev origin).
 *
 * Override the default domain without code edits via `MSC_CANONICAL_SITE_ORIGIN`.
 */
export function getCanonicalSiteOriginFallback(): string {
  const env = process.env.MSC_CANONICAL_SITE_ORIGIN?.trim()
  if (env) {
    try {
      const u = new URL(env)
      if (u.protocol === "http:" || u.protocol === "https:") {
        return env.replace(/\/+$/, "")
      }
    } catch {
      /* ignore invalid */
    }
  }
  return "https://mystudiochannel.com"
}
