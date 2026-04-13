import type { MouseEvent } from "react"
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Fallback when `#msc-header` is missing (SSR / tests). ~`h-20` + gap */
export const HEADER_SCROLL_OFFSET_PX = 96

const HEADER_CLEARANCE_GAP_PX = 16

/**
 * Live height of the sticky header bar (collapsed). Prefer this over a fixed px value so
 * mobile / blur / font changes stay aligned. Clamped so a transient huge header (e.g. open
 * drawer) cannot scroll the page to the wrong place — pair with {@link handleScroll} `deferMs`
 * after closing mobile nav.
 */
export function getHeaderScrollOffsetPx(): number {
  if (typeof document === "undefined") return HEADER_SCROLL_OFFSET_PX
  const header = document.getElementById("msc-header")
  if (!header) return HEADER_SCROLL_OFFSET_PX
  const h = Math.round(header.getBoundingClientRect().height)
  return Math.min(Math.max(h + HEADER_CLEARANCE_GAP_PX, 72), 200)
}

/**
 * Smooth scroll to `document.getElementById(elementId)` with a top offset (sticky nav).
 */
export function scrollToAnchorWithOffset(
  elementId: string,
  options?: { offset?: number; behavior?: ScrollBehavior },
): void {
  if (typeof window === "undefined") return
  const offset = options?.offset ?? getHeaderScrollOffsetPx()
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

function scheduleAfterFrames(run: () => void, frames: number): void {
  if (frames <= 0) {
    run()
    return
  }
  requestAnimationFrame(() => scheduleAfterFrames(run, frames - 1))
}

/**
 * In-page nav: scroll with header offset, then clear hash from URL (no stacked `#`).
 * Pass `#msc-demos` or `msc-demos`.
 *
 * Use `deferMs` after closing the mobile drawer so React can commit layout before measuring
 * the collapsed header height.
 */
export function handleScroll(
  hashOrId: string,
  options?: {
    offset?: number
    behavior?: ScrollBehavior
    /** Extra animation frames before scrolling (e.g. 2 after UI closes). */
    deferFrames?: number
    /** Milliseconds delay — most reliable after mobile nav `setState` closes the panel. */
    deferMs?: number
  },
): void {
  const raw = hashOrId.trim()
  const id = raw.startsWith("#") ? raw.slice(1) : raw
  if (!id) return

  const run = () => {
    scrollToAnchorWithOffset(id, options)
    replaceUrlPathnameWithoutHash()
  }

  const ms = options?.deferMs ?? 0
  if (ms > 0) {
    window.setTimeout(run, ms)
    return
  }

  const frames = Math.max(0, Math.min(12, options?.deferFrames ?? 0))
  scheduleAfterFrames(run, frames)
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
