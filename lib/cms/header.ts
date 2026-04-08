import { getPayload } from "payload"
import config from "@payload-config"

export type HeaderNavItem = {
  label: string
  link: string
}

export const DEFAULT_HEADER_NAV_ITEMS: HeaderNavItem[] = [
  { label: "About", link: "#msc-about" },
  { label: "Services", link: "#msc-services" },
  { label: "Demos", link: "#msc-demos" },
  { label: "Contact", link: "#msc-contact" },
]

export async function getHeaderNavItems(): Promise<HeaderNavItem[]> {
  try {
    const payload = await getPayload({ config })
    const doc = await payload.findGlobal({
      slug: "header",
      depth: 0,
    })

    const rows = Array.isArray(doc?.navItems) ? doc.navItems : []
    const mapped = rows
      .map((row) => {
        if (!row || typeof row !== "object") return null
        const label = typeof row.label === "string" ? row.label.trim() : ""
        const link = typeof row.link === "string" ? row.link.trim() : ""
        if (!label || !link) return null
        return { label, link }
      })
      .filter((row): row is HeaderNavItem => row !== null)

    return mapped.length > 0 ? mapped : DEFAULT_HEADER_NAV_ITEMS
  } catch {
    return DEFAULT_HEADER_NAV_ITEMS
  }
}

