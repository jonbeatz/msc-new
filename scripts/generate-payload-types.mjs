/**
 * Loads `payload.config.ts` with jiti (respects tsconfig paths) and runs Payload's
 * `generateTypes` — avoids Node ESM resolution issues with `payload generate:types` on Windows.
 * Usage: node scripts/generate-payload-types.mjs
 */
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import { createJiti } from "jiti"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, "..")

const genUrl = pathToFileURL(
  path.join(root, "node_modules/payload/dist/bin/generateTypes.js"),
).href
const { generateTypes } = await import(genUrl)

const jiti = createJiti(import.meta.url, {
  interopDefault: true,
  tsconfig: path.join(root, "tsconfig.json"),
  // Match tsconfig `paths`: `@/*` -> `./*`
  alias: {
    "@": root,
  },
})

const mod = jiti(path.join(root, "payload.config.ts"))
let config = mod?.default ?? mod
if (config && typeof config === "object" && "default" in config && !config.typescript) {
  const inner = config.default
  if (inner && typeof inner === "object" && inner.typescript) {
    config = inner
  }
}
if (config && typeof config.then === "function") {
  config = await config
}

await generateTypes(config, { log: true })
