# Issues P2-2 & P2-3: ExtractColumnsType and ExtractPrimaryKeys Use UnsafeAny

## Verdict: NECESSARY

## Issue Locations
**File**: `packages/common/schema/src/integrations/sql/dsl/Model.ts`

### P2-2: ExtractColumnsType (lines 41-50)
```typescript
export type ExtractColumnsType<Fields extends DSL.Fields> = {
  readonly [K in keyof Fields]:
  [Fields[K]] extends [DSLVariantField<UnsafeTypes.UnsafeAny, infer C>]
    ? C
    : [Fields[K]] extends [DSLField<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny, infer C>]
      ? C
      : ColumnDef<"string", false, false, false>;
};
```

### P2-3: ExtractPrimaryKeys (lines 54-66)
```typescript
export type ExtractPrimaryKeys<Fields extends DSL.Fields> = {
  [K in keyof Fields]:
  [Fields[K]] extends [DSLVariantField<UnsafeTypes.UnsafeAny, infer C>]
    ? C extends { primaryKey: true }
      ? K
      : never
    : [Fields[K]] extends [DSLField<UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny, UnsafeTypes.UnsafeAny, infer C>]
      ? C extends { primaryKey: true }
        ? K
        : never
      : never;
}[keyof Fields];
```

## Issue Analysis

Both types use `UnsafeTypes.UnsafeAny` as wildcard parameters in conditional type patterns to extract the column definition type parameter (`C`) while ignoring other type parameters.

### Why This is Necessary

According to TypeScript documentation on conditional types, `any` acts as a permissive wildcard that matches all possible types in pattern matching. Using `unknown` would be too strict because:

1. **Variant configs are objects**: `DSLVariantField<A extends VariantSchema.Field.Config, C>` has a constrained first parameter
2. **Schema type parameters vary**: `DSLField<A, I, R, C>` has three schema-related type parameters

## Containment Analysis

The `UnsafeAny` is **fully contained** within the conditional type pattern matching logic:

```typescript
// Usage example - NO any in the result!
class User extends Model<User>("User")({
  id: Field(S.UUID)({}),
}) {}

type UserColumns = ExtractColumnsType<typeof User._fields>;
// Result: { id: ColumnDef<"uuid", ...> } ← Type-safe, no any!
```

## Alternatives Considered

| Alternative | Why It Doesn't Work |
|-------------|---------------------|
| Use `unknown` | Would fail to match constrained type parameters |
| Use unconstrained type variables | Would lose tuple wrapping that prevents distributive conditional types |

## Recommendation

**Keep as-is.** The current implementation:
1. Uses `UnsafeTypes.UnsafeAny` - a centralized, documented type alias
2. Follows TypeScript best practices for conditional type wildcards
3. Produces fully type-safe results with no `any` leakage
4. Uses defensive tuple wrapping to prevent distributive issues

## Reasoning

This pattern mirrors TypeScript's standard library. For example, `ReturnType<T>` uses:
```typescript
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any
```

The `any[]` serves the same wildcard role as `UnsafeAny` in these types.
