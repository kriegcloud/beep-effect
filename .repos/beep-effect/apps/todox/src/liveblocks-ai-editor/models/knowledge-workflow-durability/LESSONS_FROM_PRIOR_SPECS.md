# Lessons from Prior Knowledge Specs

> **Purpose**: Critical insights from completed knowledge specs to prevent repeating mistakes.

---

## Quick Reference

**Full Document**: [`specs/KNOWLEDGE_LESSONS_LEARNED.md`](../KNOWLEDGE_LESSONS_LEARNED.md)

**Relevant Completed Specs**:
- `knowledge-rdf-foundation` (179 tests, 3 phases)
- `knowledge-sparql-integration` (73 tests, 2 phases)
- `knowledge-reasoning-engine` (scaffolding complete)
- `knowledge-graphrag-plus` (Phases 1-2 complete)

---

## Critical Patterns for Workflow Durability

### 1. Study effect-ontology Patterns FIRST

**Action**: Before Phase 1, deep dive into:
- `effect-ontology: Service/WorkflowOrchestrator.ts` - Workflow definition patterns
- `effect-ontology: Runtime/Persistence/PostgresLayer.ts` - Persistence adapter
- `effect-ontology: Domain/Workflow/ExtractionWorkflow.ts` - Activity boundaries

**Effort**: 1 day research investment prevents 1 week of rework.

---

### 2. Activity Boundary Decision Matrix (REQUIRED)

Before converting ExtractionPipeline, document activity boundaries:

| Current Pipeline Stage | Activity? | Rationale |
|------------------------|-----------|-----------|
| ChunkText | ✅ Yes | Expensive, checkpoint after all chunks created |
| ExtractMentions (per-chunk) | ✅ Yes | LLM call, checkpoint per chunk for recovery |
| ClassifyEntities (batch) | ✅ Yes | LLM call, checkpoint per batch |
| ExtractRelations (per-chunk) | ✅ Yes | LLM call, checkpoint per chunk |
| AssembleGraph | ✅ Yes | Final stage, checkpoint before completion |

**Decision Criteria**:
- **Activity**: Long-running (>1s), external I/O (LLM, DB), needs checkpointing
- **Helper**: Fast (<100ms), pure computation, internal logic

**Reference**: `packages/knowledge/server/src/Extraction/ExtractionPipeline.ts` - Current implementation to convert

---

### 3. Migration Feature Flag Pattern

**REQUIRED**: Add gradual migration path, don't force immediate cutover.

```typescript
export const extract = (input: ExtractionInput) =>
  Effect.gen(function* () {
    const config = yield* ExtractionConfig;

    if (config.useWorkflowExecution) {
      // New path: durable workflow
      return yield* WorkflowClient.start(ExtractionWorkflow, input);
    } else {
      // Old path: transient pipeline
      return yield* ExtractionPipeline.execute(input);
    }
  });
```

**Benefits**:
- Gradual rollout in production
- A/B testing capability
- Easy rollback if issues discovered

**Evidence**: Ontology comparison roadmap emphasizes backward compatibility.

---

### 4. SSE Progress Schema Early (Phase 1, NOT Phase 3)

**Anti-Pattern**: Deferring schema design until UI integration → causes rework.

**Correct Pattern**: Define progress event schema in Phase 1.

```typescript
export class ExtractionProgress extends S.Class<ExtractionProgress>()(
  "ExtractionProgress",
  {
    workflowId: S.String,
    stage: S.Literal(
      "chunking",
      "extracting_mentions",
      "classifying_entities",
      "extracting_relations",
      "assembling_graph",
      "completed",
      "failed"
    ),
    progress: S.Number.pipe(S.greaterThanOrEqualTo(0), S.lessThanOrEqualTo(1)),
    currentItem: S.optional(S.String),
    totalItems: S.optional(S.Number),
    error: S.optional(S.String),
  }
) {}
```

**Rationale**: Early schema definition prevents Phase 3 refactoring.

**Evidence**: GraphRAG defined schemas in Phase 1, avoided Phase 3 changes.

---

### 5. State Machine as Helper Module (NOT Service)

**Decision**: State transitions are pure functions, not Effect.Service.

```typescript
// Helper module (NOT service)
export const transitionBatchState = (
  current: BatchState,
  event: BatchEvent
): BatchState => {
  return Match.value(current).pipe(
    Match.when("queued", () =>
      Match.value(event).pipe(
        Match.when("start", () => "processing" as const),
        Match.orElse(() => current)
      )
    ),
    Match.when("processing", () =>
      Match.value(event).pipe(
        Match.when("complete", () => "completed" as const),
        Match.when("fail", () => "failed" as const),
        Match.orElse(() => current)
      )
    ),
    // ... other states
  );
};
```

**Rationale**: State machine logic is pure, testable without Layer composition.

**Evidence**: SPARQL FilterEvaluator is helper module, not service.

---

### 6. Performance Baseline Early (REQUIRED)

**Action**: In Phase 1, benchmark workflow overhead before implementing all activities.

**Target**: <10% overhead for workflow durability.

```typescript
import { live } from "@beep/testkit";

live()("workflow overhead", () =>
  Effect.gen(function* () {
    // Measure direct pipeline
    const startDirect = yield* Effect.clockWith(c => c.currentTimeMillis);
    yield* ExtractionPipeline.execute(testInput);
    const endDirect = yield* Effect.clockWith(c => c.currentTimeMillis);
    const directTime = endDirect - startDirect;

    // Measure workflow
    const startWorkflow = yield* Effect.clockWith(c => c.currentTimeMillis);
    yield* WorkflowClient.execute(ExtractionWorkflow, testInput);
    const endWorkflow = yield* Effect.clockWith(c => c.currentTimeMillis);
    const workflowTime = endWorkflow - startWorkflow;

    const overhead = (workflowTime - directTime) / directTime;
    assert(overhead < 0.1, `Overhead ${overhead * 100}% exceeds 10% target`);
  })
);
```

**Evidence**: RDF foundation established performance baselines early, caught regressions.

---

### 7. Library Type Conversion Layer for @effect/workflow

**Pattern**: Isolate @effect/workflow persistence types from domain types.

```typescript
// Domain types (library-agnostic)
export type WorkflowState = {
  workflowId: string;
  stage: ExtractionStage;
  checkpointData: unknown;
};

// Conversion functions at service boundary
const toWorkflowPersistence = (state: WorkflowState): Workflow.PersistenceState => {
  return {
    id: state.workflowId,
    data: JSON.stringify(state.checkpointData),
    // ... other workflow-specific fields
  };
};

const fromWorkflowPersistence = (persisted: Workflow.PersistenceState): WorkflowState => {
  return {
    workflowId: persisted.id,
    stage: parseStage(persisted.data),
    checkpointData: JSON.parse(persisted.data),
  };
};
```

**Benefits**:
- Domain types never leak workflow library details
- Future migration to alternative workflow engine changes only converters
- Clear API surface for consumers

**Evidence**: RDF foundation ~200 lines of conversion functions, zero library type leakage.

---

## Test Layer Patterns (CRITICAL)

### Shared Dependency Pattern

**Use Case**: Activity tests will share workflow persistence layer.

```typescript
// Activity A depends on WorkflowPersistence
const ActivityALayer = Layer.effect(ActivityA, Effect.gen(function* () {
  const persistence = yield* WorkflowPersistence;
  return { /* A implementation using persistence */ };
}));

// Activity B also depends on WorkflowPersistence
const ActivityBLayer = Layer.effect(ActivityB, Effect.gen(function* () {
  const persistence = yield* WorkflowPersistence;
  return { /* B implementation using persistence */ };
}));

// Test layer: Activities share SAME WorkflowPersistence instance
const TestLayer = Layer.provideMerge(
  Layer.merge(ActivityALayer, ActivityBLayer),
  WorkflowPersistence.Default
);
```

**Critical**: Without `provideMerge`, each activity gets separate persistence instance → tests break.

**Evidence**: All completed specs use this pattern for shared mutable dependencies.

---

## Anti-Patterns to Avoid

### ❌ Using bun:test with Manual Effect.runPromise

**WRONG**:
```typescript
import { test } from "bun:test";

test("activity checkpoints", async () => {
  await Effect.gen(function* () {
    const result = yield* activity.execute(input);
  }).pipe(Effect.provide(TestLayer), Effect.runPromise);
});
```

**CORRECT**:
```typescript
import { effect } from "@beep/testkit";

effect("activity checkpoints", () =>
  Effect.gen(function* () {
    const result = yield* activity.execute(input);
  }).pipe(Effect.provide(TestLayer))
);
```

**Why**: `@beep/testkit` provides TestClock/TestRandom, consistent error reporting, `layer()` runner.

---

### ❌ Premature Service Creation

**WRONG**:
```typescript
// State transition logic as service
export class StateTransitioner extends Effect.Service<StateTransitioner>()(
  "StateTransitioner",
  {
    accessors: true,
    effect: Effect.succeed({
      transition: (current: State, event: Event) => /* logic */
    })
  }
) {}
```

**CORRECT**:
```typescript
// Just export the pure function
export const transition = (current: State, event: Event): State => /* logic */;
```

**Decision Criteria**: Use services for stateful/I/O operations, helpers for pure logic.

---

### ❌ Native Array/String Methods

**WRONG**:
```typescript
const stages = activities.map(a => a.stage);
const sorted = stages.sort();
```

**CORRECT**:
```typescript
import * as A from "effect/Array";
const stages = A.map(activities, a => a.stage);
const sorted = A.sort(stages, Order.string);
```

**Enforcement**: Lint rules catch native methods, remediation required.

---

## Verification Checklist

Before declaring Phase 1 complete:

- [ ] Activity boundary decision matrix documented
- [ ] SSE progress schema defined
- [ ] Performance baseline established (<10% overhead target)
- [ ] Library type conversion layer implemented
- [ ] Test layers use `Layer.provideMerge` for shared persistence
- [ ] All tests use `@beep/testkit` (no `bun:test` with `runPromise`)
- [ ] All services use `Effect.Service` with `accessors: true`
- [ ] State machine uses helper functions (not service)
- [ ] Migration feature flag implemented

---

## Phase Completion Gate (MANDATORY)

Phase N is NOT complete until:

- [ ] Phase work implemented and verified (`bun run check`)
- [ ] REFLECTION_LOG.md updated with phase learnings
- [ ] `handoffs/HANDOFF_P[N+1].md` created (full context document)
- [ ] `handoffs/P[N+1]_ORCHESTRATOR_PROMPT.md` created (copy-paste prompt)
- [ ] Both handoff files pass verification checklist

**Evidence**: All completed multi-phase specs have handoff documents enabling clean session transitions.

---

## Additional Resources

- **Full Lessons Document**: [`specs/KNOWLEDGE_LESSONS_LEARNED.md`](../KNOWLEDGE_LESSONS_LEARNED.md)
- **Pattern Library**: Section in lessons document with 5 reusable patterns
- **Anti-Patterns**: Section with 6 approaches to avoid
- **Testing Strategies**: Test runner selection matrix, mock patterns
- **Error Handling**: Domain error placement, tagged error patterns

**Reading Order**:
1. This document (quick reference)
2. Full lessons document (comprehensive details)
3. Relevant REFLECTION_LOG.md from completed specs
4. Implementation ROADMAP from ontology comparison
