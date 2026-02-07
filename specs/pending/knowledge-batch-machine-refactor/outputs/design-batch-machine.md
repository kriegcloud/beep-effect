# Design: Batch State Machine with @beep/machine

## Overview

This document defines the complete design for refactoring the knowledge slice's `BatchStateMachine` from a hand-rolled `Ref<HashMap>` implementation to a proper `@beep/machine`-based state machine with type-safe schemas, guards, effects, persistence, and testing.

---

## 1. State Schema

Defined in `packages/knowledge/domain/src/value-objects/BatchMachine.schema.ts`.

Uses `Machine.State()` to create branded, schema-validated state variants. Each variant carries the context data needed for that phase of processing.

```typescript
import { State, Event, Slot } from "@beep/machine";
import * as S from "effect/Schema";
import { KnowledgeEntityIds } from "@beep/knowledge-domain";
import { DocumentsEntityIds } from "@beep/shared-domain";
import { BatchConfig } from "./BatchConfig.value.ts";

export const BatchMachineState = State({
  Pending: {
    batchId: KnowledgeEntityIds.BatchExecutionId,
    documentIds: S.Array(S.String),
    config: BatchConfig,
  },
  Extracting: {
    batchId: KnowledgeEntityIds.BatchExecutionId,
    documentIds: S.Array(S.String),
    config: BatchConfig,
    completedCount: S.NonNegativeInt,
    failedCount: S.NonNegativeInt,
    totalDocuments: S.NonNegativeInt,
    entityCount: S.NonNegativeInt,
    relationCount: S.NonNegativeInt,
    progress: S.Number,
  },
  Resolving: {
    batchId: KnowledgeEntityIds.BatchExecutionId,
    config: BatchConfig,
    totalDocuments: S.NonNegativeInt,
    entityCount: S.NonNegativeInt,
    relationCount: S.NonNegativeInt,
    progress: S.Number,
  },
  Completed: {
    batchId: KnowledgeEntityIds.BatchExecutionId,
    totalDocuments: S.NonNegativeInt,
    entityCount: S.NonNegativeInt,
    relationCount: S.NonNegativeInt,
  },
  Failed: {
    batchId: KnowledgeEntityIds.BatchExecutionId,
    failedCount: S.NonNegativeInt,
    error: S.String,
  },
  Cancelled: {
    batchId: KnowledgeEntityIds.BatchExecutionId,
    completedCount: S.NonNegativeInt,
    totalDocuments: S.NonNegativeInt,
  },
});

export type BatchMachineState = typeof BatchMachineState.Type;
```

### State Context Design Decisions

| Field | States Present In | Rationale |
|-------|-------------------|-----------|
| `batchId` | All | Primary identifier, always available |
| `documentIds` | Pending, Extracting | Needed for processing; dropped after extraction completes |
| `config` | Pending, Extracting, Resolving | Drives failurePolicy, concurrency, resolution toggle |
| `completedCount` / `failedCount` | Extracting, Cancelled, Failed | Tracks document-level progress |
| `totalDocuments` | Extracting, Completed, Cancelled | For progress calculation and final reporting |
| `entityCount` / `relationCount` | Extracting, Resolving, Completed | Aggregated extraction results |
| `progress` | Extracting, Resolving | 0.0-1.0 float for UI progress bars |

### Cross-State Derivation

`State()` provides `.derive()` for constructing a variant from an existing state, picking only the fields that belong to the target:

```typescript
// Extracting -> Resolving: derive picks shared fields, drops Extracting-only fields
BatchMachineState.Resolving.derive(extractingState, { progress: 0 })

// Extracting -> Completed: derive picks shared fields
BatchMachineState.Completed.derive(extractingState)

// Extracting -> Cancelled: derive picks shared fields
BatchMachineState.Cancelled.derive(extractingState)
```

---

## 2. Event Schema (Commands)

Machine events are **commands** that drive transitions. Domain events (`BatchEvent.*`) are **side effects** emitted via `Slot.Effects`.

```typescript
export const BatchMachineEvent = Event({
  // --- Extraction Phase ---
  StartExtraction: {},
  // No payload; documentIds and config already in Pending state context.

  DocumentCompleted: {
    documentId: S.String,
    entityCount: S.NonNegativeInt,
    relationCount: S.NonNegativeInt,
  },

  DocumentFailed: {
    documentId: S.String,
    error: S.String,
  },

  ExtractionComplete: {
    successCount: S.NonNegativeInt,
    failureCount: S.NonNegativeInt,
    totalEntityCount: S.NonNegativeInt,
    totalRelationCount: S.NonNegativeInt,
  },

  // --- Resolution Phase ---
  ResolutionComplete: {
    mergeCount: S.NonNegativeInt,
  },

  // --- Lifecycle ---
  Cancel: {},
  Retry: {},
  Fail: { error: S.String },
});

export type BatchMachineEvent = typeof BatchMachineEvent.Type;
```

### Machine Events vs Domain Events Mapping

| Machine Event (Command) | Domain Event(s) Emitted as Side Effect |
|--------------------------|----------------------------------------|
| `StartExtraction` | `BatchEvent.BatchCreated` (on spawn) |
| `DocumentCompleted` | `BatchEvent.DocumentCompleted` |
| `DocumentFailed` | `BatchEvent.DocumentFailed` |
| `ExtractionComplete` -> Resolving | `BatchEvent.ResolutionStarted` |
| `ExtractionComplete` -> Failed | `BatchEvent.BatchFailed` |
| `ExtractionComplete` -> Completed | `BatchEvent.BatchCompleted` |
| `ResolutionComplete` | `BatchEvent.ResolutionCompleted`, `BatchEvent.BatchCompleted` |
| `Cancel` | `BatchEvent.BatchFailed` (with "cancelled" message) |
| `Retry` | _(no domain event)_ |
| `Fail` | `BatchEvent.BatchFailed` |

**Not machine events** (emitted independently):
- `BatchEvent.DocumentStarted` -- emitted by the extraction spawn effect before each document
- `BatchEvent.StageProgress` -- emitted by ExtractionPipeline via ProgressStream

---

## 3. Transition Table

| From State | Event | To State | Handler Notes |
|------------|-------|----------|---------------|
| **Pending** | `StartExtraction` | Extracting | Initialize counters to 0, progress to 0 |
| **Pending** | `Cancel` | Cancelled | Zero counts |
| **Pending** | `Fail` | Failed | error from event |
| **Extracting** | `DocumentCompleted` | Extracting | Increment completedCount, entityCount, relationCount; update progress. **Same-state via `.on()` (not `.reenter()`)** -- spawn effect keeps running |
| **Extracting** | `DocumentFailed` | Extracting | Increment failedCount; update progress. **Same-state via `.on()`** |
| **Extracting** | `ExtractionComplete` | Resolving | **Guard**: `isResolutionEnabled` + successCount > 0. Derive Resolving from Extracting |
| **Extracting** | `ExtractionComplete` | Completed | successCount > 0 but resolution disabled. Derive Completed |
| **Extracting** | `ExtractionComplete` | Failed | successCount === 0. All documents failed |
| **Extracting** | `Cancel` | Cancelled | Derive from current Extracting state |
| **Extracting** | `Fail` | Failed | Derive from current state + error |
| **Resolving** | `ResolutionComplete` | Completed | Derive Completed from Resolving |
| **Resolving** | `Cancel` | Cancelled | Zero out counts appropriately |
| **Resolving** | `Fail` | Failed | error from event |
| **Failed** | `Retry` | Pending | **Guard**: `canRetry`. Reconstruct Pending from Failed context (requires stored documentIds/config -- see note below) |
| **Completed** | _(none)_ | _(terminal)_ | `.final()` |
| **Cancelled** | _(none)_ | _(terminal)_ | `.final()` |

### Critical Design Note: Retry Path

The `Failed -> Pending` retry path needs `documentIds` and `config` to reconstruct the Pending state. Two options:

**(A) Carry documentIds/config in Failed state** -- adds fields to Failed that are only needed for retry.

**(B) Store original params externally** -- the ActorSystem caller retains the original params and re-spawns with them.

**Decision**: Option (A). Add `documentIds` and `config` to Failed state. This keeps the machine self-contained and retry logic within the machine boundary. The fields are small and the trade-off for self-containment is worth it.

Updated Failed state:
```typescript
Failed: {
  batchId: KnowledgeEntityIds.BatchExecutionId,
  documentIds: S.Array(S.String),
  config: BatchConfig,
  failedCount: S.NonNegativeInt,
  error: S.String,
},
```

---

## 4. Guard Definitions

```typescript
export const BatchMachineGuards = Slot.Guards({
  canRetry: { maxRetries: S.Number },
  isResolutionEnabled: {},
});
```

### Guard Implementation

| Guard | Parameters | Logic | Used In |
|-------|-----------|-------|---------|
| `canRetry` | `{ maxRetries }` | Check retry count against limit. For V1: always return `true` (retry count tracking is deferred). | `Failed + Retry -> Pending` |
| `isResolutionEnabled` | `{}` (void) | Check `state.config.enableEntityResolution`. The IncrementalClusterer availability is checked in the effect, not the guard. | `Extracting + ExtractionComplete -> Resolving` |

### Guard Handler Implementations (at `.build()`)

```typescript
{
  canRetry: ({ maxRetries }, { state }) => true,
  // V2: track retryCount in Failed state and compare

  isResolutionEnabled: (_, { state }) => {
    // state is narrowed to Extracting when this guard runs
    return state.config.enableEntityResolution;
  },
}
```

---

## 5. Effect Definitions

```typescript
export const BatchMachineEffects = Slot.Effects({
  emitBatchEvent: { event: BatchEvent },
  processDocuments: {
    documentIds: S.Array(S.String),
    config: BatchConfig,
  },
  runResolution: {
    batchId: KnowledgeEntityIds.BatchExecutionId,
  },
  persistState: {
    batchId: KnowledgeEntityIds.BatchExecutionId,
    status: S.String,
  },
});
```

### Effect Handler Implementations (at `.build()`)

| Effect | Receives | Does | Sends Events Back |
|--------|----------|------|-------------------|
| `emitBatchEvent` | `{ event: BatchEvent }` | Publishes to `BatchEventEmitter.emit()` | No |
| `processDocuments` | `{ documentIds, config }` | Runs `ExtractionWorkflow.run()` per document, respecting failurePolicy and concurrency | Yes: `DocumentCompleted`, `DocumentFailed`, `ExtractionComplete` |
| `runResolution` | `{ batchId }` | Runs `IncrementalClusterer` if available | Yes: `ResolutionComplete` or `Fail` |
| `persistState` | `{ batchId, status }` | Writes to `WorkflowPersistence` | No |

### Handler Signatures

```typescript
{
  emitBatchEvent: ({ event }, { self }) =>
    Effect.gen(function* () {
      const emitter = yield* BatchEventEmitter;
      yield* emitter.emit(event).pipe(
        Effect.catchAllCause(() => Effect.void)  // non-fatal
      );
    }),

  processDocuments: ({ documentIds, config }, { self }) =>
    Effect.gen(function* () {
      const workflow = yield* ExtractionWorkflow;
      // ... process documents based on config.failurePolicy
      // For each document result, send event back:
      //   yield* self.send(BatchMachineEvent.DocumentCompleted({ ... }))
      //   yield* self.send(BatchMachineEvent.DocumentFailed({ ... }))
      // When all done:
      //   yield* self.send(BatchMachineEvent.ExtractionComplete({ ... }))
    }),

  runResolution: ({ batchId }, { self }) =>
    Effect.gen(function* () {
      const maybeClusterer = yield* Effect.serviceOption(IncrementalClusterer);
      // ... run resolution
      yield* self.send(BatchMachineEvent.ResolutionComplete({ mergeCount }));
    }),

  persistState: ({ batchId, status }) =>
    Effect.gen(function* () {
      const persistence = yield* WorkflowPersistence;
      // ... update execution status
    }).pipe(Effect.catchAllCause(() => Effect.void)),  // non-fatal
}
```

---

## 5b. Event Persistence via @effect/experimental

### BatchEventGroup Definition

Replace the current `BatchEvent` `S.Union(...)` + `BatchEventEmitter` (PubSub) with `@effect/experimental` `EventGroup`:

```typescript
import { EventGroup } from "@effect/experimental"
import * as S from "effect/Schema"
import { KnowledgeEntityIds } from "@beep/knowledge-domain"

export const BatchEventGroup = EventGroup.empty.pipe(
  EventGroup.add({
    tag: "BatchCreated",
    primaryKey: KnowledgeEntityIds.BatchExecutionId,
    payload: S.Struct({
      totalDocuments: S.NonNegativeInt,
    }),
  }),
  EventGroup.add({
    tag: "DocumentStarted",
    primaryKey: KnowledgeEntityIds.BatchExecutionId,
    payload: S.Struct({
      documentId: S.String,
    }),
  }),
  EventGroup.add({
    tag: "DocumentCompleted",
    primaryKey: KnowledgeEntityIds.BatchExecutionId,
    payload: S.Struct({
      documentId: S.String,
      entityCount: S.NonNegativeInt,
      relationCount: S.NonNegativeInt,
    }),
  }),
  EventGroup.add({
    tag: "DocumentFailed",
    primaryKey: KnowledgeEntityIds.BatchExecutionId,
    payload: S.Struct({
      documentId: S.String,
      error: S.String,
    }),
  }),
  EventGroup.add({
    tag: "StageProgress",
    primaryKey: KnowledgeEntityIds.BatchExecutionId,
    payload: S.Struct({
      completedDocuments: S.NonNegativeInt,
      totalDocuments: S.NonNegativeInt,
      progress: S.Number,
    }),
  }),
  EventGroup.add({
    tag: "ResolutionStarted",
    primaryKey: KnowledgeEntityIds.BatchExecutionId,
    payload: S.Struct({}),
  }),
  EventGroup.add({
    tag: "ResolutionCompleted",
    primaryKey: KnowledgeEntityIds.BatchExecutionId,
    payload: S.Struct({
      mergeCount: S.NonNegativeInt,
    }),
  }),
  EventGroup.add({
    tag: "BatchCompleted",
    primaryKey: KnowledgeEntityIds.BatchExecutionId,
    payload: S.Struct({
      totalDocuments: S.NonNegativeInt,
      entityCount: S.NonNegativeInt,
      relationCount: S.NonNegativeInt,
    }),
  }),
  EventGroup.add({
    tag: "BatchFailed",
    primaryKey: KnowledgeEntityIds.BatchExecutionId,
    payload: S.Struct({
      error: S.String,
      failedDocuments: S.NonNegativeInt,
    }),
  }),
)
```

### BatchEventLog Schema & Handlers

Use `EventLog.schema()` to define the log and `EventLog.group()` for compile-time exhaustive handler registration:

```typescript
import { EventLog, EventJournal } from "@effect/experimental"

export const BatchEventLogSchema = EventLog.schema(BatchEventGroup)

export const BatchEventHandlers = EventLog.group(BatchEventGroup).pipe(
  EventLog.handle("BatchCreated", (event, primaryKey) =>
    Effect.logInfo("Batch created").pipe(
      Effect.annotateLogs({ batchId: primaryKey })
    )
  ),
  EventLog.handle("DocumentCompleted", (event, primaryKey) =>
    Effect.gen(function* () {
      const persistence = yield* WorkflowPersistence
      yield* persistence.recordDocumentCompletion(primaryKey, event.documentId, {
        entityCount: event.entityCount,
        relationCount: event.relationCount,
      })
    })
  ),
  EventLog.handle("BatchCompleted", (event, primaryKey) =>
    Effect.gen(function* () {
      const persistence = yield* WorkflowPersistence
      yield* persistence.updateExecutionStatus(primaryKey, "completed")
    })
  ),
  EventLog.handle("BatchFailed", (event, primaryKey) =>
    Effect.gen(function* () {
      const persistence = yield* WorkflowPersistence
      yield* persistence.updateExecutionStatus(primaryKey, "failed")
    })
  ),
  // ... remaining handlers for DocumentStarted, DocumentFailed,
  //     StageProgress, ResolutionStarted, ResolutionCompleted
)
```

### EventLog Client

`EventLog.makeClient()` provides a typed emitter that replaces `BatchEventEmitter`:

```typescript
export const makeBatchEventClient = EventLog.makeClient(BatchEventLogSchema)

// Usage in machine effects:
const client = yield* makeBatchEventClient
yield* client.emit("DocumentCompleted", batchId, {
  documentId, entityCount, relationCount,
})
```

### StageProgress Compaction

Use `EventLog.groupCompaction()` to consolidate high-frequency progress events:

```typescript
const compactedHandlers = BatchEventHandlers.pipe(
  EventLog.groupCompaction("StageProgress", (events) =>
    // Keep only the latest progress event per primaryKey
    A.lastNonEmpty(events)
  )
)
```

### Migration Path

| Current Pattern | Replacement |
|----------------|-------------|
| `S.Union(BatchEvent.BatchCreated, ...)` | `BatchEventGroup` (EventGroup builder) |
| `BatchEventEmitter` (PubSub, ephemeral) | `EventLog.makeClient()` (persisted via EventJournal) |
| `BatchEventEmitter.emit(event)` | `client.emit(tag, primaryKey, payload)` |
| `WorkflowPersistence` (manual SQL CRUD) | EventLog handlers project state to SQL (materialized view) |
| No replay capability | `EventJournal` entries enable full replay |

---

## 6. Machine Builder

Located in `packages/knowledge/server/src/Workflow/BatchMachine.ts`:

```typescript
import { Machine, State, Event, Slot } from "@beep/machine";
import { BatchMachineState, BatchMachineEvent, BatchMachineGuards, BatchMachineEffects } from "@beep/knowledge-domain";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";

const S = BatchMachineState;
const E = BatchMachineEvent;

export const BatchMachine = Machine.make({
  state: S,
  event: E,
  guards: BatchMachineGuards,
  effects: BatchMachineEffects,
  initial: S.Pending,  // Note: actual initial state is constructed with params at spawn time
})
  // === Pending Transitions ===
  .on(S.Pending, E.StartExtraction, ({ state }) =>
    S.Extracting({
      batchId: state.batchId,
      documentIds: state.documentIds,
      config: state.config,
      completedCount: 0 as S.NonNegativeInt,
      failedCount: 0 as S.NonNegativeInt,
      totalDocuments: state.documentIds.length as S.NonNegativeInt,
      entityCount: 0 as S.NonNegativeInt,
      relationCount: 0 as S.NonNegativeInt,
      progress: 0,
    })
  )
  .on(S.Pending, E.Cancel, ({ state }) =>
    S.Cancelled({ batchId: state.batchId, completedCount: 0, totalDocuments: 0 })
  )
  .on(S.Pending, E.Fail, ({ state, event }) =>
    S.Failed({
      batchId: state.batchId,
      documentIds: state.documentIds,
      config: state.config,
      failedCount: 0,
      error: event.error,
    })
  )

  // === Extracting Transitions ===
  // Same-state transitions: .on() (NOT .reenter()) so spawn effect keeps running
  .on(S.Extracting, E.DocumentCompleted, ({ state, event, effects }) =>
    Effect.gen(function* () {
      const newCompleted = (state.completedCount + 1) as S.NonNegativeInt;
      const total = state.completedCount + state.failedCount + 1;
      yield* effects.emitBatchEvent({
        event: BatchEvent.DocumentCompleted({
          batchId: state.batchId,
          documentId: event.documentId,
          entityCount: event.entityCount,
          relationCount: event.relationCount,
          timestamp: DateTime.unsafeNow(),
        }),
      });
      return S.Extracting.derive(state, {
        completedCount: newCompleted,
        entityCount: (state.entityCount + event.entityCount) as S.NonNegativeInt,
        relationCount: (state.relationCount + event.relationCount) as S.NonNegativeInt,
        progress: total / state.totalDocuments,
      });
    })
  )
  .on(S.Extracting, E.DocumentFailed, ({ state, event, effects }) =>
    Effect.gen(function* () {
      const newFailed = (state.failedCount + 1) as S.NonNegativeInt;
      const total = state.completedCount + state.failedCount + 1;
      yield* effects.emitBatchEvent({
        event: BatchEvent.DocumentFailed({
          batchId: state.batchId,
          documentId: event.documentId,
          error: event.error,
          timestamp: DateTime.unsafeNow(),
        }),
      });
      return S.Extracting.derive(state, {
        failedCount: newFailed,
        progress: total / state.totalDocuments,
      });
    })
  )

  // ExtractionComplete: branch to Resolving, Completed, or Failed
  .on(S.Extracting, E.ExtractionComplete, ({ state, event, guards, effects }) =>
    Effect.gen(function* () {
      // All failed -> Failed
      if (event.successCount === 0) {
        yield* effects.emitBatchEvent({
          event: BatchEvent.BatchFailed({
            batchId: state.batchId,
            error: "All documents failed",
            failedDocuments: event.failureCount,
            timestamp: DateTime.unsafeNow(),
          }),
        });
        return S.Failed({
          batchId: state.batchId,
          documentIds: state.documentIds,
          config: state.config,
          failedCount: event.failureCount,
          error: "All documents failed",
        });
      }

      // Resolution enabled -> Resolving
      if (yield* guards.isResolutionEnabled()) {
        yield* effects.emitBatchEvent({
          event: BatchEvent.ResolutionStarted({
            batchId: state.batchId,
            timestamp: DateTime.unsafeNow(),
          }),
        });
        return S.Resolving({
          batchId: state.batchId,
          config: state.config,
          totalDocuments: state.totalDocuments,
          entityCount: event.totalEntityCount,
          relationCount: event.totalRelationCount,
          progress: 0,
        });
      }

      // Resolution disabled -> Completed
      yield* effects.emitBatchEvent({
        event: BatchEvent.BatchCompleted({
          batchId: state.batchId,
          totalDocuments: state.totalDocuments,
          entityCount: event.totalEntityCount,
          relationCount: event.totalRelationCount,
          timestamp: DateTime.unsafeNow(),
        }),
      });
      return S.Completed({
        batchId: state.batchId,
        totalDocuments: state.totalDocuments,
        entityCount: event.totalEntityCount,
        relationCount: event.totalRelationCount,
      });
    })
  )

  // Cancel / Fail from Extracting
  .on(S.Extracting, E.Cancel, ({ state, effects }) =>
    Effect.gen(function* () {
      yield* effects.emitBatchEvent({
        event: BatchEvent.BatchFailed({
          batchId: state.batchId,
          error: "Batch cancelled by user",
          failedDocuments: state.failedCount,
          timestamp: DateTime.unsafeNow(),
        }),
      });
      return S.Cancelled.derive(state);
    })
  )
  .on(S.Extracting, E.Fail, ({ state, event, effects }) =>
    Effect.gen(function* () {
      yield* effects.emitBatchEvent({
        event: BatchEvent.BatchFailed({
          batchId: state.batchId,
          error: event.error,
          failedDocuments: state.failedCount,
          timestamp: DateTime.unsafeNow(),
        }),
      });
      return S.Failed({
        batchId: state.batchId,
        documentIds: state.documentIds,
        config: state.config,
        failedCount: state.failedCount,
        error: event.error,
      });
    })
  )

  // === Resolving Transitions ===
  .on(S.Resolving, E.ResolutionComplete, ({ state, event, effects }) =>
    Effect.gen(function* () {
      yield* effects.emitBatchEvent({
        event: BatchEvent.ResolutionCompleted({
          batchId: state.batchId,
          mergeCount: event.mergeCount,
          timestamp: DateTime.unsafeNow(),
        }),
      });
      yield* effects.emitBatchEvent({
        event: BatchEvent.BatchCompleted({
          batchId: state.batchId,
          totalDocuments: state.totalDocuments,
          entityCount: state.entityCount,
          relationCount: state.relationCount,
          timestamp: DateTime.unsafeNow(),
        }),
      });
      return S.Completed.derive(state);
    })
  )
  .on(S.Resolving, E.Cancel, ({ state, effects }) =>
    Effect.gen(function* () {
      yield* effects.emitBatchEvent({
        event: BatchEvent.BatchFailed({
          batchId: state.batchId,
          error: "Batch cancelled during resolution",
          failedDocuments: 0,
          timestamp: DateTime.unsafeNow(),
        }),
      });
      return S.Cancelled({
        batchId: state.batchId,
        completedCount: state.totalDocuments,
        totalDocuments: state.totalDocuments,
      });
    })
  )
  .on(S.Resolving, E.Fail, ({ state, event, effects }) =>
    Effect.gen(function* () {
      yield* effects.emitBatchEvent({
        event: BatchEvent.BatchFailed({
          batchId: state.batchId,
          error: event.error,
          failedDocuments: 0,
          timestamp: DateTime.unsafeNow(),
        }),
      });
      return S.Failed({
        batchId: state.batchId,
        documentIds: [],
        config: state.config,
        failedCount: 0,
        error: event.error,
      });
    })
  )

  // === Failed -> Retry ===
  .on(S.Failed, E.Retry, ({ state, guards }) =>
    Effect.gen(function* () {
      if (!(yield* guards.canRetry({ maxRetries: state.config.maxRetries }))) {
        return state;  // Stay in Failed if retry not allowed
      }
      return S.Pending({
        batchId: state.batchId,
        documentIds: state.documentIds,
        config: state.config,
      });
    })
  )

  // === Terminal States ===
  .final(S.Completed)
  .final(S.Cancelled)

  // === Spawn Effects (State-Scoped) ===

  // When entering Extracting: start processing documents
  .spawn(S.Extracting, ({ state, effects }) =>
    effects.processDocuments({
      documentIds: state.documentIds,
      config: state.config,
    })
  )

  // When entering Resolving: start entity resolution
  .spawn(S.Resolving, ({ state, effects }) =>
    effects.runResolution({ batchId: state.batchId })
  );
```

### Build with Slot Implementations

```typescript
export const buildBatchMachine = Effect.gen(function* () {
  const emitter = yield* BatchEventEmitter;
  const workflow = yield* ExtractionWorkflow;
  const persistence = yield* WorkflowPersistence;
  const maybeClusterer = yield* Effect.serviceOption(IncrementalClusterer);

  return BatchMachine.build({
    // Guards
    canRetry: ({ maxRetries }, _ctx) => true,  // V2: track retryCount
    isResolutionEnabled: (_, { state }) => state.config.enableEntityResolution,

    // Effects
    emitBatchEvent: ({ event }) =>
      emitter.emit(event).pipe(Effect.catchAllCause(() => Effect.void)),

    processDocuments: ({ documentIds, config }, { self }) =>
      Effect.gen(function* () {
        // Implementation delegates to ExtractionWorkflow per document,
        // respecting config.failurePolicy and config.concurrency.
        // Sends DocumentCompleted/DocumentFailed per document.
        // Sends ExtractionComplete when all done.
        // See Section 10 for full implementation.
      }),

    runResolution: ({ batchId }, { self }) =>
      Effect.gen(function* () {
        // Runs IncrementalClusterer if available.
        // Sends ResolutionComplete when done.
        // Sends Fail on error.
      }),

    persistState: ({ batchId, status }) =>
      persistence.updateExecutionStatus(batchId, status).pipe(
        Effect.catchAllCause(() => Effect.void)
      ),
  });
});
```

---

## 7. Persistence Strategy

### Dual Persistence Architecture

The batch machine uses two complementary persistence mechanisms:

1. **Machine PersistenceAdapter** (`@beep/machine`): Snapshots + event journal for actor crash recovery
2. **EventJournal** (`@effect/experimental`): Domain event persistence for replay, audit, and materialized views

### Phase 1: In-Memory (this spec)

```typescript
import { EventJournal } from "@effect/experimental"

// Machine-level persistence (actor snapshots + command events)
const persistentBatchMachine = BatchMachine.persist({
  snapshotSchedule: Schedule.forever,  // Snapshot on every transition
  journalEvents: true,                  // Journal all events for replay
  machineType: "batch-extraction",      // For restoreAll filtering
});

// Domain-level event persistence (EventLog + EventJournal)
const EventJournalLive = EventJournal.layerMemory  // In-memory for Phase 1
```

**Why snapshot on every transition**: Batch state changes are infrequent (per-document, not per-second). The overhead is minimal and provides instant recovery.

**Why journal events**: Enables replaying the exact sequence of events for debugging and audit.

**Why separate EventJournal**: Domain events (BatchCreated, DocumentCompleted, etc.) have different consumers than machine commands (StartExtraction, Cancel). EventJournal persists domain events for handler replay and materialized view projection. Machine event journal persists commands for actor state recovery.

### Phase 2: PostgreSQL EventJournal Adapter (follow-up)

Future work: implement a PostgreSQL-backed `EventJournal` adapter:

The `EventJournal` interface requires 6 methods:
- `entries(options)` — read entries with optional filtering
- `write(entries)` — persist new entries
- `writeFromRemote(entries)` — persist entries from remote nodes (no-op for single-node)
- `withRemoteUncommited(entries)` — merge remote uncommitted entries (no-op for single-node)
- `nextRemoteSequence()` — next sequence for remote sync (no-op for single-node)
- `changes` — Stream of new entries for reactive consumers
- `destroy` — cleanup

For single-node deployment, the 3 remote-related methods can be no-ops. Core work is `entries`, `write`, `changes`, and `destroy` backed by a PostgreSQL table with UUIDv7 ordered entries.

Also implement a SQL-backed machine `PersistenceAdapter`:
- `machine_snapshot` — latest state per actorId
- `machine_event_journal` — ordered commands per actorId

### Actor Lifecycle with ActorSystem

```typescript
const system = yield* ActorSystemService;

// Spawn new batch:
const actor = yield* system.spawn(
  `batch-${batchId}`,
  persistentBatchMachine
);

// Restore after crash:
const maybeActor = yield* system.restore(
  `batch-${batchId}`,
  persistentBatchMachine
);

// List all active batches:
const allBatches = yield* system.restoreAll(persistentBatchMachine);
```

### Layer Composition

```typescript
import { EventJournal } from "@effect/experimental"

export const BatchWorkflowLive = Layer.mergeAll(
  ActorSystemDefault,
  InMemoryPersistenceAdapter,
  EventJournal.layerMemory,           // Phase 1: in-memory
  // EventJournalPostgres.layer,      // Phase 2: PostgreSQL (follow-up)
  // ... existing service layers
);
```

---

## 8. State Diagram

```
                    +-----------+
                    |  Pending  |
                    +-----+-----+
                          |
                  StartExtraction
                          |
                          v
                   +------+------+
           +------>| Extracting  |<------+
           |       +------+------+       |
           |              |              |
    DocumentCompleted  ExtractionComplete  DocumentFailed
    (same state)          |              (same state)
                          |
              +-----------+-----------+
              |           |           |
         resolution    no resolution  all failed
         enabled       disabled       |
              |           |           v
              v           v      +----+----+
        +-----+----+  +--+---+  | Failed  |
        | Resolving |  |Compl.|  +----+----+
        +-----+-----+ +------+       |
              |           ^         Retry
     ResolutionComplete   |           |
              |           |           v
              +-----------+      (back to Pending)

              Cancel (from any non-terminal)
                    |
                    v
              +-----------+
              | Cancelled |
              +-----------+
```

---

## 9. Migration Plan

### Phase 2 (Domain): Create Schema Definitions

**New files:**
1. `packages/knowledge/domain/src/value-objects/BatchMachine.schema.ts`
   - `BatchMachineState` -- State() definition
   - `BatchMachineEvent` -- Event() definition
   - `BatchMachineGuards` -- Slot.Guards() definition
   - `BatchMachineEffects` -- Slot.Effects() definition

**Modified files:**
2. `packages/knowledge/domain/src/value-objects/index.ts`
   - Re-export `BatchMachine.schema.ts` types

**Preserved files (no changes):**
- `BatchState.value.ts` -- keep existing state types for backward compatibility
- `BatchEvent.value.ts` -- keep domain events for emission
- `BatchConfig.value.ts` -- consumed by machine state
- `Batch.errors.ts` -- keep existing error types

### Phase 3 (Server): Build Machine + Migrate Orchestrator

**New files:**
1. `packages/knowledge/server/src/Workflow/BatchMachine.ts`
   - Machine builder with all transitions, spawn effects
   - `buildBatchMachine` -- Effect that resolves services and calls `.build()`
   - Persistent machine configuration

**Modified files:**
2. `packages/knowledge/server/src/Workflow/BatchOrchestrator.ts`
   - Replace `BatchStateMachine` usage with `ActorSystemService.spawn()`
   - `run()` simplified: spawn actor -> send `StartExtraction` -> `actor.awaitFinal`
   - Cancel: `actor.send(Cancel)`
   - Status: `actor.snapshot`
   - Progress: `actor.changes` stream

3. `packages/knowledge/server/src/rpc/v1/batch/startBatch.ts`
   - Spawn actor via `ActorSystemService`
   - Send `StartExtraction` event
   - Return batchId

4. `packages/knowledge/server/src/rpc/v1/batch/cancelBatch.ts`
   - Send `Cancel` event to actor
   - Actor handles transition + event emission

5. `packages/knowledge/server/src/rpc/v1/batch/getStatus.ts`
   - Use `actor.snapshot` instead of `stateMachine.getState()`

6. `packages/knowledge/server/src/rpc/v1/batch/streamProgress.ts`
   - Use `actor.changes` stream instead of PubSub subscription

**Deprecated files (remove after migration):**
7. `packages/knowledge/server/src/Workflow/BatchStateMachine.ts`
   - Replaced by `BatchMachine.ts`

### Phase 4 (Testing)

**New test files:**
1. `packages/knowledge/server/test/Workflow/BatchMachine.test.ts`
   - Pure transition tests via `simulate()`
   - Path assertions via `assertPath()`
   - Guard tests
   - Never-reaches assertions for invalid transitions

2. `packages/knowledge/server/test/Workflow/BatchMachine.integration.test.ts`
   - Actor lifecycle tests via `createTestHarness()`
   - Spawn effect verification
   - Persistence restore tests

---

## 10. Backward Compatibility

### RPC Contract: No Changes

The RPC contract stays identical:

| RPC | Current Behavior | New Behavior |
|-----|------------------|--------------|
| `batch_start` | Creates state in HashMap | Spawns actor in ActorSystem |
| `batch_cancel` | Updates HashMap entry | Sends `Cancel` to actor |
| `batch_getStatus` | Reads HashMap entry | Reads `actor.snapshot` |
| `batch_streamProgress` | PubSub subscription | `actor.changes` stream + PubSub |

### Response Shapes: Compatible

The `BatchState` union type from `BatchState.value.ts` is preserved. Machine states are mapped back to domain `BatchState` types in the RPC layer if needed:

```typescript
const toDomainState = BatchMachineState.$match({
  Pending: (s) => DomainBatchState.Pending({ batchId: s.batchId }),
  Extracting: (s) => DomainBatchState.Extracting({
    batchId: s.batchId,
    completedDocuments: s.completedCount,
    totalDocuments: s.totalDocuments,
    progress: s.progress,
  }),
  // ... etc
});
```

### Key Behavioral Improvements

| Issue | Current | After Refactor |
|-------|---------|----------------|
| **Crash recovery** | Lost on restart | Restored from persistence |
| **Cancellation** | Cosmetic (doesn't stop processing) | Real (interrupts spawn effect fiber) |
| **batch_start disconnect** | Creates state but doesn't trigger processing | Actor spawn effect starts processing automatically |
| **Entity resolution** | Placeholder | Same placeholder, but cleanly expressed as spawn effect |
| **Error handling** | Errors swallowed everywhere | Errors swallowed in effects (explicit), transitions are typed |

### Cancellation Fix

With the machine, cancellation works properly:
1. `Cancel` event is sent to actor
2. Transition handler runs: `Extracting -> Cancelled`
3. State scope for `Extracting` closes (interrupts spawn effect fiber)
4. Spawn effect (`processDocuments`) is interrupted mid-flight
5. Actor enters `Cancelled` (final state), stops

This fixes the current bug where cancellation only updates state but doesn't stop document processing.

---

## 11. Open Questions (Resolved)

| # | Question | Resolution |
|---|----------|------------|
| 1 | Should BatchEvent domain events become machine events? | **No.** Machine events = commands. Domain events = side effects emitted via Slot.Effects. |
| 2 | Should the machine carry batch-level context in state? | **Yes.** Config, documentIds, and counts are carried in state context per variant. |
| 3 | Should documentIds be in Failed state for retry? | **Yes.** Self-contained retry without external state. |
| 4 | How to handle failurePolicy branching? | **In processDocuments spawn effect.** The effect implementation branches on config.failurePolicy. |
| 5 | What about the BatchAggregator service? | **Not needed.** ExtractionComplete event carries aggregate counts from the spawn effect. |

---

## 12. Dependencies Summary

### Domain Package (`@beep/knowledge-domain`)

New dependency: `@beep/machine` (for `State()`, `Event()`, `Slot.Guards()`, `Slot.Effects()`)

### Server Package (`@beep/knowledge-server`)

Existing dependencies unchanged. New usage of:
- `Machine.make()`, `.build()`, `.persist()` from `@beep/machine`
- `ActorSystemService`, `ActorSystemDefault` from `@beep/machine`
- `InMemoryPersistenceAdapter` from `@beep/machine`

### Layer Composition

```typescript
export const BatchWorkflowLive = Layer.mergeAll(
  ActorSystemDefault,
  InMemoryPersistenceAdapter,
  // ... existing service layers
);
```
