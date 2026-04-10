# Safe one-shot deploy:
# 1) verify local health
# 2) run pushit:live pipeline
#
# Usage: npm run pushit:live:safe
$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

Write-Host ""
Write-Host "pushit:live:safe - preflight npm run verify:local" -ForegroundColor Yellow
npm run verify:local
if ($LASTEXITCODE -ne 0) {
  Write-Host "Preflight failed. Aborting deploy." -ForegroundColor Red
  exit $LASTEXITCODE
}

Write-Host ""
Write-Host "pushit:live:safe - deploy npm run pushit:live" -ForegroundColor Yellow
npm run pushit:live
exit $LASTEXITCODE
