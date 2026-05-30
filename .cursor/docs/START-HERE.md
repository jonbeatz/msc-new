# START HERE (Daily Ops)

If an agent is new to this project, read this file first.

Project root: `D:\Cursor_Projectz\MSC_Clean_v2\msc-new`

---

## Operator profile

- Operator name: **Jon**
- Handshake rule: when an agent starts or resumes from docs, first line should include the operator name.
  - Startup example: **"Ok Jon - docs loaded, ready to go."**
  - Closeout example: **"Great work Jon - all saved, see you later."**

Use this as a quick confidence signal that docs were read.

---

## Source-of-truth order

When docs differ, use this priority:

1. `START-HERE.md` (this file)
2. `Agent-Runbook.md` (copy/paste prompts)
3. `Spaceship.md` (deploy + cPanel)
4. `Jedi-List.md` (commands quick reference)
5. `Development.md` (architecture details)
6. `ReCall.md` / `Restore-Points.md` (history + checkpoints)

---

## Core docs only (daily)

These are the only docs you should need most days:

- `START-HERE.md`
- `Agent-Runbook.md`
- `Spaceship.md`
- `Jedi-List.md`
- `Restore-Points.md`

Other docs are reference/history and optional unless a task specifically needs them.

Portable workflow skills pack for reuse in other projects:
- `.cursor/skills/Workflow-Portable/README.md`

Project rules layout:
- Core rule file: `.cursorrules`
- Scoped rules folder: `.cursor/rules/` (topic-specific `.mdc` files)
- Skills: `.cursor/skills/`

---

## Docs map (what to read when)

| Doc | Use it for | Priority |
|---|---|---|
| `START-HERE.md` | Daily startup/deploy guardrails | Daily |
| `Agent-Runbook.md` | Copy/paste prompts (`Ready to begin`, `Lets Start`, etc.) | Daily |
| `Spaceship.md` | Production deploy + cPanel + FTP rules | Daily |
| `Jedi-List.md` | Commands and script meanings | Daily |
| `Restore-Points.md` | Known-good checkpoints + rollback notes | Daily (after milestones) |
| `ReCall.md` | Session history and resume context | Optional |
| `ToDo.md` | Next ideas / tomorrow’s focus (lightweight; not a full backlog) | Optional |
| `Development.md` | Architecture and deep implementation details | Optional |
| `MCP-SETUP.md` | Cursor MCP global vs project config, sync:mcp-env | Optional |
| `Run-Next-JS.md` | Local run/build/deploy summary | Optional |
| `Site-Plans.md` | Product/site planning notes | Archive/Optional |
| `Headless-WP-Backend-Plan.md` | WP integration planning | Archive/Optional |
| `NovaMira-MSC-PRO-ENGINE.md` | Branding/engine reference notes | Archive/Optional |

If an agent over-reads history/planning docs, tell it:
`Use only START-HERE, Agent-Runbook, Spaceship, Jedi-List, and Restore-Points unless asked otherwise.`

---

## Fast daily workflow

### Start work (local)

1. Open terminal in repo root.
2. Run **`npm run dev`** (frees port **3000**, then **`next dev`** — no full **`.next`** wipe on every start).
3. Verify:
   - `http://localhost:3000/`
   - `http://localhost:3000/admin`

If local breaks with missing vendor chunks (`date-fns`, etc.), after **`pushit:live`**, or when **`/admin`** **500s** after a bad overlap, run **`npm run dev:fresh`** or **`npm run dev:recover`** (both **clean** **`.next`** then dev).

### Public site URL (`.env.local` + production)

- **Local:** set **`NEXT_PUBLIC_SERVER_URL`** in **`.env.local`** to your dev origin (see **`.env.example`**) so Payload admin **CSRF** and **View site** match what you open in the browser.
- **Production:** set **`NEXT_PUBLIC_SERVER_URL`** and/or **`PAYLOAD_PUBLIC_SERVER_URL`** on the host (see **Spaceship.md**). If both are missing at build/runtime, the app falls back to **`https://mystudiochannel.com`** (override with **`MSC_CANONICAL_SITE_ORIGIN`**). Details: **`Jedi-List.md`** → *Public site URL*.

### Why the browser shows a white page + `/_next/static/chunks/fallback/*` (500)

That pattern almost always means **`.next` was deleted or overwritten while `next dev` was still running** — for example **`npm run verify:next`** or **`npm run clean:next`** in a **second** terminal while the dev server was up. The dev server then serves broken chunks and error fallbacks.

**Fix (Local / Cursor / repo root):** one terminal only — **`npm run dev:recover`** (or **`npm run repair:dev`** for clean + build + dev). Do not run **`verify:next`** until dev is stopped unless you use **`npm run verify:next:safe`**, which stops whatever is on port **3000** first.

**Prevention:** Cursor blocks **`verify:next`** / **`clean:next`** when port **3000** is busy (see **`.cursor/hooks.json`**). Prefer **`verify:next:safe`** when you are not sure.

### Push to live

From repo root on PC:

1. Run `npm run pushit:live` (ships **admin-ui sources**, **`.next`**, **`payload.sqlite`**, and **`public/media`** per **Spaceship.md**; build step uses live public URL briefly). By default it **does not** auto-start local dev — run **`npm run dev`** or **`npm run dev:fresh`** afterward. To **auto-run** **`dev:fresh`** after upload, set **`PUSHIT_LIVE_RUN_DEV_FRESH=1`** first (**Spaceship.md**).
2. Wait for build/upload completion. **One or two FTPS errors** on random `.next` chunks with **retry OK** at the end is normal.
3. In cPanel, run any **Terminal** steps the script printed (sqlite URL fix / `pkill` if applicable), then restart the Node app (Stop → wait → Start). **Terminal `cd`:** **`/home/<username>/mystudiochannel.com`**, not **`/<username>/...`**.
4. Validate live in Incognito.

Important: `pushitup` runs on PC, not cPanel Terminal. You may upload **`.next`** with **FileZilla** instead if you follow **Spaceship.md** → *Manual `.next` upload* and still deploy the rest of Tier 2 when needed.

**FTPS target folder:** **`.vscode/sftp.json`** **`remotePath`** must match **Spaceship.md** (this host: **`/`**). The shell path **`cd /home/wjehbnzcoy/mystudiochannel.com`** is only for **cPanel Terminal**, not for **`remotePath`**. After any **`remotePath`** edit, run **`npm run verify:ftp-smoke`** (or **`pushitup:ftp-smoke`** + check FileZilla) so **`.next`** does not upload into a nested junk tree.

---

## cPanel links (session-scoped)

**Jon’s current bookmarks** (update this block when `cpsess…` expires after logout):

- Node app Start/Stop page:  
  <https://server9.shared.spaceship.host:2083/cpsess0827945513/frontend/jupiter/lveversion/nodejs-selector.html.tt#/applications/mystudiochannel.com>
- Terminal page:  
  <https://server9.shared.spaceship.host:2083/cpsess0827945513/frontend/jupiter/terminal/index.html>

These `cpsess...` links can expire. If they do, log in at:
<https://server9.shared.spaceship.host:2083/>

**Agent instruction:** When telling Jon to run something, always say whether it is **Local (Cursor / PC repo root)** or **Live (cPanel → Terminal)**. For Start/Stop, use the Node link above; for host shell steps, use the Terminal link above.

---

## Top 7 rules (avoid pain)

1. Do not run `pushitup` in cPanel Terminal.
2. For app/admin code changes: full `npm run build` + full `.next` upload. Keep **`.vscode/sftp.json`** **`remotePath`** aligned with **Spaceship.md** (FTPS **`/`** vs cPanel **`cd`**); run **`npm run verify:ftp-smoke`** if anything about the upload target folder is uncertain.
3. Do not partially upload random files inside `.next`.
4. If you delete server `.next`, immediately re-upload `.next` from PC.
5. Only run server `npm install --legacy-peer-deps` when `package.json`, lockfile, or `patches/` changed.
6. Keep `patches/` present on server if install relies on `patch-package`.
7. After deploy, restart Node app and validate in Incognito.

---

## Quick incident recovery (when things suddenly break)

1. Local broken after deploy? Run `npm run dev:fresh`.
2. If `verify:local` still fails on `/` + `/admin`, check for port hijack:
   - kill stale node process on `3000`
   - rerun `npm run dev:fresh`
3. Live 500 with `vendor-chunks` module errors:
   - Stop app in cPanel
   - remove server `.next`
   - re-upload full `.next` from PC
   - Start app again
4. In cPanel Terminal, if `npm: command not found`, activate nodevenv first:
   - `source ~/nodevenv/mystudiochannel.com/*/bin/activate`
5. Use correct log files in app root:
   - `.stderr.log`
   - `.stdout.log`

---

## What to tell a new agent

**Full session sync (recommended):** say **`Ready to begin`** or paste the block from **`Custom-Prompts.md` → item 0** — same content as **`Agent-Runbook.md` → §0 Ready to begin (full sync)**. The agent reads core docs, rules, and git/local health before coding; first reply should start with **`Ok Jon - Ready to begin.`** (see **Agent-Runbook** handshake).

**Known-good resume tip:** newest dated row in **`Restore-Points.md`** (e.g. **`RP-2026-04-13-*`**) — stay on **`mscNowLive-v4-RestorePoint`** and **`git pull`** for latest.

**Minimal bootstrap:** paste this:

```text
Use `.cursor/docs/START-HERE.md` then `.cursor/docs/Agent-Runbook.md` and `.cursor/docs/Spaceship.md` as source of truth.
Project root is D:\Cursor_Projectz\MSC_Clean_v2\msc-new.
Use operator handshake with my name: Jon.
```

---

## Restore points (quick rollback memory)

Yes, keep using `Restore-Points.md`. It is useful.

Use this lightweight pattern after meaningful milestones:

- **Checkpoint ID:** `RP-YYYY-MM-DD-short-name`
- **Branch/commit:** `<branch> @ <sha>`
- **What was working:** 2-4 bullets
- **How to restore:** exact commands (checkout/reset/deploy/startup)
- **Known caveats:** env/dependency notes

This gives fast "go back to known good" context for future sessions.

