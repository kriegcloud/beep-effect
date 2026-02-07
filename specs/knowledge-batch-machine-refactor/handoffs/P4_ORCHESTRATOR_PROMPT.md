# P4 Orchestrator Prompt: Testing & Verification

## Session Type: Verification
## Role: Orchestrator coordinating test writing and validation
## Goal: Comprehensive test coverage for the refactored batch machine

---

## Context from P3

Phase 3 created:
- `packages/knowledge/server/src/Workflow/BatchMachine.ts` - Machine definition with all transitions
- Migrated `BatchOrchestrator.ts` to use `ActorRef`
- Updated RPC handlers
- Configured persistence with `InMemoryPersistenceAdapter`

---

## Phase 4 Objectives

1. **Machine unit tests** using `simulate()`, `assertPath()`, `assertReaches()`
2. **Guard tests** verifying transition preconditions
3. **Orchestrator integration tests** covering full batch lifecycle
4. **Full verification** with type checks and test suite

---

## Test Plan

### 1. Machine Definition Tests (`BatchMachine.test.ts`)

**Happy Path Tests**:
- Pending -> StartExtraction -> Extracting
- Extracting -> DocumentCompleted (x N) -> Extracting (progress updates)
- Extracting -> AllDocumentsProcessed -> Resolving (when resolution enabled)
- Extracting -> AllDocumentsProcessed -> Completed (when resolution disabled)
- Resolving -> ResolutionCompleted -> Completed
- Complete path: Pending -> Extracting -> Resolving -> Completed

**Error Path Tests**:
- Extracting -> Fail -> Failed
- Resolving -> Fail -> Failed
- Failed -> Retry -> Pending (when canRetry guard passes)

**Cancellation Tests**:
- Pending -> Cancel -> Cancelled (if transition exists)
- Extracting -> Cancel -> Cancelled
- Resolving -> Cancel -> Cancelled

**Guard Tests**:
- canRetry returns true when under maxRetries
- canRetry returns false when at maxRetries
- isResolutionEnabled controls Extracting -> Resolving vs Extracting -> Completed

**Terminal State Tests**:
- Completed is final (no further transitions)
- Cancelled is final (no further transitions)

**Invalid Transition Tests**:
- Pending + DocumentCompleted -> rejected
- Completed + any event -> no transition
- Cancelled + any event -> no transition

### 2. Orchestrator Integration Tests

**Full Lifecycle**:
- Create batch -> process all documents -> complete
- Create batch -> process docs -> entity resolution -> complete

**Failure Policies**:
- continue-on-failure: some documents fail, batch still completes
- abort-all: first failure cancels remaining, batch fails
- retry-failed: failed documents retried up to maxRetries

**Cancellation**:
- Cancel during extraction -> stops processing
- Cancel during resolution -> stops resolution

### 3. RPC Handler Tests

- startBatch returns batchId and spawns actor
- getBatchStatus returns correct state
- cancelBatch sends Cancel event
- streamProgress delivers state changes

---

## Testing Utilities Reference

```typescript
// From @beep/machine
import { simulate, assertPath, assertReaches, assertNeverReaches, createTestHarness } from "@beep/machine"

// Pure simulation (no lifecycle effects)
const result = yield* simulate(machine, events)
// result.states: ReadonlyArray<State>
// result.finalState: State

// Path assertion
yield* assertPath(machine, events, ["Pending", "Extracting", "Completed"])

// Reachability
yield* assertReaches(machine, events, "Completed")
yield* assertNeverReaches(machine, events, "Failed")

// Step-by-step harness (with lifecycle)
const harness = yield* createTestHarness(machine)
yield* harness.send(event)
const state = yield* harness.getState
```

```typescript
// From @beep/testkit
import { effect, scoped, layer, strictEqual, deepStrictEqual } from "@beep/testkit"
import * as Effect from "effect/Effect"

effect("test name", () =>
  Effect.gen(function* () {
    // test body
  })
)
```

---

## Delegation Strategy

| Agent | Task | Type |
|-------|------|------|
| `test-writer` | Write BatchMachine.test.ts (machine unit tests) | Implementation |
| `test-writer` | Write BatchOrchestrator.test.ts (integration tests) | Implementation |
| `package-error-fixer` | Fix any failing tests or type errors | Verification |
| Orchestrator | Run verification gates, update reflection log | Coordination |

---

## Verification Gates

```bash
# Type check
bun run check --filter @beep/knowledge-domain
bun run check --filter @beep/knowledge-server

# Run tests
bun test packages/knowledge/server/test/Workflow/BatchMachine.test.ts
bun test packages/knowledge/server/test/Workflow/

# Full suite (optional, may have pre-existing failures)
bun run test --filter @beep/knowledge-server
```

---

## Success Criteria

- [ ] Machine unit tests cover all valid transitions
- [ ] Machine unit tests cover all invalid transitions
- [ ] Guard tests verify precondition logic
- [ ] Terminal state tests confirm actor stops
- [ ] Orchestrator integration tests cover all failure policies
- [ ] Cancellation tests work at all stages
- [ ] `bun run check --filter @beep/knowledge-domain` passes
- [ ] `bun run check --filter @beep/knowledge-server` passes
- [ ] All new tests pass
- [ ] No regressions in existing tests
- [ ] REFLECTION_LOG.md updated with phase learnings

---

## Post-Completion

1. Update `specs/knowledge-batch-machine-refactor/REFLECTION_LOG.md`
2. Mark spec status as COMPLETE in README.md
3. Identify follow-up work:
   - SQL-backed `PersistenceAdapter` for production crash recovery
   - Cluster/entity integration for distributed batch processing
   - Batch queuing and scheduling
