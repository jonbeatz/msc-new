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

### Files worth diffing from this checkpoint

- `payload.config.ts`
- `globals/Homepage.ts`, `globals/SiteSettings.ts`
- `collections/Leads.ts`, `collections/Media.ts`
- `components/contact-section.tsx`
- `lib/cms/*`
- `app/(site)/page.tsx`, `app/(site)/layout.tsx`
- `components/hero-section.tsx`
- `next.config.mjs` (image `remotePatterns` for localhost)

---

*Append a new row when you create the next restore point.*
