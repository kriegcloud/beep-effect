# POC-02 Results: MCP Capability Maps

Date: 2026-02-23
Status: passed

## Objective

Validate Codex/Cursor/Windsurf MCP capability mapping, strict mode behavior, and no-silent-drop guarantees.

## Scope

- MCP domain only.
- Adapter-level generation and diagnostics.

## Commands Executed

```bash
bun tooling/beep-sync/bin/beep-sync generate --tool codex --fixture tooling/beep-sync/fixtures/poc-02/mcp-codex.yaml > /tmp/poc02-codex.toml
bun tooling/beep-sync/bin/beep-sync generate --tool cursor --fixture tooling/beep-sync/fixtures/poc-02/mcp-cursor.yaml > /tmp/poc02-cursor.json
bun tooling/beep-sync/bin/beep-sync generate --tool windsurf --fixture tooling/beep-sync/fixtures/poc-02/mcp-windsurf.yaml > /tmp/poc02-windsurf.json

cmp -s tooling/beep-sync/fixtures/poc-02/expected/codex-config.toml /tmp/poc02-codex.toml && echo codex-expected-match
cmp -s tooling/beep-sync/fixtures/poc-02/expected/cursor-mcp.json /tmp/poc02-cursor.json && echo cursor-expected-match
cmp -s tooling/beep-sync/fixtures/poc-02/expected/windsurf-mcp.json /tmp/poc02-windsurf.json && echo windsurf-expected-match

# default mode warnings (no silent field drops)
bun tooling/beep-sync/bin/beep-sync generate --tool cursor --fixture tooling/beep-sync/fixtures/poc-02/mcp-cursor-unsupported.yaml > /tmp/poc02-cursor-unsupported-default.json 2> /tmp/poc02-cursor-unsupported-default.err
rg -n "W_UNSUPPORTED_FIELD" /tmp/poc02-cursor-unsupported-default.err
bun tooling/beep-sync/bin/beep-sync generate --tool windsurf --fixture tooling/beep-sync/fixtures/poc-02/mcp-windsurf-unsupported.yaml > /tmp/poc02-windsurf-unsupported-default.json 2> /tmp/poc02-windsurf-unsupported-default.err
rg -n "W_UNSUPPORTED_FIELD" /tmp/poc02-windsurf-unsupported-default.err

# strict mode failures
bun tooling/beep-sync/bin/beep-sync generate --tool cursor --strict --fixture tooling/beep-sync/fixtures/poc-02/mcp-cursor-unsupported.yaml > /tmp/poc02-cursor-strict.out 2> /tmp/poc02-cursor-strict.err
bun tooling/beep-sync/bin/beep-sync generate --tool windsurf --strict --fixture tooling/beep-sync/fixtures/poc-02/mcp-windsurf-unsupported.yaml > /tmp/poc02-windsurf-strict.out 2> /tmp/poc02-windsurf-strict.err
```

Command evidence summary:
- Supported fixture generation matched expected outputs for Codex/Cursor/Windsurf (`*-expected-match`).
- Default mode emits explicit `W_UNSUPPORTED_FIELD` warnings when dropping unsupported fields.
- Strict mode exits non-zero and blocks generation when warnings exist (`cursor_strict_exit=1`, `windsurf_strict_exit=1`).
- Warnings include exact dropped field paths and tool names.

## Fixtures Used

- `tooling/beep-sync/fixtures/poc-02/*`
- `tooling/beep-sync/fixtures/poc-02/expected/*`

## Pass Criteria

1. Capability map exists and is fixture-backed for Codex/Cursor/Windsurf.
2. Unsupported fields warn in default mode.
3. Unsupported fields fail in strict mode.
4. No silent field drops.

## Result

- Verdict: pass
- Notes:
  - Implemented explicit capability map in runtime:
    - Codex: `transport`, `command`, `args`, `url`, `env`, `env_headers`
    - Cursor: `transport`, `url`, `env_headers`, `env`
    - Windsurf: `transport`, `url`, `env`
  - Unsupported-field handling is deterministic and non-silent in default mode.
  - Strict mode enforces fail-fast on any unsupported-field drop.

## Quality Gate Evidence

### Test Suites Executed

- `bun run --cwd tooling/beep-sync check` (pass)
- `bun run beep-sync:test:unit` (pass)
- `bun run beep-sync:test:fixtures` (pass)
- `bun run beep-sync:test:integration` (pass)
- `bun run beep-sync:test:coverage` (pass)

### Fixture Sets Used

- `tooling/beep-sync/fixtures/poc-02/mcp-codex.yaml`
- `tooling/beep-sync/fixtures/poc-02/mcp-cursor.yaml`
- `tooling/beep-sync/fixtures/poc-02/mcp-windsurf.yaml`
- `tooling/beep-sync/fixtures/poc-02/mcp-cursor-unsupported.yaml`
- `tooling/beep-sync/fixtures/poc-02/mcp-windsurf-unsupported.yaml`
- `tooling/beep-sync/fixtures/poc-02/expected/codex-config.toml`
- `tooling/beep-sync/fixtures/poc-02/expected/cursor-mcp.json`
- `tooling/beep-sync/fixtures/poc-02/expected/windsurf-mcp.json`

### TDD Evidence

- Added unsupported-field warning assertion in unit script:
  - `tooling/beep-sync/scripts/test-unit.sh` now verifies `W_UNSUPPORTED_FIELD` appears for non-strict Cursor unsupported fixture.
- Added full MCP adapter golden + strict-failure assertions in integration script:
  - `tooling/beep-sync/scripts/test-integration.sh` now diffs Codex/Cursor/Windsurf generated outputs against expected fixtures.
  - `tooling/beep-sync/scripts/test-integration.sh` now requires strict mode failure + warning diagnostics for unsupported Cursor/Windsurf fixtures.
- Updated expected fixture outputs to concrete deterministic outputs:
  - `tooling/beep-sync/fixtures/poc-02/expected/codex-config.toml`
  - `tooling/beep-sync/fixtures/poc-02/expected/cursor-mcp.json`
  - `tooling/beep-sync/fixtures/poc-02/expected/windsurf-mcp.json`

### Pass/Fail Summary

- passed: 4
- failed: 0
- skipped: 0

### Unresolved Risks

- Capability map currently covers only POC-02 fields and will need expansion as tool docs evolve (P2 adapter design).
- Cursor/Windsurf target schemas are fixture-driven contracts here; final native-schema parity should be revalidated during P2.

### Review Signoff

| Role | Reviewer | Date | Result | Notes |
|---|---|---|---|---|
| Design/Architecture | Codex (POC runner) | 2026-02-23 | approved | Capability map + strict/non-strict behavior proven with golden fixtures and strict failure checks. |
| Security/Secrets | Codex (POC runner) | 2026-02-23 | approved | MCP generation output contains only references/placeholders from fixtures; no runtime secret resolution performed in POC-02. |
| Migration/Operations | N/A | 2026-02-23 | N/A | P1-P3 allowed |
