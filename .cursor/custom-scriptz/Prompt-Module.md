# For Cursor Agent: Install my portable modules

To install a portable module in this project:

1. Find the module folder in `.cursor/custom-scriptz/`
2. Run `.\.cursor\custom-scriptz\[module-name]\install.ps1` from repo root (use **pwsh** if Windows PowerShell 5.1 reports parse errors)
3. Follow post-install steps in that module's `CURSOR.md`
4. Run verify commands from `module.manifest.json` (not Vader-specific gates)

## Available modules

- `google-api-proxy` — LiteLLM + ngrok for Cursor AI
- `backup-system` — Backup project command

## List modules (PowerShell)

```powershell
Get-ChildItem .cursor\custom-scriptz -Directory -ErrorAction SilentlyContinue |
  Where-Object { $_.Name -ne '_lib' -and (Test-Path (Join-Path $_.FullName 'module.manifest.json')) } |
  ForEach-Object {
    $m = Get-Content (Join-Path $_.FullName 'module.manifest.json') -Raw | ConvertFrom-Json
    [PSCustomObject]@{ Folder = $_.Name; Id = $m.moduleId; Description = $m.description }
  }
```

## Name aliases

| User may say | Folder |
|--------------|--------|
| `google-api-proxy`, `google-api module`, `google-api` | `google-api-proxy` |
| `backup-system`, `backup module` | `backup-system` |

## Installer flags (optional)

- `-WhatIf` — dry run
- `-Force` — overwrite existing config
- `-SkipVerify` — skip installer preflight

## If `custom-scriptz` is missing

Tell the operator to copy the entire `.cursor/custom-scriptz/` folder from Vader Engine or a G: backup, then retry.

## Security

- Never ask for API keys, tokens, or passwords in chat
- Never paste `.env.local` or credential file contents
- Never commit paths listed in manifest `neverCommit`
- Operator sets live values in `.env.local` only

## Human index

[README.md](README.md)
