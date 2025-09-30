#!/bin/bash

# EasyOps ERP Development Environment Startup Script
# This script starts the development environment using Docker Compose

set -e

echo "🚀 Starting EasyOps ERP Development Environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p logs
mkdir -p data/postgres
mkdir -p data/mongodb
mkdir -p data/redis
mkdir -p data/elasticsearch

# Set environment variables
export COMPOSE_PROJECT_NAME=easyops
export SPRING_PROFILES_ACTIVE=dev

# Start the development environment
echo "🐳 Starting Docker containers..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check service health
echo "🔍 Checking service health..."

# Check PostgreSQL
echo "Checking PostgreSQL..."
until docker-compose exec postgres pg_isready -U easyops; do
    echo "Waiting for PostgreSQL..."
    sleep 2
done
echo "✅ PostgreSQL is ready"

# Check MongoDB
echo "Checking MongoDB..."
until docker-compose exec mongodb mongosh --eval "db.runCommand('ping')" > /dev/null 2>&1; do
    echo "Waiting for MongoDB..."
    sleep 2
done
echo "✅ MongoDB is ready"

# Check Redis
echo "Checking Redis..."
until docker-compose exec redis redis-cli ping > /dev/null 2>&1; do
    echo "Waiting for Redis..."
    sleep 2
done
echo "✅ Redis is ready"

# Check Eureka
echo "Checking Eureka..."
until curl -f http://localhost:8761/actuator/health > /dev/null 2>&1; do
    echo "Waiting for Eureka..."
    sleep 5
done
echo "✅ Eureka is ready"

# Check API Gateway
echo "Checking API Gateway..."
until curl -f http://localhost:8081/actuator/health > /dev/null 2>&1; do
    echo "Waiting for API Gateway..."
    sleep 5
done
echo "✅ API Gateway is ready"

# Check User Management Service
echo "Checking User Management Service..."
until curl -f http://localhost:8082/actuator/health > /dev/null 2>&1; do
    echo "Waiting for User Management Service..."
    sleep 5
done
echo "✅ User Management Service is ready"

echo ""
echo "🎉 EasyOps ERP Development Environment is ready!"
echo ""
echo "📋 Service URLs:"
echo "  • Frontend: http://localhost:3000"
echo "  • API Gateway: http://localhost:8081"
echo "  • Eureka: http://localhost:8761"
echo "  • Adminer: http://localhost:8080"
echo ""
echo "🔧 Database Connections:"
echo "  • PostgreSQL: localhost:5432 (easyops/easyops123)"
echo "  • MongoDB: localhost:27017 (easyops/easyops123)"
echo "  • Redis: localhost:6379"
echo ""
echo "📊 Monitoring:"
echo "  • Eureka Dashboard: http://localhost:8761"
echo "  • API Gateway Health: http://localhost:8081/actuator/health"
echo "  • User Management Health: http://localhost:8082/actuator/health"
echo ""
echo "🛠️  Development Commands:"
echo "  • View logs: docker-compose logs -f [service-name]"
echo "  • Stop services: ./scripts/dev-stop.sh"
echo "  • Restart services: ./scripts/dev-restart.sh"
echo "  • Reset environment: ./scripts/dev-reset.sh"
echo ""
echo "Happy coding! 🚀"
