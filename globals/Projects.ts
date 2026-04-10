import type { GlobalConfig } from "payload"

import { adminRowsStartCollapsed } from "@/lib/payload-admin-defaults"

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
          type: "upload",
          relationTo: "media",
          required: true,
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

