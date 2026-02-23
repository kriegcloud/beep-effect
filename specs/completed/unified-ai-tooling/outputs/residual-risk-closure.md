# Residual Risk Closure Plan (.beep)

Date: 2026-02-23
Status: partially closed (post-POC follow-up active)

## 1. Purpose

Convert remaining non-blocking risks into explicit, testable gates so kickoff can proceed without hidden ambiguity.

## 2. Current Closure Snapshot (Post-POC)

| Risk | POC Evidence | Status | Next Owner |
|---|---|---|---|
| JetBrains prompt-library target uncertainty | `outputs/poc-03-jetbrains-prompt-library-results.md` | closed for v1 baseline | P2 hardening |
| Cursor/Windsurf MCP capability drift | `outputs/poc-02-mcp-capability-results.md` | baseline closed, monitor drift | P2 hardening |
| Revert behavior safety | `outputs/poc-04-managed-ownership-revert-results.md` | baseline closed, expand to repo fanout | P3/P4 |
| CI/hooks deferred | design decision | open-by-design | P4 + CI branch |
| Secret auth success-path evidence (desktop/service account) | `outputs/poc-05-secret-resolution-results.md` | open follow-up | P3 |

## 3. Risk-by-Risk Closure

### 3.1 JetBrains prompt-library target uncertainty

Observed:
- JetBrains documents prompt-library behavior through UI workflows, but does not document a stable project-local file path/format for direct machine generation.
- JetBrains does document project rules path (`.aiassistant/rules/*.md`) as project-local.

Closure decision:
1. Keep JetBrains prompt-library in v1 scope.
2. Define v1 as a deterministic "prompt bundle contract" under project control:
   - `.aiassistant/prompt-library/prompts.md`
   - `.aiassistant/prompt-library/prompts.json` (beep-managed intermediate schema)
   - `.aiassistant/prompt-library/IMPORT_INSTRUCTIONS.md`
3. Treat direct IDE-native prompt-library file emission as a best-effort extension only if a stable official path/format is discovered during fixtures.
4. P2 must include a `jetbrains.promptLibrary.mode` contract:
   - `bundle_only` (default, deterministic and supported)
   - `native_file` (optional, requires proven stable path/format fixture)

Pass criteria:
1. P2 adapter contract explicitly defines `bundle_only` and `native_file`.
2. P2 fixtures demonstrate deterministic generation for bundle artifacts.
3. If `native_file` is used, fixture evidence must include discovered path, parser validity, and round-trip safety.

Execution evidence:
1. POC-03 passed with deterministic `bundle_only` output.
2. POC-03 native probe envelope proved stable deterministic path metadata (`.aiassistant/prompt-library/prompts.json`) and deterministic round-trip flag.
3. Remaining requirement is adapter-level hardening in P2, not architectural uncertainty.

### 3.2 Cursor/Windsurf MCP capability drift

Observed:
- Cursor docs emphasize MCP support and shared CLI/editor `mcp.json` configuration behavior.
- Windsurf docs explicitly document `mcp_config.json` and supported fields/interpolation behavior.

Closure decision:
1. Freeze a capability baseline in P2 with explicit field-level mapping:
   - transport support
   - auth support
   - field naming/shape differences
   - unsupported-field behavior (warn/error)
2. Require golden fixtures for each tool:
   - stdio transport
   - HTTP/SSE transport
   - env/header interpolation
3. Any unproven field remains blocked behind adapter override and emits warning in non-strict mode.

Pass criteria:
1. P2 includes capability tables for Cursor and Windsurf.
2. P2 `Quality Gate Evidence` lists fixture files and pass/fail results.
3. P3 integration tests validate no silent drops for capability-mapped fields.

Execution evidence:
1. POC-02 passed with fixture-backed output parity for Codex/Cursor/Windsurf.
2. Default mode warning behavior (`W_UNSUPPORTED_FIELD`) was validated for unsupported fields.
3. Strict mode fail-fast behavior (non-zero exit) was validated.

### 3.3 Revert behavior safety

Observed:
- `revert` is now mandatory in v1 and scoped to managed targets only.

Closure decision:
1. Revert must be bounded by managed state/backup metadata.
2. Revert must never touch unmanaged files.
3. Revert must be idempotent (double-run leaves no extra changes).

Required test scenarios:
1. Restore overwritten managed file from backup.
2. Remove generated managed file created in current apply cycle (when no prior backup exists).
3. Keep unmanaged files untouched even if names are similar.
4. Double-run revert is safe (no further changes).

Pass criteria:
1. P3 integration tests cover scenarios 1-4.
2. P4 rollback rehearsal includes at least one partial-failure recovery using `revert`.

Execution evidence:
1. POC-04 passed with apply/check/revert flow evidence.
2. Unmanaged file stability was proven by byte-level diff.
3. Second `revert` call was proven idempotent (`changed: false`).

### 3.4 CI/hooks deferred in this branch

Observed:
- CI and git-hook rollout is intentionally deferred.

Closure decision:
1. Introduce temporary local enforcement contract until CI branch merges.
2. No phase may be marked complete without command evidence captured in `Quality Gate Evidence`.

Temporary local enforcement commands:
```bash
# pre-kickoff / per-phase local gate bundle
bun tooling/beep-sync/bin/beep-sync validate
bun tooling/beep-sync/bin/beep-sync apply --dry-run
bun tooling/beep-sync/bin/beep-sync check
bun run beep-sync:test:unit
bun run beep-sync:test:fixtures
bun run beep-sync:test:integration
bun run beep-sync:test:coverage
```

Pass criteria:
1. Each phase output includes executed command evidence and results.
2. Required signoff rows are present and non-rejected.
3. CI branch merge later should mirror this command bundle as pipeline jobs.

### 3.5 Secret auth success-path evidence gap

Observed:
1. POC-05 validated fail-hard behavior for missing/invalid auth and deterministic mock success paths.
2. POC-05 did not capture real successful secret resolution with valid desktop auth and valid service-account auth.

Closure decision:
1. Keep strict required-secret fail-hard behavior as locked baseline.
2. Keep optional-secret warn policy as locked baseline.
3. Track one explicit follow-up: capture command evidence for successful desktop and service-account secret resolution runs once valid credentials are available.
4. Treat absence of this positive-path evidence as an open runtime hardening item, not a blocker for P1/P2 design progression.

Pass criteria:
1. P3 runtime evidence includes at least one successful desktop-auth resolution run with valid session.
2. P3 runtime evidence includes at least one successful service-account resolution run with valid token.
3. Redaction guarantees remain demonstrated in both paths.

## 4. Phase Mapping

1. P2:
   - finalize JetBrains prompt-library mode contract.
   - freeze Cursor/Windsurf MCP capability maps with fixtures.
2. P3:
   - execute revert integration scenarios.
   - validate strict/non-strict diagnostic behavior with capability fixtures.
   - close `poc05-real-auth-success-evidence` with real-auth command evidence.
3. P4:
   - run rollback rehearsal including managed-target-only revert.
   - confirm migration signoffs.

## 5. Sources

Primary sources:
- JetBrains prompt library docs: https://www.jetbrains.com/help/ai-assistant/prompt-library.html
- JetBrains prompt-library settings reference: https://www.jetbrains.com/help/ai-assistant/settings-reference-prompt-library.html
- JetBrains project rules docs: https://www.jetbrains.com/help/ai-assistant/configure-project-rules.html
- Cursor MCP docs: https://docs.cursor.com/en/context/mcp
- Cursor CLI MCP config note: https://docs.cursor.com/en/cli/using
- Windsurf MCP docs: https://docs.windsurf.com/windsurf/cascade/mcp

Supporting local docs:
- `specs/completed/unified-ai-tooling/outputs/comprehensive-review.md`
- `specs/completed/unified-ai-tooling/outputs/tooling-compatibility-matrix.md`
- `specs/completed/unified-ai-tooling/outputs/quality-gates-and-test-strategy.md`
- `specs/completed/unified-ai-tooling/outputs/poc-02-mcp-capability-results.md`
- `specs/completed/unified-ai-tooling/outputs/poc-03-jetbrains-prompt-library-results.md`
- `specs/completed/unified-ai-tooling/outputs/poc-04-managed-ownership-revert-results.md`
- `specs/completed/unified-ai-tooling/outputs/poc-05-secret-resolution-results.md`
