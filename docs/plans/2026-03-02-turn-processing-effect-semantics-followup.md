# Turn Processing Effect Semantics Follow-up (2026-03-02)

## Scope

This follow-up captures low-risk improvements applied to:

- `packages/server/src/turn/TurnProcessingWorkflow.ts`
- `packages/server/src/turn/TurnProcessingRuntime.ts`

Focus areas:

- failure boundaries in workflow/runtime
- declarative instrumentation with `Effect.fn`
- stream semantics for terminal failures

## Implemented Changes

1. Runtime stream failure contract
- `processTurnStream` now converts typed `TurnProcessingError` failures into a terminal `turn.failed` event instead of failing the stream.
- Event identity preserves typed error data when available, with input payload fallback.
- `processTurn` retains typed failure semantics for non-stream callers.

2. Workflow failure boundary granularity
- Replaced broad model-outcome catch logic with:
  - `catchIf(isRequiresApprovalToolError, ...)` for checkpoint-aware `RequiresApproval` handling.
  - `catchAll(...)` fallback that audits and fails with typed `TurnModelFailure`.
- Encoding boundary now routes through the same audited typed-failure helper.

3. Instrumentation
- Added `Effect.fn` spans to:
  - `TurnProcessingRuntime.processTurn`
  - `TurnProcessingRuntime.makeExecutionId`
  - `TurnProcessingWorkflow.processWithToolLoop`
  - `TurnProcessingWorkflow.failWithAuditedModelFailure`

## Why This Is Safe

- No change to `ProcessTurnResult` schema or successful event ordering.
- No change to non-stream caller contract (`processTurn` still fails with typed `TurnProcessingError`).
- Stream behavior is more deterministic for clients expecting a terminal event sequence.

## Tests Updated

- `packages/server/test/TurnProcessingRuntime.test.ts`
  - Added assertions for `turn.failed` event mapping and failure code/message classification.
- `packages/server/test/TurnProcessingWorkflow.test.ts`
  - Added coverage for `isRequiresApprovalToolError`.
