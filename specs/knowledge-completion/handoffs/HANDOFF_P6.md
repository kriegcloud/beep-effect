# Handoff: Phase 6 - GraphRAG Implementation

> Context document for Phase 6 of the knowledge completion spec.

---

## Prerequisites

Phase 5 (Test Coverage) must be complete with:
- [ ] At least 6 test files passing
- [ ] Line coverage ≥60%
- [ ] Mock LanguageModel Layer working

---

## Phase 6 Objective

**Implement GraphRAG service** for subgraph retrieval:
1. k-NN entity search via pgvector
2. N-hop subgraph traversal
3. RRF scoring for relevance ranking
4. Agent context formatting

---

## Context Budget Estimate

| Item | Tokens |
|------|--------|
| HANDOFF_P6.md | ~1,200 |
| Related services | ~3,000 |
| New implementation | ~4,000 |
| **Total** | ~8,200 |

---

## Service Design

### Interface

```typescript
// packages/knowledge/server/src/GraphRAG/GraphRAGService.ts

export interface GraphRAGQuery {
  readonly query: string           // Natural language query
  readonly topK: number            // Number of seed entities
  readonly hops: number            // Traversal depth (1-3)
  readonly filters?: EntityFilters // Optional type/date filters
}

export interface GraphRAGResult {
  readonly entities: ReadonlyArray<Entity>
  readonly relations: ReadonlyArray<Relation>
  readonly scores: ReadonlyMap<EntityId, number>
  readonly context: string         // Formatted for LLM consumption
}

export class GraphRAGService extends Effect.Service<GraphRAGService>()(
  "@beep/knowledge-server/GraphRAGService",
  {
    accessors: true,
    dependencies: [EmbeddingService, EntityRepo, RelationRepo],
    effect: Effect.gen(function* () {
      const embedding = yield* EmbeddingService
      const entityRepo = yield* EntityRepo
      const relationRepo = yield* RelationRepo

      return {
        query: (query: GraphRAGQuery) => Effect.gen(function* () {
          // 1. Embed query
          // 2. k-NN search for seed entities
          // 3. N-hop traversal
          // 4. RRF scoring
          // 5. Format context
        })
      }
    })
  }
)
```

---

## Implementation Components

### 1. k-NN Search

Use pgvector for embedding similarity:

```sql
SELECT id, name, 1 - (embedding <=> $1) as similarity
FROM knowledge.entities
WHERE org_id = $2
ORDER BY embedding <=> $1
LIMIT $3
```

### 2. N-Hop Traversal

Recursive relation traversal:

```typescript
const traverse = (seeds: EntityId[], depth: number) =>
  Effect.gen(function* () {
    if (depth === 0) return seeds

    const relations = yield* relationRepo.findBySourceIds(seeds)
    const nextSeeds = relations.map(r => r.targetId)
    const deeper = yield* traverse(nextSeeds, depth - 1)

    return [...seeds, ...deeper]
  })
```

### 3. RRF Scoring

Reciprocal Rank Fusion combines:
- Embedding similarity rank
- Graph distance rank

```typescript
const rrfScore = (embeddingRank: number, graphRank: number, k = 60) =>
  1 / (k + embeddingRank) + 1 / (k + graphRank)
```

### 4. Context Formatting

Format subgraph for LLM:

```typescript
const formatContext = (entities: Entity[], relations: Relation[]) =>
  `## Entities\n${entities.map(e => `- ${e.name}: ${e.description}`).join('\n')}\n\n` +
  `## Relations\n${relations.map(r => `- ${r.sourceName} ${r.type} ${r.targetName}`).join('\n')}`
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/GraphRAG/GraphRAGService.ts` | Main service |
| `src/GraphRAG/RrfScorer.ts` | Scoring utilities |
| `src/GraphRAG/ContextFormatter.ts` | LLM context formatting |
| `test/GraphRAG/GraphRAGService.test.ts` | Tests |

---

## Performance Requirements

| Metric | Target |
|--------|--------|
| Query latency (p50) | <100ms |
| Query latency (p99) | <500ms |
| Max traversal depth | 3 hops |
| Max seed entities | 20 |

---

## Exit Criteria

Phase 6 is complete when:

- [ ] `GraphRAGService` implemented
- [ ] k-NN search working
- [ ] N-hop traversal working (up to 3 hops)
- [ ] RRF scoring implemented
- [ ] Context formatting implemented
- [ ] Tests passing
- [ ] `REFLECTION_LOG.md` updated
- [ ] `handoffs/HANDOFF_P7.md` created

---

## Agent Assignment

| Agent | Task |
|-------|------|
| `effect-code-writer` | Service implementation |
| `test-writer` | Test creation |

---

## Notes

- Start with 1-hop traversal, then extend to N-hop
- Use existing `EmbeddingService` for query embedding
- Leverage existing repos for entity/relation queries
- Consider caching for repeated queries
