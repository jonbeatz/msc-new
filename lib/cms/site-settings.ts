import { getPayload } from "payload"
import config from "@payload-config"

export type SiteSettingsContent = {
  siteName: string
  tagline: string | null
  siteTitleSuffix: string | null
  siteLogo: string | null
  favicon: string | null
  ogImage: string | null
}

function normalizeMediaSrc(pathOrUrl: string): string {
  if (
    pathOrUrl.startsWith("http://") ||
    pathOrUrl.startsWith("https://")
  ) {
    return pathOrUrl
  }
  return pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`
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
    }
  } catch {
    return null
  }
}
