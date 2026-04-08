# Run Next.js locally (this project)

This repo runs **Next.js 16** with **Payload CMS 3** embedded. It is **not** a static `out/`–only export anymore: API and `/admin` need a **Node** runtime.

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

---

## Commands

From the directory with **`package.json`**:

| Step | Command | Notes |
|------|---------|--------|
| Install | `npm install` | After dependency changes |
| Dev (recommended) | `npm run dev:payload` | **Webpack** dev (`--webpack`); avoids Turbopack chunk corruption on this stack |
| Dev (alt) | `npm run dev` | Also uses Webpack via `package.json` |
| Production build | `npm run build` | Requires env vars (see above) |
| Production serve | `npm run start` | After `build` -- local smoke test |

**First visit:** open **`/admin`** and create the first admin user.

**Edit homepage copy/images:** **`/admin`** → **Site** group → **Homepage** (hero slides from **Media**) and **Site settings** (title + meta description). See **Development.md** → *CMS — homepage hero + SEO*.

---

## Deploy (summary)

- Run **`npm run build`** on your host or CI.
- Start with **`npm run start`** (or your platform’s Next adapter).
- Use a **hosted Postgres** (e.g. Neon) in production: change **`payload.config.ts`** to **`@payloadcms/db-postgres`** and set **`DATABASE_URI`** per Payload docs; SQLite is for local/dev convenience.

---

## Historical note

Earlier versions used **`output: 'export'`** and **`npx serve out`**. That workflow does not apply once Payload is integrated; use **`next start`** or a Node-capable host instead.
