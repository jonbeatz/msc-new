# book-consultation — portable installer (personal dev profile)
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
Write-Host "Book-Consultation Module Installer" -ForegroundColor Cyan
Write-Host "--------------------------------" -ForegroundColor Cyan

$RepoRoot = Resolve-MscRepoRoot -ModuleRoot $ModuleRoot -ProjectRoot $ProjectRoot
Write-Host "Target: $RepoRoot"
Write-Host ""

# Step 1: Copy Collections
Write-Host "[1] Copying Payload Collection..." -ForegroundColor Yellow
$collectionSrc = Join-Path $ModuleRoot "collections\Bookings.ts"
$collectionDest = Join-Path $RepoRoot "collections\Bookings.ts"
if ($WhatIf) {
  Write-Host "[WhatIf] Copy collections/Bookings.ts"
} elseif ((Test-Path $collectionDest) -and -not $Force) {
  Write-Host "  Skip: collections/Bookings.ts already exists (use -Force to overwrite)"
} else {
  New-Item -ItemType Directory -Force -Path (Split-Path $collectionDest -Parent) | Out-Null
  Copy-Item $collectionSrc $collectionDest -Force
  Write-Host "  Copied collections/Bookings.ts"
}

# Step 2: Copy Libraries & Email Templates
Write-Host "[2] Copying Libraries and Email Templates..." -ForegroundColor Yellow
$libFiles = @(
  "lib\booking.ts",
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
  "components\book-consultation-context.tsx",
  "components\book-consultation-lightbox.tsx"
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

# Step 4: Config
Write-Host "[4] Config..." -ForegroundColor Yellow
$configSrc = Join-Path $ModuleRoot "config\book-consultation.config.json"
$configDest = Join-Path $RepoRoot "config\book-consultation.config.json"
if ($WhatIf) {
  Write-Host "[WhatIf] Copy config/book-consultation.config.json"
} elseif ((Test-Path $configDest) -and -not $Force) {
  Write-Host "  Skip: config/book-consultation.config.json already exists"
} else {
  New-Item -ItemType Directory -Force -Path (Split-Path $configDest -Parent) | Out-Null
  Copy-Item $configSrc $configDest -Force
  Write-Host "  Copied config/book-consultation.config.json"
}

# Step 5: Merge .env.example
Write-Host "[5] .env.example..." -ForegroundColor Yellow
Merge-MscEnvFragment -RepoRoot $RepoRoot -ModuleRoot $ModuleRoot -MarkerKey "RESEND_API_KEY" -WhatIf:$WhatIf

# Step 6: Merge package.json
Write-Host "[6] package.json..." -ForegroundColor Yellow
Merge-MscPackageJson -RepoRoot $RepoRoot -MergeFilePath (Join-Path $ModuleRoot "package-scripts.json") -WhatIf:$WhatIf

# Step 7: Post-Install Checks
Write-Host ""
Write-Host "Verification & Integration Guidance" -ForegroundColor Cyan
$checks = @(
  "collections\Bookings.ts",
  "lib\booking.ts",
  "components\book-consultation-lightbox.tsx"
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
Write-Host "  1) Open payload.config.ts and verify/add 'Bookings' to collections array:" -ForegroundColor DarkGray
Write-Host "     import { Bookings } from './collections/Bookings'" -ForegroundColor DarkGray
Write-Host "     collections: [ ..., Bookings ]" -ForegroundColor DarkGray
Write-Host "  2) Ensure payload.config.ts has a Resend Email Adapter configured:" -ForegroundColor DarkGray
Write-Host "     import { resendAdapter } from '@payloadcms/email-resend'" -ForegroundColor DarkGray
Write-Host "     email: resendAdapter({ defaultFromAddress: 'onboarding@resend.dev', defaultFromName: 'My Studio Channel', apiKey: process.env.RESEND_API_KEY || '' })" -ForegroundColor DarkGray
Write-Host "  3) Add BookConsultationProvider to your Root Layout (app/(site)/layout.tsx):" -ForegroundColor DarkGray
Write-Host "     import { BookConsultationProvider } from '@/components/book-consultation-context'" -ForegroundColor DarkGray
Write-Host "     wrap your app with <BookConsultationProvider>...</BookConsultationProvider>" -ForegroundColor DarkGray
Write-Host "  4) Trigger the modal on any pricing or call-to-action button:" -ForegroundColor DarkGray
Write-Host "     const { openBookConsultation } = useBookConsultation()" -ForegroundColor DarkGray
Write-Host "     <button onClick={() => openBookConsultation({ interestedPackage: 'Pro Studio' })}>Book Now</button>" -ForegroundColor DarkGray

Write-Host ""
Write-Host "Installation complete!" -ForegroundColor Green
Write-Host ""
