# P1 Orchestrator Prompt: Research & Design

## Session Type: Discovery
## Role: Orchestrator coordinating research agents
## Goal: Understand @beep/machine API and design the batch workflow refactoring

---

## Context

We are refactoring the knowledge slice's `BatchStateMachine` to use the `@beep/machine` package. The current implementation is a hand-rolled in-memory state machine using `Ref<HashMap>`. The target is a proper `@beep/machine`-based state machine with type-safe schemas, guards, effects, persistence, and testing.

**Spec location**: `specs/knowledge-batch-machine-refactor/README.md`

---

## Phase 1 Objectives

1. **Research** the `@beep/machine` package API surface thoroughly
2. **Map** current batch states, events, and transitions to machine concepts
3. **Design** the new machine schema (State, Event, Guards, Effects)
4. **Produce** a design document at `outputs/design-batch-machine.md`

---

## Research Targets

### @beep/machine Package (read ALL source files)
```
packages/common/machine/src/index.ts          - Public API exports
packages/common/machine/src/schema.ts         - State() and Event() builders
packages/common/machine/src/machine.ts        - Machine.make() builder API
packages/common/machine/src/actor.ts          - Actor runtime, ActorRef
packages/common/machine/src/slot.ts           - Slot.Guards, Slot.Effects
packages/common/machine/src/errors.ts         - Error types
packages/common/machine/src/persistence/      - PersistenceAdapter, persistent machines
packages/common/machine/src/testing.ts        - simulate, assertPath, createTestHarness
packages/common/machine/src/inspection.ts     - Inspector for debugging
packages/common/machine/test/                 - Usage examples in tests
```

### Current Batch Implementation (read ALL)
```
packages/knowledge/domain/src/value-objects/BatchState.value.ts   - 6 state variants
packages/knowledge/domain/src/value-objects/BatchEvent.value.ts   - 9 event variants
packages/knowledge/domain/src/value-objects/BatchConfig.value.ts  - Configuration schema
packages/knowledge/domain/src/errors/Batch.errors.ts              - Error types
packages/knowledge/server/src/Workflow/BatchStateMachine.ts       - Current state machine
packages/knowledge/server/src/Workflow/BatchOrchestrator.ts       - Workflow orchestrator
packages/knowledge/server/src/Workflow/BatchEventEmitter.ts       - Event emission (PubSub)
packages/knowledge/server/src/Workflow/WorkflowPersistence.ts     - Workflow persistence
packages/knowledge/server/src/rpc/v1/batch/                       - RPC handlers
packages/knowledge/server/test/Workflow/BatchStateMachine.test.ts - Current tests
packages/knowledge/server/test/Workflow/BatchAggregator.test.ts   - Aggregator tests
```

---

## Design Decisions to Make

### 1. Machine Events vs Domain Events

The current system has two event concepts:
- **Commands** that drive state transitions (implicit in orchestrator code: "start extracting", "document completed", "cancel")
- **Domain events** (`BatchEvent`) emitted for observability (UI notifications, logging)

**Design question**: Should we:
- (A) Make machine events = commands (Start, DocumentCompleted, Cancel, etc.) and emit domain events as side effects via `Slot.Effects`
- (B) Make machine events = domain events and derive transitions from them

**Recommendation**: Option (A). Machine events should be commands that drive transitions. Domain events are emitted as effects within handlers.

### 2. State Context Design

Current `BatchState` variants carry different context per state. Machine `State()` schemas support this naturally:

```typescript
const BatchMachineState = State({
  Pending:    { batchId: S.String, config: BatchConfig },
  Extracting: { batchId: S.String, completedDocuments: S.Number, totalDocuments: S.Number, progress: S.Number },
  Resolving:  { batchId: S.String, progress: S.Number },
  Completed:  { batchId: S.String, totalDocuments: S.Number, entityCount: S.Number, relationCount: S.Number },
  Failed:     { batchId: S.String, failedDocuments: S.Array(S.String), error: S.String },
  Cancelled:  { batchId: S.String, completedDocuments: S.Number, totalDocuments: S.Number },
})
```

### 3. Guard Candidates

| Guard | Purpose | Parameters |
|-------|---------|------------|
| `canRetry` | Failed -> Pending allowed? | `{ maxRetries: S.Number }` |
| `hasDocuments` | Batch has documents to process | `{}` |
| `isResolutionEnabled` | Entity resolution configured | `{}` |

### 4. Effect Candidates

| Effect | Purpose | Parameters |
|--------|---------|------------|
| `emitBatchEvent` | Emit domain event to PubSub | `{ event: BatchEvent }` |
| `processDocuments` | Trigger document extraction | `{ documentIds: S.Array(S.String) }` |
| `runEntityResolution` | Trigger clustering | `{ batchId: S.String }` |
| `persistState` | Save state to workflow persistence | `{ batchId: S.String }` |

---

## Machine Events Design (Commands)

```typescript
const BatchMachineEvent = Event({
  StartExtraction:     { documentIds: S.Array(S.String), config: BatchConfig },
  DocumentCompleted:   { documentId: S.String, entityCount: S.Number, relationCount: S.Number },
  DocumentFailed:      { documentId: S.String, error: S.String },
  AllDocumentsProcessed: {},
  StartResolution:     {},
  ResolutionCompleted: { mergeCount: S.Number },
  Cancel:              {},
  Retry:               {},
  Fail:                { error: S.String },
})
```

---

## Transition Map

```
Pending + StartExtraction      -> Extracting
Extracting + DocumentCompleted -> Extracting (update progress)
Extracting + DocumentFailed    -> Extracting (update progress) or Failed (abort-all)
Extracting + AllDocumentsProcessed -> Resolving (if resolution enabled) or Completed
Extracting + Cancel            -> Cancelled
Extracting + Fail              -> Failed
Resolving + ResolutionCompleted -> Completed
Resolving + Cancel             -> Cancelled
Resolving + Fail               -> Failed
Failed + Retry                 -> Pending
```

---

## Output: Design Document Structure

Create `specs/knowledge-batch-machine-refactor/outputs/design-batch-machine.md` with:

1. **State Schema** - Full `State()` definition with variant fields
2. **Event Schema** - Full `Event()` definition with command payloads
3. **Transition Table** - Complete state x event -> next state mapping
4. **Guard Definitions** - `Slot.Guards` with parameter schemas
5. **Effect Definitions** - `Slot.Effects` with parameter schemas
6. **Machine Builder Pseudocode** - The `.on()` chain showing all transitions
7. **Domain Event Mapping** - Which transitions emit which `BatchEvent` variants
8. **Persistence Strategy** - Snapshot schedule, event journal, machine type
9. **Migration Plan** - Step-by-step changes to domain and server packages
10. **Backward Compatibility** - How RPC handlers adapt to the new machine

---

## Delegation Strategy

| Agent | Task | Capability | Type |
|-------|------|------------|------|
| `codebase-explorer` | Read all @beep/machine source + all batch implementation files | Read-only codebase exploration, multi-file analysis | Research |
| `effect-expert` | Design the machine schema, guards, effects | Effect pattern design, Layer/Service composition | Design |
| Orchestrator | Synthesize findings into design document at `outputs/design-batch-machine.md` | Write coordination artifacts | Coordination |

---

## Success Criteria

- [ ] All @beep/machine API surface documented and understood
- [ ] All current batch states/transitions mapped to machine concepts
- [ ] Design document produced at `outputs/design-batch-machine.md`
- [ ] No functionality gaps between current and proposed design
- [ ] Guards and effects cleanly separated from transition logic
- [ ] Persistence strategy defined
- [ ] Migration plan covers both domain and server changes

---

## Critical Lessons from Prior Specs

1. **State/Event schemas go in domain, machine builder goes in server** - preserves dependency direction
2. **Machine events are commands, domain events are side effects** - don't conflate the two
3. **Use `Slot.Guards` for reusable predicates, handler logic for one-off computations**
4. **`.reenter()` for same-state transitions** (e.g., Extracting + DocumentCompleted -> Extracting)
5. **`.final()` for terminal states** (Completed, Cancelled) - actor stops automatically
6. **Test with `simulate()` for pure logic, `createTestHarness()` for lifecycle effects**
7. **`Slot.Effects` receive `{ state, event, self }` context** - can send events back to the actor

---

## Next Phase

After P1 completes, create `HANDOFF_P2.md` with the design document findings and proceed to domain model implementation.
