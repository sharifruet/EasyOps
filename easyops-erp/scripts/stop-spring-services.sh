#!/bin/bash

# EasyOps ERP - Stop Spring Boot services launched via start-spring-services.sh
#
# This script terminates any Spring Boot processes that were started with
# scripts/start-spring-services.sh by reading the PID files under
# logs/local-services/pids. It is safe to run multiple times.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="${LOG_DIR:-$ROOT_DIR/logs/local-services}"
PID_DIR="${PID_DIR:-$LOG_DIR/pids}"

if [ ! -d "$PID_DIR" ]; then
  echo "ℹ️  PID directory '$PID_DIR' does not exist. Nothing to stop."
  exit 0
fi

shopt -s nullglob
PID_FILES=("$PID_DIR"/*.pid)
shopt -u nullglob

if [ ${#PID_FILES[@]} -eq 0 ]; then
  echo "ℹ️  No PID files found in '$PID_DIR'. Trying process scan fallback..."

  if pgrep -f 'easyops-erp/.mvn/wrapper/maven-wrapper.jar' >/dev/null 2>&1; then
    echo "  • Killing Maven wrapper spring-boot:run processes"
    pkill -f 'easyops-erp/.mvn/wrapper/maven-wrapper.jar' || true
    echo "✅ Fallback kill issued."
    exit 0
  fi

  if pgrep -f 'com.easyops.*ServiceApplication' >/dev/null 2>&1; then
    echo "  • Killing Spring Boot JVMs"
    pkill -f 'com.easyops.*ServiceApplication' || true
    echo "✅ Fallback kill issued."
    exit 0
  fi

  echo "ℹ️  No running Spring services detected."
  exit 0
fi

echo "🛑 Stopping Spring services (found ${#PID_FILES[@]} pid file(s))..."

STOPPED=0
FAILED=0

for pid_file in "${PID_FILES[@]}"; do
  service_name="$(basename "$pid_file" .pid)"
  if ! pid="$(cat "$pid_file" 2>/dev/null)"; then
    echo "⚠️  Could not read PID from '$pid_file'. Removing file."
    rm -f "$pid_file"
    FAILED=$((FAILED + 1))
    continue
  fi

  if ! kill -0 "$pid" >/dev/null 2>&1; then
    echo "ℹ️  Service '$service_name' (pid $pid) is not running. Cleaning up PID file."
    rm -f "$pid_file"
    continue
  fi

  echo "  • Stopping $service_name (pid $pid)"
  if kill "$pid" >/dev/null 2>&1; then
    wait "$pid" 2>/dev/null || true
    rm -f "$pid_file"
    STOPPED=$((STOPPED + 1))
  else
    echo "⚠️  Failed to stop $service_name (pid $pid)."
    FAILED=$((FAILED + 1))
  fi
done

echo "✅ Done. Stopped: $STOPPED, Failed: $FAILED."

if [ "$STOPPED" -eq 0 ] && [ "$FAILED" -eq 0 ]; then
  echo "ℹ️  No active Spring services were running."
fi

