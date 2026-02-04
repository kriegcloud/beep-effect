# Phase 3 Orchestrator Prompt: Full EntityRegistry & IncrementalClusterer Implementation

> **Copy-paste this prompt into a new orchestrator session to start Phase 3 implementation.**

---

## Session Type & Role

**Session Type**: Orchestrator (Feature Lead)

**Your Role**: You are leading Phase 3 implementation of the `knowledge-entity-resolution-v2` spec. You will delegate implementation tasks to specialized agents and verify completion against success criteria.

---

## Phase 3 Goal

Implement the full entity resolution pipeline with database integration and performance optimization:

1. **MergeHistory Full Implementation** - Replace stub with PostgreSQL persistence via SqlClient
2. **EntityRegistry Full Implementation** - Multi-stage candidate search (bloom filter → text match → embedding similarity)
3. **EntityRepo Integration** - Shared repository layer for entity data access
4. **Performance Optimization** - Meet targets: <100ms candidate search, <5s incremental clustering
5. **IncrementalClusterer Stub** - Service definition for Phase 4 (if planned)

---

## Context from Phase 1 & 2

### Phase 1: MentionRecord Foundations (COMPLETE ✅)

**Artifacts Created**:
- `MentionRecordId` EntityId definition in `packages/shared/domain/src/entity-ids/knowledge/ids.ts`
- `MentionRecord` domain model (immutable fields + mutable `resolvedEntityId`)
- `mention_record` table with GIN trigram index on `rawText`
- Tests: 6 passing

**Key Patterns**:
- Two-tier architecture: MentionRecord (immutable) → Entity (mutable cluster)
- Forward-only migration (no backfill of existing `Mention` data)
- EntityId branding verification with `grep` commands

### Phase 2: EntityRegistry & MergeHistory Stub (COMPLETE ✅)

**Artifacts Created**:
- `MergeHistoryId` EntityId definition
- `MergeHistory` domain model with `MergeReason` enum
- `merge_history` table with indexes
- EntityCandidate and MergeParams value objects
- MergeHistory and EntityRegistry **stub services** (methods return empty arrays or throw "not implemented")
- Test layers with `Layer.provideMerge` pattern
- Tests: 12 passing (5 MergeHistory, 6 EntityRegistry, 1 baseline)

**Quality Gates Passed**:
- ✅ `bun run check --filter @beep/knowledge-domain` - FULL TURBO
- ✅ `bun run test --filter @beep/knowledge-domain` - 12 pass, 0 fail
- ✅ EntityId branding verification (no plain `S.String` for entity IDs)
- ✅ Table column `.$type<>()` annotations (all foreign keys typed)

---

## Phase 3 Scope

### What's Changing

**From STUB to REAL Implementation**:
1. **MergeHistory Service** - Replace `Effect.fail("not implemented")` with SQL queries
2. **EntityRegistry Service** - Replace stub methods with:
   - Bloom filter check (negative test optimization)
   - Database text match (GIN trigram index queries)
   - Embedding similarity ranking (cosine similarity)

**New Components**:
1. **EntityRepo Service** - Database repository for entity CRUD operations
2. **IncrementalClusterer Service** - Stub for Phase 4 (method signatures only)
3. **Performance Benchmarks** - Real timing tests with 10K entity corpus

**What's NOT Changing**:
- Domain models (MentionRecord, MergeHistory) - remain unchanged
- Table schemas - remain unchanged
- Value objects (EntityCandidate, MergeParams) - remain unchanged
- Test layer structure - only dependencies change (stub → real)

### Implementation Details

#### 1. EntityRepo Service

**Location**: `packages/knowledge/domain/src/repositories/entity.repo.ts`

**Methods**:
```typescript
export class EntityRepo extends Effect.Service<EntityRepo>()("EntityRepo", {
  accessors: true,
  effect: Effect.gen(function* () {
    const sql = yield* Sql.Sql;
    return {
      findById: (entityId: EntityId) => Effect<Option<Entity>, DatabaseError>,
      findByNormalizedText: (text: string) => Effect<ReadonlyArray<Entity>, DatabaseError>,
      findByOrganization: (orgId: OrganizationId) => Effect<ReadonlyArray<Entity>, DatabaseError>,
      create: (entity: Entity) => Effect<Entity, DatabaseError>,
      bulkCreate: (entities: ReadonlyArray<Entity>) => Effect<ReadonlyArray<Entity>, DatabaseError>,
    };
  }),
}) {}
```

**Dependencies**: `Sql.Sql` from `@effect/sql`

**Pattern**: Standard repository with database CRUD operations + observability spans

#### 2. MergeHistory Full Implementation

**Current State** (stub):
```typescript
recordMerge: (params) =>
  Effect.fail(
    new MergeError({
      message: "MergeHistory.recordMerge not implemented - provide implementation via Layer",
      sourceEntityId: params.sourceEntityId,
      targetEntityId: params.targetEntityId,
    })
  )
```

**Target State** (real):
```typescript
recordMerge: (params) =>
  Effect.gen(function* () {
    yield* sql`INSERT INTO entity_merge_history ${sql.insert(params)}`;
  }).pipe(
    Effect.withSpan("MergeHistory.recordMerge"),
    Effect.mapError((error) => new MergeError({ message: String(error), ...params }))
  )
```

**Critical**: Preserve `Effect.withSpan` for observability, use `Effect.mapError` to wrap database errors

#### 3. EntityRegistry Full Implementation

**Current State** (stub):
```typescript
findCandidates: (mention) =>
  Effect.gen(function* () {
    yield* Effect.logDebug("EntityRegistry.findCandidates stub called");
    return A.empty<EntityCandidate>();
  })
```

**Target State** (real):
```typescript
findCandidates: (mention) =>
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
  )
```

**Dependencies**:
- `EntityRepo` - database queries
- `BloomFilter` - TBD: use library or implement custom
- `EmbeddingService` - TBD: check if exists in `@beep/knowledge-server`

**Helper Functions** (pure logic, NOT services):
```typescript
// Text normalization
const normalizeText = (text: string): string =>
  F.pipe(
    text,
    Str.toLowerCase,
    Str.trim,
    (s) => Str.replace(s, /[^\w\s]/g, ""),
    (s) => Str.replace(s, /\s+/g, " ")
  );

// Cosine similarity
const cosineSimilarity = (a: ReadonlyArray<number>, b: ReadonlyArray<number>): number => {
  const dotProduct = A.reduce(A.zip(a, b), 0, (sum, [x, y]) => sum + x * y);
  const magnitudeA = Math.sqrt(A.reduce(a, 0, (sum, x) => sum + x * x));
  const magnitudeB = Math.sqrt(A.reduce(b, 0, (sum, x) => sum + x * x));
  return dotProduct / (magnitudeA * magnitudeB);
};
```

#### 4. IncrementalClusterer Stub

**Location**: `packages/knowledge/domain/src/services/incremental-clusterer.service.ts`

**Purpose**: Define service interface for Phase 4 (or future work)

**Pattern**:
```typescript
export class IncrementalClusterer extends Effect.Service<IncrementalClusterer>()(
  "IncrementalClusterer",
  {
    accessors: true,
    effect: Effect.gen(function* () {
      return {
        cluster: (mentions: ReadonlyArray<MentionRecord>) =>
          Effect.gen(function* () {
            yield* Effect.logDebug("IncrementalClusterer.cluster stub called", {
              mentionCount: A.length(mentions),
            });
            // Stub: Phase 4 will implement clustering logic
          }).pipe(Effect.withSpan("IncrementalClusterer.cluster"))
      };
    }),
  }
) {}
```

**JSDoc**: "Performance target: <5s for 100 mentions against 10K corpus"

---

## Critical Lessons Learned

### 1. Layer.provideMerge for Shared Dependencies (CRITICAL)

**Pattern**: When multiple services depend on the same mutable dependency (EntityRepo), use `Layer.provideMerge`

**Correct**:
```typescript
const TestLayer = Layer.provideMerge(
  Layer.merge(ServiceA, ServiceB),
  SharedDependency  // Single instance shared by both services
);
```

**Wrong**:
```typescript
const TestLayer = Layer.merge(
  ServiceA,
  ServiceB,
  SharedDependency  // Creates TWO separate instances! Tests will break!
);
```

**Evidence**: RDF foundation, SPARQL integration, GraphRAG all use `Layer.provideMerge` for shared mutable dependencies

### 2. Effect.Service Pattern (REQUIRED)

**Always use**:
```typescript
export class MyService extends Effect.Service<MyService>()("MyService", {
  accessors: true,  // Enables: yield* MyService (NOT: yield* MyService.pipe())
  effect: Effect.gen(function* () {
    const dependency = yield* DependencyService;
    return {
      operation: (input: Input) =>
        Effect.gen(function* () {
          // implementation
        }).pipe(Effect.withSpan("MyService.operation"))
    };
  }),
}) {}
```

**Never use**: `Context.Tag` (outdated pattern)

### 3. Performance Testing with live() Helper

**Pattern**: Use `live()` from `@beep/testkit` for real clock access in benchmarks

```typescript
import { live } from "@beep/testkit";

live()("candidate search <100ms", () =>
  Effect.gen(function* () {
    const start = yield* Effect.clockWith((c) => c.currentTimeMillis);
    const result = yield* operation;
    const end = yield* Effect.clockWith((c) => c.currentTimeMillis);
    const elapsed = end - start;

    console.log(`Operation: ${elapsed}ms`);
    assert(elapsed < 100, `Target <100ms, got ${elapsed}ms`);
  }).pipe(Effect.provide(TestLayer))
);
```

**Why NOT TestClock**: TestClock makes time controllable but defeats benchmarking purpose

### 4. EntityId Branding Verification Commands

**Always run after implementation**:
```bash
# Check domain models for plain S.String (should NOT find entity IDs)
grep -r "S.String" packages/knowledge/domain/src/entities --include="*.model.ts"

# Check table columns for missing .$type<>() (should return no results)
grep -r "pg.text.*_id" packages/knowledge/tables/src/tables --include="*.ts" | grep -v ".\$type"
```

**Evidence**: GraphRAG legal review caught EntityId branding issues with these commands

### 5. Helper Functions vs Services

**Use Helper Module When**:
- Pure functions (no I/O, no state)
- Algorithmic transformations (text normalization, cosine similarity)
- Already testable via pure functions

**Use Effect.Service When**:
- Stateful (holds mutable data)
- External I/O (database, LLM, HTTP)
- Needs lifecycle management (acquire/release)
- Needs observability (Effect.withSpan)

**Evidence**: SPARQL integration uses FilterEvaluator (helper), not FilterService

---

## Delegation Strategy

### Agent Selection

| Task | Agent | Rationale |
|------|-------|-----------|
| EntityRepo creation | `effect-code-writer` | Database service with Effect patterns |
| MergeHistory full implementation | `effect-code-writer` | SQL integration with Effect.Service |
| EntityRegistry full implementation | `effect-code-writer` | Multi-stage pipeline with Effect composition |
| Performance benchmarks | `test-writer` | Benchmark tests with `live()` helper |
| Code review | `code-reviewer` | Verify Effect patterns, EntityId branding |
| Final verification | `architecture-pattern-enforcer` | Verify Layer.provideMerge usage, service patterns |

### Recommended Workflow

**Phase 3a: Repository & MergeHistory** (Agent: `effect-code-writer`)
1. Create `EntityRepo` service
2. Implement `MergeHistory` full implementation (replace stubs)
3. Update test layer to use real `EntityRepo` and `Sql.Sql`
4. Update `MergeHistory` tests to use real database
5. Verify: `bun run test --filter @beep/knowledge-domain` (MergeHistory tests)

**Phase 3b: EntityRegistry Implementation** (Agent: `effect-code-writer`)
1. Implement `bloomFilterCheck` (decide: library or custom)
2. Implement `fetchTextMatches` using `EntityRepo`
3. Implement `rankBySimilarity` (check: does `EmbeddingService` exist?)
4. Implement `findCandidates` end-to-end pipeline
5. Update `EntityRegistry` tests to use real dependencies
6. Verify: `bun run test --filter @beep/knowledge-domain` (EntityRegistry tests)

**Phase 3c: Performance Benchmarks** (Agent: `test-writer`)
1. Create `packages/knowledge/domain/test/benchmarks/EntityRegistry.bench.ts`
2. Benchmark `findCandidates` with 10K entities (target: <100ms)
3. Measure bloom filter pruning effectiveness (target: >90%)
4. Document baseline performance in test output
5. Verify: Performance targets met

**Phase 3d: IncrementalClusterer Stub** (Agent: `effect-code-writer`)
1. Create `IncrementalClusterer` service with method signatures
2. Create stub tests
3. Verify: Stub compiles and tests pass

**Phase 3e: Code Review** (Agent: `code-reviewer`)
1. Verify EntityId branding (no plain `S.String`)
2. Verify table column `.$type<>()` annotations
3. Verify `Layer.provideMerge` usage in test layers
4. Verify `Effect.withSpan` in all service methods
5. Verify helper functions are pure (no Effect.Service for text normalization)

**Phase 3f: Architecture Verification** (Agent: `architecture-pattern-enforcer`)
1. Verify service composition follows Effect.Service pattern
2. Verify test layers use `Layer.provideMerge` correctly
3. Verify performance benchmarks use `live()` helper
4. Verify no anti-patterns (native array methods, plain EntityIds, etc.)

---

## Success Criteria Checklist

### Functional Criteria
- [ ] `EntityRepo` service created with CRUD operations
- [ ] `MergeHistory` service fully implemented (SQL queries, not stubs)
- [ ] `EntityRegistry` service fully implemented (bloom filter → text match → embeddings)
- [ ] `IncrementalClusterer` service stubbed (method signatures defined)
- [ ] Test layers updated to use real dependencies (`EntityRepo`, `Sql.Sql`)
- [ ] All integration tests passing with real database

### Quality Criteria
- [ ] Type check passes: `bun run check --filter @beep/knowledge-domain`
- [ ] Lint check passes: `bun run lint --filter @beep/knowledge-domain`
- [ ] Test suite passes: `bun run test --filter @beep/knowledge-domain`
- [ ] EntityId branding verified (no plain `S.String` for entity IDs)
- [ ] Table column `.$type<>()` annotations verified (all foreign keys typed)
- [ ] No Effect anti-patterns (native methods, plain EntityIds, etc.)

### Performance Criteria
- [ ] Candidate search <100ms for 10K entities
- [ ] Bloom filter pruning >90% (candidates eliminated)
- [ ] Performance baselines documented in test output
- [ ] Benchmarks use `live()` helper (real clock)

### Documentation Criteria
- [ ] Phase 3 learnings captured in `REFLECTION_LOG.md`
- [ ] Performance baselines documented (timing, pruning efficiency)
- [ ] Critical patterns documented (Layer.provideMerge, helper vs service)
- [ ] Known limitations documented (if any)

### Handoff Criteria (MANDATORY)
- [ ] Update `specs/knowledge-entity-resolution-v2/REFLECTION_LOG.md` with Phase 3 learnings
- [ ] If Phase 4 planned: Create `handoffs/HANDOFF_P4.md` and `handoffs/P4_ORCHESTRATOR_PROMPT.md`
- [ ] If spec complete: Update `README.md` status to COMPLETE

---

## Verification Commands

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

## Reference Links

### Specification Documents
- **Spec Overview**: `specs/knowledge-entity-resolution-v2/README.md`
- **Full Handoff**: `specs/knowledge-entity-resolution-v2/handoffs/HANDOFF_P3.md`
- **Lessons Learned**: `specs/KNOWLEDGE_LESSONS_LEARNED.md`
- **Prior Spec Lessons**: `specs/knowledge-entity-resolution-v2/LESSONS_FROM_PRIOR_SPECS.md`

### Pattern References
- **Effect Patterns**: `.claude/rules/effect-patterns.md` (MANDATORY - namespace imports, NEVER patterns)
- **Testing Patterns**: `.claude/commands/patterns/effect-testing-patterns.md` (Comprehensive test patterns)
- **Database Patterns**: `documentation/patterns/database-patterns.md` (Slice creation, foreign keys)

### Code References
- **Current Stub Services**:
  - `packages/knowledge/domain/src/services/merge-history.service.ts` (Phase 2 stub - REPLACE)
  - `packages/knowledge/domain/src/services/entity-registry.service.ts` (Phase 2 stub - REPLACE)
- **Test Layers**:
  - `packages/knowledge/domain/test/_shared/TestLayers.ts` (Layer.provideMerge pattern)
- **Value Objects**:
  - `packages/knowledge/domain/src/value-objects/entity-candidate.value.ts`
  - `packages/knowledge/domain/src/value-objects/merge-params.value.ts`

---

## Open Questions for Orchestrator

Before delegating to agents, clarify these decisions:

1. **EntityRepo Scope**: Should EntityRepo manage both `Entity` and `MentionRecord`, or just `Entity`?
   - Recommendation: Just `Entity` (MentionRecordRepo already exists or will be separate)

2. **Bloom Filter Library**: Use existing library (e.g., `bloom-filters` npm package) or implement custom?
   - Recommendation: Use library for Phase 3, optimize in Phase 4 if needed

3. **Embedding Service**: Does `@beep/knowledge-server` already have an embedding service?
   - Action: Check `packages/knowledge/server/src/` for existing service
   - If not: Stub with mock embeddings for Phase 3, implement in Phase 4

4. **GIN Index Migration**: Should Phase 3 include Drizzle migration for GIN trigram index?
   - Recommendation: Add migration if not already present (required for text match performance)

5. **Performance Test Data**: Use real entities from existing database, or synthetic test data?
   - Recommendation: Synthetic test data (deterministic, reproducible)

6. **IncrementalClusterer Scope**: Fully implement in Phase 3, or stub for Phase 4?
   - Recommendation: Stub in Phase 3 (method signatures only), implement in Phase 4 if planned

---

## Ready to Start Phase 3

**First Action**: Review `handoffs/HANDOFF_P3.md` for complete context.

**Agent Delegation**: Start with `effect-code-writer` for EntityRepo and MergeHistory implementation.

**Critical Reminder**: Use `Layer.provideMerge` to share `EntityRepo` between services in test layers.

**Success Gate**: Phase 3 complete when all quality gates pass + performance benchmarks meet targets + handoff documents created (if Phase 4 planned).

**Contact**: If unclear, refer to `specs/KNOWLEDGE_LESSONS_LEARNED.md` for comprehensive patterns from completed knowledge specs.
