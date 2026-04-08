import type { GlobalConfig } from "payload"

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Site settings",
  admin: {
    group: "Site",
    description:
      "Site-wide SEO labels. Homepage hero copy lives under Homepage.",
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "General",
          fields: [
            {
              name: "siteName",
              type: "text",
              required: true,
              defaultValue: "My Studio Channel",
              admin: {
                description: "Browser tab / share title base.",
              },
            },
            {
              name: "tagline",
              type: "textarea",
              admin: {
                description: "Default meta description (search + social previews).",
              },
            },
          ],
        },
        {
          label: "Notifications",
          fields: [
            {
              name: "enableAdminNotifications",
              type: "checkbox",
              defaultValue: true,
              label: "Enable Admin Notifications",
              admin: {
                description:
                  "When enabled, admin alerts are sent for new bookings and leads.",
              },
            },
            {
              name: "notificationEmails",
              type: "array",
              labels: { singular: "Email", plural: "Notification emails" },
              admin: {
                description:
                  "Primary recipient list for admin alerts. Leave empty to use fallback.",
              },
              fields: [
                {
                  name: "email",
                  type: "email",
                  required: true,
                },
              ],
            },
            {
              name: "effectiveRecipientListPreview",
              type: "ui",
              admin: {
                components: {
                  Field:
                    "@/components/payload-effective-recipient-note#PayloadEffectiveRecipientNote",
                },
              },
            },
            {
              name: "adminFallbackEmail",
              type: "email",
              defaultValue: "jonbeatz@gmail.com",
              label: "Admin Fallback Email",
            },
            {
              name: "systemFromEmail",
              type: "text",
              defaultValue: "onboarding@resend.dev",
              label: "Sender Address",
              admin: {
                description:
                  "This address is used as the from/sender email for notification sends.",
              },
            },
          ],
        },
      ],
    },
  ],
}
