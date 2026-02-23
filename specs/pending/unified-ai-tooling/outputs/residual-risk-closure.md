# Residual Risk Closure Plan (.beep)

Date: 2026-02-23
Status: active closure contract

## 1. Purpose

Convert remaining non-blocking risks into explicit, testable gates so kickoff can proceed without hidden ambiguity.

## 2. Risk-by-Risk Closure

### 2.1 JetBrains prompt-library target uncertainty

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

### 2.2 Cursor/Windsurf MCP capability drift

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

### 2.3 Revert behavior safety

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

### 2.4 CI/hooks deferred in this branch

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

## 3. Phase Mapping

1. P2:
   - finalize JetBrains prompt-library mode contract.
   - freeze Cursor/Windsurf MCP capability maps with fixtures.
2. P3:
   - execute revert integration scenarios.
   - validate strict/non-strict diagnostic behavior with capability fixtures.
3. P4:
   - run rollback rehearsal including managed-target-only revert.
   - confirm migration signoffs.

## 4. Sources

Primary sources:
- JetBrains prompt library docs: https://www.jetbrains.com/help/ai-assistant/prompt-library.html
- JetBrains prompt-library settings reference: https://www.jetbrains.com/help/ai-assistant/settings-reference-prompt-library.html
- JetBrains project rules docs: https://www.jetbrains.com/help/ai-assistant/configure-project-rules.html
- Cursor MCP docs: https://docs.cursor.com/en/context/mcp
- Cursor CLI MCP config note: https://docs.cursor.com/en/cli/using
- Windsurf MCP docs: https://docs.windsurf.com/windsurf/cascade/mcp

Supporting local docs:
- `specs/pending/unified-ai-tooling/outputs/comprehensive-review.md`
- `specs/pending/unified-ai-tooling/outputs/tooling-compatibility-matrix.md`
- `specs/pending/unified-ai-tooling/outputs/quality-gates-and-test-strategy.md`
