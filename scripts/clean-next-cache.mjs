import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..")
for (const rel of [
  ".next",
  path.join("node_modules", ".cache"),
  ".turbo",
  // Payload / tooling caches (safe to delete; recreated on dev/build)
  ".payload",
]) {
  const p = path.join(root, rel)
  try {
    fs.rmSync(p, { recursive: true, force: true })
    console.log("Removed:", rel)
  } catch {
    // ignore
  }
}
console.log("Done. Run: npm run dev:payload")
