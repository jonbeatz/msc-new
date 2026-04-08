import type { GlobalConfig } from "payload"

export const HeaderGlobal: GlobalConfig = {
  slug: "header",
  label: "Header",
  admin: {
    group: "Site",
    description: "Manage primary header navigation links for the marketing site.",
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "navItems",
      label: "Navigation items",
      type: "array",
      minRows: 1,
      defaultValue: [
        { label: "About", link: "#msc-about" },
        { label: "Services", link: "#msc-services" },
        { label: "Demos", link: "#msc-demos" },
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
            description: "Use section anchors (e.g. #msc-contact) or full URLs.",
          },
        },
      ],
    },
  ],
}

