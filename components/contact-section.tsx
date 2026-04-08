"use client"

import dynamic from "next/dynamic"
import { useState } from "react"
import { ArrowRight, Mail, Phone, Calendar, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { submitBookingRequest } from "@/lib/booking"

const ScheduleCalendar = dynamic(
  () => import("@/components/ui/calendar").then((m) => ({ default: m.Calendar })),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[260px] items-center justify-center text-sm text-muted-foreground">
        Loading calendar...
      </div>
    ),
  }
)

const SCHEDULE_CALL_URL = "https://example.com/schedule-call-test"

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

const CALL_TIME_SLOTS = [
  "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM",
  "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM",
] as const

const BOOKED_SLOT_KEYS = new Set([
  "2026-04-10|10:00 AM",
  "2026-04-10|2:00 PM",
  "2026-04-11|1:00 PM",
])

function toLocalDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}


export function ContactSection() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [preferredTime, setPreferredTime] = useState<string>("")
  const [timeDropdownOpen, setTimeDropdownOpen] = useState(false)
  const [scheduleError, setScheduleError] = useState<string | null>(null)
  const [scheduleSuccess, setScheduleSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function openModal() {
    setScheduleError(null)
    setIsOpen(true)
    // prevent page scroll while modal open
    document.body.style.overflow = "hidden"
  }

  function closeModal() {
    setIsOpen(false)
    setSelectedDate(undefined)
    setPreferredTime("")
    setScheduleError(null)
    document.body.style.overflow = ""
  }

  const selectedDateKey = selectedDate ? toLocalDateKey(selectedDate) : null
  const unavailableTimes = selectedDateKey
    ? new Set(CALL_TIME_SLOTS.filter((t) => BOOKED_SLOT_KEYS.has(`${selectedDateKey}|${t}`)))
    : new Set<string>()
  const availableTimes = CALL_TIME_SLOTS.filter((t) => !unavailableTimes.has(t))
  const bookedCount = CALL_TIME_SLOTS.length - availableTimes.length

  async function handleContinue() {
    if (!selectedDate) {
      setScheduleError("Please select a preferred date to continue.")
      return
    }
    if (!preferredTime) {
      setScheduleError("Please choose a preferred time of day.")
      return
    }
    if (selectedDateKey && BOOKED_SLOT_KEYS.has(`${selectedDateKey}|${preferredTime}`)) {
      setScheduleError("That slot is already booked. Please choose another time.")
      return
    }
    setIsSubmitting(true)
    setScheduleError(null)
    try {
      const tz =
        typeof Intl !== "undefined"
          ? Intl.DateTimeFormat().resolvedOptions().timeZone
          : null
      const result = await submitBookingRequest({
        source: "schedule-call-dialog",
        email: null,
        name: null,
        preferredTimeLocal: preferredTime,
        preferredDateLocal: toLocalDateKey(selectedDate),
        timeZone: tz,
      })
      if (!result.ok) {
        setScheduleError(result.message || "Something went wrong. Please try again.")
        return
      }
      setScheduleSuccess("Request received! We will be in touch shortly.")
      closeModal()
    } catch {
      setScheduleError("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* ===== CONTACT SECTION ===== */}
      <section
        id="msc-contact"
        className="py-24 lg:py-32 relative bg-surface-2 msc-section msc-surface-2"
        data-divi-section="contact"
      >
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-4 lg:gap-6">
            {/* Left card */}
            <div className="lg:col-span-5 bento-card glass-card rounded-3xl border border-border/50 p-6 sm:p-8 lg:p-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 border border-accent/20 px-4 py-1.5 mb-6">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                <span className="text-xs font-medium uppercase tracking-wider text-accent">Contact</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground sm:text-4xl leading-tight">
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
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-secondary/50 border border-border/50 flex items-center justify-center group-hover:bg-accent/10 group-hover:border-accent/30 transition-all duration-300 flex-shrink-0">
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
                onClick={openModal}
                className="mt-6 sm:mt-8 w-full bg-accent text-black hover:opacity-90 h-12 sm:h-14 text-sm sm:text-base font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 glow-accent-sm"
              >
                Schedule a Call
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>

              <p className="mt-3 text-xs text-muted-foreground">
                Need direct booking?{" "}
                <a href={SCHEDULE_CALL_URL} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                  Open external link
                </a>
              </p>

              {scheduleSuccess && (
                <p className="mt-3 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-xs text-accent">
                  {scheduleSuccess}
                </p>
              )}
            </div>

            {/* Right - contact form */}
            <div className="lg:col-span-7 bento-card rounded-3xl border border-border/50 bg-card/30 p-6 sm:p-8 lg:p-10">
              <h3 className="text-xl font-bold text-foreground mb-2">Send a Message</h3>
              <p className="text-sm text-muted-foreground mb-8">Fill out the form below and we&apos;ll get back to you within 24 hours.</p>

              <form className="space-y-4 sm:space-y-6">
                <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-xs sm:text-sm font-medium text-foreground mb-2">First Name</label>
                    <Input id="firstName" placeholder="John" className="bg-secondary/30 border-border/50 text-foreground placeholder:text-muted-foreground/50 h-10 sm:h-12 rounded-xl" />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-xs sm:text-sm font-medium text-foreground mb-2">Last Name</label>
                    <Input id="lastName" placeholder="Doe" className="bg-secondary/30 border-border/50 text-foreground placeholder:text-muted-foreground/50 h-10 sm:h-12 rounded-xl" />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-foreground mb-2">Email Address</label>
                  <Input id="email" type="email" placeholder="john@example.com" className="bg-secondary/30 border-border/50 text-foreground placeholder:text-muted-foreground/50 h-10 sm:h-12 rounded-xl" />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-xs sm:text-sm font-medium text-foreground mb-2">Subject</label>
                  <Input id="subject" placeholder="What's this about?" className="bg-secondary/30 border-border/50 text-foreground placeholder:text-muted-foreground/50 h-10 sm:h-12 rounded-xl" />
                </div>
                <div>
                  <label htmlFor="message" className="block text-xs sm:text-sm font-medium text-foreground mb-2">Message</label>
                  <Textarea id="message" placeholder="Tell us about your project..." rows={4} className="bg-secondary/30 border-border/50 text-foreground placeholder:text-muted-foreground/50 resize-none rounded-xl" />
                </div>
                <Button type="submit" className="w-full bg-secondary/50 text-foreground hover:bg-secondary/80 border border-border/50 h-12 sm:h-14 text-sm sm:text-base font-semibold">
                  Send Message
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SCHEDULE LIGHTBOX (plain CSS overlay, no Radix) ===== */}
      {isOpen && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 9999, backgroundColor: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div
            style={{ background: "#1a1a1f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "1rem", padding: "1.5rem", width: "100%", maxWidth: "520px", maxHeight: "90vh", overflowY: "auto", position: "relative" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div>
                <h2 style={{ color: "#f5f5f5", fontWeight: 700, fontSize: "1.1rem", margin: 0 }}>Pick Your Call Window</h2>
                <p style={{ color: "#888", fontSize: "0.8rem", marginTop: "0.25rem" }}>Mock booking — WordPress API connection next.</p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "0.5rem", padding: "0.4rem", cursor: "pointer", display: "flex", alignItems: "center", color: "#aaa" }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Calendar */}
            <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.75rem", overflow: "hidden", marginBottom: "1rem" }}>
              <ScheduleCalendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => { setSelectedDate(date); setPreferredTime(""); setTimeDropdownOpen(false) }}
                numberOfMonths={1}
                className="w-full"
              />
            </div>

            {/* Time picker */}
            <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.75rem", padding: "1rem", marginBottom: "1rem", position: "relative" }}>
              <label style={{ display: "block", color: "#f5f5f5", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem" }}>
                Preferred call time
              </label>

              {/* Custom dropdown trigger */}
              <button
                type="button"
                disabled={!selectedDate || availableTimes.length === 0}
                onClick={() => setTimeDropdownOpen((o) => !o)}
                style={{
                  width: "100%",
                  padding: "0.6rem 0.9rem",
                  borderRadius: "0.6rem",
                  border: timeDropdownOpen
                    ? "1px solid rgba(245,184,65,0.6)"
                    : preferredTime
                    ? "1px solid rgba(245,184,65,0.35)"
                    : "1px solid rgba(255,255,255,0.12)",
                  background: preferredTime ? "rgba(245,184,65,0.08)" : "#0f0f12",
                  color: preferredTime ? "#F5B841" : "#666",
                  fontSize: "0.9rem",
                  fontWeight: preferredTime ? 600 : 400,
                  cursor: !selectedDate ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  textAlign: "left",
                  transition: "border-color 0.15s",
                }}
              >
                <span>
                  {preferredTime
                    ? preferredTime
                    : !selectedDate
                    ? "Pick a date first"
                    : availableTimes.length === 0
                    ? "No slots available"
                    : "Select a time (8AM - 8PM)"}
                </span>
                <span style={{ color: "#666", fontSize: "0.75rem", marginLeft: "0.5rem", transform: timeDropdownOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                  &#9660;
                </span>
              </button>

              {/* Dropdown list */}
              {timeDropdownOpen && selectedDate && availableTimes.length > 0 && (
                <div
                  style={{
                    position: "absolute",
                    left: "1rem",
                    right: "1rem",
                    zIndex: 10,
                    background: "#13131a",
                    border: "1px solid rgba(245,184,65,0.25)",
                    borderRadius: "0.6rem",
                    overflow: "hidden",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
                    maxHeight: "220px",
                    overflowY: "auto",
                  }}
                >
                  {availableTimes.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => { setPreferredTime(time); setTimeDropdownOpen(false) }}
                      style={{
                        width: "100%",
                        padding: "0.55rem 0.9rem",
                        textAlign: "left",
                        background: preferredTime === time ? "rgba(245,184,65,0.15)" : "transparent",
                        color: preferredTime === time ? "#F5B841" : "#ccc",
                        fontWeight: preferredTime === time ? 600 : 400,
                        fontSize: "0.875rem",
                        border: "none",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        cursor: "pointer",
                        transition: "background 0.1s",
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(245,184,65,0.1)"; (e.currentTarget as HTMLButtonElement).style.color = "#F5B841" }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = preferredTime === time ? "rgba(245,184,65,0.15)" : "transparent"; (e.currentTarget as HTMLButtonElement).style.color = preferredTime === time ? "#F5B841" : "#ccc" }}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              )}

              {selectedDate && availableTimes.length > 0 && (
                <p style={{ color: "#555", fontSize: "0.75rem", marginTop: "0.4rem" }}>
                  {availableTimes.length} available, {bookedCount} booked on this date.
                </p>
              )}
            </div>

            {/* Error */}
            {scheduleError && (
              <p style={{ color: "#f87171", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "0.5rem", padding: "0.6rem 0.75rem", fontSize: "0.85rem", marginBottom: "1rem" }}>
                {scheduleError}
              </p>
            )}

            {/* Footer buttons */}
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={closeModal}
                style={{ padding: "0.6rem 1.25rem", borderRadius: "0.6rem", border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: "#aaa", fontSize: "0.9rem", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleContinue}
                disabled={isSubmitting}
                style={{ padding: "0.6rem 1.5rem", borderRadius: "0.6rem", border: "none", background: "#F5B841", color: "#111", fontSize: "0.9rem", fontWeight: 700, cursor: isSubmitting ? "wait" : "pointer", opacity: isSubmitting ? 0.7 : 1 }}
              >
                {isSubmitting ? "Saving..." : "Continue"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
