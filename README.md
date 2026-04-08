# MSC Next + Payload CMS

Next.js 16 marketing site with an embedded Payload CMS admin/API.

## Stack

- Next.js App Router (`next@16`)
- Payload CMS 3 (`payload`, `@payloadcms/next`)
- SQLite for local development (`payload.sqlite`)
- Tailwind CSS 4 + React 19

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create local env file:

```bash
copy .env.example .env.local
```

3. Start dev server (Webpack mode):

```bash
npm run dev:payload
```

4. Open:
- Site: `http://localhost:3000/`
- Admin: `http://localhost:3000/admin`

On first run, create your admin user in Payload.

## Useful routes

- Admin dashboard: `/admin`
- Admin logout: `/admin/logout`
- Payload REST API: `/api/*`
- GraphQL: `/api/graphql`

## Data model

### Collections
- `users` (admin auth)
- `media` (uploads)
- `bookings` (schedule requests)
- `leads` (future marketing signups)

### Globals
- `homepage` (hero slides + optional stats)
- `site-settings` (site name + tagline for metadata)

## Homepage hero content workflow

1. Upload images in Admin -> `Media`
2. Edit Admin -> `Site` -> `Homepage`
3. Add/edit hero slides and save

If no CMS slides exist, the site falls back to hardcoded defaults in `components/hero-section.tsx`.

## Commands

- Dev: `npm run dev:payload`
- Build: `npm run build`
- Start (prod-like): `npm run start`
- Lint: `npm run lint`

## Docs

- `.cursor/docs/Development.md` - implementation notes and architecture
- `.cursor/docs/Run-Next-JS.md` - run/build instructions
- `.cursor/docs/Site-Plans.md` - backend/CMS planning notes
- `.cursor/docs/Restore-Points.md` - restore checkpoints
- `.cursor/docs/ReCall.md` - session memory log
