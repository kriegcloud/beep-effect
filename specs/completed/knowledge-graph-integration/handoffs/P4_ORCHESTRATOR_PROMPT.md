# Phase 4 Orchestrator Prompt

Copy-paste this prompt to start Phase 4 implementation.

---

## Prompt

You are implementing Phase 4 of the knowledge-graph-integration spec.

### Context

This is Phase 4 (Entity Resolution). Phase 3 (Embedding & Grounding) successfully implemented embedding generation and grounding verification. This phase implements entity deduplication and linking.

### Your Mission

Implement entity resolution to deduplicate and link entities across multiple extractions:

1. **EntityClusterer** - Group similar entities using embedding similarity
2. **CanonicalSelector** - Select the best representative for each cluster
3. **SameAsLinker** - Create owl:sameAs provenance links between merged entities
4. **CrossSourceMatcher** - Handle entities extracted from different documents/sources
5. **ResolutionPersistence** - Store clusters and links in database

### Files to Create

**Entity Resolution Service:**
```
packages/knowledge/server/src/EntityResolution/
├── EntityResolutionService.ts
├── EntityClusterer.ts
├── CanonicalSelector.ts
├── SameAsLinker.ts
├── CrossSourceMatcher.ts
└── index.ts
```

**Domain Models:**
```
packages/knowledge/domain/src/entities/EntityCluster/EntityCluster.model.ts
packages/knowledge/domain/src/entities/SameAsLink/SameAsLink.model.ts
```

**Table Schemas:**
```
packages/knowledge/tables/src/tables/entityCluster.table.ts
packages/knowledge/tables/src/tables/sameAsLink.table.ts
```

**Entity IDs (add to existing file):**
- `EntityClusterId` → `packages/shared/domain/src/entity-ids/knowledge/ids.ts`
- `SameAsLinkId` → `packages/shared/domain/src/entity-ids/knowledge/ids.ts`

### Reference Files

- Full implementation guidance: `specs/knowledge-graph-integration/handoffs/HANDOFF_P4.md`
- Embedding Service: `packages/knowledge/server/src/Embedding/EmbeddingService.ts`
- GraphAssembler: `packages/knowledge/server/src/Extraction/GraphAssembler.ts`
- Confidence Filter: `packages/knowledge/server/src/Grounding/ConfidenceFilter.ts`

### APIs Available from Phase 3

```typescript
// EmbeddingService
embed(text, taskType, orgId, ontologyId): Effect<number[]>
embedEntities(entities, orgId, ontologyId): Effect<void>
findSimilar(queryVector, orgId, limit?, threshold?): Effect<SimilarityResult[]>
getOrCreate(text, taskType, orgId, ontologyId): Effect<number[]>

// GroundingService
groundRelations(relations, sourceText, orgId, ontologyId): Effect<GroundingResult>
```

### Verification

```bash
bun run check --filter="@beep/knowledge-*"
bun run lint:fix --filter="@beep/knowledge-*"
```

### Unit Test Requirements

- EntityClusterer groups similar entities correctly
- EntityClusterer respects type compatibility when configured
- CanonicalSelector selects correct entity per strategy
- SameAsLinker generates correct provenance links
- Transitive closure of sameAs links computed correctly

### Success Criteria

- [ ] All service files created with proper Effect patterns
- [ ] Domain models follow project conventions
- [ ] Table schemas use OrgTable pattern with proper indexes
- [ ] Entity IDs added to shared-domain
- [ ] `bun run check --filter="@beep/knowledge-*"` passes
- [ ] Unit tests pass
- [ ] REFLECTION_LOG.md updated with Phase 4 learnings

### Next Phase

Phase 5 (GraphRAG) will implement:
- k-NN entity search across resolved knowledge graphs
- N-hop subgraph traversal for context assembly
- RRF (Reciprocal Rank Fusion) scoring for relevance ranking
- Format retrieved subgraphs as agent context
