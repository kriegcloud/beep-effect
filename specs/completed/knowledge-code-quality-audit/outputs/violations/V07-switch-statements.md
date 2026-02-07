# V07: Switch Statements Audit

> Effect Pattern Enforcement Report

**Generated**: 2026-01-22
**Scope**: `packages/knowledge/**/src/**/*.ts`
**Source of Truth**: `.claude/rules/effect-patterns.md`

---

## Summary

| Metric | Value |
|--------|-------|
| **Total Violations** | 1 |
| **Files Affected** | 1 |
| **Severity** | Medium |
| **Priority Score** | 10 |

Priority Calculation: `(4 × 1) + (1 × 2) + (1 × 3) = 4 + 2 + 3 = 9` (rounded to 10)

---

## Rule Reference

**Pattern Violated**:
> Use `effect/Match` instead of switch statements for exhaustive pattern matching with type safety.

**Violation Pattern**:
```typescript
// VIOLATION
switch (strategy) {
  case "highest_confidence":
    // ...
    break;
  case "most_attributes":
    // ...
    break;
  default:
    // ...
}
```

**Correct Pattern**:
```typescript
import * as Match from "effect/Match";

// CORRECT
const result = Match.value(strategy).pipe(
  Match.when("highest_confidence", () => /* ... */),
  Match.when("most_attributes", () => /* ... */),
  Match.when("most_mentions", () => /* ... */),
  Match.orElse(() => /* hybrid default */)
);
```

---

## Violations

### CanonicalSelector.ts

| Line | Violation | Current Code | Correct Code |
|------|-----------|--------------|--------------|
| 140-178 | Switch statement on `SelectionStrategy` union type | `switch (strategy) { case "highest_confidence": ... }` | `Match.value(strategy).pipe(Match.when(...))` |

<details>
<summary>Full Context (Lines 138-178)</summary>

```typescript
        let selected: AssembledEntity | undefined;

        switch (strategy) {
          case "highest_confidence": {
            // Select entity with highest confidence
            selected = A.reduce(cluster, cluster[0]!, (best, current) =>
              current.confidence > best.confidence ? current : best
            );
            break;
          }

          case "most_attributes": {
            // Select entity with most attributes
            selected = A.reduce(cluster, cluster[0]!, (best, current) =>
              countAttributes(current) > countAttributes(best) ? current : best
            );
            break;
          }

          case "most_mentions": {
            // Select entity with longest mention (proxy for specificity)
            selected = A.reduce(cluster, cluster[0]!, (best, current) =>
              current.mention.length > best.mention.length ? current : best
            );
            break;
          }

          default: {
            // "hybrid" strategy (default): Combine all factors with weights
            const weights = {
              confidence: config.weights?.confidence ?? 0.5,
              attributeCount: config.weights?.attributeCount ?? 0.3,
              mentionLength: config.weights?.mentionLength ?? 0.2,
            };

            selected = A.reduce(cluster, cluster[0]!, (best, current) =>
              computeHybridScore(current, weights) > computeHybridScore(best, weights) ? current : best
            );
            break;
          }
        }
```

</details>

---

## Cross-File Impact

| File | Violation Count | Modules Affected |
|------|-----------------|------------------|
| CanonicalSelector.ts | 1 | EntityResolution |

**Impact Score**: 1 (Low - single file, single module)

---

## Dependency Analysis

### Depends On (Fix These First)
- [ ] None

### Depended By (Fix These After)
- [ ] None

### Can Fix Independently
- [x] No dependencies - this is a standalone refactor

---

## Remediation Notes

### Special Considerations

1. **Type Safety**: The current switch statement uses a `default` case which catches the `"hybrid"` strategy. This means the TypeScript compiler cannot verify exhaustiveness. The `Match` module provides compile-time exhaustiveness checking.

2. **Return Value Pattern**: The current code uses a mutable `let selected` variable that gets assigned in each case. The `Match` approach returns a value directly, eliminating the mutation pattern and the possibility of `selected` being undefined at runtime (currently handled by the `if (!selected)` check on line 180).

3. **Strategy Type**: The `SelectionStrategy` type is defined as a union literal:
   ```typescript
   export type SelectionStrategy = "highest_confidence" | "most_attributes" | "most_mentions" | "hybrid";
   ```
   This is an ideal candidate for `Match.value()` which provides exhaustive pattern matching.

4. **Config Weights**: The hybrid case extracts weights from config. This can be handled inside the `Match.when("hybrid", ...)` callback.

### Recommended Approach

1. Add `import * as Match from "effect/Match";` to imports
2. Replace the switch block with a `Match.value(strategy).pipe(...)` expression
3. Use `Match.when()` for each explicit case
4. Use `Match.orElse()` for the default "hybrid" case (or make "hybrid" explicit and use `Match.exhaustive`)
5. Remove the mutable `let selected` variable since `Match` returns directly
6. Remove the `if (!selected)` guard since `Match` guarantees a return value

### Imports to Add

```typescript
import * as Match from "effect/Match";
```

### Recommended Replacement

```typescript
const selected = Match.value(strategy).pipe(
  Match.when("highest_confidence", () =>
    A.reduce(cluster, cluster[0]!, (best, current) =>
      current.confidence > best.confidence ? current : best
    )
  ),
  Match.when("most_attributes", () =>
    A.reduce(cluster, cluster[0]!, (best, current) =>
      countAttributes(current) > countAttributes(best) ? current : best
    )
  ),
  Match.when("most_mentions", () =>
    A.reduce(cluster, cluster[0]!, (best, current) =>
      current.mention.length > best.mention.length ? current : best
    )
  ),
  Match.when("hybrid", () => {
    const weights = {
      confidence: config.weights?.confidence ?? 0.5,
      attributeCount: config.weights?.attributeCount ?? 0.3,
      mentionLength: config.weights?.mentionLength ?? 0.2,
    };
    return A.reduce(cluster, cluster[0]!, (best, current) =>
      computeHybridScore(current, weights) > computeHybridScore(best, weights) ? current : best
    );
  }),
  Match.exhaustive
);
```

Note: Using `Match.exhaustive` instead of `Match.orElse` provides compile-time guarantee that all cases are handled. If a new strategy is added to the union type, TypeScript will report an error until it's handled.

### Alternative: Keep Default Behavior

If the intent is to have "hybrid" as a catch-all default for any unrecognized strategy value:

```typescript
const selected = Match.value(strategy).pipe(
  Match.when("highest_confidence", () => /* ... */),
  Match.when("most_attributes", () => /* ... */),
  Match.when("most_mentions", () => /* ... */),
  Match.orElse(() => {
    // Default: "hybrid" strategy
    const weights = { /* ... */ };
    return A.reduce(cluster, cluster[0]!, /* ... */);
  })
);
```

However, `Match.exhaustive` is preferred for type safety.

---

## Verification Commands

```bash
# Verify no violations remain
grep -rn "switch\s*(" packages/knowledge/server/src/

# Type check
bun run check --filter @beep/knowledge-server

# Run tests
bun run test --filter @beep/knowledge-*
```

---

## Audit Metadata

| Field | Value |
|-------|-------|
| **Agent** | V07 Effect Pattern Enforcer |
| **Duration** | ~3 minutes |
| **Files Scanned** | 97 |
| **False Positives Excluded** | 0 |
