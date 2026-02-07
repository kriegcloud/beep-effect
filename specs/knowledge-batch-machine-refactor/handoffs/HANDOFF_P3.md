# Handoff: Phase 3 - Server Implementation

## Tier 1: Critical Context

### Phase Goal
Build the `@beep/machine` machine in knowledge-server. Implement slot effects. Migrate `BatchOrchestrator` to use `ActorRef`. Add persistence configuration.

### Immediate Next Steps
1. Create `BatchMachine.ts` in knowledge-server with `Machine.make()` builder
2. Implement `Slot.Effects` handlers for event emission, document processing, entity resolution
3. Migrate `BatchOrchestrator` to spawn actors and use `ActorRef.send()`
4. Configure `.persist()` with `InMemoryPersistenceAdapter`
5. Update RPC handlers to use new machine

### Blocking Issues
- P2 must be complete (State/Event/Guard schemas defined in domain)

### Open Questions
- Should `BatchOrchestrator` own the `ActorSystem`, or should it be a Layer dependency?
- How to handle the `BatchEventEmitter` PubSub alongside machine effects?

## Tier 2: Execution Checklist

### Task 1: Build Machine Definition
- [ ] Create `packages/knowledge/server/src/Workflow/BatchMachine.ts`
- [ ] Import State/Event/Guard schemas from `@beep/knowledge-domain`
- [ ] Define `Slot.Effects` for: `emitBatchEvent`, `processDocument`, `runEntityResolution`
- [ ] Chain `.on()` calls for all transitions (see transition map below)
- [ ] Mark `.final(Completed)` and `.final(Cancelled)`
- [ ] Use `.reenter()` for Extracting + DocumentCompleted -> Extracting
- [ ] Call `.build()` with guard and effect implementations

### Task 2: Implement Effect Slots
- [ ] `emitBatchEvent`: Delegate to `BatchEventEmitter.emit()`
- [ ] `processDocument`: Delegate to `ExtractionWorkflow.run()`
- [ ] `runEntityResolution`: Delegate to `IncrementalClusterer` (if available)

### Task 3: Migrate BatchOrchestrator
- [ ] Replace `BatchStateMachine` usage with `Machine.spawn()`
- [ ] Use `actor.send()` to drive transitions
- [ ] Use `actor.waitFor()` to await terminal states
- [ ] Use `actor.state` for progress tracking
- [ ] Simplify orchestrator to: spawn actor, send StartExtraction, await completion

### Task 4: Add Persistence
- [ ] Call `.persist()` on built machine
- [ ] Configure snapshot schedule and event journaling
- [ ] Provide `InMemoryPersistenceAdapter` in Layer

### Task 5: Update RPC Handlers
- [ ] `startBatch`: Spawn actor, send StartExtraction
- [ ] `getBatchStatus`: Read actor state via `actor.snapshot`
- [ ] `cancelBatch`: Send Cancel event to actor
- [ ] `streamProgress`: Subscribe to actor state changes

### Verification
- [ ] `bun run check --filter @beep/knowledge-server` passes
- [ ] Existing batch RPC contracts unchanged
- [ ] Failure policies preserved

## Tier 3: Technical Details

### Transition Map (State + Event -> Next State)
```
Pending    + StartExtraction      -> Extracting
Extracting + DocumentCompleted    -> Extracting (reenter, update progress)
Extracting + DocumentFailed       -> Extracting (reenter) or Failed (abort-all)
Extracting + AllDocumentsProcessed -> Resolving (if enabled) or Completed
Extracting + Cancel               -> Cancelled
Extracting + Fail                 -> Failed
Resolving  + ResolutionCompleted  -> Completed
Resolving  + Cancel               -> Cancelled
Resolving  + Fail                 -> Failed
Failed     + Retry                -> Pending (guarded by canRetry)
```

### Machine Builder Pattern
```typescript
const batchMachine = Machine.make({
  state: BatchMachineState,
  event: BatchMachineEvent,
  initial: BatchMachineState.Pending({ batchId: "..." }),
  guards: BatchMachineGuards,
  effects: BatchMachineEffects,
})
  .on(BatchMachineState.Pending, BatchMachineEvent.StartExtraction, handler)
  .reenter(BatchMachineState.Extracting, BatchMachineEvent.DocumentCompleted, handler)
  // ... all transitions
  .final(BatchMachineState.Completed)
  .final(BatchMachineState.Cancelled)
  .build({ /* guard/effect implementations */ })
```

### File Locations
- New: `packages/knowledge/server/src/Workflow/BatchMachine.ts`
- Modified: `packages/knowledge/server/src/Workflow/BatchOrchestrator.ts`
- Modified: `packages/knowledge/server/src/rpc/v1/batch/*.ts`
- Possibly removed: `packages/knowledge/server/src/Workflow/BatchStateMachine.ts`

## Tier 4: Historical Context

### From P2
- State/Event/Guard schemas defined in `knowledge-domain`
- Exported from `value-objects/index.ts`
- Types match current `BatchState` variants

### Key Patterns
- `Slot.Effects` handlers receive `(params, { state, event, self })` context
- `self.send()` allows effects to send events back to the actor
- `.reenter()` forces lifecycle re-run even on same state tag (needed for progress updates)
- `.final()` marks terminal states - actor stops automatically

## Context Budget

| Tier | Estimated Tokens | Budget |
|------|-----------------|--------|
| Working (Tier 1) | ~400 | 2,000 |
| Episodic (Tier 2) | ~700 | 1,000 |
| Semantic (Tier 3) | ~500 | 500 |
| Procedural (Tier 4) | ~200 | Links only |
| **Total** | **~1,800** | **4,000** |
