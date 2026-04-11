import type { CollectionConfig } from "payload"

/**
 * Auth collections get implicit `email` + `password` fields; Payload 3 does not expose a
 * collection-level toggle for “reveal password” on the **login** form the way it does for
 * optional `admin` props on normal field configs.
 *
 * Login password visibility is implemented in `components/msc-payload-admin-enhancements.tsx`
 * (registered under `admin.components.providers` in `payload.config.ts`) plus
 * `app/(payload)/custom.scss`, so the eye control stays in sync with the branded admin UI.
 */
export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    useAsTitle: "email",
  },
  auth: true,
  fields: [],
}
