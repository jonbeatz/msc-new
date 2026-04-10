# Live smoke checks (production) without deploy.
# Usage: npm run verify:live
$ErrorActionPreference = "Stop"

function Test-Url {
  param(
    [string]$Url,
    [int]$TimeoutSec = 15
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
  "https://mystudiochannel.com/",
  "https://mystudiochannel.com/admin",
  "https://mystudiochannel.com/api/globals/projects-home?depth=1"
)

Write-Host ""
Write-Host "verify:live - running smoke checks..." -ForegroundColor Yellow
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
  Write-Host ("verify:live failed ({0} checks failed)." -f $failed.Count) -ForegroundColor Red
  Write-Host "Tip: restart Node app in cPanel (Stop -> wait -> Start), then rerun npm run verify:live." -ForegroundColor Yellow
  exit 1
}

Write-Host "verify:live passed. Live endpoints look healthy." -ForegroundColor Cyan
exit 0
