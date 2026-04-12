# Tier 2 — Full build + FTPS "zero footprint" sync (code + local SQLite → live).
# Run from repo root: npm run pushit:live
#
# Steps: build → admin-ui bundle → .next → payload.sqlite → public/media → dev:fresh (local).
#
# Live (cPanel → Terminal), after upload — app path (matches .vscode/sftp.json remotePath):
#   cd /home/wjehbnzcoy/mystudiochannel.com
#   sqlite3 ./payload.sqlite "UPDATE media SET url = '/media/' || filename;"
#   pkill -u $(whoami) node
# Live (cPanel UI): Node.js Selector → RESTART mystudiochannel.com
# Verify: https://mystudiochannel.com/admin in Incognito (media library parity with local).
#
# Warning: replacing payload.sqlite while Node still has the DB open can corrupt data.
# Prefer stopping the Node app in cPanel before the new DB is read, or restart immediately after upload.
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
Write-Host "pushit:live - 1/6 npm run build" -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

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
Write-Host "pushit:live - 6/6 npm run dev:fresh (reset local after production build/upload)" -ForegroundColor Yellow
npm run dev:fresh
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ""
Write-Host "=== Tier 2 upload + local dev:fresh finished. ===" -ForegroundColor Cyan
Write-Host "Live (cPanel Terminal): cd /home/wjehbnzcoy/mystudiochannel.com" -ForegroundColor Cyan
# sqlite3 hint: $sqlConcat avoids literal || (PS7+ tokenization); [char]34 is ASCII double-quote.
$sqlConcat = '||'
$sqlReminderInner = 'UPDATE media SET url = ''/media/'' ' + $sqlConcat + ' filename;'
$dquote = [char]34
Write-Host ('  sqlite3 ./payload.sqlite ' + $dquote + $sqlReminderInner + $dquote) -ForegroundColor Gray
Write-Host '  pkill -u $(whoami) node' -ForegroundColor Gray
Write-Host 'Live (cPanel UI): Node.js Selector -> RESTART mystudiochannel.com' -ForegroundColor Cyan
Write-Host 'Verify: https://mystudiochannel.com/admin in Incognito (media / pages parity).' -ForegroundColor Cyan
Write-Host ""
