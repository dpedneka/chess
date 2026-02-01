@echo off
REM Get local IP address
echo.
echo ========================================
echo   Chess App - Local Network Setup
echo ========================================
echo.

for /f "tokens=2 delims=:" %%A in ('ipconfig ^| findstr /C:"IPv4 Address" ^| findstr /C:"192" ^| findstr /C:"10"') do (
    set IP=%%A
    set IP=%IP:~1%
)

if "%IP%"=="" (
    echo ERROR: Could not find your IP address!
    echo Please run 'ipconfig' manually and find IPv4 Address
    pause
    exit /b 1
)

echo Your local IP address: %IP%
echo.
echo Copy this IP and use it in these URLs:
echo   - http://%IP%:3000  (Frontend)
echo   - http://%IP%:3001  (Backend)
echo.
echo Follow these steps:
echo 1. Update CORS in server/index.js with your IP
echo 2. Update Socket.io URLs in frontend
echo 3. Start backend: npm run dev (in server folder)
echo 4. Start frontend: npm run dev (in next-js folder)
echo 5. Access from phone: http://%IP%:3000
echo.
echo Press any key to open LOCAL_NETWORK_SETUP.md for detailed instructions...
pause
start notepad LOCAL_NETWORK_SETUP.md
