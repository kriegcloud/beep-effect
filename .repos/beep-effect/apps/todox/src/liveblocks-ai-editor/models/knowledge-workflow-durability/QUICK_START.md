# Quick Start: Knowledge Workflow Durability

> 5-minute triage guide for implementing durable workflow execution in the knowledge extraction pipeline.

---

## 5-Minute Triage

### Current State

The workflow durability spec is **PLANNED**. This spec adds @effect/workflow to the knowledge slice for durable, resumable extraction pipelines.

### What Exists

- ExtractionPipeline service in `@beep/knowledge-server/Extraction`
- Knowledge domain models: Entity, Relation, Extraction
- Knowledge tables: entity, relation, extraction
- Sample data in `specs/knowledge-ontology-comparison/sample-data/`

### What Needs Building

- PostgresLayer.ts for @effect/cluster persistence (tables auto-created by SqlMessageStorage/SqlRunnerStorage)
- ClusterRuntime.ts with SingleRunner layer composition
- WorkflowOrchestrator service wrapping WorkflowEngine
- ExtractionWorkflow definition with durable activities
- SSE progress streaming for real-time updates
- Batch state machine for orchestrating multiple extractions

**IMPORTANT**: Do NOT create custom persistence tables. `@effect/cluster` automatically creates:
- `knowledge_cluster_messages` - Pending workflow messages
- `knowledge_cluster_replies` - Message replies
- `knowledge_cluster_runners` - Runner registration

---

## Critical Context

| Attribute | Value |
|-----------|-------|
| **Complexity** | High (51 points) |
| **Phases** | 4 |
| **Sessions** | 12-16 estimated (3-4 weeks) |
| **Success Metric** | Extraction survives server restart and resumes from last checkpoint |
| **Tech** | @effect/workflow + @effect/cluster (auto-tables via SqlMessageStorage/SqlRunnerStorage) |
| **Cross-Package** | Knowledge server + domain (NO custom tables needed) |

---

## Phase Overview

| Phase | Name | Description | Status |
|-------|------|-------------|--------|
| **P1** | Workflow Integration | @effect/workflow + @effect/cluster runtime with auto-table persistence | Pending |
| **P2** | ExtractionWorkflow Definition | Durable activities for each extraction stage | Pending |
| **P3** | SSE Progress Streaming | Real-time progress events via Server-Sent Events | Pending |
| **P4** | Batch State Machine | Cross-batch orchestration and retry logic | Pending |

---

## Quick Decision Tree

```
START
  |
  +-- Does PostgresLayer.ts exist in Runtime/Persistence?
  |     +-- NO -> Start Phase 1 (Workflow Integration)
  |     +-- YES -> Does ClusterRuntime.ts compile?
  |           +-- NO -> Continue Phase 1
  |           +-- YES -> Does ExtractionWorkflow exist?
  |                 +-- NO -> Start Phase 2 (Workflow Definition)
  |                 +-- YES -> Check handoffs/HANDOFF_P[N].md
```

**Note**: Tables are auto-created by `@effect/cluster` on first use - don't check for tables manually.

---

## Quick Commands

```bash
# Type check knowledge packages
bun run check --filter @beep/knowledge-tables
bun run check --filter @beep/knowledge-server

# Generate database migration
bun run db:generate

# Run tests
bun run test --filter @beep/knowledge-server

# Lint and fix
bun run lint:fix
```

---

## Key Technologies

| Technology | Purpose |
|------------|---------|
| `@effect/workflow` | Durable workflow execution (Workflow.make, Activity) |
| `@effect/cluster` | SingleRunner, SqlMessageStorage, SqlRunnerStorage (auto-tables) |
| PostgreSQL / SQLite | Workflow state persistence (via @effect/cluster) |
| `@effect/sql-pg` | PostgreSQL client for production |
| Effect Schema | Type-safe schemas for workflow payload/success/error |
| SSE (Server-Sent Events) | Real-time progress streaming |

**Note**: Drizzle ORM is NOT used for workflow tables - @effect/cluster manages its own schema.

---

## Workflow Architecture

### ExtractionWorkflow Stages

1. **ChunkText** - Split document into chunks (durable checkpoint)
2. **ExtractMentions** - Extract entity mentions per chunk (parallel, durable)
3. **ClassifyEntities** - Classify entities with LLM (batched, durable)
4. **ExtractRelations** - Extract relations per chunk (parallel, durable)
5. **AssembleGraph** - Assemble final knowledge graph (durable checkpoint)

### Batch State Machine

```
[Queued] → [Processing] → [Completed]
             ↓
        [Failed] → [Retry] → [Processing]
             ↓
        [Abandoned]
```

---

## Critical Patterns

> **Reference**: `.repos/effect-ontology/packages/@core-v2/src/` for canonical patterns

### Workflow Definition Pattern (CORRECT API)

```typescript
import { Workflow } from "@effect/workflow"
import { Context, Schedule, Schema } from "effect"

// Workflow.make with typed payload/success/error schemas
export const ExtractionWorkflow = Workflow.make({
  name: "knowledge-extraction",
  payload: ExtractionPayloadSchema,      // Schema for input
  success: ExtractionResultSchema,       // Schema for success output
  error: Schema.String,                  // Schema for error output
  idempotencyKey: (payload) => payload.documentId,
  annotations: Context.make(Workflow.SuspendOnFailure, true).pipe(
    Context.add(Workflow.CaptureDefects, true)
  ),
  suspendedRetrySchedule: Schedule.exponential("1 second").pipe(
    Schedule.compose(Schedule.recurs(5)),
    Schedule.jittered
  )
})

// Register with WorkflowEngine via .toLayer
export const ExtractionWorkflowLayer = ExtractionWorkflow.toLayer(
  (payload) => Effect.gen(function*() {
    // Workflow implementation using durable activities
    const result = yield* makeChunkTextActivity({ documentId: payload.documentId }).execute
    // ... more stages
    return result
  })
)
```

### Durable Activity Pattern (CORRECT API)

```typescript
import { Activity } from "@effect/workflow"
import { Schema } from "effect"

// Activity factory function - input captured in closure
export const makeChunkTextActivity = (input: { documentId: string }) =>
  Activity.make({
    name: `chunk-text-${input.documentId}`,  // Unique per invocation
    success: ChunkOutputSchema,               // Schema (not "output")
    error: ActivityErrorSchema,               // Schema (not just Schema.String)
    execute: Effect.gen(function*() {
      const chunker = yield* ChunkingService
      const chunks = yield* chunker.chunk(input.documentId)
      return { chunks, durationMs: 100 }      // Must match success schema
    }),
    interruptRetryPolicy: Schedule.exponential("1 second").pipe(
      Schedule.jittered,
      Schedule.compose(Schedule.recurs(3))
    )
  })

// Usage in workflow: makeActivity(input).execute
const result = yield* makeChunkTextActivity({ documentId }).execute
```

### WorkflowOrchestrator Pattern

```typescript
import { WorkflowEngine } from "@effect/workflow"

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
    poll: (executionId) => engine.poll(ExtractionWorkflow, executionId),
    interrupt: (executionId) => engine.interrupt(ExtractionWorkflow, executionId),
    resume: (executionId) => engine.resume(ExtractionWorkflow, executionId)
  }
})
```

---

## Context Documents

| Document | Purpose |
|----------|---------|
| [README.md](README.md) | Full spec with detailed phase breakdown |
| [MASTER_ORCHESTRATION.md](MASTER_ORCHESTRATION.md) | Phase workflows and agent delegation |
| [AGENT_PROMPTS.md](AGENT_PROMPTS.md) | Specialized prompts for agents |
| [REFLECTION_LOG.md](REFLECTION_LOG.md) | Cumulative learnings |
| [handoffs/HANDOFF_P1.md](handoffs/HANDOFF_P1.md) | Phase 1 context (when created) |

---

## Starting Phase 1

1. Read the orchestrator prompt: `handoffs/P1_ORCHESTRATOR_PROMPT.md`
2. Read full context: `handoffs/HANDOFF_P1.md`
3. Install dependencies: `@effect/workflow` and `@effect/cluster` in `@beep/knowledge-server`
4. Create PostgresLayer.ts with SqlMessageStorage/SqlRunnerStorage (tables auto-created)
5. Create ClusterRuntime.ts with SingleRunner layer composition
6. Implement WorkflowOrchestrator service wrapping WorkflowEngine
7. Verify with `bun run check --filter @beep/knowledge-*`
8. Update `REFLECTION_LOG.md`
9. Create handoffs for P2

**Note**: Do NOT create custom Drizzle tables for workflow persistence. `@effect/cluster` auto-creates `knowledge_cluster_*` tables on first use via SqlMessageStorage/SqlRunnerStorage.

---

## Common Pitfalls

| Pitfall | Solution |
|---------|----------|
| Forgetting Effect patterns | Use `Effect.gen` + `yield*`, never async/await |
| Missing .$type<>() on table columns | Add .$type<EntityId.Type>() to all ID columns |
| Native JS methods | Use `A.map`, `A.filter` from `effect/Array` |
| Plain string IDs | Use branded EntityIds from `@beep/knowledge-domain` |
| Skipping handoffs | Create BOTH `HANDOFF_P[N+1].md` AND `P[N+1]_ORCHESTRATOR_PROMPT.md` |
| @effect/workflow API assumptions | Verify ALL API methods against library source before implementing |

---

## Success Metrics

### Functional Requirements

| Requirement | Phase | Verification |
|-------------|-------|--------------|
| Workflow state persisted | P1 | Workflow execution row in database |
| Extraction resumes after restart | P2 | Kill server mid-extraction, restart, verify continuation |
| Progress events streamed | P3 | SSE stream shows stage updates |
| Batch orchestration works | P4 | Multiple documents queued and processed |

### Non-Functional Requirements

| Requirement | Target | Phase |
|-------------|--------|-------|
| Workflow overhead | <10% vs direct pipeline | P2 |
| Checkpoint latency | <500ms per stage | P1 |
| SSE connection stability | >99% uptime | P3 |
| Batch throughput | >10 docs/min | P4 |

---

## Prerequisites

Before starting Phase 1:

- [ ] Phase -1 (Architecture Foundation) complete
- [ ] PostgreSQL running with knowledge database
- [ ] Drizzle migrations working
- [ ] @effect/workflow installed as dependency
- [ ] ExtractionPipeline service exists and works

---

## Need Help?

- Full spec: [README.md](README.md)
- Master orchestration: [MASTER_ORCHESTRATION.md](MASTER_ORCHESTRATION.md)
- Agent prompts: [AGENT_PROMPTS.md](AGENT_PROMPTS.md)
- Effect patterns: `.claude/rules/effect-patterns.md`
- Database patterns: `documentation/patterns/database-patterns.md`
- Testing patterns: `.claude/commands/patterns/effect-testing-patterns.md`
