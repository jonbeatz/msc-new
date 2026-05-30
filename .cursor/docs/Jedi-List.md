# Jedi List — project commands

Quick reference for **npm scripts** and related tooling wired up in **`package.json`** (msc-new / Payload + Next.js). Run everything from the repo root (folder with `package.json`).

---

## Source of truth order (for agents and new sessions)

When docs differ, use this priority:

1. **`START-HERE.md`** (daily guardrails + source-of-truth root)
2. **`Agent-Runbook.md`** (daily prompts / operating workflow)
3. **`Spaceship.md`** (deploy + cPanel responsibilities)
4. **`Jedi-List.md`** (command quick reference)
5. **`Development.md`** (architecture details)
6. **`ReCall.md`** (session log/history)

---

## When local `/` or `/admin` breaks (do this first)

Symptoms: **Runtime Error** `Cannot find module './vendor-chunks/date-fns.js`**, missing styles, giant logo only, or admin overlay after **`npm run build`**, switching branches, or heavy edits.

1. Stop the dev server (**Ctrl+C** in the terminal where it runs).
2. Run **`npm run clean:next`** (wipes **`.next`** + **`node_modules/.cache`**).
3. Run **`npm run dev:payload`** and reload the browser.

If it still misbehaves, close other Node processes on port **3000**, then repeat step 2–3. The Next.js error overlay may say **Webpack**; that label is normal for some dev paths and is not the root cause — stale **`.next`** chunks are.

Fast triage pattern:
- `404` on `/` and `500` on `/admin` with API still `200` often means the dev server moved to a different port (3002/3003/3004). Clear stale node on `3000`, then rerun `npm run dev:fresh`.

---

## Repeatable workflow: local → Spaceship → Terminal → Node restart

**Authoritative step-by-step (numbered checklist, PC vs cPanel, what not to run on the server):** **Spaceship.md** → **Successful live update protocol**.

| Step | Where | Action |
|------|--------|--------|
| 1 | **PC (repo root)** | Develop with **`npm run dev:payload`**. Before production upload, **`npm run build`** must succeed. |
| 2 | **PC** | Upload: for **deps / startup / env template** use **`npm run pushitup:server-config`** (see table), or **`npm run pushitup -- package.json package-lock.json server.js patches middleware.ts`** (adjust if you changed more). For **Payload admin / MSC PRO ENGINE look and feel**, run **`npm run pushitup:admin-ui`** (full admin bundle; see **Deploy uploaders** table below). For **branding-only** FTPS (smaller list), **`npm run pushitup:admin-branding`**. Then **`npm run pushitup -- .next`** (full folder; no zip required). |
| 3 | **cPanel → Terminal** | Only if **`package.json` / lockfile / `patches`** changed: activate Node venv, **`cd`** to the app folder, **`npm install --legacy-peer-deps`** (see **Spaceship.md**). **Do not** run **`pushitup`** here. |
| 4 | **cPanel → Node.js Selector** | **Restart** the app (or Stop → Start). |

**Admin version check:** After deploy, open **`/admin`** — you should see **`v1.0.x`** near the sidebar **Log out** area (bottom-left). Bump `lib/msc-admin-version.ts` when you ship admin-facing changes.

---

## Dev and production

| Command | What it does |
|--------|----------------|
| **`npm run dev`** | **Daily dev:** **`kill-dev-port`** then **`next dev -p 3000`** (no **`clean:next`** — faster restarts, normal HMR). Same as **`dev:payload`**. Site: [http://localhost:3000/](http://localhost:3000/). |
| **`npm run dev:payload`** | Same as **`npm run dev`** — marketing site + Payload API + admin. Prefer this name in docs so it’s obvious Payload is included. |
| **`npm run clean:next`** | Deletes **`.next`** and **`node_modules/.cache`** (fixes missing **`vendor-chunks/date-fns.js`**, blank CSS, broken admin). |
| **`npm run dev:fresh`** | **`kill-dev-port`** → **`clean:next`** → **`next dev -p 3000`** — use after **`npm run build`**, **`pushit:live`**, vendor-chunk **500s**, or when **`dev`** looks corrupted. |
| **`npm run build`** | Production build (`next build`). Use before `next start` or before zipping `.next` for low-memory hosts. Requires env (see **Run-Next-JS.md**). |
| **`npm run start`** | Serves the **last build** (`next start`). Use for a local smoke test after `build`. |
| **`npm run verify:local`** | Local pre-deploy smoke checks for `/`, `/admin`, and `api/globals/projects-home`; exits non-zero if any check fails. |
| **`npm run verify:live`** | Live smoke checks for `https://mystudiochannel.com/`, `/admin`, and `api/globals/projects-home`; exits non-zero if any check fails. |
| **`npm run verify:next`** | **`clean:next`** + **`next build`** — production build gate after app/config edits (see **`.cursor/rules/local-runtime-recovery.mdc`**). **Never** run while **`next dev`** is on port **3000** (deletes **`.next`** → **500** + broken **`/_next/static/chunks/fallback/*`**). |
| **`npm run verify:next:safe`** | Frees port **3000** (stops stray **`next dev`**), then **`verify:next`**. Use whenever you need a build check and are not sure nothing is listening on **3000**. |
| **`npm run dev:recover`** | Same as **`npm run restart:dev`** — kill **3000**, then **`npm run dev:fresh`** (**`clean:next`** + **`next dev`**). Use for white screen / vendor-chunk **500s** / **`/admin`** broken after **`clean:next`** overlapped a running dev server. |
| **`npm run dev:reset`** | Alias for **`npm run dev:fresh`** (used by **`.cursor/rules/local-runtime-recovery.mdc`** auto-reset playbook). |
| **Build recovery (images/assets look wrong after `build`)** | **`npm run dev:fresh`** — clears stale **`.next`** so dev serves **`/media/...`** and chunks correctly. |

---

## Public site URL (env — keep Payload + Next aligned)

| Variable | Role |
|----------|------|
| **`NEXT_PUBLIC_SERVER_URL`** | Inlined on client + server. **Local:** set in **`.env.local`** to your dev origin so admin **View site** and Payload **CSRF** match the browser. **Production build:** set to **`https://mystudiochannel.com`** (or rely on fallback below). |
| **`PAYLOAD_PUBLIC_SERVER_URL`** | Runtime on cPanel/Node; **first** in **`getPublicOrigin()`** / emails / **`payload.config.ts`** **`serverURL`** when set. |
| **`MSC_CANONICAL_SITE_ORIGIN`** | Optional override for the code fallback when both URLs above are unset (default **`https://mystudiochannel.com`** in **`lib/site-origin-defaults.ts`**). |
| **`PAYLOAD_CSRF_EXTRA_ORIGINS`** | Optional comma-separated extra origins for Payload CSRF (staging, etc.). |

**Code:** **`lib/public-origin.ts`** — **`getPublicOrigin()`** (server / emails), **`getPublicOriginClient()`** (admin **Client Components** only — avoids hydration mismatch). **`buildPayloadCsrfOriginList()`** builds CSRF from env (no hardcoded dev hosts).

---

## Media (disk ↔ Payload)

| Command | What it does |
|--------|----------------|
| **`npm run media:consolidate`** | Moves stray files from repo root **`media/`** and legacy **`public/images`** (if present) into **`public/media`**; removes redundant folders. See **`scripts/consolidate-media-folders.mjs`**. |
| **`npm run media:sync`** | Registers files already under **`public/media`** as **Media** rows in Payload (alias: **`npm run migrate:media:from-public-images`**). |

**Custom prompts:** **Custom-Prompts.md** items **33–35** (**Clean my folders**, **Sync my media**, **Full media refresh**).

---

## Install and patches

| Command | What it does |
|--------|----------------|
| **`npm install`** | Installs dependencies. **`postinstall`** runs **`patch-package`**, which applies fixes under **`patches/`** (e.g. Payload UI / Next). Run after clone or dependency changes. |

---

## Quality

| Command | What it does |
|--------|----------------|
| **`npm run lint`** | Runs **`next lint`** (Next.js + ESLint flat config via **`eslint.config.mjs`**). |

---

## Admin deploy version (visual check)

After **Payload admin** or **CMS panel** changes ship to production, bump **`MSC_ADMIN_VERSION`** in **`lib/msc-admin-version.ts`** (e.g. `1.0.6` → `1.0.7`). The sidebar shows **`v1.0.x`** near **Log out** so you can confirm the new build is live. Ship that file (and the rest of the **MSC PRO ENGINE** admin bundle) with **`npm run pushitup:admin-ui`** — see **Deploy uploaders** table above.

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
| **`npm run migrate:sqlite:fix-bookings-table`** | `scripts/fix-sqlite-bookings-table.py` — fixes **`malformed database schema (bookings_…_idx) - no such table: main.bookings`** (orphan **`bookings`** indexes). See **Spaceship.md** § shared-host **4)**. |

**Before risky migrations:** back up **`payload.sqlite`** (see **Restore-Points.md**).

---

## Cursor MCP and GitHub/Google-API tooling

Secrets live in **`.env.local`** only. After changing GitHub, Resend, WordPress, or Google/ngrok keys, run **`npm run sync:mcp-env`** and reload MCP in Cursor (**Settings → MCP**). Full setups: **[MCP-SETUP.md](./MCP-SETUP.md)** and **[Ngrok-SETUP.md](../config/Ngrok-SETUP.md)**.

| Command | What it does |
|--------|----------------|
| **`npm run sync:mcp-env`** | Syncs **`.env.local`** → global **`~/.cursor/mcp.json`** (GitHub, Tavily; Resend if enabled) + project **`.cursor/mcp.json`** (WordPress). |
| **`npm run sync:mcp-all`** | Same as **`sync:mcp-env`** + confirmation echo. |
| **`npm run sync:github-mcp`** | Alias for **`sync:mcp-env`** (replaces deprecated Python script). |
| **`npm run test:github-api`** | Verifies **`GITHUB_PERSONAL_ACCESS_TOKEN`** from **`.env.local`** against GitHub REST API. |
| **`npm run test:tavily-api`** | Verifies **`TAVILY_API_KEY`** from **`.env.local`** against Tavily search API. |
| **`npm run backup:github-repos`** | Clones + bundles Jon’s GitHub repos to **`.cursor/GitHub-Repo-BackUps/`** (gitignored). |
| **`npm run msc:litellm:preflight`** | Performs config, Vertex credentials, port, and LiteLLM dependency preflight check. |
| **`npm run msc:litellm:start`** | Starts LiteLLM Proxy in localhost mode on port **4000**. |
| **`npm run msc:litellm:start:ngrok`** | Starts LiteLLM on port **4000** and mounts an HTTPS ngrok tunnel. |
| **`npm run msc:google-api:start`** | Shorthand for stopping active proxy/ngrok + starting them fresh in ngrok mode. |
| **`npm run msc:litellm:test:ngrok`** | Runs full connection check against local + ngrok remote `/v1/models` endpoints. |
| **`npm run msc:litellm:stop`** | Gracefully clears LiteLLM, ngrok, and port **4000** / **4040** processes. |
| **`npm run fix:hero-slide-images`** | Reassigns homepage hero slide **Media** IDs in **`payload.sqlite`** (Python). |

**Project MCP files (committed, placeholders only):** **`.cursor/mcp.json`**, **`.cursor/mcp.json.example`**, **`.cursor/mcp.servers.archived.json`**.

**Payload CMS MCP:** Do **not** add **`@govcraft/payload-cms-mcp`** to **`mcp.json`**. Use workspace **`user-payload`**, REST **`/api/*`**, or **`/admin`** — see **MCP-SETUP.md**.

---

## Deploy uploaders (Spaceship / FTPS)

**Windows:** PowerShell with **ExecutionPolicy** satisfied (scripts use **Bypass**). Credentials/target host come from your environment or script config as documented in **Spaceship.md** / **Development.md**.

**Paths with parentheses** (e.g. **`app/(payload)/...`**): PowerShell treats **`(`** as special. Either **quote** the path: `npm run pushitup -- "app/(payload)/custom.scss"` or use **`npm run pushitup:admin-ui`** / **`npm run pushitup:admin-branding`** (both include **`app/(payload)/custom.scss`** without manual quoting).

| Command | What it does |
|--------|----------------|
| **`npm run pushitup`** (or **`npm run PushItUP`**) | **`scripts/PushItUP.ps1`** — uploads listed **files or folders** directly over FTPS. **Spaceship default:** `npm run pushitup -- .next` after **`npm run build`** = full build folder, **no zip/unzip** (see **Spaceship.md** cheat sheet). Example: `npm run pushitup -- server.js` |
| **`npm run pushitup:admin-ui`** | **Primary MSC PRO ENGINE / Payload admin bundle:** uploads **`middleware.ts`**, **`lib/msc-admin-version.ts`**, **`components/msc-payload-nav-dashboard.tsx`**, **`components/msc-payload-graphics.tsx`**, **`components/msc-payload-admin-enhancements.tsx`**, **`collections/Users.ts`**, **`payload.config.ts`**, **`app/(payload)/custom.scss`**. Matches **`package.json`**; safe on Windows (no manual quoting for the SCSS path). |
| **`npm run pushitup:admin-branding`** | **Branding-only subset:** **`components/msc-payload-graphics.tsx`**, **`components/msc-payload-admin-enhancements.tsx`**, **`collections/Users.ts`**, **`payload.config.ts`**, **`app/(payload)/custom.scss`**. Use when you only changed admin look-and-feel sources; you still need **`npm run build`** + **`pushitup -- .next`** if React/admin bundle output must change on the host. Shortcut: **Custom-Prompts.md** → **Push my branding** (item **37**). |
| **`npm run pushitup:server-config`** | **Tier 3 / hosting:** uploads **`server.js`**, **`package.json`**, **`package-lock.json`**, **`.env.example`**. Then **cPanel → Terminal** → **`npm install --legacy-peer-deps`** if lockfile changed. Shortcut: **Custom-Prompts.md** → **Push server config** (item **39**). Add **`patches/`** or extra paths with **`npm run pushitup -- …`** when needed. |
| **`npm run pushit:live`** | **`npm run build`** (live **`NEXT_PUBLIC_SERVER_URL`** for that step only) → **`pushitup:admin-ui`** → **`pushitup -- .next`** → **`pushitup -- payload.sqlite`** → **`pushitup -- public/media`**. Step **6/6** **`dev:fresh`** runs only if **`PUSHIT_LIVE_RUN_DEV_FRESH=1`** (default: skip — start **`npm run dev`** / **`dev:fresh`** yourself). Prints cPanel reminders. Say *“push it live”* / *“run pushit live”* in chat to mean this. |
| **`npm run pushit:live:safe`** | Runs **`verify:local`** preflight first; if all checks pass, runs full **`pushit:live`** flow. Use when you want extra guardrails. |
| **`npm run pushitupzip`** (or **`npm run PushItUPzip`**) | **`scripts/PushItUPzip.ps1`** — zips each target under **`.pushitupzips/`**, then uploads. For **`.next`**, the file is **`next-build.zip`** (not **`.next.zip`**, so cPanel shows it). Remote path: **`.pushitupzips/next-build.zip`** under your FTPS root. Example: `npm run pushitupzip -- .next` |
| **`npm run test:spaceship-ftp`** | **`scripts/Test-SpaceshipFtp.ps1`** — read-only FTPS check using **`.vscode/sftp.json`** (login + LIST). Does not upload. **PushItUP** uses configured **`remotePath`** even when LIST on that path fails (chroot); see **Spaceship.md**. |
| **`npm run pushitup:ftp-smoke`** | Uploads repo-root **`ftp-path-smoke-test.txt`** only — use after changing **`.vscode/sftp.json`** **`remotePath`** to confirm files land **next to `package.json`** on the server (see **Spaceship.md** § FTP). |
| **`npm run verify:ftp-smoke`** | **`scripts/verify-ftp-smoke-remote.ps1`** — read-only **`LIST`** at configured **`remotePath`** and exits **0** only if **`ftp-path-smoke-test.txt`** is present (same session as **PushItUP**). |
| **`npm run parity:ftp`** | **`scripts/ftp-parity-check.ps1`** — compares local **`.next`**, **`public/media`**, **`payload.sqlite`** vs FTPS under **`.vscode/sftp.json`** `remotePath`; writes **`parity-ftp-report.md`** at repo root (**gitignored** — open the file locally after the run). Run after a big deploy to spot drift (compare **`.next`** only after **`npm run build`**, not while **`next dev`** owns **`.next`**). Wrong **`remotePath`** makes parity compare the wrong tree — run **`verify:ftp-smoke`** first if unsure. |

Default workflow: **`npm run pushit:live`** (build + admin-ui + full `.next` + **`payload.sqlite`** + **`public/media`**; local **`dev:fresh`** only if **`PUSHIT_LIVE_RUN_DEV_FRESH=1`**) then restart Node in cPanel. After Tier 2, run **`npm run dev`** or **`dev:fresh`** locally when you want **localhost** again.  
Use **`pushitupzip`** only when explicitly needed (bandwidth/workaround scenario documented in **Spaceship.md**).

You may upload the **full** **`.next`** folder with **FileZilla** instead of **`pushitup -- .next`** if you follow **Spaceship.md** → *Manual `.next` upload* (same app root, full tree, preserve **`@`** in **`vendor-chunks`**). You must still ship **admin-ui sources**, **`payload.sqlite`**, and **`public/media`** when those changed.

**Transient FTPS errors:** one or two **“Unable to connect…”** lines mid-upload are common; **PushItUP** retries failed files once. If the log ends with all files uploaded, no action needed (**Spaceship.md** → *FTPS: occasional failed files*).

If `pushitup -- .next` ends with `PushItUP completed with failures`, immediately re-run `pushitup` for failed areas (usually `.next/static/chunks` and `.next/server/chunks`) before restarting app.

---

## Related docs

- **START-HERE.md** — first-stop daily operational guide (source-of-truth order + deploy rules).
- **Project rules:** `.cursorrules` (core) + `.cursor/rules/*.mdc` (scoped project rules).
- **Run-Next-JS.md** — URLs, env, first-time `/admin`.
- **Development.md** — architecture, Payload quirks, webpack vs Turbopack.
- **MCP-SETUP.md** — Cursor MCP global vs project config, **`sync:mcp-env`**, Payload skip rationale.
- **GitHub-Cheat-Sheet.md** — daily git commands + restore from **`.bundle`** backups.
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
