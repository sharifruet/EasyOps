#!/bin/bash

# EasyOps ERP - Local Spring Boot launcher
# Starts each microservice via mvnw with the provided profile (default: local).
#
# Prerequisites:
#   1. Core infrastructure (Postgres/Redis/Eureka/API Gateway) should already be running.
#      The docker-based start-core-services.sh script is the easiest way to achieve this.
#   2. Java 21+ and Maven Wrapper dependencies available (mvnw will download as required).
#   3. Ports exposed by Docker containers (8761, 8081, etc.) must be free if you opt to
#      run those services locally as part of this script.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MAVEN_CMD="${MAVEN_CMD:-$ROOT_DIR/mvnw}"
PROFILE="${SPRING_PROFILE:-local}"
LOG_DIR="${LOG_DIR:-$ROOT_DIR/logs/local-services}" 
PID_DIR="${PID_DIR:-$LOG_DIR/pids}"

# Update this list to match the services you want to boot locally.
# Order matters when services depend on one another.
DEFAULT_SERVICES=(
  "user-management"
  "auth-service"
  "rbac-service"
  "organization-service"
  "notification-service"
  "monitoring-service"
  "accounting-service"
  "ar-service"
  "ap-service"
  "bank-service"
  "sales-service"
  "inventory-service"
  "purchase-service"
  "crm-service"
  "hr-service"
  "manufacturing-service"
)

if [ -n "${SERVICES_OVERRIDE:-}" ]; then
  # Allow comma or space separated override list
  IFS=',' read -r -a SERVICES <<< "${SERVICES_OVERRIDE// /,}"
else
  SERVICES=("${DEFAULT_SERVICES[@]}")
fi

mkdir -p "$LOG_DIR" "$PID_DIR"

declare -a STARTED_SERVICES=()
declare -a STARTED_PIDS=()

cleanup() {
  if [ ${#STARTED_PIDS[@]} -eq 0 ]; then
    return
  fi

  echo "\n🔻 Stopping Spring Boot services..."
  for idx in "${!STARTED_PIDS[@]}"; do
    local pid="${STARTED_PIDS[$idx]}"
    local service="${STARTED_SERVICES[$idx]}"
    if kill -0 "$pid" >/dev/null 2>&1; then
      echo "  • $service (pid=$pid)"
      kill "$pid" >/dev/null 2>&1 || true
      wait "$pid" 2>/dev/null || true
    fi
    rm -f "$PID_DIR/$service.pid"
  done
}

trap cleanup INT TERM EXIT

start_service() {
  local service="$1"
  local module_dir="$ROOT_DIR/services/$service"

  if [ ! -d "$module_dir" ] || [ ! -f "$module_dir/pom.xml" ]; then
    echo "⚠️  Skipping $service (module not found)"
    return
  fi

  local log_file="$LOG_DIR/${service}.log"
  echo "➡️  Starting $service (profile=$PROFILE)"
  echo "    → log: $log_file"

  (
    cd "$module_dir"
    SPRING_PROFILES_ACTIVE="$PROFILE" "$MAVEN_CMD" spring-boot:run \
      -Dspring-boot.run.profiles="$PROFILE" \
      -DskipTests=true \
      ${SPRING_BOOT_EXTRAS:-} \
      >"$log_file" 2>&1
  ) &

  local pid=$!
  echo "$pid" > "$PID_DIR/${service}.pid"
  STARTED_SERVICES+=("$service")
  STARTED_PIDS+=("$pid")
  sleep 2

  if ! kill -0 "$pid" >/dev/null 2>&1; then
    echo "❌ $service terminated immediately. Check $log_file"
  else
    echo "✅ $service started (pid=$pid)"
  fi
}

echo "🚀 Launching EasyOps Spring Boot services"
echo "   Root directory:   $ROOT_DIR"
echo "   Maven command:    $MAVEN_CMD"
echo "   Active profile:   $PROFILE"
echo "   Log directory:    $LOG_DIR"
echo

echo "🔄 Preparing Maven wrapper distribution..."
if ! (cd "$ROOT_DIR" && "$MAVEN_CMD" -N -q --version >/dev/null 2>&1); then
  (cd "$ROOT_DIR" && "$MAVEN_CMD" -N --version >/dev/null 2>&1) || true
fi
echo "✅ Maven wrapper ready"
echo

for service in "${SERVICES[@]}"; do
  start_service "$service"
done

echo "\nAll configured services started. Press Ctrl+C to stop them."

# Keep the script alive while background processes run.
wait

