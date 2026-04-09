# ReCall — Working Memory

Quick-running memory for recent changes, current focus, and next ideas.
Use this when returning after a break.

---

## Session Resume Prompt (copy/paste)

Use this at the start of a new session:

```text
Continue from ReCall.

1) Read `.cursor/docs/ReCall.md` and `.cursor/docs/Development.md` first.
2) Give me a quick resume using this format:
   - Done
   - Next
   - Open Questions
3) Start local dev runtime:
   - run install only if needed (`npm install`)
   - run `npm run dev:payload` (or `npm run dev` — both use Webpack in `package.json`)
   - confirm Local URL at dev root (`http://localhost:3000/`) and `/admin` if testing Payload
4) Then start implementation for: <PASTE TODAY'S TASK HERE>
5) As you work, update ReCall with any major changes, bug fixes, or decisions.
6) When I say "I'm done for now" or "continue later", append a short closeout to ReCall and confirm it was saved.
7) On goodbye, stop local dev listeners (e.g. Node on ports 3000-3010) and confirm ports are clear.
```

Quick variants:

- **General resume:** `Do a ReCall on this project and propose the next 3 actions.`
- **Backend phase:** `Continue from ReCall and wire WordPress backend phase 1.`
- **UI polish phase:** `Continue from ReCall and finish UI polish pass for <section>.`

## Git Quick Reference (checkpoint + restore branch)

Use this mini-flow any time you want a safe checkpoint:

1. `git status -sb`
2. `git diff -- .`
3. `git add -A`
4. `git commit -m "clear outcome message"`
5. `git push`

Create a new restore branch from the current clean state:

1. `git checkout -b <branch-name>`
2. `git push -u origin <branch-name>`
3. `git status -sb` (confirm tracking branch)

---

## How to use this file

- Ask: **"Do a ReCall on this project"** to quickly summarize recent work.
- Keep updates short and practical (what changed, why, where).
- Add one entry per notable session.
- For production deploy/connectivity steps on Spaceship, see **`Spaceship.md`** in this same docs folder.

---

## Current focus

- **Payload CMS:** `Homepage` + `Site settings` globals drive hero + SEO; **Media** for images; **Leads** collection ready for a future form (`POST /api/leads`).
- **Booking:** Schedule modal captures **IANA time zone** (`Intl...timeZone`) and persists to Payload `bookings.timeZone`; admin alert email includes **Time zone** line.
- **Nav / hashes:** **`lib/hash-nav.ts`** + **`resolveNavHashHref`** in **`header`** / **`footer`**; **`HomeHashScroll`** on **`/`**; see **Development.md** → *Marketing header*.
- Next: wire more sections to Payload, or **headless WordPress Phase 1** (`msc-api` plugin — not in repo yet); production: Postgres + lock down public APIs.

---

## Recent changes (latest first)

### 2026-04-09 — Verify email redirect fix for cPanel proxy hosts

- **Issue:** verification links opened correctly on `mystudiochannel.com` but post-verify redirect could land on `https://0.0.0.0:3000/?verified=...` behind Spaceship/cPanel reverse proxy.
- **Fix:** `collections/Leads.ts` now returns a **relative redirect** (`Location: /?verified=success|error`) from `/api/leads/verify/:token`.
- **Result:** browser stays on public origin and homepage verify toast/badge appears as expected.
- **Deploy note:** because host cannot reliably run `next build` (Wasm OOM), rebuild locally and upload refreshed `.next-deploy.zip` before restart.

### 2026-04-09 — Spaceship production recovery + deploy scripts

- **Root causes fixed:** cPanel `npm install` dependency conflict (`next@16.2.0` vs Payload peer range), production postinstall missing `patch-package`, host-side `next build` OOM (`WebAssembly.instantiate`).
- **Runtime/deps:** pinned `next` to **15.4.11** and Payload packages to exact **3.81.0**; moved `patch-package` into `dependencies`; `server.js` binds to `0.0.0.0`.
- **Deploy tooling:** added **`scripts/PushItUP.ps1`** (path upload) and **`scripts/PushItUPzip.ps1`** (zip-first upload) with npm aliases `pushitup` / `pushitupzip`.
- **Shared-host workflow:** build locally, upload `.next` as zip + `patches` + runtime files, then host runs `npm install --legacy-peer-deps` and app restart (skip host build on low-memory plans).
- **Result:** `https://mystudiochannel.com/` and `/admin/login` load successfully.

### 2026-04-09 — Docs: hash navigation + pathname-aware header/footer

- **Docs:** **Development.md** (marketing header / default nav / **`lib/hash-nav.ts`** / **`HomeHashScroll`**), **ReCall** (current focus), **README** (pointer to hash helpers).
- **Context:** Section links in admin are **`#msc-*`**; runtime chooses **`#`** on `/` and **`/#`** off home; URL cleanup for stacked fragments remains in **`home-hash-scroll.tsx`**.

### 2026-04-08 — ReCall resume: booking time zone capture

- **Changed:** `BookingRequestPayload` + `submitBookingRequest` send optional `timeZone` to Payload; `contact-section` sets it from `Intl.DateTimeFormat().resolvedOptions().timeZone`.
- **Admin email:** New booking alert HTML includes **Time zone** (stored field was already on `Bookings`).
- **Verified:** `npm run build` green; `npm run dev:payload` shows **Next.js (webpack)** at `http://localhost:3000/`.

### 2026-04-08 — Session closeout (goodbye sequence)

- **Restore branch:** **`msc-new-payload-polished-v3`** on `origin` (checkpoint commit **`c751c92`**); includes marketing nav / Demos scroll / scroll-to-top / docs work (**`145f226`** in history).
- **Resume:** `git checkout msc-new-payload-polished-v3 && git pull` → **`npm run dev:payload`** → **`http://localhost:3000/`** and **`/admin`** as needed; read **ReCall** + **Development.md** first.
- **Dev listener:** Goodbye step stopped **`node.exe`** that was **LISTENING on port 3000** (PID 14268). Re-run **`netstat -ano | findstr ":3000"`** after other sessions if a port looks busy.

### 2026-04-08 — Marketing home: nav anchors, Demos scroll, scroll-to-top, docs

- **Header defaults (`globals/Header.ts`, `lib/cms/header.ts`):** Services submenu ends with **What We Do** → `#msc-creators`; order above it is Own Your Platform, Packages, Requirements. Resources: Testimonials → **Extras** → `#msc-addons`, then FAQ → `#msc-faq`.
- **Demos (`components/demos-section.tsx`):** `#msc-demos` on the inner `max-w-7xl` wrapper; **`scroll-mt-30`** when sticky header is on; section uses **`py-*` padding** (not margin-top) so **`bg-surface-2`** covers the top band (no dark “divider” from `main` background).
- **Scroll to top:** `components/scroll-to-top.tsx` mounted in `app/(site)/layout.tsx` (shows after ~half viewport scroll).
- **Payload:** Homepage hero secondary CTA columns → `npm run migrate:sqlite:homepage-hero-secondary-cta` if `/admin/globals/homepage` 404s on SQLite without push. Sticky header field admin copy is short (no long SQLite paragraph).
- **Docs refreshed:** `Development.md`, `README.md`, `.cursor/docs` + `public/` **CURSOR-SETUP-PROMPT.md**, **DIVI-CONVERSION-GUIDE.md** updated to match the above.

### 2026-04-08 — Final polish closeout: jump links + seeded demo page

- **Jump-link UX finalized:** Kept active-chip detection and auto-centering, but removed sticky behavior so in-page nav scrolls away naturally after passing it.
- **Page flow cleanup:** Dynamic slug pages now suppress the "Page Content Coming Soon" card when sections exist; spacing between sections tightened for smoother premium rhythm.
- **Demo validation content:** `msc1` now includes a full 5-block narrative flow (`The Studio`, `Virtual Tour`, `Our Solutions`, `Case Study`, `Get Started`) to test anchor progress and visual pacing.
- **Seed script:** Added `scripts/seed-demo-page.ts` and npm alias `seed:demo-page`; local execution via Payload CLI still has alias-resolution limitations in this environment, so equivalent demo content was seeded directly into SQLite for this session.
- **Build status:** `npm run build` passes after final polish.

### 2026-04-08 — Closeout checkpoint for tomorrow resume

- **Pinned restore branch:** `msc-new-payload-polished-v2`
- **App feature freeze (pages polish + demo):** `98c51c0` (`Finalize pages polish and demo flow closeout.`)
- **Branch tip:** `git pull` on `msc-new-payload-polished-v2` — may include doc-only commits after the freeze; same runtime as freeze unless `git log` shows newer code changes.
- **Resume sequence (low risk):**
  1. `git checkout msc-new-payload-polished-v2`
  2. `git pull`
  3. `npm run dev:payload`
  4. Verify `http://localhost:3000/msc1` and `/admin` load cleanly.
- **Known environment note:** `npm run seed:demo-page` is currently blocked by local Payload alias resolution in this machine runtime; `msc1` demo data is already seeded in local SQLite for this checkpoint.

### 2026-04-08 — Dynamic Pages + Sections Builder + jump links

- **Branding controls:** Added `Site settings -> Branding` tab (`siteLogo`, `favicon`, `ogImage`, `siteTitleSuffix`) and wired logo into Header/Footer plus metadata favicon/OG/title suffix defaults.
- **Dynamic route engine:** Added `app/(site)/[slug]/page.tsx` with slug-based `pages` lookup, SEO metadata generation, and dark/gold page presentation.
- **Pages content model:** Upgraded `pages` with `Content Builder` tab including `featuredImage`, Lexical `content`, and `sections` blocks (`richText`, `featureGrid`, `videoPlayer`) where every block requires `sectionId` (Anchor ID).
- **Block rendering:** Added `components/blocks/SectionsRenderer.tsx` to map each block type into frontend UI and wrap each block as `<section id={sectionId}>`.
- **Sticky in-page nav:** Added `components/blocks/PageJumpLinks.tsx` (gold-on-dark chip navigation) with active-section detection, smooth-scroll, and auto-centering active chip behavior on scroll.
- **SQLite drift fixes:** Patched local DB with new `pages` columns and block tables to resolve runtime 500/404 issues (`pages.content`, `pages.featured_image_id`, and `pages_blocks_*` tables).
- **Status:** Build green after each phase (`npm run build` passes).

### 2026-04-08 — Admin UX + navigation consolidation polish

- **Projects editor UX:** moved from collection-document editing to `projects-home` global array so projects are managed in one draggable/toggle list like Homepage hero rows.
- **Demos frontend stability:** right rail now keeps fixed card heights, uses conditional scrolling only when needed, supports click-to-preview in left feature area, and applies darker gold-accent scrollbar styling.
- **Visibility controls:** added `isVisible` project toggle and frontend filtering so hidden projects do not render publicly.
- **Header submenu restore:** Header global now has nested submenu rows (collapsed by default), with restored desktop dropdowns, mobile nested links, chevron rotation animation, and delayed-close hover behavior.
- **Admin sidebar/account polish:** nav group labels switched to gold, Dashboard quick link added near the top, and custom logout moved off sidebar into account-page context.
- **Preferences note:** Payload remembers row open/close state per-user in `payload_preferences`; clearing/resetting preferences may be needed after changing `initCollapsed`.

### 2026-04-08 — Command Center finalize: routing, sidebar grouping, email branding

- **Site Settings 404 fix:** Root cause was schema drift (not slug routing): missing `site_settings_notification_emails` table and missing `site_settings` notification columns in local SQLite with `db.push: false`. Patched DB schema and confirmed `/api/globals/site-settings` + `/admin/globals/site-settings` return 200.
- **Admin UX:** Added live Notifications preview field in Site Settings (`Effective Recipient List`) so admin can see array recipients vs fallback before save; clarified `systemFromEmail` label to **Sender Address**.
- **Sidebar structure:** `bookings` moved under `admin.group: "Marketing"` and aligned with `leads`.
- **Email templates:** Added global anchor style overrides (`#D4AF37`, `text-decoration:none`, `!important`) in Leads + Bookings templates; Lead admin alert now includes only lead email; booking admin alert requester email is a gold-styled mailto link.
- **Verification notes:** `npm run build` passes after changes. Live booking API create succeeded (`/api/bookings` 201). Lead test is constrained by Resend sandbox/duplicate checks in local environment.

### 2026-04-07 — Dev URL at root (no `basePath`)

- Removed **`basePath`** and **`assetPrefix`** from `next.config.mjs` — app runs at **`http://localhost:3000/`**.
- Local images: **`public/images/`** → use **`/images/filename`** in components (folder tracked via `.gitkeep`).
- Updated **Development.md**, **Run-Next-JS.md**, **ReCall** prompt, **.cursorrules**, **Nova** / **NovaMira-Design** skills.

### 2026-04-07 — Schedule dialog UX + payload shape

- Implemented mock **Schedule a Call** lightbox flow in `components/contact-section.tsx`.
- Added booking helper module `lib/booking.ts` for backend-ready submit contract.
- Switched from range-date selection to **single-day selection**.
- Added **12-hour AM/PM** time selection from **8:00 AM to 8:00 PM**.
- Added mock booked-slot blocking logic via `BOOKED_SLOT_KEYS`.
- Updated selector to show only available times and dynamic placeholder:
  - `Select a date first`
  - `Select from N available times`
  - `No slots available`
- Added availability summary: `X available, Y booked on this date`.

---

## What’s working now

- Schedule button opens a clean dialog (not a large static time list).
- User selects one day + one available time slot.
- Booked times are blocked in mock logic.
- Continue action submits mock payload and shows success status.
- No linter errors in touched scheduling files.

---

## Next ideas

- Replace `BOOKED_SLOT_KEYS` with live slot fetch from WordPress endpoint.
- Add timezone capture (`Intl.DateTimeFormat().resolvedOptions().timeZone`) to payload.
- Add optional email/name fields in dialog and verify flow (double opt-in).
- Add confirmation step showing selected date/time before final submit.

---

## Backend handoff notes (WordPress-ready)

- Planned public endpoint: `/wp-json/msc/v1/booking-request`
- Env var placeholder: `NEXT_PUBLIC_MSC_BOOKING_URL`
- Current payload (mock) in `lib/booking.ts`:
  - `source`
  - `email`
  - `name`
  - `preferredDateLocal`
  - `preferredTimeLocal`

---

## Session log template

Copy/paste for new entries:

```md
### YYYY-MM-DD — Short title
- Changed:
- Files:
- Why:
- Result:
- Next:
```

---

### 2026-04-07 — Session closeout (Done for today)
- Done:
  - Added and polished Schedule Call dialog UX in `components/contact-section.tsx`.
  - Finalized single-day + time-slot flow (8:00 AM–8:00 PM, AM/PM format).
  - Added mock booked-slot logic and availability-aware dropdown behavior.
  - Added backend-ready booking payload shape in `lib/booking.ts`.
  - Updated docs: `Development.md`, `Run-Next-JS.md`, and created/expanded `ReCall.md`.
  - Updated `.cursorrules` to include ReCall startup + closeout workflow.
- Next:
  - Start WordPress backend phase 1 (`/wp-json/msc/v1/booking-request` + availability endpoint).
  - Replace mock slot map with live WP availability data.
  - Add timezone + optional email verification flow.
- Open Questions:
  - Confirm where booking data should be stored in WP (custom table vs CPT/meta).
  - Confirm email provider path (`wp_mail` SMTP plugin vs transactional provider API).

### 2026-04-07 — Goodbye closeout
- Done:
  - Performed goodbye runtime cleanup for local dev listeners.
- Result:
  - Common dev ports (3000-3010) are clear for next restart.
- Next:
  - Resume with: `Continue from ReCall and wire WordPress backend phase 1.`

---

### 2026-04-08 — Critical bug fix: Turbopack dev server generating invalid JS chunks

**Symptom:** Hero carousel arrows, Demos switcher, and Schedule a Call dialog all had zero
interactivity. Browser console showed `SyntaxError: Unexpected end of input` and
`SyntaxError: Invalid or unexpected token` in `/_next/static/...` chunks. Clearing browser
cache, hard refresh, and incognito window all made no difference.

**Root cause (2 layered issues):**

1. **Turbopack panic (server crash)** — Multi-byte UTF-8 characters inside JSX block
   comments `{/* ... */}` (specifically em-dash `—` U+2014 and box-drawing `──` U+2500
   used as section separators) triggered a Rust `highlight.rs` panic in Turbopack's
   code-frame error display. The crash signature was `end byte index N is not a char
   boundary`. Exit code `3221226505` (STATUS_STACK_BUFFER_OVERRUN). When the server
   crashes mid-stream the browser caches the truncated response. On restart, fresh chunks
   are generated but the Turbopack dev server in **Next.js 16.2.0 + React 19 + Tailwind v4**
   continued to emit invalid JS chunks even after fixing the panic.

2. **Turbopack dev-mode chunk corruption (persistent)** — Even with the panic fixed and
   `.next` cache cleared, `npm run dev` (Turbopack) kept emitting malformed JS chunks.
   Incognito window confirmed this was server-side, not browser cache. This is a known
   instability in Next.js 16 + Turbopack dev mode with this exact stack.

**Fix:**
- Removed all non-ASCII characters from every `{/* JSX comment */}` across all
  components (replaced `—` with ` - ` and `──` with plain text).
- Files cleaned: `demos-section.tsx`, `contact-section.tsx`, `hero-section.tsx`,
  `process-section.tsx`, `services-section.tsx`, `policies-section.tsx`.
- **Stopped using `npm run dev` (Turbopack).** Instead:
  1. `npm run build` → generates valid production JS in `out/`
  2. `npx serve@latest out -l 3000` → serves it at `http://localhost:3000`
- All three interactions immediately worked on the production-served build.

**Also fixed during this session:**
- Rewrote `contact-section.tsx` Schedule a Call dialog: replaced Radix `<Dialog>` with
  a plain CSS `fixed inset-0 z-[9999]` overlay div — avoids Radix controlled/uncontrolled
  conflicts and works in all environments.
- Fixed invalid import order in `contact-section.tsx` (imports were placed after a `const`
  dynamic import, which is invalid ESM — moved all imports to top, `dynamic()` call after).
- Added `Image` import back to `footer.tsx` after it was accidentally removed.

**Update (Payload + Webpack):** Default **`npm run dev`** (Turbopack) is still risky on this stack. **`npm run dev`** and **`npm run dev:payload`** in **`package.json`** now pass **`--webpack`**, so normal **dev with HMR** is fine. Use **`npm run build` + `npm run start`** only when you want a production-like smoke test.

**Historical (pre-Webpack scripts):** The workflow below was used when dev server meant Turbopack-only:

```text
npm run build
npx serve@latest out -l 3000
```

That **static `out/`** path is **obsolete** now that Payload needs **`next start`**. See **Run-Next-JS.md**.

---

### 2026-04-08 — CHECKPOINT: "Pick Your Call Window" modal polished and working

**Status: STABLE — everything working on production build.**

- **Changed:** Removed Today/Tomorrow quick-shortcut buttons from the schedule modal (redundant — calendar covers any date).
- **Changed:** Replaced the native `<select>` time picker (unstyled browser blue highlight) with a fully custom gold-themed dropdown:
  - Trigger button shows gold border + gold text on selection; chevron rotates on open.
  - Dropdown list has dark `#13131a` background, gold border (`rgba(245,184,65,0.25)`), and each option highlights gold on hover and when selected.
  - Auto-closes when a time is chosen or when the calendar date changes.
- **Removed:** `getToday()` / `getTomorrow()` helper functions (no longer needed).
- **Added:** `timeDropdownOpen` state to `ContactSection`.
- **Files changed:** `components/contact-section.tsx` only.
- **Build:** `npm run build` passed clean (0 errors, 0 lints) in ~6s.
- **Served:** `npx serve out -l 3000` → `http://localhost:3000/` confirmed working.

**Revert reference:** To roll back to the button-grid time picker, restore the `{/* Time picker */}` block in `contact-section.tsx` to the version using `display: grid; gridTemplateColumns: repeat(3,1fr)` buttons, remove the `timeDropdownOpen` state, and restore `getToday`/`getTomorrow` if shortcuts are wanted again.

**What is working at this checkpoint:**
- Hero carousel cycles through all 4 images automatically.
- Demos section switches featured video when a thumbnail is clicked.
- Schedule a Call button opens the modal; calendar + custom gold dropdown work; mock submit shows success.
- All images load from `public/images/`.
- Zero linter errors across all components.

---

### 2026-04-08 — Session closeout

- Done:
  - Removed Today/Tomorrow shortcuts from schedule modal.
  - Replaced native `<select>` with custom gold-styled dropdown in the modal.
  - Rebuild and serve confirmed working.
  - ReCall + Development.md updated with checkpoint.
- Next:
  - Wire WordPress backend: `/wp-json/msc/v1/booking-request` + live slot availability.
  - Replace `BOOKED_SLOT_KEYS` mock with a live WP availability fetch.
  - Add optional email/name fields + confirmation step before final submit.
- Open Questions:
  - Confirm booking data storage in WP (custom table vs CPT/meta).
  - Confirm email provider path (`wp_mail` SMTP plugin vs transactional API).
  - Timezone capture: add `Intl.DateTimeFormat().resolvedOptions().timeZone` to payload?

### 2026-04-08 — Goodbye closeout (continue later)

- Done:
  - Added `.cursor/docs/Site-Plans.md` — backend/CMS options (headless WP vs Payload vs Supabase), static-export constraint, phased headless WP plan, links to Development/ReCall.
  - Runtime cleanup: stopped Node listener on port **3000** (PID 10404); ports **3000-3010** verified clear.
- Next:
  - Resume: read `ReCall.md` + `Development.md` + `Site-Plans.md`, then start **Phase 1** headless WP (`msc-api` plugin + wire `lib/booking.ts`) when ready — or say **Agent mode: build Phase 1**.
- Open questions:
  - Same as prior closeout (WP storage for bookings, email path, timezone in payload).

### 2026-04-08 — Payload CMS MCP (Cursor)

- **Finding:** npm `payload-cms-mcp` CLI runs `server.js` (Express static app only) — not MCP stdio. Real MCP is `api/server.ts` (SSE + `/message`) and **requires Redis** (`REDIS_URL`); meant for Vercel/Railway deploy, not `npx` in Cursor command mode.
- **Action:** Removed broken `payload-cms-mcp` entry from user `~/.cursor/mcp.json`. To use upstream: deploy + Redis + remote MCP URL/SSE in Cursor (see project chat log).

### 2026-04-08 — Dev: switch off Turbopack (broken chunks / blank admin)

- **Symptom:** `SyntaxError` in `/_next/static/chunks/*` and react-dev-overlay; hero/demos dead; `/admin` blank.
- **Cause:** Next 16 default **Turbopack** dev on this stack corrupts or truncates client JS.
- **Fix:** `package.json` dev scripts use **`next dev --webpack`**. Cleared **`.next`**, restart **`npm run dev:payload`**. Terminal should show **`Next.js (webpack)`** not Turbopack.

### 2026-04-08 — Payload CMS integrated (Phase A)

- **Changed:** Removed `output: 'export'`; `withPayload` in `next.config.mjs`; marketing at `app/(site)/page.tsx`; Payload routes under `app/(payload)/`; `payload.config.ts` + SQLite + collections `Users`, `Media`, `Bookings`.
- **Booking:** `NEXT_PUBLIC_MSC_BOOKING_URL=payload` → `POST /api/bookings`; optional `timeZone` on submit. `.env.example` documents vars.
- **Docs:** Updated `Development.md`, `Run-Next-JS.md`, `Site-Plans.md`.
- **Next:** User creates `.env.local`, runs `npm run dev:payload`, seeds admin at `/admin`; later Postgres/Neon + production hardening.

### 2026-04-08 — Restore point RP-2026-04-08-cms-globals

- **Checkpoint:** See [.cursor/docs/Restore-Points.md](./Restore-Points.md) — back up **`payload.sqlite`** before schema changes.
- **Added:** Globals `globals/Homepage.ts`, `globals/SiteSettings.ts`; collection `collections/Leads.ts`; `lib/cms/homepage.ts`, `site-settings.ts`, `content-types.ts`.
- **Wired:** `app/(site)/page.tsx` → CMS hero; `app/(site)/layout.tsx` → `generateMetadata` from Site settings; `HeroSection` accepts optional CMS slides/stats; `next.config` localhost image pattern.
- **Docs:** Development, Site-Plans, ReCall; new Restore-Points file.

### 2026-04-08 — Payload admin: logout link, hydration, docs sync

- **Changed:** Added `components/msc-payload-nav-logout.tsx` + `afterNavLinks` in `payload.config.ts`; `app/(payload)/admin/importMap.js` + `custom.scss` styles; `patch-package` regen for `@payloadcms/next` (`suppressHydrationWarning` on `<html>` after `htmlProps` and on `<body>`).
- **Verified:** With **browser extensions disabled** (e.g. ColorZilla), dev hydration overlay on `/admin` clears; sidebar **Log out** visible; direct **`/admin/logout`** works.
- **Docs:** Expanded **Development.md** (logout, import map, extensions), **Run-Next-JS.md** (`/admin/logout`, admin tip), **Site-Plans.md** (changelog); **ReCall.md** — corrected stale “only build + serve out” workflow vs current **`dev:payload` (Webpack)** and `next start`.

### 2026-04-08 — Checkpoint + check-in prep: hero media relinked

- **Checkpoint:** Added `RP-2026-04-08-hero-media-relinked` in `.cursor/docs/Restore-Points.md`.
- **Data result:** Homepage global `heroSlides` now shows **5** slides total in admin.
- **Migration details:** One-time temp scripts seeded/relinked the 4 original hero slides and preserved the existing custom slide; temp scripts deleted after run.
- **Note:** Source images are in `public/images` (`tv-wall.jpg`, `show-cards.jpg`, `on-air.jpg`, `creator-solo.jpg`) and now represented in `Media`.

### 2026-04-08 — Resend verify flow: route + UX confirmed working

- **Backend:** `collections/Leads.ts` now includes GET endpoint `leads /verify/:token` to support browser click-through from email links (with `?token=` fallback).
- **Email:** verification HTML uses `http://localhost:3000/api/leads/verify/${token}`; token generation + send confirmed via Resend adapter in `payload.config.ts`.
- **Frontend UX:** Added verify status toast on homepage via `?verified=success|error`, styled in site gold accent, auto-clears URL param, and appears top-center on mobile / bottom-right on desktop.
- **Contact cleanup:** removed “Need direct booking? Open external link” helper text from the contact card; centered newsletter success text.

### 2026-04-08 — Newsletter engine final UI polish

- **Consistency:** unified the newsletter success pill and verify toast to one shared gold token set in `components/contact-section.tsx`.
- **Affordance:** added `cursor-pointer` hover state on `Schedule a Call` and `Stay in the Loop` buttons for clearer clickability.
- **Status:** newsletter verification loop considered complete for current local scope.

### 2026-04-08 — Duplicate lead signup handling polished

- **Fix:** newsletter submit now detects duplicate-email responses from Payload and shows a clean user-facing message instead of raw JSON.
- **Behavior:** parses API error payload safely, falls back to generic error text when needed.
- **File:** `components/contact-section.tsx`.

### 2026-04-09 — Session closeout (goodbye sequence)

- **Done:**
  - Fixed `ViewPageLinkField` list-view column showing blank placeholder — added `ViewPageLinkCell` (reads `rowData.slug`) registered under `admin.components.Cell`; sidebar `Field` (useFormFields) and list `Cell` now both work.
  - Patched `@payloadcms/drizzle` `insertArrays.js` → DELETE stale child rows before re-insert; resolves `UNIQUE constraint failed` on `pages_blocks_feature_grid_items`.
  - Schema migration `scripts/migrate-sqlite-blocks-id-to-text.py` → block table PKs changed `INTEGER → TEXT` to match Payload 3 ObjectID strings (resolves `datatype mismatch` 500s).
  - Removed `omitFeatureGridItemPrimaryIds` hook (was making datatype mismatch worse).
  - Added `rowInstanceUid` / `itemInstanceUid` `defaultValue: randomUUID()`.
  - `coalesceEmptyPagesSlug` hook + `slug defaultValue: 'msc1'`.
  - Committed all work (`0148054`); created restore branch **`msc-new-payload-polished-v4`** and pushed to origin.
  - Updated `Development.md` — dual-context `ui` field pattern (Field + Cell), Cell props reference, changelog entry.
- **Restore point:** **`msc-new-payload-polished-v4`** on `origin` — tip is commit `0148054`.
- **Resume:** `git checkout msc-new-payload-polished-v4 && git pull` → `npm run dev:payload` → `http://localhost:3000/` and `/admin`.
- **Dev listener:** Stopped **`node.exe`** LISTENING on port **3000** (PID 8272). Brave browser had lingering SYN_SENT connections that time out naturally — no action needed. Run `netstat -ano | findstr ":3000"` to confirm clear on next session start.

### 2026-04-08 — Homepage hero slide SEO connected to metadata

- **Admin UX:** added a dedicated `seo` group in each `Homepage.heroSlides` row (`title`, `description`, `OpenGraph image`) so legacy/global slides can be edited in-place.
- **Frontend SEO:** `app/(site)/layout.tsx` `generateMetadata` now uses the active hero slide SEO first, then falls back to slide content and `Site settings`.
- **Social tags:** OpenGraph + Twitter metadata now mirror the same active-slide SEO values.
- **Helper:** new `getHomepageActiveSlideSeo()` in `lib/cms/homepage.ts`.

