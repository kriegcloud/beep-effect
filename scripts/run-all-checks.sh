#!/usr/bin/env bash

set -uo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

status=0

run_check_lane() {
  local label="$1"
  shift

  printf '[check:all] %s\n' "$label"

  if ! "$@"; then
    status=1
  fi
}

run_check_lane "tsgo monorepo check" bun run check
run_check_lane "type assertion suite (tstyche)" bun run check:types

exit "$status"
