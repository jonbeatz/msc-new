import { getPublicOrigin } from "./public-origin"

/**
 * Builds the correct URL for Payload REST calls from browser or server code.
 */
export function apiRequestUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`
  if (typeof window !== "undefined") {
    return p
  }
  return `${getPublicOrigin()}${p}`
}
