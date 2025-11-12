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

# Default log pattern for consistent structured logs across services
DEFAULT_LOGGING_PATTERN_CONSOLE="%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n"
DEFAULT_LOGGING_PATTERN_FILE="%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n"

: "${LOGGING_PATTERN_CONSOLE:=$DEFAULT_LOGGING_PATTERN_CONSOLE}"
: "${LOGGING_PATTERN_FILE:=$DEFAULT_LOGGING_PATTERN_FILE}"
export LOGGING_PATTERN_CONSOLE LOGGING_PATTERN_FILE

# Ensure Eureka clients register with a host reachable from Docker containers.
: "${EUREKA_INSTANCE_HOSTNAME:=host.docker.internal}"
: "${EUREKA_INSTANCE_PREFER_IP_ADDRESS:=false}"

resolve_hostname() {
  local host="$1"

  if command -v python3 >/dev/null 2>&1; then
    python3 - <<PYTHON >/dev/null 2>&1
import socket
socket.gethostbyname("${host}")
PYTHON
    return $?
  fi

  if command -v getent >/dev/null 2>&1; then
    getent hosts "$host" >/dev/null 2>&1 && return 0
  fi

  if command -v host >/dev/null 2>&1; then
    host "$host" >/dev/null 2>&1 && return 0
  fi

  if command -v nslookup >/dev/null 2>&1; then
    nslookup "$host" >/dev/null 2>&1 && return 0
  fi

  if command -v ping >/dev/null 2>&1; then
    ping -c1 "$host" >/dev/null 2>&1 && return 0
  fi

  return 1
}

if ! resolve_hostname "$EUREKA_INSTANCE_HOSTNAME"; then
  # host.docker.internal is not resolvable on some setups (e.g., Colima, Linux without Docker Desktop).
  # Fall back to the active interface IP so both the host and Docker containers can reach it.
  if [[ "$OSTYPE" == darwin* ]]; then
    DEFAULT_IFACE="$(route get default 2>/dev/null | awk '/interface: / {print $2; exit}')"
    if [[ -n "$DEFAULT_IFACE" ]]; then
      HOST_IP="$(ipconfig getifaddr "$DEFAULT_IFACE" 2>/dev/null || true)"
    fi
    if [[ -z "${HOST_IP:-}" ]]; then
      HOST_IP="$(ifconfig | awk '/inet / && $2 != \"127.0.0.1\" {print $2; exit}')"
    fi
  else
    if command -v ip >/dev/null 2>&1; then
      HOST_IP="$(ip route get 8.8.8.8 2>/dev/null | awk '/src/ {print $7; exit}')"
    fi
    if [[ -z "${HOST_IP:-}" ]]; then
      HOST_IP="$(hostname -I 2>/dev/null | awk '{print $1}')"
    fi
    if [[ -z "${HOST_IP:-}" ]]; then
      HOST_IP="$(nmcli -t -f IP4.ADDRESS device show 2>/dev/null | awk -F'[/:]' '/IP4.ADDRESS/ {print $2; exit}')"
    fi
  fi

  if [[ -n "$HOST_IP" ]]; then
    EUREKA_INSTANCE_HOSTNAME="$HOST_IP"
    EUREKA_INSTANCE_PREFER_IP_ADDRESS=true
    echo "ℹ️  host.docker.internal not resolvable. Using host IP $HOST_IP for Eureka registrations."
  else
    echo "⚠️  Unable to determine host IP. Services may not be reachable from Docker containers."
  fi
fi

export EUREKA_INSTANCE_HOSTNAME
export EUREKA_INSTANCE_PREFER_IP_ADDRESS

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
    "$MAVEN_CMD" clean >/dev/null 2>&1 || true
    SPRING_PROFILES_ACTIVE="$PROFILE" "$MAVEN_CMD" spring-boot:run \
      -Dspring-boot.run.profiles="$PROFILE" \
      -DskipTests=true \
      -Deureka.instance.hostname="$EUREKA_INSTANCE_HOSTNAME" \
      -Deureka.instance.preferIpAddress="$EUREKA_INSTANCE_PREFER_IP_ADDRESS" \
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

