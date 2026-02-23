# Phase 5 Handoff: knowledge-effect-workflow-migration

**Date**: 2026-02-07
**From**: P4 Cutover + Parity Validation
**To**: P5 Legacy Removal
**Status**: Ready

## Mission

Remove legacy workflow runtime artifacts after successful P4 engine-default cutover, while preserving validated behavior and keeping regressions blocked by parity tests.

## Required Context

Read these first:
- `specs/pending/knowledge-effect-workflow-migration/README.md`
- `specs/pending/knowledge-effect-workflow-migration/MASTER_ORCHESTRATION.md`
- `specs/pending/knowledge-effect-workflow-migration/outputs/P1_COMPATIBILITY_REPORT.md`
- `specs/pending/knowledge-effect-workflow-migration/outputs/P1_FILE_INVENTORY.md`
- `specs/pending/knowledge-effect-workflow-migration/outputs/P1_RISK_REGISTER.md`
- `specs/pending/knowledge-effect-workflow-migration/outputs/P2_MIGRATION_BLUEPRINT.md`
- `specs/pending/knowledge-effect-workflow-migration/outputs/P4_PARITY_VALIDATION.md`

## P4 Outcome Summary (Carry Forward)

- Runtime default mode is now `engine`.
- Explicit rollback path to `legacy` remains operational and test-covered.
- Policy parity and retry ownership parity are covered under engine execution tests.
- Persistence/status and event ordering parity evidence is documented in `P4_PARITY_VALIDATION.md`.

## Non-Negotiable Constraints for P5

1. Keep `BatchOrchestrator.run` external contract stable.
2. Remove only legacy runtime artifacts that satisfy P2 deletion preconditions.
3. Preserve all parity tests that validate P4 behavior (adapt tests, do not drop coverage).
4. If any P4 parity behavior changes, stop and document as explicit divergence.
5. Produce a full removal report with grep/import evidence and verification command outputs.

## P5 Primary Scope

- `packages/knowledge/server/src/Workflow/*`
- `packages/knowledge/server/src/Runtime/*` (only if exports/wiring cleanup is required)
- `packages/knowledge/server/test/Workflow/*`
- `specs/pending/knowledge-effect-workflow-migration/outputs/*`

## Candidate Legacy Targets

From P2/P1 risk-linked candidates:
- `packages/knowledge/server/src/Workflow/BatchActorRegistry.ts`
- `packages/knowledge/server/src/Workflow/BatchMachine.ts`
- `packages/knowledge/server/src/Workflow/mapActorState.ts`
- `packages/knowledge/server/src/Workflow/DurableActivities.ts` (if no remaining callers)
- `packages/knowledge/server/src/Workflow/WorkflowPersistence.ts` (full or partial, depending on remaining compatibility contract needs)
- cleanup in `packages/knowledge/server/src/Workflow/index.ts`

## Required P5 Deliverables

Create/update:
- legacy removals under `packages/knowledge/server/src/Workflow/*`
- migrated/rewritten tests under `packages/knowledge/server/test/Workflow/*`
- `specs/pending/knowledge-effect-workflow-migration/outputs/P5_LEGACY_REMOVAL_REPORT.md`

## Verification For P5

Run:

```bash
bun run check --filter @beep/knowledge-domain
bun run check --filter @beep/knowledge-server
bun run lint --filter @beep/knowledge-server
bun test packages/knowledge/server/test/Workflow/
bun test packages/knowledge/server/test/Resilience/
```

## Exit Criteria For P5

- [ ] No production/runtime path depends on legacy actor-machine runtime
- [ ] Legacy files deleted only after preconditions are satisfied
- [ ] Engine-default behavior remains parity-equivalent to P4 baseline
- [ ] `P5_LEGACY_REMOVAL_REPORT.md` includes concrete deletion and verification evidence
