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
   4) .cursor/docs/Jedi-List.md — npm scripts (dev:fresh, dev:recover, verify:next:safe, build, lint, verify:local, verify:live, verify:next, media:sync, media:consolidate, pushit:live, test:spaceship-ftp).
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
   - Runs `npm run pushit:live`, streams progress, then gives cPanel links + exact restart step.

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
   - **Local (Cursor / repo root):** runs **`npm run pushitup:admin-branding`**, which FTPS only the Payload admin look-and-feel sources: **`components/msc-payload-graphics.tsx`**, **`components/msc-payload-admin-enhancements.tsx`**, **`collections/Users.ts`** (docs for login eyeball / virtual password), **`payload.config.ts`**, **`app/(payload)/custom.scss`**. Use when you changed admin branding, SCSS, or graphics hooks and want a **small targeted upload** instead of listing paths by hand. **Important:** React/admin UI changes still need a **production build** and **`.next`** on the host to match — run **`npm run build`** then **`npm run pushitup -- .next`**, or use **`npm run pushit:live`** (which runs **`pushitup:admin-ui`**, now including these same branding files, plus full **`.next`**). After any upload, **Live (cPanel)** — Restart the Node.js app for `mystudiochannel.com`.
