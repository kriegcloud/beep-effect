---
name: dsl-derived-nullability
version: 2
created: 2025-12-27T23:30:00Z
iterations: 1
---

# DSL Derived Nullability - Refined Prompt

## Context

The `beep-effect` monorepo contains a SQL DSL module at `packages/common/schema/src/integrations/sql/dsl/` that wraps Effect Schemas with column metadata for Drizzle ORM integration. Currently, users must manually specify `nullable: true` when defining nullable fields:

```typescript
// Current: Redundant specification
Field(S.NullOr(S.String))({ column: { type: "string", nullable: true } })
```

The schema `S.NullOr(S.String)` already encodes nullability in its AST. The type system includes `StripNullable<T>` (types.ts:61) which strips null/undefined for compatibility checks, proving nullability detection is feasible.

**Codebase Structure**:
```
packages/common/schema/src/integrations/sql/dsl/
├── Field.ts        # Field factory - LINE 149 is modification target
├── types.ts        # ColumnDef interface, StripNullable type
├── Model.ts        # Model class generator
├── combinators.ts  # Pipe-style DSL (includes nullable combinator)
├── literals.ts     # ColumnType, ModelVariant literals
├── adapters/
│   └── drizzle.ts  # Column generation - respects nullable flag
└── index.ts        # Public exports

packages/common/bsl/src/
└── Field.ts        # Parallel BSL implementation - LINE 126

packages/common/schema/test/integrations/sql/dsl/
├── variant-integration.test.ts  # 13 instances of nullable: true
├── drizzle-typed-columns.test.ts # 2 instances of nullable: true
├── poc.test.ts
└── combinators.test.ts
```

**Research Documents** (pre-read these):
- `.specs/dsl-derived-nullability/research/effect-schema-nullable-optional-research.md` - 26 nullable patterns
- `.specs/dsl-derived-nullability/research/effect-schemaast-nullable-patterns-exhaustive.md` - AST detection algorithm
- `.specs/dsl-derived-nullability/research/nullable-schema-types-validation.md` - Validation confirmation

**Key Dependency**: `M.FieldOption` is from `@effect/sql/Model` - it wraps schemas in `OptionFromNullOr` transformation, making the encoded type nullable.

## Objective

Remove the explicit `nullable` property from `ColumnDef` and derive nullability automatically from the Effect Schema AST at runtime.

**Measurable Outcomes**:
1. `nullable` property removed from `ColumnDef` interface (types.ts:171)
2. `nullable` removed from `ExactColumnDef` type helper (types.ts:181)
3. `Field.ts` analyzes schema AST to determine nullability (replace line 149)
4. `bsl/Field.ts` receives parallel changes (line 126)
5. All 15 test instances updated to remove redundant `nullable: true`
6. New test file covers all 26 nullable schema patterns
7. `bun run check` and `bun run test --filter @beep/schema` pass

**Target API**:
```typescript
// After: Nullability derived automatically
Field(S.NullOr(S.String))({ column: { type: "string" } })  // nullable: true derived
Field(S.String)({ column: { type: "string" } })            // nullable: false derived
```

**Breaking Change**: This is a breaking change. Code passing `nullable` in config will produce a TypeScript error after the property is removed from `ColumnDef`.

## Role

You are an Effect-first TypeScript engineer implementing AST-based schema introspection. You have deep knowledge of:
- Effect Schema AST structure (`effect/SchemaAST`)
- Effect functional patterns (pipe, Array, Match, Predicate)
- The beep-effect DSL architecture

## Constraints

### Effect Idioms (MANDATORY)

```typescript
// ✅ REQUIRED - Namespace imports only (never destructure)
import * as A from "effect/Array"
import * as F from "effect/Function"
import * as O from "effect/Option"
import * as P from "effect/Predicate"
import * as Match from "effect/Match"
import * as Struct from "effect/Struct"
import * as AST from "effect/SchemaAST"
import type * as S from "effect/Schema"

// Check if union has nullable member
F.pipe(
  ast.types,
  A.some((type) =>
    AST.isUndefinedKeyword(type) ||
    AST.isVoidKeyword(type) ||
    (AST.isLiteral(type) && type.literal === null)
  )
)

// Pattern matching on AST
Match.value(ast).pipe(
  Match.when(AST.isUndefinedKeyword, () => true),
  Match.when(AST.isVoidKeyword, () => true),
  Match.when(AST.isLiteral, (lit) => lit.literal === null),
  Match.when(AST.isUnion, (union) => hasNullableMember(union)),
  Match.orElse(() => false)
)
```

### Forbidden Patterns (NEVER USE)

```typescript
// ❌ FORBIDDEN - Native methods
ast.types.some(fn)           // Use F.pipe(ast.types, A.some(fn))
ast.types.map(fn)            // Use F.pipe(ast.types, A.map(fn))
ast.types.filter(fn)         // Use F.pipe(ast.types, A.filter(fn))
Object.keys(obj)             // Use F.pipe(obj, Struct.keys)
switch (ast._tag) { ... }    // Use Match.value(ast).pipe(...)
async/await                  // Use Effect.gen

// ❌ FORBIDDEN - Named imports
import { pipe } from "effect/Function"
import { some } from "effect/Array"
```

### AST Traversal Rules

1. **For Transformations**: Check `ast.from` (the encoded type that maps to SQL), not `ast.to`
2. **For Refinements**: Recurse into `ast.from` to find the underlying type
3. **For Suspend**: Call `ast.f()` and recurse - use WeakSet to prevent infinite loops on recursive schemas
4. **For PropertySignature**: Check both `isOptional` flag AND recurse into the `type` AST
5. **For PropertySignatureTransformation**: Check `ast.from.isOptional` flag AND recurse into `ast.from.type`

### WeakSet Pattern for Recursive Schemas

```typescript
/**
 * Prevents infinite recursion when analyzing recursive schemas like:
 * const Rec = S.Struct({ self: S.suspend(() => S.NullOr(Rec)) })
 */
const isNullableAST = (
  ast: AST.AST,
  visited: WeakSet<AST.AST> = new WeakSet()
): boolean => {
  // Prevent infinite loop on recursive schemas
  if (visited.has(ast)) return false
  visited.add(ast)

  // For Suspend nodes, evaluate the thunk safely
  if (AST.isSuspend(ast)) {
    try {
      return isNullableAST(ast.f(), visited)
    } catch {
      // If thunk evaluation fails, assume not nullable
      return false
    }
  }

  // ... rest of implementation
}
```

### Error Handling

- Wrap `ast.f()` calls in try-catch and return `false` on error
- Do not use Effect error handling for this synchronous utility
- Log warnings for unexpected AST structures (use `console.warn` during development)

## Resources

### Files to Read First
1. `packages/common/schema/src/integrations/sql/dsl/types.ts` - ColumnDef interface
2. `packages/common/schema/src/integrations/sql/dsl/Field.ts` - Current implementation
3. `.specs/dsl-derived-nullability/research/effect-schemaast-nullable-patterns-exhaustive.md` - Detection algorithm

### Files to Modify
1. **`packages/common/schema/src/integrations/sql/dsl/types.ts`**
   - Remove `nullable?: N` from ColumnDef (line 171)
   - Remove `nullable` from ExactColumnDef (line 181)
   - Remove `N extends boolean = boolean` type parameter from ColumnDef

2. **`packages/common/schema/src/integrations/sql/dsl/Field.ts`**
   - Add `isNullableSchema` as an unexported helper function (keep in same file, no new file needed)
   - Replace line 149: `nullable: config?.column?.nullable ?? false`
   - With: `nullable: isNullableSchema(input)`

3. **`packages/common/bsl/src/Field.ts`**
   - Apply same changes as dsl/Field.ts (line 126)
   - Import or duplicate `isNullableSchema` helper

4. **`packages/common/schema/src/integrations/sql/dsl/combinators.ts`**
   - **Remove** the `nullable` combinator entirely (lines 337-340) - it is now redundant and could cause confusion

### Files to Update (Tests)
1. `packages/common/schema/test/integrations/sql/dsl/variant-integration.test.ts`
   - Remove 13 instances of `nullable: true`
2. `packages/common/schema/test/integrations/sql/dsl/drizzle-typed-columns.test.ts`
   - Remove 2 instances of `nullable: true`

### Files to Create
1. **`packages/common/schema/test/integrations/sql/dsl/derived-nullability.test.ts`**
   - Follow existing test pattern (see `variant-integration.test.ts` for structure)
   - Test all 26 nullable schema patterns

## Output Specification

### Deliverable 1: `isNullableSchema` Function

Add to `Field.ts` as an unexported helper:

```typescript
import * as AST from "effect/SchemaAST"
import * as A from "effect/Array"
import * as F from "effect/Function"
import type * as S from "effect/Schema"

/**
 * Analyzes a Schema's AST to determine if its encoded type is nullable.
 * Checks for: S.Null, S.Undefined, S.Void, S.NullOr, S.UndefinedOr,
 * S.NullishOr, S.OptionFromNullOr, S.optional, etc.
 *
 * Uses "encoded type" analysis (ast.from for transformations) since
 * the encoded type is what gets stored in the database.
 *
 * @param schema - The schema to analyze (S.Schema<any, any, any> or S.Schema.All)
 * @returns true if the encoded type can be null or undefined
 */
const isNullableSchema = (
  schema: S.Schema<unknown, unknown, unknown> | S.Schema.All
): boolean => {
  const visited = new WeakSet<AST.AST>()
  return isNullableAST(schema.ast, visited)
}

const isNullableAST = (
  ast: AST.AST,
  visited: WeakSet<AST.AST>
): boolean => {
  if (visited.has(ast)) return false
  visited.add(ast)

  // Direct nullable types
  if (AST.isUndefinedKeyword(ast)) return true
  if (AST.isVoidKeyword(ast)) return true
  if (AST.isLiteral(ast) && ast.literal === null) return true

  // Union: check if any member is nullable
  if (AST.isUnion(ast)) {
    return F.pipe(
      ast.types,
      A.some((member) => isNullableAST(member, visited))
    )
  }

  // Transformation: check encoded side (ast.from)
  if (AST.isTransformation(ast)) {
    return isNullableAST(ast.from, visited)
  }

  // Refinement: check underlying type
  if (AST.isRefinement(ast)) {
    return isNullableAST(ast.from, visited)
  }

  // Suspend: evaluate thunk safely
  if (AST.isSuspend(ast)) {
    try {
      return isNullableAST(ast.f(), visited)
    } catch {
      return false
    }
  }

  return false
}
```

### Deliverable 2: Updated ColumnDef

```typescript
// types.ts - AFTER
export interface ColumnDef<
  T extends ColumnType.Type = ColumnType.Type,
  PK extends boolean = boolean,
  U extends boolean = boolean,
  AI extends boolean = boolean,
> {
  readonly type: T;
  readonly primaryKey?: PK;
  readonly unique?: U;
  // nullable REMOVED - now derived from schema AST
  readonly defaultValue?: undefined | string | (() => string);
  readonly autoIncrement?: AI;
}

// ExactColumnDef - AFTER
export type ExactColumnDef<C extends Partial<ColumnDef>> = {
  readonly type: C extends { type: infer T extends ColumnType.Type } ? T : "string";
  readonly primaryKey: C extends { primaryKey: infer PK extends boolean } ? PK : false;
  readonly unique: C extends { unique: infer U extends boolean } ? U : false;
  // nullable REMOVED
  readonly autoIncrement: C extends { autoIncrement: infer AI extends boolean } ? AI : false;
  readonly defaultValue: C extends { defaultValue: infer DV } ? DV : undefined;
};
```

### Deliverable 3: Test Coverage

New test file must cover:
```typescript
import { describe, it, expect } from "@effect/vitest"
import * as S from "effect/Schema"
import * as M from "@effect/sql/Model"
import { Field } from "../src/integrations/sql/dsl/Field"
import { ColumnMetaSymbol } from "../src/integrations/sql/dsl/types"

describe("derived nullability", () => {
  // Helper to extract nullable from field
  const getNullable = (field: unknown): boolean =>
    (field as Record<symbol, { nullable: boolean }>)[ColumnMetaSymbol].nullable

  // Primitives
  it("S.Null → nullable: true", () => {
    const field = Field(S.Null)({ column: { type: "string" } })
    expect(getNullable(field)).toBe(true)
  })

  it("S.Undefined → nullable: true", () => {
    const field = Field(S.Undefined)({ column: { type: "string" } })
    expect(getNullable(field)).toBe(true)
  })

  it("S.Void → nullable: true", () => {
    const field = Field(S.Void)({ column: { type: "string" } })
    expect(getNullable(field)).toBe(true)
  })

  // Unions
  it("S.NullOr(S.String) → nullable: true", () => {
    const field = Field(S.NullOr(S.String))({ column: { type: "string" } })
    expect(getNullable(field)).toBe(true)
  })

  it("S.UndefinedOr(S.String) → nullable: true", () => {
    const field = Field(S.UndefinedOr(S.String))({ column: { type: "string" } })
    expect(getNullable(field)).toBe(true)
  })

  it("S.NullishOr(S.String) → nullable: true", () => {
    const field = Field(S.NullishOr(S.String))({ column: { type: "string" } })
    expect(getNullable(field)).toBe(true)
  })

  // Option transformations
  it("S.OptionFromNullOr(S.String) → nullable: true", () => {
    const field = Field(S.OptionFromNullOr(S.String))({ column: { type: "string" } })
    expect(getNullable(field)).toBe(true)
  })

  it("S.OptionFromUndefinedOr(S.String) → nullable: true", () => {
    const field = Field(S.OptionFromUndefinedOr(S.String))({ column: { type: "string" } })
    expect(getNullable(field)).toBe(true)
  })

  it("S.OptionFromNullishOr(S.String, null) → nullable: true", () => {
    const field = Field(S.OptionFromNullishOr(S.String, null))({ column: { type: "string" } })
    expect(getNullable(field)).toBe(true)
  })

  // Non-nullable
  it("S.String → nullable: false", () => {
    const field = Field(S.String)({ column: { type: "string" } })
    expect(getNullable(field)).toBe(false)
  })

  it("S.Int → nullable: false", () => {
    const field = Field(S.Int)({ column: { type: "integer" } })
    expect(getNullable(field)).toBe(false)
  })

  it("S.Boolean → nullable: false", () => {
    const field = Field(S.Boolean)({ column: { type: "boolean" } })
    expect(getNullable(field)).toBe(false)
  })

  // Edge cases
  it("recursive schema with S.suspend → no infinite loop", () => {
    interface Rec {
      readonly value: string
      readonly self: Rec | null
    }
    const Rec: S.Schema<Rec> = S.Struct({
      value: S.String,
      self: S.suspend(() => S.NullOr(Rec))
    })
    // Should not hang - just verify it completes
    const field = Field(Rec)({ column: { type: "json" } })
    expect(getNullable(field)).toBe(false) // Struct itself is not nullable
  })

  it("S.String.pipe(S.minLength(1)) → nullable: false (refinement)", () => {
    const field = Field(S.String.pipe(S.minLength(1)))({ column: { type: "string" } })
    expect(getNullable(field)).toBe(false)
  })

  it("S.NumberFromString → nullable: false (transformation)", () => {
    const field = Field(S.NumberFromString)({ column: { type: "string" } })
    expect(getNullable(field)).toBe(false)
  })

  // Drizzle integration
  it("Drizzle: S.String generates .notNull()", () => {
    // Verify through toDrizzle adapter output
  })

  it("Drizzle: S.NullOr(S.String) generates no .notNull()", () => {
    // Verify through toDrizzle adapter output
  })
})
```

## Migration Notes

### For Users Upgrading

**Before** (will cause TypeScript error after upgrade):
```typescript
Field(S.NullOr(S.String))({ column: { type: "string", nullable: true } })
//                                                    ^^^^^^^^^^^^^^^^
// Error: 'nullable' does not exist in type 'Partial<ColumnDef>'
```

**After** (correct usage):
```typescript
Field(S.NullOr(S.String))({ column: { type: "string" } })
// nullable: true is derived automatically from S.NullOr
```

**Migration steps**:
1. Remove all `nullable: true` from Field config objects
2. Remove all `.pipe(DSL.nullable)` chains (combinator removed)
3. Run `bun run check` to find any remaining references

## Examples

### Before Implementation

```typescript
// User must manually specify nullable
const UserFields = {
  id: Field(UserId)({ column: { type: "uuid", primaryKey: true } }),
  name: Field(S.String)({ column: { type: "string" } }),
  bio: Field(S.NullOr(S.String))({ column: { type: "string", nullable: true } }),  // Redundant!
  age: Field(M.FieldOption(S.Int))({ column: { type: "integer", nullable: true } }), // Redundant!
}
```

### After Implementation

```typescript
// Nullability derived automatically
const UserFields = {
  id: Field(UserId)({ column: { type: "uuid", primaryKey: true } }),
  name: Field(S.String)({ column: { type: "string" } }),           // nullable: false (derived)
  bio: Field(S.NullOr(S.String))({ column: { type: "string" } }),  // nullable: true (derived)
  age: Field(M.FieldOption(S.Int))({ column: { type: "integer" } }), // nullable: true (derived)
}
```

### AST Detection Example

```typescript
// S.NullOr(S.String) produces this AST:
Union {
  types: [
    StringKeyword {},
    Literal { literal: null }  // ← Detected as nullable
  ]
}

// S.OptionFromNullOr(S.String) produces this AST:
Transformation {
  from: Union {           // ← Check encoded type (ast.from) for SQL
    types: [
      StringKeyword {},
      Literal { literal: null }
    ]
  },
  to: Declaration { ... } // Option type (decoded type, not relevant for SQL)
}
```

## Verification Checklist

- [ ] `isNullableSchema` function created using Effect idioms (no native methods)
- [ ] All 26 nullable patterns correctly detected (see research docs)
- [ ] WeakSet used to prevent infinite loops on recursive schemas
- [ ] `ast.f()` calls wrapped in try-catch
- [ ] `nullable` removed from `ColumnDef` interface
- [ ] `nullable` removed from `ExactColumnDef` type
- [ ] `N extends boolean` type parameter removed from ColumnDef
- [ ] Field.ts line 149 updated to use `isNullableSchema`
- [ ] bsl/Field.ts line 126 updated in parallel
- [ ] `nullable` combinator removed from combinators.ts
- [ ] 15 test instances updated (removed explicit `nullable: true`)
- [ ] New `derived-nullability.test.ts` covers all patterns
- [ ] Recursive schema test passes (no infinite loop, completes in <100ms)
- [ ] `bun run check` passes
- [ ] `bun run test --filter @beep/schema` passes
- [ ] Drizzle adapter test: `S.String` generates `.notNull()`
- [ ] Drizzle adapter test: `S.NullOr(S.String)` generates no `.notNull()` call
- [ ] Performance: `isNullableSchema` adds negligible overhead (<1ms per Field)

---

## Metadata

### Research Sources
- Files explored:
  - `packages/common/schema/src/integrations/sql/dsl/types.ts`
  - `packages/common/schema/src/integrations/sql/dsl/Field.ts`
  - `packages/common/schema/src/integrations/sql/dsl/Model.ts`
  - `packages/common/schema/src/integrations/sql/dsl/adapters/drizzle.ts`
  - `packages/common/schema/src/integrations/sql/dsl/combinators.ts`
  - `packages/common/bsl/src/Field.ts`
  - `packages/common/schema/test/integrations/sql/dsl/*.test.ts`
- Documentation:
  - `.specs/dsl-derived-nullability/research/*.md` (4 research docs)
  - Root `AGENTS.md` - Effect patterns
  - `packages/common/schema/AGENTS.md` - Schema guidelines

### Refinement History
| Iteration | Issues Found | Fixes Applied |
|-----------|--------------|---------------|
| 0         | Initial      | N/A           |
| 1         | 8 issues (2 HIGH, 3 MEDIUM, 3 LOW) | Added PropertySignatureTransformation rule, WeakSet pattern with try-catch, Struct import, explicit type for isNullableSchema, backwards compatibility note, migration guide, M.FieldOption explanation, removed combinator decision, performance checklist item, Drizzle validation tests |
