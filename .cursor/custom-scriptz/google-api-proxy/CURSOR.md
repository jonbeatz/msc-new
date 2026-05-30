# CURSOR — Install `google-api-proxy`

## When to use

- Operator says **`install google-api module`**
- Copying LiteLLM/ngrok tooling to another personal repo on the same PC
- After restoring from G: backup — re-run installer if `scripts/` was refreshed

## Agent procedure

1. Read [module.manifest.json](module.manifest.json) for verify commands and `neverCommit` list.
2. **Preflight:** Target has or will receive `package.json`. If missing, stop.
3. **Run installer** from repo root:

   ```powershell
   .\.cursor\custom-scriptz\google-api-proxy\install.ps1
   ```

   Optional: `-ProjectRoot D:\path\to\repo` · `-WhatIf` · `-Force` (overwrite config)

4. **ngrok:** Module pack should include `google-api/ngrok.exe` on disk (gitignored). Installer copies to target `google-api/`. Warn if missing.
5. **Env:** Installer merges `env.example.fragment` into `.env.example`. Operator sets live values in `.env.local` only — never paste secrets in chat.
6. **GCP:** If `config/gcp-service-account.json` was created from example, operator replaces with real key file.
7. **global.mdc:** If shortcuts missing, merge rows from [global.mdc.fragment](global.mdc.fragment) into `.cursor/rules/global.mdc`.
8. **Verify** (repo has `node_modules`):

   ```powershell
   npm run msc:litellm:preflight
   npm run msc:google-api:start
   npm run msc:litellm:test:ngrok
   ```

## Do not

- Commit `ngrok.exe`, `gcp_key.json`, real `gcp-service-account.json`, or `.env.local`
- Replace MCP placeholders in committed `mcp.json` with live tokens

## Report

```text
✅ google-api-proxy installed
📂 Target: {repo root}
📦 Scripts + config + google-api/ (ngrok if present in module)
📄 See module.manifest.json verifyCommands
⏭️ Operator: .env.local + npm install + litellm:install-deps if first run
```
