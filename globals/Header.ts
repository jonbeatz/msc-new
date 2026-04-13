import type { GlobalConfig } from "payload"

import { adminRowsStartCollapsed } from "@/lib/payload-admin-defaults"

export const HeaderGlobal: GlobalConfig = {
  slug: "header",
  label: "Header",
  admin: {
    group: "Site",
    description: "Manage primary header navigation links for the marketing site.",
  },
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: "navItems",
      label: "Navigation items",
      type: "array",
      minRows: 1,
      admin: {
        ...adminRowsStartCollapsed,
        description:
          'Add a row whose label is exactly **Pages** (case-sensitive) to show a dropdown of all entries from the Pages collection (slug `home` excluded). The link and any manual submenu rows for that item are ignored at runtime and filled automatically.',
      },
      defaultValue: [
        { label: "About", link: "#msc-about" },
        {
          label: "Services",
          link: "#msc-services",
          submenu: [
            { label: "Own Your Platform", link: "#msc-own-platform" },
            { label: "Packages", link: "#msc-packages" },
            { label: "Requirements", link: "#msc-requirements" },
            { label: "What We Do", link: "#msc-creators" },
          ],
        },
        { label: "Demos", link: "#msc-demos" },
        {
          label: "Resources",
          link: "#msc-testimonials",
          submenu: [
            { label: "Testimonials", link: "#msc-testimonials" },
            { label: "Extras", link: "#msc-addons" },
            { label: "FAQ", link: "#msc-faq" },
          ],
        },
        { label: "Contact", link: "#msc-contact" },
      ],
      fields: [
        {
          name: "label",
          type: "text",
          required: true,
        },
        {
          name: "link",
          type: "text",
          required: true,
          admin: {
            description:
              "Use section anchors (e.g. #msc-contact); runtime resolves to # on the home page and /# off home. Full URLs allowed.",
          },
        },
        {
          name: "submenu",
          label: "Submenu items",
          type: "array",
          admin: {
            ...adminRowsStartCollapsed,
          },
          fields: [
            {
              name: "label",
              type: "text",
              required: true,
            },
            {
              name: "link",
              type: "text",
              required: true,
            },
          ],
        },
      ],
    },
  ],
}

