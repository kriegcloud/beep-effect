# Knowledge Entity Resolution v2 (Phase 2)

> Add immutable evidence layer and cross-batch entity resolution to knowledge slice.

---

## Status

**COMPLETE** - All phases (P1-P4) implemented. All success criteria met.

---

> **⚠️ CRITICAL: Read Lessons Learned First**
>
> Before starting implementation, **READ**: [`LESSONS_FROM_PRIOR_SPECS.md`](./LESSONS_FROM_PRIOR_SPECS.md)
>
> This document contains:
> - 7 critical patterns specific to entity resolution
> - Two-tier architecture enforcement (MentionRecord → Entity)
> - Forward-only migration strategy (no backfill)
> - EntityId branding verification commands
> - Performance targets (<100ms candidate search, <5s clustering)
> - Anti-patterns that caused rework in prior specs
>
> **Key Decisions**:
> 1. MentionRecord immutability (only `resolvedEntityId` is mutable)
> 2. No backfill of existing data (forward-only)
> 3. Candidate search strategy (bloom filter + embeddings)
> 4. MergeHistory is service, not helper module
>
> Ignoring these lessons WILL cause rework.

---

## Purpose

This specification enhances the knowledge slice's entity resolution system by adding:

1. **Immutable MentionRecord layer** - Preserves raw extraction evidence that is never modified
2. **Cross-batch entity registry** - Enables organization-wide entity deduplication across extraction runs
3. **Entity merge history tracking** - Provides auditable trail of resolution decisions
4. **Incremental clustering** - Adds new mentions to existing entity clusters efficiently
5. **Entity split/unmerge capability** - Handles resolution conflicts and incorrect merges

The current `MentionModel` and `EntityClusterer` provide within-batch resolution, but lack cross-batch coordination and immutable evidence preservation. This enhancement follows the effect-ontology two-tier architecture (MentionRecord → Entity) for production-grade entity resolution.

---

## Complexity Classification

Using the formula from `specs/_guide/README.md`:

```
Complexity = (Phases × 2) + (Agents × 3) + (CrossPkg × 4) + (ExtDeps × 3) + (Uncertainty × 5) + (Research × 2)
```

| Factor | Value | Contribution |
|--------|-------|--------------|
| Phases | 3 | 6 |
| Agents | 2 | 6 |
| Cross-Package Dependencies | 3 | 12 |
| External Dependencies | 0 | 0 |
| Uncertainty | 2 | 10 |
| Research Required | 1 | 2 |
| **Total** | | **36** |

**Classification: Medium** (21-40 points)

This is a three-phase enhancement with moderate architectural complexity and implementation uncertainty.

---

## Related Specs

| Spec | Status | Relationship |
|------|--------|--------------|
| `specs/knowledge-architecture-foundation/` | COMPLETE | **Predecessor** - Package allocation, EntityIds, RPC patterns |
| `specs/knowledge-ontology-comparison/` | COMPLETE | Source of roadmap and gap analysis |
| `specs/knowledge-rdf-foundation/` | PLANNED | **Parallel** - No direct dependency |
| `specs/knowledge-sparql-integration/` | PLANNED | **Parallel** - No direct dependency |
| `specs/knowledge-workflow-durability/` | PLANNED | **Parallel** - No direct dependency |

**Critical Dependency**: Phase -1 (Architecture Foundation) MUST be complete before starting this spec.

**Parallel Execution**: This spec can proceed alongside Phases 0, 1, and 3 since it only depends on architectural decisions, not RDF/SPARQL/Workflow implementations.

---

## Background

### Current State

The knowledge slice has entity resolution foundations:

```
packages/knowledge/domain/src/entities/
  Mention/                  # Mention model (mutable)
  Entity/                   # Canonical entity model

packages/knowledge/server/src/EntityResolution/
  EntityClusterer.ts        # Embedding-based clustering within batch
  MentionExtractor.ts       # LLM extraction of mentions
```

**Limitations**:
1. Mentions are mutable - no immutable evidence layer
2. Resolution is per-batch - no cross-batch coordination
3. No merge history - cannot audit resolution decisions
4. No split/unmerge - incorrect merges are permanent

### Target State (effect-ontology pattern)

```
Text -> MentionRecords (immutable) -> Mentions -> Entities
                  |                        |
                  v                        v
            Evidence Layer          Resolution Layer
            (never modified)        (clusters evolve)
```

**Benefits**:
- Preserves raw extraction output for auditing
- Enables cross-batch entity lookups
- Supports merge/unmerge workflows
- Provides provenance for all resolution decisions

---

## Prerequisites

Before starting this spec:

- [ ] **Phase -1** (knowledge-architecture-foundation) MUST be complete
  - Package allocation documented
  - EntityId standards defined (`KnowledgeEntityIds.MentionRecordId`, `ExtractionId`)
  - Error schemas established
  - RPC patterns documented

**Note**: This spec runs in PARALLEL with:
- Phase 0 (knowledge-rdf-foundation)
- Phase 1 (knowledge-sparql-integration + knowledge-reasoning-engine)
- Phase 3 (knowledge-workflow-durability)

No blocking dependencies on parallel tracks. Entity resolution v2 only depends on architectural decisions from Phase -1, not on RDF/SPARQL/Workflow implementations.

---

## Goals

1. **Immutable Evidence Layer**
   - Create `MentionRecord` entity with extraction provenance
   - Link to `resolvedEntityId` without modifying record
   - Preserve LLM response hash for audit trails

2. **Cross-Batch Entity Registry**
   - Organization-wide entity lookup service
   - Normalized text-based candidate search
   - Embedding similarity fallback for fuzzy matching

3. **Merge History Tracking**
   - Record all entity merge operations
   - Track merge confidence scores
   - Enable audit queries for resolution decisions

4. **Incremental Clustering**
   - Add new `MentionRecords` to existing entity clusters
   - Avoid re-clustering entire corpus on each extraction
   - Use bloom filters for candidate pruning

5. **Split/Unmerge Support**
   - Break incorrect entity merges
   - Reassign `MentionRecords` to correct entities
   - Preserve history of split operations

---

## Non-Goals

- **NOT** implementing RDF store or SPARQL features (Phase 0-1)
- **NOT** implementing workflow durability (Phase 3)
- **NOT** implementing GraphRAG enhancements (Phase 4)
- **NOT** modifying existing `ExtractionPipeline` behavior (additive changes only)
- **NOT** backfilling existing `Mention` data to `MentionRecord` (forward-only)

This is an **additive enhancement** that preserves existing functionality.

---

## Deliverables

| Item | Priority | Complexity | Estimate | Dependencies |
|------|----------|------------|----------|--------------|
| MentionRecord domain model | P1 | M | 1 day | Phase -1 |
| MentionRecord table definition | P1 | S | 0.5 day | Model |
| MentionRecord RPC contracts | P1 | M | 1 day | Model |
| EntityRegistry service | P1 | L | 2 days | MentionRecord |
| MergeHistory service | P1 | M | 1 day | Registry |
| IncrementalClusterer service | P2 | L | 2 days | Registry |
| Split/unmerge service | P2 | M | 1.5 days | History |
| Integration with ExtractionPipeline | P1 | M | 1 day | All services |

**Total Duration**: 2-3 weeks

---

## Phase Overview

| Phase | Description | Agent | Output |
|-------|-------------|-------|--------|
| **P1** | MentionRecord foundations | doc-writer | Domain model, table, RPC contracts |
| **P2** | Registry & history services | effect-code-writer | EntityRegistry, MergeHistory |
| **P3** | Clustering & split/unmerge | effect-code-writer | IncrementalClusterer, SplitService |

---

## Key Architecture Decisions

### Decision 1: Forward-Only Migration

**Decision**: Do NOT backfill existing `Mention` data to `MentionRecord`.

**Rationale**:
- Existing extractions lack provenance fields (extractionId, llmResponseHash)
- Backfill complexity adds risk without clear value
- Forward-only preserves new extraction audit trails

**Alternative Considered**: Backfill with synthetic provenance - rejected due to data integrity concerns.

### Decision 2: MentionRecord Immutability

**Decision**: `MentionRecord` fields are immutable except `resolvedEntityId`.

**Schema**:
```typescript
export class Model extends M.Class<Model>("MentionRecord")({
  // Immutable fields
  id: KnowledgeEntityIds.MentionRecordId,
  extractionId: KnowledgeEntityIds.ExtractionId,
  rawText: S.String,
  startChar: S.NonNegativeInt,
  endChar: S.NonNegativeInt,
  extractorConfidence: Confidence,
  llmResponseHash: S.String,

  // Mutable resolution link
  resolvedEntityId: BS.FieldOptionOmittable(KnowledgeEntityIds.EntityId),
}) {}
```

**Rationale**: Preserves extraction evidence while allowing resolution to evolve.

### Decision 3: Cross-Batch Candidate Search

**Decision**: Use normalized text + bloom filter for candidate pruning, embedding similarity for ranking.

**Flow**:
```
New MentionRecord
  |
  v
Normalize text -> Bloom filter check
                        |
                        v (hit)
                  Fetch candidates -> Rank by embedding similarity
                        |
                        v
                  Merge or create new entity
```

**Rationale**: Balances performance (bloom filter) with accuracy (embeddings).

---

## Data Model

### MentionRecord Schema

```typescript
// packages/knowledge/domain/src/entities/MentionRecord/MentionRecord.model.ts
export class Model extends M.Class<Model>($I`MentionRecordModel`)(
  makeFields(KnowledgeEntityIds.MentionRecordId, {
    organizationId: SharedEntityIds.OrganizationId,

    // Extraction provenance (immutable)
    extractionId: KnowledgeEntityIds.ExtractionId,
    documentId: DocumentsEntityIds.DocumentId,
    chunkIndex: S.NonNegativeInt,

    // Raw extraction output (immutable)
    rawText: S.String,
    startChar: S.NonNegativeInt,
    endChar: S.NonNegativeInt,
    extractorConfidence: Confidence,

    // LLM response preservation
    llmResponseHash: S.String,  // Hash of raw LLM output for audit

    // Link to resolved entity (mutable via resolution)
    resolvedEntityId: BS.FieldOptionOmittable(KnowledgeEntityIds.EntityId),
  }),
) {}
```

### EntityMergeHistory Schema

```typescript
// packages/knowledge/tables/src/tables/entity-merge-history.table.ts
export const entityMergeHistoryTable = Table.make(KnowledgeEntityIds.MergeHistoryId)({
  organizationId: pg.text("organization_id").notNull()
    .$type<SharedEntityIds.OrganizationId.Type>(),

  // Merge operation
  sourceEntityId: pg.text("source_entity_id").notNull()
    .$type<KnowledgeEntityIds.EntityId.Type>(),
  targetEntityId: pg.text("target_entity_id").notNull()
    .$type<KnowledgeEntityIds.EntityId.Type>(),

  // Confidence and metadata
  mergeConfidence: pg.real("merge_confidence").notNull(),
  mergeReason: pg.text("merge_reason"),  // "embedding_similarity", "manual", etc.

  // Provenance
  mergedBy: pg.text("merged_by").$type<SharedEntityIds.UserId.Type>(),
  mergedAt: pg.timestamp("merged_at").notNull().defaultNow(),
});
```

### Entity Registry Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Cross-Batch Resolution Flow                  │
├─────────────────────────────────────────────────────────────────┤
│  New Extraction                                                  │
│    |                                                             │
│    v                                                             │
│  Create MentionRecords (immutable)                               │
│    |                                                             │
│    v                                                             │
│  For each MentionRecord:                                         │
│    |                                                             │
│    +-> Normalize text -> Check EntityRegistry                    │
│    |                        |                                    │
│    |                        +-> Candidates found?                │
│    |                                |                            │
│    |                                +-> YES: Rank by similarity  │
│    |                                |          |                 │
│    |                                |          v                 │
│    |                                |      Merge (update resolvedEntityId) │
│    |                                |          |                 │
│    |                                |          v                 │
│    |                                |      Record in MergeHistory│
│    |                                |                            │
│    |                                +-> NO: Create new Entity    │
│    |                                           |                 │
│    |                                           v                 │
│    |                                       Add to EntityRegistry │
│    |                                                             │
│    +-> Update resolvedEntityId                                   │
│                                                                   │
│  Result: All MentionRecords linked to Entities                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Success Criteria

### Implementation Criteria

- [ ] `MentionRecord` entity defined in `@beep/knowledge-domain`
- [ ] `mention_record` table created with all provenance fields
- [ ] `entity_merge_history` table tracks all merge operations
- [ ] `EntityRegistry` service finds candidate entities across batches
- [ ] `IncrementalClusterer` adds new mentions without re-clustering corpus
- [ ] `SplitService` can break incorrect merges
- [ ] Existing `ExtractionPipeline` continues working unchanged
- [ ] Type checks pass: `bun run check --filter @beep/knowledge-*`

### Functional Criteria

- [ ] Same entity extracted from different documents merges correctly
- [ ] MentionRecords created during extraction are never modified (except `resolvedEntityId`)
- [ ] Merge history enables auditing: "why were entities X and Y merged?"
- [ ] Split operation correctly reassigns MentionRecords
- [ ] Cross-batch resolution finds existing entities for new extractions

### Performance Criteria

- [ ] Candidate search < 100ms for organizations with < 10K entities
- [ ] Incremental clustering < 5s for batch of 100 new mentions
- [ ] Bloom filter reduces candidate search space by > 90%

---

## Dependencies

**Hard Dependency**:
- Phase -1 (Architecture Foundation) MUST be complete
  - EntityIds defined
  - RPC patterns established
  - Layer boundaries documented

**No Dependency** (parallel tracks):
- Phase 0 (RDF Foundation)
- Phase 1 (Query & Reasoning)
- Phase 3 (Workflow Durability)

**Blocks**:
- Phase 5 (Production Resilience) - benefits from mature entity resolution
- Phase 6 (POC Integration) - uses enhanced resolution features

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Migration complexity | Medium | Medium | Forward-only approach, no backfill |
| Cross-batch performance | Medium | High | Bloom filters, normalized text indexes |
| Merge conflicts | Low | Medium | Conflict resolution UI, human-in-the-loop |
| Schema evolution | Low | Low | Use migrations, version MentionRecord schema |

---

## Timeline

**Duration**: 2-3 weeks

| Week | Focus |
|------|-------|
| 1 | P1: MentionRecord foundations (model, table, RPC) |
| 2 | P2: EntityRegistry and MergeHistory services |
| 3 | P3: IncrementalClusterer and SplitService, integration testing |

---

## Team

| Role | Responsibility |
|------|----------------|
| Architect | Review entity resolution design |
| Developer | Implement services and integration |
| Reviewer | Validate immutability guarantees |

---

## Reference Files

### Pattern References

```
packages/knowledge/domain/src/entities/
  Entity/Entity.model.ts          # Entity model pattern
  Mention/Mention.model.ts        # Current mention pattern

packages/knowledge/server/src/EntityResolution/
  EntityClusterer.ts              # Current clustering implementation

packages/knowledge/tables/src/tables/
  entity.table.ts                 # Table definition pattern
```

### Implementation Guides

- [Effect Patterns](../../.claude/rules/effect-patterns.md) - Required patterns
- [Database Patterns](../../documentation/patterns/database-patterns.md) - Table creation, foreign keys
- [IMPLEMENTATION_ROADMAP.md](../knowledge-ontology-comparison/outputs/IMPLEMENTATION_ROADMAP.md) - Phase 2 details

---

## Related Documentation

- **[LESSONS_FROM_PRIOR_SPECS.md](./LESSONS_FROM_PRIOR_SPECS.md)** - ⚠️ READ FIRST - Critical patterns and anti-patterns from completed specs
- [REFLECTION_LOG.md](./REFLECTION_LOG.md) - Session learnings
- [knowledge-architecture-foundation](../knowledge-architecture-foundation/) - Prerequisite spec
- [knowledge-ontology-comparison](../knowledge-ontology-comparison/) - Source roadmap
- [KNOWLEDGE_LESSONS_LEARNED.md](../KNOWLEDGE_LESSONS_LEARNED.md) - Comprehensive lessons from all completed knowledge specs
- [Effect Patterns](../../.claude/rules/effect-patterns.md) - Mandatory patterns
- [Database Patterns](../../documentation/patterns/database-patterns.md) - Table creation, foreign keys
