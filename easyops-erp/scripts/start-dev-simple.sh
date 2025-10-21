#!/bin/bash

# Simple EasyOps ERP Development Startup Script
# This script starts the entire development environment with automatic database migrations

echo "🚀 Starting EasyOps ERP Development Environment"
echo "=============================================="

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

# Create the development user in PostgreSQL before starting services
print_status "Setting up database user..."
docker-compose up -d postgres

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

# Create development user
print_status "Creating development database user..."
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
" > /dev/null 2>&1

print_success "Database user setup completed ✓"

# Start all services (this will now automatically run Liquibase migrations first)
print_status "Starting all services with automatic database migrations..."
docker-compose up -d

# Wait for services to be ready
print_status "Waiting for services to start..."
sleep 30

# Check service health
print_status "Checking service health..."

services=("eureka:8761" "api-gateway:8081" "user-management:8082" "auth-service:8083" "frontend:3000")
for service in "${services[@]}"; do
    service_name=$(echo $service | cut -d: -f1)
    service_port=$(echo $service | cut -d: -f2)
    
    if curl -s http://localhost:$service_port > /dev/null 2>&1 || curl -s http://localhost:$service_port/actuator/health > /dev/null 2>&1; then
        print_success "$service_name is ready ✓"
    else
        print_warning "$service_name may still be starting up..."
    fi
done

# Final Status Report
echo ""
echo "🎉 EasyOps ERP Development Environment Started Successfully!"
echo "=========================================================="
echo ""
echo "📊 Service Status:"
echo "-----------------"
echo "• PostgreSQL Database:     http://localhost:5432"
echo "• Database Admin:          http://localhost:8080"
echo "• Eureka Service Registry: http://localhost:8761"
echo "• API Gateway:            http://localhost:8081"
echo "• User Management:        http://localhost:8082"
echo "• Authentication:         http://localhost:8083"
echo "• Frontend Application:   http://localhost:3000"
echo ""
echo "🔐 Database Credentials:"
echo "• Username: easyops_dev"
echo "• Password: easyops123"
echo "• Database: easyops"
echo ""
echo "📚 Test Data Available:"
echo "• Chart of Accounts: 25 accounts"
echo "• Customers: 20 test customers"
echo "• Products: 15 test products"
echo "• Sales Orders: 5 test orders"
echo "• AR Invoices: 8 test invoices"
echo "• AP Bills: 8 test bills"
echo ""
echo "🚀 Ready for development!"
echo ""
echo "💡 To stop all services: docker-compose down"
echo "💡 To view logs: docker-compose logs -f [service-name]"
echo "💡 To restart a service: docker-compose restart [service-name]"
echo ""
