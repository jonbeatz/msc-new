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
    return raw.map((s) => String(s).trim()).filter(Boolean)
  }
  if (typeof raw === "string") {
    return raw.split("/").map((s) => s.trim()).filter(Boolean)
  }
  // Fallback: some Next builds only expose the catch-all under the dynamic key name — pick the first string[].
  for (const v of Object.values(p)) {
    if (
      Array.isArray(v) &&
      v.length > 0 &&
      v.every((x) => typeof x === "string")
    ) {
      return v.map((s) => s.trim()).filter(Boolean)
    }
  }
  return []
}

export function normalizeAdminSegmentParams(
  params:
    | Promise<{ segments?: string[] | string }>
    | { segments?: string[] | string },
): Promise<{ segments: string[] }> {
  return Promise.resolve(params).then((p) => ({
    segments: parseAdminRouteSegments(p),
  }))
}
