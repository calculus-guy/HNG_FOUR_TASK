
# --- Run this in PowerShell to install all dependencies ---

Write-Host "Installing dependencies for all services..." -ForegroundColor Green

$services = @(
    "api-gateway",
    "user-service",
    "template-service",
    "email-service",
    "push-service"
)

foreach ($service in $services) {
    Write-Host "`nInstalling dependencies for $service..." -ForegroundColor Cyan
    
    if (Test-Path ".\$service\package.json") {
        Set-Location ".\$service"
        npm install
        Set-Location ".."
        Write-Host "$service dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "$service\package.json not found" -ForegroundColor Yellow
    }
}

Write-Host "`nAll dependencies installed!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Copy .env.example to .env and fill in your credentials"
Write-Host "2. Run: docker-compose up --build"
Write-Host "3. Access API docs at: http://localhost:3000/api/docs"
Write-Host "4. Check health at: http://localhost:3000/api/v1/health"
