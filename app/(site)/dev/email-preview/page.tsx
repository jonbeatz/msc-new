import { notFound } from "next/navigation"
import {
  buildBookingConfirmedEmailHtml,
  buildNewBookingAlertEmailHtml,
  buildNewLeadAlertAdminHtml,
  buildPackageInquiryAdminEmailHtml,
  buildVerifyLeadEmailHtml,
} from "@/lib/email-templates"
import { getPublicOrigin, resolvePublicUrl } from "@/lib/public-origin"

/** Dev lab: verify → booking user → booking admin → lead admin → package inquiry (Get Started). */
const templates = [
  {
    title: "1/5 — Stay in the Loop (verify email)",
    height: 520,
    html: buildVerifyLeadEmailHtml(
      resolvePublicUrl("/api/leads/verify/preview-token")
    ),
  },
  {
    title: "2/5 — Booking confirmed (user)",
    height: 400,
    html: buildBookingConfirmedEmailHtml({
      name: "Jon",
      appointmentLabel: "Thursday, April 10, 2026 at 2:00 PM",
    }),
  },
  {
    title: "3/5 — New booking alert (admin)",
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
    title: "4/5 — New lead alert (admin)",
    height: 480,
    html: buildNewLeadAlertAdminHtml({
      email: "hello@example.com",
      source: "packages",
      message:
        "$5,800 package was requested — Creator Launch.\n\nSubject: Creator Launch ($5,800)\n\nTell us about your project…",
    }),
  },
  {
    title: "5/5 — Package inquiry (admin, Get Started)",
    height: 560,
    html: buildPackageInquiryAdminEmailHtml({
      visitorName: "Alex Rivera",
      email: "alex.creator@example.com",
      phone: "(336) 555-0142",
      packageName: "Creator Launch",
      interestMessage:
        "$5,800 package was requested — Creator Launch.\n\nSubject: Creator Launch ($5,800)\n\nI'm interested in the Creator Launch package.\n\nTell us about your project…",
    }),
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
        Five previews (including <strong style={{ color: "#e5e5eb" }}>Package inquiry</strong> and{" "}
        <strong style={{ color: "#e5e5eb" }}>New booking alert</strong>) — same HTML as Payload sends, from{" "}
        <code style={{ color: "#d4d4dc" }}>lib/email-templates.ts</code>.
      </p>
      <p style={{ color: "#a3a3ad", marginBottom: "1rem", fontSize: "0.9rem" }}>
        <strong style={{ color: "#e5e5eb" }}>4/5</strong> uses the generic <strong style={{ color: "#e5e5eb" }}>New Lead Alert</strong> template with{" "}
        <code style={{ color: "#d4d4dc" }}>source: packages</code> — H1 includes the parsed package name (e.g. <strong style={{ color: "#e5e5eb" }}>Creator Launch</strong>). Same{" "}
        <strong style={{ color: "#e5e5eb" }}>620px</strong> card as the others. Message body uses the same sans-serif callout as the rest of the email.{" "}
        <strong style={{ color: "#e5e5eb" }}>5/5</strong> is the dedicated <strong style={{ color: "#e5e5eb" }}>Package Inquiry</strong> layout — body copy includes{" "}
        <strong style={{ color: "#e5e5eb" }}>Creator Launch</strong> in the simulated subject block and the interest line.
      </p>
      <p style={{ color: "#a3a3ad", marginBottom: "1rem", fontSize: "0.9rem" }}>
        <strong style={{ color: "#e5e5eb" }}>5/5 email subject (SMTP, not in iframe):</strong>{" "}
        <code style={{ color: "#d4d4dc" }}>New Consultation Request: Creator Launch</code> — set in{" "}
        <code style={{ color: "#d4d4dc" }}>collections/Leads.ts</code> when <code style={{ color: "#d4d4dc" }}>source === &quot;packages&quot;</code>.
      </p>
      <p style={{ color: "#7b7b87", marginBottom: "1.5rem", fontSize: "0.85rem" }}>
        <strong style={{ color: "#a3a3ad" }}>Marketing note:</strong> Build Packages <strong style={{ color: "#e5e5eb" }}>Get Started</strong> opens the contact modal and posts to{" "}
        <code style={{ color: "#d4d4dc" }}>/api/leads</code> (same origin — no CORS). Calendar bookings use{" "}
        <code style={{ color: "#d4d4dc" }}>/api/bookings</code>.
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
