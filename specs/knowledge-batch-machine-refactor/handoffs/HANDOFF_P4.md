# Handoff: Phase 4 - Testing & Verification

## Tier 1: Critical Context

### Phase Goal
Write comprehensive tests for the new batch machine using `@beep/machine` testing utilities. Verify all existing functionality preserved. Update documentation.

### Immediate Next Steps
1. Write machine definition unit tests using `simulate()` and `assertPath()`
2. Write orchestrator integration tests
3. Run full type checks and test suites
4. Update REFLECTION_LOG.md with learnings

### Blocking Issues
- P3 must be complete (machine built, orchestrator migrated)

### Open Questions
- None expected at this phase

## Tier 2: Execution Checklist

### Task 1: Machine Unit Tests
- [ ] Create `packages/knowledge/server/test/Workflow/BatchMachine.test.ts`
- [ ] Test all valid transitions using `simulate()`
- [ ] Test transition paths using `assertPath()`
- [ ] Test invalid transitions are rejected
- [ ] Test guard behavior (canRetry, isResolutionEnabled)
- [ ] Test terminal states (Completed, Cancelled) stop the machine

### Task 2: Orchestrator Integration Tests
- [ ] Update existing `BatchStateMachine.test.ts` or create new test file
- [ ] Test full batch lifecycle: create -> extract -> resolve -> complete
- [ ] Test failure policy: continue-on-failure
- [ ] Test failure policy: abort-all
- [ ] Test failure policy: retry-failed
- [ ] Test cancellation mid-extraction
- [ ] Test cancellation mid-resolution

### Task 3: RPC Handler Tests
- [ ] Test startBatch RPC creates actor and returns batchId
- [ ] Test getBatchStatus returns current state
- [ ] Test cancelBatch transitions to Cancelled
- [ ] Test streamProgress returns state changes

### Task 4: Full Verification
- [ ] `bun run check --filter @beep/knowledge-domain` passes
- [ ] `bun run check --filter @beep/knowledge-server` passes
- [ ] `bun test packages/knowledge/server/test/Workflow/BatchMachine.test.ts` passes
- [ ] No regressions in existing knowledge tests
- [ ] Update REFLECTION_LOG.md

### Verification
- All tests pass
- Type checks pass
- No functionality regressions
- REFLECTION_LOG updated

## Tier 3: Technical Details

### Test Pattern: Machine Simulation
```typescript
import { simulate, assertPath, assertReaches } from "@beep/machine"
import { effect } from "@beep/testkit"

effect("batch happy path", () =>
  Effect.gen(function* () {
    const result = yield* simulate(batchMachine, [
      BatchMachineEvent.StartExtraction({ documentIds: ["doc1"], totalDocuments: 1 }),
      BatchMachineEvent.DocumentCompleted({ documentId: "doc1", entityCount: 5, relationCount: 3 }),
      BatchMachineEvent.AllDocumentsProcessed({}),
      BatchMachineEvent.ResolutionCompleted({ mergeCount: 2 }),
    ])
    strictEqual(result.finalState._tag, "Completed")
  })
)
```

### Test Pattern: Path Assertion
```typescript
effect("follows expected state path", () =>
  assertPath(batchMachine, events, [
    "Pending", "Extracting", "Extracting", "Resolving", "Completed"
  ])
)
```

### Test Pattern: Guard Behavior
```typescript
effect("retry guarded by maxRetries", () =>
  Effect.gen(function* () {
    const result = yield* simulate(batchMachine, [
      BatchMachineEvent.StartExtraction({ ... }),
      BatchMachineEvent.Fail({ error: "timeout" }),
      BatchMachineEvent.Retry({}),
    ])
    strictEqual(result.finalState._tag, "Pending")
  })
)
```

### File Locations
- New: `packages/knowledge/server/test/Workflow/BatchMachine.test.ts`
- Modified/Replaced: `packages/knowledge/server/test/Workflow/BatchStateMachine.test.ts`
- Modified: `specs/knowledge-batch-machine-refactor/REFLECTION_LOG.md`

## Tier 4: Historical Context

### From P3
- Machine built in `BatchMachine.ts`
- Orchestrator migrated to use `ActorRef`
- RPC handlers updated
- Persistence configured

### Testing Guidelines (from .claude/rules/effect-patterns.md)
- Use `@beep/testkit` runners (effect, scoped, layer)
- NEVER use raw `bun:test` with `Effect.runPromise`
- Tests in `./test/` directory mirroring `./src/` structure
- Use path aliases (`@beep/*`)

## Context Budget

| Tier | Estimated Tokens | Budget |
|------|-----------------|--------|
| Working (Tier 1) | ~300 | 2,000 |
| Episodic (Tier 2) | ~600 | 1,000 |
| Semantic (Tier 3) | ~400 | 500 |
| Procedural (Tier 4) | ~100 | Links only |
| **Total** | **~1,400** | **4,000** |
