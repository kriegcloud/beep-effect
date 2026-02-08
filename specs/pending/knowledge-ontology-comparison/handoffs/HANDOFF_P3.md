# Phase 3 Handoff: State Management + Orchestration

**Date**: 2026-02-05
**From**: Phase 2 (Workflow Durability + Resilience)
**To**: Phase 3 (State Management + Orchestration)
**Status**: Ready for implementation (Phase 2 complete)
**Git Ref**: `0340358f49` (main, 2026-02-05)

---

## Mission

Add formal batch lifecycle tracking with state machine transitions and multi-document coordination with configurable failure behavior.

**Roadmap Reference**: `outputs/IMPLEMENTATION_ROADMAP.md` Phase 2 (Weeks 6-8)
**Gaps Addressed**: #2 (Batch State Machine), #10 (Cross-Batch Orchestration)

---

## Context Budget Status

| Metric | Green | Yellow | Red |
|--------|-------|--------|-----|
| Direct tool calls | 0-10 | 11-15 | 16+ |
| Large file reads (>200 lines) | 0-2 | 3-4 | 5+ |
| Sub-agent delegations | 0-5 | 6-8 | 9+ |

**Phase 2 Final Status**: Complete (2026-02-05, all 5 sub-tasks delivered)
**Phase 3 Budget**: Starting fresh with Green Zone targets.
**Checkpoint Triggers**: Create checkpoint if any metric enters Yellow Zone after 3A completes.

---

## Working Context (~250 tokens)

**Current task**: Implement batch state machine and cross-batch orchestration on top of Phase 2 durable workflows.

**Success criteria**:
- [ ] Batch state machine with validated transitions using `S.Union` of `S.TaggedStruct` + `Match.typeTags`
- [ ] Invalid transitions rejected with tagged error (TypeScript compile error if case missing)
- [ ] SSE endpoint streams real-time progress (stage name, percentage, current/total)
- [ ] Submit batch of N documents, all processed with aggregate progress
- [ ] Configurable concurrency (M documents in parallel)
- [ ] `continue-on-failure` processes remaining documents on failure
- [ ] `abort-all` stops all documents on first failure
- [ ] Cross-document entity resolution runs AFTER all extractions complete
- [ ] Type check passes (`bun run check --filter @beep/knowledge-server`)
- [ ] Lint passes (`bun run lint:fix --filter @beep/knowledge-server`)
- [ ] Tests pass (`bun test packages/knowledge/server/test/Workflow/`)
- [ ] `REFLECTION_LOG.md` updated

**Blocking issues**: Phase 2 (durable workflows) must be complete.

---

## Episodic Context (~300 tokens)

### Phase 1 Summary
Research identified 20 actionable gaps. This phase closes Gaps #2, #10.

### Phase 2 Completion Summary
Phase 2 delivered custom durable workflows (NOT @effect/workflow -- too alpha), combined CircuitBreaker+RateLimiter (CentralRateLimiterService), and LLM call site protection. Key design: DurableActivity checkpoint/replay pattern with PostgreSQL persistence.

### Dependencies from Phase 2

| Phase 2 Deliverable | Location | Used By |
|---------------------|----------|---------|
| ExtractionWorkflow | `server/src/Workflow/ExtractionWorkflow.ts` | BatchOrchestrator launches one per document |
| ProgressStream | `server/src/Workflow/ProgressStream.ts` | BatchEventEmitter aggregates per-document progress |
| DurableActivities | `server/src/Workflow/DurableActivities.ts` | Checkpoint/replay for each pipeline stage |
| WorkflowPersistence | `server/src/Workflow/WorkflowPersistence.ts` | SQL CRUD for workflow_execution + workflow_activity |
| CentralRateLimiterService | `server/src/LlmControl/RateLimiter.ts` | CircuitBreaker + Rate Limiting + Semaphore |
| Workflow tables | `tables/src/tables/workflow-*.table.ts` | 3 tables: execution, activity, signal |
| Domain VOs | `domain/src/value-objects/WorkflowState.value.ts` | Status enums for state machine |
| Domain errors | `domain/src/errors/Workflow.errors.ts` | WorkflowNotFoundError, ActivityFailedError, WorkflowStateError |

---

## Semantic Context (~150 tokens)

**Knowledge slice**: `packages/knowledge/{domain,tables,server}`

**Key services for cross-batch resolution**:
- `server/src/EntityResolution/IncrementalClustererLive.ts`
- `server/src/EntityResolution/EntityResolutionService.ts`

**Pattern guidance**: Use `S.Union` of `S.TaggedStruct` for state variants. Use `Match.typeTags` for exhaustive matching. Use `Effect.PubSub` for event emission.

---

## Phase 3 Sub-Tasks

### 3A. Batch State Machine (Gap #2) -- Days 1-8

**Priority**: P0 | **Complexity**: L | **Estimate**: 1.5 weeks

**State Machine**:
```
PENDING -> CHUNKING -> EXTRACTING_MENTIONS -> EXTRACTING_ENTITIES
  -> EXTRACTING_RELATIONS -> ASSEMBLING -> RESOLVING -> COMPLETED
  -> FAILED (from any state) | CANCELLED (from any state)
```

**Files to Create**:
```
domain/src/value-objects/BatchState.value.ts       # S.Union of TaggedStruct variants
domain/src/value-objects/BatchEvent.value.ts       # SSE event schema
server/src/Workflow/BatchStateMachine.ts             # Transition validation
server/src/Workflow/BatchEventEmitter.ts             # PubSub emission
domain/src/rpc/Extraction/StreamProgress.ts          # SSE RPC contract
```

**Files to Modify**:
```
server/src/Workflow/ExtractionWorkflow.ts   # Emit state transitions
server/src/Workflow/ProgressStream.ts       # Wire to SSE stream
```

---

### 3B. Cross-Batch Orchestration (Gap #10) -- Days 9-16

**Priority**: P1 | **Complexity**: L | **Estimate**: 1.5 weeks

**Files to Create**:
```
domain/src/entities/Batch/Agent.model.ts            # Batch definition model
domain/src/entities/Batch/index.ts
domain/src/value-objects/BatchConfig.value.ts       # Concurrency, failure policy
domain/src/value-objects/batch-failure-policy.value.ts  # continue | abort | retry
server/src/Workflow/BatchOrchestrator.ts             # Multi-workflow coordinator
server/src/Workflow/BatchAggregator.ts               # Progress aggregation
tables/src/tables/batch.table.ts                     # Batch persistence
```

**Files to Modify**:
```
server/src/Workflow/ExtractionWorkflow.ts   # Accept batch context
tables/src/tables/index.ts                  # Export batch table
tables/src/schema.ts                        # Register batch table
```

**Architecture**: BatchOrchestrator launches ExtractionWorkflow per document (parallel, concurrency-limited). BatchAggregator merges progress. Post-batch: IncrementalClusterer + SameAsLinker for cross-document resolution.

---

## Procedural Context

- Effect patterns: `.claude/rules/effect-patterns.md`
- Testing: `.claude/commands/patterns/effect-testing-patterns.md`
- Database: `documentation/patterns/database-patterns.md`
- Roadmap: `outputs/IMPLEMENTATION_ROADMAP.md` Phase 2 section
- Context: `outputs/CONTEXT_DOCUMENT.md`

---

## Known Issues & Gotchas

1. **State machine exhaustiveness**: `Match.typeTags` guarantees compile-time coverage. Missing states = TypeScript error.
2. **PubSub backpressure**: Use bounded queue or dropping strategy for slow SSE consumers.
3. **Entity resolution timing**: IncrementalClusterer AFTER all documents, not during.
4. **Batch table alignment**: No `.default()` on `completedAt` if domain model requires it.
5. **Pre-existing test failures**: 32 in PromptTemplates, 2 type errors in TestLayers.ts / GmailExtractionAdapter.test.ts. Unrelated to Phase 3 work.

---

## Context Budget Verification

- [ ] Working context <= 2,000 tokens (PASS: ~250)
- [ ] Episodic context <= 1,000 tokens (PASS: ~300)
- [ ] Semantic context <= 500 tokens (PASS: ~150)
- [ ] Procedural context uses links (PASS)
- [ ] Total <= 4,000 tokens (PASS: ~950 handoff + ~700 procedural links = ~1,650 estimated)

---

## Verification

```bash
bun run check --filter @beep/knowledge-domain
bun run check --filter @beep/knowledge-tables
bun run check --filter @beep/knowledge-server
bun run lint:fix --filter @beep/knowledge-server
bun test packages/knowledge/server/test/Workflow/BatchStateMachine.test.ts
bun test packages/knowledge/server/test/Workflow/BatchOrchestrator.test.ts
# SSE verification: curl -N http://localhost:3000/api/knowledge/extraction/progress/<batchId>
```

---

## Next Phase

After Phase 3:
1. Update `REFLECTION_LOG.md` with learnings
2. Create `handoffs/HANDOFF_P4.md` (context document)
3. Create `handoffs/P4_ORCHESTRATOR_PROMPT.md` (copy-paste prompt)
4. Phase 4 (Semantic Enrichment) may already be in progress
5. Phase 5 (Infrastructure Polish) can proceed independently
