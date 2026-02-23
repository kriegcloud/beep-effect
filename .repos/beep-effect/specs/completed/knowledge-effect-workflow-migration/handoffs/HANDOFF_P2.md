# Phase 2 Handoff: knowledge-effect-workflow-migration

**Date**: 2026-02-07
**From**: P1 Discovery + Compatibility
**To**: P2 Migration Blueprint
**Status**: Ready

## Mission

Design the migration blueprint for moving knowledge workflow runtime to `@effect/workflow` with parity guarantees and rollback-safe sequencing.

## Required Context

Read these first:
- `specs/pending/knowledge-effect-workflow-migration/README.md`
- `specs/pending/knowledge-effect-workflow-migration/MASTER_ORCHESTRATION.md`
- `specs/pending/knowledge-effect-workflow-migration/outputs/P1_COMPATIBILITY_REPORT.md`
- `specs/pending/knowledge-effect-workflow-migration/outputs/P1_FILE_INVENTORY.md`
- `specs/pending/knowledge-effect-workflow-migration/outputs/P1_RISK_REGISTER.md`

## P1 Outcome Summary (Carry Forward)

- Proceed decision: **Proceed to P2 with guardrails**.
- High-priority risks: R1-R4 (failure-policy parity, retry ownership, persistence compatibility, actor-registry coupling).
- Explicit legacy deletion candidates identified for P5 (BatchActorRegistry, BatchMachine, mapActorState, DurableActivities, WorkflowPersistence full/partial).

## P2 Deliverables

Create:
- `specs/pending/knowledge-effect-workflow-migration/outputs/P2_MIGRATION_BLUEPRINT.md`
- `specs/pending/knowledge-effect-workflow-migration/handoffs/HANDOFF_P3.md`
- `specs/pending/knowledge-effect-workflow-migration/handoffs/P3_ORCHESTRATOR_PROMPT.md`

## P2 Requirements

1. Define target architecture and ownership boundaries (`Workflow/*`, `Runtime/*`, persistence adapters).
2. Provide phased execution plan with concrete file-level changes for P3-P5.
3. Define rollback strategy and cutover gates.
4. Convert P1 risks into explicit acceptance tests and verification gates.
5. Keep prior parity capabilities protected by non-regression checks.

## Verification For P2

Run:

```bash
bun run check --filter @beep/knowledge-domain
bun run check --filter @beep/knowledge-server
bun run lint --filter @beep/knowledge-server
bun test packages/knowledge/server/test/Workflow/
```

## Exit Criteria For P2

- [ ] migration blueprint is implementation-ready (not high-level only)
- [ ] risk-to-mitigation mapping is explicit and testable
- [ ] rollback and cutover gates are defined
- [ ] `HANDOFF_P3.md` and `P3_ORCHESTRATOR_PROMPT.md` are created
