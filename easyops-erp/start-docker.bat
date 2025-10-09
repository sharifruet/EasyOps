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
docker-compose up -d

echo.
echo ⏳ Waiting for services to initialize...
timeout /t 30 /nobreak >nul

echo.
echo 📊 Service Status:
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
docker-compose ps
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
echo RabbitMQ:        http://localhost:15672
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
echo View logs:         docker-compose logs -f
echo Stop services:     stop-docker.bat
echo Restart services:  docker-compose restart
echo Remove services:   docker-compose down
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo ⏳ Note: Frontend may take 1-2 more minutes to fully start.
echo    Watch logs with: docker-compose logs -f frontend
echo.
echo Happy coding! 🚀
echo.
pause

