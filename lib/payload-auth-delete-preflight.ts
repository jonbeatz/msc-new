import type { PayloadRequest, SanitizedCollectionConfig } from "payload"

const preferencesSlug = "payload-preferences"
const lockedSlug = "payload-locked-documents"

type BeforeDeleteArgs = {
  id: number | string
  collection: SanitizedCollectionConfig
  req: PayloadRequest
}

/**
 * Payload core removes `payload-preferences` after deleting the auth row. With SQLite +
 * FK constraints, that order can fail and the admin shows a generic "unknown error".
 * Mirror the preference keys `deleteUserPreferences` uses, then drop first.
 *
 * Also remove `payload-locked-documents` rows that point at this auth user as `user`,
 * which can block deletes if present.
 */
export const preflightDeleteAuthUserRows = async ({
  id,
  collection,
  req,
}: BeforeDeleteArgs) => {
  if (!collection.auth) return

  const slug = collection.slug

  await req.payload.db.deleteMany({
    collection: preferencesSlug,
    req,
    where: {
      or: [
        {
          and: [
            { "user.value": { equals: id } },
            { "user.relationTo": { equals: slug } },
          ],
        },
        {
          key: { equals: `collection-${slug}-${id}` },
        },
      ],
    },
  })

  if (req.payload.collections[lockedSlug]) {
    await req.payload.db.deleteMany({
      collection: lockedSlug,
      req,
      where: {
        and: [
          { "user.value": { equals: id } },
          { "user.relationTo": { equals: slug } },
        ],
      },
    })
  }
}
