import type { GlobalConfig } from "payload"

import {
  HOMEPAGE_PROGRAMMING_STYLES_SEED,
  HOMEPAGE_SERVICES_GALLERY_SEED,
} from "@/lib/cms/homepage-gallery-seed"
import {
  ensureHomepageGallerySlotCount,
  hydrateHomepageGalleryFromSeed,
} from "@/lib/cms/homepage-gallery-hydrate"
import { adminRowsStartCollapsed } from "@/lib/payload-admin-defaults"

/**
 * Relationship → `media`: use drawer + thumbnails ("Choose from existing") instead of the plain combobox.
 * (Payload 3: `appearance: 'drawer'`; `admin.upload.collections` is not on the relationship field type here.)
 */
const homepageGalleryMediaRelationshipAdmin = {
  appearance: "drawer" as const,
  allowCreate: true,
  allowEdit: true,
}

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
      "Hero carousel, stat row, Programming Styles (7), and Channel preview gallery (7). Rows default to static /public/media assets (after media:sync); clear an image (null) to use site fallbacks for that slot only. Override any slot via relationship → Choose from existing. With SQLite and db.push disabled, if this screen errors run: migrate:sqlite:homepage-is-styles-visible, migrate:sqlite:homepage-hero-secondary-cta, migrate:sqlite:homepage-programming-styles, and migrate:sqlite:homepage-services-gallery",
  },
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  hooks: {
    afterRead: [
      async ({ doc, req }) => {
        if (!doc || typeof doc !== "object" || !req?.payload) return doc
        const d = doc as Record<string, unknown>
        const { payload } = req
        d.programmingStyles = await hydrateHomepageGalleryFromSeed(
          payload,
          d.programmingStyles,
          HOMEPAGE_PROGRAMMING_STYLES_SEED,
        )
        d.servicesGallery = await hydrateHomepageGalleryFromSeed(
          payload,
          d.servicesGallery,
          HOMEPAGE_SERVICES_GALLERY_SEED,
        )
        return doc
      },
    ],
    beforeChange: [
      ({ data }) => {
        if (data && typeof data === "object") {
          const d = data as Record<string, unknown>
          d.programmingStyles = ensureHomepageGallerySlotCount(d.programmingStyles)
          d.servicesGallery = ensureHomepageGallerySlotCount(d.servicesGallery)
        }
        return data
      },
    ],
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
        /** Relationship → Media (same storage as upload; drawer picker for consistency with gallery rows). */
        {
          name: "image",
          type: "relationship",
          relationTo: "media",
          required: true,
          admin: homepageGalleryMediaRelationshipAdmin,
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
      name: "isStylesVisible",
      type: "checkbox",
      label: "Show Programming Styles Section",
      defaultValue: true,
      admin: {
        description:
          'Uncheck to hide the Programming Styles field group below and the “Programming Styles We Support” block on the site. Channel preview gallery is unchanged.',
      },
    },
    {
      name: "programmingStyles",
      type: "array",
      labels: {
        singular: "Programming style image",
        plural: "Programming styles (7 images)",
      },
      minRows: 0,
      maxRows: 7,
      defaultValue: HOMEPAGE_PROGRAMMING_STYLES_SEED.map(({ label }) => ({ label })),
      admin: {
        ...adminRowsStartCollapsed,
        description:
          "Images under “Programming Styles We Support” — seven tiles (genre / format). Defaults match static fallbacks (demo-talkshow, podcast, …). Clear an image to use the site fallback for that slot. Order left-to-right on desktop. Pick existing Media via relationship (Choose from existing). Alt text comes from each Media entry. Rows load collapsed by default (`admin.initCollapsed` + patched Payload form state).",
        initCollapsed: true,
        /** Hide the entire array UI when the visibility toggle is off (clean admin). */
        condition: (data) => {
          if (!data || typeof data !== "object") return true
          return (data as Record<string, unknown>).isStylesVisible !== false
        },
      },
      fields: [
        {
          name: "image",
          type: "relationship",
          relationTo: "media",
          required: false,
          admin: homepageGalleryMediaRelationshipAdmin,
        },
        {
          name: "label",
          type: "text",
          admin: {
            description:
              "Short caption under the image (e.g. Interview Talk Show).",
          },
        },
      ],
    },
    {
      name: "servicesGallery",
      type: "array",
      labels: {
        singular: "Channel preview image",
        plural: "Channel preview gallery",
      },
      minRows: 0,
      maxRows: 7,
      defaultValue: HOMEPAGE_SERVICES_GALLERY_SEED.map(({ label }) => ({ label })),
      admin: {
        ...adminRowsStartCollapsed,
        description:
          "Seven channel preview screenshots (bento layout). Defaults match static fallbacks (Workspace, Data & migration, …). Clear an image to use the site fallback for that slot. Order: first row = large + two stacked smalls, then bottom row of four. Same Media relationship picker as Programming Styles above. Rows load collapsed by default (`admin.initCollapsed` + patched Payload form state).",
        initCollapsed: true,
      },
      fields: [
        {
          name: "image",
          type: "relationship",
          relationTo: "media",
          required: false,
          admin: homepageGalleryMediaRelationshipAdmin,
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
