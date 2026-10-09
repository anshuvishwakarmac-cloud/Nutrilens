@echo off
title NutriLens AI Full Stack Launcher
echo ========================================================
echo          Starting NutriLens AI Meal Analyzer...
echo ========================================================
echo.

:: Start Backend in new window
echo [1/3] Launching Backend API Server (Port 5000)...
start "NutriLens Backend" cmd /k "cd /d "%~dp0backend" && npm run dev"

:: Short delay
timeout /t 2 /nobreak >nul

:: Start Frontend in new window
echo [2/3] Launching Frontend Web App (Port 3000)...
start "NutriLens Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

:: Delay for servers to initialize
timeout /t 4 /nobreak >nul

:: Open browser automatically
echo [3/3] Opening NutriLens in your Browser...
start http://localhost:3000

echo.
echo ========================================================
echo  NutriLens is now running! Keep the terminal windows open.
echo ========================================================
pause
