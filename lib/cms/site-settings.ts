import { getPayload } from "payload"
import config from "@payload-config"

export type SiteSettingsContent = {
  siteName: string
  tagline: string | null
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
    }
  } catch {
    return null
  }
}
