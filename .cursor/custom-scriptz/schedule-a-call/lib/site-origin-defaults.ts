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
