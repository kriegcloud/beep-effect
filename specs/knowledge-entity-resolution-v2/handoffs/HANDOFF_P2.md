# Phase 2 Handoff: EntityRegistry & MergeHistory

> **Session Type**: Implementation Handoff
> **From**: Phase 1 (MentionRecord Foundations)
> **To**: Phase 2 (EntityRegistry & MergeHistory)
> **Handoff Date**: 2026-02-04
> **Status**: Phase 1 Complete ✅ | Phase 2 Ready to Start

---

## Tier 1: Critical Context (Working Memory)

### Phase 2 Goal

Build the candidate search infrastructure and merge audit trail for entity resolution:

1. **EntityRegistry Service** - Multi-stage candidate search (text normalization → bloom filter → database match → embedding similarity)
2. **MergeHistory Service** - Audit trail for entity merge decisions
3. **Supporting Infrastructure** - Schemas, errors, test layers

### Immediate Next Steps (Ready to Execute)

1. **Start Here**: Read `P2_ORCHESTRATOR_PROMPT.md` for full implementation plan
2. **First File**: Create `MergeHistoryId` in `packages/shared/domain/src/entity-ids/knowledge/ids.ts`
3. **Critical Pattern**: Use `Layer.provideMerge` for test layers (EntityRegistry and IncrementalClusterer share EntityRepo)
4. **Performance Target**: <100ms for EntityRegistry candidate search (<10K entities)
5. **Verification Command**: Run `bun run check --filter '@beep/knowledge-*'` after each file

### Blocking Issues

**NONE** - Phase 1 completed successfully, all type checks passing.

### Open Questions (Needs Orchestrator Clarification)

1. Does `packages/knowledge/domain/src/entities/entity/entity.model.ts` already exist?
2. Does `packages/knowledge/domain/src/repositories/entity.repo.ts` already exist?
3. Should Phase 2 implement bloom filter, or stub it for Phase 3?
4. Should Phase 2 integrate embedding similarity, or stub it for Phase 3?
5. Should Phase 2 establish performance baselines with real data, or use synthetic stubs?
6. Should Phase 2 generate Drizzle migrations, or defer to Phase 3?

---

## Tier 2: Execution Checklist (Episodic Memory)

### Phase 2 Implementation Tasks

#### Task 1: MergeHistoryId Definition
- [ ] Edit `packages/shared/domain/src/entity-ids/knowledge/ids.ts`
  - [ ] Add `MergeHistoryId` definition using `make("merge_history", { brand: "MergeHistoryId", actions: [...] })`
  - [ ] Add namespace declaration with `Type`, `Encoded`, `RowId`
  - [ ] Add to `Ids` export object
- [ ] Edit `packages/shared/domain/src/entity-ids/knowledge/any-id.ts`
  - [ ] Add `Ids.MergeHistoryId` to `S.Union` constructor
- [ ] Edit `packages/shared/domain/src/entity-ids/knowledge/table-name.ts`
  - [ ] Add `Ids.MergeHistoryId.tableName` to `StringLiteralKit` constructor
- [ ] Verify: `bun run check --filter '@beep/shared-domain'`

#### Task 2: MergeHistory Domain Model
- [ ] Create `packages/knowledge/domain/src/entities/merge-history/merge-history.model.ts`
  - [ ] Define `MergeReason` literal union: `"embedding_similarity" | "manual_override" | "text_exact_match"`
  - [ ] Create `Model` class extending `M.Class<Model>`
  - [ ] Use `makeFields(KnowledgeEntityIds.MergeHistoryId, { ... })`
  - [ ] Add `organizationId`, `sourceEntityId`, `targetEntityId`, `mergeReason`, `confidence`, `mergedBy`, `mergedAt`
  - [ ] Add getters: `isManualMerge`, `isAutomaticMerge`
  - [ ] Add `static readonly utils = modelKit(Model)`
- [ ] Create `packages/knowledge/domain/src/entities/merge-history/index.ts`
  - [ ] Export: `export { Model } from "./merge-history.model.js";`
- [ ] Edit `packages/knowledge/domain/src/entities/index.ts`
  - [ ] Add: `export * as MergeHistory from "./merge-history";`
- [ ] Verify EntityId branding:
  ```bash
  grep -r "S.String" packages/knowledge/domain/src/entities --include="*.model.ts"
  # Should NOT show MergeHistory model (all EntityIds should be branded)
  ```
- [ ] Verify: `bun run check --filter '@beep/knowledge-domain'`

#### Task 3: MergeHistory Table Definition
- [ ] Create `packages/knowledge/tables/src/tables/merge-history.table.ts`
  - [ ] Use `OrgTable.make(KnowledgeEntityIds.MergeHistoryId)({ ... })`
  - [ ] Add columns: `sourceEntityId`, `targetEntityId`, `mergeReason`, `confidence`, `mergedBy`, `mergedAt`
  - [ ] Add `.$type<EntityId.Type>()` to ALL foreign key columns
  - [ ] Add indexes: `organization_id`, `target_entity_id`, `source_entity_id`, `org_target` (compound)
- [ ] Edit `packages/knowledge/tables/src/tables/index.ts`
  - [ ] Add: `export * from "./merge-history.table";`
- [ ] Verify foreign key types:
  ```bash
  grep -r "pg.text.*_id" packages/knowledge/tables/src/tables --include="*.ts" | grep -v ".\$type"
  # Should return NO results (all foreign keys must have .$type<>())
  ```
- [ ] Verify: `bun run check --filter '@beep/knowledge-tables'`

#### Task 4: Supporting Schemas
- [ ] Create `packages/knowledge/domain/src/schemas/entity-candidate.schema.ts`
  - [ ] Define `EntityCandidate` class with `entity: Entity`, `similarityScore: S.Number.pipe(S.between(0, 1))`
- [ ] Create `packages/knowledge/domain/src/schemas/merge-params.schema.ts`
  - [ ] Define `MergeParams` class with fields for recordMerge parameters
- [ ] Create `packages/knowledge/domain/src/schemas/index.ts`
  - [ ] Export both schemas
- [ ] Verify: `bun run check --filter '@beep/knowledge-domain'`

#### Task 5: Error Definitions
- [ ] Create `packages/knowledge/domain/src/errors/registry.errors.ts`
  - [ ] Define `RegistryError` using `S.TaggedError<RegistryError>()`
  - [ ] Define `SimilarityError` using `S.TaggedError<SimilarityError>()`
- [ ] Create `packages/knowledge/domain/src/errors/merge.errors.ts`
  - [ ] Define `MergeError` using `S.TaggedError<MergeError>()`
- [ ] Create `packages/knowledge/domain/src/errors/index.ts`
  - [ ] Export all errors
- [ ] Verify: `bun run check --filter '@beep/knowledge-domain'`

#### Task 6: MergeHistory Service
- [ ] Create `packages/knowledge/domain/src/services/merge-history.service.ts`
  - [ ] Use `Effect.Service<MergeHistory>()("MergeHistory", { accessors: true, effect: Effect.gen(...) })`
  - [ ] Implement `recordMerge(params: MergeParams)` with `Effect.withSpan`
  - [ ] Implement `getMergeHistory(entityId)` with `Effect.withSpan`
  - [ ] Implement `getMergesByUser(userId)` with `Effect.withSpan`
  - [ ] All methods should use `Effect.mapError` for typed error handling
- [ ] Verify: `bun run check --filter '@beep/knowledge-domain'`

#### Task 7: EntityRegistry Service (Stub)
- [ ] Create `packages/knowledge/domain/src/services/entity-registry.service.ts`
  - [ ] Use `Effect.Service<EntityRegistry>()("EntityRegistry", { accessors: true, effect: Effect.gen(...) })`
  - [ ] Implement `findCandidates(mention)` returning empty array (stub)
  - [ ] Implement `bloomFilterCheck(text)` returning true (stub)
  - [ ] Implement `fetchTextMatches(text)` returning empty array (stub)
  - [ ] Implement `rankBySimilarity(mention, candidates)` returning empty array (stub)
  - [ ] Add JSDoc for performance target (<100ms)
- [ ] Verify: `bun run check --filter '@beep/knowledge-domain'`

#### Task 8: Test Layer Setup
- [ ] Create `packages/knowledge/domain/test/_shared/TestLayers.ts`
  - [ ] Define `EntityResolutionTestLayer` using `Layer.provideMerge`
  - [ ] CRITICAL: Merge `EntityRegistry.Default` and `MergeHistory.Default`, then provide `EntityRepo.Default`
  - [ ] Pattern: `Layer.provideMerge(Layer.merge(Service1, Service2), SharedDependency)`
- [ ] Verify: Visual inspection (no type check needed yet)

#### Task 9: MergeHistory Tests
- [ ] Create `packages/knowledge/domain/test/services/MergeHistory.test.ts`
  - [ ] Use `layer(EntityResolutionTestLayer)("MergeHistory", (it) => { ... })`
  - [ ] Test `recordMerge` - Verify merge recorded, retrieved via `getMergeHistory`
  - [ ] Test `getMergesByUser` - Verify user-specific merges retrieved
  - [ ] Use `strictEqual` from `@beep/testkit`
  - [ ] All tests should use `Effect.gen` and yield* pattern
- [ ] Verify: `bun run test --filter '@beep/knowledge-domain'`

#### Task 10: EntityRegistry Tests (Stub)
- [ ] Create `packages/knowledge/domain/test/services/EntityRegistry.test.ts`
  - [ ] Test `findCandidates` - Verify empty array returned (stub behavior)
  - [ ] Performance benchmark test using `live()` from `@beep/testkit`
  - [ ] Stub implementation: No entities setup, just timing baseline
- [ ] Verify: `bun run test --filter '@beep/knowledge-domain'`

#### Task 11: Final Verification
- [ ] Run full quality gates:
  ```bash
  bun run check --filter '@beep/knowledge-*'
  bun run lint --filter '@beep/knowledge-*'
  bun run test --filter '@beep/knowledge-domain'
  ```
- [ ] EntityId branding verification:
  ```bash
  grep -r "S.String" packages/knowledge/domain/src/entities --include="*.model.ts"
  grep -r "pg.text.*_id" packages/knowledge/tables/src/tables --include="*.ts" | grep -v ".\$type"
  ```
- [ ] Performance baseline documented (even if stub)

#### Task 12: Phase 2 Completion (MANDATORY)
- [ ] Update `specs/knowledge-entity-resolution-v2/REFLECTION_LOG.md` with Phase 2 learnings
- [ ] Create `specs/knowledge-entity-resolution-v2/handoffs/HANDOFF_P3.md` (full context for Phase 3)
- [ ] Create `specs/knowledge-entity-resolution-v2/handoffs/P3_ORCHESTRATOR_PROMPT.md` (copy-paste prompt)
- [ ] Verify handoff documents against completion checklist

---

## Tier 3: Technical Details (Semantic Memory)

### File Locations

**EntityId Definitions**:
- `packages/shared/domain/src/entity-ids/knowledge/ids.ts` - MentionRecordId, MergeHistoryId (Phase 2)
- `packages/shared/domain/src/entity-ids/knowledge/any-id.ts` - Union of all knowledge EntityIds
- `packages/shared/domain/src/entity-ids/knowledge/table-name.ts` - Table name literals

**Domain Models** (Phase 1 + Phase 2):
- `packages/knowledge/domain/src/entities/mention-record/mention-record.model.ts` - MentionRecord (Phase 1 ✅)
- `packages/knowledge/domain/src/entities/merge-history/merge-history.model.ts` - MergeHistory (Phase 2)

**Tables** (Phase 1 + Phase 2):
- `packages/knowledge/tables/src/tables/mention-record.table.ts` - MentionRecord table (Phase 1 ✅)
- `packages/knowledge/tables/src/tables/merge-history.table.ts` - MergeHistory table (Phase 2)

**Services** (Phase 2):
- `packages/knowledge/domain/src/services/merge-history.service.ts` - MergeHistory service
- `packages/knowledge/domain/src/services/entity-registry.service.ts` - EntityRegistry service (stub)

**Schemas** (Phase 2):
- `packages/knowledge/domain/src/schemas/entity-candidate.schema.ts` - EntityCandidate
- `packages/knowledge/domain/src/schemas/merge-params.schema.ts` - MergeParams

**Errors** (Phase 2):
- `packages/knowledge/domain/src/errors/registry.errors.ts` - RegistryError, SimilarityError
- `packages/knowledge/domain/src/errors/merge.errors.ts` - MergeError

**Tests** (Phase 2):
- `packages/knowledge/domain/test/_shared/TestLayers.ts` - Shared test layer (CRITICAL: Layer.provideMerge)
- `packages/knowledge/domain/test/services/MergeHistory.test.ts` - MergeHistory tests
- `packages/knowledge/domain/test/services/EntityRegistry.test.ts` - EntityRegistry tests (stub)

### API Signatures

#### MergeHistory Service
```typescript
export class MergeHistory extends Effect.Service<MergeHistory>()(
  "MergeHistory",
  {
    accessors: true,
    effect: Effect.gen(function* () {
      const sql = yield* Sql.Sql;
      return {
        recordMerge: (params: MergeParams) => Effect<void, MergeError>,
        getMergeHistory: (entityId: EntityId) => Effect<ReadonlyArray<MergeHistoryModel>, MergeError>,
        getMergesByUser: (userId: UserId) => Effect<ReadonlyArray<MergeHistoryModel>, MergeError>,
      };
    }),
  }
) {}
```

#### EntityRegistry Service (Stub)
```typescript
export class EntityRegistry extends Effect.Service<EntityRegistry>()(
  "EntityRegistry",
  {
    accessors: true,
    effect: Effect.gen(function* () {
      return {
        findCandidates: (mention: MentionRecord) => Effect<ReadonlyArray<EntityCandidate>, RegistryError>,
        bloomFilterCheck: (normalizedText: string) => Effect<boolean, never>,
        fetchTextMatches: (normalizedText: string) => Effect<ReadonlyArray<Entity>, DatabaseError>,
        rankBySimilarity: (mention: MentionRecord, candidates: ReadonlyArray<Entity>) => Effect<ReadonlyArray<EntityCandidate>, SimilarityError>,
      };
    }),
  }
) {}
```

### Schema Patterns

#### EntityId Branding (REQUIRED)
```typescript
// Domain model - Use branded EntityIds
export class MergeHistory extends M.Class<MergeHistory>("MergeHistory")({
  id: KnowledgeEntityIds.MergeHistoryId,           // ✅ Branded
  sourceEntityId: KnowledgeEntityIds.EntityId,     // ✅ Branded
  targetEntityId: KnowledgeEntityIds.EntityId,     // ✅ Branded
  mergedBy: BS.FieldOptionOmittable(SharedEntityIds.UserId),  // ✅ Branded (optional)
  // NOT: id: S.String  ❌
}) {}

// Table column - Use .$type<>() annotation
export const mergeHistoryTable = Table.make(KnowledgeEntityIds.MergeHistoryId)({
  sourceEntityId: pg.text("source_entity_id").notNull()
    .$type<KnowledgeEntityIds.EntityId.Type>(),   // ✅ Type annotation
  targetEntityId: pg.text("target_entity_id").notNull()
    .$type<KnowledgeEntityIds.EntityId.Type>(),   // ✅ Type annotation
  mergedBy: pg.text("merged_by")
    .$type<SharedEntityIds.UserId.Type>(),        // ✅ Type annotation
  // NOT: pg.text("source_entity_id").notNull()  ❌
});
```

#### Test Layer with Shared Dependency (CRITICAL)
```typescript
// CORRECT - Services share same EntityRepo instance
const EntityResolutionTestLayer = Layer.provideMerge(
  Layer.merge(
    EntityRegistry.Default,
    MergeHistory.Default
  ),
  EntityRepo.Default  // Shared dependency
);

// WRONG - Each service gets separate EntityRepo instance
const WrongTestLayer = Layer.merge(
  EntityRegistry.Default,
  MergeHistory.Default,
  EntityRepo.Default  // Creates TWO repo instances! Tests will break!
);
```

#### Performance Benchmark Pattern
```typescript
import { live } from "@beep/testkit";

live()("candidate search performance", () =>
  Effect.gen(function* () {
    // Setup test data
    yield* EntityRepo.bulkCreate(generateTestEntities(10000));

    // Measure with real clock
    const start = yield* Effect.clockWith(c => c.currentTimeMillis);
    const candidates = yield* EntityRegistry.findCandidates(mention);
    const end = yield* Effect.clockWith(c => c.currentTimeMillis);
    const elapsed = end - start;

    console.log(`Candidate search: ${elapsed}ms`);
    assert(elapsed < 100, `Target <100ms, got ${elapsed}ms`);
  }).pipe(Effect.provide(TestLayer))
);
```

### Error Handling Patterns

#### Tagged Errors with Specific Fields
```typescript
export class MergeError extends S.TaggedError<MergeError>()(
  $I`MergeError`,
  {
    message: S.String,
    sourceEntityId: S.optional(KnowledgeEntityIds.EntityId),
    targetEntityId: S.optional(KnowledgeEntityIds.EntityId),
  },
  $I.annotations("MergeError", {
    description: "Entity merge operation failed",
  })
) {}
```

#### Yieldable Errors (CORRECT)
```typescript
// CORRECT - Direct yield* for TaggedError instances
if (invalid) {
  return yield* new ValidationError({ message: "Bad input" });
}

// WRONG - Redundant Effect.fail wrapper
if (invalid) {
  return yield* Effect.fail(new ValidationError({ message: "Bad input" }));
}
```

### Service Composition

#### Effect.Service Pattern (REQUIRED)
```typescript
export class MyService extends Effect.Service<MyService>()(
  "MyService",
  {
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
  }
) {}
```

### Type Guards for Union Types

```typescript
// Schema with union
export const MergeReason = S.Literal(
  "embedding_similarity",
  "manual_override",
  "text_exact_match"
);

// Type guard for safe narrowing
const isManualOverride = (reason: S.Schema.Type<typeof MergeReason>): reason is "manual_override" =>
  reason === "manual_override";

// Usage
if (isManualOverride(mergeRecord.mergeReason)) {
  // TypeScript knows mergeReason is "manual_override"
  yield* auditManualMerge(mergeRecord);
}
```

---

## Tier 4: Historical Context (Long-term Memory)

### Phase 1 Learnings

**What Worked**:
1. **EntityId Definition First**: Starting with EntityId definitions unblocked all downstream work
2. **Incremental Verification**: Running `bun run check` after each file caught errors early
3. **EntityId Branding Pattern**: Using branded EntityIds + `.$type<>()` on columns provided type safety
4. **GIN Index on Text Fields**: Adding `gin_trgm_ops` index to `rawText` enables fast text similarity searches
5. **Zero-based Indexing**: Using `S.NonNegativeInt` for `chunkIndex` matched PostgreSQL array conventions

**What Didn't Work**:
1. **Initial MergeRecordId Export**: Forgot to add to `Ids` export in first attempt (caught by type check)
2. **Using `.$type<>()` in Domain Model**: Initially tried using `.$type<>()` on domain model field (WRONG - only for table columns)

**Key Learnings**:
1. **Verification Commands Critical**: Running `grep` commands for EntityId branding caught pattern violations
2. **Forward-Only Migration**: No backfill of existing `Mention` data to `MentionRecord` (preserves data integrity)
3. **Immutability Pattern**: Only `resolvedEntityId` field is mutable in MentionRecord (audit trail preservation)

### Pattern Decisions & Rationale

#### Decision 1: Two-Tier Architecture

**Decision**: MentionRecord (immutable) → Entity (mutable cluster)

**Rationale**:
- MentionRecord preserves raw LLM extraction output (immutable evidence)
- Entity aggregates MentionRecords (mutable for clustering/resolution)
- Enables re-resolution if merge decisions need reversal
- Provides audit trail for entity resolution history

**Evidence**: Ontology comparison identified this as P1 gap from effect-ontology

#### Decision 2: Forward-Only Migration

**Decision**: Do NOT backfill existing `Mention` data to `MentionRecord`

**Rationale**:
- Existing `Mention` records lack provenance fields (`extractionId`, `llmResponseHash`)
- Synthetic provenance violates data integrity principles
- Forward-only approach preserves audit trail for new extractions

**Evidence**: Architecture Foundation explicitly documented forward-only approach

#### Decision 3: GIN Index for Text Search

**Decision**: Use `gin_trgm_ops` index on `rawText` field

**Rationale**:
- Enables fast similarity searches (`SELECT * FROM mention_record WHERE rawText % 'search text'`)
- PostgreSQL trigram matching finds similar strings efficiently
- Supports bloom filter candidate retrieval strategy

**Evidence**: RDF foundation used GIN indexes for text search, achieved <100ms performance

#### Decision 4: Layer.provideMerge for Shared Dependencies

**Decision**: Use `Layer.provideMerge` in test layers when multiple services share mutable dependency

**Rationale**:
- Without `provideMerge`, each service gets separate instance of dependency
- For mutable stores (EntityRepo, RdfStore), separate instances break tests
- Tests need to populate shared store, then query via service

**Evidence**: RDF foundation, SPARQL integration, GraphRAG all use this pattern successfully

### Deferred Items (Phase 3+)

**Phase 3 Scope**:
1. EntityRegistry full implementation (bloom filter, embedding similarity)
2. IncrementalClusterer service (performance-critical clustering)
3. Entity model and EntityRepo (if not created in Phase 2)
4. Performance optimization (<100ms candidate search, <5s clustering)

**Phase 4 Scope** (Future):
1. Split/Unmerge service (conflict resolution)
2. Temporal tracking (entity evolution over time)
3. Cross-organization entity matching (if needed)

### Lessons from Prior Specs

**Critical Patterns to Remember**:
1. **Library Type Conversion Layer**: If using external libraries, isolate types at service boundary
2. **Effect.Service Always**: Use `Effect.Service` with `accessors: true` (NOT `Context.Tag`)
3. **Layer.provideMerge for Shared State**: Test layers with shared mutable dependencies MUST use `Layer.provideMerge`
4. **Helper vs Service Decision**: Use services for stateful/I/O, helpers for pure logic
5. **Effect.async for Callbacks**: Wrap callback-based libraries with `Effect.async` (one resume call only)
6. **Performance Benchmarking**: Use `live()` from `@beep/testkit` for real clock access
7. **Fluent Builders**: Use closure-based fluent builders for type-safe chaining

**Anti-Patterns to Avoid**:
1. ❌ Plain `S.String` for entity IDs (use branded EntityIds)
2. ❌ Native array/string methods (use Effect utilities: `A.map`, `Str.toLowerCase`)
3. ❌ `Effect.fail()` with yieldable errors (direct `yield*` is cleaner)
4. ❌ `bun:test` with `runPromise` (use `@beep/testkit`)
5. ❌ Premature service creation for pure functions (use helper modules)
6. ❌ Conditional properties with `exactOptionalPropertyTypes` (build object incrementally)

### Performance Targets

| Metric | Target | Rationale |
|--------|--------|-----------|
| Candidate search | <100ms | Organizations with <10K entities |
| Incremental clustering | <5s | 100 new mentions against 10K corpus |
| Bloom filter pruning | >90% | Reduce search space efficiently |

**Baseline Establishment**: Phase 2 should establish baseline (even with stubs), Phase 3 optimizes.

### Cross-Spec References

**effect-ontology Patterns**:
- `Service/WorkflowOrchestrator.ts` - Workflow definition patterns (for Phase 5+)
- `Runtime/Persistence/PostgresLayer.ts` - Persistence adapter (for Phase 5+)
- `Domain/Workflow/ExtractionWorkflow.ts` - Activity boundaries (for Phase 5+)

**beep-effect Patterns**:
- RDF foundation: Test layer with `Layer.provideMerge` (RdfStore shared by Serializer + Builder)
- SPARQL integration: Type guards for union types (sparqljs `Variable[] | [Wildcard]`)
- GraphRAG: Performance benchmarking with `live()` helper

### Known Limitations (Phase 1 → Phase 2)

1. **MentionRecord Exists, Entity Model Does Not**: Phase 2 needs to clarify if Entity model should be created or stubbed
2. **EntityRepo Does Not Exist**: Phase 2 needs minimal stub to unblock test layer
3. **BloomFilterService Not Implemented**: Phase 2 will stub with `return true` (always check)
4. **EmbeddingService Not Integrated**: Phase 2 will stub with `return empty array`
5. **Performance Baselines Are Stubs**: Phase 2 establishes timing infrastructure, Phase 3 measures real performance

### Success Metrics (Phase 2 Target)

**Functional**:
- MergeHistory service fully implemented (recordMerge, getMergeHistory, getMergesByUser)
- EntityRegistry service stubbed (all method signatures present)
- Test layer uses `Layer.provideMerge` pattern
- All EntityIds branded (no plain `S.String`)
- All foreign keys use `.$type<>()`

**Quality**:
- 100% type check passing (`bun run check`)
- Zero lint errors (`bun run lint`)
- All MergeHistory tests passing (3+ test cases)
- Performance benchmark test exists (even if stub)

**Documentation**:
- Phase 2 learnings captured in REFLECTION_LOG.md
- Handoff documents created (HANDOFF_P3.md, P3_ORCHESTRATOR_PROMPT.md)
- Performance baselines documented (even if stub values)

---

## Appendix A: EntityId Quick Reference

| EntityId | Package | Use Case |
|----------|---------|----------|
| `MentionRecordId` | `@beep/shared-domain` | Immutable mention extraction records (Phase 1 ✅) |
| `MergeHistoryId` | `@beep/shared-domain` | Entity merge audit records (Phase 2) |
| `EntityId` | `@beep/shared-domain` | Knowledge graph entities (Phase 3) |
| `OntologyId` | `@beep/shared-domain` | Ontology definitions (Phase 4+) |
| `ExtractionId` | `@beep/shared-domain` | Extraction run records (Phase 4+) |
| `UserId` | `@beep/shared-domain` | User identity (merge approver) |
| `OrganizationId` | `@beep/shared-domain` | Multi-tenant isolation |

---

## Appendix B: Verification Commands

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
bun run check --filter '@beep/knowledge-*'

# Lint check
bun run lint --filter '@beep/knowledge-*'

# Test suite
bun run test --filter '@beep/knowledge-domain'
```

---

## Appendix C: File Creation Order

**Critical Path** (must be sequential):
1. MergeHistoryId definition → Type check passes
2. MergeHistory domain model → EntityId branding verified
3. MergeHistory table → `.$type<>()` verified
4. Supporting schemas → Type check passes
5. Error definitions → Type check passes
6. MergeHistory service → Service pattern verified
7. Test layer → `Layer.provideMerge` pattern verified
8. Tests → Full quality gate passes

**Parallel Tracks** (can be done concurrently):
- Track 1: MergeHistory (EntityId → Model → Table → Service → Tests)
- Track 2: EntityRegistry stub (Service → Tests)
- Track 3: Supporting infrastructure (Schemas → Errors)

---

## Ready for Phase 2 Implementation

**Start Command**: Read `P2_ORCHESTRATOR_PROMPT.md` for full implementation plan.

**First Action**: Create `MergeHistoryId` in `packages/shared/domain/src/entity-ids/knowledge/ids.ts`.

**Critical Reminder**: Use `Layer.provideMerge` in test layers to share `EntityRepo` between services.

**Success Gate**: Phase 2 complete when all quality gates pass + handoff documents created.

**Next Phase**: Phase 3 (EntityRegistry full implementation, IncrementalClusterer, performance optimization).
