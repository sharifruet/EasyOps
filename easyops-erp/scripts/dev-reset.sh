#!/bin/bash

# EasyOps ERP Development Environment Reset Script
# This script resets the development environment by removing all data

set -e

echo "⚠️  WARNING: This will delete all data in the development environment!"
echo "Are you sure you want to continue? (y/N)"
read -r response

if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo "❌ Operation cancelled."
    exit 0
fi

echo "🗑️  Resetting EasyOps ERP Development Environment..."

# Stop all services
echo "🛑 Stopping services..."
docker-compose down

# Remove all containers, networks, and volumes
echo "🧹 Cleaning up containers and volumes..."
docker-compose down -v --remove-orphans

# Remove any dangling images
echo "🧹 Cleaning up dangling images..."
docker image prune -f

# Remove any dangling volumes
echo "🧹 Cleaning up dangling volumes..."
docker volume prune -f

# Remove any dangling networks
echo "🧹 Cleaning up dangling networks..."
docker network prune -f

echo "✅ Development environment has been reset."
echo ""
echo "💡 To start fresh, run: ./scripts/dev-start.sh"
