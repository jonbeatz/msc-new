/**
 * PayPal (or other) checkout URLs for pricing cards. Set in `.env.local` for production.
 * @see `components/packages-section.tsx`
 */
export type PackageCheckoutKey = "creator-launch" | "studio-pro" | "network-platform"

export function getPackageCheckoutUrl(key: PackageCheckoutKey): string {
  const raw =
    key === "creator-launch"
      ? process.env.NEXT_PUBLIC_PAYPAL_CHECKOUT_CREATOR_LAUNCH_URL
      : key === "studio-pro"
        ? process.env.NEXT_PUBLIC_PAYPAL_CHECKOUT_STUDIO_PRO_URL
        : process.env.NEXT_PUBLIC_PAYPAL_CHECKOUT_NETWORK_PLATFORM_URL

  const trimmed = raw?.trim()
  if (trimmed && /^https?:\/\//i.test(trimmed)) {
    return trimmed
  }

  // Safe placeholder so buttons stay external links in dev; replace via env for live checkout.
  return "https://www.paypal.com/ncp/checkout"
}
