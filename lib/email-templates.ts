/**
 * Single source of truth for Payload marketing emails.
 * Used by collections (Bookings, Leads) and `app/(site)/dev/email-preview`.
 */
import {
  EMAIL_BG_CARD,
  EMAIL_BG_OUTER,
  EMAIL_MSC_GOLD,
  EMAIL_MSC_GOLD_LINK,
  EMAIL_STYLE_BUTTON_ON_GOLD,
  EMAIL_STYLE_MSC_GOLD_LINK,
  EMAIL_STYLE_MSC_GOLD_TEXT,
} from "./email-brand"

const emailHead = (title?: string) => `
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="color-scheme" content="dark" />
    <meta name="supported-color-schemes" content="dark" />
    <meta name="format-detection" content="telephone=no,address=no,email=no" />
    ${title ? `<title>${title}</title>` : ""}
    <style>
      :root { color-scheme: dark; supported-color-schemes: dark; }
      /* Do not target bare \`p\` with !important — Gmail applies it to children and overrides gold accents on nested strong/span. */
      body, table, td, h1 { color: #f3f4f6 !important; -webkit-text-size-adjust: 100%; }
      a, a:link, a:visited, a:hover, a:active {
        color: ${EMAIL_MSC_GOLD_LINK} !important;
        -webkit-text-fill-color: ${EMAIL_MSC_GOLD_LINK} !important;
        text-decoration: none !important;
      }
      a[x-apple-data-detectors], .apple-link a {
        color: ${EMAIL_MSC_GOLD_LINK} !important;
        -webkit-text-fill-color: ${EMAIL_MSC_GOLD_LINK} !important;
        text-decoration: none !important;
      }
    </style>
  </head>`.trim()

/** Newsletter verify (Leads auth.verify) */
export function buildVerifyLeadEmailHtml(verificationURL: string): string {
  return `
<!doctype html>
<html>
${emailHead("Verify your email")}
  <body bgcolor="${EMAIL_BG_OUTER}" style="margin:0;padding:0;background:${EMAIL_BG_OUTER} !important;font-family:Inter,Segoe UI,Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="${EMAIL_BG_OUTER}" style="padding:40px 20px;background:${EMAIL_BG_OUTER} !important;">
      <tr>
        <td align="center" bgcolor="${EMAIL_BG_OUTER}">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="${EMAIL_BG_CARD}" style="max-width:560px;background:${EMAIL_BG_CARD} !important;border:1px solid rgba(255,255,255,0.12);border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:36px 28px 20px;">
                <div style="display:inline-block;background:rgba(255,215,0,0.12);${EMAIL_STYLE_MSC_GOLD_TEXT}border:1px solid rgba(255,215,0,0.35);border-radius:999px;padding:6px 12px;font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;">
                  Stay in the Loop
                </div>
                <h1 style="margin:14px 0 10px;color:#f3f4f6;font-size:24px;line-height:1.3;">Verify your email address</h1>
                <p style="margin:0;color:#a3a3ad;font-size:15px;line-height:1.6;">
                  Thanks for signing up. Confirm your email to complete your newsletter subscription.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 36px;">
                <a href="${verificationURL}" style="display:inline-block;background:${EMAIL_MSC_GOLD};${EMAIL_STYLE_BUTTON_ON_GOLD}text-decoration:none !important;font-weight:700;font-size:14px;border-radius:10px;padding:12px 18px;">
                  Verify Email
                </a>
                <p style="margin:18px 0 0;color:#7b7b87;font-size:12px;line-height:1.55;">
                  If the button does not work, copy and paste this link into your browser:<br />
                  <a href="${verificationURL}" style="display:inline-block;max-width:100%;${EMAIL_STYLE_MSC_GOLD_TEXT}text-decoration:none !important;word-break:break-all;overflow-wrap:anywhere;-ms-word-break:break-all;">${verificationURL}</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`.trim()
}

export function buildBookingConfirmedEmailHtml(input: {
  name: string
  appointmentLabel: string
}): string {
  const { name, appointmentLabel } = input
  return `
<!doctype html>
<html>
${emailHead()}
  <body bgcolor="${EMAIL_BG_OUTER}" style="margin:0;padding:0;background:${EMAIL_BG_OUTER} !important;font-family:Inter,Segoe UI,Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="${EMAIL_BG_OUTER}" style="padding:40px 20px;background:${EMAIL_BG_OUTER} !important;">
      <tr>
        <td align="center" bgcolor="${EMAIL_BG_OUTER}">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="${EMAIL_BG_CARD}" style="max-width:560px;background:${EMAIL_BG_CARD} !important;border:1px solid rgba(255,255,255,0.12);border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:36px 28px 32px;">
                <div style="display:inline-block;background:rgba(255,215,0,0.12);${EMAIL_STYLE_MSC_GOLD_TEXT}border:1px solid rgba(255,215,0,0.35);border-radius:999px;padding:6px 12px;font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;">
                  Booking Confirmed
                </div>
                <h1 style="margin:14px 0 10px;color:#f3f4f6;font-size:24px;line-height:1.3;">You're booked, ${name}</h1>
                <p style="margin:0;color:#a3a3ad;font-size:15px;line-height:1.6;">
                  Thanks for scheduling with My Studio Channel. We received your request for:
                </p>
                <p style="margin:14px 0 0;${EMAIL_STYLE_MSC_GOLD_TEXT}font-size:17px;font-weight:700;line-height:1.5;">
                  ${appointmentLabel}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`.trim()
}

export function buildNewBookingAlertEmailHtml(input: {
  name: string
  email: string
  phone: string
  appointmentLabel: string
  timeZone: string
  message: string
}): string {
  const { name, email, phone, appointmentLabel, timeZone, message } = input
  return `
<!doctype html>
<html>
${emailHead()}
  <body bgcolor="${EMAIL_BG_OUTER}" style="margin:0;padding:0;background:${EMAIL_BG_OUTER} !important;font-family:Inter,Segoe UI,Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="${EMAIL_BG_OUTER}" style="padding:40px 20px;background:${EMAIL_BG_OUTER} !important;">
      <tr>
        <td align="center" bgcolor="${EMAIL_BG_OUTER}">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="${EMAIL_BG_CARD}" style="max-width:620px;background:${EMAIL_BG_CARD} !important;border:1px solid rgba(255,255,255,0.12);border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:36px 28px 32px;">
                <div style="display:inline-block;background:rgba(255,215,0,0.12);${EMAIL_STYLE_MSC_GOLD_TEXT}border:1px solid rgba(255,215,0,0.35);border-radius:999px;padding:6px 12px;font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;">
                  New Booking Alert
                </div>
                <h1 style="margin:14px 0 10px;color:#f3f4f6;font-size:24px;line-height:1.3;">New consultation request</h1>
                <p style="margin:6px 0;color:#d4d4dc;font-size:14px;"><strong>Name:</strong> ${name}</p>
                <p style="margin:6px 0;color:#d4d4dc;font-size:14px;">
                  <strong>Email:</strong>
                  <a href="mailto:${email}" style="${EMAIL_STYLE_MSC_GOLD_LINK}text-decoration:none !important;">${email}</a>
                </p>
                <p style="margin:6px 0;color:#d4d4dc;font-size:14px;"><strong>Phone:</strong> ${phone}</p>
                <p style="margin:8px 0;${EMAIL_STYLE_MSC_GOLD_TEXT}font-size:14px;line-height:1.55;">
                  <strong style="${EMAIL_STYLE_MSC_GOLD_TEXT}">Appointment:</strong>
                  <span style="${EMAIL_STYLE_MSC_GOLD_TEXT}">${appointmentLabel}</span>
                </p>
                <p style="margin:6px 0;color:#d4d4dc;font-size:14px;"><strong>Time zone:</strong> ${timeZone}</p>
                <p style="margin:12px 0 0;color:#d4d4dc;font-size:14px;"><strong>Message:</strong><br/>${message}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`.trim()
}

function escapeHtmlText(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

/** Message callout: same sans-serif stack as the email body (not monospace). */
const EMAIL_MESSAGE_BOX_STYLE =
  "margin:8px 0 0;padding:14px;background:rgba(0,0,0,0.35);border:1px solid rgba(255,255,255,0.08);border-radius:12px;color:#e5e5e5;font-size:14px;line-height:1.55;white-space:pre-wrap;word-break:break-word;font-family:Inter,Segoe UI,Arial,sans-serif;"

/**
 * Parses the package title from the first line of a package lead message, e.g.
 * `$5,800 package was requested — Creator Launch.`
 */
export function parseLeadPackageDisplayName(
  message: string | null | undefined,
): string {
  if (!message || typeof message !== "string") return "Build package"
  const first = message.split("\n")[0]?.trim() ?? ""
  const m = first.match(/package was requested —\s*(.+?)\s*\.\s*$/)
  const name = (m?.[1] ?? "").trim()
  return name || "Build package"
}

/**
 * Admin email when a visitor uses **Get Started** on Build Packages (marketing modal → Leads).
 * Layout aligned with {@link buildNewBookingAlertEmailHtml}.
 */
export function buildPackageInquiryAdminEmailHtml(input: {
  visitorName: string
  email: string
  phone: string
  packageName: string
  interestMessage: string
}): string {
  const { visitorName, email, phone, packageName, interestMessage } = input
  const esc = escapeHtmlText
  const bodyBlock =
    interestMessage.trim().length > 0
      ? `<p style="margin:12px 0 0;color:#d4d4dc;font-size:14px;line-height:1.55;"><strong>Message:</strong></p>
                <div style="${EMAIL_MESSAGE_BOX_STYLE}">${esc(interestMessage.trim().slice(0, 8000))}</div>`
      : ""
  return `
<!doctype html>
<html>
${emailHead(`New Consultation Request: ${packageName}`)}
  <body bgcolor="${EMAIL_BG_OUTER}" style="margin:0;padding:0;background:${EMAIL_BG_OUTER} !important;font-family:Inter,Segoe UI,Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="${EMAIL_BG_OUTER}" style="padding:40px 20px;background:${EMAIL_BG_OUTER} !important;">
      <tr>
        <td align="center" bgcolor="${EMAIL_BG_OUTER}">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="${EMAIL_BG_CARD}" style="max-width:620px;background:${EMAIL_BG_CARD} !important;border:1px solid rgba(255,255,255,0.12);border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:36px 28px 32px;">
                <div style="display:inline-block;background:rgba(255,215,0,0.12);${EMAIL_STYLE_MSC_GOLD_TEXT}border:1px solid rgba(255,215,0,0.35);border-radius:999px;padding:6px 12px;font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;">
                  Package Inquiry
                </div>
                <h1 style="margin:14px 0 10px;color:#f3f4f6;font-size:24px;line-height:1.3;">New Consultation Request: ${esc(packageName)}</h1>
                <p style="margin:6px 0;color:#d4d4dc;font-size:14px;"><strong>Name:</strong> ${esc(visitorName)}</p>
                <p style="margin:6px 0;color:#d4d4dc;font-size:14px;">
                  <strong>Email:</strong>
                  <a href="mailto:${esc(email)}" style="${EMAIL_STYLE_MSC_GOLD_LINK}text-decoration:none !important;">${esc(email)}</a>
                </p>
                <p style="margin:6px 0;color:#d4d4dc;font-size:14px;"><strong>Phone:</strong> ${esc(phone)}</p>
                ${bodyBlock}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`.trim()
}

export function buildNewLeadAlertAdminHtml(input: {
  email: string
  source?: string | null
  message?: string | null
}): string {
  const { email, source, message } = input
  const headline =
    source === "packages"
      ? `New build package inquiry: ${parseLeadPackageDisplayName(message)}`
      : source === "contact"
        ? "New contact message"
        : source === "homepage"
          ? "New newsletter signup"
          : "New lead"
  const sourceLine =
    source && source !== "homepage"
      ? `<p style="margin:6px 0;color:#d4d4dc;font-size:14px;"><strong>Source:</strong> ${escapeHtmlText(source)}</p>`
      : ""
  const messagePreview =
    message && message.trim().length > 0
      ? `<p style="margin:14px 0 0;color:#d4d4dc;font-size:14px;line-height:1.5;"><strong>Message:</strong></p>
                <div style="${EMAIL_MESSAGE_BOX_STYLE}">${escapeHtmlText(message.trim().slice(0, 8000))}</div>`
      : ""
  return `
<!doctype html>
<html>
${emailHead()}
  <body bgcolor="${EMAIL_BG_OUTER}" style="margin:0;padding:0;background:${EMAIL_BG_OUTER} !important;font-family:Inter,Segoe UI,Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="${EMAIL_BG_OUTER}" style="padding:40px 20px;background:${EMAIL_BG_OUTER} !important;">
      <tr>
        <td align="center" bgcolor="${EMAIL_BG_OUTER}">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="${EMAIL_BG_CARD}" style="max-width:620px;background:${EMAIL_BG_CARD} !important;border:1px solid rgba(255,255,255,0.12);border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:36px 28px 32px;">
                <div style="display:inline-block;background:rgba(255,215,0,0.12);${EMAIL_STYLE_MSC_GOLD_TEXT}border:1px solid rgba(255,215,0,0.35);border-radius:999px;padding:6px 12px;font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;">
                  New Lead Alert
                </div>
                <h1 style="margin:14px 0 10px;color:#f3f4f6;font-size:24px;line-height:1.3;">${escapeHtmlText(headline)}</h1>
                <p style="margin:6px 0;color:#d4d4dc;font-size:14px;">
                  <strong>Email:</strong>
                  <a href="mailto:${escapeHtmlText(email)}" style="${EMAIL_STYLE_MSC_GOLD_TEXT}text-decoration:none !important;">${escapeHtmlText(email)}</a>
                </p>
                ${sourceLine}
                ${messagePreview}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`.trim()
}
