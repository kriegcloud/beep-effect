#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"

CODEX_PROJECT_DIR="${CODEX_PROJECT_DIR:-$PROJECT_DIR}" bun run "${SCRIPT_DIR}/lifecycle.ts" "$@"
