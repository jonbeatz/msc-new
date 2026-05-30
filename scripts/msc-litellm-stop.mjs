#!/usr/bin/env node
/**
 * Stop LiteLLM proxy and optional ngrok forwarder (ports 4000 + 4040 inspector).
 */
import './lib/msc-load-env.mjs';

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { msc_hydrateVertexEnv } from './lib/msc-litellm-env.mjs';
import { msc_killNgrokProcesses } from './lib/msc-ngrok-utils.mjs';

const BANNER = '[msc:litellm:stop]';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const scriptsDir = path.resolve(__dirname);
const { port } = msc_hydrateVertexEnv();

console.log(`${BANNER} clearing ngrok processes`);
msc_killNgrokProcesses();

console.log(`${BANNER} clearing proxy port ${port}`);
spawnSync(process.execPath, [path.join(scriptsDir, 'msc-kill-dev-port.mjs'), String(port)], {
  stdio: 'inherit',
});

console.log(`${BANNER} clearing ngrok inspector 4040`);
spawnSync(process.execPath, [path.join(scriptsDir, 'msc-kill-dev-port.mjs'), '4040'], {
  stdio: 'inherit',
});

/** Brief pause so Windows releases sockets before restart. */
await new Promise((r) => setTimeout(r, 600));

console.log(`${BANNER} done`);
