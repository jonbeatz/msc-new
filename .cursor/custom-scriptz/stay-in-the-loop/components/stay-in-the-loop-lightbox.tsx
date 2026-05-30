"use client"

import { useState, useEffect } from "react"
import { X, Mail } from "lucide-react"
import { apiRequestUrl } from "../lib/same-origin-api"

function generateTempPassword(): string {
  return `msc_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`
}

export function StayInTheLoopLightbox() {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [verificationToast, setVerificationToast] = useState<{
    tone: "success" | "error"
    message: string
  } | null>(null)

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

  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [isOpen])

  function openModal() {
    setError(null)
    setSuccess(null)
    setEmail("")
    setIsOpen(true)
  }

  function closeModal() {
    setIsOpen(false)
    setError(null)
  }

  async function handleSubmit() {
    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail) {
      setError("Please enter your email address.")
      return
    }
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)
    if (!isValid) {
      setError("Please enter a valid email address.")
      return
    }

    setError(null)
    setIsSubmitting(true)
    try {
      const res = await fetch(apiRequestUrl("/api/leads"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmedEmail,
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
          setError(
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
          setError(
            firstError || json.message || "Signup failed. Please try again."
          )
        } catch {
          setError("Signup failed. Please try again.")
        }
        return
      }

      setSuccess("Check your inbox to verify your email!")
      closeModal()
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Verification success / error toast */}
      {verificationToast && (
        <div className="fixed bottom-5 right-5 z-[9999] animate-in fade-in slide-in-from-bottom-5">
          <div
            className={`rounded-xl border px-4 py-3 text-sm font-medium shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-sm ${
              verificationToast.tone === "success"
                ? "border-[#D4AF37]/45 bg-[#D4AF37]/18 text-[#FCEFC8]"
                : "border-red-500/35 bg-red-500/10 text-red-400"
            }`}
          >
            {verificationToast.message}
          </div>
        </div>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={openModal}
        className="w-full cursor-pointer bg-secondary/50 text-foreground hover:bg-secondary/80 border border-border/50 h-12 sm:h-14 text-sm sm:text-base font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
      >
        Stay in the Loop
        <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>

      {/* Success Status Text */}
      {success && (
        <p
          role="status"
          className="mt-3 rounded-xl border border-[#FFD700]/35 bg-[rgba(255,215,0,0.1)] px-4 py-3 text-center text-sm font-medium text-muted-foreground"
        >
          {success}
        </p>
      )}

      {/* Modal */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justify: "center",
            padding: "1rem",
            backdropFilter: "blur(4px)",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal()
          }}
          className="flex items-center justify-center"
        >
          <div
            style={{
              background: "#0d0e12",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "1rem",
              width: "100%",
              maxWidth: "520px",
              maxHeight: "90vh",
              overflowY: "auto",
              position: "relative",
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Brand Ribbon */}
            <div
              className="h-1.5 w-full"
              style={{
                background: "linear-gradient(90deg, #D4AF37 0%, #1a1b23 100%)",
              }}
            />

            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">
                    Newsletter
                  </div>
                  <h2 className="mt-3 text-xl font-bold tracking-tight text-white">
                    Stay in the Loop
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-[#16171f] text-muted-foreground transition-all duration-200 hover:border-white/15 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Join our newsletter to receive exclusive updates, creator strategy deep dives, and early platform releases directly in your inbox.
              </p>

              <div className="border border-white/[0.06] bg-[#090a0d] rounded-xl p-4 mb-6">
                <label
                  htmlFor="newsletter-email-modal"
                  className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider"
                >
                  Email address
                </label>
                <input
                  id="newsletter-email-modal"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-white/[0.08] bg-[#0c0d11] px-3.5 py-2.5 text-sm text-white placeholder-muted-foreground/50 transition-colors focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs font-medium text-red-400 mb-6 leading-relaxed">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={closeModal}
                  className="text-xs font-bold text-muted-foreground hover:text-white transition-colors px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="rounded-lg bg-white px-5 py-2.5 text-xs font-bold text-black transition-all duration-200 hover:bg-neutral-200 disabled:opacity-40"
                >
                  {isSubmitting ? "Submitting..." : "Subscribe"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
