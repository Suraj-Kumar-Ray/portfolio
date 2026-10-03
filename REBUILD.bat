@echo off
title Portfolio - Rebuild
cd /d "%~dp0"

echo.
echo  Rebuilding the website...
echo  (Run this after adding a new photo or changing the design)
echo.

call npm run build

if errorlevel 1 (
  echo.
  echo  [X] Build failed - read the message above.
  pause
  exit /b 1
)

echo.
echo  [OK] Done! Now run START.bat (or refresh the browser).
echo.
pause
