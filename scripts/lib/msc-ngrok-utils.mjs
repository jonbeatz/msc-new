/**
 * ngrok tunnel helpers for LiteLLM + Cursor Cloud Agent.
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { MSC_PROJECT_ROOT } from './msc-load-env.mjs';

export const MSC_NGROK_INSPECTOR = 'http://127.0.0.1:4040';

/** Resolve ngrok executable (PATH, MSC_NGROK_BIN, google-api/ngrok.exe). */
export function msc_resolveNgrokBin() {
  const custom = process.env.MSC_NGROK_BIN?.trim();
  if (custom && fs.existsSync(custom)) {
    return custom;
  }

  const localCandidates = [
    path.join(MSC_PROJECT_ROOT, 'google-api', 'ngrok.exe'),
    path.join(MSC_PROJECT_ROOT, 'google-api', 'ngrok'),
  ];

  for (const candidate of localCandidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  const which = spawnSync(process.platform === 'win32' ? 'where.exe' : 'which', ['ngrok'], {
    encoding: 'utf8',
    shell: false,
  });
  if (which.status === 0) {
    const first = which.stdout.split(/\r?\n/).find((line) => line.trim());
    if (first?.trim()) {
      return first.trim();
    }
  }

  return 'ngrok';
}

export function msc_ngrokAvailable() {
  const bin = msc_resolveNgrokBin();
  if (bin !== 'ngrok' && fs.existsSync(bin)) {
    return true;
  }
  const check = spawnSync(bin, ['version'], {
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });
  return check.status === 0;
}

/** Fetch HTTPS public URL from ngrok local API (4040). */
export async function msc_fetchNgrokHttpsUrl(timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${MSC_NGROK_INSPECTOR}/api/tunnels`, {
        signal: AbortSignal.timeout(2000),
      });
      if (!res.ok) {
        await sleep(1000);
        continue;
      }
      const body = await res.json();
      const tunnel =
        body?.tunnels?.find((t) => t.public_url?.startsWith('https://')) ??
        body?.tunnels?.find((t) => t.proto === 'https');
      if (tunnel?.public_url) {
        return tunnel.public_url.replace(/\/$/, '');
      }
    } catch {
      /* retry */
    }
    await sleep(1000);
  }
  return null;
}

export function msc_printCursorNgrokSettings(publicBaseUrl) {
  const baseV1 = `${publicBaseUrl.replace(/\/$/, '')}/v1`;
  const keyHint = process.env.MSC_LITELLM_MASTER_KEY?.trim()?.startsWith('your_')
    ? '(set MSC_LITELLM_MASTER_KEY in .env.local — must match config master_key)'
    : process.env.MSC_LITELLM_MASTER_KEY?.trim()
      ? 'MSC_LITELLM_MASTER_KEY (synced with config/litellm_config.yaml)'
      : '(optional — leave blank if LiteLLM has no master_key)';

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 Cursor Settings (Cloud Agent / remote — use HTTPS ngrok URL)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`   Override OpenAI Base URL: ${baseV1}`);
  console.log(`   OpenAI API Key:         ${keyHint}`);
  console.log('   Custom model:           vader-3-flash');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  return baseV1;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Terminate stale ngrok processes (detached tunnels not bound to inspector 4040). */
export function msc_killNgrokProcesses() {
  const BANNER = '[msc:ngrok:kill]';
  if (process.platform === 'win32') {
    for (const image of ['ngrok.exe', 'ngrok']) {
      const r = spawnSync('taskkill', ['/F', '/IM', image], { stdio: 'pipe', encoding: 'utf8' });
      if (r.status === 0) {
        console.log(`${BANNER} stopped ${image} (win32)`);
      }
    }
    return;
  }
  const r = spawnSync('pkill', ['-f', 'ngrok'], { stdio: 'pipe', encoding: 'utf8' });
  if (r.status === 0) {
    console.log(`${BANNER} stopped ngrok (posix)`);
  }
}
