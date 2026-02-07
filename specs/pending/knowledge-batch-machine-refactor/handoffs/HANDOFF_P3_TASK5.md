# Handoff: P3 Task 5 — RPC Handler Migration

## Tier 1: Critical Context

### Phase Goal
Migrate batch RPC handlers from reading/writing `BatchStateMachine` (in-memory HashMap read-model) to interacting with the persistent `BatchMachine` actor. Currently the orchestrator dual-writes to both the actor and the read-model; the handlers only read the read-model.

### Current State (After Task 4)
- `BatchOrchestrator` spawns a `PersistentActor` via `createPersistentActor` with `InMemoryPersistenceAdapter`
- The actor manages authoritative state with snapshot + event journal persistence
- `BatchStateMachine` (HashMap-based read-model) is still maintained in parallel
- RPC handlers exclusively read from `BatchStateMachine` and `BatchEventEmitter`
- Typecheck passes clean (33/33 turbo tasks)

### Architecture Decision Required
The RPC handlers need actor access, but actors are spawned per-batch inside `BatchOrchestrator.run()`. Two approaches:

**Option A: Actor Registry (recommended)**
- Use `@beep/machine`'s `ActorSystemService` to register actors by batchId
- RPC handlers resolve `ActorSystemService` and look up actors
- Enables `cancelBatch` to send `Cancel` event directly to the actor
- Enables `getStatus` to read from actor snapshot yield* Ref.update(actorsRef, (actors) => HashMap.remove(actors, batchId));
- Requires: resolving `ActorSystemService` in the orchestrator Layer

**Option B: Keep Read-Model (minimal change)**
- Keep `BatchStateMachine` as the RPC read-model (current dual-write pattern)
- Only change: `cancelBatch` should ALSO send `Cancel` to the actor (not just transition read-model)
- Requires: storing actor refs in a registry (could be a simple `Ref<HashMap<batchId, ActorRef>>`)

### Blocking Issues
- None (all prior tasks complete)

## Tier 2: Execution Checklist

### Step 1: Choose Actor Lookup Strategy
Decide between Option A (ActorSystemService) and Option B (manual Ref-based registry).

### Step 2: Migrate `startBatch.ts`
- **Current**: Calls `stateMachine.create(batchId)` + emits event
- **After**: Delegates to `BatchOrchestrator.run()` which handles actor creation
- Note: `startBatch` currently does NOT call the orchestrator — it only creates the state entry. The orchestrator is called separately. This needs clarification.

### Step 3: Migrate `getStatus.ts`
- **Current**: `stateMachine.getState(payload.batchId)`
- **Option A**: `actorSystem.lookup(batchId)` → `actor.snapshot`
- **Option B**: Keep `stateMachine.getState()` as-is (read-model)

### Step 4: Migrate `cancelBatch.ts`
- **Current**: `stateMachine.getState()` → transform to Cancelled → `stateMachine.transition()` → emit event
- **After**: Look up actor → `actor.send(BatchMachineEvent.Cancel)` + optionally update read-model
- The actor machine has `Cancel` transitions from Extracting and Resolving states, plus an `onAny` fallback

### Step 5: Migrate `streamProgress.ts`
- **Current**: `stateMachine.getState()` (validate exists) → `emitter.subscribe(batchId)`
- **Option A**: `actor.state` (SubscriptionRef) → Stream of state changes
- **Option B**: Keep `emitter.subscribe()` as-is (PubSub-based)
- Note: Actor's `state` is a `SubscriptionRef` that streams state changes directly

### Step 6: Remove Read-Model (if Option A)
- Remove `BatchStateMachine` service and its Layer
- Remove all `stateMachine.*` calls from `BatchOrchestrator`
- Remove `BatchStateMachineShape`, `BatchStateMachineLive` exports from index.ts

### Verification
- [ ] `bun run check --filter @beep/knowledge-server` passes
- [ ] Existing batch RPC contracts unchanged (API surface is the same)
- [ ] `cancelBatch` actually stops the actor
- [ ] `streamProgress` delivers real-time state updates

## Tier 3: Technical Details

### RPC Handler Files

| Handler | File | Current Service Deps |
|---------|------|---------------------|
| `batch_start` | `packages/knowledge/server/src/rpc/v1/batch/startBatch.ts` | `BatchStateMachine`, `BatchEventEmitter` |
| `batch_getStatus` | `packages/knowledge/server/src/rpc/v1/batch/getStatus.ts` | `BatchStateMachine` |
| `batch_cancel` | `packages/knowledge/server/src/rpc/v1/batch/cancelBatch.ts` | `BatchStateMachine`, `BatchEventEmitter` |
| `batch_streamProgress` | `packages/knowledge/server/src/rpc/v1/batch/streamProgress.ts` | `BatchStateMachine`, `BatchEventEmitter` |
| RPC registration | `packages/knowledge/server/src/rpc/v1/batch/_rpcs.ts` | N/A |

### BatchStateMachine Interface (to be replaced)
```typescript
interface BatchStateMachineShape {
  readonly create: (batchId) => Effect<BatchState>;
  readonly getState: (batchId) => Effect<BatchState, BatchNotFoundError>;
  readonly transition: (batchId, nextState) => Effect<BatchState, InvalidStateTransitionError | BatchNotFoundError>;
  readonly canTransition: (currentTag, nextTag) => boolean;
}
```

### Actor API (replacement)
```typescript
interface ActorRef<S, E> {
  readonly send: (event: E) => Effect<void>;
  readonly snapshot: Effect<S>;
  readonly stop: Effect<void>;
  readonly state: SubscriptionRef<S>;           // For streaming
  readonly awaitFinal: Effect<S>;               // Wait for terminal state
  readonly changes: Stream<S>;                  // State change stream
}
```

### cancelBatch Migration Example (Option A)
```typescript
export const Handler = Effect.fn("batch_cancel")(function* (payload) {
  const system = yield* ActorSystemService;
  const actor = yield* system.lookup(payload.batchId);  // or custom registry
  yield* actor.send(BatchMachineEvent.Cancel);
  const finalState = yield* actor.snapshot;
  return new Batch.CancelBatch.Success({
    batchId: payload.batchId,
    cancelled: true,
  });
}, Effect.withSpan("batch_cancel"));
```

### streamProgress Migration Example (Option A)
```typescript
export const Handler = Effect.fnUntraced(function* (payload) {
  const system = yield* ActorSystemService;
  const actor = yield* system.lookup(payload.batchId);
  // Map actor state changes to BatchEvent format for SSE
  return actor.changes.pipe(
    Stream.map(stateToProgressEvent)
  );
}, Stream.unwrap);
```

### Orchestrator Read-Model Removal (Option A)
All `stateMachine.*` calls in `BatchOrchestrator.ts` (create, transition) become no-ops since the actor IS the authoritative state. Lines to remove:
- L398: `yield* stateMachine.create(batchId)`
- L445-448: `yield* stateMachine.transition(batchId, BatchStateExtracting.make(...))`
- L163-168, L280-285: Progress `stateMachine.transition()` calls
- L481-483: Resolving phase `stateMachine.transition()`
- L506-511: Failed `stateMachine.transition()`
- L518-528: Completed `stateMachine.transition()`

### Key Risks
1. **Actor Lifecycle**: RPC handlers may arrive after the actor has stopped (batch completed). Need fallback — either keep completed state in a cache or return "batch completed" from persistence.
2. **Actor Discovery**: If using manual registry, need to handle cleanup when actors stop.
3. **Stream Mapping**: `actor.changes` emits `BatchMachineState` variants; `streamProgress` currently emits `BatchEvent` variants. Need a mapping function.
4. **startBatch Semantics**: Currently `startBatch` only creates a state entry — it doesn't trigger extraction. Need to decide if it should also kick off `BatchOrchestrator.run()` or if that remains a separate concern.

## Tier 4: Historical Context

### From Task 4
- `BatchOrchestrator` resolves `PersistenceAdapterTag` at Layer construction time
- Persistent actor created with `createPersistentActor(batchId, persistentMachine, O.none(), [])`
- `PersistenceError` caught and converted to defect via `Effect.catchTag("PersistenceError", (e) => Effect.die(e))`
- `InMemoryPersistenceAdapter` provides the adapter Layer

### Machine Events Available
```
BatchMachineEvent.StartExtraction    (no fields)
BatchMachineEvent.DocumentCompleted  { documentId, entityCount, relationCount }
BatchMachineEvent.DocumentFailed     { documentId, error }
BatchMachineEvent.ExtractionComplete { successCount, failureCount, totalEntityCount, totalRelationCount }
BatchMachineEvent.ResolutionComplete { mergeCount }
BatchMachineEvent.Cancel             (no fields)
BatchMachineEvent.Fail               { error }
BatchMachineEvent.Retry              (no fields)
```

### Machine States
```
Pending    { batchId, documentIds, config }
Extracting { batchId, documentIds, config, completedCount, failedCount, totalDocuments, entityCount, relationCount, progress }
Resolving  { batchId, config, totalDocuments, entityCount, relationCount, progress }
Completed  { batchId, totalDocuments, entityCount, relationCount }
Failed     { batchId, documentIds, config, failedCount, error }
Cancelled  { batchId, completedCount, totalDocuments }
```
