#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." >/dev/null 2>&1 && pwd)"

bun run "$ROOT_DIR/src/bin.ts" doctor >/dev/null
bun run "$ROOT_DIR/src/bin.ts" validate --fixtures "$ROOT_DIR/fixtures/poc-01/valid" >/dev/null
bun run "$ROOT_DIR/src/bin.ts" validate --fixtures "$ROOT_DIR/fixtures/poc-01/invalid" --expect-fail >/dev/null
bun run "$ROOT_DIR/src/bin.ts" generate --tool cursor --fixture "$ROOT_DIR/fixtures/poc-02/mcp-cursor-unsupported.yaml" >/tmp/beep-sync-poc02-cursor-nonstrict.json 2>/tmp/beep-sync-poc02-cursor-nonstrict.err
rg -q "W_UNSUPPORTED_FIELD" /tmp/beep-sync-poc02-cursor-nonstrict.err

printf '%s\n' "[beep-sync scaffold] test:unit passed"
