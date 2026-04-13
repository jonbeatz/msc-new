# Local (Cursor / repo root): free port 3000, clean Next cache, start dev on 3000.
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

Write-Host "Starting dev on http://localhost:$port (full clean + dev via npm run dev:fresh) ..." -ForegroundColor Cyan
npm run dev:fresh
