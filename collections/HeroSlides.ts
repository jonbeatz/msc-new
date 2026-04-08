import type { Access, CollectionConfig } from "payload"

const adminOnly: Access = ({ req: { user } }) => Boolean(user)

export const HeroSlides: CollectionConfig = {
  slug: "hero-slides",
  admin: {
    group: "Site",
    useAsTitle: "headlineLine1",
    defaultColumns: ["headlineLine1", "isActive", "updatedAt"],
    description: "Optional standalone hero slide entries with SEO support.",
  },
  access: {
    read: () => true,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    {
      name: "isActive",
      type: "checkbox",
      defaultValue: true,
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "image",
      type: "relationship",
      relationTo: "media",
      required: true,
    },
    {
      name: "eyebrow",
      type: "text",
    },
    {
      name: "headlineLine1",
      type: "text",
      required: true,
    },
    {
      name: "headlineLine2",
      type: "text",
    },
    {
      name: "headlineLine3",
      type: "text",
    },
    {
      name: "sub",
      type: "textarea",
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (!data || typeof data !== "object") return data

        const next = data as Record<string, unknown>
        const currentMeta =
          next.meta && typeof next.meta === "object"
            ? (next.meta as Record<string, unknown>)
            : {}

        const titleFromSlide =
          typeof next.headlineLine1 === "string" ? next.headlineLine1 : ""
        const descriptionFromSlide =
          typeof next.sub === "string" ? next.sub : ""

        next.meta = {
          title:
            typeof currentMeta.title === "string" && currentMeta.title.length > 0
              ? currentMeta.title
              : titleFromSlide,
          description:
            typeof currentMeta.description === "string" &&
            currentMeta.description.length > 0
              ? currentMeta.description
              : descriptionFromSlide,
          image: currentMeta.image ?? next.image ?? undefined,
        }

        return next
      },
    ],
  },
}

