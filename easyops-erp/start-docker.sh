#!/bin/bash

# EasyOps ERP - Docker Startup Script
# This script starts the complete EasyOps ERP system using Docker Compose

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║         🚀 EasyOps ERP - Docker Startup Script            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is running
echo "🔍 Checking Docker..."
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker is running${NC}"

# Check if Docker Compose is available
echo "🔍 Checking Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker Compose is available${NC}"

echo ""
echo "🐳 Starting EasyOps ERP services..."
echo ""

# Start services
docker-compose up -d

echo ""
echo "⏳ Waiting for services to initialize..."
sleep 10

echo ""
echo "📊 Service Status:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

docker-compose ps

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Wait for critical services
echo "⏳ Waiting for critical services to be ready..."
echo ""

# Wait for PostgreSQL
echo -n "Checking PostgreSQL..."
RETRIES=30
until docker-compose exec -T postgres pg_isready -U easyops > /dev/null 2>&1 || [ $RETRIES -eq 0 ]; do
  echo -n "."
  sleep 2
  RETRIES=$((RETRIES-1))
done
if [ $RETRIES -eq 0 ]; then
  echo -e " ${RED}❌ Timeout${NC}"
else
  echo -e " ${GREEN}✅ Ready${NC}"
fi

# Wait for MongoDB
echo -n "Checking MongoDB..."
RETRIES=30
until docker-compose exec -T mongodb mongosh --quiet --eval "db.runCommand('ping')" > /dev/null 2>&1 || [ $RETRIES -eq 0 ]; do
  echo -n "."
  sleep 2
  RETRIES=$((RETRIES-1))
done
if [ $RETRIES -eq 0 ]; then
  echo -e " ${RED}❌ Timeout${NC}"
else
  echo -e " ${GREEN}✅ Ready${NC}"
fi

# Wait for Redis
echo -n "Checking Redis..."
RETRIES=30
until docker-compose exec -T redis redis-cli ping > /dev/null 2>&1 || [ $RETRIES -eq 0 ]; do
  echo -n "."
  sleep 2
  RETRIES=$((RETRIES-1))
done
if [ $RETRIES -eq 0 ]; then
  echo -e " ${RED}❌ Timeout${NC}"
else
  echo -e " ${GREEN}✅ Ready${NC}"
fi

# Wait for Eureka
echo -n "Checking Eureka Server..."
RETRIES=60
until curl -s http://localhost:8761/actuator/health > /dev/null 2>&1 || [ $RETRIES -eq 0 ]; do
  echo -n "."
  sleep 2
  RETRIES=$((RETRIES-1))
done
if [ $RETRIES -eq 0 ]; then
  echo -e " ${RED}❌ Timeout${NC}"
else
  echo -e " ${GREEN}✅ Ready${NC}"
fi

# Wait for API Gateway
echo -n "Checking API Gateway..."
RETRIES=60
until curl -s http://localhost:8081/actuator/health > /dev/null 2>&1 || [ $RETRIES -eq 0 ]; do
  echo -n "."
  sleep 2
  RETRIES=$((RETRIES-1))
done
if [ $RETRIES -eq 0 ]; then
  echo -e " ${RED}❌ Timeout${NC}"
else
  echo -e " ${GREEN}✅ Ready${NC}"
fi

# Wait for Auth Service
echo -n "Checking Auth Service..."
RETRIES=60
until curl -s http://localhost:8083/api/auth/health > /dev/null 2>&1 || [ $RETRIES -eq 0 ]; do
  echo -n "."
  sleep 2
  RETRIES=$((RETRIES-1))
done
if [ $RETRIES -eq 0 ]; then
  echo -e " ${RED}❌ Timeout${NC}"
else
  echo -e " ${GREEN}✅ Ready${NC}"
fi

# Wait for Frontend
echo -n "Checking Frontend..."
RETRIES=90
until curl -s http://localhost:3000 > /dev/null 2>&1 || [ $RETRIES -eq 0 ]; do
  echo -n "."
  sleep 2
  RETRIES=$((RETRIES-1))
done
if [ $RETRIES -eq 0 ]; then
  echo -e " ${YELLOW}⚠️  Still starting...${NC}"
else
  echo -e " ${GREEN}✅ Ready${NC}"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║     🎉 EasyOps ERP is ready!                              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Access URLs:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}Frontend:${NC}        http://localhost:3000"
echo -e "${GREEN}API Gateway:${NC}     http://localhost:8081"
echo -e "${GREEN}Eureka:${NC}          http://localhost:8761"
echo -e "${GREEN}Adminer:${NC}         http://localhost:8080"
echo -e "${GREEN}RabbitMQ:${NC}        http://localhost:15672"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔐 Login Credentials:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}Username:${NC} admin"
echo -e "${GREEN}Password:${NC} Admin123!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🛠️  Useful Commands:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "View logs:         docker-compose logs -f"
echo "Stop services:     docker-compose stop"
echo "Restart services:  docker-compose restart"
echo "Remove services:   docker-compose down"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
echo ""

