# Phase 4 Orchestrator Prompt: IncrementalClusterer & Split/Unmerge Implementation

> **Copy-paste this prompt into a new orchestrator session to start Phase 4 implementation.**

---

## Session Type & Role

**Session Type**: Orchestrator (Feature Lead)

**Your Role**: You are leading Phase 4 implementation of the `knowledge-entity-resolution-v2` spec. You will delegate implementation tasks to specialized agents and verify completion against success criteria.

---

## Phase 4 Goal

Implement full incremental clustering and entity split/unmerge support:

1. **IncrementalClustererLive** - Server-side layer that resolves new MentionRecords against existing entity corpus using EntityRegistry
2. **Split/Unmerge Service** - Break incorrect entity merges and reassign MentionRecords
3. **ExtractionPipeline Integration** - Wire IncrementalClusterer into the extraction flow
4. **End-to-End Cross-Batch Tests** - Validate resolution across extraction runs
5. **Performance Optimization** - Meet target: <5s for 100 mentions against 10K corpus

---

## Context from Phases 1-3

### Phase 1: MentionRecord Foundations (COMPLETE ✅)

- `MentionRecord` domain model (immutable fields + mutable `resolvedEntityId`)
- `mention_record` table with GIN trigram index
- Two-tier architecture: MentionRecord (immutable) → Entity (mutable cluster)

### Phase 2: EntityRegistry & MergeHistory Stub (COMPLETE ✅)

- `MergeHistory` domain model with `MergeReason` enum
- `merge_history` table with indexes
- EntityCandidate and MergeParams value objects
- Stub services for MergeHistory and EntityRegistry

### Phase 3: Full Implementation (COMPLETE ✅)

- **EntityRegistry** - Multi-stage pipeline: bloom filter → GIN trigram → embedding similarity
- **BloomFilter** - Custom Uint32Array with djb2/sdbm/FNV-1a hash functions
- **MergeHistoryLive** - PostgreSQL persistence via AuthContext
- **IncrementalClusterer** - Domain stub with `cluster(mentions)` method signature
- **Performance**: All targets met (bloom: <1ms lookup, 100% pruning; text: <50ms; memory: 122KB)
- **Tests**: 492 passing (481 server + 11 domain)

---

## Phase 4 Scope

### What's Changing

**New Server Implementations**:
1. `IncrementalClustererLive` - Replaces domain stub with real cross-batch resolution
2. `SplitService` - Breaks incorrect merges, reassigns MentionRecords

**Pipeline Integration**:
3. Wire IncrementalClusterer into ExtractionPipeline (additive, non-breaking)

**What's NOT Changing**:
- Domain models (MentionRecord, Entity, MergeHistory) - remain unchanged
- Table schemas - remain unchanged
- EntityRegistry, BloomFilter, MergeHistoryLive - remain unchanged
- EntityClusterer (within-batch) - remains unchanged

### Implementation Details

#### 1. IncrementalClustererLive Layer

**Location**: `packages/knowledge/server/src/EntityResolution/IncrementalClustererLive.ts`

**Pattern**: `Layer.effect` providing the domain `IncrementalClusterer` service

**Algorithm**:
```
For each MentionRecord:
  1. EntityRegistry.findCandidates(mention)
     → Multi-stage: bloom filter → GIN trigram → embedding similarity

  2. If candidates found (non-empty array):
     a. Best candidate = A.headNonEmpty(candidates)  // Pre-sorted by similarity
     b. If best.similarityScore > MERGE_THRESHOLD:
        - Update mention.resolvedEntityId = best.entity.id
        - MergeHistory.recordMerge({
            sourceEntityId: mention.id,  // or new entity
            targetEntityId: best.entity.id,
            mergeConfidence: best.similarityScore,
            mergeReason: "embedding_similarity",
          })
        - CanonicalSelector.mergeAttributes if cluster has multiple members
     c. Else:
        - Create new Entity from mention
        - Set mention.resolvedEntityId = newEntity.id
        - EntityRegistry.addToBloomFilter(newEntity.mention)

  3. If no candidates:
     - Create new Entity from mention
     - Set mention.resolvedEntityId = newEntity.id
     - EntityRegistry.addToBloomFilter(newEntity.mention)
```

**Dependencies**:
- `EntityRegistry` - `findCandidates`, `addToBloomFilter`
- `MergeHistory` (via `MergeHistoryLive`) - `recordMerge`
- `EntityRepo` - entity CRUD
- `MentionRecordRepo` - update `resolvedEntityId`
- `CanonicalSelector` - merge attributes when appropriate
- `SameAsLinker` - generate cross-entity links
- `Policy.AuthContext` - organization scoping

**Critical Pattern**: AuthContext injection
```typescript
export const IncrementalClustererLive = Layer.effect(
  IncrementalClusterer,
  Effect.gen(function* () {
    const entityRegistry = yield* EntityRegistry;
    const entityRepo = yield* EntityRepo;
    const authContext = yield* Policy.AuthContext;
    const organizationId = authContext.session.activeOrganizationId;
    // ... implementation
  })
);
```

#### 2. Split/Unmerge Service

**Location**: `packages/knowledge/server/src/EntityResolution/SplitService.ts`

**Domain stub**: `packages/knowledge/domain/src/services/split.service.ts`

**Methods**:
```typescript
interface SplitServiceShape {
  // Split entity into two: keep some mentions on original, move others to new entity
  splitEntity: (params: {
    entityId: KnowledgeEntityIds.EntityId.Type;
    mentionIdsToSplit: ReadonlyArray<KnowledgeEntityIds.MentionRecordId.Type>;
  }) => Effect<{
    originalEntity: Entities.Entity.Model;
    newEntity: Entities.Entity.Model;
  }, SplitError>;

  // Reverse a specific merge operation
  unmerge: (
    mergeHistoryId: KnowledgeEntityIds.MergeHistoryId.Type
  ) => Effect<void, SplitError>;
}
```

**Split Algorithm**:
1. Verify entity exists and has MentionRecords
2. Validate `mentionIdsToSplit` are all resolved to this entity
3. Create new Entity from split mentions
4. Update `resolvedEntityId` on split MentionRecords to new entity
5. Record in MergeHistory: reason = "manual_split"
6. Update SameAsLinks: remove old links, create new if needed
7. Return both entities

**Unmerge Algorithm**:
1. Look up MergeHistory record by ID
2. Find all MentionRecords currently resolved to target entity
3. Filter to those that were part of the original merge (by timestamp/extraction)
4. Update `resolvedEntityId` back to source entity (or create new)
5. Record in MergeHistory: reason = "unmerge"

#### 3. ExtractionPipeline Integration

**File**: `packages/knowledge/server/src/Extraction/ExtractionPipeline.ts`

**Change**: After entity extraction, create MentionRecords and invoke IncrementalClusterer

**Pattern** (additive, non-breaking):
```typescript
// After existing extraction logic:
const mentionRecords = yield* createMentionRecordsFromExtraction(extractionResult);
yield* IncrementalClusterer.cluster(mentionRecords);
```

**CRITICAL**: Do NOT modify existing extraction behavior. Only ADD the clustering step.

---

## Critical Lessons Learned

### 1. AuthContext Pattern (FROM PHASE 3 - CRITICAL)

Domain services omit `organizationId`. Live layers inject `AuthContext`:

```typescript
export const IncrementalClustererLive = Layer.effect(
  IncrementalClusterer,
  Effect.gen(function* () {
    const authContext = yield* Policy.AuthContext;
    const organizationId = authContext.session.activeOrganizationId;
    // ... use organizationId for all org-scoped operations
  })
);
```

### 2. Domain vs Server Architecture (FROM PHASE 3)

- **Domain** = contracts (service interfaces, stubs)
  - `IncrementalClusterer` stub in `packages/knowledge/domain/src/services/`
- **Server** = implementations (Live layers, repositories)
  - `IncrementalClustererLive` in `packages/knowledge/server/src/EntityResolution/`
  - `SplitService` in `packages/knowledge/server/src/EntityResolution/`

### 3. Effect.fn Pattern (FROM PHASE 3)

Use named Effect.fn for service methods:
```typescript
cluster: Effect.fn("IncrementalClusterer.cluster")(
  function* (mentions: ReadonlyArray<MentionRecordModel>) {
    // implementation
  },
  Effect.withSpan("IncrementalClusterer.cluster"),
  Effect.mapError((error) => new ClusterError({ ... }))
)
```

### 4. Layer.provideMerge (FROM PHASE 2)

Share mutable dependencies between services:
```typescript
const TestLayer = Layer.provideMerge(
  Layer.merge(IncrementalClustererLive, EntityRegistryDefault),
  Layer.merge(EntityRepo, BloomFilter.Default)
);
```

### 5. Performance Testing with live() (FROM PHASE 3)

Use `live()` from `@beep/testkit` for benchmarks:
```typescript
import { live, assertTrue } from "@beep/testkit";

live(
  "100 mentions in <5s",
  Effect.fn(function* () {
    const start = yield* Effect.clockWith((c) => c.currentTimeMillis);
    yield* IncrementalClusterer.cluster(testMentions);
    const end = yield* Effect.clockWith((c) => c.currentTimeMillis);
    assertTrue(end - start < 5000);
  }, Effect.provide(TestLayer))
);
```

### 6. EntityRegistry.findCandidates Already Handles Everything (FROM PHASE 3)

Do NOT re-implement bloom filter/text/embedding search in IncrementalClusterer. Just call:
```typescript
const candidates = yield* entityRegistry.findCandidates(mention);
```

This already performs:
1. Text normalization
2. Bloom filter negative check (O(1))
3. GIN trigram database query (O(log n))
4. Embedding similarity ranking with threshold 0.85
5. Returns sorted candidates

---

## Delegation Strategy

### Agent Selection

| Task | Agent | Rationale |
|------|-------|-----------|
| IncrementalClustererLive | `effect-code-writer` | Layer composition with Effect.Service |
| SplitService | `effect-code-writer` | New service with Effect patterns |
| ExtractionPipeline integration | `effect-code-writer` | Additive wiring change |
| Unit tests | `test-writer` | Test patterns with `@beep/testkit` |
| Performance benchmarks | `test-writer` | `live()` helper benchmarks |
| Code review | `code-reviewer` | Verify patterns, EntityId branding |

### Recommended Workflow

**Phase 4a: Core Implementation** (Agents: `effect-code-writer`)
1. Create `IncrementalClustererLive` layer
2. Create `SplitService` (server) + domain stub
3. Verify: `bun run check --filter @beep/knowledge-server`

**Phase 4b: Tests** (Agent: `test-writer`)
1. IncrementalClusterer unit tests
2. SplitService unit tests
3. Cross-batch E2E test
4. Verify: `bun run test --filter @beep/knowledge-server`

**Phase 4c: Pipeline Integration** (Agent: `effect-code-writer`)
1. Wire IncrementalClusterer into ExtractionPipeline
2. Verify existing extraction tests still pass
3. Verify: `bun run test --filter @beep/knowledge-server`

**Phase 4d: Performance** (Agent: `test-writer`)
1. Create benchmarks for 100 mentions vs 10K corpus
2. Verify: <5s target met
3. Document baselines

**Phase 4e: Quality Gate**
1. Run all checks and tests
2. Update REFLECTION_LOG.md
3. Mark spec as COMPLETE (or plan Phase 5)

---

## Success Criteria Checklist

### Functional Criteria
- [ ] `IncrementalClustererLive` resolves MentionRecords against existing entities
- [ ] New mentions with matching entities → merge (update `resolvedEntityId`)
- [ ] New mentions without matches → create new entity + add to bloom filter
- [ ] All merges recorded in MergeHistory
- [ ] `SplitService` can split entity and reassign MentionRecords
- [ ] `SplitService` can unmerge a previous merge operation
- [ ] ExtractionPipeline invokes IncrementalClusterer after extraction
- [ ] Existing ExtractionPipeline tests still pass (non-breaking)

### Quality Criteria
- [ ] Type check passes: `bun run check --filter @beep/knowledge-server`
- [ ] Type check passes: `bun run check --filter @beep/knowledge-domain`
- [ ] Test suite passes: `bun run test --filter @beep/knowledge-server`
- [ ] Test suite passes: `bun run test --filter @beep/knowledge-domain`
- [ ] EntityId branding verified
- [ ] No Effect anti-patterns

### Performance Criteria
- [ ] 100 mentions vs 10K corpus in <5s
- [ ] Single mention resolution <50ms
- [ ] Bloom filter pruning >90%
- [ ] Performance baselines documented

### Documentation Criteria
- [ ] Phase 4 learnings captured in `REFLECTION_LOG.md`
- [ ] Performance baselines documented
- [ ] Spec marked COMPLETE or Phase 5 handoff created

---

## Reference Links

### Specification Documents
- **Handoff**: `specs/knowledge-entity-resolution-v2/handoffs/HANDOFF_P4.md`
- **Spec Overview**: `specs/knowledge-entity-resolution-v2/README.md`
- **Lessons Learned**: `specs/KNOWLEDGE_LESSONS_LEARNED.md`
- **Prior Spec Lessons**: `specs/knowledge-entity-resolution-v2/LESSONS_FROM_PRIOR_SPECS.md`
- **Reflection Log**: `specs/knowledge-entity-resolution-v2/REFLECTION_LOG.md`

### Pattern References
- **Effect Patterns**: `.claude/rules/effect-patterns.md`
- **Testing Patterns**: `.claude/commands/patterns/effect-testing-patterns.md`
- **Database Patterns**: `documentation/patterns/database-patterns.md`

### Key Implementation Files
- **EntityRegistry (full)**: `packages/knowledge/server/src/EntityResolution/EntityRegistry.ts`
- **EntityClusterer (batch)**: `packages/knowledge/server/src/EntityResolution/EntityClusterer.ts`
- **SameAsLinker**: `packages/knowledge/server/src/EntityResolution/SameAsLinker.ts`
- **CanonicalSelector**: `packages/knowledge/server/src/EntityResolution/CanonicalSelector.ts`
- **MergeHistoryLive**: `packages/knowledge/server/src/EntityResolution/MergeHistoryLive.ts`
- **BloomFilter**: `packages/knowledge/server/src/EntityResolution/BloomFilter.ts`
- **EmbeddingService**: `packages/knowledge/server/src/Embedding/EmbeddingService.ts`
- **EntityRepo**: `packages/knowledge/server/src/db/repos/Entity.repo.ts`
- **Repositories**: `packages/knowledge/server/src/db/repositories.ts`
- **IncrementalClusterer stub**: `packages/knowledge/domain/src/services/incremental-clusterer.service.ts`
- **ClusterError**: `packages/knowledge/domain/src/errors/cluster.errors.ts`
- **MentionRecord model**: `packages/knowledge/domain/src/entities/mention-record/mention-record.model.ts`
- **Entity model**: `packages/knowledge/domain/src/entities/entity/entity.model.ts`
- **ExtractionPipeline**: `packages/knowledge/server/src/Extraction/ExtractionPipeline.ts`

---

## Open Questions for Orchestrator

Before delegating, explore and clarify:

1. **EntityClusterer reuse**: Should IncrementalClusterer delegate to EntityClusterer.findSimilar for candidate comparison, or use EntityRegistry.findCandidates exclusively?
   - **Recommendation**: Use EntityRegistry.findCandidates (already has bloom + text + embedding pipeline). EntityClusterer is for within-batch agglomerative clustering.

2. **Merge threshold**: What similarity score triggers merge vs create-new?
   - **Recommendation**: Use EntityRegistry's existing SIMILARITY_THRESHOLD (0.85). If findCandidates returns results, they already exceed threshold.

3. **MentionRecord update mechanism**: Does IncrementalClusterer directly update MentionRecord.resolvedEntityId, or return assignments?
   - **Recommendation**: Direct update via MentionRecordRepo for simplicity. The domain service contract returns `void`.

4. **Split/Unmerge priority**: Full implementation or stub?
   - **Recommendation**: Full implementation since all infrastructure exists. Split is simpler than the clustering logic.

5. **ExtractionPipeline change scope**: How invasive should the integration be?
   - **Recommendation**: Minimal - add a single call to IncrementalClusterer.cluster after MentionRecords are created. Optionally make it opt-in via config flag.

---

## Ready to Start Phase 4

**First Action**: Explore `packages/knowledge/server/src/Extraction/ExtractionPipeline.ts` to understand the current extraction flow and identify the integration point.

**Agent Delegation**: Start with `effect-code-writer` for IncrementalClustererLive implementation.

**Critical Reminder**: Use `EntityRegistry.findCandidates` - do NOT re-implement search. All bloom filter/text/embedding infrastructure is already built and tested.

**Success Gate**: Phase 4 complete when cross-batch resolution works end-to-end, performance targets are met, and spec is marked COMPLETE.
