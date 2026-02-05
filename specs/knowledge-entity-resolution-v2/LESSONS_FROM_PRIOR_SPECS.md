# Lessons from Prior Knowledge Specs

> **Purpose**: Critical insights from completed knowledge specs to prevent repeating mistakes.

---

## Quick Reference

**Full Document**: [`specs/KNOWLEDGE_LESSONS_LEARNED.md`](../KNOWLEDGE_LESSONS_LEARNED.md)

**Relevant Completed Specs**:
- `knowledge-rdf-foundation` (179 tests, 3 phases)
- `knowledge-sparql-integration` (73 tests, 2 phases)
- `knowledge-reasoning-engine` (scaffolding complete)
- `knowledge-graphrag-plus` (Phases 1-2 complete)

---

## Critical Patterns for Entity Resolution v2

### 1. Two-Tier Architecture is Non-Negotiable

**Pattern**: MentionRecord (immutable) → Entity (mutable cluster)

**Benefit**: Enables re-resolution, audit trail, temporal tracking.

**Evidence**: Ontology comparison identified this as P1 gap from effect-ontology.

**Schema Reminder**:
```typescript
export class MentionRecord extends M.Class<MentionRecord>("MentionRecord")({
  // IMMUTABLE FIELDS (never modified after creation)
  id: KnowledgeEntityIds.MentionRecordId,
  extractionId: KnowledgeEntityIds.ExtractionId,
  rawText: S.String,
  startChar: S.NonNegativeInt,
  endChar: S.NonNegativeInt,
  extractorConfidence: Confidence,
  llmResponseHash: S.String,

  // MUTABLE FIELD (updated by resolution)
  resolvedEntityId: BS.FieldOptionOmittable(KnowledgeEntityIds.EntityId),
}) {}
```

**Critical**: Only `resolvedEntityId` is mutable. Everything else is immutable evidence.

---

### 2. Forward-Only Migration (No Backfill)

**Decision**: Do NOT backfill existing `Mention` data to `MentionRecord`.

**Rationale**:
- Existing `Mention` records lack provenance fields (extractionId, llmResponseHash)
- Synthetic provenance violates data integrity principles
- Forward-only approach preserves audit trail for new extractions

**Migration Strategy**:
```typescript
// New extractions: Create MentionRecord
if (isNewExtraction) {
  yield* MentionRecordRepo.create({
    rawText: mention.text,
    extractionId: extraction.id,
    llmResponseHash: hashResponse(llmOutput),
    // ... other fields
  });
}

// Legacy extractions: Continue using Mention
else {
  yield* MentionRepo.create(mention);
}
```

**Evidence**: Architecture Foundation explicitly documented forward-only approach.

---

### 3. EntityRegistry Candidate Search Strategy

**Decision**: Use normalized text + bloom filter + embedding similarity.

**Flow**:
```
New MentionRecord
  |
  v
Normalize text (lowercase, trim, remove punctuation)
  |
  v
Check bloom filter (quick negative test)
  |
  +-- Not in filter -> Create new entity
  |
  +-- In filter -> Fetch candidates (text match)
                     |
                     v
                   Rank by embedding similarity
                     |
                     v
                   Threshold check (>0.85 similarity)
                     |
                     +-- Above threshold -> Merge
                     |
                     +-- Below threshold -> Create new entity
```

**Performance Target**: <100ms for organizations with <10K entities.

**Evidence**: Ontology comparison documented this as proven pattern from effect-ontology.

---

### 4. MergeHistory is Service (NOT Helper Module)

**Decision**: MergeHistory is Effect.Service (needs database I/O).

**Rationale**:
- Writes to `entity_merge_history` table
- Needs transaction context
- Benefits from observability (Effect.withSpan)

**Pattern**:
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
          }).pipe(Effect.withSpan("MergeHistory.recordMerge")),

        getMergeHistory: (entityId: EntityId) =>
          Effect.gen(function* () {
            return yield* sql`
              SELECT * FROM entity_merge_history
              WHERE target_entity_id = ${entityId}
            `;
          }).pipe(Effect.withSpan("MergeHistory.getMergeHistory"))
      };
    })
  }
) {}
```

**Decision Criteria**: Use services for stateful/I/O operations, helpers for pure logic.

**Evidence**: All database-dependent services in completed specs use Effect.Service.

---

### 5. IncrementalClusterer Performance Critical

**Target**: <5s for 100 new mentions against 10K entity corpus.

**Optimization Strategy**:
1. **Bloom filter**: Prune 90% of candidates
2. **Text normalization**: Fast string comparison before embeddings
3. **Batch embedding lookup**: Single database query for all candidates
4. **Parallel processing**: Use `Effect.forEach` with concurrency

**Benchmark Test**:
```typescript
import { live } from "@beep/testkit";

live()("incremental clustering performance", () =>
  Effect.gen(function* () {
    // Setup: 10K existing entities
    yield* EntityRepo.bulkCreate(generateTestEntities(10000));

    const start = yield* Effect.clockWith(c => c.currentTimeMillis);
    const newMentions = generateTestMentions(100);
    yield* IncrementalClusterer.cluster(newMentions);
    const end = yield* Effect.clockWith(c => c.currentTimeMillis);
    const elapsed = end - start;

    assert(elapsed < 5000, `Clustering took ${elapsed}ms, target <5000ms`);
  }).pipe(Effect.provide(TestLayer))
);
```

**Evidence**: RDF foundation established performance baselines early, caught regressions.

---

### 6. EntityId Branding Verification Command

**Action**: Add verification step to check all EntityIds are branded.

**Commands**:
```bash
# Check domain models for plain S.String
grep -r "S.String" packages/knowledge/domain/src/entities --include="*.model.ts"

# Check table columns for missing .$type<>()
grep -r "pg.text.*_id" packages/knowledge/tables/src/tables --include="*.ts" | grep -v ".\$type"
```

**Evidence**: GraphRAG legal review caught EntityId branding issues.

**Integration**: Add to Phase 1 completion checklist.

**Schema Requirements**:
```typescript
// Domain model - REQUIRED
export class MentionRecord extends M.Class<MentionRecord>("MentionRecord")({
  id: KnowledgeEntityIds.MentionRecordId,  // ✅ Branded EntityId
  userId: SharedEntityIds.UserId,           // ✅ Branded EntityId
  // NOT: id: S.String  ❌
}) {}

// Table column - REQUIRED
export const mentionRecordTable = Table.make(KnowledgeEntityIds.MentionRecordId)({
  userId: pg.text("user_id").notNull()
    .$type<SharedEntityIds.UserId.Type>(),  // ✅ Type annotation
  // NOT: pg.text("user_id").notNull()  ❌
});
```

---

### 7. Split/Unmerge Service as Separate Phase

**Rationale**: Split/unmerge is P2 (nice-to-have), not P1 (critical).

**Phase Allocation**:
- **Phase 1**: MentionRecord, EntityRegistry, MergeHistory (P1 - critical path)
- **Phase 2**: IncrementalClusterer (P2 - important)
- **Phase 3**: Split/Unmerge service (P2 - polish)

**Benefits**:
- Early value delivery (Phase 1 enables cross-batch resolution)
- Incremental complexity (Phase 2 adds clustering optimization)
- Polish feature (Phase 3 adds conflict resolution)

**Evidence**: Ontology comparison roadmap separates P0/P1 (must-have) from P2/P3 (nice-to-have).

---

## Test Layer Patterns (CRITICAL)

### Shared Dependency Pattern

**Use Case**: EntityRegistry and IncrementalClusterer share entity store.

```typescript
// EntityRegistry depends on EntityRepo
const EntityRegistryLayer = Layer.effect(EntityRegistry, Effect.gen(function* () {
  const repo = yield* EntityRepo;
  return { /* registry implementation using repo */ };
}));

// IncrementalClusterer also depends on EntityRepo
const IncrementalClustererLayer = Layer.effect(IncrementalClusterer, Effect.gen(function* () {
  const repo = yield* EntityRepo;
  return { /* clusterer implementation using repo */ };
}));

// Test layer: Services share SAME EntityRepo instance
const TestLayer = Layer.provideMerge(
  Layer.merge(EntityRegistryLayer, IncrementalClustererLayer),
  EntityRepo.Default
);
```

**Critical**: Without `provideMerge`, each service gets separate repo instance → tests break.

**Evidence**: RDF foundation, SPARQL integration, GraphRAG all use this pattern.

---

## Library Integration Patterns

### Effect.Service Pattern (REQUIRED)

**All services MUST use**:
```typescript
export class EntityRegistry extends Effect.Service<EntityRegistry>()(
  "EntityRegistry",
  {
    accessors: true,
    effect: Effect.gen(function* () {
      const repo = yield* EntityRepo;
      return {
        findCandidates: (mention: MentionRecord) =>
          Effect.gen(function* () {
            // implementation
          }).pipe(Effect.withSpan("EntityRegistry.findCandidates"))
      };
    }),
  }
) {}
```

**Benefits**:
- Enables `yield* EntityRegistry` instead of `yield* EntityRegistry.pipe()`
- Clean composition with `Layer.provideMerge`
- Self-documenting service dependencies via `effect:` parameter

**Evidence**: All completed specs standardized on this pattern.

---

## Anti-Patterns to Avoid

### ❌ Plain String for Entity IDs

**WRONG**:
```typescript
export class MentionRecord extends M.Class<MentionRecord>("MentionRecord")({
  id: S.String,  // ❌ Missing branded EntityId!
  userId: S.String,  // ❌ Missing branded EntityId!
}) {}

export const mentionRecordTable = Table.make(KnowledgeEntityIds.MentionRecordId)({
  userId: pg.text("user_id").notNull(),  // ❌ Missing .$type<>()
});
```

**CORRECT**:
```typescript
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";

export class MentionRecord extends M.Class<MentionRecord>("MentionRecord")({
  id: KnowledgeEntityIds.MentionRecordId,  // ✅ Branded EntityId
  userId: SharedEntityIds.UserId,           // ✅ Branded EntityId
}) {}

export const mentionRecordTable = Table.make(KnowledgeEntityIds.MentionRecordId)({
  userId: pg.text("user_id").notNull()
    .$type<SharedEntityIds.UserId.Type>(),  // ✅ Type annotation
});
```

**Impact**: Without `.$type<>()`, type-unsafe joins compile but fail at runtime.

---

### ❌ Using Native Array/String Methods

**WRONG**:
```typescript
const normalized = entities.map(e => e.name.toLowerCase().trim());
const sorted = normalized.sort();
```

**CORRECT**:
```typescript
import * as A from "effect/Array";
import * as Str from "effect/String";
const normalized = A.map(entities, e => Str.toLowerCase(Str.trim(e.name)));
const sorted = A.sort(normalized, Order.string);
```

**Enforcement**: Lint rules catch native methods, remediation required.

---

### ❌ Effect.fail() with Yieldable Errors

**WRONG**:
```typescript
if (invalid) {
  return yield* Effect.fail(new ValidationError({ message: "Bad input" }));
}
```

**CORRECT**:
```typescript
if (invalid) {
  return yield* new ValidationError({ message: "Bad input" });
}
```

**Rationale**: `S.TaggedError` instances are yieldable - direct `yield*` is cleaner.

---

### ❌ Conditional Property with exactOptionalPropertyTypes

**WRONG**:
```typescript
const entity: EntityType = {
  id: entityId,
  name: entityName,
  attributes: maybeAttributes // ❌ Type error if undefined!
};
```

**CORRECT**:
```typescript
const entity: EntityType = { id: entityId, name: entityName };
if (maybeAttributes !== undefined) {
  return { ...entity, attributes: maybeAttributes };
}
return entity;
```

**Evidence**: GraphRAG Phase 2 encountered this during entity formatting.

---

## Nested Loop Join Pattern

**Use Case**: Joining MentionRecords with Entity candidates across resolution rounds.

```typescript
const joinMentionsToCandidates = (
  mentions: ReadonlyArray<MentionRecord>,
  registry: EntityRegistry
): Effect.Effect<ReadonlyArray<ResolutionPair>> =>
  Effect.reduce(
    mentions,
    [] as ReadonlyArray<ResolutionPair>,
    (pairs, mention) =>
      Effect.flatMap(
        registry.findCandidates(mention),
        (candidates) => Effect.succeed([...pairs, { mention, candidates }])
      )
  );
```

**Complexity**: O(n × m) acceptable for <100K records, documented for future optimization.

**Evidence**: SPARQL service uses this for BGP execution.

---

## Type Guards for Union Type Safety

**Use Case**: Safely handling schema union types (EntityState, MergeReason).

```typescript
// Schema with union
export const MergeReason = S.Literal(
  "embedding_similarity",
  "manual_override",
  "text_exact_match"
);

// Type guard for safe narrowing
const isManualOverride = (reason: MergeReason): reason is "manual_override" =>
  reason === "manual_override";

// Usage in resolution logic
if (isManualOverride(mergeRecord.reason)) {
  // TypeScript knows reason is "manual_override"
  yield* auditManualMerge(mergeRecord);
}
```

**Benefits**: Compile-time type safety, no runtime type assertions.

---

## Verification Checklist

Before declaring Phase 1 complete:

- [ ] All EntityIds use branded types (run verification commands)
- [ ] All table columns with `_id` suffix have `.$type<>()` annotation
- [ ] MentionRecord schema follows immutability pattern (only `resolvedEntityId` mutable)
- [ ] Forward-only migration strategy documented (no backfill)
- [ ] EntityRegistry candidate search strategy documented
- [ ] Performance targets documented (<100ms candidate search, <5s clustering)
- [ ] Test layers use `Layer.provideMerge` for shared EntityRepo
- [ ] All services use `Effect.Service` with `accessors: true`
- [ ] All tests use `@beep/testkit` (no `bun:test` with `runPromise`)

---

## Phase Completion Gate (MANDATORY)

Phase N is NOT complete until:

- [ ] Phase work implemented and verified (`bun run check`)
- [ ] REFLECTION_LOG.md updated with phase learnings
- [ ] `handoffs/HANDOFF_P[N+1].md` created (full context document)
- [ ] `handoffs/P[N+1]_ORCHESTRATOR_PROMPT.md` created (copy-paste prompt)
- [ ] Both handoff files pass verification checklist

**Evidence**: All completed multi-phase specs have handoff documents enabling clean session transitions.

---

## Performance Targets Summary

| Metric | Target | Rationale |
|--------|--------|-----------|
| Candidate search | <100ms | Organizations with <10K entities |
| Incremental clustering | <5s | 100 new mentions against 10K corpus |
| Bloom filter pruning | >90% | Reduce search space efficiently |

**Baseline Establishment**: Run performance benchmarks in Phase 1 to catch regressions.

**Test Pattern**: Use `live()` from `@beep/testkit` for real clock access.

---

## Additional Resources

- **Full Lessons Document**: [`specs/KNOWLEDGE_LESSONS_LEARNED.md`](../KNOWLEDGE_LESSONS_LEARNED.md)
- **Pattern Library**: Section in lessons document with 5 reusable patterns
- **Anti-Patterns**: Section with 6 approaches to avoid
- **Testing Strategies**: Test runner selection matrix, mock patterns
- **Error Handling**: Domain error placement, tagged error patterns
- **Architecture Decisions**: Forward-only migration, two-tier architecture rationale

**Reading Order**:
1. This document (quick reference)
2. Full lessons document (comprehensive details)
3. Relevant REFLECTION_LOG.md from completed specs
4. Implementation ROADMAP from ontology comparison
