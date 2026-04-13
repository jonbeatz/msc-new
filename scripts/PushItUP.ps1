param(
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$Targets
)

$ErrorActionPreference = "Stop"
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12

function Join-FtpPath {
  param(
    [string]$Left,
    [string]$Right
  )

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
    # EscapeDataString turns "@lexical.js" into "%40lexical.js". Some FTP servers save that literal
    # filename, but Node resolves "./vendor-chunks/@lexical.js" — 500 at runtime. Keep leading @ literal.
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
  $request.Timeout = 30000
  $request.ReadWriteTimeout = 30000
  $request.Method = $Method
  return $request
}

function Get-RelativePathSafe {
  param(
    [string]$BasePath,
    [string]$TargetPath
  )

  $base = (Resolve-Path -LiteralPath $BasePath).Path
  $target = (Resolve-Path -LiteralPath $TargetPath).Path

  $baseWithSlash = $base
  if (-not $baseWithSlash.EndsWith("\")) {
    $baseWithSlash = "$baseWithSlash\"
  }

  $baseUri = New-Object System.Uri($baseWithSlash)
  $targetUri = New-Object System.Uri($target)
  $relativeUri = $baseUri.MakeRelativeUri($targetUri)
  $relative = [System.Uri]::UnescapeDataString($relativeUri.ToString())
  return $relative.Replace("/", "\")
}

function Test-FtpDirectory {
  param(
    [string]$BaseFtpUrl,
    [string]$DirPath,
    [System.Net.NetworkCredential]$Credential,
    [bool]$UseSsl,
    [bool]$UsePassive
  )

  $remote = if ([string]::IsNullOrWhiteSpace($DirPath)) { "/" } else { $DirPath }
  $uri = "$BaseFtpUrl/$(Escape-FtpPath -PathText $remote)"
  try {
    $request = New-FtpRequest -Uri $uri -Method ([System.Net.WebRequestMethods+Ftp]::ListDirectory) -Credential $Credential -UseSsl $UseSsl -UsePassive $UsePassive
    $response = $request.GetResponse()
    $response.Close()
    return $true
  } catch {
    return $false
  }
}

function Ensure-FtpDirectory {
  param(
    [string]$BaseFtpUrl,
    [string]$DirPath,
    [System.Net.NetworkCredential]$Credential,
    [bool]$UseSsl,
    [bool]$UsePassive
  )

  if ([string]::IsNullOrWhiteSpace($DirPath)) { return }

  $segments = ($DirPath -replace "\\", "/").Split("/", [System.StringSplitOptions]::RemoveEmptyEntries)
  $running = ""
  foreach ($segment in $segments) {
    $running = Join-FtpPath -Left $running -Right $segment
    $uri = "$BaseFtpUrl/$(Escape-FtpPath -PathText $running)"
    try {
      $request = New-FtpRequest -Uri $uri -Method ([System.Net.WebRequestMethods+Ftp]::MakeDirectory) -Credential $Credential -UseSsl $UseSsl -UsePassive $UsePassive
      $response = $request.GetResponse()
      $response.Close()
    } catch [System.Net.WebException] {
      $resp = $_.Exception.Response
      if ($null -ne $resp) {
        $code = [int]$resp.StatusCode
        $resp.Close()
        if ($code -notin 550, 553) { throw }
      } else {
        throw
      }
    }
  }
}

function Upload-FileToFtp {
  param(
    [string]$BaseFtpUrl,
    [string]$LocalFile,
    [string]$RemoteFilePath,
    [System.Net.NetworkCredential]$Credential,
    [bool]$UseSsl,
    [bool]$UsePassive
  )

  $remoteDir = Split-Path -Path $RemoteFilePath -Parent
  if ($remoteDir -eq ".") { $remoteDir = "" }
  Ensure-FtpDirectory -BaseFtpUrl $BaseFtpUrl -DirPath $remoteDir -Credential $Credential -UseSsl $UseSsl -UsePassive $UsePassive

  $uri = "$BaseFtpUrl/$(Escape-FtpPath -PathText $RemoteFilePath)"
  $request = New-FtpRequest -Uri $uri -Method ([System.Net.WebRequestMethods+Ftp]::UploadFile) -Credential $Credential -UseSsl $UseSsl -UsePassive $UsePassive

  # ReadAllBytes fails if Payload/dev has payload.sqlite open; shared read matches normal copy behavior.
  $fs = [System.IO.File]::Open($LocalFile, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::ReadWrite)
  try {
    $len = $fs.Length
    $bytes = New-Object byte[] $len
    [void]$fs.Read($bytes, 0, $len)
  } finally {
    $fs.Dispose()
  }
  $request.ContentLength = $bytes.Length

  $stream = $request.GetRequestStream()
  $stream.Write($bytes, 0, $bytes.Length)
  $stream.Close()

  $response = $request.GetResponse()
  $response.Close()
}

$workspaceRoot = (Get-Location).Path
$configPath = Join-Path $workspaceRoot ".vscode/sftp.json"

if (-not (Test-Path $configPath)) {
  throw "Missing config file: $configPath"
}

$config = Get-Content -Raw -Path $configPath | ConvertFrom-Json
$ftpServer = [string]$config.host
$ftpPort = if ($null -ne $config.port) { [int]$config.port } else { 21 }
$useSsl = if ($null -ne $config.secure) { [bool]$config.secure } else { $true }
$usePassive = if ($null -ne $config.passive) { [bool]$config.passive } else { $true }
$username = [string]$config.username
$password = [string]$config.password
$remoteBaseFromConfig = [string]$config.remotePath

if ([string]::IsNullOrWhiteSpace($ftpServer) -or [string]::IsNullOrWhiteSpace($username) -or [string]::IsNullOrWhiteSpace($password)) {
  throw "sftp.json is missing required FTP fields (host, username, password)."
}

$baseFtpUrl = "ftp://$ftpServer`:$ftpPort"
$credential = New-Object System.Net.NetworkCredential($username, $password)

$candidateRemoteBase = if ([string]::IsNullOrWhiteSpace($remoteBaseFromConfig)) { "/" } else { $remoteBaseFromConfig.Trim() }
# Always honor sftp.json remotePath. On Spaceship FTPS the session is usually chrooted to the app root — use "/"
# (see Spaceship.md). Wrong values: "/home/USER/mystudiochannel.com/" (nested home/... on server) or
# "/mystudiochannel.com/" (double mystudiochannel.com folder). LIST on remotePath may still fail (550); STOR can work.
$remoteBase = $candidateRemoteBase
if ($remoteBase -ne "/" -and -not (Test-FtpDirectory -BaseFtpUrl $baseFtpUrl -DirPath $remoteBase -Credential $credential -UseSsl $useSsl -UsePassive $usePassive)) {
  Write-Output "Warning: remotePath '$remoteBase' did not respond to FTPS LIST; using configured path anyway (typical on chrooted FTP)."
}

if ($null -eq $Targets -or $Targets.Count -eq 0) {
  $Targets = @(".next")
}

$uploadItems = New-Object System.Collections.Generic.List[object]

foreach ($rawTarget in $Targets) {
  # npm on Windows sometimes passes args with wrapping quotes as part of the string (e.g. `'app/(payload)/x'`).
  $target = $rawTarget.Trim().Trim([char[]]@("'", '"'))
  $resolved = $null
  try {
    # -LiteralPath: paths like app/(payload)/foo use "(" which is special for -Path (wildcard).
    $resolved = Resolve-Path -LiteralPath $target -ErrorAction Stop
  } catch {
    throw "Target not found: $target"
  }

  foreach ($item in $resolved) {
    $fullPath = $item.Path
    if ((Test-Path -LiteralPath $fullPath -PathType Leaf)) {
      $relativePath = (Get-RelativePathSafe -BasePath $workspaceRoot -TargetPath $fullPath).Replace("\", "/")
      $uploadItems.Add([PSCustomObject]@{
          LocalPath  = $fullPath
          RemotePath = $relativePath
        })
      continue
    }

    if (Test-Path -LiteralPath $fullPath -PathType Container) {
      $allFiles = Get-ChildItem -LiteralPath $fullPath -Recurse -File
      foreach ($f in $allFiles) {
        $relativePath = (Get-RelativePathSafe -BasePath $workspaceRoot -TargetPath $f.FullName).Replace("\", "/")
        $uploadItems.Add([PSCustomObject]@{
            LocalPath  = $f.FullName
            RemotePath = $relativePath
          })
      }
      continue
    }

    throw "Unsupported target type: $target"
  }
}

$total = $uploadItems.Count
if ($total -eq 0) {
  throw "No files found to upload."
}

Write-Output "PushItUP starting..."
Write-Output "Server: $ftpServer`:$ftpPort (FTPS=$useSsl, Passive=$usePassive)"
Write-Output "Remote base: $remoteBase"
Write-Output "Files to upload: $total"

$failed = New-Object System.Collections.Generic.List[object]
$index = 0
$progressEvery = [Math]::Max(1, [Math]::Ceiling($total / 20))
$startedAt = Get-Date

foreach ($item in $uploadItems) {
  $index++
  $remotePathUnderBase = Join-FtpPath -Left $remoteBase -Right $item.RemotePath
  try {
    Upload-FileToFtp -BaseFtpUrl $baseFtpUrl -LocalFile $item.LocalPath -RemoteFilePath $remotePathUnderBase -Credential $credential -UseSsl $useSsl -UsePassive $usePassive
  } catch {
    Write-Output "Upload error $($item.RemotePath): $($_.Exception.Message)"
    $failed.Add($item)
  }

  if (($index % $progressEvery) -eq 0 -or $index -eq $total) {
    $pct = [Math]::Round(($index * 100.0) / $total, 1)
    $elapsed = [Math]::Round(((Get-Date) - $startedAt).TotalSeconds, 1)
    Write-Output "Processed $index / $total ($pct%) (failed: $($failed.Count), elapsed: ${elapsed}s)"
  }
}

if ($failed.Count -gt 0) {
  Write-Output "Retrying failed uploads once ($($failed.Count) files)..."
  $retryFailed = New-Object System.Collections.Generic.List[object]

  foreach ($item in $failed) {
    $remotePathUnderBase = Join-FtpPath -Left $remoteBase -Right $item.RemotePath
    try {
      Upload-FileToFtp -BaseFtpUrl $baseFtpUrl -LocalFile $item.LocalPath -RemoteFilePath $remotePathUnderBase -Credential $credential -UseSsl $useSsl -UsePassive $usePassive
    } catch {
      Write-Output "Retry upload error $($item.RemotePath): $($_.Exception.Message)"
      $retryFailed.Add($item)
    }
  }

  if ($retryFailed.Count -gt 0) {
    Write-Output "PushItUP completed with failures after retry."
    $retryFailed | Select-Object -First 30 | ForEach-Object { Write-Output "FAILED $($_.RemotePath)" }
    exit 1
  }

  Write-Output "Retry succeeded. Uploaded $total files."
  exit 0
}

Write-Output "PushItUP complete. Uploaded $total files."
exit 0
