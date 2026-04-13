"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

import { canonicalFragmentIdFromHref } from "@/lib/hash-nav"
import { handleScroll } from "@/lib/utils"

function scrollToElementId(id: string) {
  if (!id) return
  requestAnimationFrame(() => {
    handleScroll(`#${id}`, { deferFrames: 1 })
  })
}

/**
 * After client navigation to `/` with a hash (e.g. from `/msc1` via `/#msc-demos`),
 * scroll to the target section with sticky-header offset and strip `#` from the URL
 * (see {@link handleScroll} in `lib/utils.ts`).
 */
export function HomeHashScroll() {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname !== "/" || typeof window === "undefined") return

    const run = () => {
      const href = window.location.href
      const id = canonicalFragmentIdFromHref(href)
      if (!id) return
      scrollToElementId(id)
    }

    const t = window.setTimeout(run, 120)
    return () => window.clearTimeout(t)
  }, [pathname])

  useEffect(() => {
    const onHashChange = () => {
      if (pathname !== "/") return
      const href = window.location.href
      const id = canonicalFragmentIdFromHref(href)
      if (!id) return
      scrollToElementId(id)
    }
    window.addEventListener("hashchange", onHashChange)
    return () => window.removeEventListener("hashchange", onHashChange)
  }, [pathname])

  return null
}
