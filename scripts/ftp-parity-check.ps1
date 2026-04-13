# 1:1 parity: local .next, public/media, payload.sqlite vs FTPS remote (sftp.json remotePath).
# Wrong remotePath => parity compares the wrong server tree. Run: npm run verify:ftp-smoke (see Spaceship.md § FTP).
# Usage (repo root): powershell -ExecutionPolicy Bypass -File scripts/ftp-parity-check.ps1
$ErrorActionPreference = "Stop"
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12

function Join-FtpPath {
  param([string]$Left, [string]$Right)
  $leftClean = ($Left -replace "\\", "/").TrimEnd("/")
  $rightClean = ($Right -replace "\\", "/").TrimStart("/")
  if ([string]::IsNullOrWhiteSpace($leftClean)) { return "/$rightClean" }
  if ([string]::IsNullOrWhiteSpace($rightClean)) { return $leftClean }
  return "$leftClean/$rightClean"
}

function Escape-FtpPath {
  param([string]$PathText)
  $parts = ($PathText -replace "\\", "/").Split("/", [System.StringSplitOptions]::RemoveEmptyEntries)
  $encoded = $parts | ForEach-Object {
    $seg = $_
    if ($seg.StartsWith("@")) {
      "@" + [System.Uri]::EscapeDataString($seg.Substring(1))
    } else {
      [System.Uri]::EscapeDataString($seg)
    }
  }
  return ($encoded -join "/")
}

function New-FtpRequest {
  param(
    [string]$Uri,
    [string]$Method,
    [System.Net.NetworkCredential]$Credential,
    [bool]$UseSsl,
    [bool]$UsePassive
  )
  $request = [System.Net.FtpWebRequest]::Create($Uri)
  $request.Credentials = $Credential
  $request.EnableSsl = $UseSsl
  $request.UsePassive = $UsePassive
  $request.UseBinary = $true
  $request.KeepAlive = $false
  $request.Timeout = 120000
  $request.ReadWriteTimeout = 120000
  $request.Method = $Method
  return $request
}

# Parse a typical UNIX "ls -l" style FTP LIST line (Spaceship/cPanel).
function Parse-FtpListLine {
  param([string]$Line)
  $t = $Line.Trim()
  if ($t.Length -eq 0) { return $null }
  if ($t -match '^(total|Total)\s+\d') { return $null }
  # Symlink: lrwxrwxrwx ... name -> target
  if ($t -match '^l') {
    if ($t -match '^l\S+\s+\d+\s+\S+\s+\S+\s+\d+\s+.+\s+(.+?)\s+->') {
      return @{ Kind = "link"; Name = $Matches[1].Trim(); Size = 0 }
    }
  }
  if ($t -match '^([\-dbclps])([\-rwxsStT]{9})\s+\d+\s+\S+\s+\S+\s+(?<size>\d+)\s+.+\s+(?<name>.+)$') {
    $mode = $Matches[1]
    $name = $Matches["name"].Trim()
    if ($name -eq "." -or $name -eq "..") { return $null }
    $size = [long]$Matches["size"]
    if ($mode -eq "d") {
      return @{ Kind = "dir"; Name = $name; Size = 0 }
    }
    return @{ Kind = "file"; Name = $name; Size = $size }
  }
  return $null
}

function Get-FtpTree {
  param(
    [string]$BaseFtpUrl,
    [string]$RemoteDir,
    [string]$RelPrefix,
    [System.Net.NetworkCredential]$Credential,
    [bool]$UseSsl,
    [bool]$UsePassive
  )
  $files = @{} # rel path -> size
  $q = [System.Collections.Queue]::new()
  $q.Enqueue(@($RemoteDir, $RelPrefix))

  while ($q.Count -gt 0) {
    $cur = $q.Dequeue()
    $dirRemote = $cur[0]
    $dirRel = $cur[1]

    $uri = "$BaseFtpUrl/$(Escape-FtpPath -PathText $dirRemote)"
    $req = New-FtpRequest -Uri $uri -Method ([System.Net.WebRequestMethods+Ftp]::ListDirectoryDetails) -Credential $Credential -UseSsl $UseSsl -UsePassive $UsePassive
    $resp = $req.GetResponse()
    try {
      $sr = [System.IO.StreamReader]::new($resp.GetResponseStream())
      $text = $sr.ReadToEnd()
      $sr.Close()
    } finally {
      $resp.Close()
    }

    foreach ($line in ($text -split "`r?`n")) {
      $p = Parse-FtpListLine -Line $line
      if ($null -eq $p) { continue }
      $name = $p.Name
      if ($p.Kind -eq "dir") {
        $childRemote = Join-FtpPath -Left $dirRemote -Right $name
        $childRel = if ([string]::IsNullOrWhiteSpace($dirRel)) { $name } else { "$dirRel/$name" }
        $q.Enqueue(@($childRemote, $childRel))
        continue
      }
      if ($p.Kind -eq "file") {
        $rel = if ([string]::IsNullOrWhiteSpace($dirRel)) { $name } else { "$dirRel/$name" }
        $files[$rel] = [long]$p.Size
      }
    }
  }
  return $files
}

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

$configPath = Join-Path $repoRoot ".vscode/sftp.json"
if (-not (Test-Path -LiteralPath $configPath)) { throw "Missing $configPath" }

$config = Get-Content -Raw -Path $configPath | ConvertFrom-Json
$ftpServer = [string]$config.host
$ftpPort = if ($null -ne $config.port) { [int]$config.port } else { 21 }
$useSsl = if ($null -ne $config.secure) { [bool]$config.secure } else { $true }
$usePassive = if ($null -ne $config.passive) { [bool]$config.passive } else { $true }
$username = [string]$config.username
$password = [string]$config.password
$remoteBase = if ([string]::IsNullOrWhiteSpace([string]$config.remotePath)) { "/" } else { [string]$config.remotePath.Trim() }

$credential = New-Object System.Net.NetworkCredential($username, $password)
$baseFtpUrl = "ftp://$ftpServer`:$ftpPort"

# --- Local scan ---
$localAll = @{} # rel (forward slashes) -> size

$nextPath = Join-Path $repoRoot ".next"
if (Test-Path -LiteralPath $nextPath) {
  Get-ChildItem -LiteralPath $nextPath -Recurse -File | ForEach-Object {
    $rel = $_.FullName.Substring($repoRoot.Length).TrimStart("\", "/").Replace("\", "/")
    $localAll[$rel] = $_.Length
  }
}

$mediaPath = Join-Path $repoRoot "public\media"
if (Test-Path -LiteralPath $mediaPath) {
  Get-ChildItem -LiteralPath $mediaPath -Recurse -File | ForEach-Object {
    $rel = $_.FullName.Substring($repoRoot.Length).TrimStart("\", "/").Replace("\", "/")
    $localAll[$rel] = $_.Length
  }
}

$dbPath = Join-Path $repoRoot "payload.sqlite"
$localDbSize = $null
if (Test-Path -LiteralPath $dbPath) {
  $localDbSize = (Get-Item -LiteralPath $dbPath).Length
  $localAll["payload.sqlite"] = $localDbSize
}

# --- Remote scan ---
$remoteNext = @{}
$remoteMedia = @{}
$remoteDbSize = $null
$remoteDbErr = $null

$rb = $remoteBase.TrimEnd("/")
if ($rb.Length -eq 0) { $rb = "" }

function RemoteJoin([string]$sub) {
  if ([string]::IsNullOrWhiteSpace($rb)) { return $sub.TrimStart("/") }
  return (Join-FtpPath -Left $rb -Right $sub.TrimStart("/"))
}

$nextRemote = RemoteJoin ".next"
$mediaRemote = RemoteJoin "public/media"
$dbRemote = RemoteJoin "payload.sqlite"

try {
  $remoteNext = Get-FtpTree -BaseFtpUrl $baseFtpUrl -RemoteDir $nextRemote -RelPrefix ".next" -Credential $credential -UseSsl $useSsl -UsePassive $usePassive
} catch {
  $remoteNext = @{ "_error" = $_.Exception.Message }
}

try {
  $remoteMedia = Get-FtpTree -BaseFtpUrl $baseFtpUrl -RemoteDir $mediaRemote -RelPrefix "public/media" -Credential $credential -UseSsl $useSsl -UsePassive $usePassive
} catch {
  $remoteMedia = @{ "_error" = $_.Exception.Message }
}

try {
  $dbUri = "$baseFtpUrl/$(Escape-FtpPath -PathText $dbRemote)"
  $dbReq = New-FtpRequest -Uri $dbUri -Method ([System.Net.WebRequestMethods+Ftp]::GetFileSize) -Credential $credential -UseSsl $useSsl -UsePassive $usePassive
  $dbResp = $dbReq.GetResponse()
  $remoteDbSize = [long]$dbResp.ContentLength
  $dbResp.Close()
} catch {
  $remoteDbSize = $null
  $remoteDbErr = $_.Exception.Message
}

# Normalize remote maps: keys should match local rel paths
function Normalize-RemoteMap($map, [string]$expectedPrefix) {
  if ($map.ContainsKey("_error")) { return @{ "_error" = $map["_error"] } }
  $out = @{}
  foreach ($kv in $map.GetEnumerator()) {
    $k = $kv.Key -replace "\\", "/"
    $full = if ($k.StartsWith($expectedPrefix)) { $k } else { "$expectedPrefix/$k" }
    $full = $full -replace "//", "/"
    $out[$full] = $kv.Value
  }
  return $out
}

# Get-FtpTree returns paths like ".next/build/foo" under RelPrefix ".next" - actually we passed RelPrefix ".next" and files get "$dirRel/$name"
# So keys are like ".next/server/..." 
$remoteNextNorm = Normalize-RemoteMap $remoteNext ".next"
$remoteMediaNorm = Normalize-RemoteMap $remoteMedia "public/media"

# Build sets for comparison (scope to our three areas)
$localKeys = [System.Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
foreach ($k in $localAll.Keys) {
  if ($k -like ".next/*" -or $k -like "public/media/*" -or $k -eq "payload.sqlite") {
    [void]$localKeys.Add($k)
  }
}

# Remote key set (paths present on server under our scan)
$remoteKeysActual = [System.Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
foreach ($k in $remoteNextNorm.Keys) {
  if (-not $k.StartsWith("_")) { [void]$remoteKeysActual.Add($k) }
}
foreach ($k in $remoteMediaNorm.Keys) {
  if (-not $k.StartsWith("_")) { [void]$remoteKeysActual.Add($k) }
}
if ($null -ne $remoteDbSize) { [void]$remoteKeysActual.Add("payload.sqlite") }

$localOnly = [System.Collections.Generic.List[string]]::new()
foreach ($k in $localKeys) {
  if (-not $remoteKeysActual.Contains($k)) { $localOnly.Add($k) }
}
$localOnly.Sort()

$remoteOnly = [System.Collections.Generic.List[string]]::new()
foreach ($k in $remoteKeysActual) {
  if (-not $localKeys.Contains($k)) { $remoteOnly.Add($k) }
}
$remoteOnly.Sort()

# Size mismatches (same path, different size) - skip if missing on one side
$sizeMismatch = [System.Collections.Generic.List[string]]::new()
foreach ($k in $localKeys) {
  if (-not $remoteKeysActual.Contains($k)) { continue }
  if ($k -eq "payload.sqlite") {
    if ($null -ne $localDbSize -and $null -ne $remoteDbSize -and $localDbSize -ne $remoteDbSize) {
      [void]$sizeMismatch.Add("payload.sqlite (local $localDbSize vs remote $remoteDbSize)")
    }
    continue
  }
  $ls = $localAll[$k]
  $rs = $null
  if ($remoteNextNorm.ContainsKey($k)) { $rs = $remoteNextNorm[$k] }
  elseif ($remoteMediaNorm.ContainsKey($k)) { $rs = $remoteMediaNorm[$k] }
  if ($null -ne $ls -and $null -ne $rs -and $ls -ne $rs) {
    [void]$sizeMismatch.Add("$k (local $ls vs remote $rs)")
  }
}
$sizeMismatch.Sort()

$localMediaCount = (@($localKeys | Where-Object { $_ -like "public/media/*" })).Count
$remoteMediaCount = (@($remoteKeysActual | Where-Object { $_ -like "public/media/*" })).Count

# --- Markdown report ---
$sb = [System.Text.StringBuilder]::new()
[void]$sb.AppendLine("# FTP parity check (local vs live)")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("| Field | Value |")
[void]$sb.AppendLine("| --- | --- |")
[void]$sb.AppendLine("| Generated (local PC) | $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') |")
[void]$sb.AppendLine("| Repo | ``$repoRoot`` |")
[void]$sb.AppendLine("| FTPS host | ``$ftpServer`:$ftpPort`` |")
[void]$sb.AppendLine("| Remote base | ``$remoteBase`` |")
[void]$sb.AppendLine("")

[void]$sb.AppendLine("## payload.sqlite size")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("| Location | Size (bytes) |")
[void]$sb.AppendLine("| --- | ---: |")
[void]$sb.AppendLine("| Local ``payload.sqlite`` | $(if ($null -ne $localDbSize) { $localDbSize } else { '(missing)' }) |")
[void]$sb.AppendLine("| Remote ``$dbRemote`` | $(if ($null -ne $remoteDbSize) { $remoteDbSize } else { '(unavailable: ' + $(if ($remoteDbErr) { $remoteDbErr } else { 'unknown' }) + ')' }) |")
[void]$sb.AppendLine("| Match | $(if ($null -ne $localDbSize -and $null -ne $remoteDbSize) { if ($localDbSize -eq $remoteDbSize) { 'Yes' } else { 'No' } } else { 'n/a' }) |")
[void]$sb.AppendLine("")

[void]$sb.AppendLine("## Media file counts (``public/media``)")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("| Side | File count | Expected |")
[void]$sb.AppendLine("| --- | ---: | ---: |")
[void]$sb.AppendLine("| Local | $localMediaCount | 32 |")
[void]$sb.AppendLine("| Remote | $remoteMediaCount | 32 |")
[void]$sb.AppendLine("| Match (32 both) | $(if ($localMediaCount -eq 32 -and $remoteMediaCount -eq 32) { 'Yes' } else { 'No' }) |")
[void]$sb.AppendLine("")

[void]$sb.AppendLine("## Summary counts")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("| Tree | Local files | Remote files |")
[void]$sb.AppendLine("| --- | ---: | ---: |")
$ln = ($localKeys | Where-Object { $_ -like '.next/*' -or $_ -eq '.next' }).Count
# .next is never a file in our map - count .next/**
$ln = (@($localKeys | Where-Object { $_ -like '.next/*' })).Count
$rn = (@($remoteKeysActual | Where-Object { $_ -like '.next/*' })).Count
[void]$sb.AppendLine("| ``.next`` (files) | $ln | $rn |")
[void]$sb.AppendLine("| ``public/media`` (files) | $localMediaCount | $remoteMediaCount |")
[void]$sb.AppendLine("| ``payload.sqlite`` | $(if ($null -ne $localDbSize) { 1 } else { 0 }) | $(if ($null -ne $remoteDbSize) { 1 } else { 0 }) |")
[void]$sb.AppendLine("")

[void]$sb.AppendLine("## Files present locally but not on remote (first 200)")
[void]$sb.AppendLine("")
if ($localOnly.Count -eq 0) {
  [void]$sb.AppendLine("*None.*")
} else {
  [void]$sb.AppendLine("| # | Relative path |")
  [void]$sb.AppendLine("| ---: | --- |")
  $i = 0
  foreach ($p in $localOnly) {
    $i++
    if ($i -gt 200) { break }
    $safe = $p -replace '\|', '\|'
    [void]$sb.AppendLine("| $i | ``$safe`` |")
  }
  if ($localOnly.Count -gt 200) {
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("*(Truncated: $($localOnly.Count) total local-only paths.)*")
  }
}
[void]$sb.AppendLine("")

[void]$sb.AppendLine("## Files present on remote but not locally (first 200)")
[void]$sb.AppendLine("")
if ($remoteOnly.Count -eq 0) {
  [void]$sb.AppendLine("*None.*")
} else {
  [void]$sb.AppendLine("| # | Relative path |")
  [void]$sb.AppendLine("| ---: | --- |")
  $i = 0
  foreach ($p in $remoteOnly) {
    $i++
    if ($i -gt 200) { break }
    $safe = $p -replace '\|', '\|'
    [void]$sb.AppendLine("| $i | ``$safe`` |")
  }
  if ($remoteOnly.Count -gt 200) {
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("*(Truncated: $($remoteOnly.Count) total remote-only paths.)*")
  }
}
[void]$sb.AppendLine("")

[void]$sb.AppendLine("## Size mismatches (same path, different size) - first 100")
[void]$sb.AppendLine("")
if ($sizeMismatch.Count -eq 0) {
  [void]$sb.AppendLine("*None reported (or only DB handled above).*")
} else {
  foreach ($m in $sizeMismatch | Select-Object -First 100) {
    [void]$sb.AppendLine("- $m")
  }
}

if ($remoteNextNorm.ContainsKey("_error")) {
  [void]$sb.AppendLine("")
  [void]$sb.AppendLine("## Remote ``.next`` scan error")
  [void]$sb.AppendLine("")
  [void]$sb.AppendLine("``````")
  [void]$sb.AppendLine($remoteNextNorm["_error"])
  [void]$sb.AppendLine("``````")
}
if ($remoteMediaNorm.ContainsKey("_error")) {
  [void]$sb.AppendLine("")
  [void]$sb.AppendLine("## Remote ``public/media`` scan error")
  [void]$sb.AppendLine("")
  [void]$sb.AppendLine("``````")
  [void]$sb.AppendLine($remoteMediaNorm["_error"])
  [void]$sb.AppendLine("``````")
}

$outPath = Join-Path $repoRoot "parity-ftp-report.md"
$sb.ToString() | Set-Content -LiteralPath $outPath -Encoding utf8
Write-Host "Wrote $outPath (length $($sb.Length) chars). Open parity-ftp-report.md for full tables."
