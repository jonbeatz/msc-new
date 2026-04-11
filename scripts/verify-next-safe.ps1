# Local (Cursor / repo root): free port 3000, then npm run verify:next
# Use this instead of raw verify:next when next dev might still be running — running verify
# deletes .next under a live dev server and causes 500 + /_next/static/chunks/fallback/* errors.
$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

$port = 3000
Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | ForEach-Object {
  $procId = $_.OwningProcess
  if ($procId -and $procId -ne $PID) {
    Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
    Write-Host "Stopped PID $procId on port $port (so verify:next does not corrupt a running dev server)." -ForegroundColor Yellow
  }
}

npm run verify:next
