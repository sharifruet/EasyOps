# Restart auth-service with correct Eureka configuration
$ErrorActionPreference = "Stop"

Write-Host "Stopping auth-service..."
$conn = Get-NetTCPConnection -LocalPort 8083 -State Listen -ErrorAction SilentlyContinue
if ($conn) {
    Stop-Process -Id $conn.OwningProcess -Force
    Start-Sleep -Seconds 2
    Write-Host "Stopped auth-service"
} else {
    Write-Host "No process found on port 8083"
}

Write-Host ""
Write-Host "Starting auth-service with local profile..."
$moduleDir = Join-Path $PSScriptRoot "services\auth-service"
$logFile = Join-Path $PSScriptRoot "logs\local-services\auth-service.log"

Push-Location $moduleDir

# Set environment variables
$env:SPRING_PROFILES_ACTIVE = "local"
$env:EUREKA_INSTANCE_HOSTNAME = "host.docker.internal"
$env:EUREKA_INSTANCE_PREFER_IP_ADDRESS = "false"

# Start Maven using cmd.exe for proper argument handling
$mvnw = Join-Path $PSScriptRoot "mvnw.cmd"
$cmd = "`"$mvnw`" spring-boot:run -Dspring-boot.run.profiles=local -DskipTests=true -Deureka.instance.hostname=host.docker.internal -Deureka.instance.preferIpAddress=false >> `"$logFile`" 2>&1"
Start-Process cmd.exe -ArgumentList "/c", "start", "/b", "easyops-auth-service", "/c", $cmd -WindowStyle Hidden

Pop-Location

Write-Host "Auth-service started. Check $logFile for progress."
Write-Host "Waiting 30 seconds for startup..."
Start-Sleep -Seconds 30

$conn = Get-NetTCPConnection -LocalPort 8083 -State Listen -ErrorAction SilentlyContinue
if ($conn) {
    Write-Host "Auth-service is running on port 8083!"
    
    Write-Host ""
    Write-Host "Checking Eureka registration..."
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8761/eureka/apps/AUTH-SERVICE" -UseBasicParsing
        if ($response.Content -match 'hostName>([^<]+)</hostName') {
            $hostname = $matches[1]
            Write-Host "Registered hostname: $hostname"
            if ($hostname -eq 'host.docker.internal') {
                Write-Host "SUCCESS! Auth-service registered correctly!"
            } else {
                Write-Host "Still using: $hostname (may need more time to re-register)"
            }
        }
    } catch {
        Write-Host "Could not check Eureka registration: $_"
    }
} else {
    Write-Host "Auth-service is still starting. Check $logFile for details."
}
