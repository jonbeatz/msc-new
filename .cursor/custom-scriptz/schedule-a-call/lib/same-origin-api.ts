import { getPublicOrigin } from "./public-origin"

export function apiRequestUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`
  if (typeof window !== "undefined") {
    return p
  }
  return `${getPublicOrigin()}${p}`
}
