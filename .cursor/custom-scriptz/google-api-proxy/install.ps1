# google-api-proxy — portable installer (personal dev profile)
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
Write-Host "Google API Proxy Module Installer" -ForegroundColor Cyan
Write-Host "--------------------------------" -ForegroundColor Cyan

$RepoRoot = Resolve-MscRepoRoot -ModuleRoot $ModuleRoot -ProjectRoot $ProjectRoot
Write-Host "Target: $RepoRoot"
Write-Host ""

# Step 0: Prerequisites (only if missing)
Write-Host "[0] Prerequisites..." -ForegroundColor Yellow
$prereqRoot = Join-Path $ModuleRoot "prerequisites"
Install-MscPrerequisites -RepoRoot $RepoRoot -PrereqRoot $prereqRoot -WhatIf:$WhatIf

# Step 1: Scripts
Write-Host "[1] Scripts..." -ForegroundColor Yellow
$scriptSrc = Join-Path $ModuleRoot "scripts"
$scriptDest = Join-Path $RepoRoot "scripts"
if ($WhatIf) {
  Write-Host "[WhatIf] Copy scripts/* and scripts/lib/*"
} else {
  New-Item -ItemType Directory -Force -Path $scriptDest, (Join-Path $scriptDest "lib") | Out-Null
  Get-ChildItem $scriptSrc -File | ForEach-Object {
    Copy-Item $_.FullName (Join-Path $scriptDest $_.Name) -Force
    Write-Host "  Copied scripts/$($_.Name)"
  }
  $libSrc = Join-Path $scriptSrc "lib"
  if (Test-Path $libSrc) {
    Get-ChildItem $libSrc -File | ForEach-Object {
      Copy-Item $_.FullName (Join-Path $scriptDest "lib\$($_.Name)") -Force
      Write-Host "  Copied scripts/lib/$($_.Name)"
    }
  }
}

# Step 2: Config
Write-Host "[2] Config..." -ForegroundColor Yellow
$configDest = Join-Path $RepoRoot "config\litellm_config.yaml"
$configExample = Join-Path $ModuleRoot "config\litellm_config.example.yaml"
if ($WhatIf) {
  Write-Host "[WhatIf] config/litellm_config.yaml"
} elseif ((Test-Path $configDest) -and -not $Force) {
  Write-Host "  Skip: config/litellm_config.yaml exists (use -Force to overwrite)"
} elseif (Test-Path $configExample) {
  New-Item -ItemType Directory -Force -Path (Join-Path $RepoRoot "config") | Out-Null
  Copy-Item $configExample $configDest -Force
  Write-Host "  Created config/litellm_config.yaml (edit GCP project + master_key)"
}

$gcpExample = Join-Path $ModuleRoot "config\gcp-service-account.example.json"
$gcpDest = Join-Path $RepoRoot "config\gcp-service-account.json"
if ((Test-Path $gcpExample) -and -not (Test-Path $gcpDest) -and -not $WhatIf) {
  Copy-Item $gcpExample $gcpDest -Force
  Write-Host "  Created config/gcp-service-account.json placeholder (replace with real key)"
}

# Step 3: google-api runtime (ngrok + launcher)
Write-Host "[3] google-api runtime..." -ForegroundColor Yellow
$gaDest = Join-Path $RepoRoot "google-api"
if (-not $WhatIf) { New-Item -ItemType Directory -Force -Path $gaDest | Out-Null }
$ngrokOk = $false
foreach ($name in @("ngrok.exe", "ngrok")) {
  $src = Join-Path $ModuleRoot "google-api\$name"
  $dest = Join-Path $gaDest $name
  if (Test-Path $src) {
    if ($WhatIf) {
      Write-Host "[WhatIf] google-api/$name"
    } else {
      Copy-Item $src $dest -Force
      Write-Host "  Copied google-api/$name"
      $ngrokOk = $true
    }
  }
}
Get-ChildItem (Join-Path $ModuleRoot "google-api") -File -ErrorAction SilentlyContinue | ForEach-Object {
  if ($_.Name -match '^ngrok') { return }
  if ($_.Name -eq 'README.md') { return }
  $dest = Join-Path $gaDest $_.Name
  if ($WhatIf) { Write-Host "[WhatIf] google-api/$($_.Name)" }
  else { Copy-Item $_.FullName $dest -Force; Write-Host "  Copied google-api/$($_.Name)" }
}
if (-not $ngrokOk -and -not $WhatIf) {
  if (Test-Path (Join-Path $gaDest "ngrok.exe")) { $ngrokOk = $true }
}
if (-not $ngrokOk) {
  Write-Host "  WARN: ngrok.exe not in module or target - Cloud Agent needs ngrok or PATH" -ForegroundColor Yellow
  Write-Host "         https://ngrok.com/download -> google-api/ngrok.exe" -ForegroundColor DarkGray
}

# Step 4: .env.example
Write-Host "[4] .env.example..." -ForegroundColor Yellow
Merge-MscEnvFragment -RepoRoot $RepoRoot -ModuleRoot $ModuleRoot -MarkerKey "MSC_LITELLM_PORT" -WhatIf:$WhatIf

# Step 5: package.json scripts
Write-Host "[5] package.json..." -ForegroundColor Yellow
Merge-MscPackageJson -RepoRoot $RepoRoot -MergeFilePath (Join-Path $ModuleRoot "package-scripts.json") -WhatIf:$WhatIf

# Step 6: Verify
Write-Host ""
Write-Host "Verify" -ForegroundColor Cyan
$hardFail = $false
$checks = @(
  @{ Path = "scripts\msc-litellm-start.mjs"; Hard = $true },
  @{ Path = "config\litellm_config.yaml"; Hard = $true },
  @{ Path = "google-api\ngrok.exe"; Hard = $false }
)
foreach ($c in $checks) {
  $p = Join-Path $RepoRoot $c.Path
  if (Test-Path $p) {
    Write-Host "  OK $($c.Path)" -ForegroundColor Green
  } elseif ($c.Hard) {
    Write-Host "  FAIL $($c.Path)" -ForegroundColor Red
    $hardFail = $true
  } else {
    Write-Host "  WARN $($c.Path) (optional if ngrok on PATH)" -ForegroundColor Yellow
  }
}

$nodeModules = Join-Path $RepoRoot "node_modules"
if (-not $SkipVerify -and (Test-Path $nodeModules) -and -not $WhatIf) {
  Write-Host "  Running msc:litellm:preflight..." -ForegroundColor DarkGray
  Push-Location $RepoRoot
  try {
    npm run msc:litellm:preflight
    if ($LASTEXITCODE -ne 0) { $hardFail = $true }
  } finally {
    Pop-Location
  }
} elseif (-not $WhatIf) {
  Write-Host "  Skip runtime preflight (npm install first, or use -SkipVerify)" -ForegroundColor DarkGray
}

Write-Host ""
if ($hardFail) {
  Write-Host "Installation finished with errors." -ForegroundColor Red
  exit 1
}
Write-Host "Installation complete." -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1) Set GCP key + .env.local (NGROK_AUTHTOKEN, MSC_LITELLM_MASTER_KEY)"
Write-Host "  2) npm install  (if needed)"
Write-Host "  3) npm run msc:litellm:install-deps  (first-time Python)"
Write-Host "  4) npm run msc:google-api:start  then  msc:litellm:test:ngrok"
Write-Host "  5) Merge global.mdc.fragment into .cursor/rules/global.mdc (if new repo)"
Write-Host ""
