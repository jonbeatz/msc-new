# Read-only: LIST configured remotePath and confirm ftp-path-smoke-test.txt exists (same session as PushItUP).
# Spaceship.md § FTP documents remotePath (usually "/") vs cPanel shell cd — do not confuse them.
$ErrorActionPreference = "Stop"
[System.Net.ServicePointManager]::SecurityProtocol =
  [System.Net.ServicePointManager]::SecurityProtocol -bor [System.Net.SecurityProtocolType]::Tls12

$workspaceRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$configPath = Join-Path $workspaceRoot ".vscode/sftp.json"
$config = Get-Content -Raw -Path $configPath | ConvertFrom-Json

$ftpServer = [string]$config.host
$ftpPort = if ($null -ne $config.port) { [int]$config.port } else { 21 }
$useSsl = if ($null -ne $config.secure) { [bool]$config.secure } else { $true }
$usePassive = if ($null -ne $config.passive) { [bool]$config.passive } else { $true }
$credential = New-Object System.Net.NetworkCredential([string]$config.username, [string]$config.password)

$remotePathRaw = [string]$config.remotePath
$rp = if ([string]::IsNullOrWhiteSpace($remotePathRaw)) { "/" } else { $remotePathRaw.Trim() }
$rp = $rp.TrimEnd("/")
$listSegment = if ([string]::IsNullOrWhiteSpace($rp) -or $rp -eq "/") { "" } else { $rp }

function Escape-FtpPath {
  param([string]$PathText)
  $parts = ($PathText -replace "\\", "/").Split("/", [System.StringSplitOptions]::RemoveEmptyEntries)
  ($parts | ForEach-Object { [System.Uri]::EscapeDataString($_) }) -join "/"
}

$baseFtpUrl = "ftp://$ftpServer`:$ftpPort"
$suffix = if ([string]::IsNullOrWhiteSpace($listSegment)) { "" } else { "/$(Escape-FtpPath -PathText $listSegment)" }
$uri = if ($suffix -eq "") { $baseFtpUrl } else { "$baseFtpUrl$suffix".TrimEnd("/") }

$request = [System.Net.FtpWebRequest]::Create($uri)
$request.Credentials = $credential
$request.EnableSsl = $useSsl
$request.UsePassive = $usePassive
$request.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectory
$request.Timeout = 25000
$request.ReadWriteTimeout = 25000

$response = $request.GetResponse()
try {
  $reader = New-Object System.IO.StreamReader($response.GetResponseStream())
  try {
    $body = $reader.ReadToEnd()
  } finally {
    $reader.Dispose()
  }
} finally {
  $response.Close()
}

$names = @($body -split "`r?`n" | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne "" })
$hit = $names | Where-Object { $_ -eq "ftp-path-smoke-test.txt" }

Write-Host "LIST URI: $uri"
Write-Host "remotePath (sftp.json): '$remotePathRaw' -> list segment: '$listSegment'"
if ($hit) {
  Write-Host "VERIFY_OK: ftp-path-smoke-test.txt is present in this directory listing."
  exit 0
}

Write-Host "VERIFY_FAIL: ftp-path-smoke-test.txt not found. Sample of listing (first 40 names):"
$names | Select-Object -First 40 | ForEach-Object { Write-Host "  $_" }
exit 1
