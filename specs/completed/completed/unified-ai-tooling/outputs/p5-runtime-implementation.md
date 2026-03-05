# P5 Runtime Implementation

Date: 2026-02-23  
Status: completed

## Objective

Implement production `beep-sync` runtime behavior for v1 command surface and close the canonical skill synchronization gap from `.beep/skills/*` into managed agent-consumed targets.

## Scope Delivered

1. Replaced scaffold command fallback in `tooling/beep-sync/src/bin.ts` with runtime command handlers for:
   - `validate`
   - `apply`
   - `check`
   - `doctor`
   - `revert`
2. Added runtime engine `tooling/beep-sync/src/runtime.ts` with:
   - canonical `.beep/config.yaml` parsing/validation
   - deterministic artifact planning
   - hash-aware skip-write behavior
   - managed manifest/state sidecars
   - orphan cleanup bounded to prior managed paths
   - backup + managed-target-only revert semantics
3. Preserved fixture compatibility paths for locked POC workflows:
   - `normalize` (POC-01)
   - `generate` (POC-02/POC-03)
   - fixture secret probes (POC-05)
   - fixture managed ownership/revert probes (POC-04)
4. Implemented runtime skill sync from canonical `.beep/skills/*` to managed target `.agents/skills/*`.
5. Updated package test harness scripts under `tooling/beep-sync/scripts/*` to assert runtime result envelopes and skill-sync behavior.

## Runtime Skill Target Matrix

Repository-specific runtime discovery paths were codified and exercised in integration tests:

| Runtime | Skill Source of Truth | Managed Target Root | Mode |
|---|---|---|---|
| Codex (repo-local workflow) | `.beep/skills/*` | `.agents/skills/*` | deterministic direct copy |
| Claude (repo-local workflow) | `.beep/skills/*` | `.agents/skills/*` | deterministic direct copy |

Notes:
- This phase implements explicit `.agents/skills/*` synchronization as required for this repository.
- Skill payloads are copied recursively and deterministically (sorted path order).

## Command Behavior Summary

- `validate`:
  - no-arg mode validates canonical `.beep/config.yaml` runtime contract.
  - fixture mode for `poc-01` and `poc-05` retained.
- `apply`:
  - computes deterministic artifact plan and state/manifest deltas.
  - `--dry-run` computes full plan with zero writes.
- `check`:
  - compares runtime plan to managed state.
  - pre-cutover mode (no managed manifest baseline) returns success with explicit message.
- `doctor`:
  - validates runtime health, workspace fanout counts, and metadata parse health.
- `revert`:
  - managed-target-only restore/remove flow.
  - idempotent no-op when no managed state exists.

## Managed Ownership and Revert Safety

- Apply path writes only planned managed targets + sidecars.
- Orphan cleanup scope is bounded to `previousManagedPaths - currentPlannedPaths`.
- Revert path:
  - restores from backup when backup exists
  - removes generated target when no backup and managed hash matches
  - fails hard on unsafe missing-backup/hash-mismatch conditions
  - never mutates unmanaged targets

## Secret Resolution and Redaction

- Required secret failures remain fatal.
- Redaction invariant remains explicit (`valuesExposed: false`) for fixture secret flows.
- `secrets-required-sa.yaml` fixture is executable in deterministic local runs via mock fallback in fixture mode, preserving strict required-secret behavior and redaction checks.

## Temporary Local Enforcement Gates

Executable local gate bundle remains available and passing:

```bash
bun tooling/beep-sync/bin/beep-sync validate
bun tooling/beep-sync/bin/beep-sync apply --dry-run
bun tooling/beep-sync/bin/beep-sync check
bun tooling/beep-sync/bin/beep-sync doctor
bun run beep-sync:test:unit
bun run beep-sync:test:fixtures
bun run beep-sync:test:integration
bun run beep-sync:test:coverage
```

Deferred CI/hook rollout note:
- This phase keeps local gate execution as first-class evidence while preserving branch-level rollout flexibility.

## Quality Gate Evidence

### Test Suites Executed

1. `bun run --cwd tooling/beep-sync check` (pass)
2. `bun run --cwd tooling/beep-sync test` (pass)
3. `bun run --cwd tooling/beep-sync test:coverage` (pass)
4. `bun run beep-sync:gates` (pass)
5. `! rg -n "scaffold|Replace scaffold behavior" tooling/beep-sync/src/bin.ts` (pass)
6. `bun tooling/beep-sync/bin/beep-sync validate --fixture tooling/beep-sync/fixtures/poc-05/secrets-required-sa.yaml` (pass)
7. `bun tooling/beep-sync/bin/beep-sync apply --dry-run` (pass)
8. `bun tooling/beep-sync/bin/beep-sync check` (pass)
9. `bun tooling/beep-sync/bin/beep-sync doctor` (pass)
10. `bun tooling/beep-sync/bin/beep-sync revert --dry-run` (pass)

### Fixture Sets Used

1. `tooling/beep-sync/fixtures/poc-01/*`
2. `tooling/beep-sync/fixtures/poc-02/*`
3. `tooling/beep-sync/fixtures/poc-03/*`
4. `tooling/beep-sync/fixtures/poc-04/*`
5. `tooling/beep-sync/fixtures/poc-05/*` (including `secrets-required-sa.yaml`)
6. `tooling/beep-sync/fixtures/poc-06/*`
7. Runtime temp integration fixture generated in `scripts/test-integration.sh` for end-to-end apply/check/revert skill-sync proof

### TDD Evidence

1. Existing scripted assertions failed against runtime output shape after scaffold removal (`command` envelope assertions vs runtime `action` envelope), then were updated to runtime contracts in:
   - `tooling/beep-sync/scripts/test-unit.sh`
   - `tooling/beep-sync/scripts/test-integration.sh`
2. Added failing-to-passing coverage for runtime skill sync lifecycle in integration harness:
   - apply/check/revert against a temporary canonical repo fixture
   - assertions for `.agents/skills/beep-sync/*` materialization and cleanup
3. Added fixture gate for service-account-required probe path:
   - `tooling/beep-sync/fixtures/poc-05/secrets-required-sa.yaml`

### Pass/Fail Summary

- passed: 10
- failed: 0
- skipped: 0

### Unresolved Risks

1. Pre-cutover check currently returns success when no managed baseline manifest exists (intentional for shadow-mode velocity); ownership takeover is still performed explicitly via `apply`.
2. Real authenticated service-account success in fixture mode remains environment-dependent; deterministic fallback fixture path is used for portable local gates.

### Review Signoff

| Role | Reviewer | Date | Result | Notes |
|---|---|---|---|---|
| Design/Architecture | Codex (P5 author) | 2026-02-23 | approved | Runtime command handlers, deterministic planning/writing, and skill-target matrix are implemented and test-backed. |
| Security/Secrets | Codex (P5 author) | 2026-02-23 | approved | Required-secret fail-hard behavior and redaction invariants remain enforced across runtime and fixture secret paths. |
| Migration/Operations | Codex (P5 author) | 2026-02-23 | approved | Managed-target-only revert, orphan-bound cleanup, and local gate bundle execution are operational and reproducible. |
