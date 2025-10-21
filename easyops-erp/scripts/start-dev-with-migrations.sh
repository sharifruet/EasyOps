#!/bin/bash

# EasyOps ERP Development Startup Script with Database Migrations
# This script starts the entire development environment with proper database initialization

echo "🚀 Starting EasyOps ERP Development Environment with Database Migrations"
echo "=================================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

print_status "Docker environment check passed ✓"

# Step 1: Start Infrastructure Services (Database, Redis, etc.)
print_status "Step 1: Starting infrastructure services (PostgreSQL, Redis, Adminer)..."
docker-compose up -d postgres redis adminer

# Wait for PostgreSQL to be ready
print_status "Waiting for PostgreSQL to be ready..."
for i in {1..30}; do
    if docker-compose exec postgres pg_isready -U easyops > /dev/null 2>&1; then
        print_success "PostgreSQL is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "PostgreSQL failed to start within 60 seconds"
        exit 1
    fi
    echo -n "."
    sleep 2
done

# Step 2: Create the development user and databases
print_status "Step 2: Setting up database users and permissions..."
docker-compose exec postgres psql -U easyops -d postgres -c "
-- Create development user if it doesn't exist
DO \$\$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = 'easyops_dev') THEN
      CREATE USER easyops_dev WITH PASSWORD 'easyops123';
   END IF;
END
\$\$;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE easyops TO easyops_dev;
GRANT ALL PRIVILEGES ON DATABASE easyops_test TO easyops_dev;
"

if [ $? -eq 0 ]; then
    print_success "Database users and permissions configured ✓"
else
    print_warning "Database user setup had issues, but continuing..."
fi

# Step 3: Run Liquibase migrations
print_status "Step 3: Running Liquibase database migrations..."
cd database-versioning

# Check if Liquibase is available
if ! command -v liquibase &> /dev/null; then
    print_warning "Liquibase CLI not found. Using Docker to run migrations..."
    
    # Run Liquibase using Docker
    docker run --rm \
        --network easyops_easyops-network \
        -v "$(pwd)/changelog:/liquibase/changelog" \
        -v "$(pwd)/liquibase.properties:/liquibase/liquibase.properties" \
        liquibase/liquibase:4.20 \
        --defaultsFile=/liquibase/liquibase.properties \
        --url="jdbc:postgresql://postgres:5432/easyops" \
        --username=easyops_dev \
        --password=easyops123 \
        update
else
    print_status "Using local Liquibase CLI..."
    ./scripts/migrate.sh
fi

if [ $? -eq 0 ]; then
    print_success "Database migrations completed successfully ✓"
else
    print_error "Database migrations failed!"
    exit 1
fi

cd ..

# Step 4: Start Service Discovery (Eureka)
print_status "Step 4: Starting Service Discovery (Eureka)..."
docker-compose up -d eureka

# Wait for Eureka to be ready
print_status "Waiting for Eureka to be ready..."
for i in {1..60}; do
    if curl -s http://localhost:8761/actuator/health > /dev/null 2>&1; then
        print_success "Eureka is ready!"
        break
    fi
    if [ $i -eq 60 ]; then
        print_error "Eureka failed to start within 120 seconds"
        exit 1
    fi
    echo -n "."
    sleep 2
done

# Step 5: Start Core Services
print_status "Step 5: Starting core services (API Gateway, User Management, Auth, RBAC)..."
docker-compose up -d api-gateway user-management auth-service rbac-service organization-service

# Wait for core services to be ready
print_status "Waiting for core services to be ready..."
sleep 30

# Check core services health
services=("api-gateway:8081" "user-management:8082" "auth-service:8083" "rbac-service:8084" "organization-service:8085")
for service in "${services[@]}"; do
    service_name=$(echo $service | cut -d: -f1)
    service_port=$(echo $service | cut -d: -f2)
    
    if curl -s http://localhost:$service_port/actuator/health > /dev/null 2>&1; then
        print_success "$service_name is ready ✓"
    else
        print_warning "$service_name may still be starting up..."
    fi
done

# Step 6: Start Business Services
print_status "Step 6: Starting business services (Notification, Monitoring, Accounting, AR, AP, Bank, Sales)..."
docker-compose up -d notification-service monitoring-service accounting-service ar-service ap-service bank-service sales-service

# Wait for business services to be ready
print_status "Waiting for business services to be ready..."
sleep 30

# Check business services health
business_services=("notification-service:8086" "monitoring-service:8087" "accounting-service:8088" "ar-service:8090" "ap-service:8091" "bank-service:8092" "sales-service:8093")
for service in "${business_services[@]}"; do
    service_name=$(echo $service | cut -d: -f1)
    service_port=$(echo $service | cut -d: -f2)
    
    if curl -s http://localhost:$service_port/actuator/health > /dev/null 2>&1; then
        print_success "$service_name is ready ✓"
    else
        print_warning "$service_name may still be starting up..."
    fi
done

# Step 7: Start Frontend
print_status "Step 7: Starting frontend application..."
docker-compose up -d frontend

# Wait for frontend to be ready
print_status "Waiting for frontend to be ready..."
sleep 30

if curl -s http://localhost:3000 > /dev/null 2>&1; then
    print_success "Frontend is ready ✓"
else
    print_warning "Frontend may still be starting up..."
fi

# Step 8: Start Monitoring Stack
print_status "Step 8: Starting monitoring stack (Prometheus, Grafana)..."
docker-compose up -d prometheus grafana

# Wait for monitoring services
print_status "Waiting for monitoring services to be ready..."
sleep 15

# Final Status Report
echo ""
echo "🎉 EasyOps ERP Development Environment Started Successfully!"
echo "=========================================================="
echo ""
echo "📊 Service Status:"
echo "-----------------"
echo "• PostgreSQL Database:     http://localhost:5432 (via Adminer: http://localhost:8080)"
echo "• Redis Cache:            http://localhost:6379"
echo "• Eureka Service Registry: http://localhost:8761"
echo "• API Gateway:            http://localhost:8081"
echo "• User Management:        http://localhost:8082"
echo "• Authentication:         http://localhost:8083"
echo "• RBAC Service:           http://localhost:8084"
echo "• Organization Service:   http://localhost:8085"
echo "• Notification Service:   http://localhost:8086"
echo "• Monitoring Service:     http://localhost:8087"
echo "• Accounting Service:     http://localhost:8088"
echo "• AR Service:             http://localhost:8090"
echo "• AP Service:             http://localhost:8091"
echo "• Bank Service:           http://localhost:8092"
echo "• Sales Service:          http://localhost:8093"
echo "• Frontend Application:   http://localhost:3000"
echo "• Prometheus Metrics:     http://localhost:9090"
echo "• Grafana Dashboards:     http://localhost:3001 (admin/admin)"
echo ""
echo "🔐 Default Credentials:"
echo "----------------------"
echo "• Database: easyops_dev / easyops123"
echo "• Grafana: admin / admin"
echo ""
echo "📚 Test Data:"
echo "------------"
echo "• Chart of Accounts: 25 accounts with complete structure"
echo "• Customers: 20 test customers (10 accounting + 10 sales)"
echo "• Products: 15 test products (goods and services)"
echo "• Vendors: 10 test vendors"
echo "• Sales Orders: 5 test orders with line items"
echo "• AR Invoices: 8 test invoices"
echo "• AP Bills: 8 test bills"
echo "• Bank Transactions: 15 test transactions"
echo ""
echo "🚀 Ready for development! You can now:"
echo "• Access the frontend at http://localhost:3000"
echo "• View service health at http://localhost:8761"
echo "• Monitor metrics at http://localhost:9090"
echo "• View dashboards at http://localhost:3001"
echo "• Manage database via http://localhost:8080"
echo ""
echo "💡 To stop all services: docker-compose down"
echo "💡 To view logs: docker-compose logs -f [service-name]"
echo "💡 To restart a service: docker-compose restart [service-name]"
echo ""
