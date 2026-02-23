# Phase 2.5 Validation

## Scope

Validate regression recovery for `knowledge-demo` batch ingest lifecycle:

- deterministic `batch_start` acceptance
- no false immediate not-found for returned batch ids
- infra failures surfaced as typed infrastructure failures
- lifecycle state observability and package checks/tests

## Deterministic Start/Status Contract Validation

## A) `batch_start` only returns after acceptance-critical steps

Evidence:
- RPC handler delegates to `BatchOrchestrator.start(...)` and returns accepted payload from orchestrator:
  - `packages/knowledge/server/src/entities/Batch/rpc/startBatch.ts`
- `start(...)` persists execution row first, then dispatches workflow, then returns:
  - `packages/knowledge/server/src/Workflow/BatchOrchestrator.ts`

Result:
- Start acknowledgment cannot be emitted before persistence row creation and workflow dispatch path complete.

## B) Returned batch id is status-discoverable under normal conditions

Evidence:
- Initial execution row is created before dispatch in orchestrator start/run paths:
  - `packages/knowledge/server/src/Workflow/BatchOrchestrator.ts`
- Status path resolves against persistence lookup:
  - `packages/knowledge/server/src/entities/Batch/rpc/getStatus.ts`

Result:
- Contract invariant is restored: returned `batchId` has deterministic initial persistence for status lookup.

## C) Infra vs NotFound failure distinction is preserved

Evidence:
- New typed error:
  - `packages/knowledge/domain/src/errors/Batch.errors.ts`
- Contract-level failures include infra variants:
  - `packages/knowledge/domain/src/entities/Batch/contracts/StartBatch.contract.ts`
  - `packages/knowledge/domain/src/entities/Batch/contracts/GetBatchStatus.contract.ts`
  - `packages/knowledge/domain/src/entities/Batch/contracts/StreamProgress.contract.ts`
- SQL read failures are mapped to infra error in handlers:
  - `packages/knowledge/server/src/entities/Batch/rpc/getStatus.ts`
  - `packages/knowledge/server/src/entities/Batch/rpc/streamProgress.ts`

Result:
- Read-path infrastructure failures no longer collapse into `BatchNotFoundError`.

## D) Retry-failed policy and idempotency are coherent

Evidence:
- `retryAttempt` added to extraction payload/config and engine payload schema:
  - `packages/knowledge/server/src/Workflow/ExtractionWorkflow.ts`
- Extraction idempotency key includes `retryOwner` and `retryAttempt`:
  - `packages/knowledge/server/src/Workflow/ExtractionWorkflow.ts`
- Batch retry loop increments retry round and passes attempt to document processing:
  - `packages/knowledge/server/src/Workflow/BatchOrchestrator.ts`

Result:
- Retry rounds produce distinct extraction workflow identities, avoiding retry no-op behavior from key collisions.

## E) Persistence behavior regression tests updated

Evidence:
- Batch worker now fails when critical lifecycle persistence writes fail:
  - `packages/knowledge/server/test/Workflow/WorkflowPersistence.singleNodeSemantics.test.ts`

Result:
- Tests now enforce fail-fast semantics for `running` and terminal status write failures in batch workflow execution.

## Command Verification

Executed in:
- `/home/elpresidank/YeeBois/projects/beep-effect2`

Commands and results:

1. `bun run check --filter @beep/knowledge-server`  
   - pass
2. `bun run test --filter @beep/knowledge-server`  
   - pass (`548 pass`, `20 skip`, `0 fail`)
3. `bun run check --filter @beep/todox`  
   - pass
4. `bun run test --filter @beep/todox`  
   - pass (`47 pass`, `0 fail`)

## Success Criteria Mapping

- No phantom `batchId` from start: **met**
- Immediate false `BatchNotFoundError` for returned ids: **met**
- Infra failures surfaced as non-notfound: **met**
- Lifecycle observability retained: **met**
- `@beep/knowledge-server` check/test pass: **met**
- `@beep/todox` check/test pass: **met**
