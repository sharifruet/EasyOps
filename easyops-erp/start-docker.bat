@echo off
echo ╔════════════════════════════════════════════════════════════╗
echo ║         🚀 EasyOps ERP - Docker Startup Script            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker Desktop and try again.
    exit /b 1
)
echo ✅ Docker is running
echo.

REM Start all services
echo 🐳 Starting EasyOps ERP services...
echo.

docker compose version >nul 2>&1
if errorlevel 1 (
    where docker-compose >nul 2>&1
    if errorlevel 1 (
        echo ❌ Docker Compose is not installed.
        exit /b 1
    )
    set "COMPOSE_CMD=docker-compose"
) else (
    set "COMPOSE_CMD=docker compose"
)

%COMPOSE_CMD% up -d

echo.
echo ⏳ Waiting for services to initialize...
timeout /t 30 /nobreak >nul

echo.
echo 📊 Service Status:
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
%COMPOSE_CMD% ps
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

echo ╔════════════════════════════════════════════════════════════╗
echo ║     🎉 EasyOps ERP is starting up!                        ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 📋 Access URLs:
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo Frontend:        http://localhost:3000
echo API Gateway:     http://localhost:8081
echo Eureka:          http://localhost:8761
echo Adminer:         http://localhost:8080
echo Grafana:         http://localhost:3001
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 🔐 Login Credentials:
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo Username: admin
echo Password: Admin123!
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 🛠️  Useful Commands:
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo View logs:         %COMPOSE_CMD% logs -f
echo Stop services:     stop-docker.bat
echo Restart services:  %COMPOSE_CMD% restart
echo Remove services:   %COMPOSE_CMD% down
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo ⏳ Note: Frontend may take 1-2 more minutes to fully start.
echo    Watch logs with: %COMPOSE_CMD% logs -f frontend
echo.
echo Happy coding! 🚀
echo.
pause

