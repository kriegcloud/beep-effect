# Phase 2 Orchestrator Prompt

> **Full Context:** [HANDOFF_P2.md](./HANDOFF_P2.md) | **Roadmap:** [IMPLEMENTATION_ROADMAP.md](../outputs/IMPLEMENTATION_ROADMAP.md)

Copy-paste this prompt to start Phase 2 implementation.

---

## Prompt

You are implementing Phase 2 of the `knowledge-ontology-comparison` spec: **Workflow Durability + Resilience**.

### Context

Phase 1 (Research) is complete. All 4 deliverables are in `specs/knowledge-ontology-comparison/outputs/`. This phase implements the 3 P0 gaps and 2 P2 gaps for workflow durability and LLM resilience.

The knowledge slice is at `packages/knowledge/`. The existing ExtractionPipeline at `server/src/Extraction/ExtractionPipeline.ts` runs as a single Effect.gen block. This phase makes it crash-recoverable.

### Your Mission

Implement workflow durability in 5 sub-tasks (2B split for checkpoint safety):

| Sub-Task | Gap | Priority | Days | Deliverable |
|----------|-----|----------|------|-------------|
| 2A: Workflow Tables | #3 | P0 | 1-4 | 3 Drizzle table files + schema registration |
| 2Ba: Durable Activities | #1 pt1 | P0 | 5-15 | DurableActivities.ts + WorkflowPersistence.ts + domain VOs |
| 2Bb: Workflow Integration | #1 pt2 | P0 | 16-25 | ExtractionWorkflow.ts + ProgressStream.ts + pipeline refactor |
| 2C: CircuitBreaker | #11 | P2 | 26-27 | CircuitBreaker.ts + EmbeddingService integration |
| 2D: Rate Limiting | #12 | P2 | 28-29 | RateLimiter.ts + Semaphore integration |

### Delegation Protocol

Orchestrator MUST delegate ALL implementation work. If reading >3 reference files, delegate to `codebase-researcher`.

| Sub-Task | Delegate To | Input | Expected Output |
|----------|-------------|-------|-----------------|
| Research @effect/workflow API | `mcp-researcher` or `web-researcher` | "effect workflow persistence patterns" | API summary in orchestrator context |
| 2A: Workflow tables | `effect-code-writer` | File specs from HANDOFF_P2.md 2A | 3 .table.ts files + index/schema/relations updates |
| 2Ba: Domain VOs | `domain-modeler` | workflow-state + extraction-progress specs | 2 value object files |
| 2Ba: Persistence adapter | `effect-code-writer` | Table schema + persistence spec | DurableActivities.ts + WorkflowPersistence.ts |
| 2Bb: Workflow definition | `effect-code-writer` | Activities + persistence adapter | ExtractionWorkflow.ts + ProgressStream.ts |
| 2Bb: Pipeline refactor | `effect-code-writer` | ExtractionPipeline + activities | Refactored pipeline with activity calls |
| 2C: CircuitBreaker | `effect-code-writer` | Retry schedule + state machine spec | CircuitBreaker.ts + integrations |
| 2D: RateLimiter | `effect-code-writer` | Semaphore config | RateLimiter.ts + integrations |
| Tests | `test-writer` | All impl files | test/Workflow/ + test/Resilience/ |
| Type fixes | `package-error-fixer` | Error output from `bun run check` | Type fixes across modified files |

**Sequencing**:
1. 2A MUST complete before 2Ba (activities need tables)
2. 2Ba MUST complete before 2Bb (workflow needs activities)
3. 2C can proceed in parallel with 2A/2Ba/2Bb (no dependencies)
4. 2D should follow 2C (they integrate together in EmbeddingService)

### Critical Patterns

**Pattern 1: OrgTable Factory**
```typescript
import { OrgTable } from "@beep/shared-tables";
export const workflowExecutionTable = OrgTable.make(KnowledgeEntityIds.WorkflowExecutionId)({
  workflowType: pg.text("workflow_type").notNull(),
  status: pg.text("status").notNull(),
  input: pg.jsonb("input"),
  output: pg.jsonb("output"),
  error: pg.text("error"),
});
```

**Pattern 2: EntityId Column Annotation**
```typescript
executionId: pg.text("execution_id").notNull()
  .$type<KnowledgeEntityIds.WorkflowExecutionId.Type>(),
```

**Pattern 3: Effect.Service Definition**
```typescript
export class WorkflowPersistence extends Effect.Service<WorkflowPersistence>()("WorkflowPersistence", {
  effect: Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;
    return { saveExecution: (exec) => Effect.gen(function* () { /* ... */ }) };
  }),
  dependencies: [SqlLive],
}) {}
```

### Critical Constraints

1. **Backward compatibility**: `ExtractionPipeline.run()` MUST continue working without workflow
2. **Effect patterns**: Namespace imports, tagged errors, Layer composition
3. **EntityId branding**: All ID columns MUST use `.$type<EntityId.Type>()`
4. **Table factories**: Use `OrgTable.make` for multi-tenant isolation
5. **No native JS**: Use Effect utilities for all array/string/record operations

### Context Budget Tracking

Monitor during Phase 2:
- After 2A (tables): If tool calls >8 or file reads >2, create checkpoint before 2Ba
- After 2Ba (activities): If sub-agent delegations >5, create checkpoint before 2Bb
- After 2Bb (workflow): Reset budget tracking for 2C/2D resilience work

### Reference Files

**CRITICAL**: If reading >3 files, delegate to `codebase-researcher`.

**Existing pipeline** (read to understand stage boundaries):
- `server/src/Extraction/ExtractionPipeline.ts` -- stage orchestration to preserve
- `server/src/Extraction/MentionExtractor.ts` -- stage implementation pattern

**Existing embedding** (add resilience wrappers):
- `server/src/Embedding/EmbeddingService.ts` -- wrap embed() with CB + RL
- `server/src/GraphRAG/GroundedAnswerGenerator.ts` -- wrap LLM calls with CB

**Table patterns** (follow for new tables):
- `tables/src/tables/entity.table.ts` -- OrgTable.make pattern
- `tables/src/tables/extraction.table.ts` -- JSONB columns, audit fields

**Full context**: `outputs/CONTEXT_DOCUMENT.md` (patterns), `outputs/IMPLEMENTATION_ROADMAP.md` (Phase 1 detail)

### Verification

```bash
bun run check --filter @beep/knowledge-tables
bun run check --filter @beep/knowledge-server
bun run lint:fix --filter @beep/knowledge-server
bun test packages/knowledge/server/test/Workflow/
bun test packages/knowledge/server/test/Resilience/
```

### Success Criteria

- [ ] 3 new workflow tables compile and generate valid migrations
- [ ] `_check.ts` passes for domain model alignment
- [ ] ExtractionWorkflow wraps stages as durable activities with checkpointing
- [ ] Extraction survives server restart at any stage (kill + restart test)
- [ ] Failed activities retry 3x with exponential backoff (configurable)
- [ ] CircuitBreaker opens after 5 consecutive failures, half-opens at 30s
- [ ] Rate limiter queues excess requests (20 concurrent, 5 permits = 15 queued)
- [ ] Existing `ExtractionPipeline.run()` works unchanged
- [ ] Type check passes
- [ ] Tests pass
- [ ] `REFLECTION_LOG.md` updated

### Handoff Document

Read full context in: `specs/knowledge-ontology-comparison/handoffs/HANDOFF_P2.md`

### Next Phase

After Phase 2:
1. Update `REFLECTION_LOG.md` with learnings
2. Create `handoffs/HANDOFF_P3.md` (context document)
3. Create `handoffs/P3_ORCHESTRATOR_PROMPT.md` (copy-paste prompt)
4. Phase 3 (State Management) depends on this. Phase 4 (Semantic Enrichment) can proceed in parallel.
