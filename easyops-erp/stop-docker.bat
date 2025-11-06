@echo off
echo ╔════════════════════════════════════════════════════════════╗
echo ║         🛑 Stopping EasyOps ERP Services                  ║
echo ╚════════════════════════════════════════════════════════════╝
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

%COMPOSE_CMD% stop

echo.
echo ✅ All services stopped
echo.
echo To start again: start-docker.bat
echo To remove all: %COMPOSE_CMD% down
echo To remove all + data: %COMPOSE_CMD% down -v
echo.
pause

