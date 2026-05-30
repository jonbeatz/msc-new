import type { PayloadRequest, SanitizedCollectionConfig } from "payload"

const preferencesSlug = "payload-preferences"
const lockedSlug = "payload-locked-documents"

type BeforeDeleteArgs = {
  id: number | string
  collection: SanitizedCollectionConfig
  req: PayloadRequest
}

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
