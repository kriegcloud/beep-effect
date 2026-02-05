# Phase 2 Handoff: Workflow Durability + Resilience

**Date**: 2026-02-05
**From**: Phase 1 (Research & Analysis - Complete)
**To**: Phase 2 (Implementation - Workflow Durability)
**Status**: Ready for implementation
**Git Ref**: `0340358f49` (main, 2026-02-05)

---

## Mission

Implement crash-recoverable extraction workflows and protect LLM/embedding calls from cascade failures. This is the highest-priority production-readiness work identified by the ontology comparison research.

**Roadmap Reference**: `outputs/IMPLEMENTATION_ROADMAP.md` Phase 1 (Weeks 1-5)
**Gaps Addressed**: #1 (Durable Workflow), #3 (PostgreSQL Workflow Persistence), #11 (CircuitBreaker), #12 (Rate Limiting)

---

## Context Budget Status

| Metric | Green | Yellow | Red |
|--------|-------|--------|-----|
| Direct tool calls | 0-10 | 11-15 | 16+ |
| Large file reads (>200 lines) | 0-2 | 3-4 | 5+ |
| Sub-agent delegations | 0-5 | 6-8 | 9+ |

**Phase 1 Final Status**: Complete (all 4 deliverables written, corrected 2026-02-05)

---

## Working Context (~300 tokens)

**Current task**: Build workflow durability infrastructure for the knowledge extraction pipeline.

**Success criteria**:
- [ ] 3 new Drizzle workflow tables compile and generate valid migrations (`bun run db:generate` produces 3 files)
- [ ] ExtractionWorkflow wraps pipeline stages as durable activities with automatic checkpointing
- [ ] Extraction survives server restart at any stage (test: kill mid-extraction, restart, verify completion)
- [ ] Failed activities retry automatically (3 retries with exponential backoff, configurable)
- [ ] CircuitBreaker opens after 5 consecutive LLM failures (configurable), half-opens after 30s
- [ ] Rate limiter queues excess requests via Semaphore (20 concurrent with 5 permits = 15 queued)
- [ ] Existing `ExtractionPipeline.run()` continues working without workflow mode
- [ ] Type check passes (`bun run check --filter @beep/knowledge-server`)
- [ ] Lint passes (`bun run lint:fix --filter @beep/knowledge-server`)
- [ ] Tests pass (`bun test packages/knowledge/server/test/Workflow/`)
- [ ] `REFLECTION_LOG.md` updated with Phase 2 learnings

**Blocking issues**: None. This is the first implementation phase.

---

## Episodic Context (~300 tokens)

Phase 1 (Research) produced 4 corrected deliverables in `outputs/`:
- **COMPARISON_MATRIX.md**: 121 rows, 66 FULL + 19 PARTIAL + 37 GAP
- **GAP_ANALYSIS.md**: 20 actionable gaps (3 P0, 7 P1, 5 P2, 5 P3)
- **IMPLEMENTATION_ROADMAP.md**: 4-phase plan, 12-14 weeks
- **CONTEXT_DOCUMENT.md**: Full patterns and file mappings

**Critical correction**: 10 capabilities previously listed as missing were actually implemented (SPARQL, Reasoning, RDF, GraphRAG). Roadmap was rewritten.

---

## Semantic Context (~150 tokens)

**Knowledge slice**: `packages/knowledge/{domain,tables,server}`

**Existing ExtractionPipeline**: `server/src/Extraction/ExtractionPipeline.ts`
- Stages: Chunk -> Mentions -> Entities -> Relations -> Assemble -> Resolve
- See `outputs/CONTEXT_DOCUMENT.md` for pipeline stage details and patterns

**Effect patterns**: See `.claude/rules/effect-patterns.md`

---

## Phase 2 Sub-Tasks

### 2A. PostgreSQL Workflow Persistence (Gap #3) -- Days 1-4

**Priority**: P0 | **Complexity**: M

**Files to Create**:
```
tables/src/tables/
  workflow-execution.table.ts   # Workflow instance state (id, type, status, input, output, error)
  workflow-activity.table.ts    # Activity journal (execution_id, activity_name, status, result)
  workflow-signal.table.ts      # Signal delivery queue (execution_id, signal_name, payload)
```

**Files to Modify**:
```
tables/src/tables/index.ts     # Export new tables
tables/src/schema.ts           # Register in schema
tables/src/relations.ts        # FK: workflow_activity -> workflow_execution
```

**Key constraints**:
- Use `OrgTable.make` factory for multi-tenant isolation
- JSONB for serialized input/output
- All FK columns MUST use `.$type<EntityId.Type>()`
- If domain Model requires a field, do NOT use `.default()` on the column

---

### 2Ba. Durable Workflow Activities (Gap #1, Part 1) -- Days 5-15

**Priority**: P0 | **Complexity**: L

**Files to Create**:
```
server/src/Workflow/
  index.ts                      # Public exports
  DurableActivities.ts          # Activity wrappers for each extraction stage
  WorkflowPersistence.ts        # PostgreSQL persistence adapter

domain/src/value-objects/
  workflow-state.value.ts       # WorkflowExecutionState schema
  extraction-progress.value.ts  # Progress event schema for SSE
```

**Checkpoint**: After 2Ba, verify activities compile and persistence adapter works in isolation before proceeding.

---

### 2Bb. Workflow Integration + Progress (Gap #1, Part 2) -- Days 16-25

**Priority**: P0 | **Complexity**: L

**Files to Create**:
```
server/src/Workflow/
  ExtractionWorkflow.ts         # @effect/workflow definition composing activities
  ProgressStream.ts             # SSE progress event emission
```

**Files to Modify**:
```
server/src/Extraction/ExtractionPipeline.ts  # Refactor stages into activity calls
```

**Integration Points** (verify current state before modifying):
- `ExtractionPipeline.run()` -- entry point to preserve
- Each stage method -- wrap as durable activity

**Backward Compatibility**: Existing `.run()` signature preserved. Workflow wraps stages, not replaces them.

---

### 2C. CircuitBreaker (Gap #11) -- Days 26-27

**Priority**: P2 | **Complexity**: S

**Files to Create**: `server/src/Resilience/{index.ts, CircuitBreaker.ts}`

**Files to Modify**: `server/src/Embedding/EmbeddingService.ts`, `server/src/GraphRAG/GroundedAnswerGenerator.ts`

**Implementation**: `Effect.retry` with `Schedule` + `Ref<CircuitState>`. States: closed, open (fail-fast), half-open (probe).

---

### 2D. Rate Limiting (Gap #12) -- Days 28-29

**Priority**: P2 | **Complexity**: S

**Files to Create**: `server/src/Resilience/RateLimiter.ts`

**Files to Modify**: `server/src/Embedding/EmbeddingService.ts`

**Implementation**: `Effect.Semaphore` with configurable permits. Stack: request -> rate limit -> circuit breaker -> LLM call.

---

## Procedural Context

- Effect patterns: `.claude/rules/effect-patterns.md`
- Testing patterns: `.claude/commands/patterns/effect-testing-patterns.md`
- Database patterns: `documentation/patterns/database-patterns.md`
- Roadmap detail: `specs/knowledge-ontology-comparison/outputs/IMPLEMENTATION_ROADMAP.md`
- Context patterns: `specs/knowledge-ontology-comparison/outputs/CONTEXT_DOCUMENT.md`

---

## Known Issues & Gotchas

1. **@effect/workflow API**: May be evolving. Pin version and abstract persistence adapter.
2. **Pre-existing test failures**: 32 in PromptTemplates, 2 type errors in TestLayers.ts / GmailExtractionAdapter.test.ts. Unrelated.
3. **Turborepo cascading**: Isolate with `tsc --noEmit -p tsconfig.json` for direct checks.
4. **Table _check.ts**: New tables must align with domain models. No `.default()` on required fields.

---

## Context Budget Verification

- [ ] Working context <= 2,000 tokens (PASS: ~300)
- [ ] Episodic context <= 1,000 tokens (PASS: ~300)
- [ ] Semantic context <= 500 tokens (PASS: ~150)
- [ ] Procedural context uses links (PASS)
- [ ] Total <= 4,000 tokens (PASS: ~1,050 handoff + ~750 procedural links = ~1,800 estimated)

---

## Verification

```bash
bun run check --filter @beep/knowledge-domain
bun run check --filter @beep/knowledge-tables
bun run check --filter @beep/knowledge-server
bun run lint:fix --filter @beep/knowledge-server
bun test packages/knowledge/server/test/Workflow/
bun test packages/knowledge/server/test/Resilience/
```

---

## Next Phase

After completing Phase 2:
1. Update `REFLECTION_LOG.md` with learnings
2. Create `handoffs/HANDOFF_P3.md` (context document)
3. Create `handoffs/P3_ORCHESTRATOR_PROMPT.md` (copy-paste prompt)
4. Phase 3 (State Management) depends on durable workflows being complete
5. Phase 4 (Semantic Enrichment) can start in parallel
