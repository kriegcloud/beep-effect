#!/usr/bin/env bash

set -uo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

status=0

run_check_lane() {
  local label="$1"
  shift

  printf '[check] %s\n' "$label"

  if ! "$@"; then
    status=1
  fi
}

run_check_lane "turbo workspace check (tsgo)" bunx turbo run check "$@"
run_check_lane "dtslint tsgo sweep" node scripts/run-dtslint-tsgo-checks.mjs

exit "$status"
