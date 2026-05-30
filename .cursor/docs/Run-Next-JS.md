# Run Next.js locally (this project)

This repo runs **Next.js 15.4.11** with **Payload CMS 3** embedded. It is **not** a static `out/`-only export anymore: API and `/admin` need a **Node** runtime.

---

## URL

```text
http://localhost:3000/
```

- Marketing site: **`/`**
- Payload admin: **`/admin`**
- Log out (direct): **`/admin/logout`**
- REST API: **`/api/*`** (e.g. **`POST /api/bookings`**)

**Admin tip:** If you see a **hydration / red overlay** only in dev, try **`localhost` with browser extensions disabled** (Brave/Chrome extensions often inject DOM attrs). See **Development.md** → Payload admin.

---

## Env

1. Copy **`.env.example`** to **`.env.local`**.
2. Set **`PAYLOAD_SECRET`**, **`DATABASE_URL`** (default `file:./payload.sqlite`), and **`NEXT_PUBLIC_SERVER_URL`**.
3. Optional keys: **`GITHUB_PERSONAL_ACCESS_TOKEN`**, **`RESEND_API_KEY`**, **`WORDPRESS_*`** (see **`.env.example`**).
4. After editing secrets used by Cursor MCP: **`npm run sync:mcp-env`**, then reload MCP in Cursor. Details: **[MCP-SETUP.md](./MCP-SETUP.md)**.

---

## Commands

From the directory with **`package.json`**:

| Step | Command | Notes |
|------|---------|--------|
| Install | `npm install` | After dependency changes |
| Dev (recommended) | `npm run dev:payload` | Plain **`next dev`** — webpack is the default on **Next 15.4** (do not pass `--turbo`) |
| Dev (alt) | `npm run dev` | Same as **`dev:payload`** |
| Production build | `npm run build` | Requires env vars (see above) |
| Production serve | `npm run start` | After `build` -- local smoke test |
| FTP upload (paths) | `npm run pushitup -- <target...>` | Upload files/folders to Spaceship FTPS |
| FTP upload (zip-first) | `npm run pushitupzip -- <target...>` | Packs target(s) to zip(s), then uploads |

**First visit:** open **`/admin`** and create the first admin user.

**Edit homepage / nav / metadata:** **`/admin`** → **Site** → **Homepage** (hero slides from **Media**; per-slide SEO + secondary CTA), **Site settings** (name, tagline, sticky header, branding, notifications), **Header** (primary nav + submenus; section targets like **`#msc-demos`** — see **Development.md** → *Marketing header* for how the site resolves **`#`** vs **`/#`** on the home page vs sub-pages). If a global screen **404**s on SQLite with schema push off, see **Development.md** → *Maintenance tips* / *SQLite migrations*.

---

## Deploy (summary)

- Run **`npm run build`** on your host or CI.
- Start with **`npm run start`** (or your platform’s Next adapter).
- Use a **hosted Postgres** (e.g. Neon) in production: change **`payload.config.ts`** to **`@payloadcms/db-postgres`** and set **`DATABASE_URI`** per Payload docs; SQLite is for local/dev convenience.

### Shared-host memory fallback (Spaceship / cPanel)

Step-by-step **build → FTP → when to Restart** (including **zip vs whole `.next` folder**): see **[Spaceship.md](./Spaceship.md)** → *Same-day deploy cheat sheet*.

If host-side `npm run build` fails with:

- `RangeError: WebAssembly.instantiate(): Out of memory`

Use this flow instead:

1. Local machine:
   - `npm run build`
   - `npm run pushitupzip -- .next`
   - `npm run pushitup -- patches package.json package-lock.json server.js`
2. Host terminal:
   - `npm install --legacy-peer-deps`
   - remove/replace `.next` from uploaded zip
3. Restart Node app from panel.

### cPanel operational shortcuts (session-scoped)

- **Terminal** and **NodeJS Selector** links include `cpsess...` and expire after session timeout/logout.
- Practical labels used in this project:
  - **Terminal**: cPanel Terminal page (for `npm install`, unzip, quick checks)
  - **ReStartIt**: NodeJS app detail page (`/applications/mystudiochannel.com`) for `RESTART` / `STOP APP` / `START APP`
- Use **ReStartIt -> RESTART** after most code deploys. If behavior looks stale, use full bounce (`STOP APP`, wait 2-3s, then `START APP`).

---

## Historical note

Earlier versions used **`output: 'export'`** and **`npx serve out`**. That workflow does not apply once Payload is integrated; use **`next start`** or a Node-capable host instead.
