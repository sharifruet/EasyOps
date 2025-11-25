# Start auth-service with correct Eureka configuration
cd C:\workspace\together\EasyOps\easyops-erp\services\auth-service

$env:EUREKA_INSTANCE_HOSTNAME = "host.docker.internal"
$env:EUREKA_INSTANCE_PREFER_IP_ADDRESS = "false"
$env:SPRING_PROFILES_ACTIVE = "local"

Write-Host "Starting auth-service with Eureka hostname: host.docker.internal" -ForegroundColor Green
Write-Host "This window will show the service logs. Keep it open." -ForegroundColor Yellow
Write-Host ""

$mavenCmd = "..\..\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=local -DskipTests=true -Deureka.instance.hostname=host.docker.internal -Deureka.instance.preferIpAddress=false"

Invoke-Expression $mavenCmd

