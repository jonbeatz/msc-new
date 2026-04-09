"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

import { canonicalFragmentIdFromHref } from "@/lib/hash-nav"

function scrollToElementId(id: string) {
  if (!id) return
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" })
  }
}

/**
 * After client navigation to `/` with a hash (e.g. from `/msc1` via `/#msc-demos`),
 * scroll to the target section. Normalizes "dirty" URLs with stacked `#` fragments
 * via `replaceState` so the bar shows a single hash.
 */
export function HomeHashScroll() {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname !== "/" || typeof window === "undefined") return

    const run = () => {
      const href = window.location.href
      const id = canonicalFragmentIdFromHref(href)
      if (!id) return

      const segments = href.slice(href.indexOf("#") + 1).split("#").filter(Boolean)
      const needsClean = segments.length > 1
      const nextUrl = `${window.location.pathname}${window.location.search}#${id}`
      if (needsClean) {
        window.history.replaceState(null, "", nextUrl)
      }

      scrollToElementId(id)
    }

    const t = window.setTimeout(run, 80)
    return () => window.clearTimeout(t)
  }, [pathname])

  useEffect(() => {
    const onHashChange = () => {
      if (pathname !== "/") return
      const href = window.location.href
      const id = canonicalFragmentIdFromHref(href)
      if (!id) return
      const segments = href.slice(href.indexOf("#") + 1).split("#").filter(Boolean)
      if (segments.length > 1) {
        const nextUrl = `${window.location.pathname}${window.location.search}#${id}`
        window.history.replaceState(null, "", nextUrl)
      }
      scrollToElementId(id)
    }
    window.addEventListener("hashchange", onHashChange)
    return () => window.removeEventListener("hashchange", onHashChange)
  }, [pathname])

  return null
}
