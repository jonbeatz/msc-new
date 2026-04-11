import { withPayload } from "@payloadcms/next/withPayload"

// Windows / synced folders: the default watcher can miss rapid rewrites to `.next`, leaving
// half-built `vendor-chunks/*` and 404s for `/_next/static/*`. Polling is slower but stable.
if (process.platform === "win32" && process.env.WATCHPACK_POLLING == null) {
  process.env.WATCHPACK_POLLING = "true"
}

const publicOrigin =
  process.env.NEXT_PUBLIC_SERVER_URL?.trim() || "http://localhost:3000"

const remotePatterns = [
  {
    protocol: "http",
    hostname: "localhost",
  },
]

try {
  const { protocol, hostname } = new URL(publicOrigin)
  if (hostname && hostname !== "localhost") {
    remotePatterns.push({
      protocol: protocol === "https:" ? "https" : "http",
      hostname,
    })
  }
} catch {
  // Invalid NEXT_PUBLIC_SERVER_URL — keep defaults only.
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Hide Next.js dev toolbar / “Preferences” panel (bottom-left in dev). Not part of Payload.
  devIndicators: false,
  poweredByHeader: false,
  // Payload requires a Node server. Static `out/` export is disabled while CMS is integrated.
  // next/image: local `/api/media/file/*` and `/media/*` (public/media) are same-origin — no remotePatterns entry needed.
  images: {
    unoptimized: true,
    remotePatterns,
  },
  /** Dev-only: disable webpack persistent cache to avoid stale chunk graphs (missing `./vendor-chunks/*.js`). */
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false
    }
    return config
  },
}

export default withPayload(nextConfig)
