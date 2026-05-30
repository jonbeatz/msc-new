# `google-api/` runtime folder (after install)

Drop **operator-owned binaries** here on the target machine. These files are **not** committed to Git (see `.gitignore` in this folder).

| File | Required for | How to obtain |
|------|----------------|---------------|
| **`ngrok.exe`** | `start google-api` (Cursor Cloud Agent HTTPS) | [ngrok download](https://ngrok.com/download) or copy from an existing Vader `google-api/ngrok.exe` |
| `gcp_key.json` | Vertex (optional alt to `config/gcp-service-account.json`) | GCP console — **never commit** |

## Resolution order (scripts)

1. `MSC_NGROK_BIN` in `.env.local` (absolute or repo-relative path)
2. `{repo}/google-api/ngrok.exe` or `ngrok`
3. `ngrok` on system **PATH**

## Portable module (this pack)

For a **fully self-contained** copy on disk (USB, G: backup, second PC):

1. Copy your working `ngrok.exe` into **this** folder:
   `.cursor/custom-scriptz/google-api-proxy/google-api/ngrok.exe`
2. Run `install.ps1` — it deploys `google-api/*` into the target repo’s `google-api/`.

The module ships **scripts + config templates** in Git; **ngrok.exe stays local** (~31 MB, ngrok license).
