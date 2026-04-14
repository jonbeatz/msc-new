import type { GlobalConfig } from "payload"

import { adminRowsStartCollapsed } from "@/lib/payload-admin-defaults"

/** Per-row Media picker (drawer) — avoids shared upload UI state across array rows. */
const projectItemImageRelationshipAdmin = {
  appearance: "drawer" as const,
  allowCreate: true,
  allowEdit: true,
}

export const ProjectsGlobal: GlobalConfig = {
  slug: "projects-home",
  label: "Projects",
  admin: {
    group: "Site",
    description:
      "Manage demo projects in one draggable row list, similar to Homepage hero slides.",
  },
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: "projectItems",
      label: "Project items",
      type: "array",
      minRows: 0,
      maxRows: 30,
      labels: { singular: "Project", plural: "Projects" },
      admin: {
        ...adminRowsStartCollapsed,
      },
      fields: [
        {
          name: "title",
          type: "text",
          required: true,
        },
        {
          name: "subtitle",
          type: "textarea",
          required: true,
        },
        {
          name: "category",
          type: "text",
          required: true,
        },
        {
          name: "image",
          type: "relationship",
          relationTo: "media",
          required: true,
          admin: {
            ...projectItemImageRelationshipAdmin,
            description:
              "Preview for this project row only. Pick or create Media per slot (independent of other rows).",
          },
        },
        {
          name: "demoUrl",
          type: "text",
          required: true,
          admin: {
            description: "Live demo URL (https://...) or anchor (#msc-demos).",
          },
        },
        {
          name: "isFeatured",
          type: "checkbox",
          defaultValue: false,
          admin: {
            description:
              "Shows this project in the large featured card on the public homepage (Demos section). Only one row should be featured.",
          },
        },
        {
          name: "isVisible",
          type: "checkbox",
          defaultValue: true,
          admin: {
            description:
              "Must be ON for this project to appear on the live site. When OFF, saves in admin still work but the homepage ignores this row.",
          },
        },
      ],
      hooks: {
        beforeChange: [
          ({ value }) => {
            if (!Array.isArray(value)) return value
            let foundFeatured = false
            return value.map((item) => {
              if (!item || typeof item !== "object") return item
              if ((item as { isFeatured?: boolean }).isFeatured && !foundFeatured) {
                foundFeatured = true
                return item
              }
              if ((item as { isFeatured?: boolean }).isFeatured && foundFeatured) {
                return { ...item, isFeatured: false }
              }
              return item
            })
          },
        ],
      },
    },
  ],
}

