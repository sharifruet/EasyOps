# Restart all Spring services with correct Eureka configuration
# This will stop all services and restart them using the updated start script

Write-Host "Stopping all Spring Boot services..." -ForegroundColor Yellow

# Find all Java processes running Spring Boot services
$services = @("auth-service", "rbac-service", "user-management", "organization-service")
$stopped = 0

foreach ($service in $services) {
    $processes = Get-Process -Name java -ErrorAction SilentlyContinue | Where-Object {
        $cmdLine = (Get-WmiObject Win32_Process -Filter "ProcessId = $($_.Id)").CommandLine
        $cmdLine -like "*$service*" -or $cmdLine -like "*${service}ServiceApplication*"
    }
    
    foreach ($proc in $processes) {
        Write-Host "  Stopping process $($proc.Id) ($service)..." -ForegroundColor Gray
        Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
        $stopped++
    }
}

if ($stopped -eq 0) {
    Write-Host "  No services found to stop" -ForegroundColor Yellow
} else {
    Write-Host "  Stopped $stopped processes" -ForegroundColor Green
    Start-Sleep -Seconds 3
}

Write-Host ""
Write-Host "The start-spring-services.bat script has been updated to:" -ForegroundColor Cyan
Write-Host "  - Always use host.docker.internal (no IP fallback)" -ForegroundColor White
Write-Host "  - Set prefer-ip-address=false" -ForegroundColor White
Write-Host ""
Write-Host "Now run the start script:" -ForegroundColor Yellow
Write-Host "  cd easyops-erp" -ForegroundColor White
Write-Host "  .\scripts\start-spring-services.bat" -ForegroundColor White
Write-Host ""
Write-Host "Or restart just auth-service:" -ForegroundColor Yellow
Write-Host "  .\start-auth-service.bat" -ForegroundColor White

