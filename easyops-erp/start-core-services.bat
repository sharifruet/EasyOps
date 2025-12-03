@echo off
setlocal enableextensions enabledelayedexpansion
REM EasyOps ERP - Core Services Startup Script
REM Starts the lightweight infrastructure stack: Postgres, Redis, liquibase migrations,
REM Adminer UI, Prometheus, Grafana, and Frontend.
REM Note: Eureka and API Gateway are now started locally via start-spring-services.bat

echo ╔════════════════════════════════════════════════════════════╗
echo ║    🚀 EasyOps ERP - Core Services (Docker) Startup        ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

echo 🔍 Checking Docker...
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker Desktop/Engine and try again.
    exit /b 1
)
echo ✅ Docker is running

echo 🔍 Checking Docker Compose...
docker compose version >nul 2>&1
if errorlevel 1 (
    where docker-compose >nul 2>&1
    if errorlevel 1 (
        echo ❌ Docker Compose is not installed.
        exit /b 1
    )
    set "COMPOSE_CMD=docker-compose"
    echo ℹ️  Docker Compose standalone detected
) else (
    set "COMPOSE_CMD=docker compose"
    echo ✅ Docker Compose v2 detected
)

set INFRA=postgres redis
set APPS=adminer
set MONITORING=prometheus grafana frontend

echo.
echo 🐳 Starting database and cache dependencies...
%COMPOSE_CMD% up -d --wait %INFRA%
if errorlevel 1 (
    echo ❌ Failed to start postgres/redis.
    exit /b 1
)
echo ✅ Postgres ^& Redis are ready

echo.
echo 🔄 Running Liquibase migrations...
%COMPOSE_CMD% up --no-deps liquibase
if errorlevel 1 (
    echo ❌ Liquibase migrations failed. Check logs with: %COMPOSE_CMD% logs liquibase
    exit /b 1
)
echo ✅ Liquibase migrations completed

echo.
echo 🚀 Starting core application services...
%COMPOSE_CMD% up -d --wait %APPS%
if errorlevel 1 (
    echo ⚠️  docker compose reported an issue while starting application services. Check logs below.
)
echo.
echo 📊 Current container status:
%COMPOSE_CMD% ps adminer postgres redis liquibase prometheus grafana frontend

echo.
echo 📊 Starting monitoring and frontend services...
%COMPOSE_CMD% up -d --wait %MONITORING%
if errorlevel 1 (
    echo ⚠️  Some monitoring/frontend services may have issues. Check logs below.
)
echo ✅ Monitoring and frontend services started

echo.
echo ⏳ Checking Frontend response (http://localhost:3000)...
powershell -NoProfile -Command "foreach ($i in 1..60) { try { if ((Invoke-WebRequest -UseBasicParsing 'http://localhost:3000').StatusCode -eq 200) { exit 0 } } catch { } Start-Sleep 2 } exit 1"
if errorlevel 1 (
    echo ⚠️  Frontend did not respond within the timeout.
) else (
    echo ✅ Frontend is responding
)

echo.
echo ⏳ Checking Prometheus readiness (http://localhost:9090/-/ready)...
powershell -NoProfile -Command "foreach ($i in 1..60) { try { if ((Invoke-WebRequest -UseBasicParsing 'http://localhost:9090/-/ready').StatusCode -eq 200) { exit 0 } } catch { } Start-Sleep 2 } exit 1"
if errorlevel 1 (
    echo ⚠️  Prometheus did not report ready within the timeout.
) else (
    echo ✅ Prometheus is ready
)

echo.
echo ⏳ Checking Grafana response (http://localhost:3001/login)...
powershell -NoProfile -Command "foreach ($i in 1..60) { try { if ((Invoke-WebRequest -UseBasicParsing 'http://localhost:3001/login').StatusCode -eq 200) { exit 0 } } catch { } Start-Sleep 2 } exit 1"
if errorlevel 1 (
    echo ⚠️  Grafana did not respond with HTTP 200 within the timeout.
) else (
    echo ✅ Grafana is responding
)

echo.
echo 📋 Access URLs
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo PostgreSQL:  jdbc:postgresql://localhost:5432/easyops
echo Adminer:     http://localhost:8080
echo Frontend:    http://localhost:3000
echo Prometheus:  http://localhost:9090
echo Grafana:     http://localhost:3001 (admin/admin)
echo.
echo ℹ️  Note: Eureka and API Gateway should be started locally via:
echo    scripts\start-spring-services.bat
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 🛠️  Useful commands
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo View logs:       %COMPOSE_CMD% logs -f postgres
echo Stop services:   %COMPOSE_CMD% stop %APPS% %MONITORING% %INFRA%
echo Remove services: %COMPOSE_CMD% down -v
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo ✅ Core services are up!
echo.

