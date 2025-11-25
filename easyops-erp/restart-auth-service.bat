@echo off
REM Restart auth-service with correct Eureka configuration

echo Stopping auth-service...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8083 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 2 /nobreak >nul

echo Starting auth-service with local profile...

set SPRING_PROFILE=local
set EUREKA_INSTANCE_HOSTNAME=host.docker.internal
set EUREKA_INSTANCE_PREFER_IP_ADDRESS=false

set MODULE_DIR=services\auth-service
set LOG_FILE=logs\local-services\auth-service.log

cd /d "%MODULE_DIR%"
set SPRING_PROFILES_ACTIVE=local
call "..\..\mvnw.cmd" clean >nul 2>&1
"..\..\mvnw.cmd" spring-boot:run -Dspring-boot.run.profiles=local -DskipTests=true -Deureka.instance.hostname=host.docker.internal -Deureka.instance.preferIpAddress=false >> "..\..\%LOG_FILE%" 2>&1

cd ..\..

echo Auth-service started in background.
echo Check %LOG_FILE% for progress.
echo Waiting 40 seconds for startup...
timeout /t 40 /nobreak >nul

netstat -ano | findstr :8083 | findstr LISTENING >nul
if %errorlevel% equ 0 (
    echo SUCCESS! Auth-service is running on port 8083!
) else (
    echo Auth-service is still starting. Check %LOG_FILE% for details.
)

