#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." >/dev/null 2>&1 && pwd)"

bun run "$ROOT_DIR/src/bin.ts" normalize --input "$ROOT_DIR/fixtures/poc-01/valid/config.yaml" >/tmp/beep-sync-poc-normalize.json
diff -u "$ROOT_DIR/fixtures/poc-01/expected/normalized.json" /tmp/beep-sync-poc-normalize.json
bun run "$ROOT_DIR/src/bin.ts" generate --tool codex --fixture "$ROOT_DIR/fixtures/poc-02/mcp-codex.yaml" >/tmp/beep-sync-poc02-codex.toml
diff -u "$ROOT_DIR/fixtures/poc-02/expected/codex-config.toml" /tmp/beep-sync-poc02-codex.toml
bun run "$ROOT_DIR/src/bin.ts" generate --tool cursor --fixture "$ROOT_DIR/fixtures/poc-02/mcp-cursor.yaml" >/tmp/beep-sync-poc02-cursor.json
diff -u "$ROOT_DIR/fixtures/poc-02/expected/cursor-mcp.json" /tmp/beep-sync-poc02-cursor.json
bun run "$ROOT_DIR/src/bin.ts" generate --tool windsurf --fixture "$ROOT_DIR/fixtures/poc-02/mcp-windsurf.yaml" >/tmp/beep-sync-poc02-windsurf.json
diff -u "$ROOT_DIR/fixtures/poc-02/expected/windsurf-mcp.json" /tmp/beep-sync-poc02-windsurf.json

if bun run "$ROOT_DIR/src/bin.ts" generate --tool cursor --strict --fixture "$ROOT_DIR/fixtures/poc-02/mcp-cursor-unsupported.yaml" >/dev/null 2>/tmp/beep-sync-poc02-cursor-strict.err; then
  printf '%s\n' "[beep-sync scaffold] expected strict cursor failure for unsupported fields" >&2
  exit 1
fi
if ! rg -q "W_UNSUPPORTED_FIELD" /tmp/beep-sync-poc02-cursor-strict.err; then
  printf '%s\n' "[beep-sync scaffold] expected warning diagnostics missing for cursor strict failure" >&2
  exit 1
fi

if bun run "$ROOT_DIR/src/bin.ts" generate --tool windsurf --strict --fixture "$ROOT_DIR/fixtures/poc-02/mcp-windsurf-unsupported.yaml" >/dev/null 2>/tmp/beep-sync-poc02-windsurf-strict.err; then
  printf '%s\n' "[beep-sync scaffold] expected strict windsurf failure for unsupported fields" >&2
  exit 1
fi
if ! rg -q "W_UNSUPPORTED_FIELD" /tmp/beep-sync-poc02-windsurf-strict.err; then
  printf '%s\n' "[beep-sync scaffold] expected warning diagnostics missing for windsurf strict failure" >&2
  exit 1
fi
bun run "$ROOT_DIR/src/bin.ts" apply --dry-run --fixture "$ROOT_DIR/fixtures/poc-04/managed.yaml" >/dev/null
bun run "$ROOT_DIR/src/bin.ts" validate --fixture "$ROOT_DIR/fixtures/poc-05/secrets-required.yaml" >/dev/null
bun run "$ROOT_DIR/src/bin.ts" check --fixture "$ROOT_DIR/fixtures/poc-06/config.yaml" >/dev/null

printf '%s\n' "[beep-sync scaffold] test:integration passed"
