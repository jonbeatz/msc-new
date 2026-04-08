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
      fields: [
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          required: true,
        },
        {
          name: "eyebrow",
          type: "text",
          required: true,
        },
        {
          name: "headlineLine1",
          type: "text",
          required: true,
        },
        {
          name: "headlineLine2",
          type: "text",
          required: true,
        },
        {
          name: "headlineLine3",
          type: "text",
          required: true,
        },
        {
          name: "sub",
          type: "textarea",
          required: true,
        },
      ],
    },
    {
      name: "heroStats",
      type: "array",
      maxRows: 6,
      labels: { singular: "Stat", plural: "Hero stats" },
      admin: {
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
