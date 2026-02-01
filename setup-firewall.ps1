# Chess App - Windows Firewall Setup Script
# Run as Administrator!

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Chess App - Firewall Configuration" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as admin
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: Please run this script as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as administrator'" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Adding firewall rules for Chess App..." -ForegroundColor Yellow
Write-Host ""

# Add rule for frontend (port 3000)
try {
    netsh advfirewall firewall add rule `
        name="Chess App Frontend" `
        dir=in `
        action=allow `
        protocol=tcp `
        localport=3000 `
        remoteip=localsubnet `
        profile=private
    Write-Host "✓ Frontend (port 3000) - Added" -ForegroundColor Green
} catch {
    Write-Host "✗ Frontend rule failed" -ForegroundColor Red
}

# Add rule for backend (port 3001)
try {
    netsh advfirewall firewall add rule `
        name="Chess App Backend" `
        dir=in `
        action=allow `
        protocol=tcp `
        localport=3001 `
        remoteip=localsubnet `
        profile=private
    Write-Host "✓ Backend (port 3001) - Added" -ForegroundColor Green
} catch {
    Write-Host "✗ Backend rule failed" -ForegroundColor Red
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Firewall configuration complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Show current IP
$ipConfig = ipconfig | Select-String "IPv4 Address" | Select-String -Pattern "192|10"
Write-Host "Your Local IP Addresses:" -ForegroundColor Yellow
Write-Host $ipConfig
Write-Host ""

Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Update CORS in server/index.js with your IP" -ForegroundColor White
Write-Host "2. Update Socket.io URLs in frontend files" -ForegroundColor White
Write-Host "3. Start backend: npm run dev" -ForegroundColor White
Write-Host "4. Start frontend: npm run dev" -ForegroundColor White
Write-Host "5. Access from phone: http://YOUR_IP:3000" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to exit"
