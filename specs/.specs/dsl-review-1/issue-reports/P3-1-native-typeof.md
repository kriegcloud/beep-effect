# Issue P3-1: Native typeof Check

## Verdict: SHOULD_BE_FIXED

## Issue Location
**File**: `packages/common/schema/src/integrations/sql/dsl/types.ts`
**Lines**: 544-550

## Current Code
```typescript
export const isDSLVariantField = <A extends VariantSchema.Field.Config, C extends ColumnDef>(
  u: unknown
): u is DSLVariantField<A, C> =>
  u !== null &&
  typeof u === "object" &&  // Native typeof check
  VariantFieldSymbol in u &&
  (u as Record<symbol, unknown>)[VariantFieldSymbol] === true;
```

## Issue Analysis

The code uses native `typeof u === "object"` instead of Effect's `P.isObject(u)` predicate, violating project standards from AGENTS.md:

```typescript
// FORBIDDEN (per AGENTS.md)
typeof x === "string"

// REQUIRED
P.isString(x)
P.isObject(x)
```

## Semantic Comparison

Both approaches are **functionally equivalent** when combined with the null check:
- `u !== null && typeof u === "object"` - manually guards against JavaScript's `typeof null === "object"` quirk
- `P.isNotNull(u) && P.isObject(u)` - Effect predicate handles null internally

## Evidence from Codebase

The project already uses the correct pattern elsewhere. In `Model.ts:106`:
```typescript
if (P.isNotNull(field) && P.isObject(field) && ColumnMetaSymbol in field) {
  // ...
}
```

## Recommendation

**Fix for consistency:**

```typescript
import * as P from "effect/Predicate";  // Add to imports

export const isDSLVariantField = <A extends VariantSchema.Field.Config, C extends ColumnDef>(
  u: unknown
): u is DSLVariantField<A, C> =>
  P.isNotNull(u) &&
  P.isObject(u) &&
  VariantFieldSymbol in u &&
  (u as Record<symbol, unknown>)[VariantFieldSymbol] === true;
```

## Benefits of Fixing

1. **Adherence to standards**: Aligns with AGENTS.md guidelines
2. **Codebase consistency**: Matches patterns used elsewhere (Model.ts)
3. **Semantic clarity**: `P.isObject` is more expressive about intent
4. **Null safety**: Effect predicate handles JavaScript quirk internally
5. **Composability**: Effect predicates can be composed with `P.and`, `P.or`, etc.

## Risk Assessment

**Low risk, high value consistency fix** - changes no runtime behavior, brings code in line with established patterns.

Note: The file currently has no Predicate import, so this would need to be added.
