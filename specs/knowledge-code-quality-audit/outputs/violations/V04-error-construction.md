# V04: Error Construction Audit Report

## Summary

| Metric | Count |
|--------|-------|
| **Total Violations Found** | 1 |
| **Files Affected** | 1 |
| **Severity** | Medium |

## Rule Definition

**Rule**: Error objects must be constructed using `new ErrorClass({...})` syntax, not object literals cast as errors.

**Rationale**: Casting object literals as error types bypasses the class constructor, potentially missing:
- Prototype chain setup (instanceof checks may fail)
- Default value initialization
- Validation logic in constructor
- Stack trace capture

## Violations

### Violation 1: EmbeddingService.ts

**File**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/server/src/Embedding/EmbeddingService.ts`

**Location**: Lines 315-320

**Current Code** (VIOLATION):
```typescript
Effect.mapError(
  (error) =>
    ({
      _tag: "EmbeddingError",
      message: `Similarity search failed: ${String(error)}`,
      provider: "pgvector",
      retryable: false,
    }) as EmbeddingError
)
```

**Correct Code**:
```typescript
Effect.mapError(
  (error) =>
    new EmbeddingError({
      message: `Similarity search failed: ${String(error)}`,
      provider: "pgvector",
      retryable: false,
    })
)
```

**Context**: The `EmbeddingError` class at `packages/knowledge/server/src/Embedding/EmbeddingProvider.ts:84-89` extends `S.TaggedError` and should be instantiated using the `new` constructor.

## Non-Violations (Verified Patterns)

The following patterns were inspected and confirmed as **NOT violations**:

### DatabaseError.$match Usage

The repository files use `DatabaseError.$match({...})` pattern extensively (25 occurrences). This is **NOT** a violation because:

1. `DatabaseError.$match` is a static factory method defined at `packages/shared/domain/src/errors/db-error/db-error.ts:60`
2. It properly returns `new DatabaseError({...})` internally
3. This is the canonical error mapping pattern for database operations

**Example (VALID)**:
```typescript
Effect.mapError((error) =>
  DatabaseError.$match({
    message: `Failed to find embedding by cache key: ${String(error)}`,
    _tag: "DatabaseError",
  })
)
```

**Files Using Valid Pattern**:
- `packages/knowledge/server/src/db/repos/Embedding.repo.ts` (4 occurrences)
- `packages/knowledge/server/src/db/repos/Relation.repo.ts` (5 occurrences)
- `packages/knowledge/server/src/db/repos/Entity.repo.ts` (4 occurrences)
- `packages/knowledge/server/src/db/repos/SameAsLink.repo.ts` (7 occurrences)
- `packages/knowledge/server/src/db/repos/EntityCluster.repo.ts` (5 occurrences)

### Correct EmbeddingError Constructions

The following files properly use `new EmbeddingError({...})`:
- `packages/knowledge/server/src/Embedding/providers/OpenAiProvider.ts`:
  - Line 140: `new EmbeddingError({ ... })`
  - Line 203: `return new EmbeddingError({ ... })`
  - Line 225: `return yield* new EmbeddingError({ ... })`
  - Line 313: `new EmbeddingError({ ... })`
  - Line 326: `new EmbeddingError({ ... })`
  - Line 338: `new EmbeddingError({ ... })`

## Fix Priority

| Priority | Violation | Effort | Risk |
|----------|-----------|--------|------|
| P2 | EmbeddingService.ts:315-320 | Low | Low |

## Recommended Fix

```diff
--- a/packages/knowledge/server/src/Embedding/EmbeddingService.ts
+++ b/packages/knowledge/server/src/Embedding/EmbeddingService.ts
@@ -312,12 +312,11 @@ export class EmbeddingService extends Effect.Service<EmbeddingService>()("@beep/
         const results = yield* repo.findSimilar(queryVector, organizationId, limit, threshold).pipe(
           Effect.mapError(
             (error) =>
-              ({
-                _tag: "EmbeddingError",
+              new EmbeddingError({
                 message: `Similarity search failed: ${String(error)}`,
                 provider: "pgvector",
                 retryable: false,
-              }) as EmbeddingError
+              })
           )
         );
```

## Verification Steps

After applying the fix:

1. Run type check:
   ```bash
   bun run check --filter @beep/knowledge-server
   ```

2. Run tests:
   ```bash
   bun run test --filter @beep/knowledge-server
   ```

3. Verify instanceof behavior:
   ```typescript
   import { EmbeddingError } from "@beep/knowledge-server/Embedding";

   // Should work correctly after fix
   const err = new EmbeddingError({ message: "test", provider: "test", retryable: false });
   console.assert(err instanceof EmbeddingError);
   console.assert(err._tag === "EmbeddingError");
   ```
