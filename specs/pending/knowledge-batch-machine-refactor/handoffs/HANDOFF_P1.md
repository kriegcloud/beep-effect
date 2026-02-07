# Handoff: Phase 1 - Research & Design (COMPLETED)

## Tier 1: Critical Context

### Phase Goal
Research the `@beep/machine` package API and map the current batch workflow to a machine-based design. Produce a design document in `outputs/design-batch-machine.md`.

### Phase Outcome: COMPLETE
Design document produced at `outputs/design-batch-machine.md` with:
- State schema (6 variants with context fields)
- Event schema (8 command events)
- Complete transition table (15 transitions)
- Guard definitions (2 guards: `canRetry`, `isResolutionEnabled`)
- Effect definitions (4 effects: `emitBatchEvent`, `processDocuments`, `runResolution`, `persistState`)
- Full machine builder pseudocode with all `.on()` chains
- Persistence strategy (InMemoryPersistenceAdapter + snapshot-on-every-transition)
- Migration plan (what changes per phase)
- Backward compatibility analysis (RPC contract unchanged)

### Immediate Next Steps (for P2)
1. Create `packages/knowledge/domain/src/value-objects/BatchMachine.schema.ts`
2. Define `BatchMachineState` using `State()` builder
3. Define `BatchMachineEvent` using `Event()` builder
4. Define `BatchMachineGuards` using `Slot.Guards()`
5. Define `BatchMachineEffects` using `Slot.Effects()`
6. Re-export from `value-objects/index.ts`
7. Run `bun run check --filter @beep/knowledge-domain`

### Blocking Issues
NONE

### Open Questions (All Resolved)
- Machine events = commands, domain events = side effects via Slot.Effects (RESOLVED)
- Config/documentIds carried in state context per variant (RESOLVED)
- Failed state includes documentIds/config for retry self-containment (RESOLVED)

## Tier 2: Key Findings

### @beep/machine API Summary

| API | Purpose |
|-----|---------|
| `State({...})` | Schema-first state definition with variant constructors, `$is`, `$match`, `derive()` |
| `Event({...})` | Same as State but for events. Branded separately from states. |
| `Machine.make({state, event, guards?, effects?, initial})` | Fluent builder returning chainable machine |
| `.on(state, event, handler)` | Register transition. Handler gets `{state, event, guards, effects}` |
| `.reenter(state, event, handler)` | Same-state transition that restarts spawn effects |
| `.onAny(event, handler)` | Wildcard transition (fallback when no specific match) |
| `.spawn(state, handler)` | State-scoped effect (cancelled on state exit) |
| `.task(state, run, opts)` | State-scoped task with success/failure event mapping |
| `.background(handler)` | Machine-lifetime effect |
| `.final(state)` | Terminal state (actor stops) |
| `.build(handlers)` | Finalize with slot implementations |
| `.persist(config)` | Attach persistence (snapshot + event journal) |
| `Slot.Guards({...})` | Parameterized guard definitions |
| `Slot.Effects({...})` | Parameterized effect definitions |
| `Machine.spawn(machine)` | Spawn actor (simple, no registry) |
| `ActorSystemService` | Registry-based actor management (spawn, restore, list) |
| `simulate(machine, events)` | Pure transition testing |
| `assertPath(machine, events, tags)` | Assert state sequence |
| `createTestHarness(machine)` | Step-by-step test harness |

### Critical Design Decisions

1. **`.on()` not `.reenter()` for document progress**: `.on()` updates state without restarting spawn effects. `.reenter()` would kill the document processing spawn effect on every progress update.

2. **Failed state carries retry context**: `documentIds` and `config` in Failed variant enables self-contained retry without external state.

3. **ExtractionComplete as aggregate event**: Spawn effect sends one aggregate event when all documents finish, rather than machine counting individual completions.

4. **Spawn effects replace BatchOrchestrator**: Extracting spawn processes documents, Resolving spawn runs resolution. The machine IS the orchestrator.

### Discovered Issues in Current Code

| # | Issue | Impact | Fix in This Spec? |
|---|-------|--------|-------------------|
| 1 | `batch_start` RPC doesn't trigger orchestration | Critical gap | Yes - actor spawn effect starts processing |
| 2 | Cancellation doesn't interrupt processing | Bug | Yes - actor state scope interrupts spawn fiber |
| 3 | BatchAggregator service unused | Dead code | No - out of scope |
| 4 | Two PubSub systems (BatchEventEmitter + ProgressStream) | Complexity | Partially - BatchEventEmitter becomes Slot.Effect |

## Tier 3: Technical Details

### State Context Per Variant

| State | Fields |
|-------|--------|
| Pending | batchId, documentIds, config |
| Extracting | batchId, documentIds, config, completedCount, failedCount, totalDocuments, entityCount, relationCount, progress |
| Resolving | batchId, config, totalDocuments, entityCount, relationCount, progress |
| Completed | batchId, totalDocuments, entityCount, relationCount |
| Failed | batchId, documentIds, config, failedCount, error |
| Cancelled | batchId, completedCount, totalDocuments |

### Machine Events (8 commands)

| Event | Payload | Used In Transitions |
|-------|---------|---------------------|
| StartExtraction | {} | Pending -> Extracting |
| DocumentCompleted | documentId, entityCount, relationCount | Extracting -> Extracting |
| DocumentFailed | documentId, error | Extracting -> Extracting |
| ExtractionComplete | successCount, failureCount, totalEntityCount, totalRelationCount | Extracting -> {Resolving, Completed, Failed} |
| ResolutionComplete | mergeCount | Resolving -> Completed |
| Cancel | {} | {Pending, Extracting, Resolving} -> Cancelled |
| Retry | {} | Failed -> Pending |
| Fail | error | {Pending, Extracting, Resolving} -> Failed |

## Context Budget

| Tier | Estimated Tokens | Budget |
|------|-----------------|--------|
| Working (Tier 1) | ~500 | 2,000 |
| Episodic (Tier 2) | ~800 | 1,000 |
| Semantic (Tier 3) | ~400 | 500 |
| **Total** | **~1,700** | **4,000** |
