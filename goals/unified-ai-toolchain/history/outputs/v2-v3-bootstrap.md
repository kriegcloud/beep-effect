# V2/V3 Bootstrap

## Status

Complete.

## Date

2026-06-07

## Purpose

This output records the decision pass that reopened the V1-complete
`unified-ai-toolchain` packet for V2 and V3 execution.

V1 remains complete: `@beep/ai-sync` exists as a tooling library with native
schemas, source metadata, drift checks, transform evidence, and `.codex`
dogfooding.

V2 becomes the active implementation target. V3 is planned as the production
sync/emission target.

## Decisions

- Reopen the existing packet in place instead of creating separate V2/V3 child
  packets.
- Add `GOAL.md` as the compact `/goal` launcher required for execution-capable
  packets.
- Keep reusable schema, drift, validation, and transform primitives in
  `packages/tooling/library/ai-sync`.
- Put V2 operator behavior in the existing root repo CLI as
  `bun run beep ai-sync ...`.
- Expose V2 commands: `audit`, `check`, `drift`, and `refresh-pr`.
- Make V2 validate all currently registered repo agent config files:
  `.codex/config.toml`, `.mcp.json`, `.claude/settings.json`, `AGENTS.md`, and
  `CLAUDE.md`.
- Use schema-first JSON reports plus human summaries for V2 outputs.
- Add V2 scheduled weekly plus manual-dispatch drift refresh PR automation.
- Use the existing data-sync workflow pattern for Auto-PR; do not depend on
  Yeet publish while Yeet remains proof-mode.
- Include rulesync schema-backed config/MCP import and audit evidence in V2.
- Keep ruler as research/mapping evidence in V2, not a supported parser.
- Use canonical per-domain schema models in V3.
- Introduce `.ai-sync/project.jsonc` as the V3 committed canonical source file.
- Make V3 native emission plan-first and apply-explicit.
- Ship V3 emitters for the current five target agents before V3b additional
  agent expansion.
- Make V3b expansion research-gated against fresh public sources.

## Current Drift Snapshot

The strict drift check was observed to report moved source hashes for:

- `claude-code-settings`
- `rulesync-config`
- `rulesync-mcp`

V2 should be able to refresh this class of drift through the scheduled/manual
Auto-PR lane.

## Packet Changes

- `README.md`: reframed status as V1 complete, V2 active, V3 planned.
- `SPEC.md`: added V2/V3 scope, boundaries, data products, and completion
  criteria.
- `PLAN.md`: replaced P6+ with versioned V2/V3 phases.
- `GOAL.md`: added compact execution launcher.
- `ops/manifest.json`: refreshed lifecycle, launcher metadata, phases, checks,
  known gaps, and next action.

## Verification

Packet-shape verification for this bootstrap:

```sh
test "$(wc -m < goals/unified-ai-toolchain/GOAL.md)" -le 4000
jq . goals/unified-ai-toolchain/ops/manifest.json
rg -n "V2|V3|GOAL.md|agentLaunchers|packetAnchorDocument" goals/unified-ai-toolchain
git diff --check -- goals/unified-ai-toolchain
```
