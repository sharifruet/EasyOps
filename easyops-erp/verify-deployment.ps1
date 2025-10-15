# EasyOps ERP - Deployment Verification Script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  EasyOps ERP - Deployment Verification" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Docker containers
Write-Host "Checking Docker Containers..." -ForegroundColor Yellow
Write-Host ""
docker-compose ps
Write-Host ""

# Check Eureka registration
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Checking Service Registration (Eureka)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

try {
    $eureka = Invoke-RestMethod -Uri "http://localhost:8761/eureka/apps" -Method Get -Headers @{"Accept"="application/json"} -ErrorAction Stop
    $registeredServices = $eureka.applications.application.Count
    Write-Host "✓ Eureka is running" -ForegroundColor Green
    Write-Host "  Registered services: $registeredServices" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "✗ Eureka is not accessible" -ForegroundColor Red
    Write-Host ""
}

# Check each service health
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Service Health Checks" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$services = @(
    @{Name="API Gateway"; Port=8081},
    @{Name="User Management"; Port=8082},
    @{Name="Auth Service"; Port=8083},
    @{Name="RBAC Service"; Port=8084},
    @{Name="Organization Service"; Port=8085},
    @{Name="Notification Service"; Port=8086},
    @{Name="Monitoring Service"; Port=8087},
    @{Name="Accounting Service"; Port=8088},
    @{Name="AR Service"; Port=8090},
    @{Name="AP Service"; Port=8091},
    @{Name="Bank Service"; Port=8092}
)

$healthyCount = 0
$totalServices = $services.Count

foreach ($service in $services) {
    $url = "http://localhost:$($service.Port)/actuator/health"
    try {
        $response = Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 5 -ErrorAction Stop
        if ($response.status -eq "UP") {
            Write-Host "✓ $($service.Name) (Port $($service.Port))" -ForegroundColor Green
            $healthyCount++
        } else {
            Write-Host "⚠ $($service.Name) (Port $($service.Port)) - Status: $($response.status)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "✗ $($service.Name) (Port $($service.Port)) - Not responding" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Health Summary: $healthyCount/$totalServices services are healthy" -ForegroundColor $(if ($healthyCount -eq $totalServices) { "Green" } else { "Yellow" })
Write-Host ""

# Check Frontend
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Frontend Check" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "✓ Frontend is accessible at http://localhost:3000" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Frontend is not accessible" -ForegroundColor Red
}
Write-Host ""

# Check Database
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Database Check" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$postgresRunning = docker-compose ps postgres | Select-String "running"
if ($postgresRunning) {
    Write-Host "✓ PostgreSQL is running" -ForegroundColor Green
} else {
    Write-Host "✗ PostgreSQL is not running" -ForegroundColor Red
}
Write-Host ""

# Check Redis
$redisRunning = docker-compose ps redis | Select-String "running"
if ($redisRunning) {
    Write-Host "✓ Redis is running" -ForegroundColor Green
} else {
    Write-Host "✗ Redis is not running" -ForegroundColor Red
}
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Verification Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($healthyCount -eq $totalServices -and $postgresRunning -and $redisRunning) {
    Write-Host "✓ ALL SYSTEMS OPERATIONAL!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your EasyOps ERP system is fully deployed and ready to use!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Access your application:" -ForegroundColor Yellow
    Write-Host "  URL: http://localhost:3000" -ForegroundColor White
    Write-Host "  Login: admin@easyops.com" -ForegroundColor White
    Write-Host "  Password: Admin123!" -ForegroundColor White
} else {
    Write-Host "⚠ Some services are not fully operational" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  1. Wait 1-2 more minutes for services to start" -ForegroundColor White
    Write-Host "  2. Check logs: docker-compose logs -f" -ForegroundColor White
    Write-Host "  3. Restart problematic services: docker-compose restart service-name" -ForegroundColor White
}

Write-Host ""
Write-Host "Additional Resources:" -ForegroundColor Yellow
Write-Host "  Eureka Dashboard: http://localhost:8761" -ForegroundColor White
Write-Host "  Grafana: http://localhost:3001 (admin/admin)" -ForegroundColor White
Write-Host "  Prometheus: http://localhost:9090" -ForegroundColor White
Write-Host "  Adminer (DB): http://localhost:8080" -ForegroundColor White
Write-Host ""

