import {
  EMAIL_BG_CARD,
  EMAIL_BG_OUTER,
  EMAIL_MSC_GOLD,
  EMAIL_MSC_GOLD_LINK,
  EMAIL_STYLE_BUTTON_ON_GOLD,
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
        text-decoration: none !important;
      }
    </style>
  </head>`.trim()

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
                  Thanks for scheduling with us. We received your request for:
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
                  <a href="mailto:${email}">${email}</a>
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
