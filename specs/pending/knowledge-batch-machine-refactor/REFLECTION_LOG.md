# Reflection Log

> Cumulative learnings from knowledge-batch-machine-refactor.

### Phase 0 - Spec Scaffolding (2026-02-07)

#### What Worked
- Researched @beep/machine API, current batch implementation, and spec guide structure in parallel before writing any spec files
- Dual handoff protocol (HANDOFF + ORCHESTRATOR_PROMPT) created for all 4 phases upfront
- Complexity calculation (32 = Medium) accurately guided structure: README, REFLECTION_LOG, handoffs, outputs
- Separation of concerns: State/Event schemas in domain, machine builder in server preserves slice dependency direction
- Identified that machine events should be commands (not domain events); domain events are side effects

#### What Didn't Work
- N/A - initial scaffolding, no execution yet

#### Key Learnings
- `@beep/machine` supports `.reenter()` for same-state transitions (critical for Extracting + DocumentCompleted -> Extracting with progress updates)
- `Slot.Effects` handlers receive `{ state, event, self }` context, enabling effects to send events back to the actor via `self.send()`
- `.final()` marks terminal states and auto-stops the actor - maps cleanly to Completed and Cancelled
- Current `BatchStateMachine` is in-memory only (`Ref<HashMap>`); no crash recovery. Machine persistence solves this
- `simulate()` from `@beep/machine` testing enables pure transition testing without lifecycle effects
- The existing `BatchEventEmitter` (PubSub-based) can be wrapped as a `Slot.Effect` handler

#### Pattern Candidates
- **machine-refactor-from-adhoc**: Pattern for migrating hand-rolled state machines to @beep/machine. Covers schema mapping, guard extraction, effect slot design. (Score: 65 - needs validation through execution)

### Phase 1 - Research & Design (2026-02-07)

#### What Worked
- Parallel research agents: one for @beep/machine API, one for current batch implementation. Both completed in ~3 minutes with comprehensive results.
- Machine API agent documented the complete API surface including State/Event builders, Machine.make() chain, Slot system, Actor lifecycle, Persistence, and Testing utilities.
- Batch implementation agent discovered critical architectural issues in the current code:
  1. `batch_start` RPC creates state but does NOT trigger `BatchOrchestrator.run()` -- disconnect between RPC and orchestration
  2. Cancellation is cosmetic -- setting state to Cancelled doesn't interrupt the running orchestrator
  3. Entity resolution is a placeholder (immediately completes with mergeCount=0)
  4. All infrastructure errors are silently swallowed
- Design document captures the complete mapping from current -> new, with concrete code examples.

#### What Didn't Work
- Initial P1 prompt assumed `.reenter()` for same-state transitions (Extracting + DocumentCompleted -> Extracting). Actual design uses `.on()` because `.reenter()` would kill and restart the spawn effect (document processing), which is wrong. `.on()` updates state context without disrupting spawn effects.

#### Key Learnings
- **`.on()` vs `.reenter()` for same-state transitions**: `.on()` updates state ref only. `.reenter()` tears down and re-creates the state scope, restarting spawn effects. For long-running spawn effects (like document processing), ALWAYS use `.on()` for progress updates.
- **Failed state needs retry context**: The `Failed -> Pending` retry path requires `documentIds` and `config` to reconstruct Pending. These must be carried in the Failed state variant to keep the machine self-contained.
- **ExtractionComplete as aggregate event**: Rather than having the machine track when "all documents are done" (which would require counting logic in guards), the spawn effect sends an `ExtractionComplete` aggregate event when processing finishes. This keeps transition logic simple.
- **Spawn effects as the orchestration replacement**: The current `BatchOrchestrator.run()` is a monolithic Effect. With the machine, this splits into: spawn effect for Extracting (processes documents), spawn effect for Resolving (runs resolution). The machine builder IS the orchestrator.
- **Guard vs handler branching**: `isResolutionEnabled` is a guard (reusable predicate). Failure count checks (successCount === 0) are handler-level logic. Rule of thumb: if the condition appears in multiple transitions, make it a guard.

#### Discovered Issues in Current Code
1. **batch_start disconnect**: RPC creates Pending state but never triggers orchestration. The actual `.run()` call path is unclear.
2. **Cancellation doesn't interrupt**: `batch_cancel` only updates HashMap but running Effect continues processing.
3. **BatchAggregator unused**: Orchestrator has inline aggregation; standalone service exists but is not connected.
4. **Two separate PubSub systems**: `BatchEventEmitter` for batch events, `ProgressStream` for extraction progress. Not unified.

#### Pattern Candidates
- **spawn-effect-as-orchestrator**: Replace monolithic orchestration Effects with state-scoped spawn effects. Each state's spawn effect drives the work for that phase, sending events back to the machine. (Score: 70 - design validated, needs implementation)
