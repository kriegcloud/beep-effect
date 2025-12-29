# Issue P2-1: DSL.Fields Index Signature Uses `any`

## Verdict: NECESSARY

## Issue Location
**File**: `packages/common/schema/src/integrations/sql/dsl/types.ts`
**Lines**: 529-538

## Code in Question
```typescript
export declare namespace DSL {
  export type Fields = {
    readonly [key: string]:
      | S.Schema.All
      | S.PropertySignature.All
      | DSLField<any, any, any>
      | DSLVariantField<any>
      | VariantSchema.Field<any>
      | undefined;
  };
}
```

## Issue Analysis

The `any` type parameters serve three structural purposes:

1. **Variance Matching**: Index signatures must accept fields with any possible type parameters without requiring callers to specify them.

2. **Pattern Matching in Conditional Types**: Downstream type-level code uses `infer` to extract specific type parameters. The `any` is immediately discarded via `infer`, preventing type pollution:
   ```typescript
   [F] extends [DSLVariantField<infer Config, any>]
   ```

3. **Structural Compatibility**: This mirrors the upstream `VariantSchema.Field.Fields` pattern (line 145 in `VariantSchema.ts`).

## Alternatives Considered

| Alternative | Why It Doesn't Work |
|-------------|---------------------|
| Use `unknown` | Breaks pattern matching (variance issues) |
| Use `never` | Breaks field assignment (too narrow) |
| Remove type params | Not syntactically valid |
| Use `UnsafeTypes.UnsafeAny` | Cosmetic only - still `any` under the hood |

## Type Safety Analysis

**Does the `any` leak?** No.
- Confined to type-level checks - never enters runtime
- Immediately extracted via `infer` - discarded, not propagated
- Used only for structural matching, then narrowed

## Recommendation

**Keep as-is.** The `any` is structurally required for TypeScript's type system to work correctly with this pattern.

Optional: Replace with `UnsafeTypes.UnsafeAny` for explicit documentation that this is an intentional escape hatch, consistent with `Model.ts` usage.

## Reasoning

This is a textbook example of **necessary `any`** in advanced TypeScript patterns. The `any` serves the same role as TypeScript's built-in utility types like `ReturnType<T>` which uses `any[]` for parameter matching.
