import type { Payload } from "payload"

export const HOMEPAGE_GALLERY_SLOT_COUNT = 7

type SeedRow = { filename: string; label: string }

/**
 * Pad to exactly {@link HOMEPAGE_GALLERY_SLOT_COUNT} rows (empty rows are `{}`).
 */
export function ensureHomepageGallerySlotCount(rows: unknown): unknown[] {
  const base = Array.isArray(rows) ? [...rows] : []
  const trimmed = base.slice(0, HOMEPAGE_GALLERY_SLOT_COUNT)
  while (trimmed.length < HOMEPAGE_GALLERY_SLOT_COUNT) {
    trimmed.push({})
  }
  return trimmed
}

function rowHasPersistedRelation(value: unknown): boolean {
  if (typeof value === "number") return true
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { id?: unknown }).id === "number"
  )
}

/**
 * Admin relationship UI + site mapping expect a populated Media shape (`id`, `filename`, `url`).
 * Incomplete objects fall back to combobox-style UI in Payload.
 */
function asLooseRecord(value: object): Record<string, unknown> {
  return value as unknown as Record<string, unknown>
}

function mediaDocIsCompleteForAdmin(value: unknown): boolean {
  if (!value || typeof value !== "object") return false
  const o = asLooseRecord(value)
  return (
    typeof o.id === "number" &&
    typeof o.filename === "string" &&
    o.filename.length > 0 &&
    typeof o.url === "string" &&
    o.url.length > 0
  )
}

async function findMediaDocByFilename(
  payload: Payload,
  filename: string,
): Promise<Record<string, unknown> | null> {
  const res = await payload.find({
    collection: "media",
    where: { filename: { equals: filename } },
    limit: 1,
    depth: 0,
  })
  const doc = res.docs[0]
  return doc && typeof doc === "object" ? asLooseRecord(doc) : null
}

async function findMediaDocById(
  payload: Payload,
  id: number,
): Promise<Record<string, unknown> | MediaIdStub | null> {
  try {
    const doc = await payload.findByID({
      collection: "media",
      id,
      depth: 0,
    })
    return doc && typeof doc === "object" ? asLooseRecord(doc) : { id }
  } catch {
    return { id }
  }
}

type MediaIdStub = { id: number }

async function ensureCompleteMediaDoc(
  payload: Payload,
  value: unknown,
): Promise<unknown> {
  if (value === null || value === undefined) return value

  if (typeof value === "string" && value.trim().length > 0) {
    const doc = await findMediaDocByFilename(payload, value.trim())
    return doc ?? null
  }

  if (typeof value === "number") {
    return findMediaDocById(payload, value)
  }

  if (typeof value === "object" && value !== null && "id" in value) {
    const id = (value as { id?: unknown }).id
    if (typeof id === "number" && !mediaDocIsCompleteForAdmin(value)) {
      return findMediaDocById(payload, id)
    }
    return value
  }

  return value
}

/**
 * Admin + marketing site: relationship `image` must be a **complete** Media document when possible.
 */
async function normalizeImageValueForHomepageRow(
  payload: Payload,
  value: unknown,
): Promise<unknown> {
  const once = await ensureCompleteMediaDoc(payload, value)
  if (
    once &&
    typeof once === "object" &&
    "id" in (once as object) &&
    !mediaDocIsCompleteForAdmin(once)
  ) {
    const id = (once as { id?: unknown }).id
    if (typeof id === "number") {
      return findMediaDocById(payload, id)
    }
  }
  return once
}

/**
 * For each slot: if `image` is **null**, leave it (operator cleared slot → frontend uses static fallback).
 * Otherwise normalize to a complete Media-shaped relationship value for Admin + `getHomepageCmsData`.
 */
export async function hydrateHomepageGalleryFromSeed(
  payload: Payload,
  rows: unknown,
  seed: readonly SeedRow[],
): Promise<unknown[]> {
  const padded = ensureHomepageGallerySlotCount(rows)
  const out: unknown[] = []
  for (let i = 0; i < HOMEPAGE_GALLERY_SLOT_COUNT; i++) {
    const row = padded[i]
    const base: Record<string, unknown> =
      row && typeof row === "object"
        ? { ...(row as Record<string, unknown>) }
        : {}
    const img = base.image
    const cleared = img === null
    const seedRow = seed[i]!

    if (cleared) {
      out.push(base)
      continue
    }

    let nextImg = img

    if (!rowHasPersistedRelation(nextImg)) {
      const doc = await findMediaDocByFilename(payload, seedRow.filename)
      if (doc !== null) nextImg = doc
      const lab = base.label
      if (lab == null || lab === "") base.label = seedRow.label
    } else {
      const lab = base.label
      if (lab == null || lab === "") base.label = seedRow.label
    }

    base.image = await normalizeImageValueForHomepageRow(payload, nextImg)
    out.push(base)
  }
  return out
}
