# Spaceship Hosting Playbook (MSC)

Single-source reference for connecting, deploying, and troubleshooting this app on Spaceship shared hosting.

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
- Username: `jonbeatz@mystudiochannel.com`
- Remote base used by script: `/` (auto-fallback if configured path is invalid)

### Credential handling

- Credentials live in local `.vscode/sftp.json` (git-ignored).
- Do **not** commit live credentials.
- If credential rotation happens, update `.vscode/sftp.json` locally.

---

## cPanel quick links (session-scoped)

These URLs include `cpsess...` and expire after logout/session timeout.

- **Terminal** (label: `Terminal`)
  - `https://server9.shared.spaceship.host:2083/.../terminal/index.html`
- **Node app controls** (label: `ReStartIt`)
  - `https://server9.shared.spaceship.host:2083/.../nodejs-selector.html.tt#/applications/mystudiochannel.com`

If expired: open cPanel manually and navigate to Terminal / Node.js Selector.

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
- `npm run pushitup -- public/images/about-studio.jpg`

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
   - create/upload `.next-deploy.zip` (or `pushitupzip -- .next`)
2. Host terminal:
   - `rm -rf .next`
   - `mkdir -p .next`
   - `unzip -o .next-deploy.zip -d .next`
3. Restart app.

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

Replace `.next` from uploaded zip:

```bash
rm -rf .next
mkdir -p .next
unzip -o .next-deploy.zip -d .next
```

If `unzip` unavailable:

```bash
python -m zipfile -e .next-deploy.zip .next
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
- `NEXT_PUBLIC_SERVER_URL=https://mystudiochannel.com`

Optional:

- `RESEND_API_KEY=...`

---

## Verification email behavior notes

- Email verify links use public origin based on `NEXT_PUBLIC_SERVER_URL`.
- Verify endpoint lives at:
  - `/api/leads/verify/:token`
- Redirect target after verification:
  - `/?verified=success` or `/?verified=error`
- If old emails still show old behavior, generate a **new** signup email after deploy.

---

## Troubleshooting quick map

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

