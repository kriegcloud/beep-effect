# Phase 4 Handoff: IncrementalClusterer Full Implementation

> **Session Type**: Implementation Handoff
> **From**: Phase 3 (EntityRegistry & BloomFilter Full Implementation)
> **To**: Phase 4 (IncrementalClusterer + Split/Unmerge)
> **Handoff Date**: 2026-02-04
> **Status**: Phase 3 Complete ✅ | Phase 4 Ready to Start

---

## Tier 1: Critical Context (Working Memory)

### Phase 4 Goal

Implement the full incremental clustering pipeline and entity split/unmerge support:

1. **IncrementalClustererLive** - Replace domain stub with server-side implementation that resolves new MentionRecords against existing entity corpus
2. **Split/Unmerge Service** - Break incorrect entity merges and reassign MentionRecords
3. **ExtractionPipeline Integration** - Wire IncrementalClusterer into the extraction flow
4. **End-to-End Tests** - Validate cross-batch resolution with real services

### Immediate Next Steps (Ready to Execute)

1. **Start Here**: Read `P4_ORCHESTRATOR_PROMPT.md` for full implementation plan
2. **First File**: Create `packages/knowledge/server/src/EntityResolution/IncrementalClustererLive.ts`
3. **Critical Pattern**: Use `EntityRegistry.findCandidates` for cross-batch lookup, then merge or create
4. **Performance Target**: <5s for 100 new mentions against 10K entity corpus
5. **Verification Commands**:
   ```bash
   bun run check --filter @beep/knowledge-server
   bun run test --filter @beep/knowledge-server
   bun run check --filter @beep/knowledge-domain
   bun run test --filter @beep/knowledge-domain
   ```

### Blocking Issues

**NONE** - Phase 3 completed successfully with:
- ✅ EntityRegistry full implementation (multi-stage: bloom → text → embedding)
- ✅ BloomFilter service (custom Uint32Array, 100% pruning on unknowns)
- ✅ MergeHistoryLive layer (PostgreSQL persistence via AuthContext)
- ✅ IncrementalClusterer stub service in domain (method signature ready)
- ✅ Performance benchmarks (11 tests, all targets met)
- ✅ 492 tests passing (481 server + 11 domain)

### Open Questions (Needs Orchestrator Clarification)

1. **Reuse EntityClusterer algorithm?** The server already has `EntityClusterer` with agglomerative clustering. Should IncrementalClusterer reuse its union-find/similarity logic, or use a different incremental approach?
2. **Entity creation vs merge decision**: When candidates are found, what confidence threshold triggers merge vs create-new-entity?
3. **MentionRecord.resolvedEntityId update**: Should IncrementalClusterer directly update this field, or return cluster assignments for the caller to apply?
4. **Split/Unmerge scope**: Full implementation in Phase 4, or stub with method signatures only?
5. **ExtractionPipeline integration**: Modify existing pipeline, or create a separate orchestrator?

---

## Tier 2: Execution Checklist (Episodic Memory)

### Phase 4 Implementation Tasks

#### Task 1: IncrementalClustererLive Layer

- [ ] Create `packages/knowledge/server/src/EntityResolution/IncrementalClustererLive.ts`
  - [ ] Wire to domain `IncrementalClusterer` service interface
  - [ ] Dependencies: `EntityRegistry`, `EntityClusterer`, `SameAsLinker`, `CanonicalSelector`, `MergeHistory`, `EntityRepo`, `MentionRecordRepo`, `AuthContext`
  - [ ] For each MentionRecord in input:
    1. Call `EntityRegistry.findCandidates(mention)` to search existing entities
    2. If candidates found with high similarity → merge (update `resolvedEntityId`, record MergeHistory)
    3. If no candidates → create new Entity, add to bloom filter
  - [ ] Use `SameAsLinker.generateLinks` for cross-entity links
  - [ ] Use `CanonicalSelector.selectCanonical` when merging clusters
  - [ ] Record all merges via `MergeHistory.recordMerge`
  - [ ] Update `EntityRegistry.addToBloomFilter` for new entities
  - [ ] Add `Effect.withSpan` for observability
  - [ ] Use `Effect.forEach` with `{ concurrency: "inherit" }` for parallel mention processing
- [ ] Verify: `bun run check --filter @beep/knowledge-server`

#### Task 2: Split/Unmerge Service

- [ ] Create `packages/knowledge/server/src/EntityResolution/SplitService.ts`
  - [ ] Define `SplitService` using `Effect.Service` pattern
  - [ ] Implement `splitEntity(entityId, mentionIds)`:
    1. Verify entity exists and has multiple MentionRecords
    2. Create new Entity for split-off mentions
    3. Update `resolvedEntityId` on affected MentionRecords
    4. Record split operation in MergeHistory (reason: "manual_split")
    5. Update SameAsLinks (remove old, create new if needed)
  - [ ] Implement `unmerge(mergeHistoryId)`:
    1. Look up MergeHistory record
    2. Reverse the merge: reassign MentionRecords back to source entity
    3. Record unmerge in MergeHistory (reason: "unmerge")
  - [ ] Add error type: `SplitError` in domain errors
- [ ] Create domain stub `packages/knowledge/domain/src/services/Split.service.ts`
- [ ] Verify: `bun run check --filter @beep/knowledge-server`

#### Task 3: ExtractionPipeline Integration

- [ ] Edit `packages/knowledge/server/src/Extraction/ExtractionPipeline.ts`
  - [ ] After entity extraction, invoke IncrementalClusterer
  - [ ] Create MentionRecords from extracted entities
  - [ ] Call `IncrementalClusterer.cluster(mentionRecords)`
  - [ ] Preserve existing pipeline behavior (additive changes only)
- [ ] Verify: Existing extraction tests still pass
- [ ] Verify: `bun run test --filter @beep/knowledge-server`

#### Task 4: IncrementalClusterer Unit Tests

- [ ] Create `packages/knowledge/server/test/EntityResolution/IncrementalClusterer.test.ts`
  - [ ] Test: New mention with no existing entities → creates new entity
  - [ ] Test: New mention matching existing entity → merges (updates resolvedEntityId)
  - [ ] Test: New mention with low similarity candidates → creates new entity
  - [ ] Test: Batch of 10 mentions, some overlapping → correct merge groups
  - [ ] Test: MergeHistory recorded for all merge operations
  - [ ] Test: Bloom filter updated with new entity names
  - [ ] Test: Empty mentions array → no-op
- [ ] Verify: `bun run test --filter @beep/knowledge-server`

#### Task 5: Split/Unmerge Tests

- [ ] Create `packages/knowledge/server/test/EntityResolution/SplitService.test.ts`
  - [ ] Test: Split entity with 3 mentions into 2 groups
  - [ ] Test: Unmerge reverses previous merge
  - [ ] Test: Split records history in MergeHistory
  - [ ] Test: SameAsLinks updated after split
  - [ ] Test: Cannot split entity with single mention
  - [ ] Test: Cannot unmerge non-existent merge record
- [ ] Verify: `bun run test --filter @beep/knowledge-server`

#### Task 6: Performance Benchmarks

- [ ] Create `packages/knowledge/server/test/benchmarks/IncrementalClusterer.bench.test.ts`
  - [ ] Benchmark: 100 mentions against 10K entity corpus (target: <5s)
  - [ ] Benchmark: Single mention resolution time (target: <50ms)
  - [ ] Benchmark: Bloom filter effectiveness (>90% pruning)
  - [ ] Use `live()` from `@beep/testkit` for real clock
  - [ ] Document baselines in test output
- [ ] Verify: Performance targets met

#### Task 7: End-to-End Cross-Batch Test

- [ ] Create `packages/knowledge/server/test/EntityResolution/CrossBatchResolution.test.ts`
  - [ ] Test flow:
    1. Extract entities from Document A → creates entities
    2. Extract entities from Document B → some entities match Document A
    3. Verify cross-batch merges occurred
    4. Verify MentionRecords have correct `resolvedEntityId`
    5. Verify MergeHistory has entries
  - [ ] Requires: EntityRegistry, IncrementalClusterer, EntityRepo, MentionRecordRepo
- [ ] Verify: Full pipeline works across batches

#### Task 8: Final Quality Gate

- [ ] Run full verification:
  ```bash
  bun run check --filter @beep/knowledge-server
  bun run check --filter @beep/knowledge-domain
  bun run test --filter @beep/knowledge-server
  bun run test --filter @beep/knowledge-domain
  ```
- [ ] EntityId branding verification:
  ```bash
  grep -r "S.String" packages/knowledge/domain/src/entities --include="*.model.ts"
  ```
- [ ] Update `REFLECTION_LOG.md` with Phase 4 learnings
- [ ] Mark spec as COMPLETE (or create Phase 5 handoff if split/unmerge deferred)

---

## Tier 3: Technical Details (Semantic Memory)

### Phase 3 Completion Summary

**Files Created**:
- ✅ `packages/knowledge/server/src/EntityResolution/BloomFilter.ts` - Custom Uint32Array bloom filter (djb2, sdbm, FNV-1a hashes)
- ✅ `packages/knowledge/server/src/EntityResolution/EntityRegistry.ts` - Full multi-stage candidate search
- ✅ `packages/knowledge/server/src/EntityResolution/MergeHistoryLive.ts` - PostgreSQL persistence layer
- ✅ `packages/knowledge/domain/src/services/IncrementalClusterer.service.ts` - Stub service
- ✅ `packages/knowledge/domain/src/errors/cluster.errors.ts` - ClusterError tagged error
- ✅ `packages/knowledge/server/test/benchmarks/EntityRegistry.bench.test.ts` - 11 benchmark tests
- ✅ `packages/knowledge/server/test/EntityResolution/BloomFilter.test.ts` - Unit tests
- ✅ `packages/knowledge/server/test/EntityResolution/EntityRegistry.test.ts` - Unit tests

**Quality Gates**:
- ✅ Type check: `bun run check --filter @beep/knowledge-server` - 31 tasks pass
- ✅ Test suite: 481 server tests + 11 domain tests = 492 total
- ✅ EntityId branding verified
- ✅ Performance benchmarks all met

### Existing Services Available for Phase 4

| Service | Location | Methods |
|---------|----------|---------|
| `EntityRegistry` | `server/src/EntityResolution/EntityRegistry.ts` | `findCandidates`, `bloomFilterCheck`, `fetchTextMatches`, `rankBySimilarity`, `addToBloomFilter`, `bulkAddToBloomFilter`, `getBloomFilterStats` |
| `EntityClusterer` | `server/src/EntityResolution/EntityClusterer.ts` | `cluster(graphs, orgId, ontologyId, config)`, `findSimilar(query, candidates, orgId, ontologyId, threshold)` |
| `SameAsLinker` | `server/src/EntityResolution/SameAsLinker.ts` | `generateLinks`, `generateLinksWithProvenance`, `areLinked`, `getCanonical`, `computeTransitiveClosure`, `validateLinks` |
| `CanonicalSelector` | `server/src/EntityResolution/CanonicalSelector.ts` | `selectCanonical`, `mergeAttributes`, `computeQualityScore` |
| `MergeHistoryLive` | `server/src/EntityResolution/MergeHistoryLive.ts` | `recordMerge`, `getMergeHistory`, `getMergesByUser` |
| `BloomFilter` | `server/src/EntityResolution/BloomFilter.ts` | `contains`, `add`, `bulkAdd`, `getStats`, `clear` |
| `EmbeddingService` | `server/src/Embedding/EmbeddingService.ts` | `embed`, `embedEntities`, `findSimilar`, `getOrCreate` |
| `EntityRepo` | `server/src/db/repos/Entity.repo.ts` | `findByNormalizedText(text, orgId, limit)` + standard CRUD |
| `MentionRecordRepo` | `server/src/db/repositories.ts` | Standard CRUD operations |

### IncrementalClusterer Domain Stub

**Current file**: `packages/knowledge/domain/src/services/IncrementalClusterer.service.ts`

```typescript
export interface IncrementalClustererService {
  readonly cluster: (
    mentions: ReadonlyArray<MentionRecordModel>
  ) => Effect.Effect<void, ClusterError>;
}

export class IncrementalClusterer extends Effect.Service<IncrementalClusterer>()(
  $I`IncrementalClusterer`,
  {
    accessors: true,
    effect: Effect.gen(function* () {
      const service: IncrementalClustererService = {
        cluster: Effect.fn(function* (mentions) {
          yield* Effect.logDebug("IncrementalClusterer.cluster stub called").pipe(
            Effect.annotateLogs({ mentionCount: A.length(mentions) })
          );
        }, (effect, mentions) => effect.pipe(
          Effect.withSpan("IncrementalClusterer.cluster", {
            attributes: { mentionCount: A.length(mentions) },
          }),
          Effect.mapError((error) => new ClusterError({
            message: `Clustering failed: ${String(error)}`,
            cause: error,
          }))
        ))
      };
      return service;
    }),
  }
) {}
```

### IncrementalClustererLive Implementation Sketch

```typescript
// packages/knowledge/server/src/EntityResolution/IncrementalClustererLive.ts
import { IncrementalClusterer } from "@beep/knowledge-domain/services";
import { Policy } from "@beep/shared-domain";
import * as Layer from "effect/Layer";
import * as Effect from "effect/Effect";
import { EntityRegistry } from "./EntityRegistry";
import { MergeHistoryLive } from "./MergeHistoryLive";
import { EntityRepo } from "../db/repos/Entity.repo";

export const IncrementalClustererLive = Layer.effect(
  IncrementalClusterer,
  Effect.gen(function* () {
    const entityRegistry = yield* EntityRegistry;
    const mergeHistory = yield* MergeHistory;
    const entityRepo = yield* EntityRepo;
    const authContext = yield* Policy.AuthContext;
    const organizationId = authContext.session.activeOrganizationId;

    return {
      cluster: Effect.fn(function* (mentions) {
        for (const mention of mentions) {
          // Stage 1: Find existing candidates
          const candidates = yield* entityRegistry.findCandidates(mention);

          if (A.isNonEmptyReadonlyArray(candidates)) {
            // Stage 2: Merge with best candidate
            const best = A.headNonEmpty(candidates); // Already sorted by similarity
            // Update mention's resolvedEntityId to best match
            // Record merge in MergeHistory
          } else {
            // Stage 3: Create new entity
            // Add to bloom filter
          }
        }
      }, (effect, mentions) => effect.pipe(
        Effect.withSpan("IncrementalClusterer.cluster"),
        Effect.mapError((error) => new ClusterError({ ... }))
      ))
    };
  })
);
```

### EntityClusterer Algorithm (for reference)

The existing `EntityClusterer` uses **agglomerative clustering** with union-find:

1. Compute pairwise embedding similarities (O(n^2))
2. Sort by similarity descending
3. Union-find merge above threshold (0.85 default)
4. Enforce max cluster size (50 default)
5. Compute cluster cohesion scores
6. Find shared types across cluster members

**Key difference for IncrementalClusterer**: Instead of O(n^2) pairwise comparison, use `EntityRegistry.findCandidates` for O(1) bloom filter + O(k) text match where k << n.

### Cross-Batch Resolution Flow

```
New Extraction Run (Document B)
  |
  v
Create MentionRecords (immutable)
  |
  v
For each MentionRecord:
  |
  +-> EntityRegistry.findCandidates(mention)
  |     |
  |     +-> Bloom filter check (O(1))
  |     +-> GIN trigram search (O(log n))
  |     +-> Embedding similarity rank (O(k), k = text matches)
  |
  +-> Candidates found?
  |     |
  |     YES → Merge:
  |     |     1. Update mention.resolvedEntityId = candidate.entity.id
  |     |     2. MergeHistory.recordMerge(source, target, confidence)
  |     |     3. CanonicalSelector.mergeAttributes if needed
  |     |
  |     NO  → Create:
  |           1. Create new Entity from MentionRecord
  |           2. Set mention.resolvedEntityId = newEntity.id
  |           3. EntityRegistry.addToBloomFilter(entity.mention)
  |
  v
All MentionRecords resolved → Extraction complete
```

### Performance Targets

| Metric | Target | Baseline (Phase 3) |
|--------|--------|---------------------|
| Single mention resolution | <50ms | Bloom filter <1ms + text search <50ms + embedding ~10ms |
| 100 mentions vs 10K corpus | <5s | ~50ms per mention × 100 = ~5s |
| Bloom filter pruning | >90% | 100% on unknowns (Phase 3 benchmark) |
| Memory (bloom filter) | <200KB | 122KB (Phase 3 benchmark) |

### Critical Lessons from Phase 3

**1. AuthContext Pattern (CRITICAL)**
- Domain services omit `organizationId` parameter
- Live layers inject `AuthContext` and extract `session.activeOrganizationId`
- Example: `MergeHistoryLive` gets org ID from AuthContext, not method params

**2. Domain vs Server Separation**
- Domain package: Service contracts (interfaces/stubs), value objects, models
- Server package: Repository implementations, Live layers, database operations
- IncrementalClusterer stub is in domain; Live layer goes in server

**3. Layer.provideMerge for Shared Dependencies**
- `Layer.provideMerge` shares single instance between services
- `Layer.merge` creates separate instances (breaks shared state)
- Critical for mutable dependencies (repos, bloom filter)

**4. Effect.fn Pattern**
- Use `Effect.fn("ServiceName.methodName")(function* (...) { ... })` for named generators
- Second arg to Effect.fn can add `Effect.withSpan`, `Effect.mapError`
- Example in EntityRegistry: `Effect.fn("EntityRegistry.findCandidates")(function* (...) { ... }, Effect.withSpan(...))`

**5. Helper Functions vs Services**
- Pure functions (normalizeText, cosineSimilarity) are helpers, NOT services
- I/O, state, lifecycle → Effect.Service
- Helpers in server: `server/src/utils/vector.ts` (cosineSimilarity), `server/src/utils/formatting.ts` (formatEntityForEmbedding)

### Pre-existing Issues (Not Phase 4 Scope)

- `documentId: S.String` in MentionRecord model should use `DocumentsEntityIds.DocumentId`
- Similar EntityId branding issues in other domain models
- These require separate cleanup spec

---

## Tier 4: Historical Context (Long-term Memory)

### Phase 1 Summary (MentionRecord Foundations)

- ✅ `MentionRecordId` EntityId definition
- ✅ `MentionRecord` domain model (immutable fields + mutable `resolvedEntityId`)
- ✅ `mention_record` table with GIN trigram index on `rawText`
- ✅ Forward-only migration strategy

### Phase 2 Summary (EntityRegistry & MergeHistory Stub)

- ✅ `MergeHistoryId` EntityId definition
- ✅ `MergeHistory` domain model with `MergeReason` enum
- ✅ `merge_history` table with indexes
- ✅ EntityCandidate and MergeParams value objects
- ✅ MergeHistory and EntityRegistry stub services
- ✅ 12 tests passing

### Phase 3 Summary (Full Implementation)

- ✅ EntityRegistry multi-stage pipeline (bloom → text → embedding)
- ✅ BloomFilter custom implementation (Uint32Array, 3 hash functions)
- ✅ MergeHistoryLive PostgreSQL persistence
- ✅ IncrementalClusterer domain stub
- ✅ 11 performance benchmarks (all targets met)
- ✅ 492 tests passing

### Architectural Decisions

#### Decision: Multi-Stage Candidate Search
- Bloom filter → GIN trigram → Embedding similarity
- Early exit at each stage for <100ms
- Proven in Phase 3 benchmarks

#### Decision: AuthContext for Organization Scoping
- Domain services are org-agnostic
- Server Live layers inject AuthContext
- `session.activeOrganizationId` provides multi-tenant isolation

#### Decision: Forward-Only Migration
- No backfill of existing Mention data
- New extractions create MentionRecords
- Existing data stays in Mention model

---

## Appendix A: File Inventory

### Files to Create (Phase 4)

| File | Purpose |
|------|---------|
| `packages/knowledge/server/src/EntityResolution/IncrementalClustererLive.ts` | Live layer implementing domain stub |
| `packages/knowledge/server/src/EntityResolution/SplitService.ts` | Entity split/unmerge operations |
| `packages/knowledge/domain/src/services/Split.service.ts` | Split service domain stub |
| `packages/knowledge/domain/src/errors/split.errors.ts` | SplitError tagged error |
| `packages/knowledge/server/test/EntityResolution/IncrementalClusterer.test.ts` | Unit tests |
| `packages/knowledge/server/test/EntityResolution/SplitService.test.ts` | Unit tests |
| `packages/knowledge/server/test/EntityResolution/CrossBatchResolution.test.ts` | E2E test |
| `packages/knowledge/server/test/benchmarks/IncrementalClusterer.bench.test.ts` | Performance |

### Files to Edit (Phase 4)

| File | Change |
|------|--------|
| `packages/knowledge/server/src/Extraction/ExtractionPipeline.ts` | Wire IncrementalClusterer into extraction flow |
| `packages/knowledge/domain/src/services/index.ts` | Export SplitService |
| `packages/knowledge/domain/src/errors/index.ts` | Export SplitError |

### Files to Read (for context)

| File | Why |
|------|-----|
| `packages/knowledge/server/src/EntityResolution/EntityClusterer.ts` | Agglomerative clustering algorithm to adapt |
| `packages/knowledge/server/src/EntityResolution/EntityRegistry.ts` | findCandidates pipeline to invoke |
| `packages/knowledge/server/src/EntityResolution/SameAsLinker.ts` | Link generation for merged entities |
| `packages/knowledge/server/src/EntityResolution/CanonicalSelector.ts` | Canonical entity selection strategies |
| `packages/knowledge/server/src/EntityResolution/MergeHistoryLive.ts` | Merge recording pattern |
| `packages/knowledge/server/src/EntityResolution/BloomFilter.ts` | Bloom filter API |
| `packages/knowledge/server/src/Embedding/EmbeddingService.ts` | Embedding API |
| `packages/knowledge/server/src/db/repositories.ts` | Repository definitions |
| `specs/knowledge-entity-resolution-v2/REFLECTION_LOG.md` | Phase 3 learnings |
| `specs/knowledge-entity-resolution-v2/LESSONS_FROM_PRIOR_SPECS.md` | Critical patterns |

---

## Appendix B: Verification Commands

```bash
# Type check (includes upstream dependencies)
bun run check --filter @beep/knowledge-server
bun run check --filter @beep/knowledge-domain

# Test suite
bun run test --filter @beep/knowledge-server
bun run test --filter @beep/knowledge-domain

# EntityId branding verification
grep -r "S.String" packages/knowledge/domain/src/entities --include="*.model.ts"

# Table column type annotation verification
grep -r "pg.text.*_id" packages/knowledge/tables/src/tables --include="*.ts" | grep -v ".\$type"
```

---

## Ready for Phase 4 Implementation

**Start Command**: Read `P4_ORCHESTRATOR_PROMPT.md` for full implementation plan.

**First Action**: Create `IncrementalClustererLive` in server package.

**Critical Reminder**: Reuse `EntityRegistry.findCandidates` for cross-batch lookup. Do NOT re-implement bloom filter/text/embedding search.

**Success Gate**: Phase 4 complete when:
- ✅ IncrementalClusterer resolves mentions against existing corpus
- ✅ Split/unmerge service handles incorrect merges
- ✅ Cross-batch E2E test passes
- ✅ Performance: <5s for 100 mentions vs 10K corpus
- ✅ All quality gates pass (check, test)
- ✅ REFLECTION_LOG.md updated
