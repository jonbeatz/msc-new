/**
 * Repo-wide local environment hydration (side-effect import).
 * Load order: .env.local (live secrets) → .env.example (generic contract, fills gaps only).
 * Import first in every scripts/*.mjs entry point:
 *   import './lib/msc-load-env.mjs'   // or '../lib/msc-load-env.mjs' from scripts/repair/
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

const localPath = path.resolve(ROOT, '.env.local');
const examplePath = path.resolve(ROOT, '.env.example');

const quiet =
  process.env.DOTENV_CONFIG_QUIET === 'true' ||
  process.env.DOTENV_CONFIG_QUIET === '1' ||
  process.env.DOTENV_QUIET === 'true' ||
  process.env.DOTENV_QUIET === '1';

const dotenvOpts = quiet ? { quiet: true } : {};

if (fs.existsSync(localPath)) {
  dotenv.config({ path: localPath, ...dotenvOpts });
}

if (fs.existsSync(examplePath)) {
  dotenv.config({ path: examplePath, override: false, ...dotenvOpts });
}

export const MSC_PROJECT_ROOT = ROOT;

/** Returns true when env contract files were applied (at least one known key present). */
export function msc_envHydrationReady() {
  const keys = [
    'DATABASE_URI',
    'DATABASE_URL',
    'MSC_PUBLIC_ORIGIN',
    'MSC_DEV_PORT',
    'PAYLOAD_SECRET',
  ];
  return keys.some((k) => {
    const v = process.env[k];
    return typeof v === 'string' && v.trim().length > 0;
  });
}
