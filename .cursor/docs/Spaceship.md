# Spaceship Hosting Playbook (MSC)

Single-source reference for connecting, deploying, and troubleshooting this app on Spaceship shared hosting.

---

## Successful live update protocol (use every deploy)

Follow **in order**. Repo root on your PC is the folder that contains **`package.json`** (e.g. `D:\Cursor_Projectz\MSC_Clean_v2\msc-new`).

### The rule: `pushitup` = PC only

**`npm run pushitup`** uses **PowerShell** and **FTPS** from **this repo on your Windows machine**. It does **not** run on cPanel’s Linux terminal. There you will see **`npm: command not found`** (until you activate the Node venv) and **`pushitup` is not a server command**. Uploads always happen **from Cursor’s terminal on your PC**.

### Standard update (most times)

| # | Where | What |
|---|--------|------|
| 1 | **PC — Cursor terminal** | `npm run build` — wait until the build finishes. |
| 2 | **PC** | **MSC PRO ENGINE / Payload admin:** If you changed **admin UI, version label, branding, or Payload config/SCSS**, run **`npm run pushitup:admin-ui`**. This is the **primary** FTPS command for shipping the **MSC PRO ENGINE** look and feel (gold sidebar, dashboard/logout nav, login + sidebar graphics, password-field enhancement, `Users` collection notes, and Payload config). It uploads: **`middleware.ts`**, **`lib/msc-admin-version.ts`**, **`components/msc-payload-nav-dashboard.tsx`**, **`components/msc-payload-graphics.tsx`**, **`components/msc-payload-admin-enhancements.tsx`**, **`collections/Users.ts`**, **`payload.config.ts`**, **`app/(payload)/custom.scss`**. For a **smaller** upload when only the branding subset changed, use **`npm run pushitup:admin-branding`** (same list minus middleware, version file, and nav dashboard — see **`package.json`**). |
| 3 | **PC** | **Tier 3 — hosting / package:** If **`package.json`**, lockfile, **`server.js`**, or **`.env.example`** changed, run **`npm run pushitup:server-config`** (matches **`package.json`** script). For **`patches/`** or **`middleware.ts`**, add **`npm run pushitup -- patches`** / **`middleware.ts`** (or a single combined **`pushitup -- …`** line) as needed. |
| 4 | **PC** | `npm run pushitup -- .next` — wait for **“PushItUP complete”** and the file count. |
| 5 | **cPanel → Setup Node.js App** | **Restart** the app (or **Stop** → wait a few seconds → **Start**). |
| 6 | **Browser** | Open **`https://mystudiochannel.com`** in **Incognito** (or hard refresh) so you are not seeing an old cached page. |

Skip step 2 or 3 when nothing in those areas changed.

### cPanel Terminal — when to use it

- **`npm install --legacy-peer-deps`** — only after you uploaded **`package.json`**, **`package-lock.json`**, or **`patches/`**. First activate the app’s Node environment, then `cd` to the app folder (see **Terminal after upload** below).
- **`rm -rf .next`** — only when fixing a **broken or mixed** production build (500s, missing `vendor-chunks`). **Right after**, you **must** run **`npm run pushitup -- .next`** again **from your PC**; otherwise the site has no build folder.

**Never** run **`npm run pushitup`** in cPanel Terminal.

If cPanel says `npm: command not found`, activate the app environment first:

```bash
source ~/nodevenv/mystudiochannel.com/*/bin/activate
```

### Small mistakes to avoid

- **Wrong `cd` in cPanel Terminal (`No such file or directory`)** — paths that start with **`/`** are from the **server root**, not your account. Your app lives under **`/home/<username>/`**, not **`/<username>/`**. **Wrong:** `cd /wjehbnzcoy/mystudiochannel.com`. **Right:** `cd /home/wjehbnzcoy/mystudiochannel.com` or `cd ~/mystudiochannel.com`. Confirm the segment with **`whoami`** and **`echo ~`** (this host: user **`wjehbnzcoy`**, home **`/home/wjehbnzcoy`**).
- **Two commands on one line** — e.g. `.nextnpm run ...` breaks; run **one** command, press **Enter**, then the next.
- **`rm -rf .next` on the server without re-uploading** — the live site will break until you **`pushitup -- .next`** from the PC again.

### Reference: step-by-step “get this live” (copy for your notes)

1. **PC — repo root** in Cursor terminal: `npm run build` (wait until it finishes).
2. **PC — optional:** **`npm run pushitup:admin-ui`** if you touched **MSC PRO ENGINE** admin UI — nav, version, branding components, **`Users`**, **`payload.config.ts`**, or **`app/(payload)/custom.scss`** (full list in step 2 of the table above). Use **`npm run pushitup:admin-branding`** for the smaller branding-only path when appropriate.
3. **PC — optional:** `npm run pushitup -- …` for other changed **source** files (e.g. `collections/Foo.ts`, `lib/bar.ts`) *only if* those paths changed and you want the server disk copy to match — **the browser still uses the compiled output in `.next`**, so for UI/routes you must still do steps 1 + 4.
4. **PC:** `npm run pushitup -- .next` — wait for **PushItUP complete** (file count varies by build; that is normal).
5. **cPanel — optional:** if **`package.json`**, **`package-lock.json`**, or **`patches/`** changed: Terminal → `cd` app + `source` nodevenv → `npm install --legacy-peer-deps`.
6. **cPanel → Setup Node.js App:** **Restart** the app.
7. **Browser:** open **`https://mystudiochannel.com`** in **Incognito**.

### Build + `.next`: full upload every time? Or only “pieces”?

- **`npm run build`** regenerates the **`.next`** output on your PC. The number of files uploaded (e.g. 300 vs 380) **is not fixed**; it changes with the project and the build.
- For **almost every change** to pages, admin, components, hooks, middleware, or Next config: run **`npm run build`**, then upload the **entire** **`.next`** folder with **`npm run pushitup -- .next`**. Do **not** try to upload only some files inside `.next`; manifests, **`BUILD_ID`**, and hashed chunks must stay in sync or you get **500s** and missing **`vendor-chunks`** errors.
- Uploading **“pieces”** of the **repo** (source) makes sense **together with** a fresh **`.next`** from a build that already includes those edits — or for **non-Next** artifacts only (e.g. static files under **`public/`**, restoring **`payload.sqlite`**, editing **`.env`** on the host).

**Rule of thumb:** changed **`.ts` / `.tsx`** that affect the site or admin → **full build + full `.next` upload**.

### Manual `.next` upload (FileZilla or any FTPS client)

You can upload the **entire** **`.next`** tree with **FileZilla** (or another client) instead of **`npm run pushitup -- .next`**, if you mirror the same rules as **PushItUP**:

- Output must come from a **successful `npm run build`** on your PC for this deploy.
- Upload **every** file under **`.next`** into the **same remote app root** as **`package.json`** / **`server.js`** (not a sibling or nested junk folder — same target **`verify:ftp-smoke`** expects).
- Do **not** cherry-pick paths inside **`.next`**; **`BUILD_ID`**, manifests, **`server/`**, and **`static/`** must stay in sync or the live app **500s**.
- Preserve **`@`** in names such as **`.next/server/vendor-chunks/@lexical.js`** — hosts that store **`%40lexical.js`** break Node resolution (see **§ Live 500** above).

**Tier 2** still ships **`pushitup:admin-ui`**, **`payload.sqlite`**, and **`public/media`** — upload those separately if you only manual-upload **`.next`**, or keep using **`npm run pushit:live`** for the full pipeline.

### Critical FileZilla path trap (causes nested `.next` and stale runtime)

If FileZilla is pointed at **local `.next`** while remote is also **`/.next`**, it can create a broken nested tree like:

- remote: `/.next/.next/...`
- plus source folders at the wrong level (`/.next/app`, `/.next/collections`, etc.)

That layout breaks runtime resolution and can produce **503** or admin route 404s after restart.

Correct pattern:

1. **Local pane** points to repo root (`.../msc-new`) when using `pushitup`, or to the `.next` folder only when manually uploading into **app root**.
2. **Remote app root** should contain exactly one `.next` directory next to `package.json` / `server.js`.
3. After upload, open remote `.next` and confirm expected production structure (`server/`, `static/`, `BUILD_ID`, manifests) with fresh timestamps.

If you ever see nested `.next`, stop app, `rm -rf .next`, then re-upload a fresh production `.next`.

### FTPS: occasional failed files during `.next` upload

Long **`pushitup -- .next`** sessions sometimes hit **one or two** transient errors (**“Unable to connect to the remote server”**, **`GetRequestStream`**, etc.) on **random** chunk files. **PushItUP** **retries failed uploads once**; if the run ends with **“Uploaded N files”** and **no remaining failures**, the deploy is healthy. If retries still fail or many files error, retry the upload, try a stabler network, or re-upload chunk folders as in **§ Live 500 with mixed/missing `.next` chunks**.

### ⚠️ REQUIRED pre-upload cleanup (run BEFORE `npm run pushit:live`)

These two terminal steps **must** run before every Tier 2 deploy or data/build problems will persist silently.

**Live (cPanel UI) → STOP APP first**, then in **Live (cPanel → Terminal)**:

```bash
cd /home/wjehbnzcoy/mystudiochannel.com
rm -rf .next                              # prevents stale webpack-runtime/vendor-chunks 500
rm -f payload.sqlite-wal payload.sqlite-shm  # prevents old WAL journal overwriting new DB data
```

Why each matters:

| Command | Why it's needed |
|---------|-----------------|
| `rm -rf .next` | FTP **merges** files — old chunks survive the upload. The old `webpack-runtime.js` references chunk paths from the previous build. New chunks land but the old runtime can't find them → **500 "Cannot find module './vendor-chunks/...'"** on every request. |
| `rm -f payload.sqlite-wal payload.sqlite-shm` | SQLite WAL journals are tied to the database that created them. If an old WAL exists when the app starts with a freshly-uploaded `payload.sqlite`, SQLite **replays the old WAL on top of the new file**, restoring stale data (old projects, old content). Deleting the WAL first lets the new DB start clean. |

After the cleanup, run `npm run pushit:live` from your PC, then complete the post-upload terminal steps below.

---

### One command: `npm run pushit:live` (build + admin bundle + `.next` + DB + `public/media`)

From the **repo root** on your PC:

```bash
npm run pushit:live
```

This runs **`npm run build`** (with **`NEXT_PUBLIC_SERVER_URL`** temporarily set to the live origin so the production client bundle matches **`https://mystudiochannel.com`** while **`.env.local`** can stay on **`http://localhost:3000`**), then **`npm run pushitup:admin-ui`**, **`npm run pushitup -- .next`**, **`npm run pushitup -- payload.sqlite`**, **`npm run pushitup -- public/media`**. By default it **does not** start local **`next dev`** (step **6/6** skipped) so Tier 2 does not kill your editor workflow or auto-wipe **`.next`** for dev — run **`npm run dev`** or **`npm run dev:fresh`** when you want **localhost:3000** again. After step **1/6**, your PC’s **`.next`** is a **production** build until **`dev:fresh`** (or **`clean:next`** + **`dev`**) runs.

The script **always** prints **cPanel** reminders (**`cd /home/wjehbnzcoy/mystudiochannel.com`**, sqlite media URL line, **`pkill`**). It does **not** run **`npm install`** on the server or upload **`package.json`** unless you changed deps — add those steps manually when needed.

**Opt in to auto-start dev after Tier 2** (PowerShell at repo root — also runs **`npm run dev:fresh`** as step **6/6**):

```powershell
$env:PUSHIT_LIVE_RUN_DEV_FRESH = "1"
npm run pushit:live
```

---

## Same-day deploy cheat sheet (typical “agent builds → you restart” flow)

Use this when **Cursor fixed something locally** and you want it on **mystudiochannel.com**.

| Step | Where | What |
|------|--------|------|
| 1 | **Your PC** (repo root) | `npm run build` — produces a fresh **`.next`** (host often **cannot** build: Wasm OOM). |
| 2 | **Your PC** | **`npm run pushitup:server-config`** for core hosting files, **or** `npm run pushitup -- package.json package-lock.json server.js patches middleware.ts` when you need a wider list **+** `npm run pushitup -- .next` (**whole folder — no zip, no unzip in cPanel**). |
| 3 | **cPanel → Terminal** | Paste the block under **“Terminal after upload”** below (activates Node venv, `cd` to app, `npm install` if deps changed). |
| 4 | **cPanel → Node.js Selector** (`ReStartIt`) | **RESTART** — or **STOP** → wait 2–3s → **START**. Do this **after** uploads (and Terminal step if you ran it). |

### Terminal after upload (Spaceship / mystudiochannel.com)

Run in **cPanel → Terminal** whenever **`package.json` / `package-lock.json` / `patches`** were uploaded, or after a big `.next` refresh:

```bash
source /home/wjehbnzcoy/nodevenv/mystudiochannel.com/20/bin/activate
cd /home/wjehbnzcoy/mystudiochannel.com
npm install --legacy-peer-deps
```

If the live site ever looks like it’s mixing **old and new** Next chunks, run **`rm -rf .next`** once in that same directory, then **re-run** `npm run pushitup -- .next` from your PC and **Restart** Node again.

### File Manager: why `.next` “folder” time looks old

cPanel often shows the **directory’s** “Last modified” only when something changes **immediately inside that folder** (new top-level file, etc.). Uploading mostly updates **nested** paths (` .next/server/...`, `.next/static/...`), so the **parent** `.next` row can stay an old time while **`BUILD_ID`**, **`server/`**, **`static/`**, and the JSON manifests show **today’s** time. Open **`.next`** and check those — that is the real proof the build landed.

### Live **500** / `Cannot find module './vendor-chunks/date-fns.js'` or `@lexical.js`

Next puts some dependencies in **`.next/server/vendor-chunks/`** with names like **`@lexical.js`**. Older **PushItUP** builds URL-encoded **`@`** as **`%40`**, and a few hosts saved the remote file as **`%40lexical.js`**, so Node could not resolve **`@lexical.js`**. **PushItUP** now keeps a leading **`@`** in each path segment. After updating the script, run **`npm run build`**, **`rm -rf .next`** on the host (Terminal), **`npm run pushitup -- .next`**, then **Restart** Node. In **File Manager**, **`vendor-chunks`** should list **`@lexical.js`**, not **`%40lexical.js`**.

The browser may also request **`/_next/static/development/...`** while the tab still has an old dev session cached — use a **hard refresh** or **Incognito** after the server is healthy.

### Live 500 with mixed/missing `.next` chunks (current known recovery)

If `.stderr.log` shows repeated `Cannot find module './vendor-chunks/...js'` for files like `@payloadcms.js`, `date-fns.js`, or `next.js`:

1. In cPanel Node.js Selector: **Stop** app.
2. In cPanel Terminal (app directory): `rm -rf .next`
3. On PC: `npm run build`
4. On PC: `npm run pushitup -- .next`
5. If upload ends with failures, re-upload failed chunk areas:
   - `npm run pushitup -- .next/static/chunks .next/server/chunks .next/server/webpack-runtime.js`
6. In cPanel Node.js Selector: **Start** app.
7. Validate in Incognito: `/` and `/admin`.

This fixes artifact mismatch where server `.next` is partially old + partially new.

### cPanel log filenames (easy typo trap)

Use these exact files in app root:

- `.stderr.log`
- `.stdout.log`

Commands:

```bash
cd ~/mystudiochannel.com
tail -n 120 .stderr.log
tail -n 120 .stdout.log
```

### `patch-package` says “No patch files found” in Terminal

`postinstall` runs **`patch-package`**, which looks for a **`patches/`** folder **next to `package.json`** containing **`*.patch`** files. If that folder is missing, empty, or not uploaded, you see **No patch files found** — **`npm install` still succeeded**; patches just were not applied until **`patches/`** is on the server. Fix: `npm run pushitup -- patches` from your PC, then on the host run **`npm install --legacy-peer-deps`** again (or delete `node_modules` and reinstall if you need a clean apply).

### Optional: zip upload (faster line speed, one file)

| Method | Command (local) | On the server |
|--------|------------------|---------------|
| **Zip** | `npm run pushitupzip -- .next` | `rm -rf .next && mkdir -p .next && unzip -o .pushitupzips/next-build.zip -d .next` |

Use zip only if you prefer one archive; **default workflow here is folder `pushitup -- .next`** (no unzip).

**Almost every deploy** should also upload anything that changed outside `.next`, e.g.:

`npm run pushitup -- package.json package-lock.json server.js patches middleware.ts …`

(Adjust the list to match what changed — **collections**, **globals**, **app/**, **lib/**, etc.)

**Primary references:** this file (full detail), **Run-Next-JS.md** → *Deploy (summary)*, **Development.md** → *Production on Spaceship*, **Jedi-List.md** → npm commands.

---

## What this is for

Use this doc when starting a new session or a new project and you need to:

- reconnect to Spaceship hosting
- deploy updates quickly
- remember the Node/cPanel constraints we discovered
- avoid repeating the same production issues

---

## Hosting target (current project)

- Provider: Spaceship (shared hosting + cPanel)
- App domain: `mystudiochannel.com`
- Node app path: `/home/wjehbnzcoy/mystudiochannel.com`
- Node selector runtime: Node 20
- App startup file: `server.js`

---

## FTP connection profile

Used by local deploy scripts (`PushItUP`, `PushItUPzip`):

- Server: `server9.shared.spaceship.host`
- Protocol: FTP with explicit FTPS
- Port: `21`
- Username: `jonbeatz@mystudiochannel.com` — use the **same** FTP account in FileZilla when checking paths; a different login can show a different tree.

### FTPS `remotePath` (`.vscode/sftp.json`) — **not** the same as cPanel **`cd`**

`PushItUP` **prepends** `remotePath` to every uploaded path. On Spaceship, the FTPS login is usually **already chrooted to the Node app directory** (FileZilla shows **`/`** or **`/mystudiochannel.com`** with **`package.json`**, **`server.js`**, and **`.next`** in that folder).

| Where you work | Path | Result |
|----------------|------|--------|
| **cPanel / SSH** | `cd /home/wjehbnzcoy/mystudiochannel.com` | Correct **shell** path for `sqlite3`, `pkill`, `npm install`. |
| **FTPS `remotePath` (this host)** | **`/`** | Uploads land **in the app root** next to `package.json`. |
| **Wrong `remotePath`** | `/home/wjehbnzcoy/mystudiochannel.com/` | Nested under FTP root → **`…/home/wjehbnzcoy/…`** — **not** where Node runs. |
| **Wrong `remotePath`** | `/mystudiochannel.com/` | Double folder → **`/mystudiochannel.com/mystudiochannel.com/…`**. |

**After any `remotePath` change:** run **`npm run pushitup:ftp-smoke`**, then in FileZilla confirm **`ftp-path-smoke-test.txt`** sits **next to `package.json`** (same folder as **`.next`**). Automated check: **`npm run verify:ftp-smoke`** (read-only `LIST` + marker file).

**FileZilla:** avoid **Synchronize / mirror** from a PC folder that **does not include `.next`** — the client can **delete** the server’s **`.next`** to “match” your laptop.

**LIST / 550:** `PushItUP` may still upload when `LIST` on `remotePath` fails; use the smoke commands above, not LIST alone, to confirm the target directory.

### Credential handling

- Credentials live in local `.vscode/sftp.json` (git-ignored).
- Do **not** commit live credentials.
- If credential rotation happens, update `.vscode/sftp.json` locally.

---

## cPanel: links you can use every day

**Important:** “Magic” cPanel URLs that contain **`cpsess...`** in the middle **stop working** after you log out or the session times out. This doc keeps links that **stay valid**; for one-click shortcuts, bookmark pages **while you are logged in** (browser bookmarks).

**Operator bookmarks (Jon):** session-scoped **Node.js** and **Terminal** click-through URLs live in **`.cursor/docs/START-HERE.md`** (*cPanel links*) and are mirrored for agents in **`.cursor/rules/jon-operator-cpanel.mdc`**. Refresh both when `cpsess` changes.

### Always works (log in first)

| What | Link or step |
|------|----------------|
| **cPanel login** | [https://server9.shared.spaceship.host:2083/](https://server9.shared.spaceship.host:2083/) — use your cPanel username/password (Spaceship may also route you here from the client area). |
| **Terminal** | After login: use the cPanel **search** (magnifying glass) → type **`Terminal`** → open **Terminal**. *(Path varies by theme; sometimes under **Advanced**.)* |
| **Node.js app — Start / Stop / Restart** | After login: search **`Node.js`** or **`Setup Node.js App`** → open it → find **`mystudiochannel.com`** → use **RESTART** or **STOP** / **START**. |

### Optional: your own bookmark file (local only)

If you want **true one-click** links with `cpsess...` in them:

1. Log into cPanel, open **Terminal** and **Node.js Selector** in tabs.
2. Copy each URL from the address bar.
3. Paste them into a file on your machine only, e.g. **`.vscode/cpanel-bookmarks.txt`** (add that filename to **`.gitignore`** if you store session URLs), or save as **browser bookmarks**.

Never commit session URLs to git.

### Legacy note (session URLs)

If you saved links like `.../terminal/index.html` or `.../nodejs-selector.html.tt#/applications/mystudiochannel.com` with a long `cpsess...` segment, treat them as **temporary**. When they 404 or bounce to login, use the table above instead.

---

## Custom deploy scripts in this repo

## `PushItUP` (direct path upload)

- Script: `scripts/PushItUP.ps1`
- npm aliases:
  - `npm run PushItUP -- <targets...>`
  - `npm run pushitup -- <targets...>`
- Uploads file(s)/folder(s) directly over FTPS.

### Examples

- `npm run pushitup -- collections/Leads.ts`
- `npm run pushitup -- package.json package-lock.json server.js`
- `npm run pushitup -- public/media/about-studio.jpg`

## `PushItUPzip` (zip-first upload)

- Script: `scripts/PushItUPzip.ps1`
- npm aliases:
  - `npm run PushItUPzip -- <targets...>`
  - `npm run pushitupzip -- <targets...>`
- Packs each target into `.pushitupzips/*.zip` first, then uploads via `PushItUP`.

### Examples

- `npm run pushitupzip -- .next`
- `npm run pushitupzip -- public`

---

## Shared-host constraints we discovered

## 1) Server-side build OOM

On this host, `npm run build` can fail with:

- `RangeError: WebAssembly.instantiate(): Out of memory`

So production deploy often must be:

1. Build locally (`npm run build`)
2. Upload prebuilt `.next` archive
3. Unzip on host
4. Restart app

## 2) Linux runtime compatibility

Originally, dependency resolution/runtime mismatches required:

- pinning `next` to `15.4.11`
- pinning Payload packages to `3.81.0`
- keeping `patch-package` available during production postinstall

Always keep `package.json` + `package-lock.json` in sync when changing these.

## 3) Proxy host leakage

cPanel reverse proxy can leak internal origin (`0.0.0.0`) unless redirect handling is careful.

- Verification redirects were fixed to use relative redirects in `collections/Leads.ts`.

## 4a) SQLite: media table out of sync after DB upload (content shows wrong/fallback data)

**Symptoms:** Site renders fallback demo data (e.g. "MSC Core Pro v1" instead of "Talk Show Land") even after uploading `payload.sqlite`. Admin `/admin` works but the homepage or demos section shows old or placeholder content.

**Cause:** When you push your local `payload.sqlite` to the server, the `media` table on the server may be **missing rows** for recently-uploaded images (IDs that were added locally but never existed on the server). Payload's `mapProjectItemsToDemos` (and similar hydration helpers) filter out any project item whose `image_id` foreign key resolves to a missing `media` row. No image → row silently dropped → all rows drop → fallback renders.

**Fix:**

1. Confirm the image *files* are on the server (`public/media/` in File Manager — they usually are if `pushit:live` ran).
2. Identify which `media` IDs are missing on the server:
   - **Local (Cursor):** `sqlite3 payload.sqlite "SELECT id, filename FROM media ORDER BY id DESC LIMIT 10;"`
   - **Live (cPanel → Terminal):** same query against `./payload.sqlite`
3. For each missing row, insert it **Live (cPanel → Terminal)**:
   ```sql
   sqlite3 ./payload.sqlite "INSERT OR IGNORE INTO media(id,alt,updated_at,created_at,url,thumbnail_u_r_l,filename,mime_type,filesize,width,height,focal_x,focal_y) VALUES(<id>,'<alt>','<ts>','<ts>','/media/<filename>',NULL,'<filename>','image/jpeg',<size>,<w>,<h>,50,50);"
   ```
4. Run the media URL fix: `sqlite3 ./payload.sqlite "UPDATE media SET url = '/media/' || filename;"`
5. **Restart** the Node.js app.

**Prevention:** The `rm -f payload.sqlite-wal payload.sqlite-shm` pre-upload step and uploading `payload.sqlite` + `public/media` together (as `npm run pushit:live` does) should keep DB and files in sync. If you ever manually add media locally after the last upload, run `npm run pushit:live` again to push the full DB + media folder, not just individual files.

---

## 4b) SQLite: `malformed database schema (bookings_…_idx) - no such table: main.bookings`

**Symptoms:** **`sqlite3`** fails on **`payload.sqlite`**; **`/admin`** shows a Next.js server exception; **`/`** may still render from cache or routes that avoid that table.

**Cause A — orphan indexes:** The **`bookings`** table is missing but indexes such as **`bookings_updated_at_idx`** still exist in **`sqlite_master`**.

**Cause B — WAL mismatch:** Replacing only **`payload.sqlite`** while leaving old **`payload.sqlite-wal`** / **`payload.sqlite-shm`** can confuse SQLite.

**Fix (preferred — clean WAL + fresh DB file):**

1. **Live (cPanel UI):** **Stop** the Node.js app for **`mystudiochannel.com`**.
2. **Live (cPanel → Terminal):** `cd` to your app root (e.g. **`cd /home/wjehbnzcoy/mystudiochannel.com`** — use **your** home user segment).
3. Remove WAL sidecars, then re-upload DB from PC:
   - `rm -f payload.sqlite-wal payload.sqlite-shm`
   - **Local (Cursor):** `npm run pushitup -- payload.sqlite`
4. **Start** the Node app again.
5. Then run the media URL update if you use it:  
   `sqlite3 ./payload.sqlite "UPDATE media SET url = '/media/' || filename;"`

**Fix (repair in place — if you cannot re-upload):** With Node **stopped**, from app root either:

- **Python:** `python3 scripts/fix-sqlite-bookings-table.py ./payload.sqlite` (copy the script to the server or paste from repo), **or**
- **sqlite3:** `sqlite3 ./payload.sqlite < scripts/fix-sqlite-bookings-table.sql` (same — path to the **`.sql`** file on the server).

**Local:** `npm run migrate:sqlite:fix-bookings-table` runs **`scripts/fix-sqlite-bookings-table.py`** on repo-root **`payload.sqlite`**.

---

## Standard deploy flows

## A) Small code change (no dependency change)

1. Upload changed file(s):
   - `npm run pushitup -- <changed files>`
2. Restart app in `ReStartIt` page.

## B) Dependency/runtime change

1. Upload:
   - `package.json`
   - `package-lock.json`
   - changed source files
2. On host terminal:
   - `npm install --legacy-peer-deps`
3. Restart app.

## C) Full production refresh for low-memory host

1. Local:
   - `npm run build`
   - `npm run pushitupzip -- .next` — produces **`.pushitupzips/next-build.zip`** locally and uploads it as **`.pushitupzips/next-build.zip`** on the server (visible name; old **`.next.zip`** was easy to miss in cPanel because names starting with **`.`** are often treated as hidden).
2. **Where is the zip on the server?** PushItUP uses your FTPS login root, then the path **relative to the repo** (e.g. `.pushitupzips/next-build.zip`). That may land under **`mystudiochannel.com/.pushitupzips/`** or one directory above, depending on how Spaceship maps FTP home — check **Settings → Show Hidden Files** in File Manager if you expect a dot-prefixed name from an older run.
3. Host terminal (app directory, e.g. `/home/.../mystudiochannel.com`):
   - `rm -rf .next`
   - `mkdir -p .next`
   - `unzip -o .pushitupzips/next-build.zip -d .next`  
     (or copy the zip into the app dir first if it uploaded elsewhere)
4. Restart app.

---

## Host terminal commands (known good)

```bash
source /home/wjehbnzcoy/nodevenv/mystudiochannel.com/20/bin/activate
cd /home/wjehbnzcoy/mystudiochannel.com
```

Install deps:

```bash
npm install --legacy-peer-deps
```

Replace `.next` from uploaded zip (prefer **`next-build.zip`** from `pushitupzip`):

```bash
rm -rf .next
mkdir -p .next
unzip -o .pushitupzips/next-build.zip -d .next
```

If `unzip` unavailable:

```bash
python -m zipfile -e .pushitupzips/next-build.zip .next
```

---

## Restart behavior

Use `ReStartIt` app page:

- normal: **RESTART**
- if stale/stuck: **STOP APP** -> wait 2-3s -> **START APP**

After nearly every code deploy, restart is recommended.

---

## Environment variables (production baseline)

At minimum in Node app settings:

- `NODE_ENV=production`
- `PAYLOAD_SECRET=<secret>`
- `DATABASE_URL=file:./payload.sqlite` (or production DB when migrated)
- **`NEXT_PUBLIC_SERVER_URL=https://mystudiochannel.com`** — should match the live marketing origin (baked into client bundles at **build** time on PC).
- **`PAYLOAD_PUBLIC_SERVER_URL=https://mystudiochannel.com`** (recommended on cPanel) — **runtime** server URL; **first** in **`getPublicOrigin()`** / **`payload.config.ts`** when set, so verification emails track the live host even if **`NEXT_PUBLIC_*`** was wrong at build.

Optional:

- `RESEND_API_KEY=...`
- **`PAYLOAD_DISABLE_SHARP=true`** — on hosts where native **sharp** / libvips fails to load, disable Payload’s sharp integration. In this repo **`payload.config.ts`** only loads the **sharp** module when this flag is **not** set, so the process can start without touching broken native binaries.
- **`MSC_CANONICAL_SITE_ORIGIN`** — override the code default fallback domain when both public URL env vars are unset (default **`https://mystudiochannel.com`**).
- **`PAYLOAD_CSRF_EXTRA_ORIGINS`** — comma-separated extra allowed origins for Payload cookie/CSRF checks (e.g. staging host).

**Local dev (PC):** **`NEXT_PUBLIC_SERVER_URL`** in **`.env.local`** must include the origin you use in the browser (so admin login CSRF matches). See **Jedi-List** → *Public site URL*.

---

## Verification email behavior notes

- Verify links use **`lib/public-origin.ts`** **`resolvePublicUrl()`** → **`PAYLOAD_PUBLIC_SERVER_URL`** first, then **`NEXT_PUBLIC_SERVER_URL`**, then canonical fallback (see **Jedi-List**).
- Verify endpoint lives at:
  - `/api/leads/verify/:token`
- Redirect target after verification:
  - `/?verified=success` or `/?verified=error`
- If old emails still show old behavior, generate a **new** signup email after deploy.

---

## Troubleshooting quick map

## Admin saves OK but homepage Demos / Projects look old

1. **Confirm the API sees the new data (bypasses HTML layout):** open (in a private window is fine):
   - `https://mystudiochannel.com/api/globals/projects-home?depth=1`
   - Check `projectItems[0].title` (etc.) matches what you saved in **Site → Projects**.
2. **If the JSON is correct but the homepage is wrong:** the **HTML for `/` is being cached** somewhere (LiteSpeed, cPanel “Cache Manager”, Cloudflare, etc.) while **`/api/*` is not** — so globals JSON shows `v111` but the document still shows old Demos. Fix: deploy the latest app (includes **root `middleware.ts`** that sets **`Cache-Control: no-store`** on document routes), **restart Node**, then **purge site cache** in cPanel/hosting panel if available; test in a **private window**.
3. **If the JSON is also old:** you are not looking at the same database the app uses (wrong `DATABASE_URL` / duplicate app directory), or the save did not persist—compare with a second browser or `/admin` reload.

## `npm install` fails with peer conflicts

- Use: `npm install --legacy-peer-deps`
- Confirm pinned versions in `package.json`/lockfile.

## `patch-package: command not found`

- Ensure `patch-package` is available during production install.

## Site/admin returns 503

- App likely not running or crashed.
- Restart app; if still down, run `node server.js` in terminal to see real runtime error.

## Verify email goes to localhost or `0.0.0.0`

- Check `NEXT_PUBLIC_SERVER_URL`
- Confirm latest `collections/Leads.ts` deployed
- If host can’t build, replace `.next` with fresh local build zip and restart

---

## When reusing this for a new project

Before first deploy, update:

- domain
- app path
- FTP username/server
- Node version
- env vars
- any project-specific postinstall/patch requirements

Keep this doc copied into new project docs and adjust the values above first.

