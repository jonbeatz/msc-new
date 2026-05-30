# backup-system — portable installer (personal dev profile)
param(
  [string]$ProjectRoot,
  [switch]$WhatIf,
  [switch]$SkipVerify
)

$ErrorActionPreference = "Stop"
$ModuleRoot = $PSScriptRoot
$LibPath = Join-Path (Split-Path $ModuleRoot -Parent) "_lib\Msc-ModuleInstall.ps1"
. $LibPath

Write-Host ""
Write-Host "Backup System Module Installer" -ForegroundColor Cyan
Write-Host "------------------------------" -ForegroundColor Cyan

$RepoRoot = Resolve-MscRepoRoot -ModuleRoot $ModuleRoot -ProjectRoot $ProjectRoot
Write-Host "Target: $RepoRoot"
Write-Host ""

# Prerequisites for msc-backup.mjs
$prereqRoot = Join-Path (Split-Path $ModuleRoot -Parent) "google-api-proxy\prerequisites"
if (Test-Path $prereqRoot) {
  Write-Host "[0] Prerequisites..." -ForegroundColor Yellow
  Install-MscPrerequisites -RepoRoot $RepoRoot -PrereqRoot $prereqRoot -WhatIf:$WhatIf
}

Write-Host "[1] scripts/msc-backup.mjs..." -ForegroundColor Yellow
$src = Join-Path $ModuleRoot "scripts\msc-backup.mjs"
$dest = Join-Path $RepoRoot "scripts\msc-backup.mjs"
if ($WhatIf) {
  Write-Host "[WhatIf] $dest"
} else {
  New-Item -ItemType Directory -Force -Path (Split-Path $dest -Parent) | Out-Null
  Copy-Item $src $dest -Force
  Write-Host "  Copied scripts/msc-backup.mjs"
}

Write-Host "[2] .env.example..." -ForegroundColor Yellow
Merge-MscEnvFragment -RepoRoot $RepoRoot -ModuleRoot $ModuleRoot -MarkerKey "MSC_BACKUP_ROOT" -WhatIf:$WhatIf

Write-Host "[3] package.json..." -ForegroundColor Yellow
Merge-MscPackageJson -RepoRoot $RepoRoot -MergeFilePath (Join-Path $ModuleRoot "package-scripts.json") -WhatIf:$WhatIf

Write-Host ""
Write-Host "Verify" -ForegroundColor Cyan
if (Test-Path $dest) {
  Write-Host "  OK scripts/msc-backup.mjs" -ForegroundColor Green
} else {
  Write-Host "  FAIL scripts/msc-backup.mjs" -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "Installation complete." -ForegroundColor Green
Write-Host "Default backup root prompt: G:\Cursor_Project_BackUpz (override MSC_BACKUP_ROOT in .env.local)"
Write-Host "Standard skips: node_modules, .next, logs, test-results"
Write-Host "BackUp-Notez.md per backup; agent ritual: CURSOR.md (8 steps, --note on run)"
Write-Host "Merge global.mdc.fragment for backup project shortcuts (optional)"
Write-Host ""
