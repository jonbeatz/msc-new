import type { GlobalConfig } from "payload"

import { adminRowsStartCollapsed } from "@/lib/payload-admin-defaults"

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
    update: ({ req }) => Boolean(req.user),
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
            {
              name: "stickyHeader",
              label: "Enable Sticky Header",
              type: "checkbox",
              defaultValue: true,
              admin: {
                description:
                  "When on, the marketing header stays at the top while scrolling with a glass backdrop. When off, the header scrolls with the page.",
              },
            },
          ],
        },
        {
          label: "Branding",
          fields: [
            {
              name: "siteLogo",
              type: "upload",
              relationTo: "media",
              label: "Site Logo",
              admin: {
                description:
                  "Primary logo used in Header and Footer. Prefer a transparent PNG or SVG-style mark.",
              },
            },
            {
              name: "favicon",
              type: "upload",
              relationTo: "media",
              label: "Favicon",
              admin: {
                description: "Recommended size 32x32px (.ico or .png).",
              },
            },
            {
              name: "ogImage",
              type: "upload",
              relationTo: "media",
              label: "Open Graph Image",
              admin: {
                description:
                  "Default social share image when a page does not define a custom OG image.",
              },
            },
            {
              name: "siteTitleSuffix",
              type: "text",
              defaultValue: "| My Studio Channel",
              label: "Site Title Suffix",
              admin: {
                description:
                  "Appended to page titles (example: \"Page Title | My Studio Channel\").",
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
                ...adminRowsStartCollapsed,
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
