import { apiRequestUrl } from "../lib/same-origin-api"

export type CallRequestPayload = {
  name: string
  email: string
  phone: string
  preferredDate: string // YYYY-MM-DD
  preferredTime: string // slot
  timeZone?: string | null
}

export async function submitCallRequest(
  payload: CallRequestPayload,
  useBookingsOption: boolean = false
): Promise<{ ok: true } | { ok: false; message: string }> {
  // Determine endpoint based on architectural choice (Option A vs Option B)
  const endpoint = useBookingsOption ? "/api/bookings" : "/api/call-requests"

  // Align Payload attributes based on target collection
  const bodyData = useBookingsOption
    ? {
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        appointmentDate: new Date(`${payload.preferredDate}T12:00:00`).toISOString(), // generic fallback datetime
        preferredDateLocal: payload.preferredDate,
        preferredTimeLocal: payload.preferredTime,
        source: "schedule-call",
        timeZone: payload.timeZone || undefined,
        message: "Call requested from Schedule-A-Call single-step form.",
      }
    : {
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        preferredDate: payload.preferredDate,
        preferredTime: payload.preferredTime,
        timeZone: payload.timeZone || undefined,
      }

  const res = await fetch(apiRequestUrl(endpoint), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bodyData),
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
