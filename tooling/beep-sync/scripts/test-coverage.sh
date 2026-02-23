#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." >/dev/null 2>&1 && pwd)"

# Runtime package currently uses shell harness coverage checks.
bash "$ROOT_DIR/scripts/test-unit.sh"
bash "$ROOT_DIR/scripts/test-fixtures.sh"
bash "$ROOT_DIR/scripts/test-integration.sh"

printf '%s\n' "[beep-sync] test:coverage passed"
