# Knowledge Workflow Durability (Phase 3)

> Integrate @effect/workflow and @effect/cluster for durable extraction pipelines with SSE progress streaming.

---

## Status

**PLANNED** - Parallel track implementation (depends on Phase -1, parallel with Phases 0-2)

---

> **CRITICAL: Follow effect-ontology Patterns**
>
> This spec uses the **actual** `@effect/workflow` and `@effect/cluster` packages.
> Do NOT create custom persistence tables - `@effect/cluster` auto-creates its tables.
>
> **Reference Implementation**: `.repos/effect-ontology/packages/@core-v2/`
>
> **Key Files to Study**:
> - `src/Runtime/Persistence/PostgresLayer.ts` - PostgreSQL persistence via @effect/cluster
> - `src/Workflow/DurableActivities.ts` - Activity.make patterns
> - `src/Service/WorkflowOrchestrator.ts` - Workflow.make and WorkflowEngine usage
> - `src/Runtime/ClusterRuntime.ts` - SingleRunner layer composition
> - `src/Cluster/ExtractionEntity.ts` - Entity.make with RPC definitions

---

## Purpose

This specification implements durable workflow execution for the knowledge extraction pipeline using `@effect/workflow` and `@effect/cluster`. The current ExtractionPipeline runs as a single Effect - if it fails mid-extraction, all progress is lost. This phase adds:

1. **Durable activities** via `Activity.make` from `@effect/workflow`
2. **Workflow engine** via `WorkflowEngine` from `@effect/workflow`
3. **PostgreSQL persistence** via `SqlMessageStorage` and `SqlRunnerStorage` from `@effect/cluster`
4. **SSE progress streaming** for real-time updates
5. **Cross-batch orchestration** for entity resolution coordination

---

## Required Dependencies

**MUST add these packages to `packages/knowledge/server/package.json`:**

```json
{
  "dependencies": {
    "@effect/workflow": "^0.15.x",
    "@effect/cluster": "^0.55.x"
  }
}
```

**Note**: Tables are auto-created by `@effect/cluster`. Do NOT create custom workflow tables.

---

## Architecture Overview

### Package Architecture

```
@effect/workflow
├── Workflow.make        # Define workflows with typed payload/success/error
├── Activity             # Durable activities (journaled for crash recovery)
└── WorkflowEngine       # Execute, poll, interrupt, resume workflows

@effect/cluster
├── SingleRunner         # Single-node durable execution
├── SqlMessageStorage    # PostgreSQL message persistence (auto-creates tables)
├── SqlRunnerStorage     # PostgreSQL runner registration (auto-creates tables)
└── ShardingConfig       # Cluster configuration
```

### How @effect/cluster Creates Tables

`@effect/cluster` automatically creates these tables with a configurable prefix:

```sql
-- Tables created by SqlMessageStorage.layerWith({ prefix: "knowledge_" })
knowledge_cluster_messages   -- Pending workflow messages
knowledge_cluster_replies    -- Message replies

-- Tables created by SqlRunnerStorage.layerWith({ prefix: "knowledge_" })
knowledge_cluster_runners    -- Runner registration
```

**Do NOT manually create these tables** - they are managed by `@effect/cluster`.

---

## Implementation Phases

### Phase 1: @effect/workflow + @effect/cluster Integration

**Goal**: Wire up `@effect/workflow` and `@effect/cluster` with PostgreSQL persistence.

**Tasks**:
1. Add `@effect/workflow` and `@effect/cluster` dependencies
2. Create `PostgresLayer.ts` - persistence layer using `SqlMessageStorage` and `SqlRunnerStorage`
3. Create `ClusterRuntime.ts` - `SingleRunner` layer composition
4. Verify tables are auto-created by running the server

**Reference**: `.repos/effect-ontology/packages/@core-v2/src/Runtime/Persistence/PostgresLayer.ts`

```typescript
// Example from effect-ontology - DO NOT create custom tables
import { ShardingConfig, SqlMessageStorage, SqlRunnerStorage } from "@effect/cluster"
import { PgClient } from "@effect/sql-pg"

// Tables are auto-created by these layers
export const MessageStorageLive = SqlMessageStorage.layerWith({ prefix: "knowledge_" })
export const RunnerStorageLive = SqlRunnerStorage.layerWith({ prefix: "knowledge_" })

export const PostgresPersistenceLive = Layer.mergeAll(
  MessageStorageLive,
  RunnerStorageLive
).pipe(
  Layer.provide(ShardingConfigLive),
  Layer.provide(PgClientLive)
)
```

### Phase 2: ExtractionWorkflow Definition + Durable Activities

**Goal**: Define the extraction workflow and convert pipeline stages to durable activities.

**Tasks**:
1. Create `ExtractionWorkflow.ts` using `Workflow.make`
2. Create `DurableActivities.ts` using `Activity` from `@effect/workflow`
3. Create `WorkflowOrchestrator.ts` service for high-level API
4. Wire workflow layer with `BatchExtractionWorkflow.toLayer`

**Reference**: `.repos/effect-ontology/packages/@core-v2/src/Service/WorkflowOrchestrator.ts`

```typescript
// Example from effect-ontology
import { Workflow, WorkflowEngine } from "@effect/workflow"

export const BatchExtractionWorkflow = Workflow.make({
  name: "batch-extraction",
  payload: BatchWorkflowPayload,
  success: BatchState,
  error: Schema.String,
  idempotencyKey: (payload) => `${payload.batchId}-${hash}`,
  annotations: Context.make(Workflow.SuspendOnFailure, true),
  suspendedRetrySchedule: Schedule.exponential("1 second").pipe(
    Schedule.compose(Schedule.recurs(5)),
    Schedule.jittered
  )
})

// Register workflow with engine
export const BatchExtractionWorkflowLayer = BatchExtractionWorkflow.toLayer(
  (payload) => Effect.gen(function*() {
    // ... workflow implementation using durable activities
  })
)
```

### Phase 3: SSE Progress Streaming

**Goal**: Implement real-time progress updates via Server-Sent Events.

**Tasks**:
1. Define progress event schema in `Contract/ProgressStreaming.ts`
2. Implement progress state persistence via `StorageService`
3. Create SSE endpoint in HTTP router
4. Connect workflow stages to progress events

### Phase 4: Batch State Machine + Cross-Batch Orchestration

**Goal**: Implement batch lifecycle management and entity resolution coordination.

**Tasks**:
1. Define `BatchState` tagged union (Pending | Preprocessing | Extracting | Resolving | Validating | Ingesting | Complete | Failed)
2. Implement state transitions in workflow
3. Create cross-batch entity resolution activity
4. Implement batch retry and recovery

---

## Key Files to Create

```
packages/knowledge/server/src/
├── Runtime/
│   ├── Persistence/
│   │   └── PostgresLayer.ts       # @effect/cluster persistence (SqlMessageStorage, SqlRunnerStorage)
│   └── ClusterRuntime.ts          # SingleRunner layer composition
├── Workflow/
│   ├── index.ts                   # Public exports
│   ├── ExtractionWorkflow.ts      # Workflow.make definition
│   ├── DurableActivities.ts       # Activity implementations
│   └── WorkflowOrchestrator.ts    # High-level workflow API service
├── Contract/
│   └── ProgressStreaming.ts       # SSE progress event schemas
└── Cluster/
    ├── ExtractionEntity.ts        # Entity.make with RPC definitions (optional)
    └── ExtractionEntityHandler.ts # Entity handler implementation (optional)

packages/knowledge/domain/src/
└── Schema/
    ├── BatchWorkflow.ts           # BatchState, BatchWorkflowPayload
    └── ProgressEvent.ts           # Progress event schemas
```

**Note**: No custom table files needed - `@effect/cluster` manages persistence tables automatically.

---

## Critical Patterns from effect-ontology

### 1. Workflow Definition Pattern

```typescript
import { Workflow } from "@effect/workflow"
import { Context, Schema, Schedule } from "effect"

export const ExtractionWorkflow = Workflow.make({
  name: "knowledge-extraction",
  payload: ExtractionPayload,           // Schema for workflow input
  success: ExtractionResult,            // Schema for success output
  error: Schema.String,                 // Schema for error output
  idempotencyKey: (payload) => payload.documentId,
  annotations: Context.make(Workflow.SuspendOnFailure, true).pipe(
    Context.add(Workflow.CaptureDefects, true)
  ),
  suspendedRetrySchedule: Schedule.exponential("1 second").pipe(
    Schedule.compose(Schedule.recurs(5)),
    Schedule.jittered
  )
})
```

### 2. Durable Activity Pattern (CORRECT API)

```typescript
import { Activity } from "@effect/workflow"
import { Effect, Schedule, Schema } from "effect"

// Activity factory function - input captured in closure, NOT passed to execute
export const makeExtractEntitiesActivity = (input: { text: string; ontologyId: string }) =>
  Activity.make({
    name: `extract-entities-${input.ontologyId}`,  // Unique per invocation
    success: Schema.Array(EntitySchema),            // Schema (not "output")
    error: ActivityErrorSchema,                     // Schema (not just Schema.String)
    execute: Effect.gen(function*() {
      // input is captured in closure - NOT passed as parameter
      const extractor = yield* EntityExtractor
      return yield* extractor.extract(input.text, input.ontologyId)
    }),
    interruptRetryPolicy: Schedule.exponential("1 second").pipe(
      Schedule.jittered,
      Schedule.compose(Schedule.recurs(3))
    )
  })

// Usage in workflow: factory(input).execute
const entities = yield* makeExtractEntitiesActivity({ text, ontologyId }).execute
```

### 3. Workflow Orchestrator Pattern

```typescript
import { WorkflowEngine } from "@effect/workflow"
import { Effect } from "effect"

export const makeWorkflowOrchestrator = Effect.gen(function*() {
  const engine = yield* WorkflowEngine.WorkflowEngine

  return {
    start: (payload) => Effect.gen(function*() {
      const executionId = yield* ExtractionWorkflow.executionId(payload)
      return yield* engine.execute(ExtractionWorkflow, {
        executionId,
        payload,
        discard: true  // fire-and-forget
      })
    }),

    startAndWait: (payload) => Effect.gen(function*() {
      const executionId = yield* ExtractionWorkflow.executionId(payload)
      return yield* engine.execute(ExtractionWorkflow, {
        executionId,
        payload,
        discard: false
      })
    }),

    poll: (executionId) => engine.poll(ExtractionWorkflow, executionId),
    interrupt: (executionId) => engine.interrupt(ExtractionWorkflow, executionId),
    resume: (executionId) => engine.resume(ExtractionWorkflow, executionId)
  }
})
```

### 4. PostgreSQL Persistence Layer

```typescript
import { ShardingConfig, SqlMessageStorage, SqlRunnerStorage } from "@effect/cluster"
import { PgClient } from "@effect/sql-pg"

// Tables auto-created: knowledge_cluster_messages, knowledge_cluster_replies, knowledge_cluster_runners
export const MessageStorageLive = SqlMessageStorage.layerWith({ prefix: "knowledge_" })
export const RunnerStorageLive = SqlRunnerStorage.layerWith({ prefix: "knowledge_" })
export const ShardingConfigLive = ShardingConfig.layerDefaults

export const PostgresPersistenceLive = Layer.mergeAll(
  MessageStorageLive,
  RunnerStorageLive
).pipe(
  Layer.provide(ShardingConfigLive),
  Layer.provide(PgClientLive)
)
```

---

## Success Criteria

### Implementation Criteria
- [ ] `@effect/workflow` and `@effect/cluster` added as dependencies
- [ ] PostgreSQL persistence layer wired with `SqlMessageStorage` and `SqlRunnerStorage`
- [ ] Tables auto-created by `@effect/cluster` on server start
- [ ] `ExtractionWorkflow` defined using `Workflow.make`
- [ ] Durable activities defined using `Activity` from `@effect/workflow`
- [ ] `WorkflowOrchestrator` service implements start/poll/interrupt/resume
- [ ] SSE progress stream shows real-time updates
- [ ] Test: kill server mid-extraction, restart, extraction resumes from last checkpoint

### Integration Criteria
- [ ] Existing ExtractionPipeline continues working unchanged
- [ ] New ExtractionWorkflow can run in parallel with old pipeline
- [ ] Migration path documented for switching to workflow-based extraction
- [ ] Performance: workflow overhead < 10% compared to direct pipeline

---

## Anti-Patterns to Avoid

### DO NOT create custom persistence tables

```typescript
// WRONG - Do NOT do this
export const workflowExecution = OrgTable.make(WorkflowExecutionId)({
  workflowType: pg.text("workflow_type").notNull(),
  status: pg.text("status").notNull(),
  // ...
})
```

### DO NOT create custom WorkflowPersistence service

```typescript
// WRONG - Do NOT do this
export class WorkflowPersistence extends Effect.Service<WorkflowPersistence>()(...) {
  insertExecution: (...) => ...
  updateExecution: (...) => ...
}
```

### DO use @effect/cluster's built-in persistence

```typescript
// CORRECT - Use @effect/cluster
import { SqlMessageStorage, SqlRunnerStorage } from "@effect/cluster"

export const MessageStorageLive = SqlMessageStorage.layerWith({ prefix: "knowledge_" })
export const RunnerStorageLive = SqlRunnerStorage.layerWith({ prefix: "knowledge_" })
```

---

## Timeline

**Duration**: 3-4 weeks

| Week | Focus |
|------|-------|
| 1 | @effect/workflow + @effect/cluster integration (P1) |
| 2 | ExtractionWorkflow definition + durable activities (P2) |
| 3 | SSE progress streaming (P3) |
| 4 | Batch state machine + cross-batch orchestration (P4) |

---

## Related Documentation

- **[effect-ontology reference](.repos/effect-ontology/)** - CANONICAL patterns for @effect/workflow and @effect/cluster
- **[LESSONS_FROM_PRIOR_SPECS.md](LESSONS_FROM_PRIOR_SPECS.md)** - Critical patterns from completed specs
- [REFLECTION_LOG.md](REFLECTION_LOG.md) - Session learnings
- [Effect Patterns](../../.claude/rules/effect-patterns.md) - Mandatory patterns
- [knowledge-ontology-comparison](../knowledge-ontology-comparison/) - Source spec
- [knowledge-architecture-foundation](../../completed/knowledge-architecture-foundation/) - Package allocation
- [KNOWLEDGE_LESSONS_LEARNED.md](../KNOWLEDGE_LESSONS_LEARNED.md) - Lessons from all knowledge specs
