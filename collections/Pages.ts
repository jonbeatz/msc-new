import { randomUUID } from "node:crypto"

import type { Access, CollectionConfig, Field } from "payload"

import { adminRowsStartCollapsed } from "@/lib/payload-admin-defaults"

const adminOnly: Access = ({ req: { user } }) => Boolean(user)

/** Stable per-row id for Payload admin DnD; hidden from editors. */
const blockRowUidField: Field = {
  name: "rowInstanceUid",
  type: "text",
  required: false,
  defaultValue: () => randomUUID(),
  admin: { hidden: true },
}

const featureItemUidField: Field = {
  name: "itemInstanceUid",
  type: "text",
  required: false,
  defaultValue: () => randomUUID(),
  admin: { hidden: true },
}

function ensureSectionBlockUids(sections: unknown): void {
  if (!Array.isArray(sections)) return
  const seenBlocks = new Set<string>()
  for (let i = 0; i < sections.length; i++) {
    const block = sections[i]
    if (!block || typeof block !== "object") continue
    const b = block as Record<string, unknown>
    let uid =
      typeof b.rowInstanceUid === "string" ? b.rowInstanceUid.trim() : ""
    if (!uid || seenBlocks.has(uid)) {
      uid = randomUUID()
    }
    seenBlocks.add(uid)
    b.rowInstanceUid = uid

    if (b.blockType === "featureGrid" && Array.isArray(b.items)) {
      const seenItems = new Set<string>()
      for (let j = 0; j < b.items.length; j++) {
        const row = b.items[j]
        if (!row || typeof row !== "object") continue
        const it = row as Record<string, unknown>
        let iu =
          typeof it.itemInstanceUid === "string" ? it.itemInstanceUid.trim() : ""
        if (!iu || seenItems.has(iu)) {
          iu = randomUUID()
        }
        seenItems.add(iu)
        it.itemInstanceUid = iu
      }
    }
  }
}

function coalesceEmptyPagesSlug(data: unknown): void {
  if (!data || typeof data !== "object") return
  const d = data as Record<string, unknown>
  const raw = d.slug
  const s = typeof raw === "string" ? raw.trim() : ""
  if (!s) d.slug = "msc1"
}

function isLikelyLocaleMap(o: object): boolean {
  const keys = Object.keys(o)
  if (keys.length === 0) return false
  return keys.every((k) => /^[a-z]{2}(-[a-z]{2})?$/i.test(k))
}

/** Legacy SEO plugin stored localized shapes; flatten so API/read does not 500. */
function normalizePagesDocMeta(doc: Record<string, unknown>): void {
  const meta = doc.meta
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) return
  const m = meta as Record<string, unknown>
  for (const key of ["title", "description"] as const) {
    const v = m[key]
    if (
      v &&
      typeof v === "object" &&
      !Array.isArray(v) &&
      isLikelyLocaleMap(v as object)
    ) {
      const first = Object.values(v as Record<string, unknown>).find(
        (x) => typeof x === "string",
      )
      if (typeof first === "string") m[key] = first
    }
  }
  const img = m.image
  if (
    img &&
    typeof img === "object" &&
    !Array.isArray(img) &&
    img !== null &&
    isLikelyLocaleMap(img as object)
  ) {
    const first = Object.values(img as Record<string, unknown>).find(
      (x) =>
        x !== null &&
        (typeof x === "string" ||
          typeof x === "number" ||
          (typeof x === "object" && x !== null && "id" in (x as object))),
    )
    if (first !== undefined) m.image = first
  }
}

/**
 * Hero fields stored under `pageHero` group.
 * Not a second `blocks` field: Payload admin reuses numeric row ids across block
 * tables, so two `blocks` fields on one document causes duplicate React keys.
 */
const pageHeroGroupFields: Field[] = [
  {
    name: "enabled",
    type: "checkbox",
    label: "Enable Hero Section",
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
    name: "buttons",
    label: "Buttons",
    type: "group",
    fields: [
      {
        name: "showPrimaryButton",
        type: "checkbox",
        label: "Show Consultation Button",
        defaultValue: true,
      },
      {
        name: "primaryButtonAction",
        type: "select",
        label: "Consultation button action",
        defaultValue: "lightbox",
        options: [
          { label: "Open Lightbox", value: "lightbox" },
          { label: "Custom Link", value: "link" },
        ],
      },
      {
        name: "primaryButtonLink",
        type: "text",
        label: "Custom link",
        validate: (
          value: unknown,
          { siblingData }: { siblingData?: Record<string, unknown> },
        ) => {
          if (siblingData?.primaryButtonAction !== "link") return true
          const s = typeof value === "string" ? value.trim() : ""
          if (!s) return "Enter a URL or hash when Custom Link is selected."
          return true
        },
        admin: {
          description:
            "When Custom Link is selected (e.g. #msc-contact, /#msc-contact, or https://…).",
          condition: (_data, siblingData) =>
            siblingData?.primaryButtonAction === "link",
        },
      },
      {
        name: "showSecondaryButton",
        type: "checkbox",
        label: "Show Demos Button",
        defaultValue: true,
      },
      {
        name: "secondaryButtonLabel",
        type: "text",
        label: "Demos button label",
        defaultValue: "View Demos",
        validate: (
          value: unknown,
          { siblingData }: { siblingData?: Record<string, unknown> },
        ) => {
          const show =
            siblingData?.showSecondaryButton === true ||
            siblingData?.showSecondaryButton === 1
          if (!show) return true
          const s = typeof value === "string" ? value.trim() : ""
          if (!s) return "Enter a label when the demos button is shown."
          return true
        },
        admin: {
          condition: (_data, siblingData) =>
            Boolean(siblingData?.showSecondaryButton),
        },
      },
      {
        name: "secondaryButtonLink",
        type: "text",
        label: "Demos button link",
        defaultValue: "/#msc-demos",
        validate: (
          value: unknown,
          { siblingData }: { siblingData?: Record<string, unknown> },
        ) => {
          const show =
            siblingData?.showSecondaryButton === true ||
            siblingData?.showSecondaryButton === 1
          if (!show) return true
          const s = typeof value === "string" ? value.trim() : ""
          if (!s) return "Enter a link when the demos button is shown."
          return true
        },
        admin: {
          condition: (_data, siblingData) =>
            Boolean(siblingData?.showSecondaryButton),
        },
      },
    ],
  },
  /* Temporarily disabled: isolate admin validation / issue count vs Hero SEO group.
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
  */
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
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data && typeof data === "object") {
          coalesceEmptyPagesSlug(data)
          if ("sections" in data) {
            ensureSectionBlockUids((data as { sections?: unknown }).sections)
          }
        }
        return data
      },
    ],
    beforeChange: [
      ({ data }) => {
        if (data && typeof data === "object") {
          coalesceEmptyPagesSlug(data)
          if ("sections" in data) {
            ensureSectionBlockUids((data as { sections?: unknown }).sections)
          }
        }
        return data
      },
    ],
    afterRead: [
      ({ doc }) => {
        try {
          if (doc && typeof doc === "object") {
            normalizePagesDocMeta(doc as Record<string, unknown>)
          }
        } catch {
          /* non-fatal */
        }
        return doc
      },
    ],
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
              defaultValue: "msc1",
              admin: {
                description:
                  "URL path segment, e.g. about or contact. Defaults to msc1 when empty.",
              },
            },
            {
              name: "viewPageLink",
              type: "ui",
              admin: {
                components: {
                  Field:
                    "@/components/payload/view-page-link-field#ViewPageLinkField",
                  Cell:
                    "@/components/payload/view-page-link-field#ViewPageLinkCell",
                },
              },
            },
            {
              name: "description",
              type: "textarea",
              admin: {
                description:
                  "Short page summary used as fallback meta description.",
              },
            },
          ],
        },
        {
          label: "Content Builder",
          fields: [
            {
              type: "collapsible",
              label: "Page Hero Section",
              admin: {
                initCollapsed: true,
                description:
                  "Full-width hero (same fields as Homepage slides). Kept collapsible so this page only has one **blocks** field (Sections Builder). DnD row keys are patched to include row index — see `patches/@payloadcms+ui+3.81.0.patch`.",
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
                    blockRowUidField,
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
                    blockRowUidField,
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
                        featureItemUidField,
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
                    blockRowUidField,
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
