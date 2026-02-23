#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." >/dev/null 2>&1 && pwd)"

printf '%s\n' "[beep-sync scaffold] Running POC preflight..."
bash "$ROOT_DIR/scripts/test-fixtures.sh"

printf '%s\n' "[beep-sync scaffold] POC fixture tree is present."
