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
      "Manage demo projects shown in the Demos section. Drag rows to reorder. The first visible row is shown in the large featured card unless one row has ★ Featured checked. Only visible rows appear on the live site.",
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
        // Status row — visible immediately when a row is expanded
        {
          name: "isFeatured",
          type: "checkbox",
          defaultValue: false,
          admin: {
            width: "50%",
            description:
              "★ Shows this project in the large featured card (Demos section). Only one row is featured at a time — the hook clears duplicates on save.",
          },
        },
        {
          name: "isVisible",
          type: "checkbox",
          defaultValue: true,
          admin: {
            width: "50%",
            description:
              "Visible on live site. Uncheck to hide this project without deleting it — useful for work-in-progress entries.",
          },
        },
        // Core content fields
        {
          name: "title",
          type: "text",
          required: true,
          admin: {
            description: "Short project name shown in the demos rail and featured card heading.",
          },
        },
        {
          name: "category",
          type: "text",
          required: true,
          admin: {
            description:
              'Category badge displayed above the title (e.g. "MSC-Platform", "E-Commerce", "Podcast Platform").',
          },
        },
        {
          name: "subtitle",
          type: "textarea",
          required: true,
          admin: {
            description:
              "One or two sentences describing the project. Shown under the title in the featured card and demos list.",
          },
        },
        {
          name: "image",
          type: "relationship",
          relationTo: "media",
          required: true,
          admin: {
            ...projectItemImageRelationshipAdmin,
            description:
              "Preview image for this project. Pick from Media library or upload a new file — each row uses its own image independently.",
          },
        },
        {
          name: "demoUrl",
          type: "text",
          required: true,
          admin: {
            description:
              'Full URL to the live demo (https://...) or an in-page anchor like "#msc-demos". Shown on the "View Live Demo" button.',
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

