import type { CollectionConfig } from "payload"
import {
  buildNewLeadAlertAdminHtml,
  buildVerifyLeadEmailHtml,
} from "../lib/email-templates"
import { getPublicOrigin } from "../lib/public-origin"
import { getNotificationConfig } from "../lib/notifications"

const FALLBACK_ORIGIN = getPublicOrigin()

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
        return buildVerifyLeadEmailHtml(verificationURL)
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

        const adminHTML = buildNewLeadAlertAdminHtml({ email: doc.email })

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
