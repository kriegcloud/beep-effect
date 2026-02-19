# Reflection Log

> Cumulative learnings from each phase of the knowledge repo SqlSchema refactor.

---

## Phase 0: Discovery & Planning

**Date**: 2026-01-22

### Key Observations

1. **Current State Analysis**
   - 8 repository files in `packages/knowledge/server/src/db/repos/`
   - 25 custom methods across 5 repos (Entity, Embedding, Relation, SameAsLink, EntityCluster)
   - 3 repos use only base CRUD (Ontology, ClassDefinition, PropertyDefinition)
   - All custom methods use raw `sql<Model>` without SqlSchema validation

2. **Pattern Discovery**
   - `db-repo.ts` factory already demonstrates correct SqlSchema usage
   - Base CRUD operations (insert, update, findById, delete) already use SqlSchema
   - Only custom extension methods need refactoring

3. **Risk Areas Identified**
   - `Embedding.repo.ts` - pgvector operations with custom `::vector` casts
   - `SameAsLink.repo.ts` - Recursive CTE for canonical resolution
   - Methods with `IN` clauses accepting arrays need careful Request schema design

### Methodology Notes

- Request schemas should be defined as `S.Class` for documentation and type inference
- Use `S.optional` with `default` for parameters with default values
- Preserve existing span attributes for observability continuity

### Patterns to Follow

```typescript
// Pattern: Request schema with defaults
class FindByOntologyRequest extends S.Class<FindByOntologyRequest>("FindByOntologyRequest")({
  ontologyId: S.String,
  organizationId: SharedEntityIds.OrganizationId,
  limit: S.optional(S.Number, { default: () => 100 }),
}) {}

// Pattern: Array parameter for IN clauses
class FindByIdsRequest extends S.Class<FindByIdsRequest>("FindByIdsRequest")({
  ids: S.Array(KnowledgeEntityIds.KnowledgeEntityId),
  organizationId: SharedEntityIds.OrganizationId,
}) {}
```

### Gotchas Discovered

1. **ParseError handling**: SqlSchema operations can fail with `ParseError` - must catch and die
2. **NoSuchElementException**: `SqlSchema.single` throws this for empty results - handle appropriately
3. **Empty array optimization**: Methods accepting arrays should short-circuit for empty input before calling SqlSchema

---

## Phase 1: Base Pattern Repos

**Date**: 2026-01-22

### Verification Results

All three base pattern repos verified successfully:

| Repo | Pattern | Status |
|------|---------|--------|
| `Ontology.repo.ts` | `DbRepo.make(KnowledgeEntityIds.OntologyId, Entities.Ontology.Model, Effect.succeed({}))` | ✓ Pass |
| `ClassDefinition.repo.ts` | `DbRepo.make(KnowledgeEntityIds.ClassDefinitionId, Entities.ClassDefinition.Model, Effect.succeed({}))` | ✓ Pass |
| `PropertyDefinition.repo.ts` | `DbRepo.make(KnowledgeEntityIds.PropertyDefinitionId, Entities.PropertyDefinition.Model, Effect.succeed({}))` | ✓ Pass |

### Type Check Results

```bash
bun run check --filter @beep/knowledge-server
# Result: 27 tasks successful, 27 cached
```

### Test Results

```bash
bun run test --filter @beep/knowledge-server
# Result: 55 tests pass, 0 fail, 149 expect() calls
```

### Key Findings

1. **Factory Pattern Already Correct**
   - `DbRepo.make()` in `packages/shared/domain/src/factories/db-repo.ts` uses SqlSchema correctly:
     - `SqlSchema.single` for insert, update (with Request/Result schemas)
     - `SqlSchema.void` for insertVoid, insertManyVoid, updateVoid, delete
     - `SqlSchema.findOne` for findById
   - Proper error handling with `ParseError` → `Effect.die`, `NoSuchElementException` → `Effect.die`

2. **Model Classes Are Valid**
   - All domain models use `M.Class` from `@effect/sql/Model`
   - All models use `makeFields()` helper providing id, createdAt, updatedAt
   - All models use branded EntityIds from `KnowledgeEntityIds`

3. **No Code Changes Required for Base Repos**
   - These repos work correctly as-is since they only use base CRUD operations
   - Phase 1 was purely verification

### Custom Methods Inventory for Phase 2+

Repos requiring SqlSchema refactoring:

| Repo | Custom Methods | Complexity |
|------|----------------|------------|
| `Entity.repo.ts` | 4 | Simple - IN clause, JSONB, COUNT |
| `Embedding.repo.ts` | 4 | Complex - pgvector similarity |
| `Relation.repo.ts` | 5 | Medium - multiple IN clauses |
| `SameAsLink.repo.ts` | 7 | Complex - recursive CTE |
| `EntityCluster.repo.ts` | 5 | Medium - JSONB, threshold queries |

**Total: 25 custom methods** needing SqlSchema refactoring

### Classification by Pattern

**Simple Patterns (Phase 2 candidates)**:
- Simple SELECT with scalar params: `findByOntology`, `findByType`, `findByPredicate`, `findByEntityType`, `findBySource`
- Single-row with Option return: `findByCacheKey`, `findByMember`, `findByCanonicalEntity`
- COUNT queries: `countByOrganization`, `countMembers`
- DELETE queries: `deleteByEntityIdPrefix`, `deleteByCanonical`, `deleteByOntology`

**Medium Patterns (Phase 3 candidates)**:
- IN clause with array params: `findByIds`, `findBySourceIds`, `findByTargetIds`, `findByEntityIds`
- Threshold queries: `findHighConfidence`, `findHighCohesion`

**Complex Patterns (Phase 3 candidates)**:
- pgvector similarity: `findSimilar` (custom vector string format)
- Recursive CTE: `resolveCanonical` (chain following)

---

## Phase 2: Simple Custom Methods

**Date**: 2026-01-22

### Repos Refactored

| Repo | Methods Refactored | SqlSchema Functions Used |
|------|-------------------|-------------------------|
| `Entity.repo.ts` | 4 | `findAll` (3), `findAll` for count |
| `EntityCluster.repo.ts` | 4 | `findOne` (2), `findAll` (2) |

Note: `EntityCluster.deleteByOntology` kept raw SQL since it returns count (not supported by `SqlSchema.void`).

### Implementation Patterns Applied

**1. Request Schema Definition**:
```typescript
class FindByIdsRequest extends S.Class<FindByIdsRequest>("FindByIdsRequest")({
  ids: S.Array(KnowledgeEntityIds.KnowledgeEntityId),
  organizationId: SharedEntityIds.OrganizationId,
}) {}
```

**2. SqlSchema Construction**:
```typescript
const findByIdsSchema = SqlSchema.findAll({
  Request: FindByIdsRequest,
  Result: Entities.Entity.Model,
  execute: (req) => sql`
    SELECT *
    FROM ${sql(tableName)}
    WHERE organization_id = ${req.organizationId}
      AND id IN ${sql.in(req.ids)}
  `,
});
```

**3. Method Implementation**:
```typescript
const findByIds = (...) =>
  Effect.gen(function* () {
    if (A.isEmptyReadonlyArray(ids)) return [];
    return yield* findByIdsSchema({ ids: [...ids], organizationId });
  }).pipe(
    Effect.catchTag("ParseError", (e) => Effect.die(e)),
    Effect.mapError(DatabaseError.$match),
    Effect.withSpan(...)
  );
```

### Key Findings

1. **SqlSchema Function Selection**:
   - `SqlSchema.findAll`: Returns `ReadonlyArray<T>` - for queries returning 0-n rows
   - `SqlSchema.findOne`: Returns `Option<T>` - for queries returning 0-1 rows
   - `SqlSchema.void`: Returns `void` - for DELETE/UPDATE without result needs

2. **Count Queries**: PostgreSQL returns count as string (`"42"`), so used intermediate `CountResult` schema with `S.String` and parsed to int.

3. **Delete with Count**: `SqlSchema.void` doesn't return deletion count. Kept raw SQL and used `result.length` for count tracking.

4. **Bug Fix**: EntityCluster.repo.ts had invalid JSONB operator syntax (`@ >` instead of `@>`). Fixed during refactor.

5. **Error Handling Pattern**:
   - Raw SQL → only `SqlError` in error channel → `mapError(DatabaseError.$match)`
   - SqlSchema → `ParseError | SqlError` → `catchTag("ParseError", die)` then `mapError`

### Verification Results

```bash
# Type check
bun run check --filter @beep/knowledge-server
# Result: 27 tasks successful

# Tests
bun run test --filter @beep/knowledge-server
# Result: 55 tests pass, 0 fail, 149 expect() calls
```

### Import Changes

Added to both repo files:
```typescript
import * as SqlSchema from "@effect/sql/SqlSchema";
import * as S from "effect/Schema";
```

Removed unused import from EntityCluster.repo.ts:
```typescript
// Removed: import * as A from "effect/Array";
```

### Gotchas Encountered

1. **Array Mutability**: Schema `S.Array()` expects mutable arrays. When passing `ReadonlyArray` to SqlSchema, spread to mutable: `[...ids]`.

2. **Type Import Change**: Changed `type SharedEntityIds` to value import `SharedEntityIds` since it's used in Request schema definitions.

3. **Empty Array Optimization**: Preserved the early return for empty arrays BEFORE SqlSchema call to avoid unnecessary database round-trip.

---

## Phase 3: Complex Custom Methods

**Date**: 2026-01-22

### Repos Refactored

| Repo | Methods Refactored | SqlSchema Functions Used |
|------|-------------------|-------------------------|
| `Embedding.repo.ts` | 3 | `findOne` (1), `findAll` (2) |
| `Relation.repo.ts` | 5 | `findAll` (5) |
| `SameAsLink.repo.ts` | 6 | `findAll` (4), `findOne` (2) |

Note: Delete methods that return count (`deleteByEntityIdPrefix`, `deleteByCanonical`) kept raw SQL since `SqlSchema.void` doesn't return count.

### Methods Breakdown

**Embedding.repo.ts**:
- `findByCacheKey` → `SqlSchema.findOne` (returns Option)
- `findSimilar` → `SqlSchema.findAll` (pgvector similarity with custom vector string formatting inside execute)
- `findByEntityType` → `SqlSchema.findAll`
- `deleteByEntityIdPrefix` → Kept raw SQL (returns count)

**Relation.repo.ts**:
- `findBySourceIds` → `SqlSchema.findAll` (IN clause with array, empty array optimization)
- `findByTargetIds` → `SqlSchema.findAll` (IN clause with array, empty array optimization)
- `findByEntityIds` → `SqlSchema.findAll` (dual IN clause, empty array optimization)
- `findByPredicate` → `SqlSchema.findAll`
- `countByOrganization` → `SqlSchema.findAll` with `CountResult` schema

**SameAsLink.repo.ts**:
- `findByCanonical` → `SqlSchema.findAll`
- `findByMember` → `SqlSchema.findOne` (returns Option)
- `resolveCanonical` → `SqlSchema.findAll` with `ResolveCanonicalResult` (recursive CTE with fallback to input entityId)
- `findHighConfidence` → `SqlSchema.findAll`
- `findBySource` → `SqlSchema.findAll`
- `deleteByCanonical` → Kept raw SQL (returns count)
- `countMembers` → `SqlSchema.findAll` with `CountResult` schema

### Implementation Patterns Applied

**1. pgvector Similarity Search**:
```typescript
const findSimilarSchema = SqlSchema.findAll({
  Request: FindSimilarRequest,
  Result: SimilarityResult,  // Custom result type with similarity score
  execute: (req) => {
    // Format vector for pgvector: "[0.1,0.2,...]"
    const vectorString = `[${A.join(A.map(req.queryVector, String), ",")}]`;
    return sql`
      SELECT id, entity_type, entity_id, content_text,
             1 - (embedding <=> ${vectorString}::vector) as similarity
      FROM ${sql(tableName)}
      WHERE organization_id = ${req.organizationId}
        AND 1 - (embedding <=> ${vectorString}::vector) >= ${req.threshold}
      ORDER BY embedding <=> ${vectorString}::vector
      LIMIT ${req.limit}
    `;
  },
});
```

**2. Recursive CTE for Chain Resolution**:
```typescript
const resolveCanonicalSchema = SqlSchema.findAll({
  Request: ResolveCanonicalRequest,
  Result: ResolveCanonicalResult,
  execute: (req) => sql`
    WITH RECURSIVE chain AS (
      SELECT member_id, canonical_id
      FROM ${sql(tableName)}
      WHERE member_id = ${req.entityId}
        AND organization_id = ${req.organizationId}
      UNION
      SELECT l.member_id, l.canonical_id
      FROM ${sql(tableName)} l
      INNER JOIN chain c ON l.member_id = c.canonical_id
      WHERE l.organization_id = ${req.organizationId}
    )
    SELECT canonical_id FROM chain ORDER BY canonical_id LIMIT 1
  `,
});
```

**3. Custom Result Types for Non-Model Queries**:
```typescript
// For count queries (PostgreSQL returns string)
class CountResult extends S.Class<CountResult>("CountResult")({
  count: S.String,
}) {}

// For recursive CTE resolution
class ResolveCanonicalResult extends S.Class<ResolveCanonicalResult>("ResolveCanonicalResult")({
  canonical_id: S.String,
}) {}

// For similarity search with score
export class SimilarityResult extends S.Class<SimilarityResult>("SimilarityResult")({
  id: KnowledgeEntityIds.EmbeddingId,
  entityType: Entities.Embedding.EntityType,
  entityId: S.String,
  contentText: S.optional(S.String),
  similarity: S.Number,
}) {}
```

### Key Findings

1. **pgvector Integration**: Vector string formatting (`[0.1,0.2,...]::vector`) works correctly inside SqlSchema execute function. The `queryVector` parameter is passed as `S.Array(S.Number)` and converted to string inside execute.

2. **Recursive CTE Support**: Complex SQL features like recursive CTEs work seamlessly with SqlSchema. The schema validates the result structure while preserving the complex query logic.

3. **SimilarityResult Schema**: Created domain-specific result schema that validates pgvector similarity output, ensuring `similarity` is a proper number and `entityType` matches the enum.

4. **Delete Methods Keep Raw SQL**: Consistent with Phase 2 learning, delete methods returning count kept raw SQL since `SqlSchema.void` doesn't provide deletion count.

5. **Method Return Type Alignment**:
   - `SqlSchema.findOne` returns `Option<T>` - matches methods like `findByCacheKey`, `findByMember`
   - `SqlSchema.findAll` returns `ReadonlyArray<T>` - matches methods returning arrays
   - Methods with fallback logic (like `resolveCanonical`) use `findAll` and handle the option manually

### Verification Results

```bash
# Type check
bun run check --filter @beep/knowledge-server
# Result: 27 tasks successful

# Tests
bun run test --filter @beep/knowledge-server
# Result: 55 tests pass, 0 fail, 149 expect() calls
```

### Import Changes

Added to all three repo files:
```typescript
import * as SqlSchema from "@effect/sql/SqlSchema";
import * as S from "effect/Schema";
```

Changed from type import to value import:
```typescript
// Before
import { KnowledgeEntityIds, type SharedEntityIds } from "@beep/shared-domain";
// After
import { KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
```

### Gotchas Encountered

1. **Vector Array Mutability**: Like Phase 2, `ReadonlyArray<number>` needed spreading to mutable array: `queryVector: [...queryVector]`

2. **Count Schema Consistency**: Used `S.String` for count and `Number.parseInt()` for conversion, consistent with Phase 2 pattern.

3. **Request Schema Field Names**: Used exactly matching database parameter names (e.g., `minConfidence`, `canonicalId`) to keep code self-documenting.

---

## Phase 4: Verification & Cleanup

**Date**: 2026-01-22

### Final Verification

All phases complete. Final verification results:

```bash
# Type check - all 27 tasks successful
bun run check --filter @beep/knowledge-server

# Tests - 55 pass, 0 fail, 149 expect() calls
bun run test --filter @beep/knowledge-server
```

### Summary

| Repo | Custom Methods | Refactored with SqlSchema | Kept Raw SQL |
|------|----------------|---------------------------|--------------|
| `Entity.repo.ts` | 4 | 4 | 0 |
| `EntityCluster.repo.ts` | 5 | 4 | 1 (deleteByOntology - returns count) |
| `Embedding.repo.ts` | 4 | 3 | 1 (deleteByEntityIdPrefix - returns count) |
| `Relation.repo.ts` | 5 | 5 | 0 |
| `SameAsLink.repo.ts` | 7 | 6 | 1 (deleteByCanonical - returns count) |
| **Total** | **25** | **22** | **3** |

### Spec Status: COMPLETE

All 22 eligible methods now use SqlSchema with:
- Request schemas for input validation
- Result schemas (domain Models or custom types) for output validation
- Proper ParseError handling
- Empty array optimizations preserved
- Span attributes maintained

3 delete methods kept raw SQL since they return deletion count (not supported by `SqlSchema.void`).
