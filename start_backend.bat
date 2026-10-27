@echo off
title Hotel Pro Backend (Port 5001)
echo Starting Backend Server on http://localhost:5001 ...
cd /d "%~dp0server"
npm.cmd run server
pause
