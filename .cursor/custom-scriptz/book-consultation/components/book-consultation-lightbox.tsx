"use client"

import dynamic from "next/dynamic"
import { useCallback, useEffect, useState } from "react"
import { X } from "lucide-react"
import { submitBookingRequest } from "../lib/booking"
import { useBookConsultation } from "./book-consultation-context"

const ScheduleCalendar = dynamic(
  () => import("@/components/ui/calendar").then((m) => ({ default: m.Calendar })),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[260px] items-center justify-center text-sm text-muted-foreground">
        Loading calendar...
      </div>
    ),
  },
)

const CALL_TIME_SLOTS = [
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
  "7:00 PM",
  "8:00 PM",
] as const

const BOOKED_SLOT_KEYS = new Set([
  "2026-04-10|10:00 AM",
  "2026-04-10|2:00 PM",
  "2026-04-11|1:00 PM",
])

function toLocalDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

function isValidUSPhone(value: string): boolean {
  return value.replace(/\D/g, "").length === 10
}

const goldPrimary = "#D4AF37"
const goldNoticeClass =
  "rounded-xl border border-[#D4AF37]/45 bg-[#D4AF37]/18 px-4 py-3 text-sm font-medium text-[#FCEFC8] shadow-[0_0_0_1px_rgba(212,175,55,0.18),0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-sm"

type BookConsultationLightboxProps = {
  interestedPackage?: string
}

export function BookConsultationLightbox({
  interestedPackage,
}: BookConsultationLightboxProps) {
  const { isOpen, closeBookConsultation } = useBookConsultation()

  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [preferredTime, setPreferredTime] = useState<string>("")
  const [timeDropdownOpen, setTimeDropdownOpen] = useState(false)
  const [scheduleStep, setScheduleStep] = useState<1 | 2>(1)
  const [bookingName, setBookingName] = useState("")
  const [bookingEmail, setBookingEmail] = useState("")
  const [bookingPhone, setBookingPhone] = useState("")
  const [bookingMessage, setBookingMessage] = useState("")
  const [scheduleError, setScheduleError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingToast, setBookingToast] = useState<string | null>(null)

  const resetForm = useCallback(() => {
    setScheduleStep(1)
    setSelectedDate(undefined)
    setPreferredTime("")
    setTimeDropdownOpen(false)
    setBookingName("")
    setBookingEmail("")
    setBookingPhone("")
    setBookingMessage("")
    setScheduleError(null)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    resetForm()
    if (interestedPackage) {
      setBookingMessage(
        `I'm interested in the ${interestedPackage} package.`,
      )
    }
  }, [isOpen, interestedPackage, resetForm])

  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [isOpen])

  function closeModal() {
    resetForm()
    closeBookConsultation()
  }

  const selectedDateKey = selectedDate ? toLocalDateKey(selectedDate) : null
  const unavailableTimes = selectedDateKey
    ? new Set(
        CALL_TIME_SLOTS.filter((t) =>
          BOOKED_SLOT_KEYS.has(`${selectedDateKey}|${t}`),
        ),
      )
    : new Set<string>()
  const availableTimes = CALL_TIME_SLOTS.filter((t) => !unavailableTimes.has(t))
  const bookedCount = CALL_TIME_SLOTS.length - availableTimes.length

  async function handleBookingSubmit() {
    if (!selectedDate) {
      setScheduleError("Please select a preferred date.")
      return
    }
    if (!preferredTime) {
      setScheduleError("Please choose a preferred time.")
      return
    }
    if (!bookingName.trim()) {
      setScheduleError("Please enter your name.")
      return
    }
    if (!bookingEmail.trim()) {
      setScheduleError("Please enter your email.")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookingEmail.trim())) {
      setScheduleError("Please enter a valid email.")
      return
    }
    if (!bookingPhone.trim()) {
      setScheduleError("Please enter your phone number.")
      return
    }
    if (!isValidUSPhone(bookingPhone)) {
      setScheduleError("Please enter a valid 10-digit phone number.")
      return
    }
    setIsSubmitting(true)
    setScheduleError(null)
    try {
      const appointmentDate = new Date(selectedDate)
      const [time, meridiem] = preferredTime.split(" ")
      const [hoursRaw, minutesRaw] = time.split(":").map((v) => Number(v))
      let hours24 = hoursRaw % 12
      if (meridiem === "PM") hours24 += 12
      appointmentDate.setHours(hours24, minutesRaw, 0, 0)

      const tz =
        typeof Intl !== "undefined"
          ? Intl.DateTimeFormat().resolvedOptions().timeZone
          : null

      const result = await submitBookingRequest({
        name: bookingName.trim(),
        email: bookingEmail.trim().toLowerCase(),
        phone: bookingPhone.trim() || null,
        message: bookingMessage.trim() || null,
        appointmentDate: appointmentDate.toISOString(),
        timeZone: tz,
      })
      if (!result.ok) {
        setScheduleError(
          result.message || "Something went wrong. Please try again.",
        )
        return
      }
      closeModal()
      setBookingToast("Booking confirmed. We sent your confirmation email.")
      setTimeout(() => setBookingToast(null), 4500)
    } catch {
      setScheduleError("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) {
    return (
      <>
        {bookingToast && (
          <div className="fixed bottom-5 right-5 z-[9999] animate-in fade-in slide-in-from-bottom-5">
            <div className={goldNoticeClass}>{bookingToast}</div>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Lightbox backdrop overlay with premium blur */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
        onClick={closeModal}
      />

      {/* Main Lightbox Frame with borders-over-shadows and Gold Accents */}
      <div className="relative z-10 w-full max-w-4xl overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0e12] shadow-2xl transition-all duration-300">
        
        {/* Header Ribbon / Subtle Brand Gold Accent border-top */}
        <div
          className="h-1.5 w-full"
          style={{
            background: `linear-gradient(90deg, ${goldPrimary} 0%, #1a1b23 100%)`,
          }}
        />

        {/* Close button with subtle outline-over-shadow */}
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 z-20 flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-[#16171f] text-muted-foreground transition-all duration-200 hover:border-white/15 hover:text-white"
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Left panel: Info Panel - Bento styled background */}
          <div className="col-span-1 border-b border-white/[0.06] bg-[#0a0a0d] p-6 md:col-span-4 md:border-b-0 md:border-r">
            <div className="flex h-full flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">
                  Consultation
                </div>
                <h3 className="mt-4 text-xl font-bold tracking-tight text-white">
                  Let's Build Your Show
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Secure your session to map out your studio, platform, or customized creator workflow.
                </p>
              </div>

              <div className="mt-8 space-y-4 md:mt-0">
                <div className="rounded-xl border border-white/[0.04] bg-[#111217] p-3">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">
                    Duration
                  </div>
                  <div className="mt-0.5 text-sm font-semibold text-white">
                    45 Minute Deep Dive
                  </div>
                </div>
                <div className="rounded-xl border border-white/[0.04] bg-[#111217] p-3">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">
                    Location
                  </div>
                  <div className="mt-0.5 text-sm font-semibold text-white">
                    Google Meet (Video Call)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel: Scheduling Flow Area */}
          <div className="col-span-1 flex flex-col p-6 md:col-span-8">
            {scheduleStep === 1 ? (
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">
                    Step 1: Pick Date & Time
                  </span>
                  <span className="text-xs text-muted-foreground">1 of 2</span>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {/* Calendar Widget wrapper */}
                  <div className="flex justify-center rounded-xl border border-white/[0.06] bg-[#090a0d] p-2">
                    <ScheduleCalendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={{ before: new Date() }}
                      className="p-1"
                    />
                  </div>

                  {/* Time Slots column */}
                  <div className="flex flex-col space-y-3">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Available Hours
                    </span>
                    {!selectedDate ? (
                      <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-white/[0.08] bg-[#090a0d]/50 p-4 text-center text-sm text-muted-foreground">
                        Select a date on the calendar first.
                      </div>
                    ) : (
                      <div className="flex flex-col space-y-2">
                        {/* Time Slots list with glassmorphism layout scroll */}
                        <div className="max-h-[220px] overflow-y-auto pr-1 space-y-1.5 scrollbar-thin scrollbar-thumb-white/10">
                          {availableTimes.length === 0 ? (
                            <div className="text-center py-8 text-sm text-muted-foreground">
                              No slots available on this date.
                            </div>
                          ) : (
                            availableTimes.map((time) => (
                              <button
                                key={time}
                                onClick={() => setPreferredTime(time)}
                                className={`w-full rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-all duration-200 ${
                                  preferredTime === time
                                    ? "bg-[#D4AF37] text-black"
                                    : "border border-white/[0.06] bg-[#111217] text-white hover:border-white/15"
                                }`}
                              >
                                {time}
                              </button>
                            ))
                          )}
                        </div>

                        {bookedCount > 0 && (
                          <div className="text-[11px] text-muted-foreground/80 italic text-right mt-1">
                            *{bookedCount} slots booked on this day
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Step 1 actions footer */}
                <div className="flex items-center justify-between border-t border-white/[0.06] pt-4 mt-2">
                  <span className="text-xs text-muted-foreground">
                    {selectedDate && preferredTime
                      ? `${selectedDate.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })} at ${preferredTime}`
                      : "No slot selected"}
                  </span>
                  <button
                    disabled={!selectedDate || !preferredTime}
                    onClick={() => setScheduleStep(2)}
                    className="rounded-lg bg-white px-5 py-2 text-xs font-bold text-black transition-all duration-200 hover:bg-neutral-200 disabled:opacity-40 disabled:hover:bg-white"
                  >
                    Continue
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">
                    Step 2: Your Information
                  </span>
                  <span className="text-xs text-muted-foreground">2 of 2</span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Name Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="Jane Doe"
                      value={bookingName}
                      onChange={(e) => setBookingName(e.target.value)}
                      className="w-full rounded-lg border border-white/[0.08] bg-[#090a0d] px-3 py-2 text-sm text-white placeholder-muted-foreground/60 transition-colors focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>

                  {/* Email Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="jane@example.com"
                      value={bookingEmail}
                      onChange={(e) => setBookingEmail(e.target.value)}
                      className="w-full rounded-lg border border-white/[0.08] bg-[#090a0d] px-3 py-2 text-sm text-white placeholder-muted-foreground/60 transition-colors focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>

                  {/* Phone Input with dynamic US format formatting */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">
                      Phone Number (10-Digit US)
                    </label>
                    <input
                      type="tel"
                      placeholder="(555) 000-0000"
                      value={bookingPhone}
                      onChange={(e) =>
                        setBookingPhone(formatPhoneInput(e.target.value))
                      }
                      className="w-full rounded-lg border border-white/[0.08] bg-[#090a0d] px-3 py-2 text-sm text-white placeholder-muted-foreground/60 transition-colors focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>

                  {/* Details / Message text area */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-semibold text-muted-foreground">
                      Additional Details / Goals (Optional)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Tell us about your production goals or current setup..."
                      value={bookingMessage}
                      onChange={(e) => setBookingMessage(e.target.value)}
                      className="w-full rounded-lg border border-white/[0.08] bg-[#090a0d] px-3 py-2 text-sm text-white placeholder-muted-foreground/60 transition-colors focus:border-[#D4AF37] focus:outline-none resize-none"
                    />
                  </div>
                </div>

                {scheduleError && (
                  <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs font-medium text-red-400">
                    {scheduleError}
                  </div>
                )}

                {/* Step 2 actions footer */}
                <div className="flex items-center justify-between border-t border-white/[0.06] pt-4 mt-2">
                  <button
                    onClick={() => {
                      setScheduleError(null)
                      setScheduleStep(1)
                    }}
                    className="text-xs font-bold text-muted-foreground hover:text-white transition-colors"
                  >
                    Back to Step 1
                  </button>
                  <button
                    onClick={handleBookingSubmit}
                    disabled={isSubmitting}
                    className="rounded-lg bg-white px-6 py-2.5 text-xs font-bold text-black transition-all duration-200 hover:bg-neutral-200 disabled:opacity-40"
                  >
                    {isSubmitting ? "Booking..." : "Confirm Booking"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
