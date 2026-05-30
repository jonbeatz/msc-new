#!/usr/bin/env node
/**
 * Test LiteLLM (local) + ngrok tunnel — prints Cursor settings for Cloud Agent.
 */
import './lib/msc-load-env.mjs';

import process from 'node:process';
import { msc_hydrateVertexEnv, msc_probeLitellmModels } from './lib/msc-litellm-env.mjs';
import {
  msc_fetchNgrokHttpsUrl,
  msc_ngrokAvailable,
  msc_printCursorNgrokSettings,
  msc_resolveNgrokBin,
} from './lib/msc-ngrok-utils.mjs';

const BANNER = '[msc:litellm:test-ngrok]';
let failed = 0;

function pass(msg) {
  console.log(`${BANNER} OK — ${msg}`);
}

function fail(msg) {
  failed += 1;
  console.error(`${BANNER} FAIL — ${msg}`);
}

console.log('\n🔍 Testing LiteLLM + ngrok for Cursor Cloud Agent\n');

const { port } = msc_hydrateVertexEnv();
const localV1 = `http://127.0.0.1:${port}/v1`;
const localProbe = await msc_probeLitellmModels(localV1);

if (localProbe.ok) {
  pass(`LiteLLM on port ${port} — models: ${localProbe.modelIds.join(', ') || '(none)'}`);
  if (!localProbe.modelIds.includes('vader-3-flash')) {
    fail('vader-3-flash not in model list');
  }
} else {
  fail(
    `LiteLLM HTTP ${localProbe.status || 'unreachable'} — run: npm run msc:litellm:stop && npm run msc:litellm:start:ngrok`,
  );
}

if (!msc_ngrokAvailable()) {
  fail(
    `ngrok not found (tried: ${msc_resolveNgrokBin()}) — install ngrok and add to PATH, or set MSC_NGROK_BIN`,
  );
  console.error(`${BANNER}     https://ngrok.com/download · or: choco install ngrok`);
} else {
  pass(`ngrok binary: ${msc_resolveNgrokBin()}`);
}

const ngrokUrl = await msc_fetchNgrokHttpsUrl(5000);
if (!ngrokUrl) {
  fail('ngrok tunnel not running — start with: npm run msc:litellm:start:ngrok');
} else {
  pass(`ngrok HTTPS: ${ngrokUrl}`);
  const remoteV1 = msc_printCursorNgrokSettings(ngrokUrl);

  const remoteProbe = await msc_probeLitellmModels(remoteV1, { ngrok: true });
  if (remoteProbe.ok) {
    pass('Remote ngrok /v1/models reachable (200)');
  } else {
    fail(
      `Remote ngrok HTTP ${remoteProbe.status || 'unreachable'} — run: npm run msc:litellm:stop && npm run msc:litellm:start:ngrok`,
    );
  }
}

console.log('');
if (failed > 0) {
  console.error(`${BANNER} FAIL (${failed} check(s))`);
  process.exit(1);
}

console.log(
  `${BANNER} PASS — configure Cursor with the HTTPS URL above, then test Agent with vader-3-flash`,
);
process.exit(0);
