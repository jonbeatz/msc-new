# stay-in-the-loop — portable installer (personal dev profile)
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
Write-Host "Stay-In-The-Loop Module Installer" -ForegroundColor Cyan
Write-Host "--------------------------------" -ForegroundColor Cyan

$RepoRoot = Resolve-MscRepoRoot -ModuleRoot $ModuleRoot -ProjectRoot $ProjectRoot
Write-Host "Target: $RepoRoot"
Write-Host ""

# Step 1: Copy Collections
Write-Host "[1] Copying Payload Collection..." -ForegroundColor Yellow
$collectionSrc = Join-Path $ModuleRoot "collections\Leads.ts"
$collectionDest = Join-Path $RepoRoot "collections\Leads.ts"
if ($WhatIf) {
  Write-Host "[WhatIf] Copy collections/Leads.ts"
} elseif ((Test-Path $collectionDest) -and -not $Force) {
  Write-Host "  Skip: collections/Leads.ts already exists (use -Force to overwrite)"
} else {
  New-Item -ItemType Directory -Force -Path (Split-Path $collectionDest -Parent) | Out-Null
  Copy-Item $collectionSrc $collectionDest -Force
  Write-Host "  Copied collections/Leads.ts"
}

# Step 2: Copy Libraries & Email Templates
Write-Host "[2] Copying Libraries and Email Templates..." -ForegroundColor Yellow
$libFiles = @(
  "lib\same-origin-api.ts",
  "lib\site-origin-defaults.ts",
  "lib\public-origin.ts",
  "lib\notifications.ts",
  "lib\email-brand.ts",
  "lib\payload-auth-delete-preflight.ts",
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
  "components\stay-in-the-loop-lightbox.tsx"
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
  "collections\Leads.ts",
  "components\stay-in-the-loop-lightbox.tsx"
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
Write-Host "  1) Open payload.config.ts and register 'Leads' to collections array:" -ForegroundColor DarkGray
Write-Host "     import { Leads } from './collections/Leads'" -ForegroundColor DarkGray
Write-Host "     collections: [ ..., Leads ]" -ForegroundColor DarkGray
Write-Host "  2) Ensure payload.config.ts has a Resend Email Adapter configured:" -ForegroundColor DarkGray
Write-Host "     import { resendAdapter } from '@payloadcms/email-resend'" -ForegroundColor DarkGray
Write-Host "     email: resendAdapter({ defaultFromAddress: 'onboarding@resend.dev', defaultFromName: 'My Studio Channel', apiKey: process.env.RESEND_API_KEY || '' })" -ForegroundColor DarkGray
Write-Host "  3) Import and place StayInTheLoopLightbox in your page or footer component:" -ForegroundColor DarkGray
Write-Host "     import { StayInTheLoopLightbox } from '@/components/stay-in-the-loop-lightbox'" -ForegroundColor DarkGray
Write-Host "     replace the legacy newsletter button/trigger with <StayInTheLoopLightbox />" -ForegroundColor DarkGray

Write-Host ""
Write-Host "Installation complete!" -ForegroundColor Green
Write-Host ""
