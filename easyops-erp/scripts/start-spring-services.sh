#!/bin/bash

# EasyOps ERP - Local Spring Boot launcher
# Starts each microservice via mvnw with the provided profile (default: local).
#
# Prerequisites:
#   1. Core infrastructure (Postgres/Redis) should already be running.
#      The docker-based start-core-services.sh script is the easiest way to achieve this.
#   2. Java 21+ and Maven Wrapper dependencies available (mvnw will download as required).
#   3. Ports 8761 (Eureka) and 8081 (API Gateway) must be free for local services.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MAVEN_CMD="${MAVEN_CMD:-$ROOT_DIR/mvnw}"
PROFILE="${SPRING_PROFILE:-}"
LOG_DIR="${LOG_DIR:-$ROOT_DIR/logs/local-services}" 
PID_DIR="${PID_DIR:-$LOG_DIR/pids}"

# Default log pattern for consistent structured logs across services
DEFAULT_LOGGING_PATTERN_CONSOLE="%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n"
DEFAULT_LOGGING_PATTERN_FILE="%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n"

: "${LOGGING_PATTERN_CONSOLE:=$DEFAULT_LOGGING_PATTERN_CONSOLE}"
: "${LOGGING_PATTERN_FILE:=$DEFAULT_LOGGING_PATTERN_FILE}"
export LOGGING_PATTERN_CONSOLE LOGGING_PATTERN_FILE

# For local services, use localhost so Eureka links are accessible from browser.
# Docker containers can still reach services via localhost when running on the same host.
: "${EUREKA_INSTANCE_HOSTNAME:=localhost}"
: "${EUREKA_INSTANCE_PREFER_IP_ADDRESS:=false}"

export EUREKA_INSTANCE_HOSTNAME
export EUREKA_INSTANCE_PREFER_IP_ADDRESS

# Update this list to match the services you want to boot locally.
# Order matters when services depend on one another.
# Eureka must start first, followed by API Gateway, then all other services.
DEFAULT_SERVICES=(
  "eureka"
  "api-gateway"
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
  local should_cleanup=false
  
  # Check if any services are actually still running
  for idx in "${!STARTED_PIDS[@]}"; do
    local pid="${STARTED_PIDS[$idx]}"
    if kill -0 "$pid" >/dev/null 2>&1; then
      should_cleanup=true
      break
    fi
  done
  
  if [ "$should_cleanup" = false ]; then
    # No services are running, just clean up PID files
    for idx in "${!STARTED_PIDS[@]}"; do
      local service="${STARTED_SERVICES[$idx]}"
      rm -f "$PID_DIR/$service.pid"
    done
    return
  fi

  echo ""
  echo "🔻 Stopping Spring Boot services..."
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

wait_for_service() {
  local service_name="$1"
  local health_url="$2"
  local max_retries="${3:-60}"
  
  echo "⏳ Waiting for $service_name ($health_url)..."
  local retries=$max_retries
  until curl -fs "$health_url" >/dev/null 2>&1 || [ $retries -eq 0 ]; do
    sleep 2
    retries=$((retries-1))
  done
  
  if [ $retries -eq 0 ]; then
    echo "⚠️  $service_name did not become healthy within timeout"
    return 1
  else
    echo "✅ $service_name is healthy"
    return 0
  fi
}

start_service() {
  local service="$1"
  local module_dir="$ROOT_DIR/services/$service"

  if [ ! -d "$module_dir" ] || [ ! -f "$module_dir/pom.xml" ]; then
    echo "⚠️  Skipping $service (module not found)"
    return
  fi

  local log_file="$LOG_DIR/${service}.log"
  if [ -z "$PROFILE" ]; then
    echo "➡️  Starting $service (using default config)"
  else
    echo "➡️  Starting $service (profile=$PROFILE)"
  fi
  echo "    → log: $log_file"

  (
    cd "$module_dir"
    "$MAVEN_CMD" clean >/dev/null 2>&1 || true
    if [ -n "$PROFILE" ]; then
      export SPRING_PROFILES_ACTIVE="$PROFILE"
      "$MAVEN_CMD" spring-boot:run \
        -Dspring-boot.run.profiles="$PROFILE" \
        -DskipTests=true \
        -Deureka.instance.hostname="$EUREKA_INSTANCE_HOSTNAME" \
        -Deureka.instance.preferIpAddress="$EUREKA_INSTANCE_PREFER_IP_ADDRESS" \
        ${SPRING_BOOT_EXTRAS:-} \
        >"$log_file" 2>&1
    else
      # No profile specified - use default config but override datasource to localhost
      # This ensures services connect to localhost even if dev profile is hardcoded
      export SPRING_PROFILES_ACTIVE=""
      "$MAVEN_CMD" spring-boot:run \
        -Dspring-boot.run.profiles="" \
        -Dspring.profiles.active="" \
        -Dspring.datasource.url=jdbc:postgresql://localhost:5432/easyops \
        -Dspring.datasource.username=easyops \
        -Dspring.datasource.password=easyops123 \
        -Dspring.data.redis.host=localhost \
        -Dspring.data.redis.port=6379 \
        -DskipTests=true \
        -Deureka.instance.hostname="$EUREKA_INSTANCE_HOSTNAME" \
        -Deureka.instance.preferIpAddress="$EUREKA_INSTANCE_PREFER_IP_ADDRESS" \
        -Deureka.client.serviceUrl.defaultZone=http://localhost:8761/eureka/ \
        ${SPRING_BOOT_EXTRAS:-} \
        >"$log_file" 2>&1
    fi
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

# Start services in order, with waits for critical dependencies
eureka_started=false
api_gateway_started=false

for service in "${SERVICES[@]}"; do
  start_service "$service"
  
  # Wait for Eureka before starting other services
  if [ "$service" = "eureka" ] && [ "$eureka_started" = false ]; then
    eureka_started=true
    wait_for_service "Eureka" "http://localhost:8761/actuator/health" 60
    echo ""
  fi
  
  # Wait for API Gateway before starting remaining services
  if [ "$service" = "api-gateway" ] && [ "$api_gateway_started" = false ]; then
    api_gateway_started=true
    wait_for_service "API Gateway" "http://localhost:8081/actuator/health" 60
    echo ""
  fi
done

echo ""
echo "All configured services started. Press Ctrl+C to stop them."
echo ""

# Keep the script alive while background processes run.
# Wait for all background processes, but check periodically if any are still running
any_running=true
while [ "$any_running" = true ]; do
  sleep 5
  # Check if any of our started services are still running
  any_running=false
  for idx in "${!STARTED_PIDS[@]}"; do
    pid="${STARTED_PIDS[$idx]}"
    if kill -0 "$pid" >/dev/null 2>&1; then
      any_running=true
      break
    fi
  done
done

# All services have stopped - check if it was due to errors
echo ""
failed_count=0
for idx in "${!STARTED_PIDS[@]}"; do
  service="${STARTED_SERVICES[$idx]}"
  log_file="$LOG_DIR/${service}.log"
  # Check if log file exists and contains error indicators
  if [ -f "$log_file" ] && grep -qiE "(ERROR|FAILURE|Exception|Compilation failure)" "$log_file" >/dev/null 2>&1; then
    failed_count=$((failed_count + 1))
  fi
done

if [ $failed_count -gt 0 ]; then
  echo "⚠️  All services have stopped ($failed_count may have failed)."
  echo "   Check logs in $LOG_DIR for details."
else
  echo "ℹ️  All services have stopped."
fi

