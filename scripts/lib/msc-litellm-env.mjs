/**
 * Resolve LiteLLM + Vertex env for proxy scripts (no secrets logged).
 */
import fs from 'node:fs';
import path from 'node:path';
import { MSC_PROJECT_ROOT } from './msc-load-env.mjs';

const FALLBACK_CREDENTIAL_CANDIDATES = [
  'config/gcp-service-account.json',
  'google-api/gcp_key.json',
];

export function msc_resolveLitellmPort() {
  const raw = process.env.MSC_LITELLM_PORT?.trim() || '4000';
  const port = Number(raw);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid MSC_LITELLM_PORT: ${raw}`);
  }
  return port;
}

export function msc_litellmConfigPath() {
  const custom = process.env.MSC_LITELLM_CONFIG?.trim();
  if (custom) {
    return path.isAbsolute(custom) ? custom : path.resolve(MSC_PROJECT_ROOT, custom);
  }
  return path.resolve(MSC_PROJECT_ROOT, 'config/litellm_config.yaml');
}

/** Ensure GCP credential path exists; set process.env for litellm child. */
export function msc_hydrateVertexEnv() {
  let creds = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
  if (creds && !path.isAbsolute(creds)) {
    creds = path.resolve(MSC_PROJECT_ROOT, creds);
    process.env.GOOGLE_APPLICATION_CREDENTIALS = creds;
  }

  if (!creds || !fs.existsSync(creds)) {
    for (const rel of FALLBACK_CREDENTIAL_CANDIDATES) {
      const candidate = path.resolve(MSC_PROJECT_ROOT, rel);
      if (fs.existsSync(candidate)) {
        process.env.GOOGLE_APPLICATION_CREDENTIALS = candidate;
        creds = candidate;
        break;
      }
    }
  }

  if (
    !process.env.GOOGLE_CLOUD_PROJECT?.trim() ||
    process.env.GOOGLE_CLOUD_PROJECT === 'your-gcp-project-id'
  ) {
    if (creds && fs.existsSync(creds)) {
      try {
        const json = JSON.parse(fs.readFileSync(creds, 'utf8'));
        if (json.project_id) {
          process.env.GOOGLE_CLOUD_PROJECT = json.project_id;
        }
      } catch {
        /* ignore parse errors — preflight will report */
      }
    }
  }

  if (!process.env.GOOGLE_CLOUD_LOCATION?.trim()) {
    process.env.GOOGLE_CLOUD_LOCATION = 'global';
  }

  if (!process.env.LITELLM_DROP_PARAMS?.trim()) {
    process.env.LITELLM_DROP_PARAMS = 'true';
  }

  msc_stripPayloadDatabaseUrlFromLitellmEnv();
  msc_syncLitellmMasterKey();

  return {
    credentialsPath: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    project: process.env.GOOGLE_CLOUD_PROJECT,
    location: process.env.GOOGLE_CLOUD_LOCATION,
    port: msc_resolveLitellmPort(),
    configPath: msc_litellmConfigPath(),
  };
}

/**
 * Root .env.example sets DATABASE_URL for Payload (file:./…sqlite).
 * LiteLLM Prisma expects postgresql:// — strip unless operator sets MSC_LITELLM_DATABASE_URL.
 */
export function msc_stripPayloadDatabaseUrlFromLitellmEnv() {
  const litellmDb = process.env.MSC_LITELLM_DATABASE_URL?.trim();
  if (litellmDb) {
    process.env.DATABASE_URL = litellmDb;
    return;
  }
  delete process.env.DATABASE_URL;
  delete process.env.DATABASE_HOST;
  delete process.env.DATABASE_USER;
  delete process.env.DATABASE_PASSWORD;
  delete process.env.DATABASE_NAME;
  delete process.env.DATABASE_SCHEMA;
}

/** Read master key from MSC_LITELLM_MASTER_KEY or config/litellm_config.yaml (no logging). */
export function msc_readLitellmMasterKey() {
  const env = process.env.MSC_LITELLM_MASTER_KEY?.trim();
  if (env && !/^your_/i.test(env) && env !== 'your_litellm_master_key_local_only') {
    return env;
  }

  const configPath = msc_litellmConfigPath();
  if (!fs.existsSync(configPath)) return null;

  const text = fs.readFileSync(configPath, 'utf8');
  const match = text.match(/^\s*master_key:\s*["']?([^"'\n#]+)["']?/m);
  const fromYaml = match?.[1]?.trim();
  return fromYaml || null;
}

/** Align process.env with config master_key when .env.local omits or uses placeholders. */
export function msc_syncLitellmMasterKey() {
  const key = msc_readLitellmMasterKey();
  if (key) {
    process.env.MSC_LITELLM_MASTER_KEY = key;
  }
  return key;
}

export function msc_litellmAuthHeaders() {
  const key = msc_syncLitellmMasterKey();
  if (!key) return {};
  return { Authorization: `Bearer ${key}` };
}

export function msc_litellmFetchHeaders({ ngrok = false } = {}) {
  return {
    ...msc_litellmAuthHeaders(),
    ...(ngrok ? { 'ngrok-skip-browser-warning': 'true' } : {}),
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Poll /v1/models until HTTP 200 or timeout (LiteLLM boot). */
export async function msc_waitForLitellmReady(port, { timeoutMs = 90000, intervalMs = 1000 } = {}) {
  const url = `http://127.0.0.1:${port}/v1/models`;
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, {
        headers: msc_litellmAuthHeaders(),
        signal: AbortSignal.timeout(4000),
      });
      if (res.status === 200) {
        return { ok: true, status: 200 };
      }
    } catch {
      /* retry until deadline */
    }
    await sleep(intervalMs);
  }

  return { ok: false, status: 0 };
}

/** Probe OpenAI-compatible /v1/models (local or ngrok). */
export async function msc_probeLitellmModels(baseV1, { ngrok = false, timeoutMs = 15000 } = {}) {
  const root = String(baseV1).replace(/\/$/, '');
  const url = root.endsWith('/v1') ? `${root}/models` : `${root}/v1/models`;

  try {
    const res = await fetch(url, {
      headers: msc_litellmFetchHeaders({ ngrok }),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) {
      return { ok: false, status: res.status, modelIds: [] };
    }
    const body = await res.json();
    const modelIds = (body.data || []).map((m) => m.id).filter(Boolean);
    return { ok: true, status: res.status, modelIds };
  } catch {
    return { ok: false, status: 0, modelIds: [] };
  }
}
