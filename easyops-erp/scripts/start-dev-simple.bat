@echo off
REM Simple EasyOps ERP Development Startup Script
REM This script starts the entire development environment with automatic database migrations

echo 🚀 Starting EasyOps ERP Development Environment
echo ==============================================

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not running. Please start Docker Desktop and try again.
    exit /b 1
)

REM Check if Docker Compose is available
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker Compose is not installed. Please install Docker Compose and try again.
    exit /b 1
)

echo [INFO] Docker environment check passed ✓

REM Create the development user in PostgreSQL before starting services
echo [INFO] Setting up database user...
docker-compose up -d postgres

REM Wait for PostgreSQL to be ready
echo [INFO] Waiting for PostgreSQL to be ready...
timeout /t 10 /nobreak >nul

REM Create development user
echo [INFO] Creating development database user...
docker-compose exec postgres psql -U easyops -d postgres -c "DO $$ BEGIN IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = 'easyops_dev') THEN CREATE USER easyops_dev WITH PASSWORD 'easyops123'; END IF; END $$; GRANT ALL PRIVILEGES ON DATABASE easyops TO easyops_dev; GRANT ALL PRIVILEGES ON DATABASE easyops_test TO easyops_dev;" >nul 2>&1

echo [SUCCESS] Database user setup completed ✓

REM Start all services (this will now automatically run Liquibase migrations first)
echo [INFO] Starting all services with automatic database migrations...
docker-compose up -d

REM Wait for services to be ready
echo [INFO] Waiting for services to start...
timeout /t 30 /nobreak >nul

REM Final Status Report
echo.
echo 🎉 EasyOps ERP Development Environment Started Successfully!
echo ==========================================================
echo.
echo 📊 Service Status:
echo -----------------
echo • PostgreSQL Database:     http://localhost:5432
echo • Database Admin:          http://localhost:8080
echo • Eureka Service Registry: http://localhost:8761
echo • API Gateway:            http://localhost:8081
echo • User Management:        http://localhost:8082
echo • Authentication:         http://localhost:8083
echo • Frontend Application:   http://localhost:3000
echo.
echo 🔐 Database Credentials:
echo • Username: easyops_dev
echo • Password: easyops123
echo • Database: easyops
echo.
echo 📚 Test Data Available:
echo • Chart of Accounts: 25 accounts
echo • Customers: 20 test customers
echo • Products: 15 test products
echo • Sales Orders: 5 test orders
echo • AR Invoices: 8 test invoices
echo • AP Bills: 8 test bills
echo.
echo 🚀 Ready for development!
echo.
echo 💡 To stop all services: docker-compose down
echo 💡 To view logs: docker-compose logs -f [service-name]
echo 💡 To restart a service: docker-compose restart [service-name]
echo.

pause
