# Quick Start: Knowledge Entity Resolution v2

> 5-minute triage guide for implementing immutable evidence layer and cross-batch entity resolution.

---

## 5-Minute Triage

### Current State

The entity resolution v2 enhancement is **PLANNED** (parallel track). This spec adds immutable MentionRecord layer and cross-batch entity coordination to the knowledge slice.

### What Exists

- `MentionModel` for within-batch mentions
- `EntityClusterer` service for embedding-based clustering
- `MentionExtractor` LLM extraction service
- Entity domain model with basic resolution

### What Needs Building

- `MentionRecord` domain model (immutable extraction evidence)
- `mention_record` table with provenance fields
- `EntityRegistry` service for cross-batch entity lookups
- `MergeHistory` service for tracking resolution decisions
- `IncrementalClusterer` for adding mentions to existing clusters
- `SplitService` for breaking incorrect merges

---

## Critical Context

| Attribute | Value |
|-----------|-------|
| **Complexity** | Medium (36 points) |
| **Phases** | 3 |
| **Sessions** | 2-3 estimated |
| **Success Metric** | Cross-batch entity deduplication with audit trails |
| **Key Dependency** | Phase -1 (Architecture Foundation) complete |
| **Cross-Package** | Knowledge domain, tables, server |

---

## Phase Overview

| Phase | Name | Description | Status |
|-------|------|-------------|--------|
| **P1** | MentionRecord Foundations | Domain model, table, RPC contracts | Pending |
| **P2** | Registry & History Services | EntityRegistry, MergeHistory | Pending |
| **P3** | Clustering & Split/Unmerge | IncrementalClusterer, SplitService | Pending |

---

## Quick Decision Tree

```
START
  |
  +-- Does MentionRecord domain model exist?
  |     +-- NO -> Start Phase 1 (Foundations)
  |     +-- YES -> Does EntityRegistry find candidates?
  |           +-- NO -> Start Phase 2 (Services)
  |           +-- YES -> Does IncrementalClusterer work?
  |                 +-- NO -> Start Phase 3 (Clustering)
  |                 +-- YES -> Complete
```

---

## Quick Commands

```bash
# Type check knowledge packages
bun run check --filter @beep/knowledge-domain
bun run check --filter @beep/knowledge-tables
bun run check --filter @beep/knowledge-server

# Run tests
bun run test --filter @beep/knowledge-server

# Lint and fix
bun run lint:fix
```

---

## Key Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Migration Strategy** | Forward-only | No backfill, preserves audit integrity |
| **Immutability** | MentionRecord immutable except `resolvedEntityId` | Preserves extraction evidence |
| **Candidate Search** | Normalized text + bloom filter + embeddings | Balance performance and accuracy |
| **Merge History** | Separate table with provenance | Enables auditing and split operations |

---

## Data Model Flow

```
Text → LLM Extraction
        |
        v
  MentionRecords (immutable evidence)
        |
        +-- rawText, startChar, endChar
        +-- extractorConfidence
        +-- llmResponseHash (for audit)
        +-- resolvedEntityId (link to entity)
        |
        v
  EntityRegistry lookup
        |
        +-- Normalize text
        +-- Bloom filter check
        +-- Embedding similarity ranking
        |
        v
  Merge or Create Entity
        |
        v
  Record in MergeHistory
```

---

## Critical Patterns

### MentionRecord Immutability

```typescript
// IMMUTABLE - never modified after creation
export class MentionRecord extends M.Class<MentionRecord>("MentionRecord")({
  id: KnowledgeEntityIds.MentionRecordId,
  rawText: S.String,                    // Immutable
  extractorConfidence: Confidence,      // Immutable
  llmResponseHash: S.String,            // Immutable

  // MUTABLE - updated during resolution
  resolvedEntityId: BS.FieldOptionOmittable(KnowledgeEntityIds.EntityId),
}) {}
```

### Cross-Batch Resolution

```typescript
import * as Effect from "effect/Effect";
import { EntityRegistry } from "@beep/knowledge-server";

const program = Effect.gen(function* () {
  const registry = yield* EntityRegistry;
  const candidates = yield* registry.findCandidates(mentionRecord);

  if (candidates.length > 0) {
    // Merge with existing entity
    yield* registry.mergeWithEntity(mentionRecord, bestCandidate);
  } else {
    // Create new entity
    yield* registry.createNewEntity(mentionRecord);
  }
});
```

---

## Success Metrics

### Functional Requirements
- MentionRecords never modified (except `resolvedEntityId`)
- Same entity from different documents merges correctly
- Merge history enables auditing: "why were X and Y merged?"
- Split operation correctly reassigns MentionRecords
- Cross-batch resolution finds existing entities

### Performance Requirements
- Candidate search < 100ms for orgs with < 10K entities
- Incremental clustering < 5s for batch of 100 mentions
- Bloom filter reduces search space by > 90%

---

## Prerequisites

Before starting Phase 1:

- [ ] Phase -1 (Architecture Foundation) MUST be complete
  - EntityId standards defined
  - Package allocation documented
  - RPC patterns established

**Note**: This spec runs in PARALLEL with:
- Phase 0 (RDF Foundation)
- Phase 1 (SPARQL + Reasoning)
- Phase 3 (Workflow Durability)

No blocking dependencies on parallel tracks.

---

## Context Documents

| Document | Purpose |
|----------|---------|
| [README.md](README.md) | Full spec with detailed architecture |
| [REFLECTION_LOG.md](REFLECTION_LOG.md) | Cumulative learnings |
| [handoffs/HANDOFF_P1.md](handoffs/HANDOFF_P1.md) | Phase 1 context document |

---

## Starting Phase 1

1. Read the orchestrator prompt: `handoffs/P1_ORCHESTRATOR_PROMPT.md` (if exists)
2. Read full context: `handoffs/HANDOFF_P1.md`
3. Verify EntityIds: Check `packages/knowledge/domain/src/value-objects/EntityIds.ts` for `MentionRecordId` and `ExtractionId`
4. Create MentionRecord model: `packages/knowledge/domain/src/entities/MentionRecord/MentionRecord.model.ts`
5. Create table definition: `packages/knowledge/tables/src/tables/mention-record.table.ts`
6. Add indexes for candidate search
7. Verify with `bun run check --filter @beep/knowledge-*`
8. Update `REFLECTION_LOG.md`
9. Create handoffs for P2

---

## Common Pitfalls

| Pitfall | Solution |
|---------|----------|
| Forgetting Effect patterns | Use `Effect.gen` + `yield*`, never async/await |
| Native JS methods | Use `A.map`, `A.filter` from `effect/Array` |
| Plain string IDs | Use branded EntityIds from `@beep/shared-domain` |
| Missing .$type<>() on columns | ALWAYS add `.$type<EntityId.Type>()` to foreign keys |
| Modifying MentionRecord fields | Only `resolvedEntityId` is mutable, rest immutable |
| Backfill temptation | Forward-only approach, no synthetic provenance |

---

## Related Specs

| Spec | Relationship |
|------|-------------|
| `knowledge-architecture-foundation` | **Predecessor** - Package allocation, EntityIds |
| `knowledge-ontology-comparison` | Source roadmap |
| `knowledge-rdf-foundation` | Parallel track (no dependency) |
| `knowledge-sparql-integration` | Parallel track (no dependency) |
| `knowledge-workflow-durability` | Parallel track (no dependency) |

---

## Need Help?

- Full spec: [README.md](README.md)
- Architecture foundation: `../knowledge-architecture-foundation/`
- Effect patterns: `.claude/rules/effect-patterns.md`
- Database patterns: `documentation/patterns/database-patterns.md`
- EntityId usage: `.claude/rules/effect-patterns.md#entityid-usage-mandatory`
