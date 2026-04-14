"use client"

import dynamic from "next/dynamic"
import { useCallback, useEffect, useState } from "react"
import { X } from "lucide-react"
import { submitBookingRequest } from "@/lib/booking"
import { useBookConsultation } from "@/components/book-consultation-context"

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
          <div className="fixed left-1/2 top-5 z-[10000] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 md:left-auto md:right-5 md:top-auto md:bottom-5 md:w-auto md:translate-x-0">
            <div className={goldNoticeClass}>{bookingToast}</div>
          </div>
        )}
      </>
    )
  }

  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          backgroundColor: "rgba(0,0,0,0.85)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeModal()
        }}
      >
        <div
          style={{
            background: "#1a1a1f",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "1rem",
            padding: "1.5rem",
            width: "100%",
            maxWidth: "520px",
            maxHeight: "90vh",
            overflowY: "auto",
            position: "relative",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1rem",
            }}
          >
            <div>
              <h2
                style={{
                  color: "#f5f5f5",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  margin: 0,
                }}
              >
                Book a consultation
              </h2>
              <p
                style={{
                  color: "#888",
                  fontSize: "0.8rem",
                  marginTop: "0.25rem",
                }}
              >
                Step {scheduleStep} of 2 — pick a time, then confirm your details.
              </p>
            </div>
            <button
              type="button"
              onClick={closeModal}
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "0.5rem",
                padding: "0.4rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                color: "#aaa",
              }}
            >
              <X size={18} />
            </button>
          </div>

          {scheduleStep === 1 && (
            <>
              <div
                style={{
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "0.75rem",
                  overflow: "hidden",
                  marginBottom: "1rem",
                }}
              >
                <ScheduleCalendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date)
                    setPreferredTime("")
                    setTimeDropdownOpen(false)
                    setScheduleStep(1)
                  }}
                  numberOfMonths={1}
                  className="w-full"
                />
              </div>

              <div
                style={{
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "0.75rem",
                  padding: "1rem",
                  marginBottom: "1rem",
                  position: "relative",
                }}
              >
                <label
                  style={{
                    display: "block",
                    color: "#f5f5f5",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    marginBottom: "0.5rem",
                  }}
                >
                  Preferred call time
                </label>

                <button
                  type="button"
                  disabled={!selectedDate || availableTimes.length === 0}
                  onClick={() => setTimeDropdownOpen((o) => !o)}
                  style={{
                    width: "100%",
                    padding: "0.6rem 0.9rem",
                    borderRadius: "0.6rem",
                    border: timeDropdownOpen
                      ? "1px solid rgba(212,175,55,0.6)"
                      : preferredTime
                        ? "1px solid rgba(212,175,55,0.35)"
                        : "1px solid rgba(255,255,255,0.12)",
                    background: preferredTime
                      ? "rgba(212,175,55,0.08)"
                      : "#0f0f12",
                    color: preferredTime ? goldPrimary : "#666",
                    fontSize: "0.9rem",
                    fontWeight: preferredTime ? 600 : 400,
                    cursor:
                      !selectedDate || availableTimes.length === 0
                        ? "not-allowed"
                        : "pointer",
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
                  <span
                    style={{
                      color: "#666",
                      fontSize: "0.75rem",
                      marginLeft: "0.5rem",
                      transform: timeDropdownOpen
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                      transition: "transform 0.2s",
                    }}
                  >
                    &#9660;
                  </span>
                </button>

                {timeDropdownOpen &&
                  selectedDate &&
                  availableTimes.length > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        left: "1rem",
                        right: "1rem",
                        zIndex: 10,
                        background: "#13131a",
                        border: "1px solid rgba(212,175,55,0.25)",
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
                          onClick={() => {
                            setPreferredTime(time)
                            setTimeDropdownOpen(false)
                            setScheduleStep(2)
                            setScheduleError(null)
                          }}
                          style={{
                            width: "100%",
                            padding: "0.55rem 0.9rem",
                            textAlign: "left",
                            background:
                              preferredTime === time
                                ? "rgba(212,175,55,0.15)"
                                : "transparent",
                            color:
                              preferredTime === time ? goldPrimary : "#ccc",
                            fontWeight: preferredTime === time ? 600 : 400,
                            fontSize: "0.875rem",
                            border: "none",
                            borderBottom: "1px solid rgba(255,255,255,0.04)",
                            cursor: "pointer",
                            transition: "background 0.1s",
                          }}
                          onMouseEnter={(e) => {
                            const el = e.currentTarget as HTMLButtonElement
                            el.style.background = "rgba(212,175,55,0.1)"
                            el.style.color = goldPrimary
                          }}
                          onMouseLeave={(e) => {
                            const el = e.currentTarget as HTMLButtonElement
                            el.style.background =
                              preferredTime === time
                                ? "rgba(212,175,55,0.15)"
                                : "transparent"
                            el.style.color =
                              preferredTime === time ? goldPrimary : "#ccc"
                          }}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  )}

                {selectedDate && availableTimes.length > 0 && (
                  <p
                    style={{
                      color: "#555",
                      fontSize: "0.75rem",
                      marginTop: "0.4rem",
                    }}
                  >
                    {availableTimes.length} available, {bookedCount} booked on
                    this date.
                  </p>
                )}
              </div>
            </>
          )}

          {scheduleStep === 2 && (
            <div
              style={{
                border: "1px solid rgba(212,175,55,0.35)",
                borderRadius: "0.75rem",
                padding: "1rem",
                marginBottom: "1rem",
                background: "rgba(212,175,55,0.06)",
              }}
            >
              <p
                style={{
                  color: goldPrimary,
                  fontSize: "0.8rem",
                  marginBottom: "0.8rem",
                  fontWeight: 700,
                }}
              >
                {selectedDate
                  ? `${selectedDate.toDateString()} at ${preferredTime}`
                  : "Selected slot"}
              </p>
              <div style={{ display: "grid", gap: "0.75rem" }}>
                <input
                  value={bookingName}
                  onChange={(e) => setBookingName(e.target.value)}
                  placeholder="Name *"
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.9rem",
                    borderRadius: "0.6rem",
                    border: "1px solid rgba(212,175,55,0.35)",
                    background: "#101015",
                    color: "#f5f5f5",
                    fontSize: "0.9rem",
                  }}
                />
                <input
                  value={bookingEmail}
                  onChange={(e) => setBookingEmail(e.target.value)}
                  placeholder="Email *"
                  type="email"
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.9rem",
                    borderRadius: "0.6rem",
                    border: "1px solid rgba(212,175,55,0.35)",
                    background: "#101015",
                    color: "#f5f5f5",
                    fontSize: "0.9rem",
                  }}
                />
                <input
                  value={bookingPhone}
                  onChange={(e) =>
                    setBookingPhone(formatPhoneInput(e.target.value))
                  }
                  placeholder="Phone *"
                  inputMode="tel"
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.9rem",
                    borderRadius: "0.6rem",
                    border: "1px solid rgba(212,175,55,0.35)",
                    background: "#101015",
                    color: "#f5f5f5",
                    fontSize: "0.9rem",
                  }}
                />
                <textarea
                  value={bookingMessage}
                  onChange={(e) => setBookingMessage(e.target.value)}
                  placeholder="Message (optional)"
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.9rem",
                    borderRadius: "0.6rem",
                    border: "1px solid rgba(212,175,55,0.35)",
                    background: "#101015",
                    color: "#f5f5f5",
                    fontSize: "0.9rem",
                    resize: "vertical",
                  }}
                />
              </div>
            </div>
          )}

          {scheduleError && (
            <p
              style={{
                color: "#f87171",
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: "0.5rem",
                padding: "0.6rem 0.75rem",
                fontSize: "0.85rem",
                marginBottom: "1rem",
              }}
            >
              {scheduleError}
            </p>
          )}

          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              justifyContent: "flex-end",
            }}
          >
            <button
              type="button"
              onClick={closeModal}
              style={{
                padding: "0.6rem 1.25rem",
                borderRadius: "0.6rem",
                border: "1px solid rgba(255,255,255,0.15)",
                background: "transparent",
                color: "#aaa",
                fontSize: "0.9rem",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            {scheduleStep === 2 ? (
              <>
                <button
                  type="button"
                  onClick={() => setScheduleStep(1)}
                  style={{
                    padding: "0.6rem 1.25rem",
                    borderRadius: "0.6rem",
                    border: "1px solid rgba(255,255,255,0.15)",
                    background: "transparent",
                    color: "#aaa",
                    fontSize: "0.9rem",
                    cursor: "pointer",
                  }}
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleBookingSubmit}
                  disabled={isSubmitting}
                  style={{
                    padding: "0.6rem 1.5rem",
                    borderRadius: "0.6rem",
                    border: "none",
                    background: goldPrimary,
                    color: "#111",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    cursor: isSubmitting ? "wait" : "pointer",
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                >
                  {isSubmitting ? "Saving..." : "Confirm Booking"}
                </button>
              </>
            ) : (
              <button
                type="button"
                disabled
                style={{
                  padding: "0.6rem 1.5rem",
                  borderRadius: "0.6rem",
                  border: "none",
                  background: goldPrimary,
                  color: "#111",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  opacity: 0.35,
                  cursor: "not-allowed",
                }}
              >
                Select a time first
              </button>
            )}
          </div>
        </div>
      </div>

      {bookingToast && (
        <div className="fixed left-1/2 top-5 z-[10000] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 md:left-auto md:right-5 md:top-auto md:bottom-5 md:w-auto md:translate-x-0">
          <div className={goldNoticeClass}>{bookingToast}</div>
        </div>
      )}
    </>
  )
}
