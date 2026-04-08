"use client"

import Link from "next/link"
import React, { useEffect, useState } from "react"
import { createPortal } from "react-dom"

/**
 * Visible admin nav link — Payload’s default logout is an icon in `.nav__controls`
 * next to settings; this makes “Log out” obvious for editors.
 */
export function MscPayloadNavLogout() {
  const [onAccountPage, setOnAccountPage] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    setMounted(true)

    const syncRouteState = () => {
      const path = window.location.pathname
      const isAccountRoute =
        path.startsWith("/admin/account") ||
        path.startsWith("/admin/collections/users/") ||
        path.startsWith("/admin/users/")
      setOnAccountPage(isAccountRoute)
    }

    syncRouteState()
    window.addEventListener("popstate", syncRouteState)
    const intervalId = window.setInterval(syncRouteState, 500)

    const resolveTarget = () => {
      // Place directly under the Payload Settings section.
      const heading = Array.from(document.querySelectorAll("h2, h3, legend")).find(
        (node) => node.textContent?.trim().toLowerCase() === "payload settings"
      ) as HTMLElement | undefined
      if (heading?.parentElement) {
        setPortalTarget(heading.parentElement)
        return
      }

      const resetBtn = Array.from(document.querySelectorAll("button")).find((node) =>
        node.textContent?.trim().toLowerCase().includes("reset preferences")
      ) as HTMLButtonElement | undefined
      if (resetBtn?.parentElement) setPortalTarget(resetBtn.parentElement)
    }

    resolveTarget()
    const targetInterval = window.setInterval(resolveTarget, 500)

    return () => {
      window.removeEventListener("popstate", syncRouteState)
      window.clearInterval(intervalId)
      window.clearInterval(targetInterval)
    }
  }, [])

  if (!mounted || !onAccountPage || !portalTarget) return null

  return createPortal(
    <div className="msc-payload-account-logout-inline">
      <Link
        className="msc-payload-account-logout-inline__link"
        href="/admin/logout"
        prefetch={false}
      >
        Log out
      </Link>
    </div>,
    portalTarget
  )
}
