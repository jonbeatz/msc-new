# Read .vscode/sftp.json and verify FTPS list on remotePath (same as PushItUP). No uploads.
$ErrorActionPreference = "Stop"
[System.Net.ServicePointManager]::SecurityProtocol =
  [System.Net.ServicePointManager]::SecurityProtocol -bor [System.Net.SecurityProtocolType]::Tls12

$workspaceRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$configPath = Join-Path $workspaceRoot ".vscode/sftp.json"

if (-not (Test-Path $configPath)) {
  Write-Host "FAIL: Missing $configPath"
  exit 1
}

$config = Get-Content -Raw -Path $configPath | ConvertFrom-Json
$ftpServer = [string]$config.host
$ftpPort = if ($null -ne $config.port) { [int]$config.port } else { 21 }
$useSsl = if ($null -ne $config.secure) { [bool]$config.secure } else { $true }
$usePassive = if ($null -ne $config.passive) { [bool]$config.passive } else { $true }
$username = [string]$config.username
$password = [string]$config.password
$remotePath = [string]$config.remotePath

if ([string]::IsNullOrWhiteSpace($ftpServer) -or
    [string]::IsNullOrWhiteSpace($username) -or
    [string]::IsNullOrWhiteSpace($password)) {
  Write-Host "FAIL: sftp.json missing host, username, or password."
  exit 1
}

$baseFtpUrl = "ftp://$ftpServer`:$ftpPort"
$credential = New-Object System.Net.NetworkCredential($username, $password)

function Escape-FtpPath {
  param([string]$PathText)
  $parts = ($PathText -replace "\\", "/").Split("/", [System.StringSplitOptions]::RemoveEmptyEntries)
  $encoded = $parts | ForEach-Object { [System.Uri]::EscapeDataString($_) }
  return ($encoded -join "/")
}

function Test-FtpList {
  param([string]$DirPath)
  $rel = if ([string]::IsNullOrWhiteSpace($DirPath)) { "" } else { $DirPath.TrimEnd("/") }
  $suffix = if ([string]::IsNullOrWhiteSpace($rel)) { "" } else { "/$(Escape-FtpPath -PathText $rel)" }
  $u = "$baseFtpUrl$suffix".TrimEnd("/")
  if ($suffix -eq "") { $u = $baseFtpUrl }
  $request = [System.Net.FtpWebRequest]::Create($u)
  $request.Credentials = $credential
  $request.EnableSsl = $useSsl
  $request.UsePassive = $usePassive
  $request.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectory
  $request.Timeout = 25000
  $request.ReadWriteTimeout = 25000
  $response = $request.GetResponse()
  $response.Close()
}

Write-Host "Spaceship FTPS test (read-only LIST)"
Write-Host "Server: ${ftpServer}:${ftpPort} (SSL=$useSsl, Passive=$usePassive)"
Write-Host "User: $username"

# 1) Login + root list (FTP home)
try {
  Test-FtpList -DirPath ""
  Write-Host "OK: FTPS login works. Listed FTP session root (same as PushItUP base URL)."
} catch {
  Write-Host "FAIL: Could not list FTP root: $($_.Exception.Message)"
  exit 1
}

# 2) Configured remotePath (LIST may fail on chroot; PushItUP still uses this path for STOR)
$candidate = if ([string]::IsNullOrWhiteSpace($remotePath)) { "/" } else { $remotePath.TrimEnd("/") }
try {
  Test-FtpList -DirPath $candidate
  Write-Host "OK: remotePath from sftp.json is listable: $candidate"
} catch {
  Write-Host "WARN: remotePath not listable on FTPS (550 is common): $candidate"
  Write-Host "      PushItUP still uploads under that path (see PushItUP.ps1); verify with a tiny push + FileZilla."
}
Write-Host "Done. You can run: npm run pushitup -- <files>"
exit 0
