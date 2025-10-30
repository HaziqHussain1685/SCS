# Write-Host with colors for better output
Write-Host "`n🚀 SmartCam Shield - Frontend Setup Script" -ForegroundColor Cyan
Write-Host "==========================================`n" -ForegroundColor Cyan

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if npm is installed
Write-Host "Checking npm installation..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed!" -ForegroundColor Red
    exit 1
}

Write-Host "`n📦 Installing frontend dependencies..." -ForegroundColor Yellow
Write-Host "This may take a few minutes...`n" -ForegroundColor Gray

# Install dependencies
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Dependencies installed successfully!" -ForegroundColor Green
} else {
    Write-Host "`n❌ Failed to install dependencies!" -ForegroundColor Red
    exit 1
}

Write-Host "`n📋 Setup Complete!" -ForegroundColor Green
Write-Host "==========================================`n" -ForegroundColor Cyan

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Start the backend API:" -ForegroundColor White
Write-Host "   cd ..\scanner" -ForegroundColor Gray
Write-Host "   python scanner_api.py`n" -ForegroundColor Gray

Write-Host "2. Start the frontend (in a new terminal):" -ForegroundColor White
Write-Host "   cd frontend" -ForegroundColor Gray
Write-Host "   npm run dev`n" -ForegroundColor Gray

Write-Host "3. Open your browser to:" -ForegroundColor White
Write-Host "   http://localhost:3000`n" -ForegroundColor Cyan

Write-Host "Happy coding! 🎉" -ForegroundColor Green
