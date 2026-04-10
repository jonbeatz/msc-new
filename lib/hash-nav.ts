/**
 * Shared helpers for single-hash URLs and in-page anchor navigation.
 */

/** True when `href` is a same-document hash jump on `/` (use with Next.js Link `replace`). */
export function shouldReplaceHashLink(pathname: string, href: string): boolean {
  if (pathname !== "/") return false
  const t = href.trim()
  return t.includes("#") && !/^https?:\/\//i.test(t) && !t.startsWith("mailto:")
}

/**
 * From a full URL or path+hash string, return the last `#fragment` segment (element id).
 * Handles "dirty" values like `/#a#b` or `#a#b`.
 */
export function canonicalFragmentIdFromHref(href: string): string | null {
  const t = href.trim()
  const i = t.indexOf("#")
  if (i === -1) return null
  const afterFirst = t.slice(i + 1)
  const parts = afterFirst.split("#").map((p) => p.trim()).filter(Boolean)
  if (parts.length === 0) return null
  return parts[parts.length - 1] ?? null
}

/**
 * Same-origin nav links: one path segment and at most one `#id`.
 * Strips stacked fragments (e.g. `/#msc-demos#msc-requirements` -> `#msc-requirements`).
 * Home-only section links use `#id` (no leading `/`) so they can be resolved to same-page
 * anchors on `/` and to `/#id` off home via {@link resolveNavHashHref}.
 */
export function normalizeInternalNavLink(link: string): string {
  const t = link.trim()
  if (!t) return t
  if (
    t.startsWith("http://") ||
    t.startsWith("https://") ||
    t.startsWith("mailto:")
  ) {
    return t
  }

  const firstHash = t.indexOf("#")
  if (firstHash === -1) {
    if (t.startsWith("#")) return t
    return t
  }

  const pathPart = t.slice(0, firstHash).trim()
  const afterHashes = t.slice(firstHash + 1)

  if (!afterHashes) {
    if (pathPart === "") return "/"
    return pathPart.startsWith("/") ? pathPart : `/${pathPart}`
  }

  const lastId = afterHashes.includes("#")
    ? afterHashes.slice(afterHashes.lastIndexOf("#") + 1).trim()
    : afterHashes.trim()

  if (!lastId) {
    if (pathPart === "") return "/"
    return pathPart.startsWith("/") ? pathPart : `/${pathPart}`
  }

  if (pathPart === "" || pathPart === "/") {
    return `#${lastId}`
  }

  const cleanPath = pathPart.startsWith("/") ? pathPart : `/${pathPart}`
  return `${cleanPath}#${lastId}`
}

/**
 * Maps stored nav hrefs to the correct `Link` href for the current route:
 * on `/` use `#section` (native smooth scroll); off home use `/#section` (cross-page).
 */
export function resolveNavHashHref(pathname: string, href: string): string {
  const normalized = normalizeInternalNavLink(href.trim())
  if (/^https?:\/\//i.test(normalized) || normalized.startsWith("mailto:")) {
    return normalized
  }
  if (normalized.startsWith("/") && !normalized.includes("#")) {
    return normalized
  }
  const m = normalized.match(/^#([^#]+)$/)
  if (m) {
    const id = m[1]
    if (pathname === "/") return `#${id}`
    return `/#${id}`
  }
  return normalized
}

/** Next `scroll`: off home, suppress framework scroll for `/#…` so HomeHashScroll can run; on `/` with `#…`, leave default for native anchor behavior. */
export function scrollPropForResolvedNav(
  pathname: string,
  resolvedHref: string,
): boolean | undefined {
  if (!resolvedHref.includes("#")) return undefined
  if (pathname === "/" && resolvedHref.startsWith("#")) return undefined
  return false
}
