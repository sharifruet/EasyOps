#!/bin/bash

# EasyOps ERP Development Environment Health Check Script
# This script checks the health of all services

set -e

echo "🔍 Checking EasyOps ERP Development Environment Health..."
echo ""

# Function to check service health
check_service() {
    local service_name=$1
    local url=$2
    local expected_status=${3:-200}
    
    echo -n "Checking $service_name... "
    
    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "$expected_status"; then
        echo "✅ OK"
        return 0
    else
        echo "❌ FAILED"
        return 1
    fi
}

# Check database services
echo "📊 Database Services:"
check_service "PostgreSQL" "http://localhost:5432" || echo "  PostgreSQL not accessible via HTTP (this is normal)"
check_service "MongoDB" "http://localhost:27017" || echo "  MongoDB not accessible via HTTP (this is normal)"
check_service "Redis" "http://localhost:6379" || echo "  Redis not accessible via HTTP (this is normal)"

echo ""

# Check application services
echo "🚀 Application Services:"
check_service "Eureka Server" "http://localhost:8761/actuator/health"
check_service "API Gateway" "http://localhost:8081/actuator/health"
check_service "User Management" "http://localhost:8082/actuator/health"

echo ""

# Check frontend
echo "🌐 Frontend Services:"
check_service "Frontend" "http://localhost:3000"

echo ""

# Check admin tools
echo "🛠️  Admin Tools:"
check_service "Adminer" "http://localhost:8080"

echo ""

# Check Docker containers
echo "🐳 Docker Containers:"
docker-compose ps

echo ""

# Check service logs for errors
echo "📋 Recent Errors (last 10 lines):"
echo "Eureka Server:"
docker-compose logs --tail=10 eureka | grep -i error || echo "  No errors found"

echo "API Gateway:"
docker-compose logs --tail=10 api-gateway | grep -i error || echo "  No errors found"

echo "User Management:"
docker-compose logs --tail=10 user-management | grep -i error || echo "  No errors found"

echo ""
echo "✅ Health check completed!"
echo ""
echo "💡 For detailed logs, run: docker-compose logs -f [service-name]"
