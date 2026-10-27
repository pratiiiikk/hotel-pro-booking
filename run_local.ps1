Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   Starting Hotel Pro Management System (Local Dev)        " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

$serverDir = Join-Path $PSScriptRoot "server"
$clientDir = Join-Path $PSScriptRoot "client"

# 1. Check server dependencies
if (-not (Test-Path (Join-Path $serverDir "node_modules"))) {
    Write-Host "[1/3] Installing backend dependencies..." -ForegroundColor Green
    Start-Process -FilePath "npm.cmd" -ArgumentList "install" -WorkingDirectory $serverDir -Wait -NoNewWindow
}

# 2. Check client dependencies
if (-not (Test-Path (Join-Path $clientDir "node_modules"))) {
    Write-Host "[2/3] Installing frontend dependencies..." -ForegroundColor Green
    Start-Process -FilePath "npm.cmd" -ArgumentList "install" -WorkingDirectory $clientDir -Wait -NoNewWindow
}

# 3. Launch both in separate windows
Write-Host "[3/3] Launching Backend and Frontend servers..." -ForegroundColor Cyan

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$serverDir'; Write-Host '--- Hotel Pro Backend (Port 5001) ---' -ForegroundColor Yellow; npm.cmd run server"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$clientDir'; Write-Host '--- Hotel Pro Frontend (Vite) ---' -ForegroundColor Cyan; npm.cmd run dev"

Write-Host "`nBackend will run on:  http://localhost:5001" -ForegroundColor Yellow
Write-Host "Frontend will run on: http://localhost:5173" -ForegroundColor Green
Write-Host "Both servers started in separate terminal windows!`n" -ForegroundColor White
