# Shared helpers for custom-scriptz module installers (personal / portable)

function Resolve-MscRepoRoot {
  param(
    [string]$ModuleRoot,
    [string]$ProjectRoot
  )
  if ($ProjectRoot) {
    return (Resolve-Path $ProjectRoot).Path
  }
  $cwd = Get-Location
  if (Test-Path (Join-Path $cwd "package.json")) {
    return $cwd.Path
  }
  $fromModule = Join-Path $ModuleRoot "..\..\.."
  if (Test-Path (Join-Path $fromModule "package.json")) {
    return (Resolve-Path $fromModule).Path
  }
  throw "Could not resolve repo root. Run from project root or pass -ProjectRoot."
}

function Merge-MscPackageJson {
  param(
    [string]$RepoRoot,
    [string]$MergeFilePath,
    [switch]$WhatIf
  )
  $pkgPath = Join-Path $RepoRoot "package.json"
  if (-not ((Test-Path $pkgPath) -and (Test-Path $MergeFilePath))) { return }
  if ($WhatIf) {
    Write-Host "[WhatIf] Merge package-scripts.json into package.json"
    return
  }
  node -e @"
import fs from 'node:fs';
const r = process.argv[1];
const m = process.argv[2];
const pkg = JSON.parse(fs.readFileSync(r + '/package.json', 'utf8'));
const merge = JSON.parse(fs.readFileSync(m, 'utf8'));
if (merge.scripts) Object.assign(pkg.scripts, merge.scripts);
if (merge.dependencies) {
  pkg.dependencies = pkg.dependencies || {};
  Object.assign(pkg.dependencies, merge.dependencies);
}
fs.writeFileSync(r + '/package.json', JSON.stringify(pkg, null, 2) + '\n');
const n = merge.scripts ? Object.keys(merge.scripts).length : 0;
console.log('[install] merged package.json (' + n + ' scripts)');
"@ $RepoRoot $MergeFilePath
}

function Merge-MscEnvFragment {
  param(
    [string]$RepoRoot,
    [string]$ModuleRoot,
    [string]$MarkerKey = "MSC_LITELLM_PORT",
    [switch]$WhatIf
  )
  $candidates = @(
    (Join-Path $ModuleRoot "env.example.fragment"),
    (Join-Path $ModuleRoot ".env.example.fragment")
  )
  $fragmentPath = $candidates | Where-Object { Test-Path $_ } | Select-Object -First 1
  if (-not $fragmentPath) { return }

  $envTarget = Join-Path $RepoRoot ".env.example"
  $fragmentContent = Get-Content $fragmentPath -Raw
  if ($WhatIf) {
    Write-Host "[WhatIf] Merge env fragment into .env.example"
    return
  }
  if (Test-Path $envTarget) {
    $current = Get-Content $envTarget -Raw
    if ($current -notmatch [regex]::Escape($MarkerKey)) {
      Add-Content -Path $envTarget -Value "`n$fragmentContent"
      Write-Host "Added keys to .env.example (marker: $MarkerKey)"
    } else {
      Write-Host "Skip: .env.example already has $MarkerKey"
    }
  } else {
    Set-Content -Path $envTarget -Value $fragmentContent.TrimEnd()
    Write-Host "Created .env.example from fragment"
  }
}

function Install-MscPrerequisites {
  param(
    [string]$RepoRoot,
    [string]$PrereqRoot,
    [switch]$WhatIf
  )
  if (-not (Test-Path $PrereqRoot)) { return }

  $loadEnvDest = Join-Path $RepoRoot "scripts\lib\msc-load-env.mjs"
  $killPortDest = Join-Path $RepoRoot "scripts\msc-kill-dev-port.mjs"
  $loadEnvSrc = Join-Path $PrereqRoot "scripts\lib\msc-load-env.mjs"
  $killPortSrc = Join-Path $PrereqRoot "scripts\msc-kill-dev-port.mjs"

  foreach ($pair in @(
    @{ Src = $loadEnvSrc; Dest = $loadEnvDest; Label = "scripts/lib/msc-load-env.mjs" },
    @{ Src = $killPortSrc; Dest = $killPortDest; Label = "scripts/msc-kill-dev-port.mjs" }
  )) {
    if (-not (Test-Path $pair.Src)) { continue }
    if (Test-Path $pair.Dest) {
      Write-Host "Skip prerequisite (exists): $($pair.Label)"
      continue
    }
    if ($WhatIf) {
      Write-Host "[WhatIf] Copy $($pair.Label)"
      continue
    }
    $parent = Split-Path $pair.Dest -Parent
    if (-not (Test-Path $parent)) { New-Item -ItemType Directory -Force -Path $parent | Out-Null }
    Copy-Item $pair.Src $pair.Dest -Force
    Write-Host "Copied prerequisite: $($pair.Label)"
  }

  $depsOnly = Join-Path $PrereqRoot "package-scripts.json"
  if (Test-Path $depsOnly) {
    Merge-MscPackageJson -RepoRoot $RepoRoot -MergeFilePath $depsOnly -WhatIf:$WhatIf
  }
}
