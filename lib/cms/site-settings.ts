import { getPayload } from "payload"
import config from "@payload-config"

import { toRelativePublicMediaUrl } from "@/lib/media-url"

export type SiteSettingsContent = {
  siteName: string
  tagline: string | null
  siteTitleSuffix: string | null
  siteLogo: string | null
  favicon: string | null
  ogImage: string | null
  /** Marketing header: sticky + glass when true (default). */
  stickyHeader: boolean
}

function normalizeMediaSrc(pathOrUrl: string): string {
  return toRelativePublicMediaUrl(pathOrUrl)
}

/** Payload SQLite may expose `sticky_header` or 0/1; normalize for the marketing header. */
export function resolveStickyHeaderFromDoc(
  doc: Record<string, unknown>,
): boolean {
  const raw = doc.stickyHeader ?? doc.sticky_header
  if (raw === false || raw === 0 || raw === "0") return false
  return true
}

function getUploadUrl(value: unknown): string | null {
  if (!value || typeof value !== "object" || !("url" in value)) return null
  const raw = (value as { url?: unknown }).url
  if (typeof raw !== "string" || raw.trim().length === 0) return null
  return normalizeMediaSrc(raw.trim())
}

export async function getSiteSettingsCms(): Promise<SiteSettingsContent | null> {
  try {
    const payload = await getPayload({ config })
    const doc = await payload.findGlobal({
      slug: "site-settings",
      depth: 0,
    })
    if (!doc || typeof doc.siteName !== "string" || !doc.siteName.trim()) {
      return null
    }
    const d = doc as unknown as Record<string, unknown>
    return {
      siteName: doc.siteName.trim(),
      tagline:
        typeof doc.tagline === "string" && doc.tagline.trim()
          ? doc.tagline.trim()
          : null,
      siteTitleSuffix:
        typeof doc.siteTitleSuffix === "string" && doc.siteTitleSuffix.trim()
          ? doc.siteTitleSuffix.trim()
          : null,
      siteLogo: getUploadUrl(doc.siteLogo),
      favicon: getUploadUrl(doc.favicon),
      ogImage: getUploadUrl(doc.ogImage),
      stickyHeader: resolveStickyHeaderFromDoc(d),
    }
  } catch {
    return null
  }
}
