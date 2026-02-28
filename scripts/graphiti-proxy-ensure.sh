#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
HEALTH_URL="${GRAPHITI_PROXY_HEALTH_URL:-http://127.0.0.1:8123/healthz}"
START_TIMEOUT_SECONDS="${GRAPHITI_PROXY_START_TIMEOUT_SECONDS:-20}"
PID_FILE="${GRAPHITI_PROXY_PID_FILE:-${XDG_RUNTIME_DIR:-/tmp}/beep-graphiti-proxy.pid}"
LOG_DIR="${XDG_STATE_HOME:-$HOME/.local/state}/beep"
LOG_FILE="${LOG_DIR}/graphiti-proxy.log"
PORT_FROM_URL="$(printf '%s' "$HEALTH_URL" | sed -n 's#.*:\([0-9][0-9]*\)/.*#\1#p')"
PROXY_PORT="${PORT_FROM_URL:-8123}"
FALKOR_CONTAINER="${FALKOR_CONTAINER:-graphiti-mcp-falkordb-1}"
GRAPHITI_CONTAINER="${GRAPHITI_CONTAINER:-graphiti-mcp-graphiti-mcp-1}"
RECOVER_ON_UNHEALTHY="${GRAPHITI_PROXY_RECOVER_ON_UNHEALTHY:-true}"
RECOVERY_MCP_URL="${GRAPHITI_PROXY_RECOVERY_MCP_URL:-http://127.0.0.1:8000/mcp}"
RECOVERY_GROUP="${GRAPHITI_PROXY_RECOVERY_GROUP:-beep-dev}"

log() {
  printf '[graphiti-proxy:ensure] %s\n' "$1"
}

check_health() {
  curl -fsS -m 2 "$HEALTH_URL" >/dev/null 2>&1
}

container_exists() {
  docker inspect "$1" >/dev/null 2>&1
}

container_health() {
  docker inspect --format '{{.State.Health.Status}}' "$1" 2>/dev/null || printf 'unknown'
}

recover_graphiti_stack() {
  if [[ "$RECOVER_ON_UNHEALTHY" != "true" ]]; then
    return 0
  fi
  if ! command -v docker >/dev/null 2>&1; then
    return 0
  fi
  if ! container_exists "$FALKOR_CONTAINER" || ! container_exists "$GRAPHITI_CONTAINER"; then
    return 0
  fi

  local f_status g_status
  f_status="$(container_health "$FALKOR_CONTAINER")"
  g_status="$(container_health "$GRAPHITI_CONTAINER")"
  if [[ "$f_status" == "healthy" && "$g_status" == "healthy" ]]; then
    return 0
  fi

  log "Detected unhealthy graphiti stack (falkor=${f_status}, graphiti=${g_status}). Running recovery."
  if [[ -f "$ROOT_DIR/scripts/graphiti-recover.sh" ]]; then
    if ! bash "$ROOT_DIR/scripts/graphiti-recover.sh" --skip-republish --group "$RECOVERY_GROUP" --url "$RECOVERY_MCP_URL"; then
      log "Recovery script failed; continuing ensure loop."
    fi
    return 0
  fi

  docker restart "$FALKOR_CONTAINER" "$GRAPHITI_CONTAINER" >/dev/null 2>&1 || true
}

if ! command -v bun >/dev/null 2>&1; then
  log "Missing required command: bun"
  exit 1
fi

mkdir -p "$LOG_DIR" "$(dirname "$PID_FILE")"
recover_graphiti_stack

start_proxy() {
  log "Starting proxy via 'bun run graphiti:proxy' (log: ${LOG_FILE})."
  if command -v setsid >/dev/null 2>&1; then
    (
      cd "$ROOT_DIR"
      setsid sh -c 'exec bun run graphiti:proxy' >>"$LOG_FILE" 2>&1 < /dev/null &
      echo "$!" >"$PID_FILE"
    )
    return
  fi

  (
    cd "$ROOT_DIR"
    nohup sh -c 'exec bun run graphiti:proxy' >>"$LOG_FILE" 2>&1 < /dev/null &
    echo "$!" >"$PID_FILE"
  )
}

deadline=$(( $(date +%s) + START_TIMEOUT_SECONDS ))
while [[ $(date +%s) -le $deadline ]]; do
  if check_health; then
    started_pid=""
    if [[ -f "$PID_FILE" ]]; then
      candidate_pid="$(cat "$PID_FILE" 2>/dev/null || true)"
      if [[ -n "$candidate_pid" ]] && kill -0 "$candidate_pid" >/dev/null 2>&1; then
        started_pid="$candidate_pid"
      else
        rm -f "$PID_FILE"
      fi
    fi
    if [[ -z "$started_pid" ]] && command -v lsof >/dev/null 2>&1; then
      started_pid="$(lsof -t -iTCP:${PROXY_PORT} -sTCP:LISTEN 2>/dev/null | head -n 1 || true)"
    fi
    log "Proxy is healthy at ${HEALTH_URL}${started_pid:+ (pid ${started_pid})}."
    exit 0
  fi

  existing_pid=""
  if [[ -f "$PID_FILE" ]]; then
    existing_pid="$(cat "$PID_FILE" 2>/dev/null || true)"
  fi

  if [[ -n "$existing_pid" ]]; then
    if ! kill -0 "$existing_pid" >/dev/null 2>&1; then
      rm -f "$PID_FILE"
      start_proxy
    fi
  else
    start_proxy
  fi

  sleep 1
done

log "Proxy did not become healthy within ${START_TIMEOUT_SECONDS}s."
if [[ -f "$PID_FILE" ]]; then
  failed_pid="$(cat "$PID_FILE" 2>/dev/null || true)"
  [[ -n "$failed_pid" ]] && log "Tracked pid: ${failed_pid}"
fi
if [[ -f "$LOG_FILE" ]]; then
  log "Recent proxy log tail:"
  tail -n 40 "$LOG_FILE" || true
fi

exit 1
