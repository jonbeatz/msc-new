"use client"

import Link from "next/link"
import { getPublicOriginClient } from "@/lib/public-origin"

/** Client-safe origin (NEXT_PUBLIC only) — avoids SSR vs browser hydration mismatch. */
const publicSiteRoot = getPublicOriginClient()

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

