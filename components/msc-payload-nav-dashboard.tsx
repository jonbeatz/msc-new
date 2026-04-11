"use client"

import Link from "next/link"
import { getPublicOrigin } from "@/lib/public-origin"

/** Uses NEXT_PUBLIC_SERVER_URL (same as marketing layout). */
const publicSiteRoot = getPublicOrigin()

export function MscPayloadNavDashboard() {

  return (
    <div className="msc-payload-nav-dashboard">
      <div className="msc-payload-nav-dashboard__links">
        <Link
          className="msc-payload-nav-dashboard__link"
          href="/admin"
          prefetch={false}
        >
          Dashboard
        </Link>
        <a
          className="msc-payload-nav-dashboard__link msc-payload-nav-dashboard__link--external"
          href={publicSiteRoot}
          target="_blank"
          rel="noopener noreferrer"
          title="Open public site in a new tab"
        >
          View site
        </a>
      </div>
    </div>
  )
}

