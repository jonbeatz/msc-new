import type { CollectionConfig } from "payload"
import { getNotificationConfig } from "../lib/notifications"

const FALLBACK_ORIGIN = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000"

/**
 * Newsletter / interest signups (future: wire a form to POST /api/leads).
 */
export const Leads: CollectionConfig = {
  slug: "leads",
  endpoints: [
    {
      path: "/verify/:token",
      method: "get",
      handler: async (req) => {
        const requestURL = req.url
          ? new URL(req.url, FALLBACK_ORIGIN)
          : new URL("/api/leads/verify", FALLBACK_ORIGIN)
        const tokenFromPath =
          typeof req.routeParams?.token === "string"
            ? req.routeParams.token
            : null
        const tokenFromQuery = requestURL.searchParams.get("token")
        const token = tokenFromPath || tokenFromQuery

        const redirectTo = (status: "success" | "error") => {
          // Return a relative redirect so the browser keeps the current public origin.
          // This avoids proxy/internal hosts like 0.0.0.0 leaking into Location headers.
          return new Response(null, {
            status: 302,
            headers: {
              Location: "/?verified=" + status,
            },
          })
        }

        if (!token) return redirectTo("error")

        try {
          await req.payload.verifyEmail({
            collection: "leads",
            token,
            req,
          })
          return redirectTo("success")
        } catch {
          return redirectTo("error")
        }
      },
    },
  ],
  auth: {
    verify: {
      generateEmailSubject: () => "Verify your email - My Studio Channel",
      generateEmailHTML: ({ token }) => {
        const verificationURL = new URL(`/api/leads/verify/${token}`, FALLBACK_ORIGIN).toString()
        return `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="color-scheme" content="dark light" />
    <meta name="supported-color-schemes" content="dark light" />
    <title>Verify your email</title>
    <style>
      :root { color-scheme: dark; supported-color-schemes: dark; }
      body, table, td, p, h1 { color: #f3f4f6 !important; }
      a, a:link, a:visited, a:hover, a:active {
        color: #D4AF37 !important;
        text-decoration: none !important;
      }
      a[x-apple-data-detectors], .apple-link a {
        color: #D4AF37 !important;
        text-decoration: none !important;
      }
    </style>
  </head>
  <body bgcolor="#0b0b0f" style="margin:0;padding:0;background:#0b0b0f !important;font-family:Inter,Segoe UI,Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="#0b0b0f" style="padding:24px;background:#0b0b0f !important;">
      <tr>
        <td align="center" bgcolor="#0b0b0f">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="#15151c" style="max-width:560px;background:#15151c !important;border:1px solid rgba(255,255,255,0.12);border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:28px 28px 18px;">
                <div style="display:inline-block;background:rgba(245,184,65,0.12);color:#f5b841;border:1px solid rgba(245,184,65,0.35);border-radius:999px;padding:6px 12px;font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;">
                  Stay in the Loop
                </div>
                <h1 style="margin:14px 0 10px;color:#f3f4f6;font-size:24px;line-height:1.3;">Verify your email address</h1>
                <p style="margin:0;color:#a3a3ad;font-size:15px;line-height:1.6;">
                  Thanks for signing up. Confirm your email to complete your newsletter subscription.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 28px;">
                <a href="${verificationURL}" style="display:inline-block;background:#D4AF37;color:#101114 !important;text-decoration:none !important;font-weight:700;font-size:14px;border-radius:10px;padding:12px 18px;">
                  Verify Email
                </a>
                <p style="margin:16px 0 0;color:#7b7b87;font-size:12px;line-height:1.5;">
                  If the button does not work, copy and paste this link into your browser:<br />
                  <a href="${verificationURL}" style="color:#D4AF37 !important;text-decoration:none !important;">${verificationURL}</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`.trim()
      },
    },
  },
  labels: {
    singular: "Lead",
    plural: "Leads",
  },
  admin: {
    useAsTitle: "email",
    defaultColumns: ["email", "source", "createdAt"],
    group: "Marketing",
    description: "Captured emails from future landing forms or integrations.",
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => true,
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: "name",
      type: "text",
    },
    {
      name: "source",
      type: "select",
      defaultValue: "homepage",
      options: [
        { label: "Homepage", value: "homepage" },
        { label: "Contact / schedule", value: "contact" },
        { label: "Other", value: "other" },
      ],
    },
    {
      name: "message",
      type: "textarea",
      admin: {
        description: "Optional note from the visitor.",
      },
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== "create") return

        const notifications = await getNotificationConfig(req)
        if (!notifications.enableAdminNotifications) return

        const adminHTML = `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="color-scheme" content="dark light" />
    <meta name="supported-color-schemes" content="dark light" />
    <style>
      :root { color-scheme: dark; supported-color-schemes: dark; }
      body, table, td, p, h1 { color: #f3f4f6 !important; }
      a, a:link, a:visited, a:hover, a:active {
        color: #D4AF37 !important;
        text-decoration: none !important;
      }
      a[x-apple-data-detectors], .apple-link a {
        color: #D4AF37 !important;
        text-decoration: none !important;
      }
    </style>
  </head>
  <body bgcolor="#0b0b0f" style="margin:0;padding:0;background:#0b0b0f !important;font-family:Inter,Segoe UI,Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="#0b0b0f" style="padding:24px;background:#0b0b0f !important;">
      <tr>
        <td align="center" bgcolor="#0b0b0f">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="#15151c" style="max-width:620px;background:#15151c !important;border:1px solid rgba(255,255,255,0.12);border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:28px;">
                <div style="display:inline-block;background:rgba(245,184,65,0.12);color:#f5b841;border:1px solid rgba(245,184,65,0.35);border-radius:999px;padding:6px 12px;font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;">
                  New Lead Alert
                </div>
                <h1 style="margin:14px 0 10px;color:#f3f4f6;font-size:24px;line-height:1.3;">New newsletter signup</h1>
                <p style="margin:6px 0;color:#d4d4dc;font-size:14px;">
                  <strong>Email:</strong>
                  <a href="mailto:${doc.email}" style="color:#D4AF37 !important;text-decoration:none !important;">${doc.email}</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`.trim()

        try {
          await req.payload.sendEmail({
            to: notifications.adminRecipients,
            from: notifications.systemFromEmail,
            subject: "New Lead Alert - My Studio Channel",
            html: adminHTML,
          })
        } catch (error) {
          req.payload.logger.error(
            `[leads-email] Admin alert failed for lead ${String(doc.id)}: ${
              error instanceof Error ? error.message : "unknown error"
            }`
          )
        }
      },
    ],
  },
}
