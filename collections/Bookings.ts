import type { Access, CollectionConfig } from "payload"

const adminOnly: Access = ({ req: { user } }) => Boolean(user)

export const Bookings: CollectionConfig = {
  slug: "bookings",
  admin: {
    useAsTitle: "email",
    defaultColumns: ["email", "preferredDateLocal", "preferredTimeLocal", "createdAt"],
    description: "Schedule-a-call requests from the marketing site.",
  },
  access: {
    // Anonymous visitors can create (browser POST). Tighten later with API key / captcha.
    create: () => true,
    read: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    {
      name: "source",
      type: "text",
      defaultValue: "schedule-call-dialog",
    },
    {
      name: "email",
      type: "email",
    },
    {
      name: "name",
      type: "text",
    },
    {
      name: "preferredDateLocal",
      type: "text",
      label: "Preferred date (local, YYYY-MM-DD)",
    },
    {
      name: "preferredTimeLocal",
      type: "text",
      label: "Preferred time (local label)",
    },
    {
      name: "timeZone",
      type: "text",
      label: "IANA time zone (optional)",
    },
  ],
}
