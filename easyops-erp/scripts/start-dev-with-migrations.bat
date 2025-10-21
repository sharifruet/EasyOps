@echo off
REM EasyOps ERP Development Startup Script with Database Migrations
REM This script starts the entire development environment with proper database initialization

echo 🚀 Starting EasyOps ERP Development Environment with Database Migrations
echo ==================================================================

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

REM Step 1: Start Infrastructure Services
echo [INFO] Step 1: Starting infrastructure services (PostgreSQL, Redis, Adminer)...
docker-compose up -d postgres redis adminer

REM Wait for PostgreSQL to be ready
echo [INFO] Waiting for PostgreSQL to be ready...
timeout /t 10 /nobreak >nul

REM Step 2: Create the development user and databases
echo [INFO] Step 2: Setting up database users and permissions...
docker-compose exec postgres psql -U easyops -d postgres -c "DO $$ BEGIN IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = 'easyops_dev') THEN CREATE USER easyops_dev WITH PASSWORD 'easyops123'; END IF; END $$; GRANT ALL PRIVILEGES ON DATABASE easyops TO easyops_dev; GRANT ALL PRIVILEGES ON DATABASE easyops_test TO easyops_dev;"

if %errorlevel% equ 0 (
    echo [SUCCESS] Database users and permissions configured ✓
) else (
    echo [WARNING] Database user setup had issues, but continuing...
)

REM Step 3: Run Liquibase migrations
echo [INFO] Step 3: Running Liquibase database migrations...
cd database-versioning

REM Run Liquibase using Docker (since Liquibase CLI might not be available on Windows)
echo [INFO] Using Docker to run Liquibase migrations...
docker run --rm --network easyops_easyops-network -v "%cd%/changelog:/liquibase/changelog" -v "%cd%/liquibase.properties:/liquibase/liquibase.properties" liquibase/liquibase:4.20 --defaultsFile=/liquibase/liquibase.properties --url="jdbc:postgresql://postgres:5432/easyops" --username=easyops_dev --password=easyops123 update

if %errorlevel% equ 0 (
    echo [SUCCESS] Database migrations completed successfully ✓
) else (
    echo [ERROR] Database migrations failed!
    exit /b 1
)

cd ..

REM Step 4: Start Service Discovery (Eureka)
echo [INFO] Step 4: Starting Service Discovery (Eureka)...
docker-compose up -d eureka

REM Wait for Eureka to be ready
echo [INFO] Waiting for Eureka to be ready...
timeout /t 30 /nobreak >nul

REM Step 5: Start Core Services
echo [INFO] Step 5: Starting core services (API Gateway, User Management, Auth, RBAC)...
docker-compose up -d api-gateway user-management auth-service rbac-service organization-service

REM Wait for core services to be ready
echo [INFO] Waiting for core services to be ready...
timeout /t 30 /nobreak >nul

REM Step 6: Start Business Services
echo [INFO] Step 6: Starting business services (Notification, Monitoring, Accounting, AR, AP, Bank, Sales)...
docker-compose up -d notification-service monitoring-service accounting-service ar-service ap-service bank-service sales-service

REM Wait for business services to be ready
echo [INFO] Waiting for business services to be ready...
timeout /t 30 /nobreak >nul

REM Step 7: Start Frontend
echo [INFO] Step 7: Starting frontend application...
docker-compose up -d frontend

REM Wait for frontend to be ready
echo [INFO] Waiting for frontend to be ready...
timeout /t 30 /nobreak >nul

REM Step 8: Start Monitoring Stack
echo [INFO] Step 8: Starting monitoring stack (Prometheus, Grafana)...
docker-compose up -d prometheus grafana

REM Wait for monitoring services
echo [INFO] Waiting for monitoring services to be ready...
timeout /t 15 /nobreak >nul

REM Final Status Report
echo.
echo 🎉 EasyOps ERP Development Environment Started Successfully!
echo ==========================================================
echo.
echo 📊 Service Status:
echo -----------------
echo • PostgreSQL Database:     http://localhost:5432 (via Adminer: http://localhost:8080)
echo • Redis Cache:            http://localhost:6379
echo • Eureka Service Registry: http://localhost:8761
echo • API Gateway:            http://localhost:8081
echo • User Management:        http://localhost:8082
echo • Authentication:         http://localhost:8083
echo • RBAC Service:           http://localhost:8084
echo • Organization Service:   http://localhost:8085
echo • Notification Service:   http://localhost:8086
echo • Monitoring Service:     http://localhost:8087
echo • Accounting Service:     http://localhost:8088
echo • AR Service:             http://localhost:8090
echo • AP Service:             http://localhost:8091
echo • Bank Service:           http://localhost:8092
echo • Sales Service:          http://localhost:8093
echo • Frontend Application:   http://localhost:3000
echo • Prometheus Metrics:     http://localhost:9090
echo • Grafana Dashboards:     http://localhost:3001 (admin/admin)
echo.
echo 🔐 Default Credentials:
echo ----------------------
echo • Database: easyops_dev / easyops123
echo • Grafana: admin / admin
echo.
echo 📚 Test Data:
echo ------------
echo • Chart of Accounts: 25 accounts with complete structure
echo • Customers: 20 test customers (10 accounting + 10 sales)
echo • Products: 15 test products (goods and services)
echo • Vendors: 10 test vendors
echo • Sales Orders: 5 test orders with line items
echo • AR Invoices: 8 test invoices
echo • AP Bills: 8 test bills
echo • Bank Transactions: 15 test transactions
echo.
echo 🚀 Ready for development! You can now:
echo • Access the frontend at http://localhost:3000
echo • View service health at http://localhost:8761
echo • Monitor metrics at http://localhost:9090
echo • View dashboards at http://localhost:3001
echo • Manage database via http://localhost:8080
echo.
echo 💡 To stop all services: docker-compose down
echo 💡 To view logs: docker-compose logs -f [service-name]
echo 💡 To restart a service: docker-compose restart [service-name]
echo.

pause
