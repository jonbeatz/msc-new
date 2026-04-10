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
| **RP-2026-04-08-hero-media-relinked** | 2026-04-08 | **Hero migration finalized:** Homepage global now contains **5 slides** (the original 4 defaults + current custom slide). The 4 original slides were mapped to real `Media` entries sourced from `public/images` (`tv-wall.jpg`, `show-cards.jpg`, `on-air.jpg`, `creator-solo.jpg`) via a one-time local migration script, then script removed. |
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
- `globals/Homepage.ts`, `globals/SiteSettings.ts`
- `collections/Leads.ts`, `collections/Media.ts`
- `components/contact-section.tsx`
- `globals/Header.ts`
- `globals/Homepage.ts`
- `collections/Pages.ts`, `collections/HeroSlides.ts`
- `collections/Bookings.ts`
- `lib/cms/*`
- `lib/booking.ts`
- `app/(site)/page.tsx`, `app/(site)/layout.tsx`
- `components/contact-section.tsx`
- `components/hero-section.tsx`
- `next.config.mjs` (image `remotePatterns` for localhost)

---

*Append a new row when you create the next restore point.*
