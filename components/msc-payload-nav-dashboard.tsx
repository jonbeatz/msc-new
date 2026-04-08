"use client"

import Link from "next/link"

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
    </div>
  )
}

