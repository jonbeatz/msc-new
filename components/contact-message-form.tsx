"use client"

import { type FormEvent, useState } from "react"
import { ArrowRight } from "lucide-react"
import { apiRequestUrl } from "@/lib/same-origin-api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

function generateTempPassword(): string {
  return `msc_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`
}

export type ContactLeadSource = "homepage" | "contact" | "packages" | "other"

export type ContactMessageFormProps = {
  /** Prefix for input ids when multiple instances exist on one page (e.g. `modal` vs `section`). */
  idPrefix?: string
  /** Initial subject line (e.g. package name + price from pricing cards). */
  initialSubject?: string
  /**
   * Prepended to the stored lead message on submit so admin sees which package was clicked
   * (e.g. "$5,800 package was requested — Creator Launch.").
   */
  packageRequestNote?: string | null
  /** Stored on the Lead as `source` (Payload select). */
  leadSource?: ContactLeadSource
  /** Called after a successful submit (e.g. close modal). */
  onSuccess?: () => void
  className?: string
}

/**
 * Marketing “Send a Message” form → `POST /api/leads` (Payload Leads collection).
 */
export function ContactMessageForm({
  idPrefix = "contact",
  initialSubject,
  packageRequestNote = null,
  leadSource = "contact",
  onSuccess,
  className,
}: ContactMessageFormProps) {
  const pid = (name: string) => `${idPrefix}-${name}`

  const [contactFirstName, setContactFirstName] = useState("")
  const [contactLastName, setContactLastName] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [contactSubject, setContactSubject] = useState(
    () => initialSubject?.trim() ?? "",
  )
  const [contactMessage, setContactMessage] = useState("")
  const [contactError, setContactError] = useState<string | null>(null)
  const [contactSuccess, setContactSuccess] = useState<string | null>(null)
  const [isContactSubmitting, setIsContactSubmitting] = useState(false)

  async function handleContactSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setContactError(null)
    setContactSuccess(null)

    const email = contactEmail.trim().toLowerCase()
    if (!email) {
      setContactError("Please enter your email address.")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setContactError("Please enter a valid email address.")
      return
    }
    const bodyText = contactMessage.trim()
    if (!bodyText) {
      setContactError("Please enter a message.")
      return
    }

    const fullName = [contactFirstName.trim(), contactLastName.trim()]
      .filter(Boolean)
      .join(" ")
      .trim()

    const subjectLine = contactSubject.trim()
    const note = packageRequestNote?.trim()
    const bodyWithPackage = note ? `${note}\n\n${bodyText}` : bodyText
    const messageForLead =
      subjectLine.length > 0
        ? `Subject: ${subjectLine}\n\n${bodyWithPackage}`
        : bodyWithPackage

    setIsContactSubmitting(true)
    try {
      const res = await fetch(apiRequestUrl("/api/leads"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password: generateTempPassword(),
          ...(fullName ? { name: fullName } : {}),
          source: leadSource,
          message: messageForLead,
        }),
      })

      if (!res.ok) {
        const text = await res.text().catch(() => "")
        const normalized = text.toLowerCase()
        if (
          normalized.includes("already registered") ||
          normalized.includes("already exists") ||
          normalized.includes("duplicate")
        ) {
          setContactError(
            "This email is already on file. Check your inbox or use a different address.",
          )
          return
        }
        try {
          const json = JSON.parse(text) as {
            errors?: Array<{ message?: string }>
            message?: string
          }
          const firstError = json.errors?.[0]?.message
          setContactError(
            firstError ||
              json.message ||
              "Could not send your message. Please try again.",
          )
        } catch {
          setContactError("Could not send your message. Please try again.")
        }
        return
      }

      setContactSuccess(
        "Message received. Check your email to verify your address — then we can reply.",
      )
      setContactFirstName("")
      setContactLastName("")
      setContactEmail("")
      setContactSubject("")
      setContactMessage("")
      onSuccess?.()
    } catch {
      setContactError("Something went wrong. Please try again.")
    } finally {
      setIsContactSubmitting(false)
    }
  }

  return (
    <div className={className}>
      {contactSuccess && (
        <p
          role="status"
          className="mb-6 rounded-xl border border-[#FFD700]/35 bg-[rgba(255,215,0,0.1)] px-4 py-3 text-sm font-medium text-muted-foreground"
        >
          {contactSuccess}
        </p>
      )}
      {contactError && (
        <p
          role="alert"
          className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-200"
        >
          {contactError}
        </p>
      )}

      <form className="space-y-4 sm:space-y-6" onSubmit={handleContactSubmit}>
        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label
              htmlFor={pid("firstName")}
              className="block text-xs sm:text-sm font-medium text-foreground mb-2"
            >
              First Name
            </label>
            <Input
              id={pid("firstName")}
              name="firstName"
              autoComplete="given-name"
              value={contactFirstName}
              onChange={(e) => setContactFirstName(e.target.value)}
              placeholder="John"
              className="bg-secondary/30 border-border/50 text-foreground placeholder:text-muted-foreground/50 h-10 sm:h-12 rounded-xl"
            />
          </div>
          <div>
            <label
              htmlFor={pid("lastName")}
              className="block text-xs sm:text-sm font-medium text-foreground mb-2"
            >
              Last Name
            </label>
            <Input
              id={pid("lastName")}
              name="lastName"
              autoComplete="family-name"
              value={contactLastName}
              onChange={(e) => setContactLastName(e.target.value)}
              placeholder="Doe"
              className="bg-secondary/30 border-border/50 text-foreground placeholder:text-muted-foreground/50 h-10 sm:h-12 rounded-xl"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor={pid("email")}
            className="block text-xs sm:text-sm font-medium text-foreground mb-2"
          >
            Email Address
          </label>
          <Input
            id={pid("email")}
            name="email"
            type="email"
            autoComplete="email"
            required
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="john@example.com"
            className="bg-secondary/30 border-border/50 text-foreground placeholder:text-muted-foreground/50 h-10 sm:h-12 rounded-xl"
          />
        </div>
        <div>
          <label
            htmlFor={pid("subject")}
            className="block text-xs sm:text-sm font-medium text-foreground mb-2"
          >
            Subject
          </label>
          <Input
            id={pid("subject")}
            name="subject"
            value={contactSubject}
            onChange={(e) => setContactSubject(e.target.value)}
            placeholder="What's this about?"
            className="bg-secondary/30 border-border/50 text-foreground placeholder:text-muted-foreground/50 h-10 sm:h-12 rounded-xl"
          />
        </div>
        <div>
          <label
            htmlFor={pid("message")}
            className="block text-xs sm:text-sm font-medium text-foreground mb-2"
          >
            Message
          </label>
          <Textarea
            id={pid("message")}
            name="message"
            required
            value={contactMessage}
            onChange={(e) => setContactMessage(e.target.value)}
            placeholder="Tell us about your project..."
            rows={4}
            className="bg-secondary/30 border-border/50 text-foreground placeholder:text-muted-foreground/50 resize-none rounded-xl"
          />
        </div>
        <Button
          type="submit"
          disabled={isContactSubmitting}
          className="w-full bg-secondary/50 text-foreground hover:bg-secondary/80 border border-border/50 h-12 sm:h-14 text-sm sm:text-base font-semibold disabled:opacity-60"
        >
          {isContactSubmitting ? "Sending…" : "Send Message"}
          <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </form>
    </div>
  )
}
