import type { GlobalConfig } from "payload"

/**
 * Editable homepage hero: upload images in Media, then pick them on each slide.
 * If no slides are saved, the site keeps built-in hero copy and /public images.
 */
export const Homepage: GlobalConfig = {
  slug: "homepage",
  label: "Homepage",
  admin: {
    group: "Site",
    description:
      "Hero carousel and stat row. Use Media to upload/replace images, then select them per slide.",
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "heroSlides",
      type: "array",
      minRows: 0,
      maxRows: 8,
      labels: { singular: "Hero slide", plural: "Hero slides" },
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: "isActive",
          label: "Active",
          type: "checkbox",
          defaultValue: true,
        },
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          required: true,
        },
        {
          name: "ctaLink",
          label: "CTA link",
          type: "text",
          admin: {
            placeholder: "#msc-contact",
            description:
              "Primary hero CTA URL for this slide. Leave blank to use #msc-contact.",
          },
        },
        {
          name: "eyebrow",
          type: "text",
          required: false,
        },
        {
          name: "headlineLine1",
          type: "text",
          required: false,
        },
        {
          name: "headlineLine2",
          type: "text",
          required: false,
        },
        {
          name: "headlineLine3",
          type: "text",
          required: false,
        },
        {
          name: "sub",
          type: "textarea",
          required: false,
        },
        {
          name: "seo",
          label: "SEO",
          type: "group",
          admin: {
            description:
              "Per-slide SEO controls used when this slide is the active hero context.",
          },
          fields: [
            {
              name: "title",
              type: "text",
              admin: {
                description:
                  "Suggested title for this slide. Leave blank to fall back to Headline line 1.",
              },
            },
            {
              name: "description",
              type: "textarea",
              admin: {
                description:
                  "Suggested meta description. Leave blank to fall back to Sub text.",
              },
            },
            {
              name: "image",
              label: "OpenGraph image",
              type: "upload",
              relationTo: "media",
              admin: {
                description:
                  "Optional social share image. Leave blank to use the slide image.",
              },
            },
          ],
        },
      ],
    },
    {
      name: "heroStats",
      type: "array",
      maxRows: 6,
      labels: { singular: "Stat", plural: "Hero stats" },
      admin: {
        initCollapsed: true,
        description: "Optional. Leave empty to use the default stat row on the site.",
      },
      fields: [
        {
          name: "value",
          type: "text",
          required: true,
        },
        {
          name: "label",
          type: "text",
          required: true,
        },
        {
          name: "highlight",
          type: "checkbox",
          defaultValue: false,
        },
      ],
    },
  ],
}
