#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
DEFAULT_PROXY_MCP_URL="http://127.0.0.1:8123/mcp"

if [[ $# -eq 0 ]]; then
  cat <<'USAGE'
Usage: scripts/kg-with-proxy.sh <kg-subcommand> [args...]

Examples:
  bun run kg:proxy -- publish --target both --mode full --group beep-ast-kg-run
  bun run kg:proxy -- verify --target both --group beep-ast-kg-run
USAGE
  exit 1
fi

bash "$ROOT_DIR/scripts/graphiti-proxy-ensure.sh"

if [[ -z "${BEEP_GRAPHITI_URL:-}" ]]; then
  export BEEP_GRAPHITI_URL="$DEFAULT_PROXY_MCP_URL"
fi

cd "$ROOT_DIR"
bun run beep kg "$@"
