# Restore points — MSC Next (`msc-new`)

Human-named checkpoints so you can roll back mentally or on disk if a change goes wrong.

## How to restore

1. **Git (recommended)**  
   If the repo is under version control: tag after each checkpoint, e.g. `git tag restore-2026-04-08-cms-globals`.

2. **No git**  
   Copy the whole **`msc-new`** folder, or at minimum:
   - `payload.sqlite` (all CMS data: users, media, bookings, globals, leads)
   - `patch/` + `package-lock.json` if you rely on patched deps

3. **Database only**  
   Stop the dev server, copy `payload.sqlite` to a dated backup (e.g. `payload.2026-04-08.bak.sqlite`), restore by swapping the file back.

---

## Checkpoints

| ID | Date | Summary |
|----|------|---------|
| **RP-2026-04-08-cms-globals** | 2026-04-08 | **Payload “Site” content model:** `globals/Homepage.ts` (hero slides + stats from **Media**), `globals/SiteSettings.ts` (SEO title/tagline → `generateMetadata`). Collections: **Leads** (`collections/Leads.ts`, Marketing group, public `create` for future forms). Marketing **Hero** reads CMS when slides exist; else built-in defaults. Lib: `lib/cms/homepage.ts`, `site-settings.ts`, `content-types.ts`. **Docs** updated: Development, ReCall, Site-Plans. |
| **RP-2026-04-08-hero-media-relinked** | 2026-04-08 | **Hero migration finalized:** Homepage global now contains **5 slides** (the original 4 defaults + current custom slide). The 4 original slides were mapped to real `Media` entries sourced from on-disk assets (then under `public/images`, now consolidated to **`public/media`**) (`tv-wall.jpg`, `show-cards.jpg`, `on-air.jpg`, `creator-solo.jpg`) via a one-time local migration script, then script removed. |
| **RP-2026-04-08-working-resend-email** | 2026-04-08 | **Resend verification flow fully working:** Added browser-safe verify endpoint in `collections/Leads.ts` (`/api/leads/verify/:token`, with `?token=` fallback), confirmation redirect to `/?verified=success|error`, and homepage verification toast with NovaMira gold styling + mobile top-center placement in `components/contact-section.tsx`. Removed direct-booking helper text from contact card and centered newsletter success confirmation. Synced docs in Development + ReCall. |
| **RP-2026-04-08-seo-setup** | 2026-04-08 | **SEO setup completed:** official `@payloadcms/plugin-seo` installed/configured; SEO tab enabled for `pages` + `hero-slides`; `Homepage.heroSlides` rows now include inline `seo` group fields; homepage `generateMetadata` follows active slide SEO title/description/image with fallbacks to slide content and Site Settings; OG/Twitter metadata now mirrors active slide SEO. |
| **RP-2026-04-08-two-step-booking-engine** | 2026-04-08 | **Professional two-step booking flow live:** `bookings` schema updated to `name/email/phone/appointmentDate/message`; contact modal refactored to Step 1 (time select) then Step 2 (details), with Payload API save + gold success toast. `bookings` afterChange hook now sends branded confirmation email to user and admin alert via Resend on create. |
| **RP-2026-04-08-command-center-integration** | 2026-04-08 | **Centralized Command Center integrated:** Added `Site settings -> Notifications` tab (`enableAdminNotifications`, `notificationEmails`, `adminFallbackEmail`, `systemFromEmail`) and refactored `bookings` + `leads` notification hooks to read all recipients/toggles/from-address from global settings with resilient, isolated email send error handling. Booking/newsletter UI now uses unified gold tokens and confirms success toast only after complete booking submission. |
| **RP-2026-04-08-command-center-polish-and-email-branding** | 2026-04-08 | **Final polish + reliability pass:** fixed Site Settings admin 404 caused by local SQLite schema drift (`site_settings_notification_emails` table + Site Settings notification columns), added live “Effective Recipient List” admin preview + Sender Address labeling, grouped `bookings` and `leads` under Marketing, and updated Leads/Bookings email templates to enforce gold no-underline links while streamlining New Lead Alert to email-only content. |
| **RP-2026-04-08-admin-ux-navigation-consolidation** | 2026-04-08 | **Admin authoring UX standardized:** Projects moved to `projects-home` global with draggable row editing (Homepage-style), header submenus restored via nested `header.navItems.submenu`, demos rail interaction/scroll polish completed, and admin sidebar/account navigation refined (gold category labels, Dashboard link, account-context Log out behavior). |
| **RP-2026-04-08-dynamic-pages-sections-builder** | 2026-04-08 | **Dynamic pages elevated:** added `Site settings -> Branding` tab and frontend logo/metadata wiring, created dynamic slug engine (`app/(site)/[slug]/page.tsx`), upgraded `pages` with `featuredImage`, Lexical `content`, and `sections` blocks (rich text, feature grid, video player) with required anchor IDs, plus sticky in-page jump links (mobile chip scroller + active auto-centering). Includes local SQLite schema patching for `pages` columns and `pages_blocks_*` tables. |
| **RP-2026-04-08-pages-polish-and-demo-flow** | 2026-04-08 | **Dynamic pages final polish checkpoint:** made jump-link nav non-sticky by design, hid fallback content panel when sections are present, tightened section spacing, and seeded full `msc1` demo storyline for anchor-flow testing (`The Studio` → `Virtual Tour` → `Our Solutions` → `Case Study` → `Get Started`). |
| **RP-2026-04-09-spaceship-live-recovery** | 2026-04-09 | **Production recovery on Spaceship shared hosting:** pinned runtime compatibility (`next@15.4.11`, Payload 3.81 exact), moved `patch-package` into dependencies for production postinstall, updated `server.js` host binding to `0.0.0.0`, introduced deploy scripts `PushItUP` + `PushItUPzip`, documented low-memory host workflow (local build + upload prebuilt `.next` zip), uploaded `patches/` to restore Payload admin behavior, and confirmed public site + `/admin/login` live. |
| **RP-2026-04-09-email-verify-redirect-final** | 2026-04-09 | **Verification redirect finalized on live host:** `collections/Leads.ts` verify endpoint now uses relative redirect targets (`/?verified=success|error`) to avoid reverse-proxy/internal host leakage (`0.0.0.0:3000`). Email links use `NEXT_PUBLIC_SERVER_URL` for public origin. Confirmed live homepage toast appears after verification. |
| **RP-2026-04-10-live-vendor-chunks-recovery** | 2026-04-10 | **Live + local stability restored after chunk mismatch incident:** live `500` traced to mixed server `.next` artifacts (`Cannot find module './vendor-chunks/@payloadcms.js'`, `date-fns.js`, `next.js`). Recovery used nodevenv activation, server `.next` reset, local rebuild, full `.next` upload from PC, targeted chunk re-upload on FTPS failures, and Node app restart. Local port drift issue (3000 hijacked) resolved via stale process kill + `npm run dev:fresh`; `verify:local` returns all `200`. |
| **RP-2026-04-10-toolchain-docs-operator** | 2026-04-10 | **Demos section fixes + ESLint (`next lint`) + admin **v1.0.4** confirmed live.** Docs: `Jedi-List` lint row synced to `package.json`; `Spaceship` points to `START-HERE` / `jon-operator-cpanel` for Jon’s cPanel bookmarks; `ReCall` session log updated. **Restore:** commit on branch `mscNowLive-v3-RestorePoint`; local `npm install` if lockfile restored from earlier SHA. |
| **RP-2026-04-11-snapshot-next-payload-media** | 2026-04-11 | **Snapshot (`Take a snapshot`):** unified static assets under **`public/media`** with **`/media/...`** URLs; **`media:consolidate`** + **`media:sync`**; dev scripts **`clean:next`** before **`dev`**; Cursor **`stop`** hook **`verify-after-agent`**; **`verify:next`** green before commit. Docs SSoT updates (**Jedi-List**, **Go-Live-Checklist**, **Site-Plans**, **Headless-WP-Backend-Plan**, **ToDo**, **Custom-Prompts**). **Ongoing work:** branch **`mscNowLive-v4-RestorePoint`** (same commit as **`snapshot/2026-04-11-msc-next-payload-media`**). **Restore:** `git fetch origin && git checkout mscNowLive-v4-RestorePoint`. **Caveats:** back up **`payload.sqlite`** if you need matching CMS data; run **`npm install`** after checkout if lockfile differs. |
| **RP-2026-04-11-msc-pro-admin-branding** | 2026-04-11 | **Snapshot (`Take a snapshot`):** **MSC PRO ENGINE** Payload admin — custom **`graphics`** Logo/Icon (`/media/msc-icon.png`), login password toggle (**`msc-payload-admin-enhancements`**), **`payload.config.ts`** providers + graphics, **`collections/Users.ts`** notes, **`app/(payload)/custom.scss`**, **`MSC_ADMIN_VERSION` 1.0.5**, regenerated **`importMap.js`**. **`package.json`:** **`pushitup:admin-ui`** (full admin bundle) + **`pushitup:admin-branding`** (subset). Docs synced (**Jedi-List**, **Spaceship**, **Go-Live-Checklist**, **Custom-Prompts** §37, **ReCall** deploy-sync). **`verify-next-safe.ps1`**, Cursor hook **`guard-clean-while-dev`**. **`npm run build`** green before commit. **Tip:** `mscNowLive-v4-RestorePoint` @ **`6b84052`**. **Parity snapshot branch:** **`snapshot/2026-04-11-msc-pro-admin-branding`** (same commit). **Restore:** `git fetch origin && git checkout mscNowLive-v4-RestorePoint && git pull` (or `git checkout snapshot/2026-04-11-msc-pro-admin-branding && git pull`). **Caveats:** back up **`payload.sqlite`** if needed; **`npm install`** if lockfile differs. |
| **RP-2026-04-12-snapshot-ftps-parity** | 2026-04-12 | **Snapshot (`Take a snapshot`):** **Tier-2 deploy + parity tooling.** **`scripts/pushit-live.ps1`** — 6-step pipeline (build → admin-ui → `.next` → **`payload.sqlite`** → **`public/media`** → **`dev:fresh`**), fixed PowerShell quoting for sqlite reminder, **`cd /home/wjehbnzcoy/mystudiochannel.com`**. **`scripts/PushItUP.ps1`** — honor **`remotePath`** when FTPS LIST fails (chroot); **`FileShare.ReadWrite`** read for **`payload.sqlite`** upload while DB open; upload error logging. **`scripts/ftp-parity-check.ps1`** + **`parity-ftp-report.md`** — local vs live tree compare (last run: **`payload.sqlite`** 536576 bytes match; **`public/media`** 33 files both sides; **`.next`** differs when local is dev vs prod). **Branch/commit:** **`mscNowLive-v4-RestorePoint`** @ **`a8c72f9`**. **Restore (committed tree only):** `git fetch origin && git checkout mscNowLive-v4-RestorePoint && git reset --hard a8c72f9ee4d5793be3a66332d0c0d0520e52648e`. **Caveats:** working copy had **uncommitted + untracked** files at snapshot time — stash or commit WIP before `reset --hard`; back up **`payload.sqlite`**; optional tag: `git tag RP-2026-04-12-snapshot-ftps-parity a8c72f9ee4d5793be3a66332d0c0d0520e52648e`. |
| **RP-2026-04-12-docs-checkpoint** | 2026-04-12 | **Docs checkpoint (`Lets Checkpoint Docs`):** **`package.json`** **`parity:ftp`** alias; **Jedi-List**, **Custom-Prompts**, **Go-Live-Checklist**, **Spaceship**, **START-HERE**, **Agent-Runbook**, **ReCall** synced to **Tier 2** (`pushit:live` includes **`payload.sqlite`** + **`public/media`**; cPanel **`cd /home/wjehbnzcoy/mystudiochannel.com`**). **PushItUP** LIST/`remotePath` note in **Jedi-List**. No git step required for this checkpoint. |
| **RP-2026-04-12-branch-tip-ready-tomorrow** | 2026-04-12 | **Current known-good tip (use this to resume):** **`mscNowLive-v4-RestorePoint`** @ **`b92d1be`**. **Includes:** **`38dd8f8`** — homepage hero from **`globals/Homepage`** + **Media** ( **`collections/HeroSlides.ts` removed** ); shared email helpers **`lib/email-brand.ts`**, **`lib/email-templates.ts`**; **`payload-types.ts`** and section/CMS updates. **`fbb6afd`** — ReCall session closeout. **`b92d1be`** — **`parity-ftp-report.md`** in **`.gitignore`** (FTP checker still writes it locally; it is not tracked). **Live:** Tier 2 **`npm run pushit:live`** completed same session (admin-ui + `.next` + **`payload.sqlite`** + **`public/media`**). **Restore:** `git fetch origin && git checkout mscNowLive-v4-RestorePoint && git pull && git reset --hard b92d1be6d4b2c20540e7dd297cd7f28a28bd746c`. **Tomorrow:** paste **`Ready to begin`** from **Agent-Runbook §0** (or **Custom-Prompts** item **0**); then **`npm run dev:fresh`** from repo root if **`/`** or **`/admin`** are not healthy. |

## New restore-point template (copy/paste)

Use this template when adding a checkpoint:

```md
| **RP-YYYY-MM-DD-short-name** | YYYY-MM-DD | **What was working:** short summary. **Branch/commit:** `<branch> @ <sha>`. **Restore steps:** 1) checkout branch/sha 2) run exact startup/deploy commands 3) note any env/dependency caveats. |
```

Suggested naming:

- `RP-2026-04-10-admin-v103-sidebar-version`
- `RP-2026-04-10-deploy-pushit-live-stable`

### Files worth diffing from this checkpoint

- `payload.config.ts`
- `globals/Homepage.ts`, `globals/SiteSettings.ts`, `globals/Header.ts`
- `collections/Leads.ts`, `collections/Media.ts`, `collections/Pages.ts`, `collections/Bookings.ts`
- `components/contact-section.tsx`, `components/hero-section.tsx`
- `lib/cms/*`, `lib/booking.ts`, `lib/email-brand.ts`, `lib/email-templates.ts`
- `app/(site)/page.tsx`, `app/(site)/layout.tsx`
- `next.config.mjs` (image `remotePatterns` for localhost)

*(Older docs mentioned `collections/HeroSlides.ts` — that collection was removed; hero rows live on **`globals/Homepage`**, images on **Media**.)*

---

*Append a new row when you create the next restore point.*
