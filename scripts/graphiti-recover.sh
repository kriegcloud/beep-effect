#!/usr/bin/env bash
set -euo pipefail

FALKOR_CONTAINER="${FALKOR_CONTAINER:-graphiti-mcp-falkordb-1}"
GRAPHITI_CONTAINER="${GRAPHITI_CONTAINER:-graphiti-mcp-graphiti-mcp-1}"
MCP_URL="${GRAPHITI_MCP_URL:-http://localhost:8000/mcp}"
VERIFY_GROUP="${GRAPHITI_VERIFY_GROUP:-beep-ast-kg}"
REHYDRATE_MODE="auto" # auto|always|never
MCP_PATH_PATCH_MODE="auto" # auto|always|never
WAIT_SECONDS="${WAIT_SECONDS:-180}"
DRY_RUN="false"

usage() {
  cat <<'USAGE'
Usage: scripts/graphiti-recover.sh [options]

Options:
  --republish         Always republish AST KG to Graphiti after recovery.
  --skip-republish    Never republish AST KG.
  --patch-mcp-path    Always apply MCP /mcp and /mcp/ compatibility hotfix.
  --skip-mcp-patch    Never apply MCP compatibility hotfix.
  --dry-run           Validate inputs and print planned recovery actions without side effects.
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
    --patch-mcp-path)
      MCP_PATH_PATCH_MODE="always"
      shift
      ;;
    --skip-mcp-patch)
      MCP_PATH_PATCH_MODE="never"
      shift
      ;;
    --dry-run)
      DRY_RUN="true"
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

if [[ "$DRY_RUN" == "true" ]]; then
  log "Dry-run mode enabled; no containers or MCP services will be mutated."
  log "Planned restart targets: ${FALKOR_CONTAINER}, ${GRAPHITI_CONTAINER}"
  log "Planned MCP endpoint: ${MCP_URL}"
  log "Planned verify group: ${VERIFY_GROUP}"
  log "Planned republish mode: ${REHYDRATE_MODE}"
  log "Planned MCP path patch mode: ${MCP_PATH_PATCH_MODE}"
  exit 0
fi

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

probe_init_headers() {
  local url="$1"
  local headers body
  headers="$(mktemp)"
  body="$(mktemp)"

  local code
  code="$(
    curl -sS -m 30 -D "$headers" -o "$body" -w '%{http_code}' \
      -H 'Accept: application/json, text/event-stream' \
      -H 'Content-Type: application/json' \
      --data '{"jsonrpc":"2.0","id":"compat-init","method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"graphiti-recover","version":"0.0.0"}}}' \
      "$url" || true
  )"

  local content_type
  content_type="$(awk 'tolower($1)=="content-type:" {print $2}' "$headers" | tr -d '\r' | tail -n1)"

  local session_id
  session_id="$(awk 'tolower($1)=="mcp-session-id:" {print $2}' "$headers" | tr -d '\r' | tail -n1)"

  rm -f "$headers" "$body"
  printf '%s|%s|%s' "$code" "$content_type" "$session_id"
}

is_streamable_ok() {
  local url="$1"
  local probe code ctype sid
  probe="$(probe_init_headers "$url")"
  code="${probe%%|*}"
  ctype="${probe#*|}"
  ctype="${ctype%%|*}"
  sid="${probe##*|}"

  [[ "$code" == "200" && "$ctype" == text/event-stream* && -n "$sid" ]]
}

apply_mcp_path_hotfix() {
  log "Applying MCP /mcp and /mcp/ compatibility hotfix in ${GRAPHITI_CONTAINER}"

  docker exec "$GRAPHITI_CONTAINER" sh -lc "python - <<'PY'
from pathlib import Path

path = Path('/app/mcp/src/graphiti_mcp_server.py')
text = path.read_text()
changed = False

if 'from starlette.routing import Route' not in text:
    text = text.replace(
        'from starlette.responses import JSONResponse\\n',
        'from starlette.responses import JSONResponse\\nfrom starlette.routing import Route\\n',
        1,
    )
    changed = True

if 'def enable_mcp_path_aliases() -> None:' not in text:
    insertion = '''

def enable_mcp_path_aliases() -> None:
    \"\"\"Serve both /mcp and /mcp/ without redirect-only responses.\"\"\"
    original_streamable_http_app = mcp.streamable_http_app

    def patched_streamable_http_app():
        app = original_streamable_http_app()

        canonical_path = mcp.settings.streamable_http_path.rstrip('/') or '/'
        alternate_path = canonical_path if canonical_path == '/' else f'{canonical_path}/'

        existing_paths = {
            route.path for route in app.router.routes if isinstance(route, Route)
        }

        def endpoint_for(path: str):
            for route in app.router.routes:
                if isinstance(route, Route) and route.path == path:
                    return route.endpoint
            return None

        canonical_endpoint = endpoint_for(canonical_path)
        alternate_endpoint = endpoint_for(alternate_path)

        if canonical_endpoint is not None and alternate_path not in existing_paths:
            app.router.routes.append(Route(alternate_path, endpoint=canonical_endpoint))
        elif alternate_endpoint is not None and canonical_path not in existing_paths:
            app.router.routes.append(Route(canonical_path, endpoint=alternate_endpoint))

        app.router.redirect_slashes = False
        return app

    mcp.streamable_http_app = patched_streamable_http_app
'''
    marker = '# Global services\\n'
    if marker not in text:
        raise SystemExit('Unable to locate Global services marker for MCP path patch')
    text = text.replace(marker, f\"{insertion}\\n{marker}\", 1)
    changed = True

if '\n        enable_mcp_path_aliases()\n' not in text:
    old = \"        logger.info('For MCP clients, connect to the /mcp/ endpoint above')\\n\\n        # Configure uvicorn logging to match our format\\n\"
    new = \"        logger.info('For MCP clients, connect to the /mcp endpoint above')\\n\\n        enable_mcp_path_aliases()\\n\\n        # Configure uvicorn logging to match our format\\n\"
    if old not in text:
        old = \"        logger.info('For MCP clients, connect to the /mcp endpoint above')\\n\\n        # Configure uvicorn logging to match our format\\n\"
    if old not in text:
        raise SystemExit('Unable to locate HTTP transport marker for MCP path patch')
    text = text.replace(old, new, 1)
    changed = True

if changed:
    path.write_text(text)
    print('patched')
else:
    print('already-patched')
PY"

  log "Restarting ${GRAPHITI_CONTAINER} after MCP path hotfix"
  docker restart "$GRAPHITI_CONTAINER" >/dev/null
  wait_healthy
}

apply_falkor_query_timeout_hotfix() {
  log "Applying FalkorDB query timeout hotfix in ${GRAPHITI_CONTAINER}"

  docker exec "$GRAPHITI_CONTAINER" sh -lc "python - <<'PY'
from pathlib import Path

path = Path('/app/mcp/.venv/lib/python3.11/site-packages/graphiti_core/driver/falkordb_driver.py')
text = path.read_text()
changed = False

if 'FALKORDB_QUERY_TIMEOUT_MS' not in text:
    text = text.replace(
        'import logging\\n',
        '''import logging
import os


def _falkordb_query_timeout_ms() -> int:
    try:
        return max(1, int(os.getenv('FALKORDB_QUERY_TIMEOUT_MS', '30000')))
    except ValueError:
        return 30000


FALKORDB_QUERY_TIMEOUT_MS = _falkordb_query_timeout_ms()
''',
        1,
    )
    changed = True

replacements = {
    'await self.graph.query(str(cypher), params)  #': 'await self.graph.query(str(cypher), params, timeout=FALKORDB_QUERY_TIMEOUT_MS)  #',
    'await self.graph.query(str(query), params)  #': 'await self.graph.query(str(query), params, timeout=FALKORDB_QUERY_TIMEOUT_MS)  #',
    'await graph.query(cypher_query_, params)  #': 'await graph.query(cypher_query_, params, timeout=FALKORDB_QUERY_TIMEOUT_MS)  #',
}

for old, new in replacements.items():
    if old in text:
        text = text.replace(old, new)
        changed = True

if changed:
    path.write_text(text)
    print('patched')
else:
    print('already-patched')
PY"

  log "Restarting ${GRAPHITI_CONTAINER} after FalkorDB query timeout hotfix"
  docker restart "$GRAPHITI_CONTAINER" >/dev/null
  wait_healthy
}

ensure_mcp_path_compat() {
  local canonical_url="${MCP_URL%/}"
  local slash_url="${canonical_url}/"

  if ! is_streamable_ok "$canonical_url"; then
    echo "MCP canonical endpoint failed streamable initialize check: ${canonical_url}" >&2
    return 1
  fi

  if [[ "$MCP_PATH_PATCH_MODE" == "always" ]]; then
    apply_mcp_path_hotfix
  fi

  if is_streamable_ok "$slash_url"; then
    log "MCP path compatibility check passed for both ${canonical_url} and ${slash_url}"
    return 0
  fi

  if [[ "$MCP_PATH_PATCH_MODE" == "never" ]]; then
    echo "MCP slash endpoint failed and patch mode is disabled: ${slash_url}" >&2
    return 1
  fi

  log "MCP slash endpoint failed streamable check; applying hotfix"
  apply_mcp_path_hotfix

  if ! is_streamable_ok "$canonical_url" || ! is_streamable_ok "$slash_url"; then
    echo "MCP compatibility checks failed after hotfix for ${canonical_url} and ${slash_url}" >&2
    return 1
  fi

  log "MCP path compatibility hotfix verified for ${canonical_url} and ${slash_url}"
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

ensure_mcp_path_compat
apply_falkor_query_timeout_hotfix

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
