# V06: Native Error Objects Audit

> Effect Pattern Enforcement Report

**Generated**: 2026-01-22
**Scope**: `packages/knowledge/**/src/**/*.ts`
**Source of Truth**: `.claude/rules/effect-patterns.md`

---

## Summary

| Metric | Value |
|--------|-------|
| **Total Violations** | 3 |
| **Files Affected** | 1 |
| **Severity** | Critical |
| **Priority Score** | 3 |

---

## Rule Reference

**Pattern Violated**:
> Use Effect Schema TaggedError classes instead of native JavaScript Error objects.

Native JavaScript `Error` objects bypass Effect's typed error channel. When used with `Effect.die()`, errors become defects (untyped failures) rather than recoverable errors that can be pattern-matched and handled gracefully. This prevents proper error handling, loses type safety, and makes debugging harder since the error type cannot be discriminated at compile time.

**Violation Pattern**:
```typescript
// VIOLATIONS - Native Error objects
new Error("Something went wrong")
Effect.die(new Error("Cannot select canonical from empty cluster"))
throw new Error("...")
```

**Correct Pattern**:
```typescript
import * as S from "effect/Schema";

// Define dedicated error class in domain layer
export class CanonicalSelectionError extends S.TaggedError<CanonicalSelectionError>()(
  "CanonicalSelectionError",
  {
    message: S.String,
    reason: S.Literal("empty_cluster", "selection_failed"),
  }
) {}

// Use in code - returns in typed error channel
Effect.fail(new CanonicalSelectionError({
  message: "Cannot select canonical from empty cluster",
  reason: "empty_cluster"
}))
```

---

## Violations

### CanonicalSelector.ts

**File**: `packages/knowledge/server/src/EntityResolution/CanonicalSelector.ts`

| Line | Violation | Current Code | Correct Code |
|------|-----------|--------------|--------------|
| 120 | Native Error with Effect.die | `Effect.die(new Error("Cannot select canonical from empty cluster"))` | `Effect.fail(new CanonicalSelectionError({ message: "...", reason: "empty_cluster" }))` |
| 126 | Native Error with Effect.die | `Effect.die(new Error("Cannot select canonical from empty cluster"))` | `Effect.fail(new CanonicalSelectionError({ message: "...", reason: "empty_cluster" }))` |
| 181 | Native Error with Effect.die | `Effect.die(new Error("Failed to select canonical entity"))` | `Effect.fail(new CanonicalSelectionError({ message: "...", reason: "selection_failed" }))` |

<details>
<summary>Full Context (Lines 117-130)</summary>

```typescript
    selectCanonical: (
      cluster: readonly AssembledEntity[],
      config: CanonicalSelectorConfig = {}
    ): Effect.Effect<AssembledEntity> =>
      Effect.gen(function* () {
        if (cluster.length === 0) {
          return yield* Effect.die(new Error("Cannot select canonical from empty cluster"));
        }

        if (cluster.length === 1) {
          const single = cluster[0];
          if (!single) {
            return yield* Effect.die(new Error("Cannot select canonical from empty cluster"));
          }
          return single;
        }
```

</details>

<details>
<summary>Full Context (Lines 178-185)</summary>

```typescript
          }
        }

        if (!selected) {
          return yield* Effect.die(new Error("Failed to select canonical entity"));
        }

        yield* Effect.logDebug("CanonicalSelector.selectCanonical: selected", {
```

</details>

---

## Cross-File Impact

| File | Violation Count | Modules Affected |
|------|-----------------|------------------|
| CanonicalSelector.ts | 3 | EntityResolution |

**Impact Score**: 2 (Contained to single file, single module)

---

## Dependency Analysis

### Depends On (Fix These First)
- [ ] None - A new `CanonicalSelectionError` class needs to be created in domain layer

### Depended By (Fix These After)
- [ ] None - Error type change is additive

### Can Fix Independently
- [x] Yes - Requires creating new error class and updating 3 call sites

---

## Remediation Notes

### Special Considerations

1. **Effect.die vs Effect.fail**: The current code uses `Effect.die()` which throws the error as a defect (unrecoverable). If these errors should be recoverable (empty cluster could be a valid edge case), use `Effect.fail()` instead. If they represent programming errors that should never occur, `Effect.die()` is appropriate but should still use a TaggedError for better observability.

2. **Existing Error Patterns**: The `packages/knowledge/domain/src/errors/` directory already contains well-structured TaggedError classes (e.g., `ExtractionError`, `GroundingError`). A new `EntityResolutionError` or `CanonicalSelectionError` should follow the same pattern.

3. **Return Type Impact**: Changing from `Effect.die()` to `Effect.fail()` will change the return type signature from `Effect.Effect<AssembledEntity>` to `Effect.Effect<AssembledEntity, CanonicalSelectionError>`. Callers may need to handle or propagate this error.

### Recommended Approach

1. Create `entity-resolution.errors.ts` in `packages/knowledge/domain/src/errors/` following the existing pattern
2. Define `CanonicalSelectionError` with appropriate fields (`message`, `reason`, `clusterSize`)
3. Export from `packages/knowledge/domain/src/errors/index.ts`
4. Import the new error class in `CanonicalSelector.ts`
5. Replace `Effect.die(new Error(...))` with `Effect.fail(new CanonicalSelectionError(...))`
6. Update the return type signature of `selectCanonical` to include the error type
7. Update callers to handle or propagate the error

### Imports to Add

```typescript
// In CanonicalSelector.ts
import { CanonicalSelectionError } from "@beep/knowledge-domain/errors";
```

### New Types to Create

```typescript
// packages/knowledge/domain/src/errors/entity-resolution.errors.ts
import { $KnowledgeDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("errors/entity-resolution");

/**
 * Canonical entity selection error
 *
 * @since 0.1.0
 * @category errors
 */
export class CanonicalSelectionError extends S.TaggedError<CanonicalSelectionError>($I`CanonicalSelectionError`)(
  "CanonicalSelectionError",
  {
    message: S.String,
    reason: S.Literal("empty_cluster", "selection_failed"),
    clusterSize: S.optional(S.Number),
  },
  $I.annotations("CanonicalSelectionError", {
    description: "Failed to select canonical entity from cluster",
  })
) {}

/**
 * Union of all entity resolution error types
 *
 * @since 0.1.0
 * @category errors
 */
export class EntityResolutionError extends S.Union(
  CanonicalSelectionError
).annotations(
  $I.annotations("EntityResolutionError", {
    description: "Union of all entity resolution error types",
  })
) {}

export declare namespace EntityResolutionError {
  export type Type = typeof EntityResolutionError.Type;
  export type Encoded = typeof EntityResolutionError.Encoded;
}
```

---

## Verification Commands

```bash
# Verify no violations remain
grep -rn "new Error\(" packages/knowledge/server/src/
grep -rn "Effect\.die(new Error" packages/knowledge/server/src/
grep -rn "throw new Error" packages/knowledge/server/src/

# Type check
bun run check --filter @beep/knowledge-server
bun run check --filter @beep/knowledge-domain

# Run tests
bun run test --filter @beep/knowledge-*
```

---

## Audit Metadata

| Field | Value |
|-------|-------|
| **Agent** | V06 Effect Pattern Enforcer |
| **Duration** | ~3 minutes |
| **Files Scanned** | 95+ TypeScript files |
| **False Positives Excluded** | 0 |
