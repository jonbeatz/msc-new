import { notFound } from "next/navigation"
import {
  buildBookingConfirmedEmailHtml,
  buildNewBookingAlertEmailHtml,
  buildNewLeadAlertAdminHtml,
  buildVerifyLeadEmailHtml,
} from "@/lib/email-templates"
import { getPublicOrigin, resolvePublicUrl } from "@/lib/public-origin"

/** Order matches Payload: verify → booking user → booking admin → lead admin */
const templates = [
  {
    title: "1/4 — Stay in the Loop (verify email)",
    height: 520,
    html: buildVerifyLeadEmailHtml(
      resolvePublicUrl("/api/leads/verify/preview-token")
    ),
  },
  {
    title: "2/4 — Booking confirmed (user)",
    height: 400,
    html: buildBookingConfirmedEmailHtml({
      name: "Jon",
      appointmentLabel: "Thursday, April 10, 2026 at 2:00 PM",
    }),
  },
  {
    title: "3/4 — New booking alert (admin)",
    height: 560,
    html: buildNewBookingAlertEmailHtml({
      name: "Jon Beatz",
      email: "jonbeatz@gmail.com",
      phone: "(562) 985-1212",
      appointmentLabel: "Friday, April 17, 2026 at 1:00 PM",
      timeZone: "America/Los_Angeles",
      message: "My test message here 54321",
    }),
  },
  {
    title: "4/4 — New lead alert (admin)",
    height: 360,
    html: buildNewLeadAlertAdminHtml({ email: "hello@example.com" }),
  },
]

export default function EmailPreviewPage() {
  if (process.env.NODE_ENV === "production" || process.env.ENABLE_DEV_LAB === "false") {
    notFound()
  }

  const publicOrigin = getPublicOrigin()

  return (
    <main style={{ padding: "2rem", background: "#0b0b0f", minHeight: "100vh", color: "#f3f4f6" }}>
      <h1 style={{ fontSize: "1.75rem", marginBottom: "1rem" }}>Email template preview</h1>
      <p style={{ color: "#a3a3ad", marginBottom: "0.5rem" }}>
        Four previews (including <strong style={{ color: "#e5e5eb" }}>New booking alert</strong>) — same HTML as
        Payload, from{" "}
        <code style={{ color: "#d4d4dc" }}>lib/email-templates.ts</code>.
      </p>
      <p style={{ color: "#7b7b87", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
        Verify link sample uses <code style={{ color: "#d4d4dc" }}>resolvePublicUrl</code> from{" "}
        <code style={{ color: "#d4d4dc" }}>NEXT_PUBLIC_SERVER_URL</code> /{" "}
        <code style={{ color: "#d4d4dc" }}>PAYLOAD_PUBLIC_SERVER_URL</code> →{" "}
        <strong style={{ color: "#e5e5eb" }}>{publicOrigin}</strong>
      </p>
      <div style={{ display: "grid", gap: "1.5rem" }}>
        {templates.map((item) => (
          <section
            key={item.title}
            style={{
              border: "1px solid #2a2a33",
              borderRadius: "12px",
              padding: "1rem",
              background: "#111118",
            }}
          >
            <h2 style={{ marginBottom: "0.75rem", fontSize: "1.1rem" }}>{item.title}</h2>
            <iframe
              title={item.title}
              srcDoc={item.html}
              style={{
                width: "100%",
                height: item.height,
                border: "1px solid #2f2f3a",
                borderRadius: "10px",
                background: "#0b0b0f",
              }}
            />
          </section>
        ))}
      </div>
    </main>
  )
}
