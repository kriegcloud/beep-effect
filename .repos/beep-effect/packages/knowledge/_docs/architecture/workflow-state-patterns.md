# Workflow State Management Patterns

## Current Issue: State Race Condition

The current implementation in `WorkflowOrchestrator.ts` has a race condition:

```typescript
// PROBLEM: State emitted outside workflow journal
const emitState = (state: BatchState) =>
  publishState(state).pipe(
    Effect.catchAll((error) => Effect.logWarning("Failed to publish batch state", { batchId, error }))
  )
```

When workflow replays after crash:
1. Activities replay from last checkpoint
2. `emitState()` is called again
3. External store has stale state
4. State is inconsistent

## Recommended Pattern

State should flow through workflow return value, not side effects:

```typescript
// GOOD: State as workflow result
export const BatchExtractionWorkflow = Workflow.make({
  name: "batch-extraction",
  payload: BatchWorkflowPayload,
  success: BatchState,  // Return final state
  error: BatchError,

  execute: (payload) => Effect.gen(function*() {
    // Build state through pipeline
    let state: BatchState = { _tag: "Pending", ... }

    state = yield* runExtraction(state)
    state = yield* runResolution(state)
    state = yield* runValidation(state)
    state = yield* runIngestion(state)

    return state  // Return via workflow, not side effect
  })
})

// External state sync happens AFTER workflow completes
const runAndSync = (payload) =>
  Effect.gen(function*() {
    const engine = yield* WorkflowEngine.WorkflowEngine
    const result = yield* engine.execute(BatchExtractionWorkflow, payload)

    // Only sync to external store after workflow completes
    if (result._tag === "Complete") {
      yield* publishState(Exit.getOrThrow(result.exit))
    }

    return result
  })
```

## Interim Mitigation

Until refactored, add idempotency to state publishing:

```typescript
const emitState = (state: BatchState) =>
  Effect.gen(function*() {
    const existing = yield* getBatchStateFromStore(state.batchId)

    // Only publish if state is newer
    if (Option.isNone(existing) ||
        DateTime.greaterThan(state.updatedAt, existing.value.updatedAt)) {
      yield* publishState(state)
    }
  }).pipe(
    Effect.catchAll((error) =>
      Effect.logWarning("Failed to publish batch state", { batchId: state.batchId, error })
    )
  )
```

## Migration Path

1. **Phase 1 (This Plan):** Document issue, add idempotency guard
2. **Phase 2 (Future):** Refactor to return state through workflow
3. **Phase 3 (Future):** Remove external state emission entirely
