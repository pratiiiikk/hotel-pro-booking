param (
    [string]$Token,
    [string]$Username = "pratiiiikk",
    [string]$Repo = "hotel-booking",
    [switch]$Private
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   Hotel Pro Management System - GitHub Project Uploader   " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

if (-not $Token) {
    Write-Host "`nTo upload this project to your GitHub account:" -ForegroundColor Green
    Write-Host "1. Create a GitHub Personal Access Token at: https://github.com/settings/tokens" -ForegroundColor White
    Write-Host "   (Choose 'Generate new token (classic)' and check the 'repo' scope)" -ForegroundColor DarkGray
    $Token = Read-Host "`nEnter your GitHub Personal Access Token (PAT)"
}

if (-not $Token) {
    Write-Host "No token provided. Aborting." -ForegroundColor Red
    exit 1
}

$UsernameInput = Read-Host "GitHub Username [$Username]"
if ($UsernameInput) { $Username = $UsernameInput }

$RepoInput = Read-Host "Repository Name [$Repo]"
if ($RepoInput) { $Repo = $RepoInput }

$scriptPath = Join-Path $PSScriptRoot "upload_to_github.py"
$privateFlag = if ($Private) { "--private" } else { "" }

python $scriptPath --token $Token --username $Username --repo $Repo $privateFlag
