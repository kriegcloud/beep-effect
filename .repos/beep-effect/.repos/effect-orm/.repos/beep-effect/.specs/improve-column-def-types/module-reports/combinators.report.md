# combinators.ts Analysis Report

## Overview

`combinators.ts` (446 lines) provides pipe-friendly combinators for building SQL column definitions. Enables expressions like:

```typescript
S.String.pipe(DSL.uuid, DSL.primaryKey, DSL.defaultValue("now()"))
```

**Location**: `packages/common/schema/src/integrations/sql/dsl/combinators.ts`

## Exported Combinators (11 total)

### Type Setters (7)
| Combinator | Sets type to | Validation |
|------------|--------------|------------|
| `uuid` | `"uuid"` | Validates encoded type is string-like |
| `string` | `"string"` | Validates encoded type compatible |
| `integer` | `"integer"` | Validates encoded type is number-like |
| `number` | `"number"` | Validates encoded type compatible |
| `boolean` | `"boolean"` | Validates encoded type compatible |
| `json` | `"json"` | Validates encoded type is object/array-like |
| `datetime` | `"datetime"` | Validates encoded type is string or Date-like |

### Constraint Setters (3)
| Combinator | Effect |
|------------|--------|
| `primaryKey` | Sets `primaryKey: true` |
| `unique` | Sets `unique: true` |
| `autoIncrement` | Sets `autoIncrement: true` |

### Default Value Setter (1)
- `defaultValue(value: string | (() => string))` — Sets column default

## ColumnDef Usages

| Lines | Usage Pattern | Complexity |
|-------|---------------|------------|
| 53-59 | `DerivedDefaultColumnDef<Schema>` type | Type-level |
| 69 | `ResolveColumnDef<Schema, C>` type | Type-level |
| 86-104 | `MergeColumnDef<Existing, New>` type | Very High |
| 155 | Extract existing: `(self as any)[ColumnMetaSymbol]` | Runtime (unsafe) |
| 158-164 | Merge with defaults | Runtime |
| 167-169 | Attach via annotation | Runtime |
| 172-174 | Direct property attachment | Runtime |
| 201-251 | Combinator signatures | Very High |
| 364-445 | Constraint combinators | Type-level |

## MergeColumnDef (Lines 86-104)

Complex conditional merging type — New properties override Existing:
```typescript
export type MergeColumnDef<Existing, New> = {
  readonly type: New extends { type: infer T } ? T :
                 Existing extends { type: infer T } ? T : "string";
  // ... similar for primaryKey, unique, autoIncrement, defaultValue
}
```

## Challenges

1. **Type-Level Complexity** — Deeply nested conditional types in combinator signatures
2. **MergeColumnDef Not Exported** — Limits extensibility
3. **Type-Runtime Mismatch Risk** — Two derivation paths must stay synchronized
4. **Dual Metadata Attachment** — Both annotation and direct property (potential sync issues)
5. **Unsafe Type Casting** — `(self as any)[ColumnMetaSymbol]`
6. **No Constraint Combination Validation** — Invalid combinations not caught in combinators

## Recommendations

1. **Export MergeColumnDef** — Allow custom combinator creation
2. **Create Combinator Signature Helper Type** — Reduce repetition:
   ```typescript
   type ColumnDefCombinator<NewDef extends Partial<ColumnDef>> = <A, I, R, C extends ColumnDef = never>(
     self: S.Schema<A, I, R> | DSLField<A, I, R, C>
   ) => DSLField<A, I, R, MergeColumnDef<ResolveColumnDef<...>, NewDef>>;
   ```
3. **Consolidate Metadata Attachment** — Choose single path (annotation OR direct property)
4. **Type-Safe Metadata Extraction** — Replace unsafe casting
5. **Add Constraint Validation** — Validate autoIncrement requires integer/bigint in combinators
