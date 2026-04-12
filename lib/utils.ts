import type { MouseEvent } from "react"
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Matches sticky header (`h-20` = 80px) so section titles stay visible below the nav */
export const HEADER_SCROLL_OFFSET_PX = 80

/**
 * Smooth scroll to `document.getElementById(elementId)` with a top offset (sticky nav).
 */
export function scrollToAnchorWithOffset(
  elementId: string,
  options?: { offset?: number; behavior?: ScrollBehavior },
): void {
  if (typeof window === "undefined") return
  const offset = options?.offset ?? HEADER_SCROLL_OFFSET_PX
  const el = document.getElementById(elementId)
  if (!el) return
  const top =
    el.getBoundingClientRect().top + window.scrollY - offset
  window.scrollTo({
    top: Math.max(0, top),
    behavior: options?.behavior ?? "smooth",
  })
}

/**
 * Strip `#fragment` from the address bar while keeping path + query (e.g. clean `/` for marketing).
 */
export function replaceUrlPathnameWithoutHash(): void {
  if (typeof window === "undefined") return
  const { pathname, search } = window.location
  window.history.pushState(null, "", `${pathname}${search}`)
}

/**
 * In-page nav: scroll with header offset, then clear hash from URL (no stacked `#`).
 * Pass `#msc-demos` or `msc-demos`.
 */
export function handleScroll(
  hashOrId: string,
  options?: { offset?: number; behavior?: ScrollBehavior },
): void {
  const raw = hashOrId.trim()
  const id = raw.startsWith("#") ? raw.slice(1) : raw
  if (!id) return
  scrollToAnchorWithOffset(id, options)
  replaceUrlPathnameWithoutHash()
}

/**
 * For `<a href="#...">`: prevent the browser’s default jump (ignores sticky nav offset) and use
 * {@link handleScroll} — same pattern as header hash nav. Non-`#` hrefs are left to normal navigation.
 */
export function onHashAnchorClick(
  e: MouseEvent<HTMLAnchorElement>,
  href: string,
): void {
  const t = href.trim()
  if (!t.startsWith("#")) return
  e.preventDefault()
  handleScroll(t)
}
