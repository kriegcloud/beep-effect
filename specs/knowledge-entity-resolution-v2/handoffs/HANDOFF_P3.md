# Phase 3 Handoff: Full EntityRegistry & IncrementalClusterer Implementation

> **Session Type**: Implementation Handoff
> **From**: Phase 2 (EntityRegistry & MergeHistory Stub)
> **To**: Phase 3 (Full Implementation)
> **Handoff Date**: 2026-02-04
> **Status**: Phase 2 Complete ✅ | Phase 3 Ready to Start

---

## Tier 1: Critical Context (Working Memory)

### Phase 3 Goal

Implement the full entity resolution pipeline with database integration and performance optimization:

1. **MergeHistory Full Implementation** - Replace stub with PostgreSQL persistence via SqlClient
2. **EntityRegistry Full Implementation** - Multi-stage candidate search (bloom filter → text match → embedding similarity)
3. **EntityRepo Integration** - Shared repository layer for entity data access
4. **Performance Optimization** - Meet targets: <100ms candidate search, <5s incremental clustering

### Immediate Next Steps (Ready to Execute)

1. **Start Here**: Read `P3_ORCHESTRATOR_PROMPT.md` for full implementation plan
2. **First File**: Create `EntityRepo` in `packages/knowledge/domain/src/repositories/entity.repo.ts`
3. **Critical Pattern**: Use `Layer.provideMerge` to share `EntityRepo` between `EntityRegistry` and `MergeHistory`
4. **Performance Testing**: Use `live()` from `@beep/testkit` for real clock benchmarks
5. **Verification Commands**: Run after each service implementation:
   ```bash
   bun run check --filter @beep/knowledge-domain
   bun run test --filter @beep/knowledge-domain
   ```

### Blocking Issues

**NONE** - Phase 2 completed successfully with:
- ✅ MergeHistory domain model, table, stub service
- ✅ EntityRegistry stub service with method signatures
- ✅ EntityCandidate and MergeParams value objects
- ✅ Test layers with `Layer.provideMerge` pattern
- ✅ 12 tests passing (5 MergeHistory, 6 EntityRegistry, 1 baseline)
- ✅ All quality gates passing

### Open Questions (Needs Orchestrator Clarification)

1. **EntityRepo Scope**: Should EntityRepo also manage `MentionRecord` queries, or only `Entity`?
2. **Bloom Filter Library**: Use existing bloom filter library, or implement custom?
3. **Embedding Service**: Does `@beep/knowledge-server` already have an embedding service, or create new?
4. **GIN Index**: Should Phase 3 include Drizzle migration for GIN trigram index on entity names?
5. **Performance Baseline**: Use real data or synthetic test data for performance benchmarks?
6. **IncrementalClusterer**: Stub in Phase 3, or fully implement with clustering logic?

---

## Tier 2: Execution Checklist (Episodic Memory)

### Phase 3 Implementation Tasks

#### Task 1: EntityRepo Creation
- [ ] Create `packages/knowledge/domain/src/repositories/entity.repo.ts`
  - [ ] Use `Effect.Service<EntityRepo>()("EntityRepo", { accessors: true, effect: Effect.gen(...) })`
  - [ ] Implement `findById(entityId: EntityId)` → `Effect<Option<Entity>, DatabaseError>`
  - [ ] Implement `findByNormalizedText(text: string)` → `Effect<ReadonlyArray<Entity>, DatabaseError>`
  - [ ] Implement `findByOrganization(orgId: OrganizationId)` → `Effect<ReadonlyArray<Entity>, DatabaseError>`
  - [ ] Implement `create(entity: Entity)` → `Effect<Entity, DatabaseError>`
  - [ ] Implement `bulkCreate(entities: ReadonlyArray<Entity>)` → `Effect<ReadonlyArray<Entity>, DatabaseError>`
  - [ ] All methods use `Effect.withSpan` for observability
- [ ] Verify: `bun run check --filter @beep/knowledge-domain`

#### Task 2: MergeHistory Full Implementation
- [ ] Edit `packages/knowledge/domain/src/services/MergeHistory.service.ts`
  - [ ] Replace stub `effect: Effect.gen(...)` with real implementation
  - [ ] Add `const sql = yield* Sql.Sql` dependency
  - [ ] Implement `recordMerge(params: MergeParams)`:
    ```typescript
    yield* sql`INSERT INTO entity_merge_history ${sql.insert(params)}`
    ```
  - [ ] Implement `getMergeHistory(entityId)`:
    ```typescript
    yield* sql`SELECT * FROM entity_merge_history WHERE target_entity_id = ${entityId} ORDER BY merged_at DESC`
    ```
  - [ ] Implement `getMergesByUser(userId)`:
    ```typescript
    yield* sql`SELECT * FROM entity_merge_history WHERE merged_by = ${userId} ORDER BY merged_at DESC`
    ```
  - [ ] Use `Effect.mapError` to wrap database errors as `MergeError`
  - [ ] Preserve `Effect.withSpan` calls for observability
- [ ] Verify: Tests pass with real database operations
- [ ] Verify: `bun run test --filter @beep/knowledge-domain` (MergeHistory tests)

#### Task 3: EntityRegistry Bloom Filter Implementation
- [ ] Edit `packages/knowledge/domain/src/services/entity-registry.service.ts`
  - [ ] Add bloom filter dependency (TBD: use library or custom implementation)
  - [ ] Implement `bloomFilterCheck(normalizedText)`:
    ```typescript
    const filter = yield* BloomFilter;
    return yield* filter.contains(normalizedText);
    ```
  - [ ] Update `findCandidates` to call `bloomFilterCheck` before database query
  - [ ] If bloom filter returns `false`, short-circuit with empty array
- [ ] Verify: Bloom filter prunes candidates (>90% reduction on test data)
- [ ] Verify: `bun run test --filter @beep/knowledge-domain` (EntityRegistry bloom filter tests)

#### Task 4: EntityRegistry Text Match Implementation
- [ ] Edit `packages/knowledge/domain/src/services/entity-registry.service.ts`
  - [ ] Add `EntityRepo` dependency: `const entityRepo = yield* EntityRepo`
  - [ ] Implement `fetchTextMatches(normalizedText)`:
    ```typescript
    // Use GIN trigram index for similarity search
    return yield* entityRepo.findByNormalizedText(normalizedText);
    ```
  - [ ] Update `findCandidates` to call `fetchTextMatches` after bloom filter check
- [ ] Verify: Text match returns candidate entities from database
- [ ] Verify: `bun run test --filter @beep/knowledge-domain` (EntityRegistry text match tests)

#### Task 5: EntityRegistry Embedding Similarity Implementation
- [ ] Edit `packages/knowledge/domain/src/services/entity-registry.service.ts`
  - [ ] Add `EmbeddingService` dependency (TBD: check if exists in `@beep/knowledge-server`)
  - [ ] Implement `rankBySimilarity(mention, candidates)`:
    ```typescript
    const embeddingService = yield* EmbeddingService;
    const mentionEmbedding = yield* embeddingService.embed(mention.rawText);

    const ranked = yield* Effect.forEach(candidates, (entity) =>
      Effect.gen(function* () {
        const entityEmbedding = yield* embeddingService.embed(entity.name);
        const similarity = cosineSimilarity(mentionEmbedding, entityEmbedding);
        return new EntityCandidate({ entity, similarityScore: similarity });
      })
    );

    return A.sort(ranked, Order.reverse(Order.mapInput(Order.number, (c) => c.similarityScore)));
    ```
  - [ ] Update `findCandidates` to call `rankBySimilarity` on text match results
  - [ ] Apply threshold filter (e.g., `similarityScore > 0.85`)
- [ ] Verify: Candidates ranked by embedding similarity
- [ ] Verify: `bun run test --filter @beep/knowledge-domain` (EntityRegistry similarity tests)

#### Task 6: Test Layer Integration
- [ ] Edit `packages/knowledge/domain/test/_shared/TestLayers.ts`
  - [ ] Update `EntityResolutionTestLayer` to include real dependencies:
    ```typescript
    const EntityResolutionTestLayer = Layer.provideMerge(
      Layer.merge(
        EntityRegistry.Default,
        MergeHistory.Default
      ),
      Layer.merge(
        EntityRepo.Default,
        Sql.SqlLive  // Real database connection for integration tests
      )
    );
    ```
  - [ ] Create separate stub layer for unit tests:
    ```typescript
    const EntityResolutionStubLayer = Layer.merge(
      EntityRegistry.Default,
      MergeHistory.Default,
      EntityRepo.Test  // Stub repository
    );
    ```
- [ ] Verify: Integration tests use real database, unit tests use stubs

#### Task 7: MergeHistory Integration Tests
- [ ] Edit `packages/knowledge/domain/test/services/MergeHistory.test.ts`
  - [ ] Replace stub expectations with real database operations
  - [ ] Test `recordMerge` → verify row inserted in `entity_merge_history` table
  - [ ] Test `getMergeHistory` → verify merge records retrieved
  - [ ] Test `getMergesByUser` → verify user-specific filter works
  - [ ] Add test for concurrent merge operations (two merges at same time)
- [ ] Verify: All MergeHistory tests pass with real database
- [ ] Verify: `bun run test --filter @beep/knowledge-domain`

#### Task 8: EntityRegistry Integration Tests
- [ ] Edit `packages/knowledge/domain/test/services/EntityRegistry.test.ts`
  - [ ] Replace stub expectations with real bloom filter and database queries
  - [ ] Test `bloomFilterCheck` → verify false negatives (text definitely not in filter)
  - [ ] Test `fetchTextMatches` → verify GIN trigram index returns similar entities
  - [ ] Test `rankBySimilarity` → verify candidates ranked by cosine similarity
  - [ ] Test `findCandidates` end-to-end → verify full pipeline works
  - [ ] Add edge cases: empty organization, no candidates, exact match
- [ ] Verify: All EntityRegistry tests pass with real dependencies
- [ ] Verify: `bun run test --filter @beep/knowledge-domain`

#### Task 9: Performance Benchmarks
- [ ] Create `packages/knowledge/domain/test/benchmarks/EntityRegistry.bench.ts`
  - [ ] Use `live()` from `@beep/testkit` for real clock access
  - [ ] Benchmark `findCandidates` with 10K entities:
    ```typescript
    live()("candidate search performance", () =>
      Effect.gen(function* () {
        yield* EntityRepo.bulkCreate(generateTestEntities(10000));

        const start = yield* Effect.clockWith(c => c.currentTimeMillis);
        const candidates = yield* EntityRegistry.findCandidates(testMention);
        const end = yield* Effect.clockWith(c => c.currentTimeMillis);
        const elapsed = end - start;

        console.log(`Candidate search: ${elapsed}ms`);
        assert(elapsed < 100, `Target <100ms, got ${elapsed}ms`);
      }).pipe(Effect.provide(TestLayer))
    );
    ```
  - [ ] Document baseline performance in test output
  - [ ] Benchmark bloom filter pruning effectiveness (% candidates eliminated)
- [ ] Verify: Performance targets met (<100ms candidate search)

#### Task 10: IncrementalClusterer Service (Stub)
- [ ] Create `packages/knowledge/domain/src/services/IncrementalClusterer.service.ts`
  - [ ] Use `Effect.Service<IncrementalClusterer>()("IncrementalClusterer", { accessors: true, effect: Effect.gen(...) })`
  - [ ] Define interface: `cluster(mentions: ReadonlyArray<MentionRecord>)` → `Effect<void, ClusterError>`
  - [ ] Stub implementation: Log method call, return success
  - [ ] Add JSDoc: "Performance target: <5s for 100 mentions against 10K corpus"
- [ ] Create stub tests in `packages/knowledge/domain/test/services/IncrementalClusterer.test.ts`
- [ ] Verify: Stub compiles and tests pass

#### Task 11: Final Quality Gate
- [ ] Run full verification suite:
  ```bash
  bun run check --filter @beep/knowledge-domain
  bun run lint --filter @beep/knowledge-domain
  bun run test --filter @beep/knowledge-domain
  ```
- [ ] EntityId branding verification:
  ```bash
  grep -r "S.String" packages/knowledge/domain/src/entities --include="*.model.ts"
  grep -r "pg.text.*_id" packages/knowledge/tables/src/tables --include="*.ts" | grep -v ".\$type"
  ```
- [ ] Performance benchmarks documented in test output
- [ ] All integration tests passing with real database

#### Task 12: Phase 3 Completion (MANDATORY)
- [ ] Update `specs/knowledge-entity-resolution-v2/REFLECTION_LOG.md` with Phase 3 learnings
- [ ] Document performance baselines (candidate search time, bloom filter efficiency)
- [ ] Create Phase 4 handoff if needed, or mark spec as COMPLETE
- [ ] Verify handoff documents against completion checklist

---

## Tier 3: Technical Details (Semantic Memory)

### Phase 2 Completion Summary

**Files Created**:
- ✅ `packages/shared/domain/src/entity-ids/knowledge/ids.ts` - `MergeHistoryId` added
- ✅ `packages/knowledge/domain/src/entities/merge-history/merge-history.model.ts` - Domain model with `MergeReason` enum
- ✅ `packages/knowledge/tables/src/tables/merge-history.table.ts` - Table with `.$type<>()` on foreign keys
- ✅ `packages/knowledge/domain/src/value-objects/EntityCandidate.value.ts` - EntityCandidate schema
- ✅ `packages/knowledge/domain/src/value-objects/MergeParams.value.ts` - MergeParams schema
- ✅ `packages/knowledge/domain/src/services/MergeHistory.service.ts` - STUB service
- ✅ `packages/knowledge/domain/src/services/entity-registry.service.ts` - STUB service
- ✅ `packages/knowledge/domain/src/services/index.ts` - Service exports
- ✅ `packages/knowledge/domain/test/_shared/TestLayers.ts` - Test layer with `Layer.provideMerge`
- ✅ `packages/knowledge/domain/test/services/MergeHistory.test.ts` - 5 stub tests
- ✅ `packages/knowledge/domain/test/services/EntityRegistry.test.ts` - 6 stub tests

**Quality Gates**:
- ✅ Type check: `bun run check --filter @beep/knowledge-domain` - FULL TURBO
- ✅ Test suite: `bun run test --filter @beep/knowledge-domain` - 12 pass, 0 fail
- ✅ EntityId branding: All foreign keys use branded types + `.$type<>()`
- ✅ Service pattern: All services use `Effect.Service` with `accessors: true`

### File Locations (Phase 3)

**New Files to Create**:
- `packages/knowledge/domain/src/repositories/entity.repo.ts` - EntityRepo service
- `packages/knowledge/domain/src/services/IncrementalClusterer.service.ts` - IncrementalClusterer stub
- `packages/knowledge/domain/test/services/IncrementalClusterer.test.ts` - Stub tests
- `packages/knowledge/domain/test/benchmarks/EntityRegistry.bench.ts` - Performance benchmarks

**Files to Edit**:
- `packages/knowledge/domain/src/services/MergeHistory.service.ts` - Replace stub with SQL implementation
- `packages/knowledge/domain/src/services/entity-registry.service.ts` - Implement bloom filter, text match, embedding similarity
- `packages/knowledge/domain/test/_shared/TestLayers.ts` - Add real database dependencies
- `packages/knowledge/domain/test/services/MergeHistory.test.ts` - Integration tests with real database
- `packages/knowledge/domain/test/services/EntityRegistry.test.ts` - Integration tests with real dependencies

### API Signatures

#### EntityRepo Service
```typescript
export class EntityRepo extends Effect.Service<EntityRepo>()(
  "EntityRepo",
  {
    accessors: true,
    effect: Effect.gen(function* () {
      const sql = yield* Sql.Sql;
      return {
        findById: (entityId: EntityId) =>
          Effect<Option<Entity>, DatabaseError>,
        findByNormalizedText: (text: string) =>
          Effect<ReadonlyArray<Entity>, DatabaseError>,
        findByOrganization: (orgId: OrganizationId) =>
          Effect<ReadonlyArray<Entity>, DatabaseError>,
        create: (entity: Entity) =>
          Effect<Entity, DatabaseError>,
        bulkCreate: (entities: ReadonlyArray<Entity>) =>
          Effect<ReadonlyArray<Entity>, DatabaseError>,
      };
    }),
  }
) {}
```

#### MergeHistory Service (Full Implementation)
```typescript
export class MergeHistory extends Effect.Service<MergeHistory>()(
  "MergeHistory",
  {
    accessors: true,
    effect: Effect.gen(function* () {
      const sql = yield* Sql.Sql;
      return {
        recordMerge: (params: MergeParams) =>
          Effect.gen(function* () {
            yield* sql`INSERT INTO entity_merge_history ${sql.insert(params)}`;
          }).pipe(
            Effect.withSpan("MergeHistory.recordMerge"),
            Effect.mapError((error) => new MergeError({ message: String(error), ...params }))
          ),

        getMergeHistory: (entityId: EntityId) =>
          Effect.gen(function* () {
            return yield* sql<MergeHistoryModel>`
              SELECT * FROM entity_merge_history
              WHERE target_entity_id = ${entityId}
              ORDER BY merged_at DESC
            `;
          }).pipe(
            Effect.withSpan("MergeHistory.getMergeHistory"),
            Effect.mapError((error) => new MergeError({ message: String(error), targetEntityId: entityId }))
          ),

        getMergesByUser: (userId: UserId) =>
          Effect.gen(function* () {
            return yield* sql<MergeHistoryModel>`
              SELECT * FROM entity_merge_history
              WHERE merged_by = ${userId}
              ORDER BY merged_at DESC
            `;
          }).pipe(
            Effect.withSpan("MergeHistory.getMergesByUser"),
            Effect.mapError((error) => new MergeError({ message: String(error) }))
          ),
      };
    }),
  }
) {}
```

#### EntityRegistry Service (Full Implementation)
```typescript
export class EntityRegistry extends Effect.Service<EntityRegistry>()(
  "EntityRegistry",
  {
    accessors: true,
    effect: Effect.gen(function* () {
      const entityRepo = yield* EntityRepo;
      const bloomFilter = yield* BloomFilter;  // TBD: library or custom
      const embeddingService = yield* EmbeddingService;  // TBD: check if exists

      return {
        findCandidates: (mention: MentionRecordModel) =>
          Effect.gen(function* () {
            const normalizedText = normalizeText(mention.rawText);

            // Stage 1: Bloom filter check (quick negative test)
            const mayExist = yield* bloomFilter.contains(normalizedText);
            if (!mayExist) {
              return A.empty<EntityCandidate>();
            }

            // Stage 2: Database text match (GIN trigram index)
            const textMatches = yield* entityRepo.findByNormalizedText(normalizedText);
            if (A.isEmptyReadonlyArray(textMatches)) {
              return A.empty<EntityCandidate>();
            }

            // Stage 3: Embedding similarity ranking
            const mentionEmbedding = yield* embeddingService.embed(mention.rawText);
            const ranked = yield* Effect.forEach(textMatches, (entity) =>
              Effect.gen(function* () {
                const entityEmbedding = yield* embeddingService.embed(entity.name);
                const similarity = cosineSimilarity(mentionEmbedding, entityEmbedding);
                return new EntityCandidate({ entity, similarityScore: similarity });
              })
            );

            // Filter by threshold and sort
            return F.pipe(
              ranked,
              A.filter((c) => c.similarityScore > 0.85),
              A.sort(Order.reverse(Order.mapInput(Order.number, (c) => c.similarityScore)))
            );
          }).pipe(
            Effect.withSpan("EntityRegistry.findCandidates"),
            Effect.mapError((error) => new RegistryError({ message: String(error) }))
          ),

        bloomFilterCheck: (normalizedText: string) =>
          bloomFilter.contains(normalizedText).pipe(
            Effect.withSpan("EntityRegistry.bloomFilterCheck")
          ),

        fetchTextMatches: (normalizedText: string) =>
          entityRepo.findByNormalizedText(normalizedText).pipe(
            Effect.withSpan("EntityRegistry.fetchTextMatches"),
            Effect.mapError((error) => new RegistryError({ message: String(error) }))
          ),

        rankBySimilarity: (mention: MentionRecordModel, candidates: ReadonlyArray<Entity>) =>
          Effect.gen(function* () {
            const mentionEmbedding = yield* embeddingService.embed(mention.rawText);
            const ranked = yield* Effect.forEach(candidates, (entity) =>
              Effect.gen(function* () {
                const entityEmbedding = yield* embeddingService.embed(entity.name);
                const similarity = cosineSimilarity(mentionEmbedding, entityEmbedding);
                return new EntityCandidate({ entity, similarityScore: similarity });
              })
            );
            return A.sort(ranked, Order.reverse(Order.mapInput(Order.number, (c) => c.similarityScore)));
          }).pipe(
            Effect.withSpan("EntityRegistry.rankBySimilarity"),
            Effect.mapError((error) => new RegistryError({ message: String(error) }))
          ),
      };
    }),
  }
) {}
```

### Helper Functions

#### Text Normalization
```typescript
// Helper function (NOT a service - pure logic)
const normalizeText = (text: string): string =>
  F.pipe(
    text,
    Str.toLowerCase,
    Str.trim,
    (s) => Str.replace(s, /[^\w\s]/g, ""),  // Remove punctuation
    (s) => Str.replace(s, /\s+/g, " ")       // Normalize whitespace
  );
```

#### Cosine Similarity
```typescript
// Helper function (NOT a service - pure math)
const cosineSimilarity = (a: ReadonlyArray<number>, b: ReadonlyArray<number>): number => {
  const dotProduct = A.reduce(
    A.zip(a, b),
    0,
    (sum, [x, y]) => sum + x * y
  );
  const magnitudeA = Math.sqrt(A.reduce(a, 0, (sum, x) => sum + x * x));
  const magnitudeB = Math.sqrt(A.reduce(b, 0, (sum, x) => sum + x * x));
  return dotProduct / (magnitudeA * magnitudeB);
};
```

### Test Layer Patterns

#### Integration Test Layer (Real Database)
```typescript
const EntityResolutionIntegrationLayer = Layer.provideMerge(
  Layer.merge(
    EntityRegistry.Default,
    MergeHistory.Default
  ),
  Layer.merge(
    EntityRepo.Default,
    Sql.SqlLive,           // Real database connection
    BloomFilter.Default,   // Real bloom filter
    EmbeddingService.Test  // Stub embeddings for deterministic tests
  )
);
```

#### Unit Test Layer (All Stubs)
```typescript
const EntityResolutionUnitLayer = Layer.merge(
  EntityRegistry.Default,
  MergeHistory.Default,
  EntityRepo.Test,       // Stub repository
  BloomFilter.Test,      // Stub bloom filter
  EmbeddingService.Test  // Stub embeddings
);
```

### Performance Benchmark Pattern

```typescript
import { live } from "@beep/testkit";

live()("candidate search <100ms for 10K entities", () =>
  Effect.gen(function* () {
    // Setup: 10K entities in database
    const testEntities = generateTestEntities(10000);
    yield* EntityRepo.bulkCreate(testEntities);

    // Measure with real clock
    const start = yield* Effect.clockWith((c) => c.currentTimeMillis);
    const candidates = yield* EntityRegistry.findCandidates(testMention);
    const end = yield* Effect.clockWith((c) => c.currentTimeMillis);
    const elapsed = end - start;

    console.log(`Candidate search: ${elapsed}ms`);
    console.log(`Candidates found: ${A.length(candidates)}`);

    assert(elapsed < 100, `Target <100ms, got ${elapsed}ms`);
  }).pipe(Effect.provide(EntityResolutionIntegrationLayer))
);
```

### Critical Lessons from Phase 2

**What Worked**:
1. **Stub-First Approach**: Creating service stubs with method signatures enabled parallel test development
2. **Layer.provideMerge Pattern**: Test layer correctly shares dependencies between services
3. **EntityId Branding**: All foreign keys use branded types + `.$type<>()` - zero type safety violations
4. **Value Objects**: EntityCandidate and MergeParams encapsulate domain concepts cleanly
5. **Incremental Verification**: Running `bun run check` after each file caught errors early

**What Didn't Work**:
1. **Initial Layer.merge Attempt**: Tried using `Layer.merge` instead of `Layer.provideMerge` - services got separate repo instances
2. **Omitting Effect.withSpan**: Initial service methods missing observability spans - added during review

**Key Learnings**:
1. **Service vs Helper Decision**: Use services for I/O (database, LLM), helpers for pure logic (text normalization, cosine similarity)
2. **Performance Baselines Early**: Even stub tests should include timing infrastructure for Phase 3 optimization
3. **Effect.mapError Consistency**: All database errors wrapped in domain-specific error types (MergeError, RegistryError)

---

## Tier 4: Historical Context (Long-term Memory)

### Phase 1 Summary (MentionRecord Foundations)

**Completed**:
- ✅ `MentionRecordId` EntityId definition
- ✅ `MentionRecord` domain model (immutable fields + mutable `resolvedEntityId`)
- ✅ `mention_record` table with GIN trigram index on `rawText`
- ✅ Forward-only migration strategy (no backfill of existing `Mention` data)

**Key Patterns**:
- Two-tier architecture: MentionRecord (immutable) → Entity (mutable cluster)
- EntityId branding verification: `grep` commands to catch plain `S.String` usage
- GIN trigram index for fast text similarity searches

### Phase 2 Summary (EntityRegistry & MergeHistory Stub)

**Completed**:
- ✅ `MergeHistoryId` EntityId definition
- ✅ `MergeHistory` domain model with `MergeReason` enum
- ✅ `merge_history` table with indexes on `organization_id`, `target_entity_id`, `source_entity_id`
- ✅ EntityCandidate and MergeParams value objects
- ✅ MergeHistory and EntityRegistry stub services
- ✅ Test layers with `Layer.provideMerge` pattern
- ✅ 12 tests (5 MergeHistory, 6 EntityRegistry, 1 baseline)

**Key Patterns**:
- Stub services with typed method signatures enable test-driven development
- `Layer.provideMerge` ensures services share mutable dependencies (EntityRepo)
- Performance baselines established early (timing infrastructure in place)

### Architectural Decisions

#### Decision 1: Multi-Stage Candidate Search

**Decision**: Use bloom filter → text match → embedding similarity pipeline

**Flow**:
```
New MentionRecord
  |
  v
Normalize text (lowercase, trim, remove punctuation)
  |
  v
Bloom filter check (quick negative test)
  |
  +-- Not in filter → Return empty array (no candidates)
  |
  +-- In filter → Fetch text matches (GIN trigram index)
                    |
                    v
                  Embedding similarity ranking (cosine similarity)
                    |
                    v
                  Filter by threshold (>0.85)
                    |
                    v
                  Return ranked candidates
```

**Rationale**:
- Bloom filter reduces database queries by 90% (negative test)
- GIN trigram index enables fast text similarity (PostgreSQL native)
- Embedding similarity provides semantic ranking (neural network approach)

**Performance Target**: <100ms for organizations with <10K entities

#### Decision 2: Helper Functions for Pure Logic

**Decision**: Text normalization and cosine similarity are helper functions, NOT services

**Rationale**:
- Pure functions without I/O or state
- Easily testable without Layer composition
- No observability overhead needed (deterministic output)

**Evidence**: SPARQL integration uses FilterEvaluator (helper), not FilterService

#### Decision 3: Layer.provideMerge for Shared EntityRepo

**Decision**: Test layers use `Layer.provideMerge` to share `EntityRepo` between services

**Rationale**:
- Without `provideMerge`, each service gets separate `EntityRepo` instance
- For mutable stores (database repos), separate instances break tests
- Tests need to populate shared repo, then query via different services

**Pattern**:
```typescript
const TestLayer = Layer.provideMerge(
  Layer.merge(ServiceA, ServiceB),
  SharedDependency  // Single instance shared by both services
);
```

**Evidence**: RDF foundation, SPARQL integration, GraphRAG all use this pattern successfully

### Performance Targets

| Metric | Target | Rationale |
|--------|--------|-----------|
| Candidate search | <100ms | Organizations with <10K entities (bloom filter + GIN index) |
| Incremental clustering | <5s | 100 new mentions against 10K corpus (Phase 4) |
| Bloom filter pruning | >90% | Reduce database query load efficiently |
| Text match precision | >80% | GIN trigram index recall (PostgreSQL default) |
| Embedding similarity threshold | >0.85 | Balance precision and recall for entity matching |

### Lessons from Completed Knowledge Specs

**Library Type Conversion Layer** (from RDF foundation):
- Isolate external library types at service boundary
- Create `to*` and `from*` conversion functions
- Domain types remain library-agnostic

**Effect.async for Callbacks** (from RDF foundation):
- Wrap callback-based libraries with `Effect.async`
- Use flag to prevent multiple `resume()` calls
- Check error parameter before processing data

**Performance Benchmarking with live()** (from RDF foundation):
- Use `live()` from `@beep/testkit` for real clock access
- Document baseline performance in test output
- Catch regressions early with performance assertions

**Type Guards for Union Types** (from SPARQL integration):
- Create type guards for safe narrowing of discriminated unions
- Avoid runtime type assertions
- Clear failure modes for unexpected types

### Known Limitations (Phase 2 → Phase 3)

1. **EntityRepo Does Not Exist**: Phase 3 must create full repository with database integration
2. **BloomFilter Not Implemented**: Phase 3 needs to choose library or implement custom
3. **EmbeddingService Unknown**: Phase 3 needs to verify if service exists in `@beep/knowledge-server`
4. **GIN Index Not Migrated**: Phase 3 may need Drizzle migration for trigram index
5. **Performance Baselines Are Stubs**: Phase 3 establishes real performance with 10K entities

### Cross-Spec References

**effect-ontology Patterns**:
- MentionRecord immutability pattern (only `resolvedEntityId` mutable)
- Two-tier architecture (evidence layer → resolution layer)
- Bloom filter + embedding similarity strategy

**beep-effect Patterns**:
- RDF foundation: Test layer with `Layer.provideMerge` (RdfStore shared by Serializer + Builder)
- SPARQL integration: Type guards for union types (sparqljs `Variable[] | [Wildcard]`)
- GraphRAG: Performance benchmarking with `live()` helper

---

## Appendix A: Verification Commands

### EntityId Branding Verification
```bash
# Check domain models for plain S.String (should NOT find entity IDs)
grep -r "S.String" packages/knowledge/domain/src/entities --include="*.model.ts"

# Expected: Only finds S.String in schema definitions (rawText, mentionType, etc.)
# Should NOT find: id: S.String, userId: S.String, etc.
```

### Table Column Type Annotation Verification
```bash
# Check table columns for missing .$type<>() (should return no results)
grep -r "pg.text.*_id" packages/knowledge/tables/src/tables --include="*.ts" | grep -v ".\$type"

# Expected: No output (all foreign keys have .$type<>())
```

### Full Quality Gate
```bash
# Type check
bun run check --filter @beep/knowledge-domain

# Lint check
bun run lint --filter @beep/knowledge-domain

# Test suite
bun run test --filter @beep/knowledge-domain
```

### Performance Baseline Documentation
```bash
# Run benchmarks and capture output
bun run test --filter @beep/knowledge-domain 2>&1 | tee performance-baseline.txt

# Expected output:
# Candidate search: 42ms (target <100ms) ✅
# Bloom filter pruning: 92% (target >90%) ✅
```

---

## Appendix B: Implementation Priority

**Critical Path** (must be sequential):
1. EntityRepo creation → Shared dependency established
2. MergeHistory full implementation → Database integration verified
3. EntityRegistry bloom filter → Negative test optimization
4. EntityRegistry text match → GIN index integration
5. EntityRegistry embedding similarity → Semantic ranking
6. Integration tests → Full pipeline validated
7. Performance benchmarks → Targets verified

**Parallel Tracks** (can be done concurrently):
- Track 1: MergeHistory (Replace stub → Integration tests)
- Track 2: EntityRegistry (Bloom filter → Text match → Embeddings → Integration tests)
- Track 3: Performance (Benchmarks → Baseline documentation)

---

## Ready for Phase 3 Implementation

**Start Command**: Read `P3_ORCHESTRATOR_PROMPT.md` for full implementation plan.

**First Action**: Create `EntityRepo` in `packages/knowledge/domain/src/repositories/entity.repo.ts`.

**Critical Reminder**: Use `Layer.provideMerge` to share `EntityRepo` between `EntityRegistry` and `MergeHistory`.

**Success Gate**: Phase 3 complete when:
- ✅ All quality gates pass (check, lint, test)
- ✅ Performance benchmarks meet targets (<100ms candidate search)
- ✅ Integration tests pass with real database
- ✅ Handoff documents created (if Phase 4 planned) OR spec marked COMPLETE

**Next Phase**: TBD - Either Phase 4 (IncrementalClusterer full implementation, Split/Unmerge service) OR mark spec COMPLETE if Phase 3 achieves all P1 goals.
