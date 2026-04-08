import type { Access, CollectionConfig } from "payload"

const adminOnly: Access = ({ req: { user } }) => Boolean(user)

export const Pages: CollectionConfig = {
  slug: "pages",
  admin: {
    group: "Site",
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "updatedAt"],
    description: "Core managed pages with SEO metadata in the SEO tab.",
  },
  access: {
    read: () => true,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: {
        description: "URL path segment, e.g. about or contact.",
      },
    },
    {
      name: "description",
      type: "textarea",
      admin: {
        description: "Short page summary used as fallback meta description.",
      },
    },
  ],
}

