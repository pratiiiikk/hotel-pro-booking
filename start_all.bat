@echo off
title Hotel Pro Launcher
echo ========================================================
echo   Starting Hotel Pro Management System (QuickStay)
echo ========================================================
echo.
echo Launching Backend and Frontend in separate windows...
echo.

start "Hotel Pro Backend (Port 5001)" cmd /k "cd /d ""%~dp0server"" && npm.cmd run server"
start "Hotel Pro Frontend (Vite)" cmd /k "cd /d ""%~dp0client"" && npm.cmd run dev"

echo Backend API is running on:  http://localhost:5001
echo Frontend App is running on: http://localhost:5173
echo.
echo Press any key to exit this launcher window (servers keep running).
pause
