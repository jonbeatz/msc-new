/**
 * Patches @payloadcms/ui dist/exports/client/index.js (prebuilt admin bundle) so BlocksField
 * DnD ids include row index. Source dist/fields/Blocks/index.js is not what the browser loads.
 *
 * Run: node scripts/_patch-ui-client-bundle.js
 */
const fs = require("fs")
const path = require("path")

const file = path.join(
  __dirname,
  "../node_modules/@payloadcms/ui/dist/exports/client/index.js",
)
let s = fs.readFileSync(file, "utf8")

const before = s.length

// Blocks: ids map — add index parameter and suffix
const a = "ids:J.map(oe=>`${q}-${oe.blockType}-${oe.id}`)"
const b = "ids:J.map((oe,pg)=>`${q}-${oe.blockType}-${oe.id}-${pg}`)"
if (s.includes(b)) {
  console.log("Already patched (Blocks ids include row index):", file)
  process.exit(0)
}
if (!s.includes(a)) {
  console.error("PATCH FAIL: missing Blocks ids pattern:", a)
  process.exit(1)
}
s = s.split(a).join(b)

// Blocks: DraggableSortableItem id and React key (same template appears twice more)
const oldTrip = "`${q}-${oe.blockType}-${oe.id}`"
const newTrip = "`${q}-${oe.blockType}-${oe.id}-${pe}`"
const tripCount = s.split(oldTrip).length - 1
if (tripCount < 2) {
  console.error("PATCH FAIL: expected >=2 occurrences of", oldTrip, "got", tripCount)
  process.exit(1)
}
// Replace remaining (should be 2: id: and key) — ids line already uses different pattern
s = s.split(oldTrip).join(newTrip)

if (s.length === before) {
  console.error("PATCH FAIL: no changes written")
  process.exit(1)
}

fs.writeFileSync(file, s)
console.log("Patched", file, "bytes", before, "->", s.length)
