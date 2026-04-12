# Custom Prompts (Cheat Sheet)

Use these as quick "commands in plain English" for the agent.

0. **`Ready to begin`**  
   - **Full sync:** agent reads **START-HERE → Agent-Runbook → Spaceship → Jedi-List → ReCall** (+ newest **Restore-Points**), loads **`.cursorrules`** and **`.cursor/rules`**, then git status + local dev health + optional **`verify:local`**. Use when you want to be fully aligned before coding (best for a new chat or after a break). Canonical wording: **`.cursor/docs/Agent-Runbook.md`** → **§0 Ready to begin (full sync)**.

   **Paste this (or say `Ready to begin.` in chat — same intent):**

   ```text
   Ready to begin.

   Project root: D:\Cursor_Projectz\MSC_Clean_v2\msc-new
   Operator: Jon. Use handshake: "Ok Jon - Ready to begin. Full sync from docs and repo."

   You must actually read these files (not from memory) in this order:
   1) .cursor/docs/START-HERE.md — source-of-truth order, daily rules, Jon’s cPanel session links (Node.js + Terminal), fast workflow.
   2) .cursor/docs/Agent-Runbook.md — operator handshake + command locality (Local Cursor vs Live cPanel).
   3) .cursor/docs/Spaceship.md — deploy protocol: pushitup/pushit:live on PC only; cPanel = restart / optional npm install; never pushitup on host.
   4) .cursor/docs/Jedi-List.md — npm scripts (dev:fresh, dev:recover, verify:next:safe, build, lint, verify:local, verify:live, verify:next, media:sync, media:consolidate, pushit:live, parity:ftp, test:spaceship-ftp).
   5) .cursor/docs/ReCall.md — "Current focus" + latest "Recent changes" entry.
   6) Skim .cursor/docs/Restore-Points.md — newest checkpoint row only (if any).

   Also load project constraints:
   - Read .cursorrules if present.
   - List and skim .cursor/rules/*.mdc — at minimum include operator/cPanel rules (e.g. jon-operator-cpanel.mdc): Jon’s bookmarks, always label Local vs Live when giving commands.

   Then run Local (Cursor) checks from repo root:
   - git branch --show-current && git status -sb
   - If nothing healthy on http://localhost:3000/: free port 3000 if another node is bound, then npm run dev:fresh (or confirm dev already running on 3000).
   - Optionally: npm run verify:local — report pass/fail only for /, /admin, projects-home API.

   Respond with:
   A) Confirmed docs read (one line).
   B) Operator + locality reminder (Jon; Local vs Live; where cPanel links live).
   C) Git: branch + clean/dirty + notable untracked if any.
   D) Local: port + dev status + verify:local result if you ran it.
   E) ReCall "Current focus" in 2–4 bullets.
   F) One suggested next action based on git + ReCall.
   G) Ask me: "What do you want to work on today?" if I did not say yet.

   Rules: do not deploy. Do not run pushit:live or pushitup unless I explicitly ask later.
   ```

1. **`Lets Start`**  
   - Lighter morning bootstrap: checks git, starts local safely, verifies `/` + `/admin`, confirms deploy tooling.

2. **`Lets Continue`**  
   - Rehydrates context from docs + git and gives a concise "what matters now" summary.

3. **`Lets Push It Live`**  
   - **Tier 2** full deploy — same as **item 38** (`npm run pushit:live`: build → admin bundle → `.next` → **`payload.sqlite`** → **`public/media`** → `dev:fresh`). Requires a local **`payload.sqlite`** at repo root. Then **Live (cPanel Terminal)** — URL fix + `pkill` (see item **38**); **Node.js Selector → Restart**; Incognito validation.

4. **`Lets Finish`**  
   - End-of-day closeout without forced deploy: status, docs update, confirm commit/push, stop local services.

5. **`Lets Finish + Deploy`**  
   - Same as `Lets Finish` plus deploy and post-deploy validation instructions.

6. **`Run dev:fresh and recover localhost`**  
   - Resets stale local state and restores healthy dev on `http://localhost:3000`.

7. **`Audit docs for contradictions and tighten source-of-truth`**  
   - Finds conflicting instructions and aligns docs to the correct order.

8. **`Create a restore point for this milestone`**  
   - Appends a clean `Restore-Points.md` entry with branch/SHA, what works, and restore steps.

9. **`Give me deploy-only steps for this exact change`**  
   - Returns only the minimal build/upload/restart steps for current edits.

10. **`Before you edit, list impacted files and why`**  
    - Forces a quick pre-edit plan so changes are intentional and easy to review.

11. **`Lets Checkpoint Docs + Commit`**  
    - Updates key docs for today’s work, summarizes changes, then confirms and commits/pushes (no live deploy).

12. **`Lets Checkpoint + Deploy`**  
    - Runs docs checkpoint + commit/push, then deploys (`pushit:live`) with confirm gates and cPanel restart links.

13. **`Lets Cut New Branch`**  
    - Creates a clean branch from current HEAD, pushes upstream, and confirms active branch/status.

14. **`Lets Verify Live`**  
    - Runs local smoke checks and gives a concise post-deploy validation checklist + fast recovery if needed.

15. **`Lets Push It Live (Safe)`**  
    - Runs `verify:local` preflight first; only deploys if checks pass.

16. **`Run verify:local and show pass/fail only`**  
    - Fast health check without deploying; good before risky changes.

17. **`Look at Source of Truth and confirm working mode`**  
    - Reads `START-HERE` source order, confirms what docs it will trust, then gives the next safest action.

18. **`Audit my skills, rules, and runbook for drift`**  
    - Reviews `.cursorrules`, project `SKILL.md` files, and runbook prompts for contradictions or stale guidance.

19. **`Sync docs to scripts (no guessing)`**  
    - Cross-checks docs against `package.json` scripts and updates mismatched command wording.

20. **`Show me only the exact next step`**  
    - Gives one concrete action only (no extra options), useful when you want low-noise execution.

21. **`Pre-deploy risk check for current changes`**  
    - Reviews current diff and lists top deployment risks plus the shortest prevention steps.

22. **`Lets Checkpoint Docs`**  
    - Updates only needed docs for current work, syncs commands to scripts, and stops before any git commit/push.

23. **`Take a snapshot`**  
    - Runs docs checkpoint + approved commit/push, then proposes 3 branch names and cuts a restore branch for rollback safety.

24. **`Lets Restore Branch from <branch-name>`**  
    - Safely switches to a known-good branch from GitHub with dirty-tree protection and explicit confirmation gates.

25. **`Run verify:local and show pass/fail only`**  
    - Runs local endpoint health checks only (`/`, `/admin`, API) with concise pass/fail output.

26. **`Run verify:live and show pass/fail only`**  
    - Runs live endpoint health checks only (`https://mystudiochannel.com/`, `/admin`, API) with concise pass/fail output.

27. **`Lets test Local`**  
    - Alias for running `verify:local` and returning pass/fail only.

28. **`Lets test Live`**  
    - Alias for running `verify:live` and returning pass/fail only.

29. **`Lets test FTP`**  
    - Runs `test:spaceship-ftp` for a quick FTPS login/list check and reports ready/not-ready.

30. **`Lets run system check`**  
    - Runs local + live + FTP + repo-status checks and returns one consolidated readiness report.

31. **`Ready to begin`**  
    - Same full-sync flow as **item 0** above (and **`Agent-Runbook.md` §0**): read **START-HERE**, **Agent-Runbook**, **Spaceship**, **Jedi-List**, **ReCall** (+ skim **Restore-Points**), **`.cursorrules`** + **`.cursor/rules`**, then **Local (Cursor)** git status, healthy **`localhost:3000`** (free port **3000** / **`dev:fresh`** if needed), optional **`verify:local`**; reply in sections **A–G**; handshake **`Ok Jon - Ready to begin`**; **no deploy**. Say **`Ready to begin.`** in chat or paste the block under **item 0**.

32. **`I'm done for now`** (or **`Continue later`**)  
    - End-of-session closeout: short **ReCall.md** append (what shipped, next step), confirm docs saved if edited, optionally stop **Local (Cursor)** dev on port **3000**; no deploy unless you say otherwise.

33. **`Clean my folders`**  
    - Execute `npm run media:consolidate` to move stray files from repo root `media/` and from other redundant locations into `public/media` (as defined in `scripts/consolidate-media-folders.mjs`). Report moved files and confirm deletion of redundant folders.

34. **`Sync my media`**  
    - Execute `npm run media:sync` to register new physical files in `public/media` into the Payload database. This bypasses browser 'Alt Text' requirements for bulk local files. Report final file-to-database row count.

35. **`Full media refresh`**  
    - Runs **Clean my folders** followed by **Sync my media**. Verifies all UI components use `/media/` paths and confirms the project is **Ready to begin** for design or deploy.

36. **`Fix localhost (white screen / 500 / fallback chunks)`**  
   - **Local (Cursor / repo root):** explain the usual cause (**`.next`** deleted while **`next dev`** was still running — often **`verify:next`** or **`clean:next`** in a second terminal). Run **`npm run dev:recover`** (or **`npm run repair:dev`**). For production checks when dev might be on port **3000**, use **`npm run verify:next:safe`** instead of raw **`verify:next`**. Remind: Cursor hooks block **`verify:next`** when **3000** is busy.

37. **`Push my branding`**  
   - **Tier 1 — Fast FTP (look and feel only).** **Local (Cursor / repo root):** runs **`npm run pushitup:admin-branding`** — **`PushItUP.ps1`** uploads **only** these paths: **`components/msc-payload-graphics.tsx`**, **`components/msc-payload-admin-enhancements.tsx`**, **`collections/Users.ts`**, **`payload.config.ts`**, **`app/(payload)/custom.scss`**. No production build in this command: use for quick SCSS/config/docs tweaks when you accept that **bundled** admin UI may not change until you run **Tier 2**. If you changed React behavior that affects the compiled admin bundle, run **`Lets Push It Live`** (item **38**) instead. After upload, **Live (cPanel)** — Restart the Node.js app for `mystudiochannel.com`.

38. **`Lets Push It Live`**  
   - **Tier 2 — Full build + DB + media ship (“zero footprint” sync).** **Local (Cursor / repo root):** **`npm run pushit:live`** runs: **`npm run build`** → **`npm run pushitup:admin-ui`** → **`npm run pushitup -- .next`** → **`npm run pushitup -- payload.sqlite`** → **`npm run pushitup -- public/media`** → **`npm run dev:fresh`**. Aborts if **`payload.sqlite`** is missing locally (local DB is the source of truth). **Live (cPanel → Terminal):** **`cd /home/wjehbnzcoy/mystudiochannel.com`** (or your app root); **`sqlite3 ./payload.sqlite "UPDATE media SET url = '/media/' || filename;"`**; **`pkill -u $(whoami) node`**. **Live (cPanel UI):** **Node.js Selector → Restart** `mystudiochannel.com`. **Verification:** **`/`** and **`/admin`** in Incognito; **Media** should match **`public/media`** on disk. Same intent as **item 3** above.

39. **`Push server config`**  
   - **Tier 3 — Hosting / Node runtime contract.** **Local (Cursor / repo root):** runs **`npm run pushitup:server-config`** — FTPS **`server.js`**, **`package.json`**, **`package-lock.json`**, and **`.env.example`**. Use when dependencies, engine constraints, or startup wiring changed; then **Live (cPanel → Terminal)** — `source` nodevenv, **`cd`** app root, **`npm install --legacy-peer-deps`**, then **Restart** the Node app (see **Go-Live-Checklist.md** §5). Do **not** run **`pushitup`** on the host.

40. **`Fix Local`**  
   - **Intent:** Deep recovery of the **Local (Cursor / repo root)** environment when **`/`** or **`/admin`** show white screen, **500**, missing **vendor-chunks**, or **404** on **`/_next/static/...`**.  
   - **Execution:** From repo root, run one of the following (all are a **clean dev compile**, not `npm run build`):  
     - **`npm run dev:recover`** — `scripts/restart-dev.ps1`: stops anything on port **3000**, then **`npm run dev`** (**`kill-dev-port`** → **`clean:next`** → **`next dev -p 3000`**).  
     - **`node scripts/kill-dev-port.mjs && rimraf .next node_modules/.cache .turbo && npm run dev`** — same intent with an explicit wipe of **`.next`**, **`node_modules/.cache`**, and **`.turbo`** before dev. If **`rimraf`** is not on your PATH, use **`npx rimraf`** in place of **`rimraf`**.  
     Wait until the terminal shows **Ready** (e.g. **Ready in …ms**).  
   - **Self-verification (required):** After **Ready**, the agent must probe **`http://localhost:3000/`** and **`http://localhost:3000/admin`** (e.g. **`Invoke-WebRequest`** / **`curl`** / fetch) and record **HTTP status codes**. If localhost fails, prioritize probing **`http://127.0.0.1:3000`** (and **`/admin`**) to bypass Windows **`localhost`** / DNS resolution issues.  
   - **Reporting:** Report both status codes. If **both are 200**, tell **Jon** to **hard-refresh** the browser or use an **Incognito** tab (old chunk URLs can cache).  
   - **Safety:** If **`npm run dev:recover`** or compile fails with a **build/TypeScript error**, read the log, **fix the code once**, and **retry the same recovery sequence exactly once**. If it still fails, stop and ask Jon for help (do not loop blindly).  
   - **Related:** **Item 36** (lighter explanation of stale **`.next`**); **`Jedi-List.md`** → when **`/`** or **`/admin`** breaks first.
