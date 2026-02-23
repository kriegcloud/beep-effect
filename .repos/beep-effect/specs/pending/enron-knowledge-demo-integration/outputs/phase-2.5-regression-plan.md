# Phase 2.5 Regression Plan

## Objective

Restore deterministic ingest lifecycle behavior for `knowledge-demo`:

- If `batch_start` returns `{ batchId }`, then `batch_getStatus({ batchId })` must be resolvable.
- Infrastructure failures must not be flattened into `BatchNotFoundError`.
- Batch start/status behavior must be aligned with reliable `@effect/workflow` execution semantics.

## Regression Root Cause

1. Start path acknowledged success before deterministic acceptance/persistence.
2. Initial execution persistence in batch workflow was non-deterministic.
3. Status/read boundary treated infra read failures as not-found.
4. Retry-failed policy reused extraction idempotency keys, weakening retry semantics.

## Chosen Architecture

## 1) Deterministic Start Acceptance

- Introduce `BatchOrchestrator.start(...)` as the RPC-facing start path.
- In `start(...)`, compute workflow execution id, persist initial execution row, then dispatch workflow with `discard: true`.
- Return success only after both persistence and dispatch complete without error.

Implementation anchor:
- `packages/knowledge/server/src/Workflow/BatchOrchestrator.ts`
- `packages/knowledge/server/src/entities/Batch/rpc/startBatch.ts`

## 2) Initial Persistence Is No Longer Best-Effort for Batch Lifecycle

- Move batch `createExecution(...)` out of worker body and into orchestrator `run/start`.
- Require worker lifecycle transitions (`running`, `completed`, `failed`) to surface persistence failures.
- Keep lifecycle observable and fail-fast when persistence cannot represent execution state.

Implementation anchor:
- `packages/knowledge/server/src/Workflow/BatchOrchestrator.ts`
- `packages/knowledge/server/test/Workflow/WorkflowPersistence.singleNodeSemantics.test.ts`

## 3) Typed Infra vs NotFound Separation

- Add `BatchInfrastructureError` in domain errors.
- Update batch RPC contracts to include infra failure variants.
- Map SQL read failures in `batch_getStatus` and `batch_streamProgress` to `BatchInfrastructureError`, not not-found.

Implementation anchor:
- `packages/knowledge/domain/src/errors/Batch.errors.ts`
- `packages/knowledge/domain/src/entities/Batch/contracts/StartBatch.contract.ts`
- `packages/knowledge/domain/src/entities/Batch/contracts/GetBatchStatus.contract.ts`
- `packages/knowledge/domain/src/entities/Batch/contracts/StreamProgress.contract.ts`
- `packages/knowledge/server/src/entities/Batch/rpc/getStatus.ts`
- `packages/knowledge/server/src/entities/Batch/rpc/streamProgress.ts`

## 4) Retry/Idempotency Coherence

- Add `retryAttempt` to extraction workflow config/payload.
- Include `retryOwner` + `retryAttempt` in extraction workflow idempotency key.
- For batch policy `retry-failed`, increment retry attempt per round so retries get distinct idempotency keys.

Implementation anchor:
- `packages/knowledge/server/src/Workflow/ExtractionWorkflow.ts`
- `packages/knowledge/server/src/Workflow/BatchOrchestrator.ts`

## 5) Required Engine in Batch Start/Run Path

- Batch orchestrator now requires workflow engine service and no longer uses optional engine fallback for batch dispatch.
- Batch start no longer uses daemon fork in RPC handler.

Implementation anchor:
- `packages/knowledge/server/src/Workflow/BatchOrchestrator.ts`
- `packages/knowledge/server/src/entities/Batch/rpc/startBatch.ts`

## Migration Sequence Executed

1. Add `BatchInfrastructureError` domain error.
2. Expand Start/GetStatus/StreamProgress contracts to carry infra failures.
3. Replace RPC `batch_start` optimistic path with `orchestrator.start(...)`.
4. Refactor orchestrator to persist execution before dispatch and map dispatch failures.
5. Remove best-effort semantics for batch worker lifecycle status transitions.
6. Update status/progress RPC handlers to preserve not-found vs infra distinctions.
7. Add `retryAttempt` propagation and idempotency-key partitioning for retry rounds.
8. Update persistence tests to assert failures on critical lifecycle persistence write failures.

## Risk Notes and Controls

- Risk: stricter persistence semantics can fail fast in degraded DB conditions.
  - Control: surfaced typed infra errors preserve diagnosability and prevent phantom success.
- Risk: retry behavior changes can alter observed duplicate handling.
  - Control: idempotency key now intentionally tracks retry round, making policy behavior explicit.

## Phase 2.5 Exit Conditions

- No phantom `batchId` returned on `batch_start`.
- Returned `batchId` is status-resolvable via `batch_getStatus`.
- Infra failures surfaced as non-notfound typed failures.
- Lifecycle states remain observable (`pending/extracting/resolving/completed/failed/cancelled`).
- Target package checks/tests pass for `@beep/knowledge-server` and `@beep/todox`.
