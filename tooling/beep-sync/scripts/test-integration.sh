#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." >/dev/null 2>&1 && pwd)"
REPO_ROOT="$(cd -- "$ROOT_DIR/../.." >/dev/null 2>&1 && pwd)"

run_beep_sync() {
  (
    cd "$REPO_ROOT"
    bun run "$ROOT_DIR/src/bin.ts" "$@"
  )
}

run_beep_sync normalize --input "$ROOT_DIR/fixtures/poc-01/valid/config.yaml" >/tmp/beep-sync-poc-normalize.json
/usr/bin/jq -S . "$ROOT_DIR/fixtures/poc-01/expected/normalized.json" >/tmp/beep-sync-poc01-expected-normalized.canonical.json
/usr/bin/jq -S . /tmp/beep-sync-poc-normalize.json >/tmp/beep-sync-poc01-actual-normalized.canonical.json
diff -u /tmp/beep-sync-poc01-expected-normalized.canonical.json /tmp/beep-sync-poc01-actual-normalized.canonical.json
run_beep_sync generate --tool codex --fixture "$ROOT_DIR/fixtures/poc-02/mcp-codex.yaml" >/tmp/beep-sync-poc02-codex.toml
diff -u "$ROOT_DIR/fixtures/poc-02/expected/codex-config.toml" /tmp/beep-sync-poc02-codex.toml
run_beep_sync generate --tool cursor --fixture "$ROOT_DIR/fixtures/poc-02/mcp-cursor.yaml" >/tmp/beep-sync-poc02-cursor.json
diff -u "$ROOT_DIR/fixtures/poc-02/expected/cursor-mcp.json" /tmp/beep-sync-poc02-cursor.json
run_beep_sync generate --tool windsurf --fixture "$ROOT_DIR/fixtures/poc-02/mcp-windsurf.yaml" >/tmp/beep-sync-poc02-windsurf.json
diff -u "$ROOT_DIR/fixtures/poc-02/expected/windsurf-mcp.json" /tmp/beep-sync-poc02-windsurf.json

if run_beep_sync generate --tool cursor --strict --fixture "$ROOT_DIR/fixtures/poc-02/mcp-cursor-unsupported.yaml" >/dev/null 2>/tmp/beep-sync-poc02-cursor-strict.err; then
  printf '%s\n' "[beep-sync] expected strict cursor failure for unsupported fields" >&2
  exit 1
fi
if ! rg -q "W_UNSUPPORTED_FIELD" /tmp/beep-sync-poc02-cursor-strict.err; then
  printf '%s\n' "[beep-sync] expected warning diagnostics missing for cursor strict failure" >&2
  exit 1
fi

if run_beep_sync generate --tool windsurf --strict --fixture "$ROOT_DIR/fixtures/poc-02/mcp-windsurf-unsupported.yaml" >/dev/null 2>/tmp/beep-sync-poc02-windsurf-strict.err; then
  printf '%s\n' "[beep-sync] expected strict windsurf failure for unsupported fields" >&2
  exit 1
fi
if ! rg -q "W_UNSUPPORTED_FIELD" /tmp/beep-sync-poc02-windsurf-strict.err; then
  printf '%s\n' "[beep-sync] expected warning diagnostics missing for windsurf strict failure" >&2
  exit 1
fi

run_beep_sync generate --tool jetbrains --fixture "$ROOT_DIR/fixtures/poc-03/jetbrains-bundle.yaml" >/tmp/beep-sync-poc03-bundle-envelope.json
/usr/bin/jq -e '.mode == "bundle_only" and .nativeProbe.enabled == false' /tmp/beep-sync-poc03-bundle-envelope.json >/dev/null
/usr/bin/jq -j '.artifacts[] | select(.path==".aiassistant/prompt-library/prompts.md") | .content' /tmp/beep-sync-poc03-bundle-envelope.json >/tmp/beep-sync-poc03-prompts.md
diff -u "$ROOT_DIR/fixtures/poc-03/expected/prompts.md" /tmp/beep-sync-poc03-prompts.md
/usr/bin/jq -j '.artifacts[] | select(.path==".aiassistant/prompt-library/IMPORT_INSTRUCTIONS.md") | .content' /tmp/beep-sync-poc03-bundle-envelope.json >/tmp/beep-sync-poc03-import.md
diff -u "$ROOT_DIR/fixtures/poc-03/expected/IMPORT_INSTRUCTIONS.md" /tmp/beep-sync-poc03-import.md

run_beep_sync generate --tool jetbrains --mode native_file --fixture "$ROOT_DIR/fixtures/poc-03/jetbrains-native.yaml" >/tmp/beep-sync-poc03-native-envelope.json
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
/usr/bin/jq -e '.changed == true' <(run_beep_sync apply --fixture "$ROOT_DIR/fixtures/poc-04/managed.yaml") >/dev/null
/usr/bin/jq -e '.ok == true' <(run_beep_sync check --fixture "$ROOT_DIR/fixtures/poc-04/managed.yaml") >/dev/null
if ! rg -q "beep-sync poc-04 managed target content" "$ROOT_DIR/fixtures/poc-04/workspace/managed-target.txt"; then
  printf '%s\n' "[beep-sync] expected managed content missing after apply" >&2
  exit 1
fi
/usr/bin/jq -e '.ok == true and .changed == true' <(run_beep_sync revert --fixture "$ROOT_DIR/fixtures/poc-04/managed.yaml") >/dev/null
/usr/bin/jq -e '.ok == true and .changed == false' <(run_beep_sync revert --fixture "$ROOT_DIR/fixtures/poc-04/managed.yaml") >/dev/null
diff -u <(cat <<'FILE'
GENERATED: placeholder managed target content
FILE
) "$ROOT_DIR/fixtures/poc-04/workspace/managed-target.txt"
diff -u <(cat <<'FILE'
This file represents unmanaged user content and must never be touched by revert.
FILE
) "$ROOT_DIR/fixtures/poc-04/workspace/unmanaged-note.txt"

BEEP_SYNC_SECRET_MODE=mock run_beep_sync validate --fixture "$ROOT_DIR/fixtures/poc-05/secrets-required.yaml" >/tmp/beep-sync-poc05-required.json
/usr/bin/jq -e '.ok == true and .source == "mock" and (.required.missing | length) == 0 and .redaction.valuesExposed == false' /tmp/beep-sync-poc05-required.json >/dev/null
if BEEP_SYNC_SECRET_MODE=mock run_beep_sync validate --fixture "$ROOT_DIR/fixtures/poc-05/secrets-missing.yaml" >/tmp/beep-sync-poc05-missing.json 2>/tmp/beep-sync-poc05-missing.err; then
  printf '%s\n' "[beep-sync] expected required-secret failure for missing fixture" >&2
  exit 1
fi
/usr/bin/jq -e '.ok == false and (.required.missing | length) > 0' /tmp/beep-sync-poc05-missing.json >/dev/null
BEEP_SYNC_SECRET_MODE=mock run_beep_sync validate --fixture "$ROOT_DIR/fixtures/poc-05/secrets-optional.yaml" >/tmp/beep-sync-poc05-optional.json
/usr/bin/jq -e '.ok == true and (.optional.missing | index("facebook_oauth_client_secret")) != null' /tmp/beep-sync-poc05-optional.json >/dev/null

sha_before="$(sha256sum \
  "$ROOT_DIR/fixtures/poc-04/workspace/managed-target.txt" \
  "$ROOT_DIR/fixtures/poc-04/workspace/unmanaged-note.txt" \
  "$ROOT_DIR/fixtures/poc-06/config.yaml" \
  | sha256sum | cut -d ' ' -f1)"

run_beep_sync validate | sed -n '/^{/,$p' >/tmp/beep-sync-poc06-validate-1.json
run_beep_sync validate | sed -n '/^{/,$p' >/tmp/beep-sync-poc06-validate-2.json
diff -u /tmp/beep-sync-poc06-validate-1.json /tmp/beep-sync-poc06-validate-2.json

run_beep_sync apply --dry-run | sed -n '/^{/,$p' >/tmp/beep-sync-poc06-apply-1.json
run_beep_sync apply --dry-run | sed -n '/^{/,$p' >/tmp/beep-sync-poc06-apply-2.json
diff -u /tmp/beep-sync-poc06-apply-1.json /tmp/beep-sync-poc06-apply-2.json
/usr/bin/jq -e '.action == "apply" and .dryRun == true and .stats.skillTargetCount > 0' /tmp/beep-sync-poc06-apply-1.json >/dev/null
/usr/bin/jq -e '([.messages[] | select(startswith("skill-sync target=.agents/skills"))] | length) >= 1' /tmp/beep-sync-poc06-apply-1.json >/dev/null

run_beep_sync check | sed -n '/^{/,$p' >/tmp/beep-sync-poc06-check.json
run_beep_sync doctor | sed -n '/^{/,$p' >/tmp/beep-sync-poc06-doctor.json
/usr/bin/jq -e '.action == "check" and .ok == true' /tmp/beep-sync-poc06-check.json >/dev/null
/usr/bin/jq -e '.action == "doctor" and .ok == true' /tmp/beep-sync-poc06-doctor.json >/dev/null
/usr/bin/jq -e '.action == "revert" and .dryRun == true and .ok == true' <(run_beep_sync revert --dry-run) >/dev/null

sha_after="$(sha256sum \
  "$ROOT_DIR/fixtures/poc-04/workspace/managed-target.txt" \
  "$ROOT_DIR/fixtures/poc-04/workspace/unmanaged-note.txt" \
  "$ROOT_DIR/fixtures/poc-06/config.yaml" \
  | sha256sum | cut -d ' ' -f1)"
if [[ "$sha_before" != "$sha_after" ]]; then
  printf '%s\n' "[beep-sync] POC-06 no-arg command flow mutated managed baseline unexpectedly" >&2
  exit 1
fi

tmp_repo="$(mktemp -d)"
trap 'rm -rf "$tmp_repo"' EXIT
mkdir -p "$tmp_repo/.beep/instructions" "$tmp_repo/.beep/templates" "$tmp_repo/.beep/skills"
cp "$ROOT_DIR/../../.beep/instructions/root.md" "$tmp_repo/.beep/instructions/root.md"
cp "$ROOT_DIR/../../.beep/instructions/security.md" "$tmp_repo/.beep/instructions/security.md"
cp "$ROOT_DIR/../../.beep/templates/AGENTS.root.md.hbs" "$tmp_repo/.beep/templates/AGENTS.root.md.hbs"
cp "$ROOT_DIR/../../.beep/templates/AGENTS.package.md.hbs" "$tmp_repo/.beep/templates/AGENTS.package.md.hbs"
cp -R "$ROOT_DIR/../../.beep/skills/beep-sync" "$tmp_repo/.beep/skills/beep-sync"

cat > "$tmp_repo/package.json" <<'JSON'
{
  "name": "beep-sync-integration-fixture",
  "private": true,
  "workspaces": []
}
JSON

cat > "$tmp_repo/.beep/config.yaml" <<'YAML'
version: 1
project:
  name: beep-sync-integration-fixture
settings:
  ownership: full_file_rewrite
  commit_generated: true
  require_revert_backups: true
instructions:
  root:
    - .beep/instructions/root.md
    - .beep/instructions/security.md
  packages:
    strategy: generate_for_all_packages
    template: .beep/templates/AGENTS.package.md.hbs
  root_template: .beep/templates/AGENTS.root.md.hbs
commands: []
hooks: []
mcp:
  secret_provider:
    type: onepassword
    required: true
    optional_policy: warn
  servers: []
agents:
  definitions: []
skills:
  sources:
    - .beep/skills
  include:
    - beep-sync
tool_overrides:
  claude: {}
  codex: {}
  cursor: {}
  windsurf: {}
  jetbrains: {}
manifests:
  managed_files: .beep/manifests/managed-files.json
  state: .beep/manifests/state.json
YAML

(cd "$tmp_repo" && bun run "$ROOT_DIR/src/bin.ts" apply >/tmp/beep-sync-runtime-apply.json)
/usr/bin/jq -e '.action == "apply" and .ok == true and .changed == true and .stats.skillTargetCount > 0' /tmp/beep-sync-runtime-apply.json >/dev/null
test -f "$tmp_repo/.agents/skills/beep-sync/SKILL.md"
test -f "$tmp_repo/.agents/skills/beep-sync/references/commands.md"

(cd "$tmp_repo" && bun run "$ROOT_DIR/src/bin.ts" check >/tmp/beep-sync-runtime-check.json)
/usr/bin/jq -e '.action == "check" and .ok == true and .exitCode == 0' /tmp/beep-sync-runtime-check.json >/dev/null

(cd "$tmp_repo" && bun run "$ROOT_DIR/src/bin.ts" revert >/tmp/beep-sync-runtime-revert.json)
/usr/bin/jq -e '.action == "revert" and .ok == true and .changed == true' /tmp/beep-sync-runtime-revert.json >/dev/null
test ! -f "$tmp_repo/.agents/skills/beep-sync/SKILL.md"
test ! -f "$tmp_repo/.beep/manifests/state.json"

printf '%s\n' "[beep-sync] test:integration passed"
