"use client"

import Link from "next/link"
import { MSC_ADMIN_VERSION } from "@/lib/msc-admin-version"

export function MscPayloadNavDashboard() {
  return (
    <div className="msc-payload-nav-dashboard">
      <Link
        className="msc-payload-nav-dashboard__link"
        href="/admin"
        prefetch={false}
      >
        Dashboard
      </Link>
      <div className="msc-payload-nav-dashboard__version" title="MSC admin bundle version">
        v{MSC_ADMIN_VERSION}
      </div>
    </div>
  )
}

