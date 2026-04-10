# Custom Prompts (Cheat Sheet)

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
