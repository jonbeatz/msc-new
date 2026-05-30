# MCP setup (Cursor)

How Model Context Protocol servers are configured for **msc-new** and Jon’s global Cursor profile.

**Related:** [Development.md](./Development.md) (env vars), [ReCall.md](./ReCall.md) (Payload MCP finding §2026-04-08).

---

## Three MCP channels

Cursor can expose MCP tools from **three separate places**. Only the first two use JSON files in this repo or your home directory.

| Channel | Config | This project |
|---------|--------|--------------|
| **Global manual MCPs** | `C:\Users\JONBEATZ\.cursor\mcp.json` | 8 servers (GitHub, filesystem, Playwright, fetch, **tavily**, terminal, sequential-thinking, desktop-commander) |
| **Project manual MCPs** | `.cursor/mcp.json` in repo | 6 servers (`local-wp`, `mcp-wordpress`, `browsermcp`, `browserbase`, `21st-dev-magic`, `markdownify`) |
| **Workspace / plugin MCPs** | Cursor Settings → MCP, extensions, marketplace | **No JSON** — e.g. `user-payload`, Stripe, Vercel, Firebase, Browser DevTools |

**Merge rule:** Cursor loads global + project configs. If the same server name exists in both, **project wins**.

---

## Payload CMS — no manual MCP entry

We **do not** configure `@govcraft/payload-cms-mcp` in any `mcp.json`.

**Reason:** That package requires **Redis + remote SSE** and is **not stable for local stdio in Cursor** ([ReCall.md](./ReCall.md) §2026-04-08). The old global `"payload"` entry was removed.

**Use instead:**

1. **`user-payload`** — workspace MCP (schema/codegen tools). Cursor registers it automatically; **not** in `mcp.json`. No setup in this repo.
2. **Payload REST** — `http://localhost:3000/api/*` when dev is running.
3. **Admin UI** — `http://localhost:3000/admin` in browser or agent fetch.

---

## Secrets workflow

**Never commit real API keys** in `.cursor/mcp.json` or `.cursor/mcp.json.example`.

1. Put secrets in **`.env.local`** (gitignored). See **`.env.example`** for keys:
   - `GITHUB_PERSONAL_ACCESS_TOKEN`
   - `TAVILY_API_KEY` (Tavily search MCP)
   - `WORDPRESS_SITE_URL`, `WORDPRESS_USERNAME`, `WORDPRESS_APP_PASSWORD`
2. Sync into MCP configs:

   ```bash
   npm run sync:mcp-env
   ```

   Or: `npm run sync:mcp-all` (same sync + confirmation message).

3. **Reload MCP** in Cursor: **Settings → MCP → refresh** (or restart Cursor).

The sync script writes to:

- **Global** `~/.cursor/mcp.json` → `github`, `tavily` (and `resend` if that server exists)
- **Project** `.cursor/mcp.json` → `mcp-wordpress`

Global `mcp.json` lives **outside the repo** and is never committed.

---

## Enabled servers (after reorg)

### Global (8)

| Server | Purpose |
|--------|---------|
| `github` | Repos, issues, PRs (`@modelcontextprotocol/server-github`) |
| `filesystem` | File access scoped to `D:\Cursor_Projectz` |
| `playwright` | Single browser MCP (Chrome + devtools) |
| `fetch` | HTTP fetch via `uvx mcp-server-fetch` (known URL → markdown) |
| `tavily` | Web **search**, extract, map, crawl via [tavily-mcp](https://github.com/tavily-ai/tavily-mcp) |
| `terminal-controller` | Shell/terminal control |
| `sequential-thinking` | Structured reasoning helper |
| `desktop-commander` | Desktop automation |

### Project (6)

| Server | Purpose |
|--------|---------|
| `local-wp` | Local WP / Flywheel site discovery |
| `mcp-wordpress` | WordPress REST API for `mscclean.local` |
| `browsermcp` | Control your actual open Chrome/Edge browser locally |
| `browserbase` | Cloud browser automation with Browserbase and Stagehand |
| `21st-dev-magic` | AI-driven UI component generation with 21st.dev |
| `markdownify` | Convert web pages, PDFs, and files to Markdown |
| `browsermcp` | Control your actual open Chrome/Edge browser locally |
| `browserbase` | Cloud browser automation with Browserbase and Stagehand |
| `21st-dev-magic` | AI-driven UI component generation with 21st.dev |
| `markdownify` | Convert web pages, PDFs, and files to Markdown |

### Workspace / plugins (examples — not in mcp.json)

- `user-payload` — Payload schema tools
- Stripe, Vercel, Firebase — Cursor marketplace plugins
- Browser DevTools extension MCP

---

## Archived / disabled servers

Removed from global config (avoids half-configured auth errors). Full recipes:

**[`.cursor/mcp.servers.archived.json`](../mcp.servers.archived.json)**

Includes: `payload`, duplicate browsers, `postgres`, `neon-postgres`, `postman`, `mcp-vercel`, `untitledui`, `resend`, `task-master-ai`, `console-ninja`, `cursor-rules-generator`, `mcpterm`. (**`tavily`** re-enabled in global config when `TAVILY_API_KEY` is set.)

**Re-enable Resend MCP:**

```bash
node scripts/sync-mcp-env.js --enable-resend
npm run sync:mcp-env
```

Then reload MCP in Cursor.

**Re-enable any other archived server:** Copy its block from `mcp.servers.archived.json` into `~/.cursor/mcp.json`, add secrets via `.env.local` + sync if applicable, reload MCP.

---

## Enable / disable in Cursor

1. **Remove or add** a server block in the appropriate `mcp.json`, **or**
2. Toggle in **Cursor Settings → MCP** (when supported for that server).

Prefer **remove + archive** over `"disabled": true` — Cursor may still connect disabled entries.

---

## New clone checklist

1. Copy `.env.example` → `.env.local` and fill values.
2. Copy `.cursor/mcp.json.example` → `.cursor/mcp.json` if missing (repo should already include `.cursor/mcp.json` with placeholders).
3. Adjust `mcp-wordpress` `node` path if npm global install differs.
4. Run `npm run sync:mcp-env`.
5. Reload MCP in Cursor.

---

## npm scripts

| Script | Action |
|--------|--------|
| `npm run sync:mcp-env` | Sync `.env.local` → global + project MCP configs |
| `npm run sync:mcp-all` | Same + confirmation echo |
| `npm run msc:backup` | Standard project backup following the Ritual |
| `npm run msc:google-api:start` | Shorthand to stop/start LiteLLM + ngrok on port 4000 |
| `npm run msc:backup` | Standard project backup (follows Ritual) |
| `npm run msc:google-api:start` | Start LiteLLM + ngrok proxy on port 4000 |
| `npm run msc:backup` | Standard project backup following the Ritual |
| `npm run msc:google-api:start` | Start LiteLLM + ngrok proxy on port 4000 |
| `npm run sync:github-mcp` | Alias for `sync:mcp-env` |
| `npm run test:github-api` | Verify GitHub token from `.env.local` |
| `npm run test:tavily-api` | Verify Tavily token from `.env.local` |

---

## Backups

- Global trim backup: `~/.cursor/mcp.json.bak-20260529`
- Sync script first-run backups: `*.sync-bak` next to each MCP file (gitignored)

**Note:** Project **`.cursor/mcp.json`** is committed with placeholders. Global **`~/.cursor/mcp.json`** is outside the repo and receives secrets only via **`sync:mcp-env`**.
