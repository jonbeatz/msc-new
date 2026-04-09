import type { Payload } from "payload"
import { getPayload } from "payload"
import config from "@payload-config"

import { normalizeInternalNavLink } from "@/lib/hash-nav"

export type HeaderNavItem = {
  label: string
  link: string
  submenu?: Array<{
    label: string
    link: string
  }>
}

export { normalizeInternalNavLink }

function normalizeNavItem(item: HeaderNavItem): HeaderNavItem {
  const submenu = item.submenu?.map((s) => ({
    ...s,
    link: normalizeInternalNavLink(s.link),
  }))
  return {
    ...item,
    link: normalizeInternalNavLink(item.link),
    ...(submenu && submenu.length > 0 ? { submenu } : {}),
  }
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

async function getPageLinksForPagesMenu(
  payload: Payload,
): Promise<Array<{ label: string; link: string }>> {
  try {
    const result = await payload.find({
      collection: "pages",
      where: {
        slug: {
          not_equals: "home",
        },
      },
      sort: "title",
      limit: 100,
      depth: 0,
    })
    return result.docs
      .map((doc) => {
        const title = typeof doc.title === "string" ? doc.title.trim() : ""
        const slug = typeof doc.slug === "string" ? doc.slug.trim() : ""
        if (!slug) return null
        const lower = slug.toLowerCase()
        if (lower === "home") return null
        return {
          label: title.length > 0 ? title : slug,
          link: `/${encodeURIComponent(slug)}`,
        }
      })
      .filter(
        (row): row is { label: string; link: string } => row !== null,
      )
  } catch {
    return []
  }
}

/**
 * If a Header global row is labeled exactly `Pages`, replace its URL and manual
 * submenu with Payload `pages` collection links (excluding slug `home`). If there
 * are no pages, the item becomes a simple link to `/`.
 */
function applyDynamicPagesNav(
  items: HeaderNavItem[],
  pageSubmenu: Array<{ label: string; link: string }>,
): HeaderNavItem[] {
  return items.map((item) => {
    if (item.label !== "Pages") return item
    if (pageSubmenu.length === 0) {
      return { label: "Pages", link: "/" }
    }
    return { label: "Pages", link: "/", submenu: pageSubmenu }
  })
}

function headerRowsIncludeExactPagesLabel(rows: unknown[]): boolean {
  return rows.some((row) => {
    if (!row || typeof row !== "object") return false
    const label = (row as { label?: unknown }).label
    return typeof label === "string" && label.trim() === "Pages"
  })
}

export async function getHeaderNavItems(): Promise<HeaderNavItem[]> {
  try {
    const payload = await getPayload({ config })
    const doc = await payload.findGlobal({
      slug: "header",
      depth: 0,
    })

    const rows = Array.isArray(doc?.navItems) ? doc.navItems : []
    const shouldFetchPages = headerRowsIncludeExactPagesLabel(rows)
    const pageSubmenu = shouldFetchPages
      ? await getPageLinksForPagesMenu(payload)
      : []

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

    const base =
      mapped.length > 0
        ? mapped.map((item) => normalizeNavItem(item))
        : DEFAULT_HEADER_NAV_ITEMS.map((item) => normalizeNavItem(item))

    return applyDynamicPagesNav(base, pageSubmenu)
  } catch {
    return DEFAULT_HEADER_NAV_ITEMS.map((item) => normalizeNavItem(item))
  }
}

