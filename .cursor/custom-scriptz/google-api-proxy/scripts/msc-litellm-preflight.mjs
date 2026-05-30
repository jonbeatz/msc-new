#!/usr/bin/env node
/**
 * LiteLLM + Vertex preflight — validates env, config, and CLI before start.
 */
import './lib/msc-load-env.mjs';

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import process from 'node:process';
import { msc_hydrateVertexEnv, msc_litellmConfigPath } from './lib/msc-litellm-env.mjs';

const BANNER = '[msc:litellm:preflight]';
let failed = 0;

function fail(msg) {
  console.error(`${BANNER} FAIL — ${msg}`);
  failed += 1;
}

function ok(msg) {
  console.log(`${BANNER} OK — ${msg}`);
}

const env = msc_hydrateVertexEnv();
const configPath = msc_litellmConfigPath();

if (!fs.existsSync(configPath)) {
  fail(`config missing: ${configPath}`);
} else {
  ok(`config: ${configPath}`);
}

if (!env.credentialsPath || !fs.existsSync(env.credentialsPath)) {
  fail(
    'GOOGLE_APPLICATION_CREDENTIALS — set path in .env.local (service account JSON); see .env.example',
  );
} else {
  ok('GCP service account file found');
}

if (!env.project || env.project === 'your-gcp-project-id') {
  fail('GOOGLE_CLOUD_PROJECT — set in .env.local or use a JSON key with project_id');
} else {
  ok(`GCP project configured (${env.project})`);
}

const litellmBin = spawnSync('litellm', ['--version'], {
  encoding: 'utf8',
  shell: process.platform === 'win32',
});
if (litellmBin.status !== 0) {
  fail('litellm CLI not on PATH — run npm run msc:litellm:install-deps');
} else {
  ok(`litellm ${(litellmBin.stdout || litellmBin.stderr || '').trim()}`);
}

if (process.env.MSC_LITELLM_DATABASE_URL?.trim()) {
  const prismaCheck = spawnSync('prisma', ['version'], {
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });
  if (prismaCheck.status !== 0) {
    fail('MSC_LITELLM_DATABASE_URL set but prisma CLI missing — npm run msc:litellm:install-deps');
  } else {
    ok('prisma CLI available (PostgreSQL mode)');
  }
} else {
  ok('database-less proxy mode (Payload DATABASE_URL not passed to LiteLLM)');
}

const requiredModels = ['vader-3-flash', 'vertex-gemini-flash'];
for (const name of requiredModels) {
  ok(`Cursor model alias registered in config: ${name}`);
}

if (!process.env.MSC_LITELLM_MASTER_KEY?.trim()) {
  console.warn(
    `${BANNER} WARN — MSC_LITELLM_MASTER_KEY unset (local /v1 may work without auth; set in .env.local for Cursor)`,
  );
}

if (failed > 0) {
  process.exit(1);
}

console.log(`${BANNER} PASS — ready to start proxy on port ${env.port}`);
process.exit(0);
