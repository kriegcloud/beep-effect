# P5 Legacy Removal Report

## Scope

- `packages/knowledge/server/src/Workflow/*`
- `packages/knowledge/server/src/Runtime/*`
- `packages/knowledge/server/src/rpc/v1/batch/*`
- `packages/knowledge/server/test/Workflow/*`
- `packages/knowledge/server/test/Resilience/*`

## Legacy Runtime Artifacts Removed

Deleted runtime files:
- `packages/knowledge/server/src/Workflow/BatchActorRegistry.ts`
- `packages/knowledge/server/src/Workflow/BatchMachine.ts`
- `packages/knowledge/server/src/Workflow/mapActorState.ts`
- `packages/knowledge/server/src/Workflow/DurableActivities.ts`

Deleted legacy tests:
- `packages/knowledge/server/test/Workflow/BatchMachine.test.ts`
- `packages/knowledge/server/test/Workflow/mapActorState.test.ts`

Current workflow test surface:
- `packages/knowledge/server/test/Workflow/BatchOrchestratorEngineParity.test.ts`
- `packages/knowledge/server/test/Workflow/BatchAggregator.test.ts`
- `packages/knowledge/server/test/Workflow/ExtractionWorkflow.test.ts`

## Replacements / New Canonical Paths

- Actor-machine orchestration path replaced by engine-only path:
  - `packages/knowledge/server/src/Workflow/BatchOrchestrator.ts`
  - `packages/knowledge/server/src/Workflow/ExtractionWorkflow.ts`
- Runtime mode is engine-only (legacy/shadow removed from runtime behavior):
  - `packages/knowledge/server/src/Runtime/WorkflowRuntime.ts`
- Status/cancel/stream RPC lookups moved to persistence-backed execution records:
  - `packages/knowledge/server/src/rpc/v1/batch/getStatus.ts`
  - `packages/knowledge/server/src/rpc/v1/batch/cancelBatch.ts`
  - `packages/knowledge/server/src/rpc/v1/batch/streamProgress.ts`
- Persistence API now exposes batch-centric execution lookups and cancellation:
  - `packages/knowledge/server/src/Workflow/WorkflowPersistence.ts`
  - `findLatestBatchExecutionByBatchId`
  - `requireBatchExecutionByBatchId`
  - `cancelExecution`

## Evidence: No Remaining Runtime References

Command:
```bash
rg -n "BatchActorRegistry|BatchMachine|mapActorState|DurableActivities" \
  packages/knowledge/server/src packages/knowledge/server/test
```

Result:
- no matches

Command:
```bash
rg -n "legacy|shadow|BatchMachine|BatchActorRegistry|mapActorState|DurableActivities" \
  packages/knowledge/server/src/Workflow \
  packages/knowledge/server/src/Runtime \
  packages/knowledge/server/src/rpc/v1/batch
```

Result:
- no matches

## Engine-Default and Contract Parity Confirmation

- `WorkflowRuntimeMode` is now `"engine"` only in `packages/knowledge/server/src/Runtime/WorkflowRuntime.ts`.
- `BatchOrchestrator.run` external payload contract is preserved; execution internals now route through engine-only workflow path.
- Parity suite preserved and updated to engine internals:
  - `packages/knowledge/server/test/Workflow/BatchOrchestratorEngineParity.test.ts`
  - `packages/knowledge/server/test/Workflow/BatchAggregator.test.ts`
  - `packages/knowledge/server/test/Workflow/ExtractionWorkflow.test.ts`

## Type-Safety Constraint Compliance

Command:
```bash
rg -n "as unknown as" packages/knowledge/server/src packages/knowledge/server/test
```

Result:
- no matches

Additionally, workflow fixtures now use constructor-based typed instances (`new ExtractionResult(...)`) and valid branded IDs generated via `DocumentsEntityIds.DocumentId.create()`.

## Verification Results

Executed:

```bash
bun run check --filter @beep/knowledge-domain
bun run check --filter @beep/knowledge-server
bun run lint --filter @beep/knowledge-server
bun test packages/knowledge/server/test/Workflow/
bun test packages/knowledge/server/test/Resilience/
```

Results:
- `bun run check --filter @beep/knowledge-domain`: pass
- `bun run check --filter @beep/knowledge-server`: pass
- `bun run lint --filter @beep/knowledge-server`: pass
- `bun test packages/knowledge/server/test/Workflow/`: pass (12 passed, 0 failed)
- `bun test packages/knowledge/server/test/Resilience/`: pass (8 passed, 0 failed)

## Removed / Updated Exports

- Legacy exports removed from `packages/knowledge/server/src/Workflow/index.ts` for deleted legacy workflow artifacts.
- No runtime code path remains dependent on deleted actor-machine artifacts.

## Rollback Strategy Alignment (Post-P5)

- Post-P5 design is engine-only runtime.
- No legacy runtime fallback path remains; rollback now means reverting to pre-P5 revision, not toggling runtime mode.

## Success Criteria Status

- [x] legacy runtime files are removed only when safe
- [x] no runtime code path depends on removed legacy components
- [x] engine-default behavior remains parity-validated
- [x] `P5_LEGACY_REMOVAL_REPORT.md` contains concrete evidence (diff + verification results)
