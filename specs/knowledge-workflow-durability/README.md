# Knowledge Workflow Durability (Phase 3)

> Add @effect/workflow for durable execution with SSE progress streaming and batch state machine.

---

## Status

**PLANNED** - Parallel track implementation (depends on Phase -1, parallel with Phases 0-2)

---

## Purpose

This specification implements durable workflow execution for the knowledge extraction pipeline using @effect/workflow. The current ExtractionPipeline runs as a single Effect - if it fails mid-extraction, all progress is lost. This phase adds:

1. **Durable activities** that survive server restarts
2. **State machine** for batch processing with SSE progress streaming
3. **PostgreSQL persistence** for workflow state
4. **Cross-batch orchestration** for entity resolution coordination

This is Phase 3 from the `knowledge-ontology-comparison` spec roadmap, running in parallel with Phase 0 (RDF Foundation), Phase 1 (Query Layer), and Phase 2 (Entity Resolution).

---

## Complexity Classification

Using the formula from `specs/_guide/README.md`:

```
Complexity = (Phases × 2) + (Agents × 3) + (CrossPkg × 4) + (ExtDeps × 3) + (Uncertainty × 5) + (Research × 2)
```

| Factor | Value | Contribution |
|--------|-------|--------------|
| Phases | 4 | 8 |
| Agents | 3 | 9 |
| Cross-Package Dependencies | 3 | 12 |
| External Dependencies | 1 | 3 |
| Uncertainty | 3 | 15 |
| Research Required | 2 | 4 |
| **Total** | | **51** |

**Classification: High** (41-60 points)

This is a multi-phase spec with significant architectural impact and moderate uncertainty around @effect/workflow integration patterns.

---

## Background

### Context

The knowledge slice ExtractionPipeline runs as a single Effect - if it fails mid-extraction, all progress is lost. The effect-ontology reference implementation uses @effect/workflow for:

1. Durable activities that checkpoint progress at each stage
2. State machine for batch processing with real-time SSE progress
3. PostgreSQL persistence for workflow execution state
4. Cross-batch orchestration for entity resolution coordination

### Related Specs

| Spec | Status | Relationship |
|------|--------|--------------|
| `specs/knowledge-architecture-foundation/` | COMPLETE | **Predecessor** - Package allocation |
| `specs/knowledge-ontology-comparison/` | COMPLETE | Source of roadmap |
| `specs/knowledge-rdf-foundation/` | PLANNED | **Parallel** - No dependency |
| `specs/knowledge-entity-resolution-v2/` | PLANNED | **Parallel** - No dependency |

### Key Documents

- [IMPLEMENTATION_ROADMAP.md](../knowledge-ontology-comparison/outputs/IMPLEMENTATION_ROADMAP.md) - Phase 3 details
- [PACKAGE_ALLOCATION.md](../knowledge-architecture-foundation/outputs/PACKAGE_ALLOCATION.md) - Package boundaries
- [ARCHITECTURE_DECISIONS.md](../knowledge-architecture-foundation/outputs/ARCHITECTURE_DECISIONS.md) - Layer rules

---

## Goals

1. **@effect/workflow Integration**
   - Integrate @effect/workflow runtime with PostgreSQL backend
   - Define workflow execution tables
   - Create workflow service layer

2. **ExtractionWorkflow Definition**
   - Convert ExtractionPipeline to durable workflow
   - Define activities for each extraction stage
   - Implement checkpoint logic at stage boundaries

3. **Durable Activities**
   - ChunkText activity (durable)
   - ExtractMentions activity (durable, per-chunk)
   - ClassifyEntities activity (durable, batched)
   - ExtractRelations activity (durable, per-chunk)
   - AssembleGraph activity (durable)

4. **SSE Progress Streaming**
   - Define progress event schema
   - Implement SSE stream for real-time updates
   - Connect workflow signals to SSE events

5. **Batch State Machine**
   - Define batch processing states
   - Implement state transitions
   - Handle batch lifecycle (queued → processing → completed → failed)

6. **Cross-Batch Orchestration**
   - Coordinate entity resolution across batches
   - Track batch dependencies
   - Handle batch retry and recovery

---

## Non-Goals

- **NOT** modifying existing ExtractionPipeline behavior (additive only)
- **NOT** implementing new extraction algorithms (reuse existing)
- **NOT** implementing RDF store or SPARQL services (Phase 0-1)
- **NOT** implementing entity resolution enhancements (Phase 2)
- **NOT** implementing GraphRAG enhancements (Phase 4)
- **NOT** implementing production resilience patterns (Phase 5)

This spec focuses on workflow durability infrastructure only.

---

## Deliverables

| Document | Purpose | Location |
|----------|---------|----------|
| WORKFLOW_ARCHITECTURE.md | Workflow design, activity definitions, state machine | outputs/ |
| IMPLEMENTATION_GUIDE.md | Step-by-step implementation instructions | outputs/ |
| MIGRATION_PLAN.md | Gradual migration from ExtractionPipeline to ExtractionWorkflow | outputs/ |

---

## Phase Overview

| Phase | Description | Agent | Output |
|-------|-------------|-------|--------|
| **P1** | @effect/workflow integration + persistence tables | codebase-researcher, doc-writer | Integration layer, table schemas |
| **P2** | ExtractionWorkflow definition + durable activities | effect-code-writer | Workflow implementation |
| **P3** | SSE progress streaming | effect-code-writer | Progress stream service |
| **P4** | Batch state machine + cross-batch orchestration | effect-code-writer | State machine implementation |

---

## Workflow Architecture

```
ExtractionWorkflow (Durable)
  |
  +-- Activity: ChunkText
  |     |
  |     +-- Checkpoint: Chunks persisted
  |
  +-- Activity: ExtractMentions (per-chunk, parallel)
  |     |
  |     +-- Checkpoint: Mentions persisted (per chunk)
  |
  +-- Activity: ClassifyEntities (batched)
  |     |
  |     +-- Checkpoint: Entities persisted (per batch)
  |
  +-- Activity: ExtractRelations (per-chunk, parallel)
  |     |
  |     +-- Checkpoint: Relations persisted (per chunk)
  |
  +-- Activity: AssembleGraph
  |     |
  |     +-- Checkpoint: Graph assembled
  |
  +-- Signal: Progress (SSE stream)
        |
        +-- Event: stage progress updates
```

### Batch State Machine

```
[Queued] → [Processing] → [Completed]
              ↓
         [Failed] → [Retry] → [Processing]
              ↓
         [Abandoned]
```

---

## Key Files to Create

```
packages/knowledge/server/src/Workflow/
  index.ts                      # Public exports
  ExtractionWorkflow.ts         # Workflow definition
  DurableActivities.ts          # Activity implementations
  WorkflowPersistence.ts        # PostgreSQL persistence layer
  ProgressStream.ts             # SSE progress events
  BatchStateMachine.ts          # State machine for batch processing

packages/knowledge/tables/src/tables/
  workflow-execution.table.ts   # Workflow execution state
  workflow-activity.table.ts    # Activity execution history
  workflow-signal.table.ts      # Signal event log

packages/knowledge/domain/src/value-objects/
  workflow/
    WorkflowProgress.ts         # Progress event schema
    BatchState.ts               # Batch state enum
    ExtractionStage.ts          # Extraction stage enum
```

---

## Success Criteria

### Implementation Criteria
- [ ] @effect/workflow runtime integrated with PostgreSQL backend
- [ ] ExtractionWorkflow definition compiles and passes type checks
- [ ] All activities (ChunkText, ExtractMentions, ClassifyEntities, ExtractRelations, AssembleGraph) implemented
- [ ] SSE progress stream shows real-time updates
- [ ] Batch state machine transitions correctly
- [ ] Workflow state persisted in PostgreSQL
- [ ] Test: kill server mid-extraction, restart, extraction resumes from last checkpoint

### Integration Criteria
- [ ] Existing ExtractionPipeline continues working unchanged
- [ ] New ExtractionWorkflow can run in parallel with old pipeline
- [ ] Migration path documented for switching to workflow-based extraction
- [ ] Performance: workflow overhead < 10% compared to direct pipeline

### Multi-Session Handoff Criteria
Each phase is complete ONLY when:
- [ ] Phase work is implemented and verified (`bun run check`)
- [ ] REFLECTION_LOG.md updated with phase learnings
- [ ] `handoffs/HANDOFF_P[N+1].md` created (full context document)
- [ ] `handoffs/P[N+1]_ORCHESTRATOR_PROMPT.md` created (copy-paste prompt)
- [ ] Both handoff files pass verification checklist from HANDOFF_STANDARDS.md

---

## Timeline

**Duration**: 3-4 weeks

| Week | Focus |
|------|-------|
| 1 | @effect/workflow integration + persistence tables (P1) |
| 2 | ExtractionWorkflow definition + durable activities (P2) |
| 3 | SSE progress streaming (P3) |
| 4 | Batch state machine + cross-batch orchestration (P4) |

---

## Dependencies

**Depends on**:
- Phase -1 (Architecture Foundation) MUST be complete

**Blocks**:
- Phase 5 (Production Resilience) - soft dependency
- Phase 6 (POC Integration) - soft dependency

**Parallel with**:
- Phase 0 (RDF Foundation)
- Phase 1 (Query & Reasoning Layer)
- Phase 2 (Entity Resolution Enhancements)

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| @effect/workflow learning curve | Medium | Medium | Study effect-ontology patterns, pair programming |
| Persistence schema evolution | Low | Medium | Use migrations, version workflow definitions |
| SSE connection management | Medium | Low | Implement reconnection, heartbeat |
| Migration complexity | Medium | High | Gradual migration, feature flag for workflow vs pipeline |
| Activity timeout configuration | Medium | Medium | Make timeouts configurable, tune based on metrics |

---

## Team

| Role | Responsibility |
|------|----------------|
| Architect | Workflow design, activity boundaries |
| Developer | Activity implementation, state machine |
| Reviewer | Workflow pattern review, testing |

---

## Reference Files

### Existing Patterns to Follow

```
packages/documents/server/src/workflows/
  (no existing workflows - this is greenfield)

packages/knowledge/server/src/services/
  ExtractionPipeline.ts          # Current pipeline to convert
```

### Knowledge Slice Current State

```
packages/knowledge/
  domain/src/
    entities/
      Entity/                    # Existing entity model
      Relation/                  # Existing relation model
    value-objects/
      Confidence.ts              # Existing value object
  tables/src/
    tables/                      # Existing table definitions
  server/src/
    services/
      ExtractionPipeline.ts      # Existing pipeline to convert
```

---

## Related Documentation

- [REFLECTION_LOG.md](./REFLECTION_LOG.md) - Session learnings
- [Effect Patterns](../../.claude/rules/effect-patterns.md) - Mandatory patterns
- [Database Patterns](../../documentation/patterns/database-patterns.md) - Table patterns
- [knowledge-ontology-comparison](../knowledge-ontology-comparison/) - Source spec
- [knowledge-architecture-foundation](../knowledge-architecture-foundation/) - Package allocation
