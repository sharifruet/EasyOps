#!/bin/bash

# EasyOps ERP Development Environment Restart Script
# This script restarts the development environment

set -e

echo "🔄 Restarting EasyOps ERP Development Environment..."

# Stop all services
echo "🛑 Stopping services..."
docker-compose down

# Wait a moment
sleep 5

# Start services again
echo "🚀 Starting services..."
./scripts/dev-start.sh
