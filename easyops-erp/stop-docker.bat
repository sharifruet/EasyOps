@echo off
echo ╔════════════════════════════════════════════════════════════╗
echo ║         🛑 Stopping EasyOps ERP Services                  ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

docker-compose stop

echo.
echo ✅ All services stopped
echo.
echo To start again: start-docker.bat
echo To remove all: docker-compose down
echo To remove all + data: docker-compose down -v
echo.
pause

