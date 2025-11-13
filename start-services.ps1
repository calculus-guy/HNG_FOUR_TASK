# Microservices Startup Script
# This script starts all services in the correct order and verifies they're running

Write-Host "=== Starting Notification Microservices ===" -ForegroundColor Cyan
Write-Host ""

# Function to check if a service is healthy
function Test-ServiceHealth {
    param(
        [string]$Url,
        [string]$ServiceName
    )
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec 5 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "✓ $ServiceName is healthy" -ForegroundColor Green
            return $true
        }
    }
    catch {
        Write-Host "✗ $ServiceName is not responding" -ForegroundColor Red
        return $false
    }
}

# Stop existing containers
Write-Host "Stopping existing containers..." -ForegroundColor Yellow
docker-compose down
Write-Host ""

# Start infrastructure services first
Write-Host "Starting infrastructure services (Postgres, Redis, RabbitMQ)..." -ForegroundColor Yellow
docker-compose up -d postgres redis rabbitmq
Write-Host ""

# Wait for infrastructure to be ready
Write-Host "Waiting for infrastructure services to be ready (30 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30
Write-Host ""

# Start application services
Write-Host "Starting application services..." -ForegroundColor Yellow
docker-compose up -d user-service template-service
Write-Host ""

# Wait for user and template services
Write-Host "Waiting for user-service and template-service to be ready (20 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 20
Write-Host ""

# Start gateway
Write-Host "Starting API Gateway..." -ForegroundColor Yellow
docker-compose up -d api-gateway
Write-Host ""

# Start worker services
Write-Host "Starting worker services (email-service, push-service)..." -ForegroundColor Yellow
docker-compose up -d email-service push-service
Write-Host ""

# Wait for all services to stabilize
Write-Host "Waiting for all services to stabilize (15 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 15
Write-Host ""

# Health checks
Write-Host "=== Running Health Checks ===" -ForegroundColor Cyan
Write-Host ""

$allHealthy = $true

# Check API Gateway
if (-not (Test-ServiceHealth -Url "http://localhost:3000/api/v1/health" -ServiceName "API Gateway")) {
    $allHealthy = $false
}

# Check User Service
if (-not (Test-ServiceHealth -Url "http://localhost:4001/health" -ServiceName "User Service")) {
    $allHealthy = $false
}

# Check Template Service
if (-not (Test-ServiceHealth -Url "http://localhost:4002/api/v1/templates/health" -ServiceName "Template Service")) {
    $allHealthy = $false
}

Write-Host ""

# Check infrastructure
Write-Host "Checking infrastructure services..." -ForegroundColor Yellow

# Check Postgres
try {
    $pgResult = docker-compose exec -T postgres pg_isready -U postgres
    if ($pgResult -match "accepting connections") {
        Write-Host "✓ PostgreSQL is ready" -ForegroundColor Green
    }
}
catch {
    Write-Host "✗ PostgreSQL is not ready" -ForegroundColor Red
    $allHealthy = $false
}

# Check Redis
try {
    $redisResult = docker-compose exec -T redis redis-cli ping
    if ($redisResult -match "PONG") {
        Write-Host "✓ Redis is ready" -ForegroundColor Green
    }
}
catch {
    Write-Host "✗ Redis is not ready" -ForegroundColor Red
    $allHealthy = $false
}

# Check RabbitMQ
try {
    $rabbitResult = docker-compose exec -T rabbitmq rabbitmq-diagnostics ping
    if ($rabbitResult -match "Ping succeeded") {
        Write-Host "✓ RabbitMQ is ready" -ForegroundColor Green
    }
}
catch {
    Write-Host "✗ RabbitMQ is not ready" -ForegroundColor Red
    $allHealthy = $false
}

Write-Host ""
Write-Host "=== Service Status ===" -ForegroundColor Cyan
docker-compose ps
Write-Host ""

if ($allHealthy) {
    Write-Host "=== All Services Started Successfully! ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Service URLs:" -ForegroundColor Cyan
    Write-Host "  API Gateway:       http://localhost:3000/api/v1/health" -ForegroundColor White
    Write-Host "  API Docs:          http://localhost:3000/api/docs" -ForegroundColor White
    Write-Host "  User Service:      http://localhost:4001/health" -ForegroundColor White
    Write-Host "  User Service Docs: http://localhost:4001/api/docs" -ForegroundColor White
    Write-Host "  Template Service:  http://localhost:4002/api/v1/templates/health" -ForegroundColor White
    Write-Host "  RabbitMQ Mgmt:     http://localhost:15672 (admin/admin123)" -ForegroundColor White
    Write-Host ""
    Write-Host "To view logs: docker-compose logs -f [service-name]" -ForegroundColor Yellow
    Write-Host "To stop: docker-compose down" -ForegroundColor Yellow
}
else {
    Write-Host "=== Some Services Failed to Start ===" -ForegroundColor Red
    Write-Host ""
    Write-Host "Check logs with: docker-compose logs [service-name]" -ForegroundColor Yellow
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "  - Check .env files are configured correctly" -ForegroundColor White
    Write-Host "  - Verify ports are not already in use" -ForegroundColor White
    Write-Host "  - Ensure Docker has enough resources" -ForegroundColor White
    Write-Host "  - Check Dockerfile configurations" -ForegroundColor White
}
