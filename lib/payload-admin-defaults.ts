/**
 * Payload admin defaults for msc-new.
 *
 * ## Blocks-first convention (admin UX)
 *
 * Prefer **`type: "blocks"`** with typed block configs for any authoring area that
 * would otherwise be a long flat list of fields inside a tab or global. That yields
 * the same row UI as **Sections Builder** (handle, index, block label, collapse).
 *
 * Use **`type: "array"`** only for small, uniform rows (e.g. notification emails,
 * simple nav items) where a blocks drawer adds little value.
 *
 * When adding blocks to a collection with **`db.push: false`**, ship a SQLite
 * migration for new `*_blocks_*` tables (see existing `scripts/migrate-*.py`).
 *
 * **List view:** On `blocks` fields, set **`admin.disableListColumn: true`** (and usually
 **`disableListFilter: true`)** so the collection table does not render nested block ids.
 *
 * **Edit view:** Do not place **two** top-level **`blocks`** fields on the same document;
 * Payload can emit duplicate React keys (`1`, `2`, …). Use **`collapsible` + `group`** or
 * one merged `blocks` field instead.
 *
 * @see `.cursor/rules/payload-blocks-first.mdc`
 * @see `.cursor/docs/Development.md` → “Payload admin authoring (blocks-first)”
 */

/**
 * Spread into `admin` on `array` and `blocks` fields so list rows start collapsed
 * (same as clicking **Collapse All** on first load).
 * Stock Payload 3.81 ignored `initCollapsed` when `payload_preferences` stored an
 * empty `collapsed: []` list, or when prefs used row **indices** instead of ids;
 * see **`patches/@payloadcms+ui+3.81.0.patch`** (`isRowCollapsed.js` + callers).
 */
export const adminRowsStartCollapsed = { initCollapsed: true } as const
