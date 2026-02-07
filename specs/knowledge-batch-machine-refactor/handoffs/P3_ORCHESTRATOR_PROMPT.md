# P3 Orchestrator Prompt: Server Implementation

## Session Type: Implementation
## Role: Orchestrator coordinating server-side changes
## Goal: Build the machine, implement effects, migrate orchestrator, add persistence

---

## Context from P2

Phase 2 created `BatchMachine.schema.ts` in `packages/knowledge/domain/src/value-objects/` with:
- `BatchMachineState` - 6 state variants (Pending, Extracting, Resolving, Completed, Failed, Cancelled)
- `BatchMachineEvent` - 9 command events
- `BatchMachineGuards` - 3 guard definitions (canRetry, isResolutionEnabled, hasDocuments)

These are pure domain schemas. Phase 3 builds the machine and implements the runtime in knowledge-server.

---

## Phase 3 Objectives

1. **Create `BatchMachine.ts`** with `Machine.make()` builder and all transitions
2. **Implement `Slot.Effects`** for event emission, document processing, entity resolution
3. **Migrate `BatchOrchestrator`** to use `ActorRef` for state management
4. **Configure persistence** with `InMemoryPersistenceAdapter`
5. **Update RPC handlers** to work with the new machine

---

## Implementation Plan

### Step 1: Define Effect Slots

```typescript
// In BatchMachine.ts
import { Slot } from "@beep/machine"
import * as S from "effect/Schema"

const BatchMachineEffects = Slot.Effects({
  emitBatchEvent: { event: BatchEvent },
  notifyProgress: { batchId: S.String, completedDocuments: S.Number, totalDocuments: S.Number },
})
```

### Step 2: Build Machine

```typescript
import { Machine } from "@beep/machine"
import { BatchMachineState, BatchMachineEvent, BatchMachineGuards } from "@beep/knowledge-domain"

export const makeBatchMachine = (batchId: string) =>
  Machine.make({
    state: BatchMachineState,
    event: BatchMachineEvent,
    initial: BatchMachineState.Pending({ batchId }),
    guards: BatchMachineGuards,
    effects: BatchMachineEffects,
  })
    // Pending -> Extracting
    .on(BatchMachineState.Pending, BatchMachineEvent.StartExtraction, ({ state, event, effects }) =>
      Effect.gen(function* () {
        yield* effects.emitBatchEvent({
          event: BatchEvent.BatchCreated({
            batchId: state.batchId,
            totalDocuments: event.totalDocuments,
            timestamp: yield* DateTime.now,
          })
        })
        return BatchMachineState.Extracting({
          batchId: state.batchId,
          completedDocuments: 0,
          totalDocuments: event.totalDocuments,
          progress: 0,
        })
      })
    )
    // Extracting + DocumentCompleted -> Extracting (reenter to update progress)
    .reenter(BatchMachineState.Extracting, BatchMachineEvent.DocumentCompleted, ({ state, event, effects }) =>
      Effect.gen(function* () {
        const completed = state.completedDocuments + 1
        yield* effects.emitBatchEvent({
          event: BatchEvent.DocumentCompleted({
            batchId: state.batchId,
            documentId: event.documentId,
            entityCount: event.entityCount,
            relationCount: event.relationCount,
            timestamp: yield* DateTime.now,
          })
        })
        return BatchMachineState.Extracting({
          ...state,
          completedDocuments: completed,
          progress: completed / state.totalDocuments,
        })
      })
    )
    // ... remaining transitions
    .final(BatchMachineState.Completed)
    .final(BatchMachineState.Cancelled)
    .build({
      canRetry: ({ maxRetries }, { state }) =>
        BatchMachineState.$is("Failed")(state),
      isResolutionEnabled: (_, { state }) => true, // configured externally
      emitBatchEvent: ({ event }, _ctx) =>
        Effect.gen(function* () {
          const emitter = yield* BatchEventEmitter
          yield* emitter.emit(event)
        }),
      notifyProgress: ({ batchId, completedDocuments, totalDocuments }, _ctx) =>
        Effect.logInfo("Batch progress").pipe(
          Effect.annotateLogs({ batchId, completedDocuments, totalDocuments })
        ),
    })
```

### Step 3: Migrate BatchOrchestrator

Replace the current orchestrator flow:

**Before** (simplified):
```typescript
yield* stateMachine.create(batchId)
yield* stateMachine.transition(batchId, BatchState.Extracting(...))
// ... manual document processing loop
yield* stateMachine.transition(batchId, BatchState.Completed(...))
```

**After**:
```typescript
const machine = makeBatchMachine(batchId)
const actor = yield* Machine.spawn(machine)
yield* actor.send(BatchMachineEvent.StartExtraction({ documentIds, totalDocuments }))
// Document processing happens via effects or external loop sending events
yield* actor.awaitFinal
const finalState = yield* actor.snapshot
```

### Step 4: Configure Persistence

```typescript
const persistentMachine = machine.persist({
  snapshotSchedule: Schedule.spaced("5 seconds"),
  journalEvents: true,
  machineType: "batch_extraction",
})
```

### Step 5: Update RPC Handlers

- `startBatch`: Spawn actor, send StartExtraction, return batchId
- `getBatchStatus`: Read actor snapshot
- `cancelBatch`: Send Cancel event
- `streamProgress`: Subscribe to actor.changes stream

---

## Critical Patterns

1. **Effect handlers have access to `self`** - can send events back (e.g., after async document processing completes)
2. **`.reenter()` for progress updates** - same Extracting state but with updated counts
3. **Guard implementations receive `({ params }, { state, event, self })` context**
4. **Actor spawning requires `Scope`** - ensure proper scoping in orchestrator
5. **`actor.awaitFinal`** blocks until a `.final()` state is reached
6. **`actor.changes`** is a Stream of state transitions for progress subscription

---

## Delegation Strategy

| Agent | Task | Type |
|-------|------|------|
| `effect-code-writer` | Create BatchMachine.ts with all transitions | Implementation |
| `effect-code-writer` | Migrate BatchOrchestrator.ts | Implementation |
| `effect-code-writer` | Update RPC handlers | Implementation |
| `package-error-fixer` | Fix type errors | Verification |
| Orchestrator | Coordinate, update handoff | Coordination |

---

## Verification

```bash
bun run check --filter @beep/knowledge-server
```

---

## Success Criteria

- [ ] `BatchMachine.ts` created with all transitions
- [ ] All 6 states and transition rules preserved
- [ ] Slot effects implemented (emitBatchEvent, notifyProgress)
- [ ] `BatchOrchestrator` uses `ActorRef` API
- [ ] RPC handlers adapted to new machine
- [ ] Persistence configured with `InMemoryPersistenceAdapter`
- [ ] `bun run check --filter @beep/knowledge-server` passes
- [ ] Old `BatchStateMachine.ts` removed or deprecated

---

## Next Phase
P4 adds comprehensive tests and verification.
