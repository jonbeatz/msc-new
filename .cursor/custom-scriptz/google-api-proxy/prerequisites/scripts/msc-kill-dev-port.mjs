#!/usr/bin/env node
/**
 * Universal dev port clearance
 * Cross-platform listener termination for local dev / build-gate prep.
 *
 * Usage:
 *   node scripts/msc-kill-dev-port.mjs <port>
 *
 * Environment (optional alternative to CLI arg):
 *   MSC_DEV_PORT — target TCP port (1–65535)
 *
 * Platform routing:
 *   win32  → netstat -ano (LISTENING) + taskkill /F /PID
 *   posix  → lsof -ti:<port> -sTCP:LISTEN + kill -9
 *
 */

import './lib/msc-load-env.mjs';

import { execFileSync, execSync } from 'node:child_process';
import process from 'node:process';

const BANNER = '[msc:kill-port] dev port clearance';

function resolvePort() {
  const raw = process.argv[2]?.trim() || process.env.MSC_DEV_PORT?.trim();
  if (!raw) {
    console.error(`${BANNER}`);
    console.error('Port required.');
    console.error('  node scripts/msc-kill-dev-port.mjs <port>');
    console.error('  MSC_DEV_PORT=<port> node scripts/msc-kill-dev-port.mjs');
    process.exit(1);
  }
  const port = Number(raw);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    console.error(`${BANNER}\nInvalid port: ${raw}`);
    process.exit(1);
  }
  return String(port);
}

const port = resolvePort();
const selfPid = String(process.pid);
let stopped = 0;

console.log(`${BANNER}`);
console.log(`[msc:kill-port] clearing listeners on port ${port} (${process.platform})`);

function killWin32() {
  let out = '';
  try {
    out = execSync('netstat -ano', { encoding: 'utf8' });
  } catch {
    return;
  }

  const pids = new Set();
  for (const line of out.split('\n')) {
    if (!line.includes('LISTENING')) continue;
    if (!line.includes(`:${port}`)) continue;
    const parts = line.trim().split(/\s+/);
    const pid = parts[parts.length - 1];
    if (pid && /^\d+$/.test(pid) && pid !== '0' && pid !== selfPid) {
      pids.add(pid);
    }
  }

  for (const pid of pids) {
    try {
      execFileSync('taskkill', ['/PID', pid, '/F'], { stdio: 'ignore' });
      console.log(`[msc:kill-port] stopped PID ${pid} (win32)`);
      stopped += 1;
    } catch {
      /* process may have already exited */
    }
  }
}

function killPosix() {
  try {
    const out = execFileSync('lsof', [`-ti:${port}`, '-sTCP:LISTEN'], {
      encoding: 'utf8',
    });
    const pids = out
      .split('\n')
      .map((line) => line.trim())
      .filter((pid) => pid && /^\d+$/.test(pid) && pid !== selfPid);

    for (const pid of pids) {
      try {
        execFileSync('kill', ['-9', pid], { stdio: 'ignore' });
        console.log(`[msc:kill-port] stopped PID ${pid} (posix)`);
        stopped += 1;
      } catch {
        /* ignore */
      }
    }
  } catch {
    /* no listeners or lsof unavailable */
  }
}

if (process.platform === 'win32') {
  killWin32();
} else {
  killPosix();
}

if (stopped === 0) {
  console.log(`[msc:kill-port] no listening processes found on port ${port}.`);
} else {
  console.log(`[msc:kill-port] cleared ${stopped} process(es) on port ${port}.`);
}

console.log('');
process.exit(0);
