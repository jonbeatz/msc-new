import type { CollectionConfig } from "payload"

/**
 * Newsletter / interest signups (future: wire a form to POST /api/leads).
 */
export const Leads: CollectionConfig = {
  slug: "leads",
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
      name: "email",
      type: "email",
      required: true,
      index: true,
    },
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
}
