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

- Workflow persistence tables (workflow-execution, workflow-activity, workflow-signal)
- WorkflowService abstraction wrapping @effect/workflow runtime
- ExtractionWorkflow definition with durable activities
- SSE progress streaming for real-time updates
- Batch state machine for orchestrating multiple extractions

---

## Critical Context

| Attribute | Value |
|-----------|-------|
| **Complexity** | High (51 points) |
| **Phases** | 4 |
| **Sessions** | 12-16 estimated (3-4 weeks) |
| **Success Metric** | Extraction survives server restart and resumes from last checkpoint |
| **Tech** | @effect/workflow + PostgreSQL persistence |
| **Cross-Package** | Knowledge tables + server + domain |

---

## Phase Overview

| Phase | Name | Description | Status |
|-------|------|-------------|--------|
| **P1** | Workflow Integration | @effect/workflow runtime + PostgreSQL persistence tables | Pending |
| **P2** | ExtractionWorkflow Definition | Durable activities for each extraction stage | Pending |
| **P3** | SSE Progress Streaming | Real-time progress events via Server-Sent Events | Pending |
| **P4** | Batch State Machine | Cross-batch orchestration and retry logic | Pending |

---

## Quick Decision Tree

```
START
  |
  +-- Do workflow-execution tables exist?
  |     +-- NO -> Start Phase 1 (Workflow Integration)
  |     +-- YES -> Does WorkflowService compile?
  |           +-- NO -> Continue Phase 1
  |           +-- YES -> Does ExtractionWorkflow exist?
  |                 +-- NO -> Start Phase 2 (Workflow Definition)
  |                 +-- YES -> Check handoffs/HANDOFF_P[N].md
```

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
| `@effect/workflow` | Durable workflow execution runtime |
| PostgreSQL | Workflow state persistence |
| Drizzle ORM | Table definitions |
| Effect Schema | Type-safe schemas |
| SSE (Server-Sent Events) | Real-time progress streaming |

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

### Effect Workflow Usage

```typescript
import * as Effect from "effect/Effect";
import { Workflow } from "@effect/workflow";

const ExtractionWorkflow = Workflow.make({
  name: "ExtractionWorkflow",
  execute: Effect.gen(function* () {
    const chunks = yield* ChunkTextActivity.execute(input);
    const mentions = yield* ExtractMentionsActivity.execute(chunks);
    const entities = yield* ClassifyEntitiesActivity.execute(mentions);
    const relations = yield* ExtractRelationsActivity.execute(chunks, entities);
    return yield* AssembleGraphActivity.execute(entities, relations);
  }),
});
```

### Durable Activity Pattern

```typescript
const ChunkTextActivity = Activity.make({
  name: "chunk-text",
  execute: (input: DocumentInput) =>
    Effect.gen(function* () {
      const chunker = yield* ChunkingService;
      const chunks = yield* chunker.chunk(input.text);
      // Checkpoint: chunks persisted to database
      return chunks;
    }),
});
```

### SSE Progress Pattern

```typescript
const progressStream = Workflow.signal({
  name: "progress",
  handler: (event: ProgressEvent) =>
    Effect.gen(function* () {
      const sse = yield* SSEService;
      yield* sse.send(event);
    }),
});
```

---

## Context Documents

| Document | Purpose |
|----------|---------|
| [README.md](./README.md) | Full spec with detailed phase breakdown |
| [MASTER_ORCHESTRATION.md](./MASTER_ORCHESTRATION.md) | Phase workflows and agent delegation |
| [AGENT_PROMPTS.md](./AGENT_PROMPTS.md) | Specialized prompts for agents |
| [REFLECTION_LOG.md](./REFLECTION_LOG.md) | Cumulative learnings |
| [handoffs/HANDOFF_P1.md](./handoffs/HANDOFF_P1.md) | Phase 1 context (when created) |

---

## Starting Phase 1

1. Read the orchestrator prompt: `handoffs/P1_ORCHESTRATOR_PROMPT.md`
2. Read full context: `handoffs/HANDOFF_P1.md`
3. Add EntityIds to `@beep/knowledge-domain`: WorkflowExecutionId, WorkflowActivityId, WorkflowSignalId
4. Create workflow tables in `@beep/knowledge-tables`
5. Implement WorkflowService in `@beep/knowledge-server`
6. Verify with `bun run check --filter @beep/knowledge-*`
7. Update `REFLECTION_LOG.md`
8. Create handoffs for P2

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

- Full spec: [README.md](./README.md)
- Master orchestration: [MASTER_ORCHESTRATION.md](./MASTER_ORCHESTRATION.md)
- Agent prompts: [AGENT_PROMPTS.md](./AGENT_PROMPTS.md)
- Effect patterns: `.claude/rules/effect-patterns.md`
- Database patterns: `documentation/patterns/database-patterns.md`
- Testing patterns: `.claude/commands/patterns/effect-testing-patterns.md`
