/**
 * Build-time guard: Homepage global must stay registered and slug-stable so
 * `/admin/globals/homepage` never 404s from a missing `config.globals` entry.
 */
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, "..")

const payloadConfigPath = path.join(root, "payload.config.ts")
const homepagePath = path.join(root, "globals", "Homepage.ts")

let failed = false

const cfg = fs.readFileSync(payloadConfigPath, "utf8")
if (!/globals\s*:\s*\[[\s\S]*?\bHomepage\b/.test(cfg)) {
  console.error(
    "[assert-homepage-global-config] payload.config.ts must list Homepage in `globals: [...]`.",
  )
  failed = true
}

const home = fs.readFileSync(homepagePath, "utf8")
if (!/slug\s*:\s*["']homepage["']/.test(home)) {
  console.error(
    '[assert-homepage-global-config] globals/Homepage.ts must set slug: "homepage".',
  )
  failed = true
}

if (failed) process.exit(1)
console.log("[assert-homepage-global-config] OK")
