import type { Access, CollectionConfig } from "payload"

const adminOnly: Access = ({ req: { user } }) => Boolean(user)

export const CallRequests: CollectionConfig = {
  slug: "call-requests",
  lockDocuments: false,
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "email", "phone", "preferredDate", "createdAt"],
    group: "Marketing",
    description: "Single-step standalone scheduled call requests.",
  },
  access: {
    create: () => true,
    read: adminOnly,
    update: adminOnly,
    delete: ({ req: { user } }) => !!user,
  },
  fields: [
    { name: "name", type: "text", required: true },
    {
      name: "email",
      type: "email",
      required: true,
      index: true,
    },
    { name: "phone", type: "text", required: true },
    { name: "preferredDate", type: "text", required: true }, // Format: "YYYY-MM-DD" or formatted date label
    { name: "preferredTime", type: "text", required: true }, // Format: "HH:MM AM/PM" or slot
    { name: "timeZone", type: "text" },
  ],
}
