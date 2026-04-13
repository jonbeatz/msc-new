import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { getHeaderNavItems } from "@/lib/cms/header"
import { getSiteSettingsCms } from "@/lib/cms/site-settings"

export const metadata: Metadata = {
  title: "Privacy Policy | My Studio Channel",
  description:
    "Privacy Policy for My Studio Channel — how we collect, use, and protect your information.",
}

export default async function PrivacyPolicyPage() {
  const [navItems, settings] = await Promise.all([
    getHeaderNavItems(),
    getSiteSettingsCms(),
  ])

  return (
    <>
      <Header
        navItems={navItems}
        logoSrc={settings?.siteLogo}
        siteName={settings?.siteName || "My Studio Channel"}
        stickyHeader={settings?.stickyHeader !== false}
      />
      <main className="min-h-screen bg-background">
        <section className="relative overflow-hidden border-b border-white/10 pt-32 pb-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.10),transparent_55%)]" />
          <div className="relative mx-auto max-w-4xl px-6 lg:px-8">
            <p className="mb-4 text-xs uppercase tracking-[0.25em] text-[#D4AF37]">
              Legal
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Privacy Policy
            </h1>
            <p className="mt-4 text-sm text-muted-foreground">
              Last updated: April 2026
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 lg:px-8 py-16">
          <article className="rounded-2xl border border-[#D4AF37]/20 bg-[#0f1014] p-8 sm:p-10 prose prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground prose-a:text-[#D4AF37]">
            <h2>1. Information We Collect</h2>
            <p>
              When you submit a booking request or contact form on My Studio Channel, we collect your
              name, email address, phone number, and any details you provide about your project.
            </p>

            <h2>2. How We Use Your Information</h2>
            <p>We use the information you provide to:</p>
            <ul>
              <li>Respond to your booking or inquiry</li>
              <li>Schedule consultations and studio sessions</li>
              <li>Send service-related communications</li>
              <li>Improve our website and services</li>
            </ul>

            <h2>3. Information Sharing</h2>
            <p>
              We do not sell, trade, or otherwise transfer your personal information to third parties
              without your consent, except where required by law or to provide the services you
              requested (e.g., email delivery providers).
            </p>

            <h2>4. Data Security</h2>
            <p>
              We implement reasonable security measures to protect your personal information. However,
              no method of transmission over the internet is 100% secure.
            </p>

            <h2>5. Cookies</h2>
            <p>
              Our site may use cookies to enhance your experience. You can choose to disable cookies
              through your browser settings.
            </p>

            <h2>6. Third-Party Links</h2>
            <p>
              Our website may contain links to third-party sites. We are not responsible for the
              privacy practices of those sites.
            </p>

            <h2>7. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, contact us at{" "}
              <Link href="/#msc-contact">our contact form</Link>.
            </p>
          </article>
        </section>
      </main>
      <Footer
        logoSrc={settings?.siteLogo}
        siteName={settings?.siteName || "My Studio Channel"}
      />
    </>
  )
}
