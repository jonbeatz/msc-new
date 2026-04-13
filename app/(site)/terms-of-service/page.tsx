import type { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { getHeaderNavItems } from "@/lib/cms/header"
import { getSiteSettingsCms } from "@/lib/cms/site-settings"

export const metadata: Metadata = {
  title: "Terms of Service | My Studio Channel",
  description:
    "Terms of Service for My Studio Channel — the rules governing use of our website and services.",
}

export default async function TermsOfServicePage() {
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
              Terms of Service
            </h1>
            <p className="mt-4 text-sm text-muted-foreground">
              Last updated: April 2026
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 lg:px-8 py-16">
          <article className="rounded-2xl border border-[#D4AF37]/20 bg-[#0f1014] p-8 sm:p-10 prose prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground prose-a:text-[#D4AF37]">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using the My Studio Channel website and services, you accept and agree
              to be bound by these Terms of Service. If you do not agree, please do not use our site.
            </p>

            <h2>2. Services</h2>
            <p>
              My Studio Channel provides professional studio-style website design, video setup
              consulting, and creator platform development. Service details, pricing, and scope are
              defined per engagement.
            </p>

            <h2>3. Booking and Appointments</h2>
            <p>
              Submitting a booking request does not guarantee a confirmed appointment. We will contact
              you to confirm availability. Cancellations must be made at least 24 hours in advance.
            </p>

            <h2>4. Intellectual Property</h2>
            <p>
              All content on this website — including text, graphics, logos, and code — is the
              property of My Studio Channel unless otherwise noted and may not be reproduced without
              written permission.
            </p>

            <h2>5. Limitation of Liability</h2>
            <p>
              My Studio Channel is not liable for any indirect, incidental, or consequential damages
              arising from the use of our website or services. Our total liability shall not exceed
              the amount paid for the specific service in dispute.
            </p>

            <h2>6. User Conduct</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use the site for unlawful purposes</li>
              <li>Attempt to gain unauthorized access to any part of the site</li>
              <li>Transmit harmful or disruptive code</li>
              <li>Misrepresent your identity when contacting us</li>
            </ul>

            <h2>7. Changes to Terms</h2>
            <p>
              We reserve the right to update these Terms at any time. Continued use of the site
              following changes constitutes acceptance of the new Terms.
            </p>

            <h2>8. Contact</h2>
            <p>
              Questions about these Terms? Reach us via{" "}
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
