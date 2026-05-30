# schedule-a-call — portable installer (personal dev profile)
param(
  [string]$ProjectRoot,
  [switch]$Force,
  [switch]$WhatIf,
  [switch]$SkipVerify
)

$ErrorActionPreference = "Stop"
$ModuleRoot = $PSScriptRoot
$LibPath = Join-Path (Split-Path $ModuleRoot -Parent) "_lib\Msc-ModuleInstall.ps1"
. $LibPath

Write-Host ""
Write-Host "Schedule-A-Call Module Installer" -ForegroundColor Cyan
Write-Host "--------------------------------" -ForegroundColor Cyan

$RepoRoot = Resolve-MscRepoRoot -ModuleRoot $ModuleRoot -ProjectRoot $ProjectRoot
Write-Host "Target: $RepoRoot"
Write-Host ""

# Step 1: Copy Collections (Option B: Standalone collection)
Write-Host "[1] Copying Standalone Collection Schema (Option B)..." -ForegroundColor Yellow
$collectionSrc = Join-Path $ModuleRoot "collections\CallRequests.ts"
$collectionDest = Join-Path $RepoRoot "collections\CallRequests.ts"
if ($WhatIf) {
  Write-Host "[WhatIf] Copy collections/CallRequests.ts"
} elseif ((Test-Path $collectionDest) -and -not $Force) {
  Write-Host "  Skip: collections/CallRequests.ts already exists"
} else {
  New-Item -ItemType Directory -Force -Path (Split-Path $collectionDest -Parent) | Out-Null
  Copy-Item $collectionSrc $collectionDest -Force
  Write-Host "  Copied collections/CallRequests.ts"
}

# Step 2: Copy Libraries & Email Templates
Write-Host "[2] Copying Libraries and Email Templates..." -ForegroundColor Yellow
$libFiles = @(
  "lib\call-request.ts",
  "lib\same-origin-api.ts",
  "lib\site-origin-defaults.ts",
  "lib\public-origin.ts",
  "lib\notifications.ts",
  "lib\email-brand.ts",
  "lib\email-templates\email-templates.ts"
)

foreach ($file in $libFiles) {
  $src = Join-Path $ModuleRoot $file
  $dest = Join-Path $RepoRoot $file
  if ($WhatIf) {
    Write-Host "[WhatIf] Copy $file"
  } elseif ((Test-Path $dest) -and -not $Force) {
    Write-Host "  Skip: $file already exists (use -Force to overwrite)"
  } else {
    New-Item -ItemType Directory -Force -Path (Split-Path $dest -Parent) | Out-Null
    Copy-Item $src $dest -Force
    Write-Host "  Copied $file"
  }
}

# Step 3: Copy Frontend Lightbox Components
Write-Host "[3] Copying Frontend Components..." -ForegroundColor Yellow
$compFiles = @(
  "components\schedule-a-call-lightbox.tsx"
)

foreach ($file in $compFiles) {
  $src = Join-Path $ModuleRoot $file
  $dest = Join-Path $RepoRoot $file
  if ($WhatIf) {
    Write-Host "[WhatIf] Copy $file"
  } elseif ((Test-Path $dest) -and -not $Force) {
    Write-Host "  Skip: $file already exists (use -Force to overwrite)"
  } else {
    New-Item -ItemType Directory -Force -Path (Split-Path $dest -Parent) | Out-Null
    Copy-Item $src $dest -Force
    Write-Host "  Copied $file"
  }
}

# Step 4: Merge .env.example
Write-Host "[4] .env.example..." -ForegroundColor Yellow
Merge-MscEnvFragment -RepoRoot $RepoRoot -ModuleRoot $ModuleRoot -MarkerKey "RESEND_API_KEY" -WhatIf:$WhatIf

# Step 5: Merge package.json
Write-Host "[5] package.json..." -ForegroundColor Yellow
Merge-MscPackageJson -RepoRoot $RepoRoot -MergeFilePath (Join-Path $ModuleRoot "package-scripts.json") -WhatIf:$WhatIf

# Step 6: Post-Install Checks
Write-Host ""
Write-Host "Verification & Integration Guidance" -ForegroundColor Cyan
$checks = @(
  "collections\CallRequests.ts",
  "lib\call-request.ts",
  "components\schedule-a-call-lightbox.tsx"
)
$fail = $false
foreach ($c in $checks) {
  $p = Join-Path $RepoRoot $c
  if (Test-Path $p) {
    Write-Host "  OK $c" -ForegroundColor Green
  } else {
    Write-Host "  FAIL $c" -ForegroundColor Red
    $fail = $true
  }
}

if ($fail) {
  Write-Host ""
  Write-Host "Installation completed with missing files!" -ForegroundColor Red
  exit 1
}

# Payload Config post-install Resend adapter and collections check
Write-Host ""
Write-Host "Payload CMS Manual Setup Checklist:" -ForegroundColor Yellow
Write-Host "Option A (Reuse 'Bookings' Collection):" -ForegroundColor Cyan
Write-Host "  1) Make sure 'Bookings' is registered under payload.config.ts" -ForegroundColor DarkGray
Write-Host "  2) Pass useBookingsOption={true} to ScheduleACallLightbox:" -ForegroundColor DarkGray
Write-Host "     <ScheduleACallLightbox useBookingsOption={true} />" -ForegroundColor DarkGray
Write-Host "  3) The booking record will be stored in Bookings with source='schedule-call'" -ForegroundColor DarkGray

Write-Host ""
Write-Host "Option B (Use Standalone 'CallRequests' Collection):" -ForegroundColor Cyan
Write-Host "  1) Open payload.config.ts and register 'CallRequests' to collections array:" -ForegroundColor DarkGray
Write-Host "     import { CallRequests } from './collections/CallRequests'" -ForegroundColor DarkGray
Write-Host "     collections: [ ..., CallRequests ]" -ForegroundColor DarkGray
Write-Host "  2) Render lightbox directly (uses CallRequests by default):" -ForegroundColor DarkGray
Write-Host "     <ScheduleACallLightbox />" -ForegroundColor DarkGray

Write-Host ""
Write-Host "General Email Integration (Required):" -ForegroundColor Cyan
Write-Host "  Ensure payload.config.ts has a Resend Email Adapter configured:" -ForegroundColor DarkGray
Write-Host "  apiKey: process.env.RESEND_API_KEY" -ForegroundColor DarkGray

Write-Host ""
Write-Host "Installation complete!" -ForegroundColor Green
Write-Host ""
