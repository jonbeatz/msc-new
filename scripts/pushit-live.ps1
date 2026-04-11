# Tier 2 / master deploy: production build + FTPS admin-ui bundle + full .next + local dev:fresh
# Run from repo root: npm run pushit:live
$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

Write-Host ""
Write-Host "pushit:live - 1/3 npm run build" -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ""
Write-Host "pushit:live - 2/3 npm run pushitup:admin-ui" -ForegroundColor Yellow
npm run pushitup:admin-ui
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ""
Write-Host "pushit:live - 3/3 npm run pushitup -- .next" -ForegroundColor Yellow
npm run pushitup -- .next
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ""
Write-Host "pushit:live - 4/4 npm run dev:fresh (reset local after production build/upload)" -ForegroundColor Yellow
npm run dev:fresh
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ""
Write-Host "=== Upload + local reset finished. ===" -ForegroundColor Cyan
Write-Host "In cPanel: Setup Node.js App - Restart mystudiochannel.com (Stop, wait a few seconds, then Start)." -ForegroundColor Cyan
Write-Host "Test: https://mystudiochannel.com/admin in Incognito." -ForegroundColor Cyan
Write-Host ""
