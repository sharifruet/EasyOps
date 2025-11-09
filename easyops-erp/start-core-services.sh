#!/bin/bash

# EasyOps ERP - Core Services Startup Script
# Starts the lightweight stack: Postgres, Redis, liquibase migrations,
# Adminer UI, Eureka service discovery, and API Gateway.

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║    🚀 EasyOps ERP - Core Services (Docker) Startup        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔍 Checking Docker..."
if ! docker info >/dev/null 2>&1; then
  echo -e "${RED}❌ Docker is not running. Please start Docker Desktop/Engine and try again.${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Docker is running${NC}"

echo "🔍 Checking Docker Compose..."
if docker compose version >/dev/null 2>&1; then
  COMPOSE_CMD=(docker compose)
  echo -e "${GREEN}✅ Docker Compose v2 detected${NC}"
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE_CMD=(docker-compose)
  echo -e "${YELLOW}ℹ️  Docker Compose standalone detected${NC}"
else
  echo -e "${RED}❌ Docker Compose is not installed.${NC}"
  exit 1
fi

INFRA_SERVICES=(postgres redis)
APP_SERVICES=(adminer eureka api-gateway)

echo ""
echo "🐳 Starting database and cache dependencies..."
if ! "${COMPOSE_CMD[@]}" up -d --wait "${INFRA_SERVICES[@]}"; then
  echo -e "${RED}❌ Failed to start postgres/redis.${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Postgres & Redis are ready${NC}"

echo ""
echo "🔄 Running Liquibase migrations..."
if ! "${COMPOSE_CMD[@]}" up --no-deps liquibase; then
  echo -e "${RED}❌ Liquibase migrations failed. Check logs with: ${COMPOSE_CMD[*]} logs liquibase${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Liquibase migrations completed${NC}"

echo ""
echo "🚀 Starting core application services..."
if ! "${COMPOSE_CMD[@]}" up -d --wait "${APP_SERVICES[@]}"; then
  echo -e "${YELLOW}⚠️  docker compose reported an issue while starting application services. Check logs below.${NC}"
fi

echo ""
echo "📊 Current container status:"
"${COMPOSE_CMD[@]}" ps adminer eureka api-gateway postgres redis liquibase

echo ""
echo "⏳ Waiting for Eureka (http://localhost:8761)..."
RETRIES=60
until curl -fs http://localhost:8761/actuator/health >/dev/null 2>&1 || [ $RETRIES -eq 0 ]; do
  sleep 2
  RETRIES=$((RETRIES-1))
done
if [ $RETRIES -eq 0 ]; then
  echo -e "${YELLOW}⚠️  Eureka did not report healthy within the timeout.${NC}"
else
  echo -e "${GREEN}✅ Eureka is healthy${NC}"
fi

echo ""
echo "⏳ Waiting for API Gateway (http://localhost:8081)..."
RETRIES=60
until curl -fs http://localhost:8081/actuator/health >/dev/null 2>&1 || [ $RETRIES -eq 0 ]; do
  sleep 2
  RETRIES=$((RETRIES-1))
done
if [ $RETRIES -eq 0 ]; then
  echo -e "${YELLOW}⚠️  API Gateway did not report healthy within the timeout.${NC}"
else
  echo -e "${GREEN}✅ API Gateway is healthy${NC}"
fi

echo ""
echo "📋 Access URLs"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}PostgreSQL:${NC}  jdbc:postgresql://localhost:5432/easyops"
echo -e "${GREEN}Adminer:${NC}     http://localhost:8080"
echo -e "${GREEN}Eureka:${NC}      http://localhost:8761"
echo -e "${GREEN}API Gateway:${NC} http://localhost:8081"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🛠️  Useful commands"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "View logs:         ${COMPOSE_CMD[*]} logs -f api-gateway"
echo "Stop services:     ${COMPOSE_CMD[*]} stop ${APP_SERVICES[*]} ${INFRA_SERVICES[*]}"
echo "Remove services:   ${COMPOSE_CMD[*]} down -v"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}Core services are up!${NC}"


