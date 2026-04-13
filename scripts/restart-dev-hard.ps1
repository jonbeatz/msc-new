# Local (repo root): free port 3000, deep clean, full production build, then dev on 3000.
# Use when `vendor-chunks/*.js` is missing or `/_next/static/*` returns 404 in development.
$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

$port = 3000
Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | ForEach-Object {
  $procId = $_.OwningProcess
  if ($procId -and $procId -ne $PID) {
    Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
    Write-Host "Stopped PID $procId on port $port"
  }
}

npm run clean:next
npm run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Starting dev on http://localhost:$port — wait until the terminal shows 'Compiled' before opening the browser." -ForegroundColor Cyan
npm run dev:fresh
