import type { Access, CollectionConfig } from "payload"
import {
  buildBookingConfirmedEmailHtml,
  buildNewBookingAlertEmailHtml,
} from "../lib/email-templates"
import { getNotificationConfig } from "../lib/notifications"

const adminOnly: Access = ({ req: { user } }) => Boolean(user)

export const Bookings: CollectionConfig = {
  slug: "bookings",
  lockDocuments: false,
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
    delete: ({ req: { user } }) => !!user,
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

        const userHTML = buildBookingConfirmedEmailHtml({
          name: doc.name,
          appointmentLabel,
        })

        const adminHTML = buildNewBookingAlertEmailHtml({
          name: doc.name,
          email: doc.email,
          phone: doc.phone || "Not provided",
          appointmentLabel,
          timeZone: doc.timeZone || "Not captured",
          message: doc.message || "No message provided.",
        })

        const notifications = await getNotificationConfig(req)

        try {
          await req.payload.sendEmail({
            to: doc.email,
            from: notifications.systemFromEmail,
            subject: "Booking Confirmed",
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
              subject: "New Booking Alert",
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
