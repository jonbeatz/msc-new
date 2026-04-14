import { getPublicOrigin } from "@/lib/public-origin"

/**
 * Builds the correct URL for Payload REST calls from browser or server code.
 *
 * - **Browser:** always a **root-relative** path (`/api/...`) so the request stays on the
 *   current host (`mystudiochannel.com`, preview, or `localhost`) — never hardcode
 *   `http://localhost:3000`.
 * - **Server:** absolute URL using `getPublicOrigin()` (from `NEXT_PUBLIC_SERVER_URL` /
 *   `PAYLOAD_PUBLIC_SERVER_URL` / canonical fallback).
 *
 * **CORS:** Same-origin POSTs from the marketing site to `/api/*` need no extra CORS.
 * Payload exposes `OPTIONS` on `app/(payload)/api/[...slug]/route.ts` for REST preflight
 * when clients are cross-origin (separate SPA domain).
 */
export function apiRequestUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`
  if (typeof window !== "undefined") {
    return p
  }
  return `${getPublicOrigin()}${p}`
}
