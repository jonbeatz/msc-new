# Contributing

## Workflow

1. Pull latest `main`
2. Create a feature branch
3. Make focused changes
4. Run checks:
   - `npm run build`
   - `npm run lint`
5. Commit with clear message
6. Open PR / merge to `main`

## Project notes

- Dev server should use Webpack scripts:
  - `npm run dev`
  - `npm run dev:payload`
- Payload admin/API is embedded in this app (`/admin`, `/api/*`)
- Do not commit secrets (`.env.local`, credentials)
- Project **`.cursor/mcp.json`** uses placeholders only — run **`npm run sync:mcp-env`** after setting **`.env.local`**; never commit real tokens
- Keep docs in `.cursor/docs` updated when architecture or workflow changes

## Restore checkpoints

When landing major milestones:
- append a row in `.cursor/docs/Restore-Points.md`
- add a short entry in `.cursor/docs/ReCall.md`
