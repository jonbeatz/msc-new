import { unstable_noStore as noStore } from "next/cache"
import { getPayload } from "payload"
import config from "@payload-config"

import {
  FALLBACK_DEMOS,
  mapProjectItemsToDemos,
  type DemoProject,
} from "@/lib/cms/homepage-demo-hydrate"

export type { DemoProject }

export async function getDemoProjects(): Promise<DemoProject[]> {
  noStore()
  try {
    const payload = await getPayload({ config })
    const doc = await payload.findGlobal({
      slug: "projects-home",
      depth: 1,
    })

    const rows = Array.isArray(doc?.projectItems) ? doc.projectItems : []
    const mapped = mapProjectItemsToDemos(rows)

    if (mapped.length === 0) return FALLBACK_DEMOS

    return mapped
  } catch {
    return FALLBACK_DEMOS
  }
}

