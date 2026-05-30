# Portable modules (`custom-scriptz`)

Personal dev packs — **fat on disk** (include `ngrok.exe` locally), **lean in Git** (binaries gitignored).

| Module | Purpose | Manifest |
|--------|---------|----------|
| [google-api-proxy](google-api-proxy/) | LiteLLM + Vertex + ngrok | [module.manifest.json](google-api-proxy/module.manifest.json) |
| [backup-system](backup-system/) | Standard/Full robocopy + BackUp-Notez + note workflow | [module.manifest.json](backup-system/module.manifest.json) |

Shared installer helpers: [_lib/Msc-ModuleInstall.ps1](_lib/Msc-ModuleInstall.ps1)

## Quick install (Vader or any repo)

```powershell
.\.cursor\custom-scriptz\google-api-proxy\install.ps1
.\.cursor\custom-scriptz\backup-system\install.ps1
```

## Copy to another project

1. Robocopy entire `.cursor/custom-scriptz/` folder (includes local `ngrok.exe` in google-api-proxy).
2. Run both `install.ps1` scripts from the new repo root.
3. `npm install` · copy `.env.local` + GCP key manually.
4. `npm run msc:litellm:preflight`

## Create a new module

Say **`make new`** or **`create module`** — [Create-New-Module.md](../prompts/Create-New-Module.md)

## Agent entry (any project)

**[Prompt-Module.md](Prompt-Module.md)** — tell the agent to read and follow this file, then name the module (e.g. `google-api-proxy`).

In Vader Engine, chat shortcuts (`install module`, etc.) route to [Install-Module.md](../prompts/Install-Module.md), which points back to Prompt-Module.md.

Per-module detail: `module.manifest.json` + `CURSOR.md` + `install.ps1`.
