import type { CollectionConfig } from "payload"
import { buildNewLeadAlertAdminHtml, buildVerifyLeadEmailHtml } from "../lib/email-templates"
import { getPublicOrigin, resolvePublicUrl } from "../lib/public-origin"
import { preflightDeleteAuthUserRows } from "../lib/payload-auth-delete-preflight"
import { getNotificationConfig } from "../lib/notifications"

export const Leads: CollectionConfig = {
  slug: "leads",
  lockDocuments: false,
  endpoints: [
    {
      path: "/verify/:token",
      method: "get",
      handler: async (req) => {
        const base = getPublicOrigin()
        const requestURL = req.url
          ? new URL(req.url, base)
          : new URL("/api/leads/verify", base)
        const tokenFromPath =
          typeof req.routeParams?.token === "string"
            ? req.routeParams.token
            : null
        const tokenFromQuery = requestURL.searchParams.get("token")
        const token = tokenFromPath || tokenFromQuery

        const redirectTo = (status: "success" | "error") => {
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
        const verificationURL = resolvePublicUrl(`/api/leads/verify/${token}`)
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
    description: "Captured emails from newsletter signups, contact submissions, or build forms.",
  },
  access: {
    read: ({ req: { user } }) => !!user,
    create: () => true,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
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
        { label: "Build packages (Get Started)", value: "packages" },
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
    beforeDelete: [preflightDeleteAuthUserRows],
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== "create") return

        const notifications = await getNotificationConfig(req)
        if (!notifications.enableAdminNotifications) return

        const source = typeof doc.source === "string" ? doc.source : null
        const message = typeof doc.message === "string" ? doc.message : null

        const adminHTML = buildNewLeadAlertAdminHtml({
          email: doc.email,
          source,
          message,
        })

        const emailSubject = "New Lead Alert - My Studio Channel"

        try {
          await req.payload.sendEmail({
            to: notifications.adminRecipients,
            from: notifications.systemFromEmail,
            subject: emailSubject,
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
