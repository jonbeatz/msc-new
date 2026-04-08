import { withPayload } from "@payloadcms/next/withPayload";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Hide Next.js dev toolbar / “Preferences” panel (bottom-left in dev). Not part of Payload.
  devIndicators: false,
  // Payload requires a Node server. Static `out/` export is disabled while CMS is integrated.
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hebbkx1anhila5yf.public.blob.vercel-storage.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
};

export default withPayload(nextConfig);
