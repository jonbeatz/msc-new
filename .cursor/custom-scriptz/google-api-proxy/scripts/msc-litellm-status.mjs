#!/usr/bin/env node
/**
 * LiteLLM proxy HTTP status (port MSC_LITELLM_PORT, default 4000).
 */
import './lib/msc-load-env.mjs';

import process from 'node:process';
import { msc_hydrateVertexEnv, msc_probeLitellmModels } from './lib/msc-litellm-env.mjs';

const { port } = msc_hydrateVertexEnv();
const probe = await msc_probeLitellmModels(`http://127.0.0.1:${port}/v1`);

if (probe.ok) {
  console.log('online');
  process.exit(0);
}

if (probe.status === 401) {
  console.log('online (auth mismatch — sync MSC_LITELLM_MASTER_KEY with config master_key)');
  process.exit(0);
}

console.log('offline');
process.exit(1);
