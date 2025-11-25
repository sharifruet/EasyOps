# Quick script to restart auth-service with correct Eureka configuration
# This will stop the current auth-service and provide instructions to restart it

Write-Host "Checking for running auth-service on port 8083..." -ForegroundColor Cyan

$connection = Get-NetTCPConnection -LocalPort 8083 -ErrorAction SilentlyContinue | Select-Object -First 1
if ($connection) {
    $processId = $connection.OwningProcess
    $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
    if ($process) {
        Write-Host "Found auth-service process (PID: $processId)" -ForegroundColor Green
        Write-Host ""
        Write-Host "Stopping auth-service to apply new Eureka configuration..." -ForegroundColor Yellow
        Stop-Process -Id $processId -Force
        Start-Sleep -Seconds 2
        Write-Host "Auth-service stopped" -ForegroundColor Green
    }
} else {
    Write-Host "No process found on port 8083. Auth-service may not be running." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Navigate to the auth-service directory:" -ForegroundColor White
Write-Host "   cd easyops-erp\services\auth-service" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Set environment variables and start the service:" -ForegroundColor White
Write-Host '   $env:EUREKA_INSTANCE_HOSTNAME = "host.docker.internal"' -ForegroundColor Gray
Write-Host '   $env:EUREKA_INSTANCE_PREFER_IP_ADDRESS = "false"' -ForegroundColor Gray
Write-Host '   $env:SPRING_PROFILES_ACTIVE = "local"' -ForegroundColor Gray
Write-Host "   ..\..\mvnw spring-boot:run -Dspring-boot.run.profiles=local" -ForegroundColor Gray
Write-Host ""
Write-Host "   OR use the start script from the root directory:" -ForegroundColor White
Write-Host "   cd easyops-erp" -ForegroundColor Gray
Write-Host "   .\scripts\start-spring-services.bat" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Wait for the service to register with Eureka (about 30 seconds)" -ForegroundColor White
Write-Host ""
Write-Host "4. Verify registration:" -ForegroundColor White
Write-Host "   curl.exe -s http://localhost:8761/eureka/apps/AUTH-SERVICE | Select-String -Pattern hostName" -ForegroundColor Gray
Write-Host "   (Should show: host.docker.internal)" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Test the API Gateway:" -ForegroundColor White
$testCmd = 'curl.exe -X POST http://localhost:8081/api/auth/login -H "Content-Type: application/json" -d @login-request.json'
Write-Host "   $testCmd" -ForegroundColor Gray
