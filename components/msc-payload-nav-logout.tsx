"use client"

import Link from "next/link"
import React from "react"

/**
 * Visible admin nav link — Payload’s default logout is an icon in `.nav__controls`
 * next to settings; this makes “Log out” obvious for editors.
 */
export function MscPayloadNavLogout() {
  return (
    <div className="msc-payload-nav-logout">
      <Link
        className="msc-payload-nav-logout__link"
        href="/admin/logout"
        prefetch={false}
      >
        Log out
      </Link>
    </div>
  )
}
