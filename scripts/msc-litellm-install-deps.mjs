#!/usr/bin/env node
/**
 * Install Python deps for LiteLLM proxy (prisma DB client, proxy extras).
 */
import './lib/msc-load-env.mjs';

import { spawnSync } from 'node:child_process';
import process from 'node:process';

const BANNER = '[msc:litellm:install-deps]';

console.log(`${BANNER} installing litellm[proxy] and prisma…`);

const pip = spawnSync('pip', ['install', 'prisma', 'litellm[proxy]', '--upgrade'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

if (pip.status !== 0) {
  console.error(`${BANNER} FAIL — pip install failed`);
  process.exit(pip.status ?? 1);
}

// First import may download Prisma CLI binaries (~10s)
const check = spawnSync('prisma', ['version'], {
  encoding: 'utf8',
  shell: process.platform === 'win32',
});

if (check.status !== 0) {
  console.error(`${BANNER} FAIL — prisma CLI check failed after install`);
  process.exit(1);
}

console.log(`${BANNER} PASS — run npm run msc:litellm:start in a dedicated terminal`);
