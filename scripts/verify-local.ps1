# Local smoke checks before deploy.
# Usage: npm run verify:local
$ErrorActionPreference = "Stop"

function Test-Url {
  param(
    [string]$Url,
    [int]$TimeoutSec = 12
  )

  try {
    $resp = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec $TimeoutSec -UseBasicParsing
    return [PSCustomObject]@{
      Url       = $Url
      Ok        = ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 400)
      Status    = $resp.StatusCode
      ErrorText = ""
    }
  } catch {
    $status = 0
    if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
      $status = [int]$_.Exception.Response.StatusCode
    }
    return [PSCustomObject]@{
      Url       = $Url
      Ok        = $false
      Status    = $status
      ErrorText = $_.Exception.Message
    }
  }
}

$checks = @(
  "http://localhost:3000/",
  "http://localhost:3000/admin",
  "http://localhost:3000/admin/globals/homepage",
  "http://localhost:3000/api/globals/projects-home?depth=1"
)

Write-Host ""
Write-Host "verify:local - running smoke checks..." -ForegroundColor Yellow
Write-Host ""

$results = @()
foreach ($url in $checks) {
  $results += Test-Url -Url $url
}

$failed = $results | Where-Object { -not $_.Ok }

foreach ($r in $results) {
  if ($r.Ok) {
    Write-Host ("PASS {0} [{1}]" -f $r.Url, $r.Status) -ForegroundColor Green
  } else {
    Write-Host ("FAIL {0} [{1}] {2}" -f $r.Url, $r.Status, $r.ErrorText) -ForegroundColor Red
  }
}

Write-Host ""
if ($failed.Count -gt 0) {
  Write-Host ("verify:local failed ({0} checks failed)." -f $failed.Count) -ForegroundColor Red
  Write-Host "Tip: run npm run dev:fresh, then rerun npm run verify:local." -ForegroundColor Yellow
  exit 1
}

Write-Host "verify:local passed. Safe to proceed with deploy flow." -ForegroundColor Cyan
exit 0
