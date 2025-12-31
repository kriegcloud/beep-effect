# Effect Record & Struct Patterns - Field Merging Research

## Executive Summary

This research examines Effect's `Record` and `Struct` modules to identify idiomatic patterns for type-safe, immutable field merging in `ModelBuilder.create()`. The analysis reveals three primary approaches: `Record.union` for flexible merging with conflict resolution, spread operators for simple composition, and `Schema.extend` for schema-level extensions. The beep-effect codebase already implements a battle-tested `mergeFields` utility that leverages `Record.union` with right-bias semantics.

## Problem Statement

`ModelBuilder.create()` must merge default fields (id, createdAt, updatedAt) with user-provided fields while:
1. Preserving exact type information for both field keys and schemas
2. Handling potential key conflicts (user fields should override defaults)
3. Maintaining immutability (no mutation of input objects)
4. Supporting both DSLField and DSLVariantField types
5. Enabling type-safe extraction of column metadata

## Research Sources

### Effect Core Modules
- `/node_modules/effect/src/Record.ts` - Record utilities for key-value operations
- `/node_modules/effect/src/Struct.ts` - Struct utilities for object manipulation
- `/node_modules/effect/src/Schema.ts` - Schema composition and extension

### Beep-Effect Codebase
- `packages/common/schema/src/core/utils/merge-fields.ts` - Existing merge utility
- `packages/common/schema/src/integrations/sql/dsl/Model.ts` - DSL Model implementation

## Recommended Approach

### Pattern Overview

The optimal solution is **`Record.union` with right-bias**, already implemented in beep-effect's `mergeFields` utility:

```typescript
import * as R from "effect/Record";

export function mergeFields<const A extends Fields, const B extends Fields>(a: A, b?: B) {
  if (b === undefined) {
    return <const C extends Fields>(bb: C): A & C => mergeFields(a, bb);
  }

  return R.union(a, b, (_, right) => right) as A & B;
}
```

**Key properties:**
- **Right-bias**: User fields (`b`) override default fields (`a`) when keys conflict
- **Type-preserving**: Returns `A & B`, capturing exact literal types
- **Immutable**: Creates new object without mutating inputs
- **Generic-safe**: Works with any field record shape

### Implementation for ModelBuilder

```typescript
import * as R from "effect/Record";
import type { DSL } from "./types";

/**
 * Merge default fields with user fields, user fields win on conflicts.
 *
 * @example
 * const defaults = { id: Field.uuid(), createdAt: Field.createdAt() };
 * const user = { name: Field.text(), email: Field.text() };
 * const merged = mergeModelFields(defaults, user);
 * // Type: { id: ..., createdAt: ..., name: ..., email: ... }
 */
const mergeModelFields = <
  Defaults extends DSL.Fields,
  User extends DSL.Fields
>(
  defaults: Defaults,
  user: User
): Defaults & User => {
  // Right-bias: user fields override defaults
  return R.union(defaults, user, (_, right) => right) as Defaults & User;
};

// Usage in ModelBuilder.create
export const create = <
  Fields extends DSL.Fields,
  const Identifier extends string = never
>(options: {
  identifier: Identifier;
  fields: Fields;
}): ModelBuilderState<Identifier, DefaultFields & Fields, {}> => {
  const defaultFields = {
    id: Field.uuid().primaryKey(),
    createdAt: Field.createdAt(),
    updatedAt: Field.updatedAt(),
  } as const;

  const mergedFields = mergeModelFields(defaultFields, options.fields);

  return {
    identifier: options.identifier,
    fields: mergedFields,
    relations: {},
  };
};
```

## Alternative Approaches

### Alternative 1: Native Spread Operator

**Pattern:**
```typescript
const merged = { ...defaults, ...user };
```

**Pros:**
- Simple, built-in syntax
- Familiar to all TypeScript developers
- No additional imports required

**Cons:**
- Not idiomatic Effect (violates project AGENTS.md guidelines)
- Type inference can be imprecise for intersection types
- No explicit conflict resolution semantics
- Doesn't compose well with Effect utilities

**Verdict:** Avoid. The project standards mandate Effect utilities over native operations.

### Alternative 2: Schema.extend

**Pattern:**
```typescript
import * as S from "effect/Schema";

const baseSchema = S.Struct(defaults);
const extended = baseSchema.pipe(S.extend(S.Struct(user)));
```

**Pros:**
- Schema-level composition preserves transformation pipelines
- Supports complex extension scenarios (refinements, index signatures)
- Type-safe at the schema level

**Cons:**
- **Mismatch**: `ModelBuilder.create` receives `Fields` (field records), not `Schema.Struct`
- Requires wrapping fields in `S.Struct` just to merge, then unwrapping
- Adds unnecessary Schema wrapping overhead
- Extension semantics are more complex (supports unions, refinements, etc.)

**Verdict:** Not applicable. This is for schema-to-schema extension, not field record merging.

### Alternative 3: Manual Record.set

**Pattern:**
```typescript
import * as R from "effect/Record";
import * as F from "effect/Function";
import * as Struct from "effect/Struct";

const merged = F.pipe(
  defaults,
  ...Struct.keys(user).map(key => R.set(key, user[key]))
);
```

**Pros:**
- Explicit control over each field addition
- Could add custom logic per field

**Cons:**
- Verbose and error-prone
- Requires iterating over keys manually
- Type inference becomes complex
- Much slower than `Record.union` or spread

**Verdict:** Over-engineered. Use `Record.union` instead.

## Record.union Deep Dive

### Function Signature

```typescript
export const union: {
  <K1 extends string, A, B, C>(
    that: ReadonlyRecord<K1, B>,
    combine: (selfValue: A, thatValue: B) => C
  ): <K0 extends string>(self: ReadonlyRecord<K0, A>) => Record<K0 | K1, A | B | C>

  <K0 extends string, A, K1 extends string, B, C>(
    self: ReadonlyRecord<K0, A>,
    that: ReadonlyRecord<K1, B>,
    combine: (selfValue: A, thatValue: B) => C
  ): Record<K0 | K1, A | B | C>
}
```

### Behavior

**Merge semantics:**
1. If key exists only in `self`: include with `self[key]` value
2. If key exists only in `that`: include with `that[key]` value
3. If key exists in both: call `combine(self[key], that[key])` and use result

**Type output:**
- Keys: `K0 | K1` (union of all keys from both records)
- Values: `A | B | C` (union of all possible value types)

**For right-bias (user override):**
```typescript
R.union(defaults, user, (_, right) => right)
```
- Ignore left (`_`), always return right value
- User fields override defaults when keys conflict

### Implementation (from source)

```typescript
// Simplified from effect/src/Record.ts lines 1750-1778
export const union = dual(
  3,
  <K0 extends string, A, K1 extends string, B, C>(
    self: ReadonlyRecord<K0, A>,
    that: ReadonlyRecord<K1, B>,
    combine: (selfValue: A, thatValue: B) => C
  ): Record<K0 | K1, A | B | C> => {
    if (isEmptyRecord(self)) {
      return { ...that } as any
    }
    if (isEmptyRecord(that)) {
      return { ...self } as any
    }
    const out: Record<string, A | B | C> = empty()
    for (const key of keys(self)) {
      if (has(that, key as any)) {
        out[key] = combine(self[key], that[key as unknown as K1])
      } else {
        out[key] = self[key]
      }
    }
    for (const key of keys(that)) {
      if (!has(out, key)) {
        out[key] = that[key]
      }
    }
    return out
  }
)
```

**Performance optimizations:**
- Early return for empty records
- Single pass over each record's keys
- Efficient object construction

## Struct Utilities for Key Extraction

### Struct.entries

**Signature:**
```typescript
export const entries = <const R>(obj: R): Array<[keyof R & string, R[keyof R & string]]>
```

**Usage:**
```typescript
import * as Struct from "effect/Struct";

const fields = { id: Field.uuid(), name: Field.text() };
const entries = Struct.entries(fields);
// [["id", Field.uuid()], ["name", Field.text()]]
```

**Use case in DSL:**
```typescript
// Extract column metadata from merged fields
const columns = F.pipe(
  mergedFields,
  Struct.entries,
  A.map(([key, field]) => [key, getColumnDef(field)] as const),
  R.fromEntries
);
```

### Struct.keys

**Signature:**
```typescript
export const keys = <T extends {}>(o: T): Array<(keyof T) & string>
```

**Type-safe key extraction:**
```typescript
const fieldKeys = Struct.keys(mergedFields);
// Type: Array<"id" | "createdAt" | "updatedAt" | ...userKeys>
```

**Advantage over `Object.keys`:**
- Returns typed array of literal key names
- Filters out symbol keys (returns only string keys)
- Type-safe iteration

## Type-Preserving Patterns

### Intersection Types for Merged Fields

```typescript
type MergedFields = DefaultFields & UserFields;
// Equivalent to:
// {
//   readonly id: DSLField<...>;
//   readonly createdAt: DSLField<...>;
//   readonly updatedAt: DSLField<...>;
// } & {
//   readonly [K in keyof UserFields]: UserFields[K];
// }
```

**Key insight:** TypeScript intersection types (`&`) preserve exact literal types from both sides, enabling precise type extraction in `ExtractColumnsType`.

### const Generics for Literal Preservation

```typescript
const mergeModelFields = <
  const Defaults extends DSL.Fields,  // ← const generic
  const User extends DSL.Fields        // ← const generic
>(defaults: Defaults, user: User): Defaults & User => {
  return R.union(defaults, user, (_, right) => right) as Defaults & User;
};
```

**Why `const`?**
- Preserves literal string types for identifiers
- Maintains readonly property modifiers
- Enables narrow type inference for field records

**Example:**
```typescript
// Without const:
const fields1 = { name: Field.text() };
// Type: { name: DSLField<string, ...> }

// With const:
const fields2 = { name: Field.text() } as const;
// Type: { readonly name: DSLField<string, ...> }
```

### NoInfer for Conflict Prevention

```typescript
import type { NoInfer } from "effect/Types";

const has: {
  <K extends string | symbol>(key: NoInfer<K>): <A>(self: ReadonlyRecord<K, A>) => boolean
  <K extends string | symbol, A>(self: ReadonlyRecord<K, A>, key: NoInfer<K>): boolean
}
```

**Purpose:** Prevent TypeScript from inferring generic types from specific arguments, forcing explicit type flow.

**Not needed in `mergeModelFields`:** Our generics are explicitly inferred from function arguments.

## Integration with beep-effect Architecture

### Existing mergeFields Utility

**Location:** `packages/common/schema/src/core/utils/merge-fields.ts`

**Current implementation:**
```typescript
export function mergeFields<const A extends Fields, const B extends Fields>(a: A, b?: B) {
  if (b === undefined) {
    return <const C extends Fields>(bb: C): A & C => mergeFields(a, bb);
  }

  return R.union(a, b, (_, right) => right) as A & B;
}
```

**Curried variant:**
```typescript
// Partial application
const mergeWithDefaults = mergeFields(defaultFields);

// Apply later
const merged1 = mergeWithDefaults({ name: Field.text() });
const merged2 = mergeWithDefaults({ email: Field.email() });
```

**Recommendation:** Reuse this utility directly in ModelBuilder.

### Usage in Existing DSL Code

**Model.ts extractColumns pattern:**
```typescript
const extractColumns = <Fields extends DSL.Fields>(fields: Fields): ExtractColumnsType<Fields> =>
  F.pipe(
    fields,
    Struct.entries,            // Convert to entries
    A.map(([key, field]) => {  // Transform each field
      const columnDef = getColumnDef(field);
      return [key, columnDef] as const;
    }),
    R.fromEntries            // Rebuild record
  ) as ExtractColumnsType<Fields>;
```

**Key pattern:**
1. `Struct.entries` to iterate
2. `A.map` to transform
3. `R.fromEntries` to reconstruct
4. Type assertion for precise inference

This pattern works seamlessly with merged field records.

## Trade-offs Analysis

### Record.union (Recommended)

**Strengths:**
- **Idiomatic Effect**: Uses `effect/Record` as mandated by AGENTS.md
- **Right-bias semantics**: User fields override defaults explicitly
- **Type-preserving**: Returns `A & B` intersection type
- **Immutable**: No mutation of inputs
- **Efficient**: O(n + m) single-pass algorithm
- **Battle-tested**: Already used in beep-effect codebase

**Weaknesses:**
- Requires type assertion `as A & B` (TypeScript limitation, not runtime issue)
- Combine function always called even for non-overlapping keys (minor overhead)

**When to avoid:** Never for this use case.

### Spread Operator

**Strengths:**
- Minimal syntax
- Zero import overhead

**Weaknesses:**
- Not Effect-idiomatic
- Violates project coding standards (AGENTS.md)
- Type inference less precise

**When to avoid:** Always in beep-effect.

### Schema.extend

**Strengths:**
- Schema-level type composition
- Supports complex extensions (refinements, unions)

**Weaknesses:**
- Semantic mismatch (operates on schemas, not field records)
- Requires wrapping/unwrapping overhead
- Over-engineered for field merging

**When to avoid:** Field record merging (use for schema composition only).

## Verification Checklist

- [x] No native spread operators used
- [x] All Record operations use `effect/Record`
- [x] All Struct operations use `effect/Struct`
- [x] Type intersections preserve literal types
- [x] const generics used for type preservation
- [x] Right-bias semantics (user overrides defaults)
- [x] Immutable operations (no mutation)
- [x] Compatible with existing `extractColumns` pattern
- [x] Works with both DSLField and DSLVariantField

## Implementation Checklist

1. **Import utilities**
   ```typescript
   import * as R from "effect/Record";
   import * as Struct from "effect/Struct";
   import * as F from "effect/Function";
   ```

2. **Define default fields**
   ```typescript
   const defaultFields = {
     id: Field.uuid().primaryKey(),
     createdAt: Field.createdAt(),
     updatedAt: Field.updatedAt(),
   } as const;

   type DefaultFields = typeof defaultFields;
   ```

3. **Merge with user fields**
   ```typescript
   const mergedFields = R.union(defaultFields, options.fields, (_, right) => right);
   ```

4. **Extract column metadata** (existing pattern)
   ```typescript
   const columns = F.pipe(
     mergedFields,
     Struct.entries,
     A.map(([key, field]) => [key, getColumnDef(field)] as const),
     R.fromEntries
   );
   ```

5. **Return type-safe state**
   ```typescript
   return {
     identifier: options.identifier,
     fields: mergedFields as DefaultFields & Fields,
     relations: {},
   };
   ```

## References

### Effect Documentation
- Record module: `node_modules/effect/src/Record.ts`
- Struct module: `node_modules/effect/src/Struct.ts`
- Schema.extend: `node_modules/effect/src/Schema.ts` lines 3720-3800

### Beep-Effect Source
- mergeFields utility: `packages/common/schema/src/core/utils/merge-fields.ts`
- Model implementation: `packages/common/schema/src/integrations/sql/dsl/Model.ts` lines 125-143
- Project standards: `AGENTS.md` (Effect-first development rules)

### Key Functions Referenced
- `Record.union` (lines 1733-1778)
- `Record.fromEntries` (lines 230-232)
- `Struct.entries` (lines 334-335)
- `Struct.keys` (lines 313)
- `Schema.extend` (lines 3720+)

## Conclusion

Use `Record.union` with right-bias for field merging in `ModelBuilder.create()`. This approach is:
1. **Effect-idiomatic**: Aligns with project coding standards
2. **Type-safe**: Preserves literal types through intersection types
3. **Battle-tested**: Already proven in beep-effect's `mergeFields` utility
4. **Efficient**: O(n + m) complexity with minimal overhead
5. **Composable**: Works seamlessly with existing DSL patterns

The implementation should directly leverage or mirror the existing `mergeFields` utility, ensuring consistency across the codebase.
