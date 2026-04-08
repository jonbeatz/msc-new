import type { CollectionConfig } from "payload"

export const Media: CollectionConfig = {
  slug: "media",
  admin: {
    description:
      "Images for the marketing site. Hero picks files here via Site → Homepage.",
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
    },
  ],
  upload: true,
}
