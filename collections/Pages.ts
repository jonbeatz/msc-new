import type { Access, CollectionConfig, Field } from "payload"

import { adminRowsStartCollapsed } from "@/lib/payload-admin-defaults"

const adminOnly: Access = ({ req: { user } }) => Boolean(user)

/**
 * Hero fields stored under `pageHero` group.
 * Not a second `blocks` field: Payload admin reuses numeric row ids across block
 * tables, so two `blocks` fields on one document causes duplicate React keys.
 */
const pageHeroGroupFields: Field[] = [
  {
    name: "enabled",
    type: "checkbox",
    label: "Show hero",
    defaultValue: true,
  },
  {
    name: "image",
    type: "upload",
    relationTo: "media",
    label: "Hero image",
    admin: {
      description: "Background for the full-width hero (upload in Media first).",
    },
  },
  {
    name: "ctaLink",
    label: "CTA link",
    type: "text",
    admin: {
      placeholder: "#msc-contact",
      description:
        "Primary hero button target. Leave blank to use #msc-contact.",
    },
  },
  {
    name: "eyebrow",
    type: "text",
  },
  {
    name: "headlineLine1",
    type: "text",
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
  {
    name: "seo",
    label: "Hero SEO",
    type: "group",
    admin: {
      description:
        "Optional. Used when this hero is the primary visual context (same idea as per-slide SEO on Homepage).",
    },
    fields: [
      {
        name: "title",
        type: "text",
      },
      {
        name: "description",
        type: "textarea",
      },
      {
        name: "image",
        label: "OpenGraph image",
        type: "upload",
        relationTo: "media",
      },
    ],
  },
]

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
      type: "tabs",
      tabs: [
        {
          label: "General",
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
        },
        {
          label: "Content Builder",
          fields: [
            {
              type: "collapsible",
              label: "Page hero",
              admin: {
                initCollapsed: true,
                description:
                  "Full-width hero (same fields as Homepage slides). Shown as a collapsible panel so only **Sections Builder** uses block rows — two blocks fields on one page hit a Payload admin React key collision.",
              },
              fields: [
                {
                  name: "pageHero",
                  type: "group",
                  label: "",
                  fields: [...pageHeroGroupFields],
                },
              ],
            },
            {
              name: "sections",
              type: "blocks",
              label: "Sections Builder",
              admin: {
                ...adminRowsStartCollapsed,
                disableListColumn: true,
                disableListFilter: true,
                description:
                  "Compose page sections with anchor IDs for deep-link navigation.",
              },
              blocks: [
                {
                  slug: "richText",
                  labels: {
                    singular: "Rich Text Block",
                    plural: "Rich Text Blocks",
                  },
                  fields: [
                    {
                      name: "sectionId",
                      type: "text",
                      label: "Anchor ID",
                      required: true,
                    },
                    {
                      name: "title",
                      type: "text",
                    },
                    {
                      name: "content",
                      type: "richText",
                      required: false,
                      admin: {
                        description:
                          "Optional for draft saves. Add body copy before publishing.",
                      },
                    },
                  ],
                },
                {
                  slug: "featureGrid",
                  labels: {
                    singular: "Feature Grid Block",
                    plural: "Feature Grid Blocks",
                  },
                  fields: [
                    {
                      name: "sectionId",
                      type: "text",
                      label: "Anchor ID",
                      required: true,
                    },
                    {
                      name: "title",
                      type: "text",
                    },
                    {
                      name: "items",
                      type: "array",
                      labels: {
                        singular: "Feature Item",
                        plural: "Feature Items",
                      },
                      admin: {
                        ...adminRowsStartCollapsed,
                      },
                      fields: [
                        {
                          name: "icon",
                          type: "text",
                          required: true,
                          admin: {
                            description:
                              "Icon label or emoji (for example: camera, mic, or 🎬).",
                          },
                        },
                        {
                          name: "text",
                          type: "text",
                          required: true,
                        },
                      ],
                    },
                  ],
                },
                {
                  slug: "videoPlayer",
                  labels: {
                    singular: "Video Player Block",
                    plural: "Video Player Blocks",
                  },
                  fields: [
                    {
                      name: "sectionId",
                      type: "text",
                      label: "Anchor ID",
                      required: true,
                    },
                    {
                      name: "title",
                      type: "text",
                    },
                    {
                      name: "videoUrl",
                      type: "text",
                      admin: {
                        description:
                          "Paste YouTube or Vimeo URL. Optional if you use a local media file instead.",
                      },
                    },
                    {
                      name: "videoFile",
                      type: "upload",
                      relationTo: "media",
                      admin: {
                        description:
                          "Optional local media upload. Add a file or a URL (or both).",
                      },
                    },
                  ],
                },
              ],
            },
            {
              name: "content",
              type: "richText",
              label: "Page Content",
              admin: {
                description:
                  "Main body content rendered on dynamic slug pages with Lexical rich text.",
              },
            },
          ],
        },
      ],
    },
  ],
}

