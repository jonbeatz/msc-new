import { getPayload } from "payload"
import config from "@payload-config"

export type HeaderNavItem = {
  label: string
  link: string
  submenu?: Array<{
    label: string
    link: string
  }>
}

export const DEFAULT_HEADER_NAV_ITEMS: HeaderNavItem[] = [
  { label: "About", link: "#msc-about" },
  {
    label: "Services",
    link: "#msc-services",
    submenu: [
      { label: "Own Your Platform", link: "#msc-own-platform" },
      { label: "Packages", link: "#msc-packages" },
      { label: "Requirements", link: "#msc-requirements" },
      { label: "What We Do", link: "#msc-creators" },
    ],
  },
  { label: "Demos", link: "#msc-demos" },
  {
    label: "Resources",
    link: "#msc-testimonials",
    submenu: [
      { label: "Testimonials", link: "#msc-testimonials" },
      { label: "Extras", link: "#msc-addons" },
      { label: "FAQ", link: "#msc-faq" },
    ],
  },
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

        const submenuRows = Array.isArray((row as { submenu?: unknown }).submenu)
          ? ((row as { submenu: unknown[] }).submenu as Array<{
              label?: unknown
              link?: unknown
            }>)
              .map((item) => {
                const subLabel =
                  typeof item?.label === "string" ? item.label.trim() : ""
                const subLink =
                  typeof item?.link === "string" ? item.link.trim() : ""
                if (!subLabel || !subLink) return null
                return { label: subLabel, link: subLink }
              })
              .filter(
                (
                  item
                ): item is {
                  label: string
                  link: string
                } => item !== null
              )
          : []

        return { label, link, submenu: submenuRows.length > 0 ? submenuRows : undefined }
      })
      .filter((row): row is Exclude<typeof row, null> => row !== null)

    return mapped.length > 0 ? mapped : DEFAULT_HEADER_NAV_ITEMS
  } catch {
    return DEFAULT_HEADER_NAV_ITEMS
  }
}

