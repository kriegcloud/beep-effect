# Phase 4 Handoff: knowledge-effect-workflow-migration

**Date**: 2026-02-07
**From**: P3 Runtime + Persistence Implementation
**To**: P4 Cutover + Parity Validation
**Status**: Ready

## Mission

Cut over knowledge workflow runtime default mode to `engine` with rollback safety, prove behavioral parity, and document any explicit/approved divergences.

## Required Context

Read these first:
- `specs/pending/knowledge-effect-workflow-migration/README.md`
- `specs/pending/knowledge-effect-workflow-migration/MASTER_ORCHESTRATION.md`
- `specs/pending/knowledge-effect-workflow-migration/outputs/P1_COMPATIBILITY_REPORT.md`
- `specs/pending/knowledge-effect-workflow-migration/outputs/P1_FILE_INVENTORY.md`
- `specs/pending/knowledge-effect-workflow-migration/outputs/P1_RISK_REGISTER.md`
- `specs/pending/knowledge-effect-workflow-migration/outputs/P2_MIGRATION_BLUEPRINT.md`

## P3 Outcome Summary (Carry Forward)

- Mode-gated execution (`legacy`/`shadow`/`engine`) is implemented in workflow runtime paths.
- Legacy-compatible persistence behavior remains available as rollback anchor.
- Retry ownership boundary is introduced to avoid duplicate retry loops.
- Workflow tests cover policy/status/progress/event behavior for migration-safe execution.

P4 must validate these assumptions under `engine` default and treat any parity drift as a release blocker.

## Non-Negotiable Constraints

1. Treat R1-R4 as stop-the-line cutover risks.
2. Preserve `BatchOrchestrator.run` external contract and payloads.
3. `engine` becomes default, but rollback to `legacy` must remain immediate and tested.
4. Preserve policy, terminal status, and event/progress ordering semantics unless divergence is explicitly approved and documented.
5. Do not perform P5 deletions in P4.

## P4 Deliverables

Create/update:
- `specs/pending/knowledge-effect-workflow-migration/outputs/P4_PARITY_VALIDATION.md`
- parity matrix/evidence under `specs/pending/knowledge-ontology-comparison/outputs/*` (as applicable)
- code and tests required for default-mode cutover + rollback safety
- `specs/pending/knowledge-effect-workflow-migration/handoffs/HANDOFF_P5.md`
- `specs/pending/knowledge-effect-workflow-migration/handoffs/P5_ORCHESTRATOR_PROMPT.md`

## P4 Implementation Focus

- Flip runtime default from `legacy` to `engine` in knowledge server workflow wiring.
- Keep runtime toggle path (`engine -> legacy`) operational and tested.
- Validate and lock parity for:
  - failure policies (`continue-on-failure`, `abort-all`, `retry-failed`)
  - terminal batch outcomes (`all failed => BatchFailed`, otherwise `BatchCompleted`)
  - retry ownership and attempt counts
  - execution/status response contracts
  - batch/progress event ordering
  - suspend/resume semantics for forced failure cases
- Record parity evidence and any approved divergence in `P4_PARITY_VALIDATION.md`.

## Verification For P4

Run:

```bash
bun run check --filter @beep/knowledge-domain
bun run check --filter @beep/knowledge-server
bun run lint --filter @beep/knowledge-server
bun test packages/knowledge/server/test/Workflow/
bun test packages/knowledge/server/test/Resilience/
```

## Exit Criteria For P4

- [ ] `engine` is default mode in runtime config
- [ ] rollback path to `legacy` is operational and test-covered
- [ ] R1-R4 mitigations are validated with test evidence
- [ ] parity evidence is captured in `P4_PARITY_VALIDATION.md`
- [ ] `HANDOFF_P5.md` and `P5_ORCHESTRATOR_PROMPT.md` are created
