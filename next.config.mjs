import { withPayload } from "@payloadcms/next/withPayload"

// Windows / synced folders: the default watcher can miss rapid rewrites to `.next`, leaving
// half-built `vendor-chunks/*` and 404s for `/_next/static/*`. Polling is slower but stable.
if (process.platform === "win32" && process.env.WATCHPACK_POLLING == null) {
  process.env.WATCHPACK_POLLING = "true"
}

const canonicalSiteFallback =
  process.env.MSC_CANONICAL_SITE_ORIGIN?.trim() || "https://mystudiochannel.com"

const publicOrigin =
  process.env.NEXT_PUBLIC_SERVER_URL?.trim() || canonicalSiteFallback

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

/** Polling interval (ms) for webpack’s watcher on Windows — complements WATCHPACK_POLLING. */
const winWebpackPollMs = Number(process.env.MSC_WEBPACK_POLL_MS ?? "1000") || 1000

/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * Payload globals live at `/admin/globals/:slug`. A bare `/admin/homepage` yields one segment
   * (`homepage`), so RootPage never resolves the Homepage global and logged-in users see 404.
   */
  async redirects() {
    return [
      // v1.0.23: old shortcut `/admin/homepage` still works
      {
        source: "/admin/homepage",
        destination: "/admin/msc-homepage",
        permanent: false,
      },
      // v1.0.23: canonical Payload URL redirects to the isolated static route so
      // bookmarks/sidebar links continue to work and bypass globals/[slug] routing.
      {
        source: "/admin/globals/homepage",
        destination: "/admin/msc-homepage",
        permanent: false,
      },
    ]
  },
  // Hide Next.js dev toolbar / “Preferences” panel (bottom-left in dev). Not part of Payload.
  devIndicators: false,
  poweredByHeader: false,
  // Payload requires a Node server. Static `out/` export is disabled while CMS is integrated.
  // next/image: local `/api/media/file/*` and `/media/*` (public/media) are same-origin — no remotePatterns entry needed.
  images: {
    unoptimized: true,
    remotePatterns,
  },
  /**
   * Windows dev: reinforce polling so HMR sees rapid `.next` rewrites (reduces half-built
   * vendor-chunks and `/_next/static/*` 404s after edits). Do not set `cache: false` here.
   */
  webpack: (config, { dev }) => {
    if (dev && process.platform === "win32") {
      config.watchOptions = {
        ...(config.watchOptions ?? {}),
        poll: winWebpackPollMs,
        aggregateTimeout: 500,
      }
    }
    return config
  },
}
// Avoid `webpack: (c) => { c.cache = false }` in dev — it can break Payload admin vendor-chunks on Windows.

export default withPayload(nextConfig)
