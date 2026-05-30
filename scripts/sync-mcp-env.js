#!/usr/bin/env node
/**
 * Sync MCP env vars from repo .env.local into Cursor MCP config files.
 *
 * Targets:
 *   ~/.cursor/mcp.json          → github (GITHUB_PERSONAL_ACCESS_TOKEN)
 *                                 resend (RESEND_API_KEY, if server exists)
 *                                 tavily (TAVILY_API_KEY, if server exists)
 *   .cursor/mcp.json (project)  → mcp-wordpress (WORDPRESS_*)
 *
 * Run after editing .env.local, then reload MCP in Cursor.
 *
 * Usage:
 *   node scripts/sync-mcp-env.js
 *   node scripts/sync-mcp-env.js --enable-resend
 */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const ENV_LOCAL = path.join(REPO_ROOT, '.env.local');
const GLOBAL_MCP = path.join(os.homedir(), '.cursor', 'mcp.json');
const PROJECT_MCP = path.join(REPO_ROOT, '.cursor', 'mcp.json');
const ARCHIVED_MCP = path.join(REPO_ROOT, '.cursor', 'mcp.servers.archived.json');

const PLACEHOLDER_RE =
  /^(REPLACE_WITH_|YOUR_|1234567890_example|your-|example_replace|your-wp-)/i;

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`.env.local not found: ${filePath}`);
  }
  const env = {};
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function maskSecret(value, prefixLen = 4) {
  if (!value || value.length <= prefixLen + 4) return '****';
  return `${value.slice(0, prefixLen)}…${value.slice(-4)}`;
}

function isPlaceholder(value) {
  if (!value) return true;
  return PLACEHOLDER_RE.test(value);
}

function backupOnce(filePath) {
  const bak = `${filePath}.sync-bak`;
  if (!fs.existsSync(bak)) {
    fs.copyFileSync(filePath, bak);
    console.log(`Backup: ${bak}`);
  }
}

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`MCP config not found: ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function setNestedEnv(config, serverName, envUpdates) {
  const servers = config.mcpServers || {};
  const server = servers[serverName];
  if (!server) return false;
  server.env = server.env || {};
  let changed = false;
  for (const [key, value] of Object.entries(envUpdates)) {
    if (value === undefined || value === '') continue;
    if (server.env[key] !== value) {
      server.env[key] = value;
      changed = true;
    }
  }
  return changed;
}

function enableResendFromArchive(globalConfig) {
  if (!fs.existsSync(ARCHIVED_MCP)) {
    console.warn('WARN: archived MCP file missing; cannot enable resend');
    return false;
  }
  const archived = readJson(ARCHIVED_MCP);
  const recipe = archived.mcpServers?.resend;
  if (!recipe) {
    console.warn('WARN: resend recipe not found in archive');
    return false;
  }
  globalConfig.mcpServers = globalConfig.mcpServers || {};
  if (!globalConfig.mcpServers.resend) {
    const { _comment, ...entry } = recipe;
    globalConfig.mcpServers.resend = entry;
    console.log('PASS: Restored resend MCP from archive');
    return true;
  }
  return false;
}

function main() {
  const enableResend = process.argv.includes('--enable-resend');
  const env = parseEnvFile(ENV_LOCAL);
  let exitCode = 0;

  backupOnce(GLOBAL_MCP);
  const globalConfig = readJson(GLOBAL_MCP);

  if (enableResend) {
    enableResendFromArchive(globalConfig);
  }

  const githubToken = env.GITHUB_PERSONAL_ACCESS_TOKEN;
  if (githubToken) {
    if (!globalConfig.mcpServers?.github) {
      console.error('FAIL: mcpServers.github missing in global mcp.json');
      exitCode = 1;
    } else {
      const changed = setNestedEnv(globalConfig, 'github', {
        GITHUB_PERSONAL_ACCESS_TOKEN: githubToken,
      });
      if (isPlaceholder(githubToken)) {
        console.warn('WARN: GITHUB_PERSONAL_ACCESS_TOKEN looks like a placeholder');
      }
      console.log(
        `${changed ? 'PASS' : 'OK'}: github token → global (${maskSecret(githubToken, githubToken.startsWith('ghp_') ? 4 : 3)})`,
      );
    }
  } else {
    console.warn('WARN: GITHUB_PERSONAL_ACCESS_TOKEN not in .env.local');
  }

  const resendKey = env.RESEND_API_KEY;
  if (globalConfig.mcpServers?.resend && resendKey) {
    const changed = setNestedEnv(globalConfig, 'resend', {
      RESEND_API_KEY: resendKey,
    });
    if (isPlaceholder(resendKey)) {
      console.warn('WARN: RESEND_API_KEY looks like a placeholder');
    }
    console.log(
      `${changed ? 'PASS' : 'OK'}: resend key → global (${maskSecret(resendKey)})`,
    );
  }

  const tavilyKey = env.TAVILY_API_KEY;
  if (globalConfig.mcpServers?.tavily && tavilyKey) {
    const changed = setNestedEnv(globalConfig, 'tavily', {
      TAVILY_API_KEY: tavilyKey,
    });
    if (isPlaceholder(tavilyKey)) {
      console.warn('WARN: TAVILY_API_KEY looks like a placeholder');
    }
    console.log(
      `${changed ? 'PASS' : 'OK'}: tavily key → global (${maskSecret(tavilyKey, tavilyKey.startsWith('tvly-') ? 8 : 4)})`,
    );
  } else if (tavilyKey && !globalConfig.mcpServers?.tavily) {
    console.warn('WARN: TAVILY_API_KEY in .env.local but mcpServers.tavily missing in global mcp.json');
  }

  writeJson(GLOBAL_MCP, globalConfig);

  if (fs.existsSync(PROJECT_MCP)) {
    backupOnce(PROJECT_MCP);
    const projectConfig = readJson(PROJECT_MCP);
    const wpUpdates = {
      WORDPRESS_SITE_URL: env.WORDPRESS_SITE_URL,
      WORDPRESS_USERNAME: env.WORDPRESS_USERNAME,
      WORDPRESS_APP_PASSWORD: env.WORDPRESS_APP_PASSWORD,
    };
    const hasWp = Object.values(wpUpdates).some(Boolean);
    if (hasWp && projectConfig.mcpServers?.['mcp-wordpress']) {
      const changed = setNestedEnv(projectConfig, 'mcp-wordpress', wpUpdates);
      for (const [k, v] of Object.entries(wpUpdates)) {
        if (v && isPlaceholder(v)) {
          console.warn(`WARN: ${k} looks like a placeholder`);
        }
      }
      console.log(`${changed ? 'PASS' : 'OK'}: WordPress env → project mcp.json`);
      writeJson(PROJECT_MCP, projectConfig);
    } else if (!hasWp) {
      console.log('SKIP: No WORDPRESS_* keys in .env.local (project MCP unchanged)');
    }
  }

  console.log('Next: Reload MCP in Cursor (Settings → MCP → refresh).');
  process.exit(exitCode);
}

try {
  main();
} catch (err) {
  console.error(`FAIL: ${err.message}`);
  process.exit(1);
}
