# Google API Proxy Module

LiteLLM + **Google Vertex AI** + **ngrok** for Cursor Cloud Agent (`vader-3.5-flash` / `vader-3-flash`).

## Personal workflow (this machine)

| Step | Action |
|------|--------|
| 1 | Keep module pack at `.cursor/custom-scriptz/google-api-proxy/` with **`google-api/ngrok.exe` on disk** (~31 MB, not in Git) |
| 2 | Standard backup (`backup project`) copies the whole repo including `custom-scriptz` + local ngrok |
| 3 | New project: robocopy `.cursor/custom-scriptz/` from Vader or G: backup → run `install.ps1` |
| 4 | `npm install` → set `.env.local` + GCP key → `npm run msc:litellm:preflight` → `start google-api` |

## Requirements

| Item | Where |
|------|--------|
| Node 20+ | Target repo |
| `dotenv` | Merged into `package.json` if missing (via prerequisites) |
| GCP service account JSON | `config/gcp-service-account.json` (gitignored) |
| **ngrok.exe** | Module `google-api/` → installed to repo `google-api/ngrok.exe` |
| `NGROK_AUTHTOKEN` | `.env.local` |
| Python LiteLLM | `npm run msc:litellm:install-deps` (first time) |

## Install

```powershell
# From repo root (recommended)
.\.cursor\custom-scriptz\google-api-proxy\install.ps1

# Dry run
.\.cursor\custom-scriptz\google-api-proxy\install.ps1 -WhatIf

# Overwrite existing litellm_config.yaml
.\.cursor\custom-scriptz\google-api-proxy\install.ps1 -Force
```

Installer auto-detects repo root: current directory if `package.json` exists, else parent of `.cursor/custom-scriptz/`.

## What's installed

| Component | Location |
|-----------|----------|
| LiteLLM scripts | `scripts/msc-litellm-*.mjs`, `scripts/lib/msc-*` |
| Prerequisites (if missing) | `scripts/lib/msc-load-env.mjs`, `scripts/msc-kill-dev-port.mjs` |
| ngrok | `google-api/ngrok.exe` |
| Config | `config/litellm_config.yaml` |
| npm scripts | Merged from `package-scripts.json` |

## Commands

| Say / Command | Action |
|---------------|--------|
| `start google-api` | `npm run msc:google-api:start` |
| `verify google-api` | `npm run msc:litellm:test:ngrok` (local + ngrok **200**) |
| `stop google-api` | `npm run msc:litellm:stop` |
| `status google-api` | `npm run msc:litellm:status` |

## Cursor shortcuts

Merge [global.mdc.fragment](global.mdc.fragment) into `.cursor/rules/global.mdc` for new repos.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| 401 Unauthorized | `MSC_LITELLM_MASTER_KEY` must match `general_settings.master_key` in `config/litellm_config.yaml` |
| ngrok not found | Place `ngrok.exe` in module `google-api/` and re-run `install.ps1`, or set `MSC_NGROK_BIN` |
| GCP auth failed | Real `config/gcp-service-account.json` + project id in `litellm_config.yaml` |
| Provider Error in Cursor | New ngrok URL — `restart google-api`, paste HTTPS `/v1` in settings |

Agent manifest: [module.manifest.json](module.manifest.json) · Runbook (Vader): `.cursor/docs/local-ai-proxy-setup.md`
