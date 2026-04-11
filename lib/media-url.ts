const API_FILE_PREFIX = "/api/media/file/"

/**
 * Normalize Payload/media URLs to a same-origin path (e.g. `/media/file.jpg`) so the browser
 * resolves assets against the current host in dev and production.
 */
export function toRelativePublicMediaUrl(input: string): string {
  let path = input.trim()
  if (!path) return path

  if (/^https?:\/\//i.test(path)) {
    try {
      const u = new URL(path)
      path = u.pathname + (u.search || "")
    } catch {
      return input.trim()
    }
  } else if (path.startsWith("//")) {
    try {
      const u = new URL(`https:${path}`)
      path = u.pathname + (u.search || "")
    } catch {
      return input.trim()
    }
  }

  const q = path.indexOf("?")
  const base = q === -1 ? path : path.slice(0, q)
  const search = q === -1 ? "" : path.slice(q)

  const apiIdx = base.indexOf(API_FILE_PREFIX)
  if (apiIdx !== -1) {
    const rest = base.slice(apiIdx + API_FILE_PREFIX.length).replace(/^\/+/, "")
    return `/media/${rest}${search}`
  }

  if (base.startsWith("/media/")) {
    return `${base}${search}`
  }

  if (base.startsWith("/")) {
    return `${base}${search}`
  }

  return `/${base.replace(/^\/+/, "")}${search}`
}
