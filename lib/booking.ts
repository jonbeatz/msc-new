export type BookingRequestPayload = {
  source: "schedule-call-dialog"
  email: string | null
  name?: string | null
  preferredTimeLocal: string | null
  preferredDateLocal: string | null
  timeZone?: string | null
}

/**
 * WordPress example: /wp-json/msc/v1/booking-request
 * Payload: set NEXT_PUBLIC_MSC_BOOKING_URL=payload to POST to /api/bookings
 */
export const BOOKING_API_URL = process.env.NEXT_PUBLIC_MSC_BOOKING_URL ?? ""

function bookingTarget(): "mock" | "payload" | "wordpress" {
  const url = BOOKING_API_URL.trim().toLowerCase()
  if (!url) return "mock"
  if (url === "payload") return "payload"
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
    const base =
      typeof window !== "undefined"
        ? ""
        : process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000"
    const res = await fetch(`${base}/api/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: payload.source,
        email: payload.email || undefined,
        name: payload.name || undefined,
        preferredDateLocal: payload.preferredDateLocal || undefined,
        preferredTimeLocal: payload.preferredTimeLocal || undefined,
        timeZone: payload.timeZone || undefined,
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
