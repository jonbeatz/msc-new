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
}
