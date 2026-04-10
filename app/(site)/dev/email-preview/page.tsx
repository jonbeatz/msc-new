import { notFound } from "next/navigation"

const templates = [
  {
    title: "Stay In the Loop (Verify Email)",
    html: `<!doctype html><html><body style="margin:0;background:#0b0b0f;font-family:Inter,Segoe UI,Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="padding:24px;"><tr><td align="center"><table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#15151c;border:1px solid rgba(255,255,255,0.12);border-radius:16px;"><tr><td style="padding:28px;"><div style="display:inline-block;background:rgba(245,184,65,0.12);color:#f5b841;border:1px solid rgba(245,184,65,0.35);border-radius:999px;padding:6px 12px;font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;">Stay in the Loop</div><h1 style="margin:14px 0 10px;color:#f3f4f6;font-size:24px;line-height:1.3;">Verify your email address</h1><p style="margin:0;color:#a3a3ad;font-size:15px;line-height:1.6;">Thanks for signing up. Confirm your email to complete your newsletter subscription.</p><a href="#" style="display:inline-block;margin-top:16px;background:#D4AF37;color:#101114;text-decoration:none;font-weight:700;font-size:14px;border-radius:10px;padding:12px 18px;">Verify Email</a></td></tr></table></td></tr></table></body></html>`,
  },
  {
    title: "Schedule a Call (Booking Confirmed)",
    html: `<!doctype html><html><body style="margin:0;background:#0b0b0f;font-family:Inter,Segoe UI,Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="padding:24px;"><tr><td align="center"><table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#15151c;border:1px solid rgba(255,255,255,0.12);border-radius:16px;"><tr><td style="padding:28px;"><div style="display:inline-block;background:rgba(245,184,65,0.12);color:#f5b841;border:1px solid rgba(245,184,65,0.35);border-radius:999px;padding:6px 12px;font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;">Booking Confirmed</div><h1 style="margin:14px 0 10px;color:#f3f4f6;font-size:24px;line-height:1.3;">You're booked, Jon</h1><p style="margin:0;color:#a3a3ad;font-size:15px;line-height:1.6;">Thanks for scheduling with My Studio Channel. We received your request for:</p><p style="margin:12px 0 0;color:#f5b841;font-size:16px;font-weight:700;line-height:1.5;">Thursday, April 10, 2026 at 2:00 PM</p></td></tr></table></td></tr></table></body></html>`,
  },
  {
    title: "Admin New Message Alert",
    html: `<!doctype html><html><body style="margin:0;background:#0b0b0f;font-family:Inter,Segoe UI,Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="padding:24px;"><tr><td align="center"><table width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#15151c;border:1px solid rgba(255,255,255,0.12);border-radius:16px;"><tr><td style="padding:28px;"><div style="display:inline-block;background:rgba(245,184,65,0.12);color:#f5b841;border:1px solid rgba(245,184,65,0.35);border-radius:999px;padding:6px 12px;font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;">New Lead Alert</div><h1 style="margin:14px 0 10px;color:#f3f4f6;font-size:24px;line-height:1.3;">New newsletter signup</h1><p style="margin:6px 0;color:#d4d4dc;font-size:14px;"><strong>Email:</strong> hello@example.com</p></td></tr></table></td></tr></table></body></html>`,
  },
]

export default function EmailPreviewPage() {
  if (process.env.NODE_ENV === "production" || process.env.ENABLE_DEV_LAB === "false") {
    notFound()
  }

  return (
    <main style={{ padding: "2rem", background: "#0b0b0f", minHeight: "100vh", color: "#f3f4f6" }}>
      <h1 style={{ fontSize: "1.75rem", marginBottom: "1rem" }}>Email Template Preview</h1>
      <p style={{ color: "#a3a3ad", marginBottom: "1.5rem" }}>Development preview for the 3 core email templates.</p>
      <div style={{ display: "grid", gap: "1.5rem" }}>
        {templates.map((item) => (
          <section key={item.title} style={{ border: "1px solid #2a2a33", borderRadius: "12px", padding: "1rem", background: "#111118" }}>
            <h2 style={{ marginBottom: "0.75rem", fontSize: "1.1rem" }}>{item.title}</h2>
            <iframe title={item.title} srcDoc={item.html} style={{ width: "100%", height: "420px", border: "1px solid #2f2f3a", borderRadius: "10px", background: "#0b0b0f" }} />
          </section>
        ))}
      </div>
    </main>
  )
}
