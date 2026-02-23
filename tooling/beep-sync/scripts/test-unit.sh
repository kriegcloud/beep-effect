#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." >/dev/null 2>&1 && pwd)"

bun run "$ROOT_DIR/src/bin.ts" doctor >/dev/null
bun run "$ROOT_DIR/src/bin.ts" validate --fixtures "$ROOT_DIR/fixtures/poc-01/valid" >/dev/null
bun run "$ROOT_DIR/src/bin.ts" validate --fixtures "$ROOT_DIR/fixtures/poc-01/invalid" --expect-fail >/dev/null
bun run "$ROOT_DIR/src/bin.ts" generate --tool cursor --fixture "$ROOT_DIR/fixtures/poc-02/mcp-cursor-unsupported.yaml" >/tmp/beep-sync-poc02-cursor-nonstrict.json 2>/tmp/beep-sync-poc02-cursor-nonstrict.err
rg -q "W_UNSUPPORTED_FIELD" /tmp/beep-sync-poc02-cursor-nonstrict.err
bun run "$ROOT_DIR/src/bin.ts" generate --tool jetbrains --fixture "$ROOT_DIR/fixtures/poc-03/jetbrains-bundle.yaml" >/tmp/beep-sync-poc03-bundle-envelope.json
/usr/bin/jq -e '.mode == "bundle_only" and (.artifacts | length == 3)' /tmp/beep-sync-poc03-bundle-envelope.json >/dev/null
/usr/bin/jq -e '(.warnings | length) == 0' /tmp/beep-sync-poc03-bundle-envelope.json >/dev/null
/usr/bin/jq -e '.ok == true and .dryRun == true' <(bun run "$ROOT_DIR/src/bin.ts" apply --dry-run --fixture "$ROOT_DIR/fixtures/poc-04/managed.yaml") >/dev/null
BEEP_SYNC_SECRET_MODE=mock bun run "$ROOT_DIR/src/bin.ts" validate --fixture "$ROOT_DIR/fixtures/poc-05/secrets-required.yaml" >/tmp/beep-sync-poc05-required.json
/usr/bin/jq -e '.ok == true and .source == "mock" and (.required.missing | length) == 0 and .redaction.valuesExposed == false' /tmp/beep-sync-poc05-required.json >/dev/null
if BEEP_SYNC_SECRET_MODE=mock bun run "$ROOT_DIR/src/bin.ts" validate --fixture "$ROOT_DIR/fixtures/poc-05/secrets-missing.yaml" >/tmp/beep-sync-poc05-missing.json 2>/tmp/beep-sync-poc05-missing.err; then
  printf '%s\n' "[beep-sync scaffold] expected required-secret failure for missing fixture" >&2
  exit 1
fi
/usr/bin/jq -e '.ok == false and (.required.missing | length) > 0' /tmp/beep-sync-poc05-missing.json >/dev/null
BEEP_SYNC_MOCK_SECRET_VALUE="SENTINEL_SHOULD_NOT_LEAK" BEEP_SYNC_SECRET_MODE=mock bun run "$ROOT_DIR/src/bin.ts" validate --fixture "$ROOT_DIR/fixtures/poc-05/secrets-optional.yaml" >/tmp/beep-sync-poc05-optional.json
/usr/bin/jq -e '.ok == true and (.optional.missing | index("facebook_oauth_client_secret")) != null' /tmp/beep-sync-poc05-optional.json >/dev/null
if rg -q "SENTINEL_SHOULD_NOT_LEAK" /tmp/beep-sync-poc05-optional.json /tmp/beep-sync-poc05-missing.err; then
  printf '%s\n' "[beep-sync scaffold] secret value leaked into diagnostics/output" >&2
  exit 1
fi

printf '%s\n' "[beep-sync scaffold] test:unit passed"
