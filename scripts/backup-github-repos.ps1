# Backup all jonbeatz GitHub repos: clone + bundle
$ErrorActionPreference = "Continue"
$Base = "D:\Cursor_Projectz\MSC_Clean_v2\msc-new\.cursor\GitHub-Repo-BackUps"
$User = "jonbeatz"
$Report = @()

if (-not (Test-Path $Base)) {
    New-Item -ItemType Directory -Path $Base -Force | Out-Null
}

$reposJson = gh repo list $User --limit 200 --json name,isArchived,isEmpty,url 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Error "gh repo list failed: $reposJson"
    exit 1
}

$repos = $reposJson | ConvertFrom-Json | Where-Object {
    -not $_.isArchived -and -not $_.isEmpty
} | Sort-Object name

Write-Host "Backing up $($repos.Count) repositories (skipping archived + empty)..."

foreach ($repo in $repos) {
    $name = $repo.name
    $dest = Join-Path $Base $name
    $bundle = Join-Path $Base "$name.bundle"
    $entry = [ordered]@{
        Name       = $name
        Clone      = "pending"
        Fetch      = "skipped"
        Bundle     = "pending"
        CloneSize  = $null
        BundleSize = $null
        Error      = $null
    }

    try {
        if (Test-Path $dest) {
            Write-Host "[$name] folder exists — fetching..."
            Push-Location $dest
            git fetch --all --prune --tags 2>&1 | Out-Null
            if ($LASTEXITCODE -ne 0) { throw "git fetch --all failed in existing clone" }
            $entry.Fetch = "ok"
            $entry.Clone = "existing"
            Pop-Location
        }
        else {
            Write-Host "[$name] cloning..."
            git clone "https://github.com/$User/$name.git" $dest 2>&1 | Out-Null
            if ($LASTEXITCODE -ne 0) { throw "git clone failed" }
            Push-Location $dest
            git fetch --all --prune --tags 2>&1 | Out-Null
            if ($LASTEXITCODE -ne 0) { throw "git fetch --all failed after clone" }
            Pop-Location
            $entry.Clone = "ok"
            $entry.Fetch = "ok"
        }

        Write-Host "[$name] creating bundle..."
        Push-Location $dest
        if (Test-Path $bundle) { Remove-Item $bundle -Force }
        git bundle create $bundle --all 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) { throw "git bundle create failed" }
        Pop-Location
        $entry.Bundle = "ok"

        if (Test-Path $dest) {
            $entry.CloneSize = (Get-ChildItem $dest -Recurse -Force -ErrorAction SilentlyContinue |
                Measure-Object -Property Length -Sum).Sum
        }
        if (Test-Path $bundle) {
            $entry.BundleSize = (Get-Item $bundle).Length
        }
        Write-Host "[$name] done."
    }
    catch {
        if ((Get-Location).Path -ne $Base) { Pop-Location -ErrorAction SilentlyContinue }
        $entry.Error = $_.Exception.Message
        $entry.Clone = if ($entry.Clone -eq "pending") { "failed" } else { $entry.Clone }
        $entry.Bundle = if ($entry.Bundle -eq "pending") { "failed" } else { $entry.Bundle }
        Write-Warning "[$name] ERROR: $($_.Exception.Message)"
    }

    $Report += New-Object psobject -Property $entry
}

# Skipped repos
$skipped = $reposJson | ConvertFrom-Json | Where-Object { $_.isArchived -or $_.isEmpty }

function Format-Bytes([long]$bytes) {
    if ($bytes -ge 1GB) { return "{0:N2} GB" -f ($bytes / 1GB) }
    if ($bytes -ge 1MB) { return "{0:N2} MB" -f ($bytes / 1MB) }
    if ($bytes -ge 1KB) { return "{0:N2} KB" -f ($bytes / 1KB) }
    return "$bytes B"
}

$reportPath = Join-Path $Base "BACKUP-REPORT.md"
$lines = New-Object System.Collections.Generic.List[string]
$lines.Add('# GitHub Repo Backup Report')
$lines.Add('')
$lines.Add('| Field | Value |')
$lines.Add('| --- | --- |')
$lines.Add('| Account | **jonbeatz** |')
$lines.Add("| Date | $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') |")
$lines.Add("| Destination | $Base |")
$lines.Add("| Repos backed up | **$($Report.Count)** |")
$lines.Add('| GitHub MCP | Auth failed (Bad credentials) - used gh repo list |')
$lines.Add('')
$lines.Add('## Skipped')
$lines.Add('')
foreach ($s in $skipped) {
    $reason = if ($s.isArchived) { 'archived' } else { 'empty' }
    $lines.Add("- $($s.name) ($reason)")
}
$lines.Add('')
$lines.Add('## Results')
$lines.Add('')
$lines.Add('| Repo | Clone | Fetch | Bundle | Working copy | Bundle file | Notes |')
$lines.Add('| --- | --- | --- | --- | --- | --- | --- |')
foreach ($r in $Report) {
    $cloneSz = if ($r.CloneSize) { Format-Bytes $r.CloneSize } else { '-' }
    $bundleSz = if ($r.BundleSize) { Format-Bytes $r.BundleSize } else { '-' }
    $notes = if ($r.Error) { $r.Error } else { '-' }
    $lines.Add("| $($r.Name) | $($r.Clone) | $($r.Fetch) | $($r.Bundle) | $cloneSz | $bundleSz | $notes |")
}
$lines.Add("")
$lines.Add("## Restore from bundle")
$lines.Add("")
$lines.Add('```bash')
$lines.Add("git clone path/to/REPO.bundle REPO-RESTORED")
$lines.Add("cd REPO-RESTORED")
$lines.Add("git fetch --all")
$lines.Add('```')
$lines -join "`n" | Set-Content -Path $reportPath -Encoding UTF8

Write-Host ""
Write-Host "=== BACKUP COMPLETE ==="
Write-Host "Report: $reportPath"
$Report | Format-Table Name, Clone, Fetch, Bundle, @{N='CloneSize';E={if($_.CloneSize){Format-Bytes $_.CloneSize}else{'-'}}}, @{N='BundleSize';E={if($_.BundleSize){Format-Bytes $_.BundleSize}else{'-'}}}, Error -AutoSize
