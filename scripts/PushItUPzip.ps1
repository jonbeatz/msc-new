param(
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$Targets
)

$ErrorActionPreference = "Stop"

if ($null -eq $Targets -or $Targets.Count -eq 0) {
  $Targets = @(".next")
}

$workspaceRoot = (Get-Location).Path
$zipDir = Join-Path $workspaceRoot ".pushitupzips"
if (-not (Test-Path $zipDir)) {
  New-Item -Path $zipDir -ItemType Directory | Out-Null
}

# Clean any old archives from prior runs.
Get-ChildItem -Path $zipDir -File -Filter "*.zip" -ErrorAction SilentlyContinue | Remove-Item -Force

$archives = New-Object System.Collections.Generic.List[string]

foreach ($target in $Targets) {
  $resolvedItems = Resolve-Path -Path $target -ErrorAction Stop

  foreach ($resolved in $resolvedItems) {
    $fullPath = $resolved.Path
    $isDir = Test-Path -LiteralPath $fullPath -PathType Container
    $isFile = Test-Path -LiteralPath $fullPath -PathType Leaf

    if (-not ($isDir -or $isFile)) {
      throw "Unsupported target type: $target"
    }

    $name = Split-Path -Path $fullPath -Leaf
    if ([string]::IsNullOrWhiteSpace($name)) { $name = "target" }
    $safeName = $name -replace "[^a-zA-Z0-9._-]", "-"
    $archivePath = Join-Path $zipDir "$safeName.zip"

    if (Test-Path $archivePath) {
      Remove-Item $archivePath -Force
    }

    if ($isDir) {
      Compress-Archive -Path (Join-Path $fullPath "*") -DestinationPath $archivePath -CompressionLevel Optimal
    } else {
      Compress-Archive -Path $fullPath -DestinationPath $archivePath -CompressionLevel Optimal
    }

    $archives.Add($archivePath)
    Write-Output "Packed: $target -> $archivePath"
  }
}

if ($archives.Count -eq 0) {
  throw "No archives produced."
}

Write-Output "Uploading $($archives.Count) archive(s) via PushItUP..."

$pushScript = Join-Path $workspaceRoot "scripts/PushItUP.ps1"
if (-not (Test-Path $pushScript)) {
  throw "Missing uploader script: $pushScript"
}

& powershell -ExecutionPolicy Bypass -File $pushScript @archives
$exitCode = $LASTEXITCODE

if ($exitCode -ne 0) {
  throw "PushItUP failed while uploading archive(s)."
}

Write-Output "PushItUPzip complete."
exit 0
