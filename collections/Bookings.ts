import type { Access, CollectionConfig } from "payload"
import { getNotificationConfig } from "../lib/notifications"

const adminOnly: Access = ({ req: { user } }) => Boolean(user)

export const Bookings: CollectionConfig = {
  slug: "bookings",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "email", "phone", "appointmentDate", "createdAt"],
    group: "Marketing",
    description: "Two-step booking requests submitted from the marketing modal.",
  },
  access: {
    create: () => true,
    read: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    { name: "name", type: "text", required: true },
    {
      name: "email",
      type: "email",
      required: true,
      index: true,
    },
    { name: "phone", type: "text", required: true },
    {
      name: "appointmentDate",
      type: "date",
      required: true,
      admin: {
        date: {
          pickerAppearance: "dayAndTime",
        },
      },
    },
    {
      name: "message",
      type: "textarea",
    },
    // Keep legacy fields hidden so local schema migration does not block on rename prompts.
    {
      name: "source",
      type: "text",
      admin: { hidden: true },
    },
    {
      name: "preferredDateLocal",
      type: "text",
      admin: { hidden: true },
    },
    {
      name: "preferredTimeLocal",
      type: "text",
      admin: { hidden: true },
    },
    {
      name: "timeZone",
      type: "text",
      admin: { hidden: true },
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== "create") return

        const appointmentLabel = new Date(doc.appointmentDate).toLocaleString(
          "en-US",
          {
            dateStyle: "full",
            timeStyle: "short",
          }
        )

        const userHTML = `
<!doctype html>
<html>
  <head>
    <style>
      a, a:link, a:visited, a:hover, a:active {
        color: #D4AF37 !important;
        text-decoration: none !important;
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background:#0b0b0f;font-family:Inter,Segoe UI,Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#15151c;border:1px solid rgba(255,255,255,0.12);border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:28px 28px 18px;">
                <div style="display:inline-block;background:rgba(245,184,65,0.12);color:#f5b841;border:1px solid rgba(245,184,65,0.35);border-radius:999px;padding:6px 12px;font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;">
                  Booking Confirmed
                </div>
                <h1 style="margin:14px 0 10px;color:#f3f4f6;font-size:24px;line-height:1.3;">You're booked, ${doc.name}</h1>
                <p style="margin:0;color:#a3a3ad;font-size:15px;line-height:1.6;">
                  Thanks for scheduling with My Studio Channel. We received your request for:
                </p>
                <p style="margin:12px 0 0;color:#f5b841;font-size:16px;font-weight:700;line-height:1.5;">
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

        const adminHTML = `
<!doctype html>
<html>
  <head>
    <style>
      a, a:link, a:visited, a:hover, a:active {
        color: #D4AF37 !important;
        text-decoration: none !important;
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background:#0b0b0f;font-family:Inter,Segoe UI,Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#15151c;border:1px solid rgba(255,255,255,0.12);border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:28px;">
                <div style="display:inline-block;background:rgba(245,184,65,0.12);color:#f5b841;border:1px solid rgba(245,184,65,0.35);border-radius:999px;padding:6px 12px;font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;">
                  New Booking Alert
                </div>
                <h1 style="margin:14px 0 10px;color:#f3f4f6;font-size:24px;line-height:1.3;">New consultation request</h1>
                <p style="margin:6px 0;color:#d4d4dc;font-size:14px;"><strong>Name:</strong> ${doc.name}</p>
                <p style="margin:6px 0;color:#d4d4dc;font-size:14px;">
                  <strong>Email:</strong>
                  <a href="mailto:${doc.email}" style="color:#D4AF37 !important;text-decoration:none !important;">${doc.email}</a>
                </p>
                <p style="margin:6px 0;color:#d4d4dc;font-size:14px;"><strong>Phone:</strong> ${doc.phone || "Not provided"}</p>
                <p style="margin:6px 0;color:#d4d4dc;font-size:14px;"><strong>Appointment:</strong> ${appointmentLabel}</p>
                <p style="margin:12px 0 0;color:#d4d4dc;font-size:14px;"><strong>Message:</strong><br/>${doc.message || "No message provided."}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`.trim()

        const notifications = await getNotificationConfig(req)

        try {
          await req.payload.sendEmail({
            to: doc.email,
            from: notifications.systemFromEmail,
            subject: "Booking Confirmed - My Studio Channel",
            html: userHTML,
          })
        } catch (error) {
          req.payload.logger.error(
            `[bookings-email] User confirmation email failed for booking ${String(
              doc.id
            )}: ${error instanceof Error ? error.message : "unknown error"}`
          )
        }

        if (notifications.enableAdminNotifications) {
          try {
            await req.payload.sendEmail({
              to: notifications.adminRecipients,
              from: notifications.systemFromEmail,
              subject: "New Booking Alert - My Studio Channel",
              html: adminHTML,
            })
          } catch (error) {
            req.payload.logger.error(
              `[bookings-email] Admin alert email failed for booking ${String(
                doc.id
              )}: ${error instanceof Error ? error.message : "unknown error"}`
            )
          }
        }
      },
    ],
  },
}
