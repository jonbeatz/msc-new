import { apiRequestUrl } from "../lib/same-origin-api"

export type BookingRequestPayload = {
  name: string
  email: string
  phone?: string | null
  appointmentDate: string
  message?: string | null
  /** IANA zone from the visitor's browser, e.g. America/New_York */
  timeZone?: string | null
}

/**
 * WordPress example: /wp-json/msc/v1/booking-request
 * Payload: default target is /api/bookings unless NEXT_PUBLIC_MSC_BOOKING_URL points elsewhere
 */
export const BOOKING_API_URL = process.env.NEXT_PUBLIC_MSC_BOOKING_URL ?? ""

function bookingTarget(): "mock" | "payload" | "wordpress" {
  const url = BOOKING_API_URL.trim().toLowerCase()
  if (!url) return "payload"
  if (url === "payload") return "payload"
  if (url === "mock") return "mock"
  return "wordpress"
}

/**
 * Submits a booking. Uses Payload when NEXT_PUBLIC_MSC_BOOKING_URL=payload,
 * otherwise POSTs to BOOKING_API_URL when set (WordPress/custom),
 * otherwise mock delay + console only.
 */
export async function submitBookingRequest(
  payload: BookingRequestPayload
): Promise<{ ok: true } | { ok: false; message: string }> {
  const target = bookingTarget()

  if (target === "mock") {
    await new Promise((resolve) => setTimeout(resolve, 500))
    console.info("Mock booking request payload", {
      payload,
      bookingApiUrl: BOOKING_API_URL || "(not configured)",
    })
    return { ok: true }
  }

  if (target === "payload") {
    const res = await fetch(apiRequestUrl("/api/bookings"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        phone: payload.phone || undefined,
        appointmentDate: payload.appointmentDate,
        message: payload.message || undefined,
        ...(payload.timeZone
          ? { timeZone: payload.timeZone }
          : {}),
      }),
    })
    if (!res.ok) {
      const text = await res.text().catch(() => "")
      return {
        ok: false,
        message: text || `Request failed (${res.status})`,
      }
    }
    return { ok: true }
  }

  // wordpress / custom absolute URL
  const res = await fetch(BOOKING_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    return { ok: false, message: text || `Request failed (${res.status})` }
  }
  return { ok: true }
}
