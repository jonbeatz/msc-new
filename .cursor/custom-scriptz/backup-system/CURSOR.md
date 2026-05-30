# CURSOR — Install `backup-system`

## When to use

- Operator says **`install backup module`** or **`install backup-system`**
- Enabling **`backup project`** on a personal repo

## Agent procedure (install)

1. Read [module.manifest.json](module.manifest.json).
2. Run from repo root:

   ```powershell
   .\.cursor\custom-scriptz\backup-system\install.ps1
   ```

3. Merge `env.example.fragment` (installer adds `MSC_BACKUP_ROOT` comment if missing).
4. Optional: set `MSC_BACKUP_ROOT` in `.env.local`.
5. If target has `.cursor/rules/global.mdc`, merge rows from [global.mdc.fragment](global.mdc.fragment) (shortcuts + backup ritual pointer).
6. Smoke: `npm run msc:backup -- --standard install-smoke-test --yes --note "module install smoke"` (operator deletes test folder after).

## Backup ritual (`backup project`)

Follow this flow **one question at a time**. In Vader Engine, same steps live in `.cursor/rules/global.mdc`.

### Step 1 — Type

Ask: `What type of backup? (1 = Standard / 2 = Full)`

**Standard skips only** (never list includes in this step): `node_modules`, `.next`, `logs`, `test-results`

### Step 2 — Destination

Ask: `Destination drive? (1 = Same G: drive / 2 = Different)`

### Step 3 — Folder

Scan destination for existing backups; suggest next name (e.g. `Vader-Engine-v1-v` → `v1-w`).

Ask: `Folder name? (1 = Use [suggested] / 2 = Enter custom)`

### Step 4 — Summary

Show (skips only on Type line):

```text
Backup Summary:
- Type: Standard (skips node_modules, .next, logs, test-results)
- Destination: [path]
- Folder: [name]
```

Optional: keep G: backups private. **Do not confirm yet.**

### Step 5 — Note

Ask: `Add a note about this backup? (optional — type your note, or press Enter to skip)`

### Step 6 — Confirm

Ask: `Confirm backup? (1 = Yes / 2 = No)`

### Step 7 — Run

If Yes, from repo root:

```bash
npm run msc:backup -- --standard [folder-name] --yes --note "[user note]"
```

Use `--full` when Step 1 was Full. **Omit `--note`** if the operator skipped the note.

Example:

```bash
npm run msc:backup -- --standard Vader-Engine-v1-v --yes --note "Added backup notes feature"
```

Set `MSC_BACKUP_ROOT` in environment or `.env.local` when destination is not the default G: path.

### Step 8 — Report

Report backup path and `.cursor/BackUp-Notez.md` inside the backup folder.

## Report (install)

```text
✅ backup-system installed
📂 scripts/msc-backup.mjs
📦 msc:backup, msc:backup:standard, msc:backup:full
📝 BackUp-Notez.md written per backup (see README.md)
```
