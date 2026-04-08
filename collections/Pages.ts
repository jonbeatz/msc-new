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
              name: "featuredImage",
              type: "upload",
              relationTo: "media",
              label: "Hero Image",
              admin: {
                description:
                  "Page banner image displayed near the top of the slug page.",
              },
            },
            {
              name: "sections",
              type: "blocks",
              label: "Sections Builder",
              admin: {
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
                      name: "content",
                      type: "richText",
                      required: true,
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
                          "Paste YouTube or Vimeo URL. Optional if using local video media.",
                      },
                    },
                    {
                      name: "videoFile",
                      type: "upload",
                      relationTo: "media",
                      admin: {
                        description:
                          "Optional local media file upload to use instead of a hosted URL.",
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

