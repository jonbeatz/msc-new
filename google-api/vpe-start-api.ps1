# Vader Engine — LiteLLM + ngrok launcher (Windows)
param(
  [switch]$StartNgrok
)

$ErrorActionPreference = "Stop"
$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")

Set-Location $RepoRoot

if ($StartNgrok) {
  Write-Host "[vpe-start-api] Starting LiteLLM + ngrok (foreground)..." -ForegroundColor Cyan
  npm run msc:litellm:start:ngrok
} else {
  Write-Host "[vpe-start-api] Starting LiteLLM (localhost, foreground)..." -ForegroundColor Cyan
  npm run msc:litellm:start
}
