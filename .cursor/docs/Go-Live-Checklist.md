# Go Live Checklist (Local -> Live)

Use this when you want to move local development changes to `https://mystudiochannel.com` safely.

Project root:
- `D:\Cursor_Projectz\MSC_Clean_v2\msc-new`

---

## 0) Optional quick pre-check

Custom prompt shortcuts:
- `Lets run system check` (local + live + FTP + repo)
- `Lets test Local`
- `Lets test Live`
- `Lets test FTP`

Run these from your PC terminal in repo root:

```bash
npm run verify:local
npm run verify:live
npm run test:spaceship-ftp
```

If local is broken, run:

```bash
npm run dev:fresh
```

---

## 1) Build locally (PC)

Custom prompt shortcut:
- `Lets Push It Live (Safe)` (runs preflight verify first, then deploy if pass)

From repo root:

```bash
npm run build
```

Wait until build completes successfully.

---

## 2) Upload to Spaceship (PC) — tiered deploy

**Shortcuts (see `Custom-Prompts.md`):** **`Push my branding`** (item **37**) · **`Lets Push It Live`** (items **3** / **38**) · **`Push server config`** (item **39**).

**Before / alongside upload:** confirm marketing assets are present locally under **`public/media`** (that folder is what the live site serves as **`/media/...`**). If you added or replaced files there, commit them and ensure they are included in what you deploy; missing **`public/media`** files on the server means broken images even when **`.next`** is healthy.

### Deploy tiers (pick one path)

| Tier | Name | Command (Local / repo root) | What it ships | When to use |
|------|------|----------------------------|---------------|-------------|
| **1** | **Branding — Fast FTP** | `npm run pushitup:admin-branding` | **Only:** `components/msc-payload-graphics.tsx`, `components/msc-payload-admin-enhancements.tsx`, `collections/Users.ts`, `payload.config.ts`, `app/(payload)/custom.scss` | Quick look-and-feel / config / SCSS tweaks; **no** `build` or `.next` in this step. |
| **2** | **Admin logic / pages — Full build + UI + `.next` + DB + media** | `npm run pushit:live` | **`npm run build`** → **`npm run pushitup:admin-ui`** → **`npm run pushitup -- .next`** → **`npm run pushitup -- payload.sqlite`** → **`npm run pushitup -- public/media`** → **`npm run dev:fresh`** | Default for anything that must match compiled Next output and ship the local SQLite + on-disk **`public/media`** (routes, React admin UI, CMS data, `/media/*` assets). **Master** deploy. |
| **3** | **Hosting — server / package config** | `npm run pushitup:server-config` | **`server.js`**, **`package.json`**, **`package-lock.json`**, **`.env.example`** | Deps, lockfile, startup file, or documented env template changed; follow **§5** for **`npm install`** on the host. |

**Tier 2** is the **full** pipeline: it uploads the **admin source bundle**, the **entire `.next`** output, **`payload.sqlite`**, and **`public/media`** so the live app, **`/admin`**, CMS data, and **`/media/...`** files stay consistent.

**Tier 1** does **not** run `build` — use **Tier 2** when the admin bundle or site needs to reflect new compiled code.

### Standard one-command deploy (Tier 2)

```bash
npm run pushit:live
```

This is exactly: **`build`** → **`pushitup:admin-ui`** → **`pushitup -- .next`** → **`pushitup -- payload.sqlite`** → **`pushitup -- public/media`** → **`dev:fresh`** (see `scripts/pushit-live.ps1`).

**`pushitup:admin-ui`** includes (among others): `middleware.ts`, `lib/msc-admin-version.ts`, `components/msc-payload-nav-dashboard.tsx`, branding components, `collections/Users.ts`, `payload.config.ts`, `app/(payload)/custom.scss`.

A full **`.next`** upload is what fixes many **vendor-chunk** / missing-module errors on the host; if the browser shows **`Cannot find module './vendor-chunks/...'`** or similar after a deploy, re-run **`npm run pushitup -- .next`** (after a successful local **`npm run build`**) so chunk paths stay in sync.

### If upload reports failures

If `PushItUP` ends with failures, re-upload failed paths before restart.

Common retry:

```bash
npm run pushitup -- .next/static/chunks .next/server/chunks .next/server/webpack-runtime.js
```

Or upload the whole build output again:

```bash
npm run pushitup -- .next
```

---

## 3) Restart app in cPanel

Custom prompt helper:
- `Lets Push It Live` returns the exact next restart step + links

In cPanel Node.js app page for `mystudiochannel.com`:
1. Stop
2. Wait 10 seconds
3. Start

---

## 4) Validate live

Custom prompt shortcuts:
- `Lets Verify Live`
- `Lets test Live`

Check in Incognito:
- `https://mystudiochannel.com/`
- `https://mystudiochannel.com/admin`

Optional command check:

```bash
npm run verify:live
```

---

## 5) Only when dependencies changed

Custom prompt helper:
- `Lets Push It Live (Safe)` (good before dependency-sensitive deploys)
- **`Push server config`** (item **39**) to upload **`package.json`**, **`package-lock.json`**, **`server.js`**, **`.env.example`** before install

Use cPanel Terminal only if `package.json`, lockfile, or `patches/` changed.

```bash
source ~/nodevenv/mystudiochannel.com/*/bin/activate
cd ~/mystudiochannel.com
npm install --legacy-peer-deps
```

Then restart Node app again (Stop -> wait -> Start).

---

## 6) Emergency recovery (live 500)

Custom prompt helper:
- `Pre-deploy risk check for current changes` (before pushing risky fixes)

If live shows `Cannot find module './vendor-chunks/...` or other **chunk / vendor** runtime errors, the fix is a **clean rebuild + full `.next` upload** on the PC (and **`public/media`** must still be deployed with the app so **`/media/...`** assets exist on the server—verify **`public/media`** under your app path on the host if images are broken).

1. Stop app in cPanel
2. In cPanel terminal:

```bash
cd ~/mystudiochannel.com
rm -rf .next
```

3. On **PC (repo root)** — rebuild, then upload the full **`.next`** folder (this is the primary fix for vendor-chunk mismatches):

```bash
npm run build
npm run pushitup -- .next
```

If **`/media/`** images are wrong or 404 after deploy, sync **`public/media`** to the host (same relative path under the app root) or re-run your usual upload so **`public/media`** is not missing.

4. Start app in cPanel
5. Re-test live

---

## Ground rules

- Run `pushitup` on PC terminal, not cPanel Terminal.
- For app/admin code changes, prefer **Tier 2** (`pushit:live`): full build + full `.next` upload.
- Do not partially upload random files in `.next` unless recovering failed chunk uploads.

---

## Prompt-first quick flow (copy/paste friendly)

Use this if you want to run go-live mostly by prompt commands:

1. `Lets run system check`
2. Choose tier:
   - **Branding-only FTP:** `Push my branding` (item **37**) → restart Node in cPanel.
   - **Full app + admin:** `Lets Push It Live` (items **3** / **38**) or `Lets Push It Live (Safe)` — then restart Node.
   - **Deps / server files:** `Push server config` (item **39**) → cPanel Terminal **`npm install --legacy-peer-deps`** → restart Node.
3. Restart Node app in cPanel when you uploaded anything that affects runtime (Stop -> wait -> Start)
4. `Lets Verify Live`
5. Optional: `Lets Checkpoint Docs` (docs only) or `Lets Checkpoint Docs + Commit`
