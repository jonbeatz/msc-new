/**
 * Deletes specific Leads rows by id (local cleanup after bad API tests).
 * Run: npx tsx scripts/cleanup-test-leads.ts
 */
import path from "node:path"
import { fileURLToPath } from "node:url"
import { createJiti } from "jiti"
import { getPayload } from "payload"

const jiti = createJiti(import.meta.url)
const config = jiti(
  path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../payload.config.ts",
  ),
).default

const IDS_TO_DELETE = [2, 3] as const

async function main() {
  const payload = await getPayload({ config })
  for (const id of IDS_TO_DELETE) {
    try {
      await payload.delete({
        collection: "leads",
        id,
        overrideAccess: true,
      })
      console.log(`Deleted leads id=${id}`)
    } catch (err) {
      console.warn(`Could not delete leads id=${id}:`, err)
    }
  }
}

void main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
