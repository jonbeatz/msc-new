const fs = require("fs")
const p = require("path").join(
  __dirname,
  "../node_modules/@payloadcms/ui/dist/exports/client/index.js",
)
const s = fs.readFileSync(p, "utf8")
console.log("len", s.length)
console.log("includes row.id-\${idx}", s.includes("row.id-${idx}"))
console.log("includes blockType}-${row.id}-${", s.includes("}-${row.id}-"))
console.log("includes map((row, idx)", s.includes("map((row, idx)"))
