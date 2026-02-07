# knowledge-batch-machine-refactor

Refactor the knowledge slice Batch workflow to use `@beep/machine` for type-safe state management, persistence, and testability.

## Status

| Phase | Description | Status |
|-------|-------------|--------|
| P1 | Research & Design | PLANNED |
| P2 | Domain Model Refactor | PLANNED |
| P3 | Server Implementation | PLANNED |
| P4 | Testing & Verification | PLANNED |

## Purpose

The current `BatchStateMachine` in `packages/knowledge/server/src/Workflow/BatchStateMachine.ts` is a hand-rolled in-memory state machine using `Ref<HashMap>`. It lacks persistence, crash recovery, lifecycle effects, and structured testing. The `@beep/machine` package provides all of these capabilities with a type-safe builder API, branded state/event schemas, slot-based guards and effects, persistence adapters, and testing utilities.

This spec replaces the ad-hoc implementation with a proper `@beep/machine`-based state machine, enabling:
- **Crash recovery** via snapshot + event journal persistence
- **Type-safe transitions** enforced at the schema level
- **Slot-based effects** for document processing, event emission, and entity resolution
- **Structured testing** with `simulate`, `assertPath`, and test harnesses
- **Actor lifecycle** with spawn effects per state and background monitoring

## Complexity

| Factor | Score | Rationale |
|--------|-------|-----------|
| Phases | 4 x 2 = 8 | Research, domain, server, testing |
| Agents | 3 x 3 = 9 | Effect-expert, test-writer, code-reviewer |
| CrossPkg | 2 x 4 = 8 | knowledge-domain + knowledge-server |
| ExtDeps | 0 x 3 = 0 | @beep/machine is internal |
| Uncertainty | 1 x 5 = 5 | Persistence adapter design |
| Research | 1 x 2 = 2 | Machine package API study |
| **Total** | **32** | **Medium complexity** |

## Background

### Current State

- `BatchStateMachine` uses `Ref<HashMap<string, BatchState>>` for in-memory state
- Transitions validated via `HashMap` lookup of allowed `(from, to)` pairs
- No persistence: server crash loses all batch state
- No lifecycle effects: spawn/background effects not supported
- Testing limited to manual transition validation
- `BatchState` value objects defined in `knowledge-domain` as `S.TaggedStruct` variants
- `BatchEvent` value objects defined separately from state machine events
- `BatchOrchestrator` drives the workflow, calling state machine for transitions

### Target State

- `BatchStateMachine` replaced by `@beep/machine` `BuiltMachine`
- State/Event schemas defined using `Machine.State()` / `Machine.Event()`
- Transitions defined via `.on()` builder with typed handlers
- Guards via `Slot.Guards` for transition validation (e.g., `canTransition`, `canRetry`)
- Effects via `Slot.Effects` for side effects (e.g., `emitEvent`, `processDocument`)
- Persistence via `PersistenceAdapter` for crash recovery
- Testing via `simulate()`, `assertPath()`, and `createTestHarness()`
- `BatchOrchestrator` simplified to actor lifecycle management

## Related Specs

| Spec | Relationship |
|------|-------------|
| `specs/knowledge-ontology-comparison/` | Active spec; batch workflow is a dependency. Identified EventLog as gap; rejected @effect/workflow but @effect/experimental is standalone |
| `specs/knowledge-workflow-durability/` | Earlier exploration of workflow durability patterns |
| `specs/knowledge-architecture-foundation/` | Foundation architecture for the knowledge slice |

## Prerequisites

- `@beep/machine` package compiles and tests pass
- Familiarity with the machine package API (covered in P1)

## Goals

1. Define `BatchState` and `BatchEvent` as `@beep/machine` State/Event schemas
2. Build the batch machine using the `Machine.make()` fluent API
3. Implement guards for transition validation
4. Implement effects for event emission and document processing
5. Add persistence support for crash recovery
6. Migrate `BatchOrchestrator` to use `ActorRef` for state management
7. Comprehensive test coverage using machine testing utilities

## Non-Goals

- Changing the batch RPC contract (API surface stays the same)
- Modifying `ExtractionWorkflow` or `DurableActivities`
- Implementing a full SQL-backed `PersistenceAdapter` in Phase 3 (in-memory + `EventJournal.layerMemory` first; PostgreSQL `EventJournal` adapter is Phase 3 follow-up)
- Changing batch failure policies (continue-on-failure, abort-all, retry-failed)
- Cluster/entity integration (future work)

## Deliverables

| # | Deliverable | Priority | Complexity | Phase |
|---|-------------|----------|------------|-------|
| 1 | Machine State/Event schema definitions | P0 | Medium | P2 |
| 2 | Machine builder with transitions | P0 | Medium | P2 |
| 3 | Slot.Guards for transition validation | P1 | Small | P2 |
| 4 | Slot.Effects for side effects | P1 | Medium | P3 |
| 5 | BatchOrchestrator migration | P0 | Large | P3 |
| 6 | Persistence configuration | P1 | Medium | P3 |
| 7 | Unit tests for machine definition | P0 | Medium | P4 |
| 8 | Integration tests for orchestrator | P1 | Large | P4 |

## Orchestrator Delegation Rules

- If task requires reading >3 files, delegate to `codebase-explorer` or `codebase-researcher`
- If task requires Effect docs lookup, delegate to `mcp-researcher`
- If task requires writing source code, delegate to `effect-code-writer`
- If task requires writing tests, delegate to `test-writer`
- Orchestrator may directly: read 1-3 files for quick context, coordinate agents, write handoff/reflection documents

## Phase Overview

| Phase | Name | Items | Description |
|-------|------|-------|-------------|
| P1 | Research & Design | 4 | Study @beep/machine API, map current states/events, design schema, produce design doc |
| P2 | Domain Model Refactor | 5 | Define State/Event schemas, build machine, implement guards, update domain exports |
| P3 | Server Implementation | 5 | Implement effects, migrate orchestrator, add persistence, update RPC handlers |
| P4 | Testing & Verification | 4 | Machine unit tests, orchestrator integration tests, verify type checks, update docs |

## Key Architecture Decisions

### 1. State/Event schema location

**Decision**: Define machine schemas in `knowledge-domain`, machine builder in `knowledge-server`.

**Rationale**: State and Event schemas are domain concepts (pure data). The machine builder with guards/effects is infrastructure (requires service dependencies). This preserves the `domain -> server` dependency direction.

### 2. BatchEvent as Machine Events vs separate emission

**Decision**: Map domain `BatchEvent` variants to machine `Event()` schema. Use machine event handlers to trigger domain event emission.

**Rationale**: Machine events drive transitions. Domain events (`BatchCreated`, `DocumentCompleted`, etc.) are emitted as side effects within transition handlers via `Slot.Effects`.

### 3. Guard vs handler-level validation

**Decision**: Use `Slot.Guards` for reusable transition predicates (e.g., `canRetry`, `hasDocuments`). Use handler-level logic for transition-specific computation.

**Rationale**: Guards are declarative and testable independently. Handler logic is procedural and specific to a transition.

### 4. Persistence strategy

**Decision**: Start with `InMemoryPersistenceAdapter` (ships with `@beep/machine`). SQL adapter is a follow-up spec.

**Rationale**: The in-memory adapter validates the persistence interface contract. A SQL adapter requires table design and migration work that belongs in its own spec.

### 5. Event persistence via @effect/experimental EventLog

**Decision**: Use `@effect/experimental` `EventGroup` + `EventLog` + `EventJournal` for batch event definition, persistence, and handler registration. Build a PostgreSQL `EventJournal` adapter as the production backing store.

**Rationale**: The `@effect/experimental` Event modules provide schema-typed event definitions with `primaryKey` for idempotency, compile-time handler exhaustiveness, event compaction, and replay capability — all features the batch machine needs. Unlike `@effect/workflow`, these modules do NOT require `@effect/cluster` infrastructure. The `EventJournal` interface is small (6 methods), making a PostgreSQL adapter bounded work. This replaces the plan for a fully custom `machine_event_journal` SQL table with a standard, upstream-maintained abstraction.

## Success Criteria

### Implementation
- [ ] `BatchMachine.schema.ts` created in `packages/knowledge/domain/src/value-objects/` with `State()` and `Event()` schemas
- [ ] `BatchMachine.ts` created in `packages/knowledge/server/src/Workflow/` with `Machine.make()` builder
- [ ] All 6 states preserved: Pending, Extracting, Resolving, Completed, Failed, Cancelled
- [ ] All transitions implemented via `.on()` and `.reenter()` matching current transition map
- [ ] `.final()` called for Completed and Cancelled terminal states
- [ ] `Slot.Guards` implemented: `canRetry`, `isResolutionEnabled`
- [ ] `Slot.Effects` implemented: `emitBatchEvent`, `notifyProgress`
- [ ] `BatchOrchestrator.ts` uses `Machine.spawn()` and `ActorRef.send()` instead of `BatchStateMachine`
- [ ] Old `BatchStateMachine.ts` removed or deprecated

### Functional
- [ ] `batch_start` RPC spawns actor and returns batchId
- [ ] `batch_getStatus` RPC reads actor snapshot
- [ ] `batch_cancel` RPC sends Cancel event to actor
- [ ] `batch_streamProgress` RPC subscribes to actor state changes
- [ ] Failure policies preserved: continue-on-failure, abort-all, retry-failed

### Quality
- [ ] `bun run check --filter @beep/knowledge-domain` passes
- [ ] `bun run check --filter @beep/knowledge-server` passes
- [ ] Machine unit tests cover all valid/invalid transitions via `simulate()`
- [ ] Path assertions verify state sequences via `assertPath()`
- [ ] Guard tests verify precondition logic
- [ ] No regressions in existing batch tests (`BatchStateMachine.test.ts`, `BatchAggregator.test.ts`)

## Dependencies

| Type | Dependency | Status |
|------|-----------|--------|
| Hard | `@beep/machine` compiles | In Progress |
| Soft | Existing batch tests pass | Assumed |
| Soft | `@effect/experimental` EventLog API stable | Assumed (v0.58.0) |

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Machine package API changes | Medium | Pin to current API, update if needed |
| Orchestrator refactor breaks RPC | High | Keep RPC handlers thin, test end-to-end |
| Persistence adapter mismatch | Low | Start with in-memory, validate interface |
| `@effect/experimental` API instability | Medium | Pin to v0.58.0; Event/EventGroup/EventLog APIs are well-defined but pre-1.0. Wrap usage behind internal modules so upstream changes are contained |

## Reference Files

| File | Purpose |
|------|---------|
| `packages/common/machine/src/index.ts` | Machine package public API |
| `packages/common/machine/src/schema.ts` | State/Event schema builders |
| `packages/common/machine/src/machine.ts` | Machine builder API |
| `packages/common/machine/src/actor.ts` | Actor runtime |
| `packages/common/machine/src/persistence/` | Persistence layer |
| `packages/common/machine/src/testing.ts` | Testing utilities |
| `packages/knowledge/domain/src/value-objects/BatchState.value.ts` | Current batch states |
| `packages/knowledge/domain/src/value-objects/BatchEvent.value.ts` | Current batch events |
| `packages/knowledge/domain/src/value-objects/BatchConfig.value.ts` | Batch configuration |
| `packages/knowledge/domain/src/errors/Batch.errors.ts` | Batch errors |
| `packages/knowledge/server/src/Workflow/BatchStateMachine.ts` | Current state machine |
| `packages/knowledge/server/src/Workflow/BatchOrchestrator.ts` | Current orchestrator |
| `packages/knowledge/server/src/Workflow/BatchEventEmitter.ts` | Event emission |
| `packages/knowledge/server/src/Workflow/WorkflowPersistence.ts` | Workflow persistence |
| `packages/knowledge/server/test/Workflow/BatchStateMachine.test.ts` | Current tests |
| `.repos/effect/packages/experimental/src/Event.ts` | `@effect/experimental` Event definition (tag, primaryKey, payload) |
| `.repos/effect/packages/experimental/src/EventGroup.ts` | EventGroup builder (`EventGroup.empty.add(...)`) |
| `.repos/effect/packages/experimental/src/EventLog.ts` | EventLog schema, group handlers, makeClient, compaction |
| `.repos/effect/packages/experimental/src/EventJournal.ts` | EventJournal persistence interface (6 methods), `layerMemory` |

## Outputs

| Phase | Output | Location |
|-------|--------|----------|
| P1 | Design document | `outputs/design-batch-machine.md` |

## Follow-Up Work

Items explicitly deferred from this spec:
- **PostgreSQL EventJournal adapter**: Production crash recovery requires a PostgreSQL-backed `EventJournal` implementation (the `EventJournal` interface has 6 methods; `entries`, `write`, `writeFromRemote`, `withRemoteUncommited`, `nextRemoteSequence`, `changes`, `destroy` — remote sync methods can be no-ops for single-node)
- **Cluster/entity integration**: Distributed batch processing via `@effect/cluster`
- **Batch queuing**: Background job scheduler for queued batch operations
- **Cancellation propagation**: Cancel event should interrupt running document extraction fibers
- **EventLog compaction tuning**: Configure `groupCompaction` to consolidate StageProgress events per document
