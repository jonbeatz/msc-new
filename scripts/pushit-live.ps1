# Tier 2 — Full build + FTPS "zero footprint" sync (code + local SQLite → live).
# Run from repo root: npm run pushit:live
#
# Steps: build → admin-ui bundle → .next → payload.sqlite → public/media → optional local dev:fresh (opt-in).
#
# ── REQUIRED cPanel steps (run IN THIS ORDER) ───────────────────────────────
#
# BEFORE running this script:
#   Live (cPanel UI): Node.js Selector → STOP APP
#   Live (cPanel → Terminal):
#     cd /home/wjehbnzcoy/mystudiochannel.com
#     rm -rf .next                              ← prevents stale webpack-runtime/vendor-chunks
#                                                  (FTP merges — old chunks survive without this)
#     rm -f payload.sqlite-wal payload.sqlite-shm  ← prevents old WAL journal overwriting new DB
#                                                     (SQLite replays WAL on open; skip this and
#                                                      the old data comes back after every upload)
#
# AFTER this script finishes uploading:
#   Live (cPanel → Terminal):
#     cd /home/wjehbnzcoy/mystudiochannel.com
#     sqlite3 ./payload.sqlite "UPDATE media SET url = '/media/' || filename;"
#     pkill -u $(whoami) node    ← stops any lingering Node process
#   Live (cPanel UI): Node.js Selector → START APP (wait 20-30 s)
# Verify: https://mystudiochannel.com/admin in Incognito (media library parity with local).
#
# ─────────────────────────────────────────────────────────────────────────────
#
# Warning: replacing payload.sqlite while Node still has the DB open can corrupt data.
# Stop the Node app in cPanel BEFORE this script runs, restart after upload completes.
$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

$dbFile = Join-Path $repoRoot "payload.sqlite"
if (-not (Test-Path -LiteralPath $dbFile)) {
  Write-Host ""
  Write-Host "pushit:live — ABORT: missing $dbFile (Tier 2 requires a local DB to ship)." -ForegroundColor Red
  Write-Host "Create/sync your local payload.sqlite first, then re-run npm run pushit:live" -ForegroundColor Yellow
  exit 1
}

Write-Host ""
Write-Host "pushit:live - 1/6 npm run build (NEXT_PUBLIC_SERVER_URL -> live origin for this step only)" -ForegroundColor Yellow
# `.env.local` usually sets NEXT_PUBLIC_SERVER_URL=http://localhost:3000. Next.js loads dotenv but does not
# overwrite existing process env — temporarily set the live origin so the production client bundle matches Spaceship.
$pushitSavedNextPublic = $env:NEXT_PUBLIC_SERVER_URL
$prodPublicUrl = "https://mystudiochannel.com"
if ($env:MSC_CANONICAL_SITE_ORIGIN -and $env:MSC_CANONICAL_SITE_ORIGIN.Trim().Length -gt 0) {
  $prodPublicUrl = $env:MSC_CANONICAL_SITE_ORIGIN.Trim().TrimEnd("/")
}
$env:NEXT_PUBLIC_SERVER_URL = $prodPublicUrl
try {
  npm run build
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} finally {
  if ($null -ne $pushitSavedNextPublic -and $pushitSavedNextPublic.Length -gt 0) {
    $env:NEXT_PUBLIC_SERVER_URL = $pushitSavedNextPublic
  } else {
    Remove-Item Env:\NEXT_PUBLIC_SERVER_URL -ErrorAction SilentlyContinue
  }
}

Write-Host ""
Write-Host "pushit:live - 2/6 npm run pushitup:admin-ui" -ForegroundColor Yellow
npm run pushitup:admin-ui
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ""
Write-Host "pushit:live - 3/6 npm run pushitup -- .next" -ForegroundColor Yellow
npm run pushitup -- .next
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ""
Write-Host "pushit:live - 4/6 npm run pushitup -- payload.sqlite" -ForegroundColor Yellow
npm run pushitup -- payload.sqlite
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ""
Write-Host "pushit:live - 5/6 npm run pushitup -- public/media" -ForegroundColor Yellow
npm run pushitup -- public/media
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ""
if ($env:PUSHIT_LIVE_RUN_DEV_FRESH -eq "1") {
  Write-Host "pushit:live - 6/6 npm run dev:fresh (PUSHIT_LIVE_RUN_DEV_FRESH=1)" -ForegroundColor Yellow
  npm run dev:fresh
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} else {
  Write-Host "pushit:live - 6/6 skipped (default). Local .next is a production build from step 1." -ForegroundColor Yellow
  Write-Host "  When ready: npm run dev (daily) or npm run dev:fresh (clean + dev — e.g. after deploy or chunk errors)." -ForegroundColor Gray
  Write-Host "  To auto-start dev after Tier 2 next time: `$env:PUSHIT_LIVE_RUN_DEV_FRESH = '1'; npm run pushit:live" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=== Tier 2 upload finished. ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps — Live (cPanel → Terminal):" -ForegroundColor Cyan
Write-Host "  cd /home/wjehbnzcoy/mystudiochannel.com" -ForegroundColor Gray
# sqlite3 hint: $sqlConcat avoids literal || (PS7+ tokenization); [char]34 is ASCII double-quote.
$sqlConcat = '||'
$sqlReminderInner = 'UPDATE media SET url = ''/media/'' ' + $sqlConcat + ' filename;'
$dquote = [char]34
Write-Host ('  sqlite3 ./payload.sqlite ' + $dquote + $sqlReminderInner + $dquote) -ForegroundColor Gray
Write-Host '  pkill -u $(whoami) node' -ForegroundColor Gray
Write-Host ""
Write-Host "Live (cPanel UI): Node.js Selector -> START APP  (wait 20-30 s)" -ForegroundColor Cyan
Write-Host 'Verify: https://mystudiochannel.com/admin in Incognito (media / pages parity).' -ForegroundColor Cyan
Write-Host ""
Write-Host "NOTE: If the site shows 500 after restart — stale .next on server." -ForegroundColor Yellow
Write-Host "  Fix: stop app → rm -rf .next → npm run pushitup -- .next → start app." -ForegroundColor Yellow
Write-Host "NOTE: If DB data looks wrong after restart — stale SQLite WAL on server." -ForegroundColor Yellow
Write-Host "  Fix: stop app → rm -f payload.sqlite-wal payload.sqlite-shm → npm run pushitup -- payload.sqlite → start app." -ForegroundColor Yellow
Write-Host ""
