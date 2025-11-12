@echo off
setlocal enableextensions enabledelayedexpansion
echo ╔════════════════════════════════════════════════════════════╗
echo ║    🚀 EasyOps ERP - Core Services (Docker) Startup        ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker Desktop and try again.
    exit /b 1
)
echo ✅ Docker is running
echo.

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
echo.

set INFRA=postgres redis
set APPS=adminer eureka api-gateway frontend
set MONITOR=prometheus grafana

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
    echo ⚠️  docker compose reported an issue while starting application services. Review logs with: %COMPOSE_CMD% logs
)
echo.

echo 📈 Starting monitoring stack (Prometheus + Grafana)...
%COMPOSE_CMD% up -d --wait %MONITOR%
if errorlevel 1 (
    echo ⚠️  docker compose reported an issue while starting monitoring services. Review logs with: %COMPOSE_CMD% logs prometheus grafana
)
echo.

echo 📊 Running containers:
%COMPOSE_CMD% ps adminer eureka api-gateway frontend postgres redis liquibase prometheus grafana
echo.

echo ⏳ Checking Eureka health (http://localhost:8761/actuator/health)...
powershell -NoProfile -Command "foreach ($i in 1..60) { try { if ((Invoke-WebRequest -UseBasicParsing 'http://localhost:8761/actuator/health').StatusCode -eq 200) { exit 0 } } catch { } Start-Sleep 2 } exit 1"
if errorlevel 1 (
    echo ⚠️  Eureka did not report healthy within the timeout.
) else (
    echo ✅ Eureka is healthy
)

echo.
echo ⏳ Checking API Gateway health (http://localhost:8081/actuator/health)...
powershell -NoProfile -Command "foreach ($i in 1..60) { try { if ((Invoke-WebRequest -UseBasicParsing 'http://localhost:8081/actuator/health').StatusCode -eq 200) { exit 0 } } catch { } Start-Sleep 2 } exit 1"
if errorlevel 1 (
    echo ⚠️  API Gateway did not report healthy within the timeout.
) else (
    echo ✅ API Gateway is healthy
)

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
echo 📋 Access URLs:
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo PostgreSQL:  jdbc:postgresql://localhost:5432/easyops
echo Adminer:     http://localhost:8080
echo Eureka:      http://localhost:8761
echo API Gateway: http://localhost:8081
echo Frontend:    http://localhost:3000
echo Prometheus:  http://localhost:9090
echo Grafana:     http://localhost:3001  (admin / admin)
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 🛠️  Useful commands:
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo View logs:       %COMPOSE_CMD% logs -f api-gateway
echo Stop services:   %COMPOSE_CMD% stop %APPS% %INFRA% %MONITOR%
echo Remove services: %COMPOSE_CMD% down -v
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo ✅ Core services are up!
echo.

