import type { GlobalConfig } from "payload"

import { adminRowsStartCollapsed } from "@/lib/payload-admin-defaults"

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
      "Hero carousel, stat row, and Services section screenshot gallery. Upload images in Media, then select them per slide or gallery row. With SQLite and db.push disabled, if this screen errors run: npm run migrate:sqlite:homepage-hero-secondary-cta and npm run migrate:sqlite:homepage-services-gallery",
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
        ...adminRowsStartCollapsed,
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
          name: "secondaryCtaLabel",
          label: "Secondary CTA label",
          type: "text",
          defaultValue: "View Demos",
          admin: {
            description: "Outline button with play icon (e.g. View Demos).",
          },
        },
        {
          name: "secondaryCtaLink",
          label: "Secondary CTA link",
          type: "text",
          defaultValue: "#msc-demos",
          admin: {
            placeholder: "#msc-demos",
            description: "Usually #msc-demos to jump to the demos section.",
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
        ...adminRowsStartCollapsed,
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
    {
      name: "servicesGallery",
      type: "array",
      labels: {
        singular: "Services gallery image",
        plural: "Services gallery",
      },
      minRows: 0,
      maxRows: 12,
      admin: {
        ...adminRowsStartCollapsed,
        description:
          "Homepage “Programming Styles / See What Your Channel Could Look Like” screenshot grid. Upload each file in Media, then add rows in order (first row = large + two smalls, then bottom row of four).",
      },
      fields: [
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          required: true,
        },
        {
          name: "label",
          type: "text",
          admin: {
            description:
              "Caption shown under the image in the lightbox (e.g. Data & Migration). Alt text comes from the Media entry.",
          },
        },
      ],
    },
  ],
}
