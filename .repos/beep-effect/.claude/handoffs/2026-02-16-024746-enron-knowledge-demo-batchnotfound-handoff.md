# Handoff: Enron Knowledge Demo Phase 2 BatchNotFoundError

## Session Metadata
- Created: 2026-02-16 02:47:46 CST
- Project: /home/elpresidank/YeeBois/projects/beep-effect2
- Branch: enron-knowledge-demo-integration
- Head commit: 9a95b579cfa3043f25d1727f3c86b9f9f61cde18
- Supersedes: `/home/elpresidank/YeeBois/projects/beep-effect2/.claude/handoffs/2026-02-16-021444-enron-knowledge-demo-parseerror-fix.md`

## New Blocker
While running `/knowledge-demo` ingest flow, status polling now fails with:

- `BatchNotFoundError: Batch execution not found: knowledge_batch_execution__783b66a8-7f3f-45ff-bc54-87e56c880f3a`
- surfaced in browser console from RPC decode path (`batch_getStatus`)

User-provided stack trace indicates this happens on websocket RPC response decode during polling.

## Current Functional State
Previously blocked issues are resolved in this working tree:
- `BatchDocument` ParseError fixed by class instantiation in RPC client.
- RPC auth header forwarding is in place (`authorization: Bearer <sessionToken>`), avoiding prior Unauthorized.

Current regression is specifically batch status lookup after successful `batch_start` response.

## Code State (Relevant)

### Client RPC wiring
- `/home/elpresidank/YeeBois/projects/beep-effect2/apps/todox/src/app/knowledge-demo/rpc-client.ts`
  - Adds RPC headers from session token at `:54-65`.
  - Normalizes start payload docs with `BatchDocument.make(...)` at `:84-89`.
  - Uses `useAtomSet(..., { mode: "promise" })` at `:106-108`.

### UI polling flow
- `/home/elpresidank/YeeBois/projects/beep-effect2/apps/todox/src/app/knowledge-demo/KnowledgeDemoClientPage.tsx`
  - `batch_start` result is stored as `scenarioState.batchId` at `:341-350`.
  - polling calls `getKnowledgeBatchStatus({ batchId })` at `:389`.

### Server start/status path
- `/home/elpresidank/YeeBois/projects/beep-effect2/packages/knowledge/server/src/entities/Batch/rpc/startBatch.ts`
  - returns success immediately after forking orchestrator daemon at `:18-37`, returns at `:39-42`.
- `/home/elpresidank/YeeBois/projects/beep-effect2/packages/knowledge/server/src/entities/Batch/rpc/getStatus.ts`
  - resolves via `requireBatchExecutionByBatchId` and maps not found to `BatchNotFoundError` at `:45-49`.

### Persistence behavior likely related
- `/home/elpresidank/YeeBois/projects/beep-effect2/packages/knowledge/server/src/Workflow/BatchOrchestrator.ts`
  - `createExecution(...)` and `updateExecutionStatus(..., "running")` both swallow all causes (`Effect.catchAllCause(() => Effect.void)`) at `:345-361`.
- `/home/elpresidank/YeeBois/projects/beep-effect2/packages/knowledge/server/src/Workflow/WorkflowPersistence.ts`
  - insert happens in `createExecution` at `:111-117`.
  - `getStatus` lookup uses `workflow_type='batch_extraction' AND input->>'batchId' = ${batchId}` at `:236-245`.
  - absence becomes `BatchNotFoundError` at `:273-279`.

## Most Likely Root Cause
A phantom batch ID is being returned by `batch_start` even when persistence of workflow execution fails.

Reasoning:
1. `batch_start` always returns `{ batchId, totalDocuments }` without awaiting orchestrator completion (`forkDaemon`).
2. Orchestrator silently ignores persistence failures for initial `createExecution` and `running` update.
3. `batch_getStatus` depends on that persisted execution row and throws `BatchNotFoundError` when absent.

This aligns with symptom shape: immediate/early status polling on a valid-looking batch ID that does not exist in `workflow_execution` persistence.

## Alternative Hypotheses to Validate
1. Environment/db mismatch: `batch_start` and `batch_getStatus` may be hitting different backends (less likely, but possible in multi-service local setup).
2. Query mismatch in lookup: row exists but `workflow_type` or `input->>'batchId'` doesn’t match exactly.
3. Insert race window: polling happens before first execution row write (possible if persistence succeeds but is delayed); repeated polling should recover, but current error suggests not recovering.

## What Was Verified This Session
- `bun run check --filter @beep/runtime-server` passed.
- `bun run check --filter @beep/todox` passed.
- `bun run test --filter @beep/todox` passed (47 passing, 0 failing).

## Immediate Next Steps for Next Agent
1. Instrument and verify persistence on start path:
   - add temporary logging around `createExecution` and `updateExecutionStatus` failures in `BatchOrchestrator`.
   - capture batchId + sql error (without logging PII payload text).
2. Validate DB row existence for failing batchId in `workflow_execution` table.
3. Decide behavior contract for demo path:
   - recommended: do not swallow `createExecution` failure before returning start success.
   - at minimum: fail `batch_start` if initial execution persistence fails (prevents phantom batch ids).
4. Add deterministic handling in UI for `BatchNotFoundError` if backend consistency remains eventual.

## Suggested Fix Direction (Demo-Critical)
Prefer making `batch_start` deterministic by ensuring execution persistence succeeds before returning success.

Concretely:
- avoid unconditional “best-effort” swallow for initial `createExecution`/`running` state transition in `BatchOrchestrator`.
- convert persistence failure to typed `batch_start` failure (or deterministic “failed” state) so frontend doesn’t track non-existent batch ids.

## Working Tree Notes
Current dirty files include both Phase 2 changes and unrelated pre-existing edits:
- `/home/elpresidank/YeeBois/projects/beep-effect2/.env.example`
- `/home/elpresidank/YeeBois/projects/beep-effect2/apps/todox/src/app/knowledge-demo/KnowledgeDemoClientPage.tsx`
- `/home/elpresidank/YeeBois/projects/beep-effect2/apps/todox/src/app/knowledge-demo/actions.ts`
- `/home/elpresidank/YeeBois/projects/beep-effect2/apps/todox/src/app/knowledge-demo/constants.ts`
- `/home/elpresidank/YeeBois/projects/beep-effect2/apps/todox/src/app/knowledge-demo/page.tsx`
- `/home/elpresidank/YeeBois/projects/beep-effect2/apps/todox/src/app/knowledge-demo/rpc-client.ts`
- `/home/elpresidank/YeeBois/projects/beep-effect2/packages/knowledge/domain/src/entities/Batch/contracts/GetBatchStatus.contract.ts`
- `/home/elpresidank/YeeBois/projects/beep-effect2/packages/knowledge/domain/src/entities/GraphRag/contracts/Query.contract.ts`
- `/home/elpresidank/YeeBois/projects/beep-effect2/packages/runtime/server/src/AuthContext.layer.ts`

Untracked:
- `/home/elpresidank/YeeBois/projects/beep-effect2/.claude/handoffs/2026-02-16-021444-enron-knowledge-demo-parseerror-fix.md`

