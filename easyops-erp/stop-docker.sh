#!/bin/bash

# EasyOps ERP - Docker Stop Script

echo "╔════════════════════════════════════════════════════════════╗"
echo "║         🛑 Stopping EasyOps ERP Services                  ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

if docker compose version > /dev/null 2>&1; then
  COMPOSE_CMD=(docker compose)
elif command -v docker-compose > /dev/null 2>&1; then
  COMPOSE_CMD=(docker-compose)
else
  echo "Docker Compose is not installed."
  exit 1
fi

"${COMPOSE_CMD[@]}" stop

echo ""
echo "✅ All services stopped"
echo ""
echo "To start again: ./start-docker.sh"
echo "To remove all: ${COMPOSE_CMD[*]} down"
echo "To remove all + data: ${COMPOSE_CMD[*]} down -v"
echo ""

