#!/usr/bin/env node
/**
 * Verify LiteLLM proxy: /v1/models includes vader-3-flash; optional chat smoke.
 */
import './lib/msc-load-env.mjs';

import process from 'node:process';
import { msc_hydrateVertexEnv, msc_litellmFetchHeaders } from './lib/msc-litellm-env.mjs';

const BANNER = '[msc:litellm:verify]';
const args = new Set(process.argv.slice(2));
const skipChat = args.has('--models-only');

const { port } = msc_hydrateVertexEnv();
const base = process.env.MSC_LITELLM_BASE_URL?.trim() || `http://127.0.0.1:${port}`;
const baseV1 = base.endsWith('/v1') ? base : `${base.replace(/\/$/, '')}/v1`;
const isNgrok = baseV1.startsWith('https://');
const headers = {
  'Content-Type': 'application/json',
  ...msc_litellmFetchHeaders({ ngrok: isNgrok }),
};

let failed = 0;

async function step(name, fn) {
  try {
    await fn();
    console.log(`${BANNER} OK — ${name}`);
  } catch (err) {
    failed += 1;
    console.error(`${BANNER} FAIL — ${name}: ${err.message}`);
  }
}

await step('GET /v1/models', async () => {
  const res = await fetch(`${baseV1}/models`, { headers, signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const body = await res.json();
  const ids = (body.data || []).map((m) => m.id);
  if (!ids.includes('vader-3-flash')) {
    throw new Error(`vader-3-flash missing; available: ${ids.join(', ') || '(none)'}`);
  }
  console.log(`${BANNER}     models: ${ids.join(', ')}`);
});

if (!skipChat) {
  await step('POST /v1/chat/completions (vader-3-flash)', async () => {
    const res = await fetch(`${baseV1}/chat/completions`, {
      method: 'POST',
      headers,
      signal: AbortSignal.timeout(120000),
      body: JSON.stringify({
        model: 'vader-3-flash',
        messages: [{ role: 'user', content: 'Reply with exactly: ok' }],
        max_tokens: 16,
      }),
    });
    const text = await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status} — ${text.slice(0, 200)}`);
  });
}

if (failed > 0) {
  console.error(`${BANNER} FAIL (${failed} step(s))`);
  process.exit(1);
}

console.log(`${BANNER} PASS — Vertex flash reachable at ${baseV1}`);
process.exit(0);
