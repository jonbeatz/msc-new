import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Shared hosts / reverse proxies often cache HTML for `/` while `/api/*` stays fresh.
 * That matches "globals API shows v111 but homepage does not" — force no-store on document routes.
 */
function isDocumentPath(pathname: string): boolean {
  if (pathname === "/") return true
  if (pathname.startsWith("/api")) return false
  if (pathname.startsWith("/_next")) return false
  // Include /admin so HTML is not cached by the host after deploys (version label + UI updates).
  if (pathname.startsWith("/images/")) return false
  if (pathname.startsWith("/media/")) return false
  // skip typical static files in /public
  if (/\.[a-z0-9]{2,5}$/i.test(pathname)) return false
  return true
}

export function middleware(request: NextRequest) {
  if (!isDocumentPath(request.nextUrl.pathname)) {
    return NextResponse.next()
  }
  const res = NextResponse.next()
  res.headers.set(
    "Cache-Control",
    "private, no-cache, no-store, max-age=0, must-revalidate",
  )
  res.headers.set("Vary", "Cookie")
  return res
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
