# MSC Next front-end -- development reference

Living notes for how this site is wired so humans and agents can find things quickly after gaps or fixes. **Update this file** when you change architecture, URLs, or fix non-obvious bugs.

**Companion:** [Run-Next-JS.md](./Run-Next-JS.md) — install, dev vs production server, env. [MCP-SETUP.md](./MCP-SETUP.md) — Cursor MCP config and env sync. [Site-Plans.md](./Site-Plans.md) — CMS / backend options. [Restore-Points.md](./Restore-Points.md) — dated checkpoints + how to back up `payload.sqlite`.

---

## Stack

- **Next.js 15.4.11** (App Router), **React 19**, **Tailwind CSS 4**, **Radix**-based UI in `components/ui/`.
- **Payload CMS 3** integrated via `@payloadcms/next` (`withPayload` in `next.config.mjs`). Admin at **`/admin`**, REST/GraphQL under **`/api/*`**.
- **Database (local dev):** SQLite file `payload.sqlite` via `@payloadcms/db-sqlite` (`DATABASE_URL=file:./payload.sqlite`). Swap adapter in `payload.config.ts` for Postgres (e.g. Neon) when deploying.
- **No static-only export:** `output: 'export'` was removed so Payload routes can run. Deploy as a **Node** app (`next build` + `next start`) or a platform that supports Next server routes (Vercel, Railway, etc.).
- **Static images:** **`public/media/`** → **`/media/filename.ext`**.

---

## Local env (required)

Copy **`.env.example`** → **`.env.local`** and set at minimum:

- `PAYLOAD_SECRET` -- long random string (never commit real secrets).
- `DATABASE_URL` -- default `file:./payload.sqlite` is fine locally.
- `NEXT_PUBLIC_SERVER_URL` -- e.g. `http://localhost:3000`.
- `NEXT_PUBLIC_MSC_BOOKING_URL=payload` -- Schedule dialog POSTs to **`/api/bookings`**. Leave empty for mock-only; set a full WordPress URL for headless WP instead.

**MCP (Cursor agents):** After editing `.env.local`, run **`npm run sync:mcp-env`** and reload MCP in Cursor. See **[MCP-SETUP.md](./MCP-SETUP.md)** for global vs project servers, Payload MCP skip, and WordPress MCP.

---

## Running locally

**Bundler (Next 15.4+):** Stock **`next dev`** uses **webpack**. Turbopack is **opt-in** (`--turbo` / `--turbopack`). Do **not** pass those flags here — on **Next 16** the default flipped to Turbopack and **corrupt JS chunks** / **blank `/admin`** were observed on this stack; this repo pins **Next 15.4.11** so **`npm run dev`** stays on webpack without extra flags. (If you upgrade to a Turbopack-default Next major, use the framework’s webpack flag or pin until stable.)

**Run dev:**

```bash
npm run dev:payload
```

If anything still looks cached or broken, delete **`.next`** once, then restart dev.

### Production on Spaceship (shared-host memory limits)

- **Observed issue:** host-side `npm run build` can fail with `RangeError: WebAssembly.instantiate(): Out of memory`.
- **Recommended deployment path on low-memory hosts:**
  1. Build locally (`npm run build`)
  2. Upload prebuilt `.next` as a zip (`npm run pushitupzip -- .next`)
  3. Upload runtime files (`npm run pushitup -- patches package.json package-lock.json server.js`)
  4. On host, run `npm install --legacy-peer-deps` (skip host build), unpack `.next`, restart app
- **Uploader commands:**
  - `PushItUP`: uploads file/folder paths directly
  - `PushItUPzip`: packs each target to a zip in `.pushitupzips/` and uploads the archive(s)

**Next.js dev UI:** A bottom-left **Preferences / dev tools** panel is Next itself in development, not Payload. This repo sets **`devIndicators: false`** in **`next.config.mjs`** so it does not cover the admin. Re-enable by removing that line if you want the stock Next dev indicator.

**Fallback (closest to production):**

```bash
npm run build
npm run start
```

Open **`http://localhost:3000/`**. First-time **Payload:** visit **`http://localhost:3000/admin`** and create the admin user.

---

## App structure

**Two document shells (route groups):** **`app/(site)/layout.tsx`** owns `<html>` / `<body>` for `/`. **`app/(payload)/layout.tsx`** uses Payload `RootLayout` (its own `<html>` / `<body>`) for `/admin`. **`app/layout.tsx`** is a **passthrough** (`return children` only): Next.js expects a root `layout.tsx` file; a full marketing `<html>` here would nest Payload’s document and break `/admin`. Putting `<html>` only in `(site)` caused **500 Internal Server Error** in dev when the root file was missing entirely.

| What | Path |
|------|------|
| Marketing document shell (metadata, fonts, **ScrollToTop**) | `app/(site)/layout.tsx` |
| Marketing home sections | `app/(site)/page.tsx` |
| Payload admin + API route group | `app/(payload)/` |
| Payload config | `payload.config.ts` |
| Collections | `collections/*.ts` |
| Globals (single-doc CMS) | `globals/*.ts` |
| CMS fetch helpers (marketing) | `lib/cms/*.ts` |
| Global styles | `app/globals.css` |
| Build rules | `next.config.mjs` |

---

## Page structure (marketing home)

`app/(site)/page.tsx` renders **`Header` as a sibling of `<main>`** (fragment: `<> … </>`), then **`<main>`** wraps all sections + footer. Dynamic pages **`app/(site)/[slug]/page.tsx`** use the same pattern.

- **Why:** Avoids **`overflow-x-clip`** (or `overflow: hidden`) becoming an ancestor of the header, which breaks **`position: sticky`** in Chromium. Horizontal clipping lives on an **inner `<div className="overflow-x-clip">` inside `<main>` only**.
- **Reorder sections:** edit **`app/(site)/page.tsx`** (components between the inner wrapper’s opening tag and `Footer`).

---

## Marketing header (sticky + glass)

- **Admin toggle:** **Site settings → General → Enable Sticky Header** (`stickyHeader` in config; SQLite column typically **`sticky_header`**). If the column is missing with **`db.push: false`**, **`/admin/globals/site-settings` can 404** — run **`npm run migrate:sqlite:site-settings-sticky-header`** once (see **`scripts/migrate-sqlite-site-settings-sticky-header.py`** / **`scripts/sql/add-site-settings-sticky-header.sql`**). The field’s admin description is short (glass vs static header only); it does not repeat migration commands.
- **Data:** **`lib/cms/site-settings.ts`** — `getSiteSettingsCms()` includes **`stickyHeader`**; **`resolveStickyHeaderFromDoc()`** normalizes Payload/SQLite shapes (`sticky_header`, **`0` / `1`**, booleans). Pages pass **`stickyHeaderEnabled`** into **`Header`**, **`HeroSection`**, and **`DemosSection`** (home).
- **Component:** **`components/header.tsx`** — when on: **`sticky top-0 z-100 bg-black/70 backdrop-blur-md`** ( **`z-100`** clears hero carousel controls at **`z-[60]`** ); when off: **`relative z-50 bg-background`**. In development only, logs **`[MSC] Enable Sticky Header (prop):`** for debugging the toggle.
- **CSS gotcha (fixed):** **`app/globals.css`** `.msc-section` applied **`position: relative`** to every section, including **`#msc-header`**. Unlayered CSS **won over** Tailwind **`sticky`**, so DevTools showed `sticky` in the class list but **computed `position` was `relative`** and the bar scrolled away. **Fix:** **`.msc-section:not(#msc-header) { position: relative; }`** — header keeps `sticky`.
- **Default nav (Payload `header` global + `lib/cms/header.ts` `DEFAULT_HEADER_NAV_ITEMS`):** store section targets as **`#msc-*`** (e.g. `#msc-demos`). **`normalizeInternalNavLink()`** in **`lib/hash-nav.ts`** collapses stacked fragments to a single id and keeps home-only anchors as **`#id`** (no leading `/`). **`getHeaderNavItems()`** still normalizes CMS rows on read. **`Header`** and **`Footer`** use **`usePathname()`** + **`resolveNavHashHref()`**: on **`/`** links render as **`#id`** (same-document, works with **`html { scroll-behavior: smooth; }`**); on routes like **`/msc1`** they render as **`/#id`**. **`shouldReplaceHashLink`** + **`scrollPropForResolvedNav`** pair with **`next/link`** (`replace` / `scroll`) so cross-page jumps do not stack hashes in the URL bar. A nav row whose label is exactly **`Pages`** gets its URL and manual submenu replaced by **`pages`** collection entries (excludes slug **`home`**, sorted by title); omit that row to hide the list. **`HomeHashScroll`** (**`components/home-hash-scroll.tsx`**, **`(site)` layout**) runs on **`/`**, smooth-scrolls to the target id on mount and on **`hashchange`**, and uses **`history.replaceState`** when the fragment contains multiple **`#`** segments so the address bar shows a single hash. **Services** submenu order (page flow): **Own Your Platform** → `#msc-own-platform`, **Packages** → `#msc-packages`, **Requirements** → `#msc-requirements`, **What We Do** → `#msc-creators`. **Resources** submenu: **Testimonials** → `#msc-testimonials`, **Extras** → `#msc-addons`, **FAQ** → `#msc-faq`. **Demos** → `#msc-demos`. If an existing **`header`** global was saved with older `/#…` strings, they still normalize correctly.
- **Scrolling:** **`html { scroll-behavior: smooth; }`** in **`globals.css`**. **`#msc-demos`** lives on the **inner** `max-w-7xl` wrapper in **`components/demos-section.tsx`** (not the outer `<section>`) so hash scroll lands on the “Our Work” / “View Demos” header without stacking an extra band of empty space. The section uses **`py-24 lg:py-32`** (padding, not margin-top) so the Demos **`bg-surface-2`** fills the top band — **margin-top** had exposed **`main`’s darker `bg-background`** as a visible “divider.” When sticky header is on, that wrapper uses **`scroll-mt-30`** (~`h-20` + ~40px breathing room under the bar).
- **Scroll to top:** **`components/scroll-to-top.tsx`** — fixed gold circular control; appears after the user scrolls past **~50%** of the viewport height; **`app/(site)/layout.tsx`** mounts it for all marketing routes using that layout.

---

## CMS — homepage hero + SEO (Payload globals)

Admin sidebar group **Site**:

- **`Homepage`** — Hero carousel: each slide uses an image from **Media** (upload there first), eyebrow, three headline lines, subcopy, optional **secondary CTA** label/link, and a per-slide **SEO** group. Optional **Hero stats** row; if empty, the site uses the built-in stat copy. SQLite migration for secondary CTA columns: **`migrate:sqlite:homepage-hero-secondary-cta`** (see **Globals** in *Payload data model*).
- **`Site settings`** — **`siteName`** and **`tagline`** feed **`generateMetadata()`** in **`app/(site)/layout.tsx`** (browser title + meta description). **General** also has **Enable Sticky Header** (see **Marketing header** below). Defaults apply until you save once in admin.

**Front-end wiring:**

- **`lib/cms/homepage.ts`** — `getHomepageCmsData()` for **`app/(site)/page.tsx`** → **`HeroSection`** (`cmsSlides` / `cmsStats`). If no slides are saved, **`components/hero-section.tsx`** keeps its original **`/media/...`** fallbacks (files in **`public/media`**).
- **`lib/cms/site-settings.ts`** — used only on the server for metadata.

**Images:** Hero resolves Payload media as same-origin paths (e.g. `/api/media/file/...`). **`next.config.mjs`** includes `localhost` in `images.remotePatterns` for dev if you ever use absolute URLs.

---

## Section conventions

- **`components/<name>-section.tsx`** for marketing blocks.
- **`components/ui/`** for primitives.
- **JSX comments:** ASCII only inside `{/* ... */}` (Turbopack quirk).

---

## Contact / booking

**File:** `components/contact-section.tsx`

- **Schedule a Call** submits through **`submitBookingRequest`** in **`lib/booking.ts`**.
- **Payload mode:** `NEXT_PUBLIC_MSC_BOOKING_URL=payload` → `POST /api/bookings` with fields matching **`collections/Bookings.ts`** (includes optional `timeZone`).
- **Mock mode:** leave `NEXT_PUBLIC_MSC_BOOKING_URL` unset → short delay + `console.info` only.
- **WordPress mode:** set URL to your WP REST endpoint (see Site-Plans).

---

## Payload admin authoring (blocks-first)

**Default pattern for new CMS surfaces:** use **`type: "blocks"`** with explicit **block types** (and `labels`) so editors get the same **row UI** as **Sections Builder** — drag handle, row number, block-type badge, per-row collapse, and **Collapse All / Show All** — instead of long stretches of always-visible fields.

- **When to use `blocks`:** multi-part sections, heroes, CTAs, rich+media combos, or anything that would read as “rows and rows of fields” as a flat `group` or giant tab.
- **When `array` is still OK:** tiny uniform rows (notification email list, simple label+link, hero stats value+label).
- **Collapsed by default:** spread **`adminRowsStartCollapsed`** from **`lib/payload-admin-defaults.ts`** on **`blocks`** and **`array`** fields.
- **Singleton block regions:** e.g. Page hero — `minRows: 0`, `maxRows: 1`, one `slug`.
- **SQLite:** with **`db.push: false`**, new block slugs need new `*_blocks_*` tables + a migration script (see **`scripts/migrate-*.py`**).
- **Cursor:** agents editing **`collections/*.ts`** / **`globals/*.ts`** should follow **`.cursor/rules/payload-blocks-first.mdc`**.

**Troubleshooting — duplicate React keys in `/admin`:**
- **List view:** do not add **`blocks`** fields as **table columns** (e.g. `pageHero.enabled`). Set **`admin.disableListColumn: true`** (and usually **`disableListFilter: true`**) on **`blocks`** fields; clear `columns[]` from the URL if needed.
- **Document edit — root cause:** With SQL adapters, each block type uses its own table with **auto-increment `id`**, so `id: 1` can exist on a Rich Text row *and* a Video row simultaneously. Payload 3.81 `BlocksField` / `ArrayField` used raw `row.id` as React keys and **dnd-kit** ids → duplicate key warnings (console shows `key: '1'`, `key: '2'`). Nested arrays (e.g. Feature Grid `items`) hit the same collision.
- **⚠ Critical — patches must target the pre-bundled file:** `@payloadcms/ui`'s `package.json` `exports` field maps the package entry point to `dist/exports/client/index.js` (a **pre-built minified bundle**). Webpack and Next.js resolve the package through this file, **completely bypassing** any patches applied to the individual `dist/fields/Blocks/index.js` or `dist/forms/` source files. If you only patch those source files the errors will persist even after a full cache clear and hard refresh. **Always patch `dist/exports/client/index.js` directly.**
- **Fix in this repo:** `patch-package` → **`patches/@payloadcms+ui+3.81.0.patch`** patches **`dist/exports/client/index.js`** (the minified bundle) with 9 targeted string replacements:
  1. `BlocksField` DND ids → `` `${path}-${blockType}-${id}` ``
  2. `BlocksField` `DraggableSortableItem` `id` prop → composite
  3. `BlocksField` `DraggableSortableItem` React `key` → composite
  4. `ArrayField` DND ids → `` `${path}-${id}` ``
  5. `ArrayField` `DraggableSortableItem` `id` prop → composite
  6. `ArrayField` `DraggableSortableItem` React `key` → composite
  7. `BlockRow` `Collapsible` React `key` → row `path` (not `row.id`)
  8. `BlockRow` `dragHandleProps.id` → `` `${parentPath}-${blockType}-${id}` ``
  9. `ArrayRow` `dragHandleProps.id` → `` `${parentPath}-${id}` ``
  Run **`npm install`** after clone (triggers `postinstall: patch-package`).
- **Update (2026-04):** The same patch file also edits **`dist/fields/Blocks/index.js`**, **`dist/fields/Array/index.js`**, and **`dist/fields/Blocks/BlockRow.js`** so **every DnD id includes the row index** (e.g. `` `${path}-${id}-${idx}` ``). Without the index, two **array** rows (Feature Grid **items**) or two **blocks** rows with the same numeric **`id`** still collided (`sections-featureGrid-1`). **`collections/Pages.ts`** adds hidden **`rowInstanceUid`** / **`itemInstanceUid`** plus hooks to fill UUIDs; SQLite needs **`npm run migrate:sqlite:pages-blocks-uid`** when **`db.push: false`**. If the console still shows **old** key shapes, delete **`.next`** and use **`npm run dev:payload`** (Webpack), not stock Turbopack dev, per the note at the top of this doc.
- **If errors return after `npm install`:** run `npx patch-package @payloadcms/ui` to regenerate the patch from the current state of `node_modules`, then commit `patches/@payloadcms+ui+3.81.0.patch`.
- **Mega list URL (`?columns=…`):** Payload encodes the column picker in the query string. Use **`/admin/collections/pages`** with **no** query params, or reset **Columns** in the list UI, after hiding nested fields via **`disableListColumn`** (`pages` already sets **`defaultColumns`**).
- **Two `blocks` fields** on one document can still be awkward; **Pages → Page hero** uses **`collapsible` + `group`**. Use **`scripts/sync-*.py`** when migrating field shapes.

---

## Payload admin (theme, logout, hydration)

- **`admin.theme: 'dark'`** in `payload.config.ts` keeps the panel dark (login + dashboard).
- **Log out**
  - **Sidebar:** Payload’s default control is a small icon next to **settings** at the bottom of the nav. This project also adds a clear **“Log out”** text link via **`admin.components.afterNavLinks`** → **`components/msc-payload-nav-logout.tsx`** (styles in **`app/(payload)/custom.scss`**).
  - **Direct URL:** **`/admin/logout`** (full URL e.g. `http://localhost:3000/admin/logout`).
  - **Import map:** Custom admin components are registered in **`app/(payload)/admin/importMap.js`**. If you add more Payload UI components referenced by string path in `payload.config.ts`, either run **`npx payload generate:importmap`** (when the CLI resolves your config) or merge entries manually using the same `path#ExportName` key pattern. In dev, HMR regenerates the import map automatically on save.
- **`ui` field — two components needed:** A `type: "ui"` field that should appear in **both** the edit sidebar and the list view must register **`Field`** (sidebar, use `useFormFields`) **and** `Cell` (list view, receives `{ rowData }`) separately in `admin.components`. Cell components in Payload v3 receive `{ cellData, field, rowData, collectionConfig, customCellProps }`; for `ui` fields `cellData` is always `undefined`, so read from `rowData`. See **`components/payload/view-page-link-field.tsx`** for a complete reference implementation.
- **Hydration / red dev overlay (extensions)**
  - Browser extensions (e.g. **ColorZilla** → `cz-shortcut-listen` on `<body>`, grammar tools, etc.) mutate the DOM before React hydrates → Next shows a **hydration mismatch** and a red error badge. **Disabling extensions** for Brave/Chrome (or using a **private window** with extensions off) on **`localhost`** fixes it; this is environmental, not a Payload bug.
  - **`admin.suppressHydrationWarning: true`** plus **`patches/@payloadcms+next+*.patch`** (applied on **`npm install`** via **`patch-package`**) sets **`suppressHydrationWarning`** on **`<html>`** (after `...htmlProps` so nothing overrides it) and **`<body>`** in Payload’s `RootLayout`. Helps legitimate mismatches; extensions can still win if they rewrite the tree aggressively.
  - If **Console Ninja** (or similar) injects into the page, keep it disconnected for `/admin` troubleshooting.

---

## Payload data model (collections + globals)

**Collections**

- **`users`** — admin auth (Payload default).
- **`media`** — uploads (`sharp`); hero and future sections pick files here.
- **`bookings`** — Two-step schedule-call submissions (`POST /api/bookings`) with schema: `name` (required), `email` (required), `phone` (required), `appointmentDate` (required date/time), `message`.
- **`leads`** — newsletter signups from the homepage modal (`POST /api/leads`, public **create**; admin **read** when logged in). Email verification is enabled and email is visible in admin list columns.
- **Verification route note** — browser click-through uses a custom GET endpoint at **`/api/leads/verify/:token`** (also accepts `?token=` fallback), then redirects to **`/?verified=success`** or **`/?verified=error`**.
- **`pages`** — dynamic slug engine (`/[slug]`) now supports Lexical rich content and a Sections Builder (blocks) with per-section anchor IDs (`sectionId`) for in-page navigation.

**Globals**

- **`homepage`** — hero slides + optional stats (see above). Each slide now includes a per-slide `seo` group (`title`, `description`, `OpenGraph image`) for metadata control directly in the Homepage screen, plus per-slide **secondary CTA** label/link fields. With SQLite and **`db.push: false`**, missing columns on **`homepage_hero_slides`** can make **`/admin/globals/homepage` 404** — run **`npm run migrate:sqlite:homepage-hero-secondary-cta`** once (**`scripts/migrate-sqlite-homepage-hero-secondary-cta.py`**). The Homepage global’s admin description points editors at the same script if needed.
- **`site-settings`** — site name/tagline for SEO metadata; **General** includes **`stickyHeader`** (marketing pinned header). **Notifications** tab: `enableAdminNotifications`, `notificationEmails`, `adminFallbackEmail`, `systemFromEmail`.
- **`site-settings` branding** — includes `siteLogo`, `favicon`, `ogImage`, and `siteTitleSuffix`; header/footer logo + metadata defaults are wired to these fields.
- **`projects-home`** — Projects moved to a Site global with draggable row items (`projectItems`) to match Homepage editing UX. Frontend demos now read from this global instead of a collection.
- **`header`** — nav items support nested submenu rows in admin (collapsed by default), with desktop/mobile dropdowns. **Default** labels and section anchors are in **`globals/Header.ts`** / **`lib/cms/header.ts`** (see **Marketing header** → default nav); existing saved nav rows are not auto-overwritten.

---

## Changelog (major fixes / decisions)

| Date | Summary |
|------|---------|
| 2026-04-09 | **Leads verify redirect hardened for proxy/shared-host routing** — `collections/Leads.ts` now returns **relative redirects** (`Location: /?verified=success|error`) after token checks instead of origin-derived absolute redirects. This prevents internal host leakage (e.g. `0.0.0.0:3000`) when running behind cPanel/NodeJS Selector reverse proxies. Verification emails still use `NEXT_PUBLIC_SERVER_URL` for the clickable link base. |
| 2026-04-09 | **`ViewPageLinkField` / `ViewPageLinkCell` — dual-context link component** — A Payload `ui` field component must be registered twice to work in both contexts: **`admin.components.Field`** for the document edit sidebar (uses `useFormFields` to read live form state) and **`admin.components.Cell`** for the list-view column (receives `rowData` from Payload's table renderer; reads `rowData.slug`). Both are exported from `components/payload/view-page-link-field.tsx`. Base URL is hardcoded to `http://localhost:3000` for local dev; both fall back to slug `msc1` if empty. Omitting the `Cell` registration causes Payload to render a blank/placeholder cell in the list view. |
| 2026-04-09 | **Marketing hash navigation** — documented **`lib/hash-nav.ts`** (`normalizeInternalNavLink`, `resolveNavHashHref`, `shouldReplaceHashLink`, `scrollPropForResolvedNav`, `canonicalFragmentIdFromHref`); **`header`** / **`footer`** pathname-aware **`#`** vs **`/#`**; **`HomeHashScroll`** single-hash cleanup; CMS defaults use **`#msc-*`**. |
| 2026-04-07 | **Schedule a Call** — centralised booking URL; dialog UX. |
| 2026-04-08 | **Turbopack / static serve** — documented build + serve workaround when using static export (pre-Payload). |
| 2026-04-08 | **Payload integration** — `withPayload`, `app/(payload)`, SQLite, `bookings` collection, booking POST from site, `(site)` route group for marketing. Static export removed; use `next start` or hosted Node. |
| 2026-04-09 | **Dev scripts (Next 15.4)** — `dev` / `dev:payload` run plain **`next dev`** (`--webpack` removed from CLI; webpack is default). |
| 2026-04-08 | **Webpack dev** — avoid Turbopack on this stack when it was default (Next 16); use webpack dev. |
| 2026-04-08 | **Dual document shells** — marketing shell in `app/(site)/layout.tsx`; Payload `RootLayout` for `/admin`; **passthrough** `app/layout.tsx` (`return children`) required or dev returns 500 on `/` and `/admin`. |
| 2026-04-08 | **Payload admin UX + hydration** — `afterNavLinks` “Log out” link (`msc-payload-nav-logout.tsx`); `patch-package` on `@payloadcms/next` so `suppressHydrationWarning` applies to `<html>` (after `htmlProps`) and `<body>`; extensions on `localhost` documented as common false-positive source. |
| 2026-04-08 | **CMS globals + Leads** — `Homepage` + `Site settings` globals; hero + metadata wired from Payload; **`leads`** collection; restore checkpoint **RP-2026-04-08-cms-globals** in [Restore-Points.md](./Restore-Points.md). |
| 2026-04-08 | **Leads verify click-through fix** — added GET endpoint `leads /verify/:token` for browser email links and redirect to `/?verified=success|error`; keeps verification URL aligned with real route behavior. |
| 2026-04-08 | **Newsletter verification UX polish** — homepage now shows a gold-themed verify status toast (`?verified=success|error`) with top-center placement on mobile; removed “Need direct booking? Open external link” line from the contact card for cleaner CTA focus. |
| 2026-04-08 | **Newsletter engine final polish** — unified newsletter success pill + verify toast to the same gold token set for visual consistency; ensured CTA hover states show pointer cursor for `Schedule a Call` and `Stay in the Loop`. |
| 2026-04-08 | **Duplicate signup UX fix** — newsletter modal now handles Payload duplicate-email validation gracefully and shows a friendly “already subscribed” message instead of raw JSON error payloads. |
| 2026-04-08 | **Homepage slide SEO wiring** — added per-slide SEO group in `Homepage.heroSlides`; `generateMetadata` now reads the active slide’s SEO title/description/image (with fallback to slide content + Site settings), and outputs OpenGraph/Twitter metadata automatically. |
| 2026-04-08 | **Two-Step Booking Engine** — schedule modal now runs Step 1 (date/time) -> Step 2 (name/email/phone/message), saves to Payload `bookings`, resets state on success, and shows the gold success toast (mobile top-center / desktop bottom-right). Booking create hook sends branded confirmation email to user + alert email to admin via Resend adapter. |
| 2026-04-08 | **Centralized Command Center** — booking/lead hooks now resolve admin toggles, recipient list/fallback, and sender email from `Site settings -> Notifications` (no hardcoded recipients). User confirmation and admin alerts are isolated in independent try/catch paths so one delivery failure does not block the other or persistence. |
| 2026-04-08 | **Site Settings 404 resolved + admin live preview** — fixed runtime 404 caused by missing SQLite notification table/columns (`site_settings_notification_emails` + new `site_settings` columns), added live “Effective Recipient List” preview UI field in Notifications tab, and clarified `systemFromEmail` label as **Sender Address**. |
| 2026-04-08 | **Admin sidebar grouping polish** — moved `bookings` into `admin.group: "Marketing"` and confirmed `leads` in the same group for high-intent data clustering. |
| 2026-04-08 | **Email template branding pass** — forced anchor styles to gold (`#D4AF37`) and no underline for verification + admin alerts, streamlined “New Lead Alert” to email-only content, and styled booking alert email link with matching gold `mailto` presentation. |
| 2026-04-08 | **Projects admin reworked to Homepage-style rows** — migrated Projects from collection docs to `projects-home` global array (`projectItems`) for drag-and-toggle editing on one screen; restored right-rail demos behavior (fixed card height, conditional scrollbar, gold scrollbar styling, click-to-preview, `Featured/Visible` badge hierarchy, visibility toggle filtering). |
| 2026-04-08 | **Header navigation submenu restore** — Header global now supports nested submenu items (collapsed rows by default); frontend desktop dropdown + mobile nested links restored with chevron rotate and delayed close for smoother hover behavior. |
| 2026-04-08 | **Admin nav polish** — sidebar category labels use gold accent, Dashboard quick link added at top, and custom Log out moved from sidebar into account-page context with inline placement behavior. |
| 2026-04-08 | **Site branding controls + wiring** — added `Site settings -> Branding` tab (`siteLogo`, `favicon`, `ogImage`, `siteTitleSuffix`), wired logo into Header/Footer, and applied favicon/OG/site title suffix defaults in site metadata generation. |
| 2026-04-08 | **Dynamic Pages engine live** — added `app/(site)/[slug]/page.tsx` with Payload slug lookup, SEO metadata fallback from page/meta + Site settings suffix, and premium dark/gold rendering. |
| 2026-04-08 | **Pages Content Builder expanded** — added `featuredImage`, Lexical `content`, and `sections` blocks (`richText`, `featureGrid`, `videoPlayer`) each with required `Anchor ID`; dynamic page now renders sections + rich content. |
| 2026-04-08 | **In-page anchor navigation** — added sticky `PageJumpLinks` with smooth-scroll, active-section highlighting, mobile chip scroller UI, and auto-centering of the active chip while scrolling. |
| 2026-04-08 | **In-page nav final polish + demo fill** — updated jump-link bar to non-sticky behavior per UX preference, tightened section card spacing, and hid the legacy "Page Content Coming Soon" card whenever sections exist. Seeded `msc1` with 5 high-fidelity demo blocks for full scroll-flow validation. |
| 2026-04-08 | **Payload blocks-first convention** — documented default admin pattern: prefer typed **`blocks`** fields (Sections Builder row UI) over long flat field stacks; `array` only for small uniform rows; **`lib/payload-admin-defaults.ts`** + **`.cursor/rules/payload-blocks-first.mdc`** for agents. |
| 2026-04-08 | **Pages admin React keys** — `pageHero` moved from a second **`blocks`** field to **`collapsible` + `group`** (same schema path `pageHero.*`) because two `blocks` fields on one document duplicate numeric row ids as React keys; data sync via **`npm run migrate:sqlite:page-hero-sync-group`**. |
| 2026-04-08 | **Payload admin duplicate keys (upstream) — final fix** — Root cause: `@payloadcms/ui` `package.json` `exports` field routes webpack to the **pre-bundled minified** `dist/exports/client/index.js`, bypassing all patches to individual source files. Applied 9 composite-key replacements **directly to the minified bundle** via `patch-package` (`patches/@payloadcms+ui+3.81.0.patch`): `BlocksField` + `ArrayField` DnD ids, `DraggableSortableItem` `id`+`key` props (composite `path-blockType-id` / `path-id`), `BlockRow` `Collapsible` key (row path), `BlockRow` + `ArrayRow` `dragHandleProps.id` (composite). Errors `key: '1'` / `key: '2'` on Pages → MSC1 edit are resolved. |
| 2026-04-08 | **Sticky marketing header — Site settings + layout/CSS** — Added **`stickyHeader`** to **`globals/SiteSettings.ts`** with SQLite migration (**`migrate:sqlite:site-settings-sticky-header`**). **`Header`** is a **sibling** of **`<main>`**; **`overflow-x-clip`** only on an inner div inside main. **`.msc-section`** no longer sets **`position: relative`** on **`#msc-header`** (that rule had overridden Tailwind **`sticky`**). Header uses **`z-100`** when pinned; hero secondary CTA **View Demos** → **`#msc-demos`** (Demos **`scroll-margin`** and anchor placement refined in the next row). |
| 2026-04-08 | **Marketing nav + Demos anchor + scroll UX** — Services submenu: **What We Do** → **`#msc-creators`**, **Own Your Platform** → **`#msc-own-platform`**; Resources adds **Extras** → **`#msc-addons`** with **FAQ** after Extras. **`#msc-demos`** on inner Demos wrapper + **`scroll-mt-30`** when sticky; section **padding-top** (not margin) avoids a dark strip from **`main`’s background**. **`ScrollToTop`** on **`(site)` layout**. **Homepage** hero secondary CTA columns: **`migrate:sqlite:homepage-hero-secondary-cta`**. Sticky header field admin copy shortened (no inline SQLite paragraph). |

---

## Maintenance tips

- **SQLite migrations (when `db.push: false`):** **`npm run migrate:sqlite:site-settings-sticky-header`**, **`npm run migrate:sqlite:homepage-hero-secondary-cta`**, plus other **`migrate:sqlite:*`** scripts in **`package.json`** — run when a new global/collection field 404s in admin or errors on read.
- Regenerate types after collection changes: `npx payload generate:types` (optional).
- For subdirectory hosting later, set `basePath` / `assetPrefix` and update URLs here + Run-Next-JS.
- Keep this file short; link to **Site-Plans.md** for CMS vs WP tradeoffs.

---

## Git checkpoint workflow (recommended)

Use this exact flow whenever you want a clean restore point.

1. **Check current branch + changes**
   - `git status -sb`
2. **Review what will be saved**
   - `git diff -- .`
3. **Commit all intended work**
   - `git add -A`
   - `git commit -m "clear message about why this checkpoint matters"`
4. **Push your commit**
   - `git push`

### Create a new restore branch from current state

When you want to "freeze" a working state before more changes:

1. `git checkout -b <new-branch-name>`
2. `git push -u origin <new-branch-name>`
3. Verify:
   - `git status -sb` should show your new branch tracking origin.

### Naming conventions used in this project

- Working feature branches:
  - `msc-new-payload-polished`
  - `msc-new-payload-polished-v2`
- Good commit style:
  - `Add dynamic pages builder, anchors, and branding wiring.`
  - Keep commit message focused on the **outcome**, not every file detail.

### Fast safety checklist before each push

- `npm run build` passes
- No unexpected `git status --short` output
- Branch name matches the checkpoint intent
