# ngrok setup (msc-new / google-api-proxy)

Live token: **`NGROK_AUTHTOKEN`** in **`.env.local`** only (never commit).

| Variable | Purpose |
|----------|---------|
| `NGROK_AUTHTOKEN` | ngrok account authtoken |
| `MSC_NGROK_BIN` | Optional path to binary (default: `google-api/ngrok.exe`) |
| `MSC_LITELLM_PORT` | Port LiteLLM listens on (default `4000`) |
| `MSC_LITELLM_START_NGROK` | Set `1` to prefer ngrok mode |

## Commands

```powershell
npm run msc:litellm:preflight
npm run msc:google-api:start      # stop + LiteLLM + ngrok (foreground)
npm run msc:litellm:test:ngrok    # smoke test (local + HTTPS tunnel)
npm run msc:litellm:stop
```

Canonical module doc: `.cursor/custom-scriptz/google-api-proxy/config/Ngrok-API.md`
