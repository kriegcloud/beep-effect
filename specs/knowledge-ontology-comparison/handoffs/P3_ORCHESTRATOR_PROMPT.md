# Phase 3 Orchestrator Prompt

> **Full Context:** [HANDOFF_P3.md](./HANDOFF_P3.md) | **Roadmap:** [IMPLEMENTATION_ROADMAP.md](../outputs/IMPLEMENTATION_ROADMAP.md)

Copy-paste this prompt to start Phase 3 implementation.

---

## Prompt

You are implementing Phase 3 of the `knowledge-ontology-comparison` spec: **State Management + Orchestration**.

### Context

Phase 2 (Workflow Durability) is complete. Durable workflows, CircuitBreaker, and RateLimiter are in place. This phase adds batch state tracking and multi-document coordination.

### Your Mission

Implement batch lifecycle management in 2 sub-tasks:

| Sub-Task | Gap | Priority | Days | Deliverable |
|----------|-----|----------|------|-------------|
| 3A: Batch State Machine | #2 | P0 | 1-8 | State machine + SSE emitter + RPC contract |
| 3B: Cross-Batch Orchestration | #10 | P1 | 9-16 | Orchestrator + Aggregator + Batch table |

### Delegation Protocol

Orchestrator MUST delegate ALL implementation work. If reading >3 reference files, delegate to `codebase-researcher`.

| Sub-Task | Delegate To | Est. Tool Calls | Expected Output |
|----------|-------------|-----------------|-----------------|
| Research Phase 2 deliverables | `codebase-researcher` | ~8-10 | Summary of ExtractionWorkflow, ProgressStream, workflow tables, CircuitBreaker APIs |
| 3A: State machine ADT | `domain-modeler` | ~5-8 | BatchState.value.ts + BatchEvent.value.ts |
| 3A: BatchStateMachine service | `effect-code-writer` | ~8-10 | BatchStateMachine.ts + BatchEventEmitter.ts |
| 3A: SSE RPC contract | `effect-code-writer` | ~5-8 | StreamProgress.ts RPC |
| 3B: Batch entity model | `domain-modeler` | ~5-8 | Agent.model.ts + config VOs |
| 3B: Batch table | `effect-code-writer` | ~5-8 | batch.table.ts + registration |
| 3B: BatchOrchestrator | `effect-code-writer` | ~10-12 | BatchOrchestrator.ts + BatchAggregator.ts |
| Tests | `test-writer` | ~10-15 | test/Workflow/*.test.ts |
| Type fixes | `package-error-fixer` | ~5 | Compilation fixes |

**Sequencing**:
1. `codebase-researcher` FIRST -- research Phase 2 deliverables (7 reference files, exceeds 3-file threshold)
2. 3A: domain-modeler (ADT) -> effect-code-writer (service) -> effect-code-writer (RPC) (sequential within 3A)
3. 3B: domain-modeler (model) -> effect-code-writer (table) -> effect-code-writer (orchestrator) (sequential within 3B)
4. 3A MUST complete before 3B (orchestrator uses state machine)
5. Tests after all implementation, then type fixes last

### Critical Patterns

**Pattern 1: State Machine via S.Union of TaggedStruct**
```typescript
export class Pending extends S.TaggedStruct("Pending")({ batchId: S.String }) {}
export class Extracting extends S.TaggedStruct("Extracting")({ batchId: S.String, progress: S.Number }) {}
export class Completed extends S.TaggedStruct("Completed")({ batchId: S.String, entityCount: S.Number }) {}
export class Failed extends S.TaggedStruct("Failed")({ batchId: S.String, error: S.String }) {}

export const BatchState = S.Union(Pending, Extracting, Completed, Failed);
export type BatchState = S.Schema.Type<typeof BatchState>;
```

**Pattern 2: Exhaustive Matching with Match.typeTags**
```typescript
const handleState = Match.typeTags<BatchState>()({
  Pending: (s) => startExtraction(s.batchId),
  Extracting: (s) => reportProgress(s.progress),
  Completed: (s) => notifyComplete(s.entityCount),
  Failed: (s) => reportError(s.error),
});
```

**Pattern 3: PubSub Event Emission**
```typescript
const pubsub = yield* Effect.PubSub.unbounded<BatchEvent>();
yield* Effect.PubSub.publish(pubsub, new StageCompleted({ stage: "mentions", progress: 0.5 }));
```

### Critical Constraints

1. **Phase 2 dependency**: ExtractionWorkflow and ProgressStream must exist
2. **Match.typeTags**: MUST use for exhaustive state handling (compile-time safety)
3. **PubSub for events**: Decoupled SSE delivery, not direct emission
4. **Entity resolution timing**: IncrementalClusterer AFTER all documents complete
5. **Effect patterns**: Namespace imports, tagged errors, Layer composition
6. **Failure policies**: `S.Literal("continue-on-failure", "abort-all", "retry-failed")`

### Context Budget Tracking

Monitor during Phase 3:
- After 3A (state machine): If tool calls >10 or file reads >2, create checkpoint before 3B
- After codebase-researcher: Count as 1 delegation toward budget regardless of internal complexity
- If total sub-agent delegations reach 6, create checkpoint and assess remaining work

### Reference Files

**CRITICAL**: 7 reference files listed below exceed the 3-file threshold. Delegate to `codebase-researcher` before starting implementation.

**Phase 2 deliverables** (to build on):
- `server/src/Workflow/ExtractionWorkflow.ts` -- workflow orchestrator to coordinate
- `server/src/Workflow/ProgressStream.ts` -- SSE progress emission via Effect.PubSub
- `server/src/Workflow/DurableActivities.ts` -- checkpoint/replay pattern for stages
- `server/src/Workflow/WorkflowPersistence.ts` -- SQL CRUD for execution + activity records
- `server/src/LlmControl/RateLimiter.ts` -- CentralRateLimiterService (CircuitBreaker + RateLimiter + Semaphore)
- `tables/src/tables/workflow-execution.table.ts` -- workflow state persistence
- `domain/src/value-objects/WorkflowState.value.ts` -- WorkflowExecutionStatus, WorkflowActivityStatus, WorkflowType
- `domain/src/errors/Workflow.errors.ts` -- WorkflowNotFoundError, ActivityFailedError, WorkflowStateError

**Entity resolution** (for post-batch wiring):
- `server/src/EntityResolution/IncrementalClustererLive.ts`
- `server/src/EntityResolution/SameAsLinker.ts`

**Table patterns**: `tables/src/tables/entity.table.ts` (OrgTable.make pattern)

**Full context**: `outputs/CONTEXT_DOCUMENT.md`, `outputs/IMPLEMENTATION_ROADMAP.md` Phase 2

### Verification

```bash
bun run check --filter @beep/knowledge-domain
bun run check --filter @beep/knowledge-tables
bun run check --filter @beep/knowledge-server
bun run lint:fix --filter @beep/knowledge-server
bun test packages/knowledge/server/test/Workflow/BatchStateMachine.test.ts
bun test packages/knowledge/server/test/Workflow/BatchOrchestrator.test.ts
# SSE verification (manual): curl -N http://localhost:3000/api/knowledge/extraction/progress/<batchId>
```

### Success Criteria

- [ ] All state transitions validated (invalid transitions rejected with tagged error)
- [ ] `Match.typeTags` ensures exhaustive handling (TypeScript compile error if missing state)
- [ ] SSE endpoint streams real-time progress events
- [ ] State machine integrates with durable workflow activities
- [ ] Batch of N documents processed with aggregate progress
- [ ] Configurable concurrency (M documents in parallel)
- [ ] `continue-on-failure` processes remaining documents
- [ ] `abort-all` stops on first failure
- [ ] Cross-document entity resolution runs after all extractions complete
- [ ] Type check passes
- [ ] Tests pass
- [ ] `REFLECTION_LOG.md` updated

### Handoff Document

Read full context in: `specs/knowledge-ontology-comparison/handoffs/HANDOFF_P3.md`

### Next Phase

After Phase 3:
1. Update `REFLECTION_LOG.md` with learnings
2. Create `handoffs/HANDOFF_P4.md` (context document)
3. Create `handoffs/P4_ORCHESTRATOR_PROMPT.md` (copy-paste prompt)
4. Phase 4 (Semantic Enrichment) may already be in progress. Phase 5 (Infrastructure Polish) can proceed independently.
