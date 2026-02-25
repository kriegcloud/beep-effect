#!/usr/bin/env bash
set -euo pipefail

FALKOR_CONTAINER="${FALKOR_CONTAINER:-graphiti-mcp-falkordb-1}"
GRAPHITI_CONTAINER="${GRAPHITI_CONTAINER:-graphiti-mcp-graphiti-mcp-1}"
MCP_URL="${GRAPHITI_MCP_URL:-http://localhost:8000/mcp}"
VERIFY_GROUP="${GRAPHITI_VERIFY_GROUP:-beep-ast-kg}"
REHYDRATE_MODE="auto" # auto|always|never
WAIT_SECONDS="${WAIT_SECONDS:-180}"

usage() {
  cat <<'USAGE'
Usage: scripts/graphiti-recover.sh [options]

Options:
  --republish         Always republish AST KG to Graphiti after recovery.
  --skip-republish    Never republish AST KG.
  --group <id>        Group id to verify with get_episodes (default: beep-ast-kg).
  --url <mcp-url>     MCP URL (default: http://localhost:8000/mcp).
  -h, --help          Show this help.
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --republish)
      REHYDRATE_MODE="always"
      shift
      ;;
    --skip-republish)
      REHYDRATE_MODE="never"
      shift
      ;;
    --group)
      VERIFY_GROUP="$2"
      shift 2
      ;;
    --url)
      MCP_URL="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage
      exit 1
      ;;
  esac
done

require() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Missing required command: $1" >&2
    exit 1
  }
}

require docker
require curl

log() {
  printf '[graphiti-recover] %s\n' "$1"
}

health_status() {
  local container="$1"
  docker inspect --format '{{.State.Health.Status}}' "$container"
}

wait_healthy() {
  local deadline=$(( $(date +%s) + WAIT_SECONDS ))
  while :; do
    local f_status g_status
    f_status="$(health_status "$FALKOR_CONTAINER")"
    g_status="$(health_status "$GRAPHITI_CONTAINER")"

    log "health falkor=${f_status} graphiti=${g_status}"
    if [[ "$f_status" == "healthy" && "$g_status" == "healthy" ]]; then
      return 0
    fi

    if [[ $(date +%s) -ge $deadline ]]; then
      echo "Timed out waiting for healthy containers" >&2
      return 1
    fi
    sleep 5
  done
}

init_session() {
  local headers body
  headers="$(mktemp)"
  body="$(mktemp)"

  curl -sS -m 30 -D "$headers" -o "$body" \
    -H 'Accept: application/json, text/event-stream' \
    -H 'Content-Type: application/json' \
    --data '{"jsonrpc":"2.0","id":"recover-init","method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"graphiti-recover","version":"0.0.0"}}}' \
    "$MCP_URL" >/dev/null

  local sid
  sid="$(awk 'tolower($1)=="mcp-session-id:" {print $2}' "$headers" | tr -d '\r' | tail -n1)"
  rm -f "$headers" "$body"
  if [[ -z "$sid" ]]; then
    echo "Failed to initialize MCP session" >&2
    return 1
  fi
  printf '%s' "$sid"
}

mcp_call() {
  local sid payload
  sid="$1"
  payload="$2"

  curl -sS -m 45 \
    -H 'Accept: application/json, text/event-stream' \
    -H 'Content-Type: application/json' \
    -H "mcp-session-id: $sid" \
    --data "$payload" \
    "$MCP_URL"
}

extract_data() {
  sed -n 's/^data: //p'
}

log "Restarting $FALKOR_CONTAINER and $GRAPHITI_CONTAINER"
docker restart "$FALKOR_CONTAINER" "$GRAPHITI_CONTAINER" >/dev/null

wait_healthy

log "Running MCP smoke checks"
SESSION_ID="$(init_session)"

mcp_call "$SESSION_ID" '{"jsonrpc":"2.0","method":"notifications/initialized"}' >/dev/null

STATUS_JSON="$(mcp_call "$SESSION_ID" '{"jsonrpc":"2.0","id":"status","method":"tools/call","params":{"name":"get_status","arguments":{}}}' | extract_data)"
if [[ "$STATUS_JSON" != *'"status":"ok"'* ]]; then
  echo "Graphiti status check failed: $STATUS_JSON" >&2
  exit 1
fi

EPISODES_JSON="$(mcp_call "$SESSION_ID" "{\"jsonrpc\":\"2.0\",\"id\":\"episodes\",\"method\":\"tools/call\",\"params\":{\"name\":\"get_episodes\",\"arguments\":{\"group_ids\":[\"${VERIFY_GROUP}\"],\"max_episodes\":1}}}" | extract_data)"

needs_rehydrate="false"
if [[ "$REHYDRATE_MODE" == "always" ]]; then
  needs_rehydrate="true"
elif [[ "$REHYDRATE_MODE" == "auto" ]]; then
  if [[ "$EPISODES_JSON" == *"No episodes found"* || "$EPISODES_JSON" == *'"episodes":[]'* ]]; then
    needs_rehydrate="true"
  fi
fi

if [[ "$needs_rehydrate" == "true" ]]; then
  require bun
  log "Rehydrating Graphiti episodes via: bun run beep kg publish --target graphiti --mode full"
  bun run beep kg publish --target graphiti --mode full

  EPISODES_JSON="$(mcp_call "$SESSION_ID" "{\"jsonrpc\":\"2.0\",\"id\":\"episodes-after\",\"method\":\"tools/call\",\"params\":{\"name\":\"get_episodes\",\"arguments\":{\"group_ids\":[\"${VERIFY_GROUP}\"],\"max_episodes\":1}}}" | extract_data)"
fi

CLIENTS_INFO="$(docker exec "$FALKOR_CONTAINER" redis-cli INFO clients | sed -n '1,24p')"
log "Falkor clients snapshot:"
echo "$CLIENTS_INFO"

if [[ "$EPISODES_JSON" == *"Episodes retrieved successfully"* ]]; then
  log "Recovery complete: MCP healthy and episodes query returned data for group ${VERIFY_GROUP}."
else
  log "Recovery partial: MCP healthy but episodes response for ${VERIFY_GROUP} was:"
  echo "$EPISODES_JSON"
fi
