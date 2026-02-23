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

bun run "$ROOT_DIR/src/bin.ts" generate --tool jetbrains --fixture "$ROOT_DIR/fixtures/poc-03/jetbrains-bundle.yaml" >/tmp/beep-sync-poc03-bundle-envelope.json
/usr/bin/jq -e '.mode == "bundle_only" and .nativeProbe.enabled == false' /tmp/beep-sync-poc03-bundle-envelope.json >/dev/null
/usr/bin/jq -j '.artifacts[] | select(.path==".aiassistant/prompt-library/prompts.md") | .content' /tmp/beep-sync-poc03-bundle-envelope.json >/tmp/beep-sync-poc03-prompts.md
diff -u "$ROOT_DIR/fixtures/poc-03/expected/prompts.md" /tmp/beep-sync-poc03-prompts.md
/usr/bin/jq -j '.artifacts[] | select(.path==".aiassistant/prompt-library/IMPORT_INSTRUCTIONS.md") | .content' /tmp/beep-sync-poc03-bundle-envelope.json >/tmp/beep-sync-poc03-import.md
diff -u "$ROOT_DIR/fixtures/poc-03/expected/IMPORT_INSTRUCTIONS.md" /tmp/beep-sync-poc03-import.md

bun run "$ROOT_DIR/src/bin.ts" generate --tool jetbrains --mode native_file --fixture "$ROOT_DIR/fixtures/poc-03/jetbrains-native.yaml" >/tmp/beep-sync-poc03-native-envelope.json
/usr/bin/jq -e '.mode == "native_file" and .nativeProbe.enabled == true and .nativeProbe.path == ".aiassistant/prompt-library/prompts.json" and .nativeProbe.roundTripDeterministic == true' /tmp/beep-sync-poc03-native-envelope.json >/dev/null
/usr/bin/jq -j '.artifacts[] | select(.path==".aiassistant/prompt-library/prompts.json") | .content' /tmp/beep-sync-poc03-native-envelope.json >/tmp/beep-sync-poc03-native-prompts.json
diff -u "$ROOT_DIR/fixtures/poc-03/expected/prompts.json" /tmp/beep-sync-poc03-native-prompts.json

cat > "$ROOT_DIR/fixtures/poc-04/workspace/managed-target.txt" <<'FILE'
GENERATED: placeholder managed target content
FILE
cat > "$ROOT_DIR/fixtures/poc-04/workspace/unmanaged-note.txt" <<'FILE'
This file represents unmanaged user content and must never be touched by revert.
FILE
rm -f "$ROOT_DIR/fixtures/poc-04/workspace/managed-target.txt.bak"
rm -f "$ROOT_DIR/fixtures/poc-04/workspace/.beep/managed-files.json"
/usr/bin/jq -e '.changed == true' <(bun run "$ROOT_DIR/src/bin.ts" apply --fixture "$ROOT_DIR/fixtures/poc-04/managed.yaml") >/dev/null
/usr/bin/jq -e '.ok == true' <(bun run "$ROOT_DIR/src/bin.ts" check --fixture "$ROOT_DIR/fixtures/poc-04/managed.yaml") >/dev/null
if ! rg -q "beep-sync poc-04 managed target content" "$ROOT_DIR/fixtures/poc-04/workspace/managed-target.txt"; then
  printf '%s\n' "[beep-sync scaffold] expected managed content missing after apply" >&2
  exit 1
fi
/usr/bin/jq -e '.ok == true and .changed == true' <(bun run "$ROOT_DIR/src/bin.ts" revert --fixture "$ROOT_DIR/fixtures/poc-04/managed.yaml") >/dev/null
/usr/bin/jq -e '.ok == true and .changed == false' <(bun run "$ROOT_DIR/src/bin.ts" revert --fixture "$ROOT_DIR/fixtures/poc-04/managed.yaml") >/dev/null
diff -u <(cat <<'FILE'
GENERATED: placeholder managed target content
FILE
) "$ROOT_DIR/fixtures/poc-04/workspace/managed-target.txt"
diff -u <(cat <<'FILE'
This file represents unmanaged user content and must never be touched by revert.
FILE
) "$ROOT_DIR/fixtures/poc-04/workspace/unmanaged-note.txt"

BEEP_SYNC_SECRET_MODE=mock bun run "$ROOT_DIR/src/bin.ts" validate --fixture "$ROOT_DIR/fixtures/poc-05/secrets-required.yaml" >/tmp/beep-sync-poc05-required.json
/usr/bin/jq -e '.ok == true and .source == "mock" and (.required.missing | length) == 0 and .redaction.valuesExposed == false' /tmp/beep-sync-poc05-required.json >/dev/null
if BEEP_SYNC_SECRET_MODE=mock bun run "$ROOT_DIR/src/bin.ts" validate --fixture "$ROOT_DIR/fixtures/poc-05/secrets-missing.yaml" >/tmp/beep-sync-poc05-missing.json 2>/tmp/beep-sync-poc05-missing.err; then
  printf '%s\n' "[beep-sync scaffold] expected required-secret failure for missing fixture" >&2
  exit 1
fi
/usr/bin/jq -e '.ok == false and (.required.missing | length) > 0' /tmp/beep-sync-poc05-missing.json >/dev/null
BEEP_SYNC_SECRET_MODE=mock bun run "$ROOT_DIR/src/bin.ts" validate --fixture "$ROOT_DIR/fixtures/poc-05/secrets-optional.yaml" >/tmp/beep-sync-poc05-optional.json
/usr/bin/jq -e '.ok == true and (.optional.missing | index("facebook_oauth_client_secret")) != null' /tmp/beep-sync-poc05-optional.json >/dev/null

sha_before="$(sha256sum \
  "$ROOT_DIR/fixtures/poc-04/workspace/managed-target.txt" \
  "$ROOT_DIR/fixtures/poc-04/workspace/unmanaged-note.txt" \
  "$ROOT_DIR/fixtures/poc-06/config.yaml" \
  | sha256sum | cut -d ' ' -f1)"

bun run "$ROOT_DIR/src/bin.ts" validate | sed -n '/^{/,$p' >/tmp/beep-sync-poc06-validate-1.json
bun run "$ROOT_DIR/src/bin.ts" validate | sed -n '/^{/,$p' >/tmp/beep-sync-poc06-validate-2.json
diff -u /tmp/beep-sync-poc06-validate-1.json /tmp/beep-sync-poc06-validate-2.json

bun run "$ROOT_DIR/src/bin.ts" apply --dry-run | sed -n '/^{/,$p' >/tmp/beep-sync-poc06-apply-1.json
bun run "$ROOT_DIR/src/bin.ts" apply --dry-run | sed -n '/^{/,$p' >/tmp/beep-sync-poc06-apply-2.json
diff -u /tmp/beep-sync-poc06-apply-1.json /tmp/beep-sync-poc06-apply-2.json
/usr/bin/jq -e '.command == "apply" and .dryRun == true' /tmp/beep-sync-poc06-apply-1.json >/dev/null

bun run "$ROOT_DIR/src/bin.ts" check | sed -n '/^{/,$p' >/tmp/beep-sync-poc06-check.json
bun run "$ROOT_DIR/src/bin.ts" doctor | sed -n '/^{/,$p' >/tmp/beep-sync-poc06-doctor.json
/usr/bin/jq -e '.command == "check"' /tmp/beep-sync-poc06-check.json >/dev/null
/usr/bin/jq -e '.command == "doctor"' /tmp/beep-sync-poc06-doctor.json >/dev/null

sha_after="$(sha256sum \
  "$ROOT_DIR/fixtures/poc-04/workspace/managed-target.txt" \
  "$ROOT_DIR/fixtures/poc-04/workspace/unmanaged-note.txt" \
  "$ROOT_DIR/fixtures/poc-06/config.yaml" \
  | sha256sum | cut -d ' ' -f1)"
if [[ "$sha_before" != "$sha_after" ]]; then
  printf '%s\n' "[beep-sync scaffold] POC-06 no-arg command flow mutated managed baseline unexpectedly" >&2
  exit 1
fi

printf '%s\n' "[beep-sync scaffold] test:integration passed"
