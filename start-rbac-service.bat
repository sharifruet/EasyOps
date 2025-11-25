@echo off
REM Start RBAC service with correct Eureka configuration

cd /d "%~dp0\easyops-erp\services\rbac-service"

set EUREKA_INSTANCE_HOSTNAME=host.docker.internal
set EUREKA_INSTANCE_PREFER_IP_ADDRESS=false
set SPRING_PROFILES_ACTIVE=local

echo Starting RBAC service with Eureka hostname: host.docker.internal
echo This window will show the service logs. Keep it open.
echo.

call ..\..\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=local -DskipTests=true -Deureka.instance.hostname=host.docker.internal -Deureka.instance.preferIpAddress=false

pause

