# Verify Accounting Service Deployment
# Run this script after accounting-service is built

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Accounting Service Verification" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if accounting service is running
Write-Host "1. Checking if accounting-service is running..." -ForegroundColor Yellow
$accountingContainer = docker ps --filter "name=accounting-service" --format "{{.Names}}"
if ($accountingContainer) {
    Write-Host "   ✓ Accounting service container is running" -ForegroundColor Green
} else {
    Write-Host "   ✗ Accounting service is NOT running" -ForegroundColor Red
    Write-Host "   Run: docker-compose up -d accounting-service" -ForegroundColor Yellow
    exit 1
}

# Check health endpoint
Write-Host ""
Write-Host "2. Checking accounting service health..." -ForegroundColor Yellow
try {
    $health = Invoke-WebRequest -Uri "http://localhost:8088/actuator/health" -UseBasicParsing -ErrorAction Stop
    if ($health.StatusCode -eq 200) {
        Write-Host "   ✓ Accounting service is healthy" -ForegroundColor Green
    }
} catch {
    Write-Host "   ✗ Accounting service health check failed" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
}

# Check Eureka registration
Write-Host ""
Write-Host "3. Checking Eureka registration..." -ForegroundColor Yellow
try {
    $eureka = Invoke-WebRequest -Uri "http://localhost:8761/eureka/apps/ACCOUNTING-SERVICE" -UseBasicParsing -ErrorAction Stop
    Write-Host "   ✓ Accounting service registered with Eureka" -ForegroundColor Green
} catch {
    Write-Host "   ⚠ Not yet registered with Eureka (may take a moment)" -ForegroundColor Yellow
}

# Check API Gateway routing
Write-Host ""
Write-Host "4. Testing API Gateway routing..." -ForegroundColor Yellow
Write-Host "   Waiting 5 seconds for services to stabilize..." -ForegroundColor Gray
Start-Sleep -Seconds 5

try {
    # Note: This will return 401 if not authenticated, but that's OK - it means routing works
    $response = Invoke-WebRequest -Uri "http://localhost:8081/api/accounting/coa/organization/test" -UseBasicParsing -ErrorAction SilentlyContinue
    Write-Host "   ✓ API Gateway routing to accounting service is working" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode.Value__ -eq 401 -or $_.Exception.Response.StatusCode.Value__ -eq 403) {
        Write-Host "   ✓ API Gateway routing works (needs auth token)" -ForegroundColor Green
    } else {
        Write-Host "   ✗ API Gateway routing issue: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Check Swagger UI
Write-Host ""
Write-Host "5. Checking API Documentation..." -ForegroundColor Yellow
try {
    $swagger = Invoke-WebRequest -Uri "http://localhost:8088/swagger-ui.html" -UseBasicParsing -ErrorAction Stop
    if ($swagger.StatusCode -eq 200) {
        Write-Host "   ✓ Swagger UI is accessible" -ForegroundColor Green
        Write-Host "   URL: http://localhost:8088/swagger-ui.html" -ForegroundColor Cyan
    }
} catch {
    Write-Host "   ✗ Swagger UI not accessible" -ForegroundColor Red
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Verification Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Open frontend: http://localhost:3000" -ForegroundColor White
Write-Host "2. Login with: admin@easyops.com / Admin123!" -ForegroundColor White
Write-Host "3. Click 'Accounting' in the sidebar" -ForegroundColor White
Write-Host "4. Select 'Chart of Accounts' or 'Journal Entry'" -ForegroundColor White
Write-Host ""
Write-Host "API Documentation: http://localhost:8088/swagger-ui.html" -ForegroundColor Cyan
Write-Host ""

