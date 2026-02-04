# Reflection Log

> Cumulative learnings from implementing entity resolution enhancements.

---

## Purpose

This log captures patterns, gotchas, and improvements discovered during implementation. Use it to refine future phases and promote successful patterns to the pattern registry.

---

## Entry Template

```markdown
## Phase [N] - [Feature Name] (YYYY-MM-DD)

### What Worked
- [Pattern or approach that succeeded]

### What Didn't Work
- [Pattern or approach that failed]

### Key Learnings
- [Insights that will inform future work]

### Pattern Candidates (score if ≥75)
- [Pattern name]: [Brief description] (Score: X/102)
```

---

## Entries

## Phase 0: Scaffolding - 2026-02-03

### What Worked
- Complexity formula yielded clear classification (36 points → Medium)
- Two-tier architecture (MentionRecord → Entity) provides clean separation of concerns
- Parallel track structure (Phases 0, 1, 3) enables independent progress on RDF/SPARQL/Workflow
- Forward-only migration strategy avoids synthetic provenance complexity

### What Didn't Work
- (To be filled during Phase 1 execution)

### Key Learnings
- **MentionRecords must be immutable** - Extraction outputs should never change after creation
- **Cross-batch resolution requires organization-wide lookups** - Comparing new MentionRecords against existing entities across all past extractions
- **EntityId branded types essential for type safety** - Prevents mixing different entity types in joins and queries
- **Bloom filters reduce candidate search space** - Necessary for performance at scale (10K+ entities)
- **Merge history enables conflict resolution** - Audit trail critical for debugging resolution decisions

### Pattern Candidates

#### Pattern: immutable-extraction-artifact
- **Description**: Extraction outputs (MentionRecord) are append-only, never mutated. Resolution updates only the link field (`resolvedEntityId`).
- **Applicability**: Any pipeline where extraction results feed into resolution or deduplication
- **Benefits**: Preserves raw evidence, enables auditing, supports split/unmerge operations
- **Confidence**: high

#### Pattern: two-tier-resolution
- **Description**: Separate raw extraction layer (MentionRecord) from resolved entity layer (Entity). Evidence layer is immutable, resolution layer evolves.
- **Applicability**: Entity resolution, NER pipelines, knowledge extraction, any deduplication workflow
- **Benefits**: Audit trails, conflict resolution, provenance preservation
- **Confidence**: high

#### Pattern: cross-batch-entity-registry
- **Description**: Organization-wide entity lookup using normalized text + bloom filter + embedding similarity
- **Applicability**: Multi-batch entity resolution, incremental clustering, deduplication across time
- **Benefits**: Finds duplicate entities across extraction runs, enables incremental updates
- **Confidence**: medium (requires performance validation)

---

## Next Entry Template

```markdown
## Phase 1 - MentionRecord Foundations (YYYY-MM-DD)

### What Worked
- [Pattern or approach that succeeded]

### What Didn't Work
- [Pattern or approach that failed]

### Key Learnings
- [Insights that will inform future work]

### Pattern Candidates (score if ≥75)
- [Pattern name]: [Brief description] (Score: X/102)
```
