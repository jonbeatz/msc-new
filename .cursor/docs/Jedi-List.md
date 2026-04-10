# Jedi List — project commands

Quick reference for **npm scripts** and related tooling wired up in **`package.json`** (msc-new / Payload + Next.js). Run everything from the repo root (folder with `package.json`).

---

## Source of truth order (for agents and new sessions)

When docs differ, use this priority:

1. **`Agent-Runbook.md`** (daily prompts / operating workflow)
2. **`Spaceship.md`** (deploy + cPanel responsibilities)
3. **`Jedi-List.md`** (command quick reference)
4. **`Development.md`** (architecture details)
5. **`ReCall.md`** (session log/history)

---

## When local `/` or `/admin` breaks (do this first)

Symptoms: **Runtime Error** `Cannot find module './vendor-chunks/date-fns.js`**, missing styles, giant logo only, or admin overlay after **`npm run build`**, switching branches, or heavy edits.

1. Stop the dev server (**Ctrl+C** in the terminal where it runs).
2. Run **`npm run clean:next`** (wipes **`.next`** + **`node_modules/.cache`**).
3. Run **`npm run dev:payload`** and reload the browser.

If it still misbehaves, close other Node processes on port **3000**, then repeat step 2–3. The Next.js error overlay may say **Webpack**; that label is normal for some dev paths and is not the root cause — stale **`.next`** chunks are.

---

## Repeatable workflow: local → Spaceship → Terminal → Node restart

**Authoritative step-by-step (numbered checklist, PC vs cPanel, what not to run on the server):** **Spaceship.md** → **Successful live update protocol**.

| Step | Where | Action |
|------|--------|--------|
| 1 | **PC (repo root)** | Develop with **`npm run dev:payload`**. Before production upload, **`npm run build`** must succeed. |
| 2 | **PC** | Upload: **`npm run pushitup -- package.json package-lock.json server.js patches middleware.ts`** (adjust if you changed more). For **admin version + Payload admin styles**, use **`npm run pushitup:admin-ui`** (avoids PowerShell breaking paths with **`()`**). Then **`npm run pushitup -- .next`** (full folder; no zip required). |
| 3 | **cPanel → Terminal** | Only if **`package.json` / lockfile / `patches`** changed: activate Node venv, **`cd`** to the app folder, **`npm install --legacy-peer-deps`** (see **Spaceship.md**). **Do not** run **`pushitup`** here. |
| 4 | **cPanel → Node.js Selector** | **Restart** the app (or Stop → Start). |

**Admin version check:** After deploy, open **`/admin`** — you should see **`v1.0.x`** near the sidebar **Log out** area (bottom-left). Bump `lib/msc-admin-version.ts` when you ship admin-facing changes.

---

## Dev and production

| Command | What it does |
|--------|----------------|
| **`npm run dev`** | Starts **Next.js 15** in development mode. Same as `dev:payload` in this repo. Site: [http://localhost:3000/](http://localhost:3000/). |
| **`npm run dev:payload`** | Same as **`npm run dev`** — marketing site + Payload API + admin. Prefer this name in docs so it’s obvious Payload is included. |
| **`npm run clean:next`** | Deletes **`.next`** and **`node_modules/.cache`** (fixes missing **`vendor-chunks/date-fns.js`**, blank CSS, broken admin). |
| **`npm run dev:fresh`** | **`clean:next`** then **`dev:payload`** — use after **`npm run build`** if local dev looks broken. |
| **`npm run build`** | Production build (`next build`). Use before `next start` or before zipping `.next` for low-memory hosts. Requires env (see **Run-Next-JS.md**). |
| **`npm run start`** | Serves the **last build** (`next start`). Use for a local smoke test after `build`. |
| **`npm run verify:local`** | Local pre-deploy smoke checks for `/`, `/admin`, and `api/globals/projects-home`; exits non-zero if any check fails. |

---

## Install and patches

| Command | What it does |
|--------|----------------|
| **`npm install`** | Installs dependencies. **`postinstall`** runs **`patch-package`**, which applies fixes under **`patches/`** (e.g. Payload UI / Next). Run after clone or dependency changes. |

---

## Quality

| Command | What it does |
|--------|----------------|
| **`npm run lint`** | Runs **ESLint** across the project (`eslint .`). |

---

## Admin deploy version (visual check)

After **Payload admin** or **CMS panel** changes ship to production, bump **`MSC_ADMIN_VERSION`** in **`lib/msc-admin-version.ts`** (e.g. `1.0.3` → `1.0.4`). The sidebar shows **`v1.0.x`** near **Log out** so you can confirm the new build is live.

---

## Payload utilities

| Command | What it does |
|--------|----------------|
| **`npm run seed:demo-page`** | Runs **`payload run scripts/seed-demo-page.ts`** — seeds demo page content via Payload CLI. May hit environment/alias quirks on some machines (see **ReCall.md** if blocked). |

**Often used manually (not npm aliases):**

- **`npx payload generate:importmap`** — Regenerates **`app/(payload)/admin/importMap.js`** when you add Payload admin components by path (merge carefully if you edit by hand). See **Development.md** → Payload admin.

---

## SQLite migrations (Python)

These align the **local SQLite** schema with Payload when **`db.push: false`** or after field changes. Requires **Python 3** on your PATH.

| Command | What it does |
|--------|----------------|
| **`npm run migrate:sqlite:page-hero`** | `scripts/migrate-pages-page-hero-sqlite.py` — page hero shape for `pages`. |
| **`npm run migrate:sqlite:page-hero-blocks`** | `scripts/migrate-page-hero-to-blocks-sqlite.py` — page hero → blocks. |
| **`npm run migrate:sqlite:page-hero-sync-group`** | `scripts/sync-page-hero-block-to-group-sqlite.py` — sync page hero block ↔ group. |
| **`npm run migrate:sqlite:page-hero-buttons`** | `scripts/migrate-sqlite-page-hero-buttons.py` — page hero buttons columns. |
| **`npm run migrate:sqlite:pages-blocks-uid`** | `scripts/migrate-sqlite-pages-blocks-uid.py` — UUID defaults for block rows/items (duplicate-key / id fixes). |
| **`npm run migrate:sqlite:site-settings-sticky-header`** | `scripts/migrate-sqlite-site-settings-sticky-header.py` — sticky header field on site settings global. |
| **`npm run migrate:sqlite:homepage-hero-secondary-cta`** | `scripts/migrate-sqlite-homepage-hero-secondary-cta.py` — homepage hero secondary CTA columns. |
| **`npm run migrate:sqlite:blocks-id-to-text`** | `scripts/migrate-sqlite-blocks-id-to-text.py` — block table PKs **INTEGER → TEXT** for Payload 3 object IDs. |

**Before risky migrations:** back up **`payload.sqlite`** (see **Restore-Points.md**).

---

## Deploy uploaders (Spaceship / FTPS)

**Windows:** PowerShell with **ExecutionPolicy** satisfied (scripts use **Bypass**). Credentials/target host come from your environment or script config as documented in **Spaceship.md** / **Development.md**.

**Paths with parentheses** (e.g. **`app/(payload)/...`**): PowerShell treats **`(`** as special. Either **quote** the path: `npm run pushitup -- "app/(payload)/custom.scss"` or use the alias **`npm run pushitup:admin-ui`** for the usual admin version + styles files.

| Command | What it does |
|--------|----------------|
| **`npm run pushitup`** (or **`npm run PushItUP`**) | **`scripts/PushItUP.ps1`** — uploads listed **files or folders** directly over FTPS. **Spaceship default:** `npm run pushitup -- .next` after **`npm run build`** = full build folder, **no zip/unzip** (see **Spaceship.md** cheat sheet). Example: `npm run pushitup -- server.js` |
| **`npm run pushitup:admin-ui`** | Uploads **`middleware.ts`**, **`lib/msc-admin-version.ts`**, **`components/msc-payload-nav-dashboard.tsx`**, **`app/(payload)/custom.scss`** — safe on Windows (no manual quoting). |
| **`npm run pushit:live`** | **`npm run build`** → **`pushitup:admin-ui`** → **`pushitup -- .next`** → **`npm run dev:fresh`** (auto-fixes local stale `.next` after deploy), then prints reminder to **Restart** Node in cPanel. Say *“push it live”* / *“run pushit live”* in chat to mean this. |
| **`npm run pushit:live:safe`** | Runs **`verify:local`** preflight first; if all checks pass, runs full **`pushit:live`** flow. Use when you want extra guardrails. |
| **`npm run pushitupzip`** (or **`npm run PushItUPzip`**) | **`scripts/PushItUPzip.ps1`** — zips each target under **`.pushitupzips/`**, then uploads. For **`.next`**, the file is **`next-build.zip`** (not **`.next.zip`**, so cPanel shows it). Remote path: **`.pushitupzips/next-build.zip`** under your FTPS root. Example: `npm run pushitupzip -- .next` |
| **`npm run test:spaceship-ftp`** | **`scripts/Test-SpaceshipFtp.ps1`** — read-only FTPS check using **`.vscode/sftp.json`** (login + LIST). Does not upload. If `remotePath` returns 550, **PushItUP** already falls back to FTP session root (`/`); uploads can still work (see **Spaceship.md**). |

Default workflow: **`npm run pushit:live`** (build + admin-ui files + full `.next` + local `dev:fresh`) then restart Node in cPanel.  
Use **`pushitupzip`** only when explicitly needed (bandwidth/workaround scenario documented in **Spaceship.md**).

---

## Related docs

- **START-HERE.md** — first-stop daily operational guide (source-of-truth order + deploy rules).
- **Run-Next-JS.md** — URLs, env, first-time `/admin`.
- **Development.md** — architecture, Payload quirks, webpack vs Turbopack.
- **ReCall.md** — session memory and resume checklist.
- **Restore-Points.md** — checkpoints and DB backups.
- **Spaceship.md** — production host notes, **cPanel login + how to open Terminal / Node.js** (session `cpsess` links expire; stable links are in that doc).
- **Agent-Runbook.md** — copy/paste prompts (**Lets Start / Continue / Finish / Finish + Deploy / Push It Live**).

---

## Things you say in chat (not the terminal)

Natural-language requests for Cursor. The agent runs real terminal commands under the hood; you don’t have to paste **`npm …`** yourself unless you want to.

**Deep copy/paste checklist:** **ReCall.md** → *Session Resume Prompt*. **Spaceship / FTP / cPanel paths:** **Spaceship.md** (do not commit credentials—local **`.vscode/sftp.json`** is git-ignored).

---

### ReCall and sessions

| You say (examples) | What it usually triggers |
|--------------------|---------------------------|
| **Continue from ReCall.** | Read **ReCall.md** + **Development.md**, **Done / Next / Open Questions**, **`npm install`** if needed, **`npm run dev:payload`**, smoke **`/`** + **`/admin`**, then your next task. |
| **Continue my project using my ReCall.md so everything starts.** | Same: docs first, dev stack up, aligned with **ReCall** checkpoints. |
| **Run ReCall.** / **Do a ReCall on this project.** | Summarize from **ReCall** + related docs; often **next 3 actions**; may skip starting dev unless you ask. |
| **Do a ReCall on this project and propose the next 3 actions.** | Short resume plus three concrete priorities. |
| **Continue from ReCall and wire WordPress backend phase 1.** | Context from docs, then headless WP Phase 1 work (**Site-Plans** / **ReCall**). |
| **Continue from ReCall and finish UI polish pass for [section].** | Doc context, then UI for the section you name (e.g. Demos, Contact). |
| **I'm done for now.** / **Continue later.** | Short **ReCall.md** closeout, confirm saved; optionally stop dev on **3000** (and nearby ports). |

---

### Git: repo, checkpoints, branches

| You say (examples) | What it usually triggers |
|--------------------|---------------------------|
| **Update the git repo** / **Commit and push my changes.** | **`git status`**, review diff, stage, commit with a clear message, **`git push`** (and fix issues if push fails). |
| **Checkpoint this in git** / **I need a safe commit.** | Same as above; emphasizes a clean save point before risky work. |
| **Create a restore branch from here and push.** | New branch (name you give or agent suggests), **`push -u origin`**, matches **ReCall.md** → *Git Quick Reference*. |
| **What's dirty in my working tree?** | Status + summary of changed files; no commit unless you ask. |
| **Help me resolve this git conflict** (paste error or file). | Walk through conflict markers / merge steps. |

---

### Spaceship, PushIt, deploy

| You say (examples) | What it usually triggers |
|--------------------|---------------------------|
| **Deploy to Spaceship** / **Push this to production.** | Follow **Spaceship.md**: small change → **`npm run pushitup -- …`** + remind host restart; deps change → upload **`package.json`** / lockfile + **`npm install --legacy-peer-deps`** on host; full refresh → local **`npm run build`** + **`pushitupzip -- .next`** (or your zip name) + host unzip + restart. |
| **Run PushIt** / **PushItUP** / **pushitup** for [files]. | Runs **`npm run pushitup -- <paths>`** (direct FTPS upload). Example intent: *push **`server.js`** and **`collections/Leads.ts`***. |
| **Zip and upload .next** / **Use pushitupzip.** | **`npm run build`** (if needed), then **`npm run pushitupzip -- .next`**; archives land in **`.pushitupzips/`** then upload. |
| **Connect me to Spaceship** / **How do I FTP to the host?** | Points to **Spaceship.md**: server profile, that credentials live in **`.vscode/sftp.json`**, cPanel/Node selector links, **no secrets in git**. |
| **Fix the deploy** / **503 on the live site** / **Production app won’t start.** | **Spaceship.md** troubleshooting: restart Node app in cPanel, **`npm install --legacy-peer-deps`**, **`node server.js`** on host for errors, env vars (**`NEXT_PUBLIC_SERVER_URL`**, **`PAYLOAD_SECRET`**, etc.). |
| **Verify email still goes to localhost or 0.0.0.0.** | Check **`NEXT_PUBLIC_SERVER_URL`**, latest **`collections/Leads.ts`** deployed, relative redirects—per **Spaceship.md**. |

---

### Host actions you describe in plain English

You can say things like: *“On Spaceship, replace `.next` from the zip I uploaded”* or *“Remind me the host terminal cd + venv activate lines.”* The agent should pull exact commands from **Spaceship.md** (venv path, **`unzip`**, restart **ReStartIt**).

---

### Docs, migrations, housekeeping

| You say (examples) | What it usually triggers |
|--------------------|---------------------------|
| **Update Jedi-List** / **Add this command to the docs.** | Edit **Jedi-List.md** (or file you name) to match what you want recorded. |
| **Update ReCall** with what we did today. | New dated entry in **ReCall.md** (major changes, decisions). |
| **I need SQLite migration for [feature].** | Picks or runs the right **`npm run migrate:sqlite:…`** after checking **Development.md** / **Restore-Points.md**; backup **`payload.sqlite`** first if risky. |
| **Regenerate Payload import map.** | **`npx payload generate:importmap`** (or manual merge)—**Development.md** → admin / import map. |

---

**Tip:** Combine one “mode” line with one concrete task, e.g. *Continue from ReCall* + *Then: push the Leads fix with pushitup and tell me what to do in cPanel.*
