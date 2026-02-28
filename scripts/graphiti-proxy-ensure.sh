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

log() {
  printf '[graphiti-proxy:ensure] %s\n' "$1"
}

check_health() {
  curl -fsS -m 2 "$HEALTH_URL" >/dev/null 2>&1
}

if ! command -v bun >/dev/null 2>&1; then
  log "Missing required command: bun"
  exit 1
fi

mkdir -p "$LOG_DIR" "$(dirname "$PID_FILE")"

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
