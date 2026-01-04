# DSL Derived Nullability Implementation

## Objective

Remove the explicit `nullable` property from `ColumnDef` in the SQL DSL module and instead derive nullability automatically from the Effect Schema AST at runtime.

## Context

The current DSL at `packages/common/schema/src/integrations/sql/dsl/` requires users to manually specify `nullable: true` when defining fields:

```typescript
Field(S.NullOr(S.String))({ column: { type: "string", nullable: true } })
```

This is redundant - the schema `S.NullOr(S.String)` already encodes nullability information. We want to derive this automatically:

```typescript
Field(S.NullOr(S.String))({ column: { type: "string" } })  // nullable derived from schema
```

## Research Documents

Before implementing, read these research documents in `.specs/dsl-derived-nullability/research/`:

1. `effect-schema-nullable-types-research.md` - Initial research on nullable types
2. `effect-schema-nullable-optional-research.md` - Comprehensive Schema.ts analysis (26 nullable patterns)
3. `effect-schemaast-nullable-patterns-exhaustive.md` - AST detection patterns and algorithm
4. `nullable-schema-types-validation.md` - Validation pass confirming completeness

## Key Schemas That Indicate Nullability

From the research, these Effect Schema patterns encode to nullable values:

### Primitives
- `S.Null` - encodes to `null`
- `S.Undefined` - encodes to `undefined`
- `S.Void` - encodes to `undefined`

### Union Combinators
- `S.NullOr(S)` - encodes to `I | null`
- `S.UndefinedOr(S)` - encodes to `I | undefined`
- `S.NullishOr(S)` - encodes to `I | null | undefined`

### Option Transformations (FROM nullable TO Option)
- `S.OptionFromNullOr(V)` - encodes to `I | null`
- `S.OptionFromUndefinedOr(V)` - encodes to `I | undefined`
- `S.OptionFromNullishOr(V)` - encodes to `I | null | undefined`

### PropertySignature Patterns
- `S.optional(S)` - property can be missing
- `S.optionalWith(S, { nullable: true })` - encodes to `I | null`
- All `optionalWith` variants with `nullable` or without `exact`

## AST Detection Algorithm

The research provides this detection algorithm:

```typescript
import * as AST from "effect/SchemaAST"
import * as A from "effect/Array"
import * as F from "effect/Function"

export const isNullable = (
  ast: AST.AST,
  side: "from" | "to" = "from",  // "from" for SQL storage
  visited: WeakSet<AST.AST> = new WeakSet()
): boolean => {
  if (visited.has(ast)) return false
  visited.add(ast)

  switch (ast._tag) {
    case "UndefinedKeyword":
    case "VoidKeyword":
      return true
    case "Literal":
      return ast.literal === null
    case "Union":
      return F.pipe(ast.types, A.some((m) => isNullable(m, side, visited)))
    case "Refinement":
      return isNullable(ast.from, side, visited)
    case "Suspend":
      return isNullable(ast.f(), side, visited)
    case "Transformation":
      return isNullable(side === "from" ? ast.from : ast.to, side, visited)
    default:
      return false
  }
}
```

## Files to Modify

1. **`packages/common/schema/src/integrations/sql/dsl/types.ts`**
   - Remove `nullable` from `ColumnDef` interface (line 171)
   - Remove `nullable` from `ExactColumnDef` type helper (line 181)
   - Update type documentation

2. **`packages/common/schema/src/integrations/sql/dsl/Field.ts`**
   - Remove `nullable` from default columnDef construction (line 149)
   - Add `isNullable` function to analyze schema AST
   - Compute nullability from the input schema's AST
   - Expose derived nullability on the DSLField/DSLVariantField

3. **`packages/common/schema/src/integrations/sql/dsl/adapters/drizzle.ts`**
   - Update column generation to use derived nullability instead of `columnDef.nullable`
   - For VariantFields, analyze the "select" variant's schema for nullability

4. **Test files** in `packages/common/schema/test/integrations/sql/dsl/`
   - Update tests that explicitly set `nullable: true`
   - Add tests verifying nullability is correctly derived from various schema patterns

## Implementation Strategy

1. Create the `isNullable` utility function in a new file or in Field.ts
2. For plain schemas: analyze `schema.ast` directly
3. For VariantFields: analyze the `select` variant's schema AST
4. Store derived nullability on the DSLField (perhaps as a getter or computed property)
5. Update Drizzle adapter to use derived nullability
6. Remove `nullable` from ColumnDef interface
7. Update all tests

## Edge Cases to Handle

1. **Recursive schemas** - Use `WeakSet` to prevent infinite recursion with `S.suspend`
2. **Transformations** - Analyze the `from` side for SQL storage semantics
3. **PropertySignatures in VariantFields** - Handle both Schema and PropertySignature types
4. **Refinements** - Recurse through refinements to find the underlying nullable type

## Validation

After implementation:
1. Run `bun run check` to verify type safety
2. Run `bun run test --filter @beep/schema` to verify tests pass
3. Verify existing DSL usage in the codebase still works (should be backwards compatible since we're removing a now-redundant option)

## Success Criteria

- `nullable` property removed from `ColumnDef`
- Nullability correctly derived for all 26 nullable schema patterns identified in research
- All existing tests pass (updated to remove explicit `nullable: true`)
- New tests cover edge cases (recursive schemas, transformations, refinements)
- Drizzle adapter generates correct `.notNull()` calls based on derived nullability
