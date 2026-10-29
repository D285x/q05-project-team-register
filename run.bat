@echo off
setlocal
title Project Team Register - setup
cd /d "%~dp0"

echo.
echo  Project Team Register
echo  ----------------------------------------

where java >nul 2>nul || (echo  [!] Java not found. Install JDK 17 or newer, then run again. & goto :fail)
where mvn  >nul 2>nul || (echo  [!] Maven not found. Install Maven 3.8 or newer and add it to PATH. & goto :fail)
where node >nul 2>nul || (echo  [!] Node.js not found. Install Node 18 or newer, then run again. & goto :fail)
where npm  >nul 2>nul || (echo  [!] npm not found. Reinstall Node.js. & goto :fail)

call :portopen 8080
if not errorlevel 1 (
  echo  [!] Port 8080 is already in use, probably another project's backend.
  echo      Close its server window, then run this again.
  goto :fail
)

echo  [1/4] Installing frontend packages...
pushd frontend
if not exist node_modules (
  call npm install
  if errorlevel 1 (popd & echo  [!] npm install failed. & goto :fail)
) else (
  echo        already installed, skipping
)
popd

echo  [2/4] Starting backend on http://localhost:8080 ...
start "Project Team Register - backend" cmd /k "cd /d "%~dp0backend" && mvn spring-boot:run"

echo  [3/4] Waiting for the backend to be ready (first run downloads dependencies, up to 5 minutes)...
set /a tries=0
:wait
call :portopen 8080
if not errorlevel 1 goto :ready
set /a tries+=1
if %tries% geq 100 (
  echo  [!] Backend did not start in time. Check the backend window for the error.
  goto :fail
)
timeout /t 3 /nobreak >nul
goto :wait

:ready
echo        backend is up

echo  [4/4] Starting frontend on http://localhost:5173 ...
start "Project Team Register - frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"
timeout /t 4 /nobreak >nul
start "" http://localhost:5173

echo.
echo  Done. Close the two server windows to stop the app.
echo.
pause
exit /b 0

:portopen
powershell -NoProfile -Command "try { $c = New-Object Net.Sockets.TcpClient; $c.Connect('localhost', %1); $c.Close(); exit 0 } catch { exit 1 }" >nul 2>nul
exit /b %errorlevel%

:fail
echo.
pause
exit /b 1
