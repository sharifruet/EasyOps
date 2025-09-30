#!/bin/bash

# EasyOps ERP Development Environment Stop Script
# This script stops the development environment

set -e

echo "🛑 Stopping EasyOps ERP Development Environment..."

# Stop all services
docker-compose down

echo "✅ All services have been stopped."
echo ""
echo "💡 To start the environment again, run: ./scripts/dev-start.sh"
