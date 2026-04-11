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
2. Run `npm run dev:fresh`
3. Verify:
   - `http://localhost:3000/`
   - `http://localhost:3000/admin`

If local breaks with missing vendor chunks (`date-fns`, etc.), run `npm run dev:fresh` again.

### Push to live

From repo root on PC:

1. Run `npm run pushit:live`
2. Wait for build/upload completion.
3. In cPanel, restart Node app (Stop -> wait -> Start).
4. Validate live in Incognito.

Important: `pushitup` runs on PC, not cPanel Terminal.

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
2. For app/admin code changes: full `npm run build` + full `.next` upload.
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

**Full session sync (recommended):** say **`Ready to begin`** — see **`Agent-Runbook.md` → §0 Ready to begin (full sync)**. The agent reads the core docs, rules, and git/local state before work.

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

