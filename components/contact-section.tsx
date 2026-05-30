"use client"

import { Suspense, useEffect, useState } from "react"
import { ArrowRight, Mail, Phone, Calendar, X } from "lucide-react"
import { ContactMessageForm } from "@/components/contact-message-form"
import { ContactScheduleQueryOpener } from "@/components/contact-schedule-query-opener"
import { useBookConsultation } from "@/components/book-consultation-context"
import { apiRequestUrl } from "@/lib/same-origin-api"

/** Optional external scheduling URL; placeholder until a real calendar link is set in env. */
const SCHEDULE_CALL_URL =
  process.env.NEXT_PUBLIC_SCHEDULE_CALL_URL?.trim() ||
  "https://example.com/schedule-call-test"

const contactInfo = [
  {
    icon: Phone,
    label: "Phone",
    value: "(336) 303-1658",
    href: "tel:+13363031658",
  },
  {
    icon: Mail,
    label: "Email",
    value: "Admin@MyStudioChannel.com",
    href: "mailto:Admin@MyStudioChannel.com",
  },
  {
    icon: Calendar,
    label: "Schedule",
    value: "Book a consultation call",
    href: SCHEDULE_CALL_URL,
  },
]

function generateTempPassword(): string {
  return `msc_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`
}

export function ContactSection() {
  const goldPrimary = "#D4AF37"
  const goldNoticeClass =
    "rounded-xl border border-[#D4AF37]/45 bg-[#D4AF37]/18 px-4 py-3 text-sm font-medium text-[#FCEFC8] shadow-[0_0_0_1px_rgba(212,175,55,0.18),0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-sm"
  /** Inline newsletter success — status look, not a primary CTA */
  const newsletterSuccessStatusClass =
    "mt-3 rounded-xl border border-[#FFD700]/35 bg-[rgba(255,215,0,0.1)] px-4 py-3 text-center text-sm font-medium text-muted-foreground"

  const { openBookConsultation } = useBookConsultation()

  const [isNewsletterOpen, setIsNewsletterOpen] = useState(false)
  const [newsletterEmail, setNewsletterEmail] = useState("")
  const [newsletterError, setNewsletterError] = useState<string | null>(null)
  const [newsletterSuccess, setNewsletterSuccess] = useState<string | null>(null)
  const [isNewsletterSubmitting, setIsNewsletterSubmitting] = useState(false)
  const [verificationToast, setVerificationToast] = useState<{
    tone: "success" | "error"
    message: string
  } | null>(null)

  function openNewsletterModal() {
    setNewsletterError(null)
    setNewsletterSuccess(null)
    setIsNewsletterOpen(true)
  }

  function closeNewsletterModal() {
    setIsNewsletterOpen(false)
    setNewsletterError(null)
    setNewsletterEmail("")
  }

  useEffect(() => {
    document.body.style.overflow = isNewsletterOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [isNewsletterOpen])

  useEffect(() => {
    if (typeof window === "undefined") return

    const currentURL = new URL(window.location.href)
    const verified = currentURL.searchParams.get("verified")
    if (verified !== "success" && verified !== "error") return

    setVerificationToast({
      tone: verified,
      message:
        verified === "success"
          ? "Email verified successfully. You are all set."
          : "Verification link is invalid or expired. Please sign up again.",
    })

    currentURL.searchParams.delete("verified")
    const nextURL = `${currentURL.pathname}${currentURL.search}${currentURL.hash}`
    window.history.replaceState({}, "", nextURL)

    const timeout = setTimeout(() => setVerificationToast(null), 4500)
    return () => clearTimeout(timeout)
  }, [])

  async function handleNewsletterSubmit() {
    const email = newsletterEmail.trim().toLowerCase()
    if (!email) {
      setNewsletterError("Please enter your email address.")
      return
    }
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    if (!isValid) {
      setNewsletterError("Please enter a valid email address.")
      return
    }

    setNewsletterError(null)
    setIsNewsletterSubmitting(true)
    try {
      const res = await fetch(apiRequestUrl("/api/leads"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password: generateTempPassword(),
          source: "homepage",
        }),
      })

      if (!res.ok) {
        const text = await res.text().catch(() => "")
        const normalized = text.toLowerCase()
        if (
          normalized.includes("already registered") ||
          normalized.includes("already exists") ||
          normalized.includes("duplicate") ||
          normalized.includes("email")
        ) {
          setNewsletterError(
            "This email is already subscribed. Please check your inbox for your verification email."
          )
          return
        }

        try {
          const json = JSON.parse(text) as {
            errors?: Array<{ message?: string }>
            message?: string
          }
          const firstError = json.errors?.[0]?.message
          setNewsletterError(
            firstError || json.message || "Signup failed. Please try again."
          )
        } catch {
          setNewsletterError("Signup failed. Please try again.")
        }
        return
      }

      setNewsletterSuccess("Check your inbox to verify your email!")
      closeNewsletterModal()
    } catch {
      setNewsletterError("Something went wrong. Please try again.")
    } finally {
      setIsNewsletterSubmitting(false)
    }
  }

  return (
    <>
      <Suspense fallback={null}>
        <ContactScheduleQueryOpener onOpen={openBookConsultation} />
      </Suspense>
      {/* ===== CONTACT SECTION ===== */}
      <section
        className="py-24 lg:py-32 relative bg-surface-2 msc-section msc-surface-2"
        data-divi-section="contact"
      >
        <div id="msc-contact" className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-4 lg:gap-6">
            {/* Left card */}
            <div className="lg:col-span-5 bento-card glass-card rounded-3xl border border-border/50 p-6 sm:p-8 lg:p-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 border border-accent/20 px-4 py-1.5 mb-6">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                <span className="text-xs font-medium uppercase tracking-wider text-accent">Contact</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground leading-tight">
                Ready to Get Started?
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Schedule a consultation or reach out with questions — we&apos;ll walk
                you through the process step by step.
              </p>

              {/* Contact info links */}
              <div className="mt-8 lg:mt-10 space-y-3 lg:space-y-4">
                {contactInfo.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl bg-secondary/30 border border-border/50 hover:border-accent/30 transition-all duration-300 group"
                  >
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-secondary/50 border border-border/50 flex shrink-0 items-center justify-center transition-all duration-300 group-hover:border-accent/30 group-hover:bg-accent/10">
                      <item.icon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground group-hover:text-accent transition-colors" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{item.label}</div>
                      <div className="font-medium text-foreground group-hover:text-accent transition-colors text-sm truncate">{item.value}</div>
                    </div>
                  </a>
                ))}
              </div>

              {/* Schedule CTA */}
              <button
                type="button"
                // ORIGINAL CODE (commented out for temporary redirect):
                // onClick={() => openBookConsultation()}
                // TEMPORARY REDIRECT - Remove when restoring original behavior:
                onClick={() => window.open('https://calendar.app.google/TCwBWFrXztqrErDx5', '_blank', 'noopener,noreferrer')}
                className="mt-6 sm:mt-8 w-full cursor-pointer bg-accent text-black hover:opacity-90 h-12 sm:h-14 text-sm sm:text-base font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 glow-accent-sm"
              >
                Schedule a Call
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>

              <button
                type="button"
                onClick={openNewsletterModal}
                className="mt-3 w-full cursor-pointer bg-secondary/50 text-foreground hover:bg-secondary/80 border border-border/50 h-12 sm:h-14 text-sm sm:text-base font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                Stay in the Loop
                <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>

              {newsletterSuccess && (
                <p role="status" className={newsletterSuccessStatusClass}>
                  {newsletterSuccess}
                </p>
              )}
            </div>

            {/* Right - contact form */}
            <div className="lg:col-span-7 bento-card rounded-3xl border border-border/50 bg-card/30 p-6 sm:p-8 lg:p-10">
              <h3 className="text-xl font-bold text-foreground mb-2">Send a Message</h3>
              <p className="text-sm text-muted-foreground mb-8">Fill out the form below and we&apos;ll get back to you within 24 hours.</p>

              <ContactMessageForm idPrefix="contact" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== NEWSLETTER LIGHTBOX (matches scheduler styling) ===== */}
      {isNewsletterOpen && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 9999, backgroundColor: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
          onClick={(e) => { if (e.target === e.currentTarget) closeNewsletterModal() }}
        >
          <div
            style={{ background: "#1a1a1f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "1rem", padding: "1.5rem", width: "100%", maxWidth: "520px", maxHeight: "90vh", overflowY: "auto", position: "relative" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div>
                <h2 style={{ color: "#f5f5f5", fontWeight: 700, fontSize: "1.1rem", margin: 0 }}>Stay in the Loop</h2>
              </div>
              <button
                type="button"
                onClick={closeNewsletterModal}
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "0.5rem", padding: "0.4rem", cursor: "pointer", display: "flex", alignItems: "center", color: "#aaa" }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.75rem", padding: "1rem", marginBottom: "1rem" }}>
              <label
                htmlFor="newsletter-email"
                style={{ display: "block", color: "#f5f5f5", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem" }}
              >
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  width: "100%",
                  padding: "0.6rem 0.9rem",
                  borderRadius: "0.6rem",
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "#0f0f12",
                  color: "#f5f5f5",
                  fontSize: "0.9rem",
                }}
              />
            </div>

            {newsletterError && (
              <p style={{ color: "#f87171", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "0.5rem", padding: "0.6rem 0.75rem", fontSize: "0.85rem", marginBottom: "1rem" }}>
                {newsletterError}
              </p>
            )}

            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={closeNewsletterModal}
                style={{ padding: "0.6rem 1.25rem", borderRadius: "0.6rem", border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "#aaa", fontSize: "0.9rem", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleNewsletterSubmit}
                disabled={isNewsletterSubmitting}
                style={{ padding: "0.6rem 1.5rem", borderRadius: "0.6rem", border: "none", background: goldPrimary, color: "#111", fontSize: "0.9rem", fontWeight: 700, cursor: isNewsletterSubmitting ? "wait" : "pointer", opacity: isNewsletterSubmitting ? 0.7 : 1 }}
              >
                {isNewsletterSubmitting ? "Saving..." : "Subscribe"}
              </button>
            </div>
          </div>
        </div>
      )}

      {verificationToast && (
        <div className="fixed left-1/2 top-5 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 md:left-auto md:right-5 md:top-auto md:bottom-5 md:w-auto md:translate-x-0">
          <div className={goldNoticeClass}>
            {verificationToast.message}
          </div>
        </div>
      )}
    </>
  )
}
