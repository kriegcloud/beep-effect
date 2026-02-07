# Phase 3 Handoff: knowledge-effect-workflow-migration

**Date**: 2026-02-07
**From**: P2 Migration Blueprint
**To**: P3 Runtime + Persistence Implementation
**Status**: Ready

## Mission

Implement the additive `@effect/workflow` runtime path in knowledge-server with dual-path safety (`legacy` + `shadow`/`engine` modes), preserving shipped behavior and enabling P4 cutover.

## Required Context

Read these first:
- `specs/pending/knowledge-effect-workflow-migration/README.md`
- `specs/pending/knowledge-effect-workflow-migration/MASTER_ORCHESTRATION.md`
- `specs/pending/knowledge-effect-workflow-migration/outputs/P1_COMPATIBILITY_REPORT.md`
- `specs/pending/knowledge-effect-workflow-migration/outputs/P1_FILE_INVENTORY.md`
- `specs/pending/knowledge-effect-workflow-migration/outputs/P1_RISK_REGISTER.md`
- `specs/pending/knowledge-effect-workflow-migration/outputs/P2_MIGRATION_BLUEPRINT.md`

## Non-Negotiable Constraints

1. Treat R1-R4 as release-gating constraints.
2. P3 is additive: do not delete legacy workflow files yet.
3. Keep current `BatchOrchestrator.run` external contract stable.
4. Implement and test rollback path (`engine/shadow -> legacy`) before P3 close.
5. Preserve parity-critical event/status semantics from existing `BatchOrchestrator` behavior.

## P3 Implementation Scope

Primary implementation files:
- `packages/knowledge/server/src/Workflow/BatchOrchestrator.ts`
- `packages/knowledge/server/src/Workflow/ExtractionWorkflow.ts`
- `packages/knowledge/server/src/Workflow/DurableActivities.ts`
- `packages/knowledge/server/src/Workflow/WorkflowPersistence.ts`
- `packages/knowledge/server/src/Workflow/index.ts`
- `packages/knowledge/server/src/Runtime/ServiceBundles.ts`
- `packages/knowledge/server/src/Runtime/index.ts`

Primary test scope:
- `packages/knowledge/server/test/Workflow/DurableActivities.test.ts`
- `packages/knowledge/server/test/Workflow/ExtractionWorkflow.test.ts`
- additional `packages/knowledge/server/test/Workflow/*` parity tests for policy/events/retry ownership

## P3 Required Outcomes

- Mode-gated orchestration path exists with `legacy`, `shadow`, `engine` modes.
- Engine workflow/activity path implemented for extraction/batch orchestration.
- No duplicate retry ownership for migrated activities.
- Persistence compatibility adapters allow unchanged API response contracts.
- Regression tests added/updated for R1-R8 coverage in P3 scope.

## P3 Deliverables

Create/Update:
- code changes under `packages/knowledge/server/src/Workflow/*` and `packages/knowledge/server/src/Runtime/*`
- tests under `packages/knowledge/server/test/Workflow/*`
- `specs/pending/knowledge-effect-workflow-migration/handoffs/HANDOFF_P4.md`
- `specs/pending/knowledge-effect-workflow-migration/handoffs/P4_ORCHESTRATOR_PROMPT.md`

## Verification For P3

Run:

```bash
bun run check --filter @beep/knowledge-domain
bun run check --filter @beep/knowledge-server
bun run lint --filter @beep/knowledge-server
bun test packages/knowledge/server/test/Workflow/
```

## Exit Criteria For P3

- [ ] engine path exists and can run in non-default mode
- [ ] legacy path remains default and fully functional
- [ ] rollback switch tested and documented
- [ ] R1-R4 mitigation hooks implemented (code + tests)
- [ ] P4 handoff docs created
