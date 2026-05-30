"use client"

import dynamic from "next/dynamic"
import { useCallback, useEffect, useState } from "react"
import { X, Calendar as CalendarIcon, Clock, Phone, Mail, User } from "lucide-react"
import { submitCallRequest } from "../lib/call-request"

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

type ScheduleACallLightboxProps = {
  /** If Option A is selected, sets body attributes matching the 'bookings' collection schema */
  useBookingsOption?: boolean
}

export function ScheduleACallLightbox({
  useBookingsOption = false,
}: ScheduleACallLightboxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [preferredTime, setPreferredTime] = useState<string>("")
  const [timeDropdownOpen, setTimeDropdownOpen] = useState(false)
  const [bookingName, setBookingName] = useState("")
  const [bookingEmail, setBookingEmail] = useState("")
  const [bookingPhone, setBookingPhone] = useState("")
  const [scheduleError, setScheduleError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingToast, setBookingToast] = useState<string | null>(null)

  const resetForm = useCallback(() => {
    setSelectedDate(undefined)
    setPreferredTime("")
    setTimeDropdownOpen(false)
    setBookingName("")
    setBookingEmail("")
    setBookingPhone("")
    setScheduleError(null)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    resetForm()
  }, [isOpen, resetForm])

  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [isOpen])

  function openModal() {
    setIsOpen(true)
  }

  function closeModal() {
    resetForm()
    setIsOpen(false)
  }

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
      const tz =
        typeof Intl !== "undefined"
          ? Intl.DateTimeFormat().resolvedOptions().timeZone
          : null

      const result = await submitCallRequest({
        name: bookingName.trim(),
        email: bookingEmail.trim().toLowerCase(),
        phone: bookingPhone.trim(),
        preferredDate: toLocalDateKey(selectedDate),
        preferredTime: preferredTime,
        timeZone: tz,
      }, useBookingsOption)

      if (!result.ok) {
        setScheduleError(
          result.message || "Something went wrong. Please try again.",
        )
        return
      }
      closeModal()
      setBookingToast("Call scheduled. We sent your confirmation details.")
      setTimeout(() => setBookingToast(null), 4500)
    } catch {
      setScheduleError("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Toast Alert */}
      {bookingToast && (
        <div className="fixed bottom-5 right-5 z-[9999] animate-in fade-in slide-in-from-bottom-5">
          <div className={goldNoticeClass}>{bookingToast}</div>
        </div>
      )}

      {/* Trigger Button */}
      <button
        onClick={openModal}
        className="w-full cursor-pointer bg-accent text-black hover:opacity-90 h-12 sm:h-14 text-sm sm:text-base font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 glow-accent-sm"
      >
        Schedule a Call
        <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>

      {/* Standalone Lightbox Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-300"
            onClick={closeModal}
          />

          <div className="relative z-10 w-full max-w-4xl overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0e12] shadow-2xl transition-all duration-300">
            
            {/* Top Brand Ribbon */}
            <div
              className="h-1.5 w-full"
              style={{
                background: `linear-gradient(90deg, ${goldPrimary} 0%, #1a1b23 100%)`,
              }}
            />

            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-20 flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-[#16171f] text-muted-foreground transition-all duration-200 hover:border-white/15 hover:text-white"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-12">
              {/* Left Info Panel */}
              <div className="col-span-1 border-b border-white/[0.06] bg-[#0a0a0d] p-6 md:col-span-4 md:border-b-0 md:border-r">
                <div className="flex h-full flex-col justify-between">
                  <div>
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-[#D4AF37]/20 bg-[#D4AF37]/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">
                      Quick Booking
                    </div>
                    <h3 className="mt-4 text-xl font-bold tracking-tight text-white">
                      Schedule a Call
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      Pick an appointment date and enter your contact details on one single screen to lock in your consultation session.
                    </p>
                  </div>

                  <div className="mt-8 space-y-4 md:mt-0">
                    <div className="rounded-xl border border-white/[0.04] bg-[#111217] p-3">
                      <div className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Clock className="h-3 w-3" /> Duration
                      </div>
                      <div className="mt-0.5 text-sm font-semibold text-white">
                        15 Minute Call
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Single-Step Booking Grid */}
              <div className="col-span-1 flex flex-col p-6 md:col-span-8 overflow-y-auto max-h-[85vh]">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  
                  {/* Left Column: Calendar Date Selection */}
                  <div className="space-y-4">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <CalendarIcon className="h-3.5 w-3.5 text-[#D4AF37]" /> 1. Select Date
                    </span>
                    <div className="flex justify-center rounded-xl border border-white/[0.06] bg-[#090a0d] p-2">
                      <ScheduleCalendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={{ before: new Date() }}
                        className="p-1"
                      />
                    </div>
                  </div>

                  {/* Right Column: Time Slot & User Info */}
                  <div className="space-y-5">
                    
                    {/* Time Slot Selection */}
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-[#D4AF37]" /> 2. Preferred Time
                      </span>
                      
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setTimeDropdownOpen(!timeDropdownOpen)}
                          className="flex w-full items-center justify-between rounded-lg border border-white/[0.08] bg-[#090a0d] px-3.5 py-2.5 text-sm text-white focus:border-[#D4AF37]"
                        >
                          <span className={preferredTime ? "text-white" : "text-muted-foreground/60"}>
                            {preferredTime || "Choose a time slot..."}
                          </span>
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        </button>

                        {timeDropdownOpen && (
                          <div className="absolute z-30 mt-1 max-h-[160px] w-full overflow-y-auto rounded-lg border border-white/[0.08] bg-[#111217] p-1.5 shadow-xl scrollbar-thin">
                            <div className="grid grid-cols-2 gap-1.5">
                              {CALL_TIME_SLOTS.map((time) => (
                                <button
                                  key={time}
                                  type="button"
                                  onClick={() => {
                                    setPreferredTime(time)
                                    setTimeDropdownOpen(false)
                                  }}
                                  className={`rounded-md py-1.5 text-center text-xs font-medium transition-all ${
                                    preferredTime === time
                                      ? "bg-[#D4AF37] text-black"
                                      : "bg-[#16171f] text-white hover:bg-[#1f212a]"
                                  }`}
                                >
                                  {time}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Contact Details Form */}
                    <div className="space-y-3.5">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-[#D4AF37]" /> 3. Contact Details
                      </span>

                      {/* Name */}
                      <div className="space-y-1">
                        <input
                          type="text"
                          placeholder="Your Full Name"
                          value={bookingName}
                          onChange={(e) => setBookingName(e.target.value)}
                          className="w-full rounded-lg border border-white/[0.08] bg-[#090a0d] px-3.5 py-2 text-sm text-white placeholder-muted-foreground/50 transition-colors focus:border-[#D4AF37] focus:outline-none"
                        />
                      </div>

                      {/* Email */}
                      <div className="space-y-1">
                        <input
                          type="email"
                          placeholder="Email Address"
                          value={bookingEmail}
                          onChange={(e) => setBookingEmail(e.target.value)}
                          className="w-full rounded-lg border border-white/[0.08] bg-[#090a0d] px-3.5 py-2 text-sm text-white placeholder-muted-foreground/50 transition-colors focus:border-[#D4AF37] focus:outline-none"
                        />
                      </div>

                      {/* Phone */}
                      <div className="space-y-1">
                        <input
                          type="tel"
                          placeholder="Phone Number"
                          value={bookingPhone}
                          onChange={(e) =>
                            setBookingPhone(formatPhoneInput(e.target.value))
                          }
                          className="w-full rounded-lg border border-white/[0.08] bg-[#090a0d] px-3.5 py-2 text-sm text-white placeholder-muted-foreground/50 transition-colors focus:border-[#D4AF37] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {scheduleError && (
                  <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs font-medium text-red-400 mt-5">
                    {scheduleError}
                  </div>
                )}

                {/* Submitting Actions Footer */}
                <div className="flex items-center justify-between border-t border-white/[0.06] pt-4 mt-6">
                  <span className="text-xs text-muted-foreground">
                    {selectedDate && preferredTime
                      ? `${selectedDate.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })} at ${preferredTime}`
                      : "No slot selected"}
                  </span>
                  <button
                    onClick={handleBookingSubmit}
                    disabled={isSubmitting}
                    className="rounded-lg bg-white px-6 py-2.5 text-xs font-bold text-black transition-all duration-200 hover:bg-neutral-200 disabled:opacity-40"
                  >
                    {isSubmitting ? "Scheduling..." : "Schedule Call"}
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
