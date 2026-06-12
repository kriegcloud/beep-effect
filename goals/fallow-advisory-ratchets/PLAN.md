# Fallow Advisory Ratchets Plan

## Status

Status: `active`

## Phases

| Phase | Status | Goal | Exit criteria |
| --- | --- | --- | --- |
| P0 Packet Authoring | done | Create this child packet and validator. | Packet validator and parent validator pass. |
| P1 Dupes Ratchet | done | Wire the existing clone inventory as the first duplication ratchet without promoting raw Fallow dupes. | `quality:reuse-clones` is in repo-quality/pre-push and `beep reuse clones --check` remains green. |
| P2 Health Ratchet | seeded | Build calibrated health inventory. | New/worsened critical/high policy is explicit and false positives are classified. |
| P3 Boundary And Flags Policy | in-progress | Promote boundary config freshness and define flag lifecycle inventory. | Config freshness is hard-check wired; flag registry contract exists. |
| P4 Guardrails And Close | seeded | Keep late lanes guarded/deferred and close review evidence. | Required findings are closed or waived with evidence. |

## Execution Notes

- Keep the parent packet reference-only in this authoring pass.
- `dupes` uses `standards/clone.inventory.jsonc` and
  `bun run beep reuse clones --check` as the first policy-backed ratchet.
- `quality:reuse-clones` wires that clone baseline gate into repo-quality and
  pre-push without adding a raw `fallow:dupes` blocking lane.
- Fallow dupes output remains advisory until reconciled with clone inventory
  semantics and accepted-duplication records.
- `health` needs a new inventory before any matrix promotion.
- `boundaries config-check --check` is not the same as Fallow boundary analyzer
  enforcement.
- `repo-sanity:fallow-boundaries-config` wires generated boundary config
  freshness without adding a raw `fallow:boundaries` blocking lane.
- `flags` needs a registry before a quiet baseline can become a gate.
- `security` and `fix-preview` should keep emitting advisory envelopes.
- `runtime-coverage` and `editor-mcp-hooks` stay out of implementation scope.

## Verification Commands

```sh
test "$(wc -m < goals/fallow-advisory-ratchets/GOAL.md)" -le 4000
bun goals/fallow-advisory-ratchets/ops/validate-packet.ts
bun goals/fallow-quality-enforcement/ops/validate-packet.ts
bun run beep quality fallow boundaries config-check --check
bun run beep quality github-checks plan-contract-check --mode pre-push --feature-matrix goals/fallow-quality-enforcement/research/feature-matrix.jsonc --expect-promoted-fallow-lanes
bun run beep reuse clones --check
bun test packages/tooling/tool/cli/test/quality-tasks.test.ts
bun run beep laws effect-fn --check
bun run beep quality repo-exports-catalog --package-shard --package @beep/repo-cli --check
bun run beep quality repo-exports-catalog --from-shards --check
git diff --check -- goals/fallow-advisory-ratchets
```
