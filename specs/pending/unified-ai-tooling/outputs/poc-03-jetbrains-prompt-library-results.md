# POC-03 Results: JetBrains Prompt Library

Date: 2026-02-23
Status: passed

## Objective

Validate JetBrains prompt-library v1 strategy:
- `bundle_only` default behavior
- optional `native_file` probe when stable path/format is proven

## Scope

- JetBrains prompt-library artifact generation only.

## Commands Executed

```bash
bun tooling/beep-sync/bin/beep-sync generate --tool jetbrains --fixture tooling/beep-sync/fixtures/poc-03/jetbrains-bundle.yaml > /tmp/poc03-bundle-1.json
bun tooling/beep-sync/bin/beep-sync generate --tool jetbrains --fixture tooling/beep-sync/fixtures/poc-03/jetbrains-bundle.yaml > /tmp/poc03-bundle-2.json
diff -u /tmp/poc03-bundle-1.json /tmp/poc03-bundle-2.json

bun tooling/beep-sync/bin/beep-sync generate --tool jetbrains --mode native_file --fixture tooling/beep-sync/fixtures/poc-03/jetbrains-native.yaml > /tmp/poc03-native-1.json
bun tooling/beep-sync/bin/beep-sync generate --tool jetbrains --mode native_file --fixture tooling/beep-sync/fixtures/poc-03/jetbrains-native.yaml > /tmp/poc03-native-2.json
diff -u /tmp/poc03-native-1.json /tmp/poc03-native-2.json

/usr/bin/jq -e '.mode=="bundle_only" and (.artifacts|length)==3 and .nativeProbe.enabled==false' /tmp/poc03-bundle-1.json >/dev/null
/usr/bin/jq -e '.mode=="native_file" and .nativeProbe.enabled==true and .nativeProbe.path==".aiassistant/prompt-library/prompts.json" and .nativeProbe.roundTripDeterministic==true' /tmp/poc03-native-1.json >/dev/null

/usr/bin/jq -j '.artifacts[] | select(.path==".aiassistant/prompt-library/prompts.md") | .content' /tmp/poc03-bundle-1.json > /tmp/poc03-prompts-md.txt
/usr/bin/jq -j '.artifacts[] | select(.path==".aiassistant/prompt-library/IMPORT_INSTRUCTIONS.md") | .content' /tmp/poc03-bundle-1.json > /tmp/poc03-import-md.txt
/usr/bin/jq -j '.artifacts[] | select(.path==".aiassistant/prompt-library/prompts.json") | .content' /tmp/poc03-native-1.json > /tmp/poc03-native-prompts.json
diff -u tooling/beep-sync/fixtures/poc-03/expected/prompts.md /tmp/poc03-prompts-md.txt
diff -u tooling/beep-sync/fixtures/poc-03/expected/IMPORT_INSTRUCTIONS.md /tmp/poc03-import-md.txt
diff -u tooling/beep-sync/fixtures/poc-03/expected/prompts.json /tmp/poc03-native-prompts.json
sha256sum /tmp/poc03-bundle-1.json /tmp/poc03-bundle-2.json /tmp/poc03-native-1.json /tmp/poc03-native-2.json
```

Command evidence summary:
- Bundle mode determinism: repeated runs were byte-identical (`diff -u` clean; identical SHA-256).
- Native probe determinism: repeated runs were byte-identical (`diff -u` clean; identical SHA-256).
- Bundle output produced deterministic artifact envelope with three managed artifacts.
- Native probe output included stable path evidence at `.aiassistant/prompt-library/prompts.json` with deterministic round-trip flag.
- Extracted artifact content matched expected fixtures for `prompts.md`, `prompts.json` (native probe), and `IMPORT_INSTRUCTIONS.md`.

## Fixtures Used

- `tooling/beep-sync/fixtures/poc-03/*`
- `tooling/beep-sync/fixtures/poc-03/expected/*`

## Pass Criteria

1. `bundle_only` artifacts are deterministic.
2. If `native_file` mode used, stable path/format and round-trip evidence are captured.
3. If native mode is not proven, `bundle_only` remains accepted default.

## Result

- Verdict: pass
- Notes:
  - Implemented JetBrains prompt-library envelope generation in both `bundle_only` and `native_file` modes.
  - Locked default mode to `bundle_only` unless `--mode native_file` is explicitly requested.
  - Native probe now emits explicit metadata:
    - `enabled`
    - `path`
    - `roundTripDeterministic`

## Quality Gate Evidence

### Test Suites Executed

- `bun run --cwd tooling/beep-sync check` (pass)
- `bun run beep-sync:test:unit` (pass)
- `bun run beep-sync:test:fixtures` (pass)
- `bun run beep-sync:test:integration` (pass)
- `bun run beep-sync:test:coverage` (pass)

### Fixture Sets Used

- `tooling/beep-sync/fixtures/poc-03/jetbrains-bundle.yaml`
- `tooling/beep-sync/fixtures/poc-03/jetbrains-native.yaml`
- `tooling/beep-sync/fixtures/poc-03/expected/prompts.md`
- `tooling/beep-sync/fixtures/poc-03/expected/prompts.json`
- `tooling/beep-sync/fixtures/poc-03/expected/IMPORT_INSTRUCTIONS.md`

### TDD Evidence

- Added JetBrains bundle envelope assertions to unit script:
  - `tooling/beep-sync/scripts/test-unit.sh` verifies mode, artifact count, and warning-free envelope for bundle fixture.
- Added JetBrains golden and probe assertions to integration script:
  - `tooling/beep-sync/scripts/test-integration.sh` verifies bundle artifact extraction/diff against expected files.
  - `tooling/beep-sync/scripts/test-integration.sh` verifies native probe metadata contract and `prompts.json` native fixture parity.
- Upgraded expected fixtures from placeholders to deterministic outputs:
  - `tooling/beep-sync/fixtures/poc-03/expected/prompts.md`
  - `tooling/beep-sync/fixtures/poc-03/expected/prompts.json`
  - `tooling/beep-sync/fixtures/poc-03/expected/IMPORT_INSTRUCTIONS.md`

### Pass/Fail Summary

- passed: 3
- failed: 0
- skipped: 0

### Unresolved Risks

- JetBrains native-file path/format remains a project-level probe contract here and should be revalidated against future JetBrains documentation or real IDE export/import behavior during P2/P3 hardening.

### Review Signoff

| Role | Reviewer | Date | Result | Notes |
|---|---|---|---|---|
| Design/Architecture | Codex (POC runner) | 2026-02-23 | approved | Bundle-default + optional native probe behavior is deterministic and fixture-backed. |
| Security/Secrets | Codex (POC runner) | 2026-02-23 | approved | Prompt-library artifacts contain prompt references only; no secret resolution path in this POC. |
| Migration/Operations | N/A | 2026-02-23 | N/A | P1-P3 allowed |
