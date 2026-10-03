@echo off
title Suraj Kumar - Portfolio
cd /d "%~dp0"
set NODE_ENV=production

REM Read the secret control panel address from server\.env (fallback: /panel)
set "PANEL=/panel"
for /f "usebackq tokens=2 delims==" %%A in (`findstr /b /i "ADMIN_PATH=" "server\.env" 2^>nul`) do set "PANEL=%%A"

REM Laptop Wi-Fi IP - this is how the site opens on phone/tablet (same Wi-Fi)
set "LANIP="
for /f "usebackq delims=" %%A in (`powershell -NoProfile -Command "(Get-NetIPConfiguration ^| Where-Object IPv4DefaultGateway ^| Select-Object -First 1).IPv4Address.IPAddress" 2^>nul`) do set "LANIP=%%A"
if not defined LANIP set "LANIP=localhost"

echo.
echo  ============================================
echo    SURAJ KUMAR - PORTFOLIO STARTER
echo  ============================================
echo.

REM Node.js check
where node >nul 2>nul
if errorlevel 1 (
  echo  [X] Node.js not found.
  echo      Install the LTS version from https://nodejs.org, then run this file again.
  echo.
  pause
  exit /b 1
)

REM Already running? (port 5000)
powershell -NoProfile -Command "try { Invoke-WebRequest -UseBasicParsing -TimeoutSec 2 http://localhost:5000/api/health | Out-Null; exit 0 } catch { exit 1 }" >nul 2>nul
if %errorlevel%==0 (
  echo  The portfolio is already running. Opening the browser...
  start "" http://localhost:5000
  echo.
  echo   WEBSITE       : http://localhost:5000
  echo   PHONE / TABLET: http://%LANIP%:5000    ^(open this on mobile - same Wi-Fi required^)
  echo   CONTROL PANEL : http://localhost:5000%PANEL%
  echo   ^(this link is just for you - visitors never see it^)
  echo.
  echo  To stop it, close the server window.
  echo.
  "%SystemRoot%\System32\timeout.exe" /t 6 >nul 2>nul
  exit /b 0
)

REM First-time setup
if not exist "node_modules" (
  echo  [1/4] First-time setup - npm install ...
  call npm install --no-audit --no-fund
)
if not exist "server\node_modules" (
  echo  [2/4] Backend setup ...
  call npm install --prefix server --no-audit --no-fund
)
if not exist "client\node_modules" (
  echo  [3/4] Frontend setup ...
  call npm install --prefix client --no-audit --no-fund
)
REM Always rebuild - otherwise an old build keeps showing after code changes
if exist "client\dist\index.html" (
  echo  [4/4] Rebuilding the website (5-10 seconds) ...
) else (
  echo  [4/4] Building the website for the first time (1-2 minutes) ...
)
call npm run build
if errorlevel 1 (
  echo.
  echo  [!] Build failed - the previous build is still being served.
  echo.
)

echo.
echo  Starting the server...
echo.
start "" http://localhost:5000
echo  ============================================
echo    WEBSITE       : http://localhost:5000
echo    PHONE / TABLET: http://%LANIP%:5000
echo    ^(open this address on your phone - it must be on the same Wi-Fi^)
echo    CONTROL PANEL : http://localhost:5000%PANEL%
echo    ^(this link is just for you - visitors never see it^)
echo  ============================================
echo.
echo   Closing this window STOPS the server.
echo   You can also stop it with Ctrl + C.
echo.

call npm start

echo.
echo  Server stopped.
pause
