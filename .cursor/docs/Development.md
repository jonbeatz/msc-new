# MSC Next front-end -- development reference

Living notes for how this site is wired so humans and agents can find things quickly after gaps or fixes. **Update this file** when you change architecture, URLs, or fix non-obvious bugs.

**Companion:** [Run-Next-JS.md](./Run-Next-JS.md) — install, dev vs production server, env. [Site-Plans.md](./Site-Plans.md) — CMS / backend options. [Restore-Points.md](./Restore-Points.md) — dated checkpoints + how to back up `payload.sqlite`.

---

## Stack

- **Next.js 16** (App Router), **React 19**, **Tailwind CSS 4**, **Radix**-based UI in `components/ui/`.
- **Payload CMS 3** integrated via `@payloadcms/next` (`withPayload` in `next.config.mjs`). Admin at **`/admin`**, REST/GraphQL under **`/api/*`**.
- **Database (local dev):** SQLite file `payload.sqlite` via `@payloadcms/db-sqlite` (`DATABASE_URL=file:./payload.sqlite`). Swap adapter in `payload.config.ts` for Postgres (e.g. Neon) when deploying.
- **No static-only export:** `output: 'export'` was removed so Payload routes can run. Deploy as a **Node** app (`next build` + `next start`) or a platform that supports Next server routes (Vercel, Railway, etc.).
- **Static images:** **`public/images/`** → **`/images/filename.ext`**.

---

## Local env (required)

Copy **`.env.example`** → **`.env.local`** and set at minimum:

- `PAYLOAD_SECRET` -- long random string (never commit real secrets).
- `DATABASE_URL` -- default `file:./payload.sqlite` is fine locally.
- `NEXT_PUBLIC_SERVER_URL` -- e.g. `http://localhost:3000`.
- `NEXT_PUBLIC_MSC_BOOKING_URL=payload` -- Schedule dialog POSTs to **`/api/bookings`**. Leave empty for mock-only; set a full WordPress URL for headless WP instead.

---

## Running locally

**Bundler:** Next 16 defaults to **Turbopack** for `next dev`. On this project (Windows + React 19 + Tailwind 4 + Payload), Turbopack has produced **corrupt JS chunks** (`SyntaxError: Unexpected end of input` in `/_next/static/chunks/...` and broken **react-dev-overlay**), which kills hero/demos clicks and shows a **blank `/admin`**.

**Fix:** Scripts use **`next dev --webpack`** (Webpack dev). Always prefer:

```bash
npm run dev:payload
```

If anything still looks cached or broken, delete **`.next`** once, then restart dev.

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
| Marketing document shell (metadata, fonts) | `app/(site)/layout.tsx` |
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

`app/(site)/page.tsx` renders one `<main>` with sections in this order:

1. `Header` through `Footer` (same list as before; see git history if you need the full enumeration).

To **reorder** the home page, edit **`app/(site)/page.tsx`** only.

---

## CMS — homepage hero + SEO (Payload globals)

Admin sidebar group **Site**:

- **`Homepage`** — Hero carousel: each slide uses an image from **Media** (upload there first), eyebrow, three headline lines, and subcopy. Optional **Hero stats** row; if empty, the site uses the built-in stat copy.
- **`Site settings`** — **`siteName`** and **`tagline`** feed **`generateMetadata()`** in **`app/(site)/layout.tsx`** (browser title + meta description). Defaults apply until you save once in admin.

**Front-end wiring:**

- **`lib/cms/homepage.ts`** — `getHomepageCmsData()` for **`app/(site)/page.tsx`** → **`HeroSection`** (`cmsSlides` / `cmsStats`). If no slides are saved, **`components/hero-section.tsx`** keeps its original `/public/images` slides.
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

## Payload admin (theme, logout, hydration)

- **`admin.theme: 'dark'`** in `payload.config.ts` keeps the panel dark (login + dashboard).
- **Log out**
  - **Sidebar:** Payload’s default control is a small icon next to **settings** at the bottom of the nav. This project also adds a clear **“Log out”** text link via **`admin.components.afterNavLinks`** → **`components/msc-payload-nav-logout.tsx`** (styles in **`app/(payload)/custom.scss`**).
  - **Direct URL:** **`/admin/logout`** (full URL e.g. `http://localhost:3000/admin/logout`).
  - **Import map:** Custom admin components are registered in **`app/(payload)/admin/importMap.js`**. If you add more Payload UI components referenced by string path in `payload.config.ts`, either run **`npx payload generate:importmap`** (when the CLI resolves your config) or merge entries manually using the same `path#ExportName` key pattern.
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

**Globals**

- **`homepage`** — hero slides + optional stats (see above). Each slide now includes a per-slide `seo` group (`title`, `description`, `OpenGraph image`) for metadata control directly in the Homepage screen.
- **`site-settings`** — site name/tagline for SEO metadata, plus centralized notification controls under a dedicated Notifications tab (`enableAdminNotifications`, `notificationEmails`, `adminFallbackEmail`, `systemFromEmail`).
- **`projects-home`** — Projects moved to a Site global with draggable row items (`projectItems`) to match Homepage editing UX. Frontend demos now read from this global instead of a collection.
- **`header`** — nav items support nested submenu rows in admin (collapsed by default), and desktop/mobile header rendering supports dropdown links again.

---

## Changelog (major fixes / decisions)

| Date | Summary |
|------|---------|
| 2026-04-07 | **Schedule a Call** — centralised booking URL; dialog UX. |
| 2026-04-08 | **Turbopack / static serve** — documented build + serve workaround when using static export (pre-Payload). |
| 2026-04-08 | **Payload integration** — `withPayload`, `app/(payload)`, SQLite, `bookings` collection, booking POST from site, `(site)` route group for marketing. Static export removed; use `next start` or hosted Node. |
| 2026-04-08 | **Webpack dev** — `dev` / `dev:payload` use `next dev --webpack`; default Turbopack dev broke chunks and `/admin` on Windows. |
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

---

## Maintenance tips

- Regenerate types after collection changes: `npx payload generate:types` (optional).
- For subdirectory hosting later, set `basePath` / `assetPrefix` and update URLs here + Run-Next-JS.
- Keep this file short; link to **Site-Plans.md** for CMS vs WP tradeoffs.
