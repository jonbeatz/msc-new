# Agent Runbook (Copy/Paste Prompts)

Use these exact prompts in Cursor chat to keep workflow consistent and low-friction.

Project root: `D:\Cursor_Projectz\MSC_Clean_v2\msc-new`

---

## Operator handshake (required)

Operator name: **Jon**

When starting/resuming from docs, begin with a short handshake line using the operator name:

- Startup: **"Ok Jon - docs loaded, ready."**
- Continue: **"Ok Jon - context restored from docs."**
- Finish: **"Great work Jon - all saved, see you later."**

This is the confirmation that docs/context were read correctly.

Trigger rule (for custom prompt flows):

- For any recognized trigger prompt (e.g. `Lets Start`, `Lets Continue`, `Lets Push It Live`, `Run verify:local and show pass/fail only`), the first response must start with:
  - `Ok Jon - <recognized command>. <one-line action plan>.`
- Use this once at flow start (not on every follow-up message) to avoid noise.

---

## 1) Lets Start

Use this first thing in the morning.

```text
Lets Start.

Project root is D:\Cursor_Projectz\MSC_Clean_v2\msc-new.
Start with handshake line: "Ok Jon - docs loaded, ready."
Please run startup for this repo and confirm each step:

1) Verify git branch/status and show me current branch.
2) Start local dev safely on http://localhost:3000 using our stable flow (dev:fresh if needed).
3) Confirm localhost / and /admin are healthy.
4) Confirm FTP deploy tooling is ready (pushitup scripts available).
5) Remind me of the current live deploy command and cPanel restart step.
6) Briefly summarize known recurring issues and prevention (stale .next, partial uploads, cPanel command confusion).

Do not deploy anything yet.
```

---

## 2) Lets Continue

Use this when opening a new Agent/chat and you want fast context restore.

```text
Lets Continue.

Use this project’s docs as source of truth and rehydrate context:
- .cursor/docs/Spaceship.md
- .cursor/docs/Jedi-List.md
- .cursor/docs/ReCall.md
- package.json scripts

Then tell me in 5 bullets:
1) Current branch and git status
2) What workflow commands we use (especially pushit:live / pushitup / dev:fresh)
3) Current deployment protocol (PC vs cPanel responsibilities)
4) Any active local service/process state that matters
5) Next recommended action based on current repo changes

Do not assume old chat memory; infer from files + git state.
Start with handshake line: "Ok Jon - context restored from docs."
```

---

## 3) Lets Finish

Use this when done for day, without forcing a production deploy.

```text
Lets Finish.

Please do end-of-day safe closeout:
1) Run git status and summarize changed files by type.
2) Update session docs/checkpoints with what was completed and known next steps.
3) Draft a clean commit message (why-focused), then ask me to confirm commit.
4) After confirmation, commit tracked work and push to current branch.
5) Stop local dev services/processes cleanly.
6) Give me a short "tomorrow startup checklist".

IMPORTANT:
- Do NOT deploy to live unless I explicitly say: "Lets Finish + Deploy".
- Ask me to confirm before final commit and push.
End with handshake closeout line: "Great work Jon - all saved, see you later."
```

---

## 4) Lets Finish + Deploy

Use this when you want to close out and deploy in the same flow.

```text
Lets Finish + Deploy.

Do normal Lets Finish steps, then:
1) Run pushit:live from repo root.
2) Show upload progress and report completion.
3) Give clickable cPanel links for:
   - Node Start/Stop page
   - cPanel Terminal page
4) Tell me to restart app and validate live in incognito.

Ask me to confirm before running the deploy step.
```

---

## 5) Lets Push It Live

Use this as the dedicated deploy command during active work.

```text
Lets Push It Live.

From repo root D:\Cursor_Projectz\MSC_Clean_v2\msc-new:
1) Run npm run pushit:live
2) Stream upload/build progress until complete
3) When done, give me these clickable links:
   - Start/Stop (Node.js app):
     https://server9.shared.spaceship.host:2083/cpsess0284884427/frontend/jupiter/lveversion/nodejs-selector.html.tt#/applications/mystudiochannel.com
   - Terminal:
     https://server9.shared.spaceship.host:2083/cpsess0284884427/frontend/jupiter/terminal/index.html
4) Tell me the exact next action: restart app, then test live in incognito.

If pushit:live fails, stop and tell me the exact failing step + shortest recovery command.
```

---

## 6) Lets Checkpoint Docs + Commit

Use this to sync docs and save a safe checkpoint (no production deploy).

```text
Lets Checkpoint Docs + Commit.

Please do this in order:
1) Review and update only necessary docs for today's changes:
   - .cursor/docs/START-HERE.md
   - .cursor/docs/Agent-Runbook.md
   - .cursor/docs/Spaceship.md
   - .cursor/docs/Jedi-List.md
   - .cursor/docs/ReCall.md
   - .cursor/docs/Restore-Points.md (only if this is a meaningful milestone)
2) Show me a brief "docs changed" summary.
3) Run git status + diff summary.
4) Draft a commit message (why-focused).
5) Ask me to confirm commit.
6) After confirmation: commit and push to current branch.

Do not deploy to live in this flow.
```

---

## 7) Lets Checkpoint + Deploy

Use this for a full checkpoint and production update, with optional new branch cut.

```text
Lets Checkpoint + Deploy.

Please do this in order:
1) Do the docs-check steps from "Lets Checkpoint Docs + Commit".
2) Ask me to confirm commit.
3) Commit + push current branch.
4) Ask me to confirm deploy.
5) Run npm run pushit:live.
6) Show progress and completion.
7) Give clickable cPanel links for:
   - Node Start/Stop page
   - Terminal page
8) Tell me exact next step: restart app, then verify live in incognito.
9) Ask if I want a new branch cut now.
10) If yes: ask for branch name, create it from current HEAD, push -u, confirm active branch.
```

---

## 8) Lets Cut New Branch

Use this to create a clean starting point quickly.

```text
Lets Cut New Branch.

1) Ask me for the new branch name (or propose one from current context).
2) Create branch from current HEAD.
3) Push with upstream tracking.
4) Confirm I am now on that branch.
5) Show quick git status.

Do not deploy in this flow.
```

---

## 9) Lets Verify Live

Use this after deploy to run a fast confidence check.

```text
Lets Verify Live.

Please do this:
1) Run local preflight first: npm run verify:local
2) Give me quick pass/fail for:
   - / (home)
   - /admin
   - /api/globals/projects-home?depth=1
3) Then give me post-deploy live checklist:
   - open live in Incognito
   - confirm admin version is visible
   - save one small admin change and verify it appears live
4) If any check fails, give shortest recovery commands only.
```

---

## 10) Lets Push It Live (Safe)

Use this when you want guardrails before deploy.

```text
Lets Push It Live (Safe).

From repo root D:\Cursor_Projectz\MSC_Clean_v2\msc-new:
1) Run npm run pushit:live:safe
2) Show preflight results from verify:local
3) If preflight passes, continue deploy and stream progress
4) When done, give clickable cPanel links and tell me to restart app
5) If preflight fails, stop and give shortest recovery command only
```

---

## 11) Look at Source of Truth and confirm working mode

Use this when you want the agent to align first and avoid doc drift.

```text
Look at Source of Truth and confirm working mode.

Start with handshake line: "Ok Jon - source-of-truth check started."

Please do this in order:
1) Read `.cursor/docs/START-HERE.md` first.
2) Confirm source-of-truth order you will follow for this session.
3) List only the core docs you will actively use unless asked otherwise.
4) Tell me the current working mode in one line (implementing vs planning vs review).
5) Give me the safest exact next action for my current goal.

Keep it concise and do not run deploy commands in this flow.
```

---

## 12) Audit my skills, rules, and runbook for drift

Use this when behavior feels inconsistent between sessions.

```text
Audit my skills, rules, and runbook for drift.

Start with handshake line: "Ok Jon - drift audit started."

Please review:
- `.cursorrules`
- local project skills under `.cursor/skills/`
- `.cursor/docs/Agent-Runbook.md`
- `.cursor/docs/START-HERE.md`
- `.cursor/docs/Jedi-List.md`

Then return:
1) Top contradictions (if any)
2) Outdated guidance (if any)
3) Missing guardrails worth adding
4) Minimal patch plan (smallest useful edits)

Do not edit yet. Ask me to approve changes first.
```

---

## 13) Sync docs to scripts (no guessing)

Use this after script changes or workflow refactors.

```text
Sync docs to scripts (no guessing).

Start with handshake line: "Ok Jon - docs-to-scripts sync started."

Please do this:
1) Read `package.json` scripts.
2) Compare script names/behavior to:
   - `.cursor/docs/Jedi-List.md`
   - `.cursor/docs/Spaceship.md`
   - `.cursor/docs/Agent-Runbook.md`
3) List mismatches in command names or step order.
4) Apply minimal doc edits so docs match real scripts exactly.
5) Summarize what changed.

Do not invent new commands in docs.
```

---

## 14) Show me only the exact next step

Use this when you want no-noise guidance.

```text
Show me only the exact next step.

Start with handshake line: "Ok Jon - I will give one exact next action only."

Rules:
- Output one step only.
- Include the exact command (if any) and where to run it.
- No alternatives unless I ask.
- No extra explanation unless safety-critical.
```

---

## 15) Pre-deploy risk check for current changes

Use this right before a production deploy.

```text
Pre-deploy risk check for current changes.

Start with handshake line: "Ok Jon - pre-deploy risk check started."

Please do this:
1) Review git status and diff for files that affect runtime/deploy.
2) List top 3-5 deployment risks for this exact change set.
3) For each risk, give shortest prevention step.
4) Tell me GO / NO-GO with one-line reason.
5) If GO, give the exact next deploy command only.

Keep output concise and actionable.
```

---

## Notes

- If the agent is unsure what to trust, tell it: **"Use Agent-Runbook.md then Spaceship.md as source of truth."**
- `pushitup` commands run on your PC (Cursor terminal), not cPanel Terminal.
- cPanel links with `cpsess...` can expire after logout/session timeout.
- For app/admin code changes, use full build + full `.next` upload (via `npm run pushit:live`).

---

## Top Custom useful prompts (cheat sheet)

Use these as quick "commands in plain English" for the agent.

1. **`Lets Start`**  
   - Morning bootstrap: checks git, starts local safely, verifies `/` + `/admin`, confirms deploy tooling.

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
