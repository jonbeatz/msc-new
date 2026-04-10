"use client"

import Link from "next/link"
import React, { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { MSC_ADMIN_VERSION } from "@/lib/msc-admin-version"

/**
 * Visible admin nav link — Payload’s default logout is an icon in `.nav__controls`
 * next to settings; this makes “Log out” obvious for editors.
 */
export function MscPayloadNavLogout() {
  const [onAccountPage, setOnAccountPage] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [accountPortalTarget, setAccountPortalTarget] = useState<HTMLElement | null>(null)
  const [sidebarPortalTarget, setSidebarPortalTarget] = useState<HTMLElement | null>(null)

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

    const resolveTarget = () => {
      // Sidebar target: show version at the bottom of the admin nav on all pages.
      const navControls = document.querySelector(".nav__controls") as HTMLElement | null
      if (navControls?.parentElement) {
        setSidebarPortalTarget(navControls.parentElement)
      }

      // Account target: keep logout under Payload Settings / Reset Preferences.
      const heading = Array.from(document.querySelectorAll("h2, h3, legend")).find(
        (node) => node.textContent?.trim().toLowerCase() === "payload settings"
      ) as HTMLElement | undefined
      if (heading?.parentElement) {
        setAccountPortalTarget(heading.parentElement)
        return
      }

      const resetBtn = Array.from(document.querySelectorAll("button")).find((node) =>
        node.textContent?.trim().toLowerCase().includes("reset preferences")
      ) as HTMLButtonElement | undefined
      if (resetBtn?.parentElement) setAccountPortalTarget(resetBtn.parentElement)
    }

    syncRouteState()
    resolveTarget()
    window.addEventListener("popstate", syncRouteState)
    const routeInterval = window.setInterval(syncRouteState, 500)
    const targetInterval = window.setInterval(resolveTarget, 500)

    return () => {
      window.removeEventListener("popstate", syncRouteState)
      window.clearInterval(routeInterval)
      window.clearInterval(targetInterval)
    }
  }, [])

  if (!mounted) return null

  return (
    <>
      {onAccountPage && accountPortalTarget
        ? createPortal(
            <div className="msc-payload-account-logout-inline">
              <Link
                className="msc-payload-account-logout-inline__link"
                href="/admin/logout"
                prefetch={false}
              >
                Log out
              </Link>
            </div>,
            accountPortalTarget
          )
        : null}

      {sidebarPortalTarget
        ? createPortal(
            <div className="msc-payload-sidebar-version" title="MSC admin bundle version">
              v{MSC_ADMIN_VERSION}
            </div>,
            sidebarPortalTarget
          )
        : null}
    </>
  )
}
