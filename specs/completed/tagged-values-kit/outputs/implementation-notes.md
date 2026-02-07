# Implementation Notes - TaggedValuesKit

## Phase 1 Summary

**Status**: Complete
**Date**: 2026-01-25
**Verification**: `bun run check --filter @beep/schema` passes

## Files Created/Modified

### Created
- `packages/common/schema/src/derived/kits/tagged-values-kit.ts` - Main implementation

### Modified
- `packages/common/schema/src/derived/kits/index.ts` - Added export

## Implementation Decisions

### 1. Entry Type Structure

Followed the spec exactly:
```ts
type TaggedValuesEntry = readonly [string, A.NonEmptyReadonlyArray<AST.LiteralValue>];
```

This differs from TaggedConfigKit which uses:
```ts
type TaggedConfigEntry = readonly [string, ConfigObject];
```

### 2. Decoded Type

Structure is `{ _tag, values }` as specified:
```ts
type DecodedConfig<Tag, Values> = {
  readonly _tag: Tag;
  readonly values: Values;
};
```

### 3. New Accessors

Added two new accessor types not present in TaggedConfigKit:

1. **ValuesForAccessor** - Direct access to values arrays
```ts
type ValuesForAccessor<E> = {
  readonly [Entry in E[number] as Entry[0]]: ExtractValues<Entry>;
};
```

2. **LiteralKitForAccessor** - IGenericLiteralKit for each tag's values
```ts
type LiteralKitForAccessor<E> = {
  readonly [Entry in E[number] as Entry[0]]: IGenericLiteralKit<ExtractValues<Entry>>;
};
```

### 4. Validation Behavior

**Encode (allOf)**: Implemented strict validation using `arraysEqual` function:
- Arrays must have same length
- String-converted values must match (order-independent)
- Throws `TaggedValuesKitEncodeError` on mismatch

**LiteralKitFor (oneOf)**: Uses existing `makeGenericLiteralKit` from literal-kit.ts for standard LiteralKit validation.

### 5. Error Types

Added two error types (following TaggedConfigKit pattern):

1. `TaggedValuesKitDecodeError` - For unexpected tags during decode
2. `TaggedValuesKitEncodeError` - For validation failures during encode

### 6. Type Safety Refinements

**Initial Issue**: Many `as unknown as` casts from `R.fromEntries` losing type information.

**Solution**: Replace `R.fromEntries` with `A.reduce` pattern:
```ts
// Before (unsafe)
return R.fromEntries(entries) as unknown as TargetType;

// After (type-safe)
return F.pipe(
  entries,
  A.map(([k, v]) => [k, transform(v)] as const),
  A.reduce({} as TargetType, (acc, [k, v]) => ({ ...acc, [k]: v }))
);
```

**Additional Patterns Applied**:
```ts
// Order.string for sorting (proper type inference)
import * as Order from "effect/Order";
A.sort(Order.string)

// P.isTagged for type guards (idiomatic Effect)
import * as P from "effect/Predicate";
P.isTagged(tag)(value)
```

### 7. Helper Types Added

```ts
// Extract specific entry by tag
type EntryForTag<E, Tag> = Extract<E[number], readonly [Tag, NonEmptyReadonlyArray<LiteralValue>]>;

// Filtered entries for derive
type FilteredEntries<E, Tags> = NonEmptyReadonlyArray<EntryForTag<E, Tags>>;

// Schema members (documents non-empty tuple constraint)
type SchemaMembers<T> = readonly [S.Schema<T>, ...S.Schema<T>[]];
```

### 8. Documented Unavoidable Assertions

| Location | Assertion | Reason |
|----------|-----------|--------|
| `buildTags` | `as unknown as TagsArray` | A.map returns array, need tuple for positional types |
| `derive` filter | `as unknown as FilteredEntries` | A.filter can't prove non-emptiness |
| Schema construction | `as SchemaMembers` | S.Union requires non-empty tuple |
| `taggedUnion` | `as SchemaMembers<UnsafeAny>` | S.transform inference needs widening |
| Factory return | `as UnsafeAny` | Class expression typing limitation |

**Key Insight**: Some assertions are fundamental TypeScript limitations with dynamic construction. Document them clearly rather than hiding with `as unknown as`.

## API Surface

### Static Properties
| Property | Type | Description |
|----------|------|-------------|
| `Configs` | `ConfigsAccessor<Entries>` | `{ _tag, values }` structs by tag |
| `ValuesFor` | `ValuesForAccessor<Entries>` | Direct values arrays by tag |
| `LiteralKitFor` | `LiteralKitForAccessor<Entries>` | IGenericLiteralKit instances by tag |
| `Tags` | `TagsArray<Entries>` | Tuple of all tags |
| `TagsEnum` | `TagsEnum<Entries>` | Tag → tag mapping |
| `Entries` | `Entries` | Original entries |
| `is` | `ConfigGuards<Entries>` | Type guards per tag |
| `ConfigMap` | `HashMap<Tag, Decoded>` | O(1) lookups |
| `derive` | Function | Create subset kit |

### Public Functions
1. `TaggedValuesKit(...entries)` - Main factory
2. `TaggedValuesKitFromObject(obj)` - Object-based construction
3. `makeTaggedValuesKit(entries, ast?)` - Low-level factory

## Differences from TaggedConfigKit

| Aspect | TaggedConfigKit | TaggedValuesKit |
|--------|-----------------|-----------------|
| Entry value | `ConfigObject` (Record) | `NonEmptyReadonlyArray<LiteralValue>` |
| Decoded struct | `{ _tag, ...configFields }` | `{ _tag, values }` |
| New accessors | - | `ValuesFor`, `LiteralKitFor` |
| Encode validation | Struct field matching | Array exact match (allOf) |

## Open Questions Resolved

1. **TaggedValuesKitFromObject** - Yes, included for parity with TaggedConfigKit
2. **Order preservation** - Set equality (order-independent) for encode validation
3. **Tuple vs Array** - Used `S.Tuple` for exact positional matching in decoded schema

### 9. Schema.ts Pattern Study (Post-P1)

**Source**: `effect/Schema.ts` lines 1433-1572 (TupleType) and 4352-4413 (transformLiterals)

**Patterns Applied**:

1. **Recursive Tuple Inference** (from `TupleType.ElementsType`):
```ts
// Accumulator pattern for precise tuple building
type TagsArrayRec<E, Out extends ReadonlyArray<string> = readonly []> =
  E extends readonly [infer Head extends TaggedValuesEntry, ...infer Tail]
    ? Tail extends readonly []
      ? readonly [...Out, Head[0]]
      : TagsArrayRec<Tail, readonly [...Out, Head[0]]>
    : Out;
```

2. **Mapped Tuple Types** (from `transformLiterals`):
```ts
// Transform entries to their schema representations
type EntriesToLiteralSchemas<E extends TaggedValuesEntries> = {
  readonly [I in keyof E]: E[I] extends TaggedValuesEntry ? S.Schema<E[I][0], E[I][0]> : never;
};

type EntriesToStructSchemas<E extends TaggedValuesEntries> = {
  readonly [I in keyof E]: E[I] extends readonly [infer Tag extends string, infer Values extends ...]
    ? S.Schema<DecodedConfig<Tag, Values>, DecodedConfig<Tag, Values>>
    : never;
};
```

**Factory Improvements**:
```ts
// Before: Generic SchemaMembers cast
literalSchemas as SchemaMembers<string>
structSchemas as SchemaMembers<UnsafeTypes.UnsafeAny>

// After: Precise mapped type casts
literalSchemas as unknown as EntriesToLiteralSchemas<Entries>
structSchemas as unknown as EntriesToStructSchemas<Entries>
```

**Attempted but Reverted**:
- `ConfigLookupMap<E>` with precise tag-to-config mapping caused downstream issues with string indexing in decode/encode functions
- Kept simpler `Record<string, DecodedUnion<E>>` with mapped accumulator type

**Key Insight**: Effect Schema patterns are TYPE-LEVEL computation. Runtime casts remain necessary due to:
1. `A.map` returning `Array<T>` not tuples
2. `A.filter` unable to prove non-emptiness
3. `S.Union` requiring specific tuple signatures

The improvement is that TYPE DEFINITIONS are now more precise, improving inference for API consumers even though runtime casts persist.

## Updated Type Utility Count

| Category | Count | Examples |
|----------|-------|----------|
| Core types | 8 | TaggedValuesEntry, DecodedConfig, DecodedUnion, etc. |
| Accessor types | 4 | ConfigsAccessor, ValuesForAccessor, LiteralKitForAccessor, ConfigGuards |
| Helper types | 5 | EntryForTag, FilteredEntries, SchemaMembers, TagsArrayRec, etc. |
| **Total** | **17** | (up from 14 after Schema.ts study) |

## Next Steps

Phase 2 (Testing) should cover:
1. Decode/encode roundtrip tests
2. `ValuesFor` and `LiteralKitFor` accessor tests
3. Validation tests (allOf encode, oneOf LiteralKit)
4. Edge cases (single entry, single value, mixed literal types)
5. `derive` function tests
