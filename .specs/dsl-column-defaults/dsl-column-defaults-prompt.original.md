---
name: dsl-column-defaults
version: 1
created: 2025-12-30T00:00:00Z
iterations: 0
---

# DSL Column Defaults Enhancement - Refined Prompt

## Context

You are working in the `beep-effect` monorepo, specifically on the DSL (Domain Specific Language) module for SQL schema generation located in `packages/common/schema/src/integrations/sql/dsl/`.

The DSL provides a type-safe way to define database models using Effect Schema, which are then converted to Drizzle ORM tables via an adapter. Currently, the `ColumnDef` interface has a single `defaultValue` property that accepts `string | (() => string)`, which conflates several distinct concepts that Drizzle ORM separates:

**Current State** (`types.ts` lines 818-826):
```typescript
export declare namespace ColumnDef {
  export interface Any {
    readonly type: ColumnType.Type;
    readonly primaryKey?: boolean;
    readonly unique?: boolean;
    readonly defaultValue?: undefined | string | (() => string);
    readonly autoIncrement?: boolean;
  }
}
```

**Drizzle ORM's Column Builder** (`tmp/drizzle-orm/drizzle-orm/src/column-builder.ts` lines 314-364) separates these concepts:

1. **`default(value)`** - Static SQL default value evaluated by the database (e.g., `'active'`, `now()`)
2. **`$defaultFn(fn)` / `$default(fn)`** - Runtime function called by Drizzle on INSERT when value is undefined
3. **`$onUpdateFn(fn)` / `$onUpdate(fn)`** - Runtime function called by Drizzle on UPDATE when value is undefined (also used on INSERT if no `$defaultFn`)

The Drizzle config stores these separately:
```typescript
interface ColumnBuilderRuntimeConfig<TData> {
  default: TData | SQL | undefined;              // Static SQL default
  defaultFn: (() => TData | SQL) | undefined;    // Runtime default function
  onUpdateFn: (() => TData | SQL) | undefined;   // Runtime update function
  hasDefault: boolean;                           // Flag for any default behavior
}
```

## Objective

Refactor the DSL column definition system to replace the single `defaultValue` property with five distinct properties that align with Drizzle ORM's column builder API:

1. **`default`** - Static SQL default value (string, evaluated by database)
2. **`$default`** - Alias for `$defaultFn` (for API parity with Drizzle)
3. **`$defaultFn`** - Runtime function returning default value on INSERT
4. **`$onUpdate`** - Alias for `$onUpdateFn` (for API parity with Drizzle)
5. **`$onUpdateFn`** - Runtime function returning value on UPDATE

### Success Criteria

- [ ] `ColumnDef` interface updated with new properties, `defaultValue` removed
- [ ] `ColumnDef.Any` namespace interface updated accordingly
- [ ] `ExactColumnDef` type handles all five new properties
- [ ] `ColumnDefSchema` factories updated for each column type (String, Number, Integer, Boolean, Datetime, Uuid, Json, Bigint)
- [ ] `Field` function extracts and stores new properties in column metadata
- [ ] `MergeColumnDef` type in combinators handles all new properties
- [ ] New combinator functions created: `$default()`, `$defaultFn()`, `$onUpdate()`, `$onUpdateFn()`
- [ ] Existing `defaultValue` combinator renamed to `default` (or removed with migration path)
- [ ] `ApplyHasDefault` type in drizzle adapter checks for all default-related properties
- [ ] `columnBuilder` runtime function applies defaults to Drizzle columns in correct order
- [ ] Type check passes: `bunx turbo run check --filter='@beep/schema'`
- [ ] All existing tests updated and pass
- [ ] New tests added for each new property/combinator

## Role

You are a senior TypeScript engineer with deep expertise in:
- Effect ecosystem (Effect, Schema, functional patterns)
- Drizzle ORM internals and type system
- Advanced TypeScript generics, conditional types, and mapped types
- Type-safe DSL design patterns

You understand that runtime behavior must match type-level representations, and you prioritize backward compatibility where possible.

## Constraints

### Effect Patterns (from AGENTS.md)
- Use Effect Array utilities (`A.map`, `A.filter`, `A.forEach`) instead of native array methods
- Use Effect String utilities (`Str.replace`, `Str.toLowerCase`) instead of native string methods
- Use Effect Record utilities (`R.values`, `R.map`) and Struct utilities (`Struct.keys`, `Struct.entries`)
- Use `F.pipe()` for composition
- Use `Match.value()` with exhaustive matching instead of switch statements
- Import conventions: `import * as A from "effect/Array"`, `import * as F from "effect/Function"`, etc.

### Type-Safety Requirements
- No `any` types except where explicitly casting to Drizzle's `any` requirements
- Preserve literal types through generics (use `const` generics where applicable)
- Ensure `ApplyHasDefault` correctly marks columns with any default as `HasDefault<T>`
- Runtime behavior must match type-level inference

### Drizzle Integration
- Column builder chain order matters: base → primaryKey → unique → notNull → defaults → $type
- `.$type<T>()` must be called LAST (it's type-level only)
- `HasDefault<T>` type must be applied when ANY default property is present
- `HasRuntimeDefault<T>` should be applied when `$defaultFn` is present

### Backward Compatibility
- Consider a deprecation path for `defaultValue` if not removing immediately
- Existing tests may use `defaultValue` - update them to use `default` or appropriate new property
- Document migration in code comments

## Resources

### Files to Read and Modify

**Core Types** (read first, modify):
- `packages/common/schema/src/integrations/sql/dsl/types.ts`
  - Lines 805-836: `ColumnDef` interface, `ColumnDef.Any`, `ExactColumnDef`
  - Lines 481-717: ColumnDefSchema factories for each column type
  - Lines 442-451: `defaultValueSchema` factory (to be extended/replaced)

**Drizzle Adapter** (read first, modify):
- `packages/common/schema/src/integrations/sql/dsl/adapters/drizzle.ts`
  - Lines 40-132: Type-level modifiers (`ApplyHasDefault`, `DrizzleTypedBuilderFor`)
  - Lines 214-243: `columnBuilder` runtime function

**Field Factory** (modify):
- `packages/common/schema/src/integrations/sql/dsl/Field.ts`
  - Lines 245-261: Column definition assembly

**Combinators** (modify):
- `packages/common/schema/src/integrations/sql/dsl/combinators.ts`
  - Lines 68-75: `DerivedDefaultColumnDef` initial values
  - Lines 96-114: `MergeColumnDef` type
  - Lines 138: `attachColumnDef` helper
  - Lines 415-420: Current `defaultValue` combinator

**Reference Implementation** (read only):
- `tmp/drizzle-orm/drizzle-orm/src/column-builder.ts`
  - Lines 314-364: `default`, `$defaultFn`, `$onUpdateFn` implementations
  - Lines 179-195: `ColumnBuilderRuntimeConfig` interface

**Test Files** (modify):
- `packages/common/schema/test/integrations/sql/dsl/combinators.test.ts`
- `packages/common/schema/test/integrations/sql/dsl/field-model-comprehensive.test.ts`
- `packages/common/schema/test/integrations/sql/dsl/drizzle-typed-columns.test.ts`

### Effect Documentation
- Use `mcp__effect_docs__effect_docs_search` for Effect Schema patterns if needed

## Output Specification

### File Changes

1. **`types.ts`** - Update interfaces and schema factories:
   ```typescript
   export interface ColumnDef<...> {
     readonly type: ColType;
     readonly primaryKey?: PrimaryKey;
     readonly unique?: Unique;
     readonly autoIncrement?: AutoIncrement;
     // NEW: Replace defaultValue with these five properties
     readonly default?: string;                    // Static SQL default
     readonly $default?: () => unknown;            // Alias for $defaultFn
     readonly $defaultFn?: () => unknown;          // Runtime default function
     readonly $onUpdate?: () => unknown;           // Alias for $onUpdateFn
     readonly $onUpdateFn?: () => unknown;         // Runtime update function
   }
   ```

2. **`drizzle.ts`** - Update type modifiers and runtime builder:
   ```typescript
   type ApplyHasDefault<T, Col> =
     Col extends { autoIncrement: true } ? HasDefault<T>
     : Col extends { default: string } ? HasDefault<T>
     : Col extends { $default: unknown } ? HasDefault<T>
     : Col extends { $defaultFn: unknown } ? HasDefault<T>
     : Col extends { $onUpdate: unknown } ? HasDefault<T>
     : Col extends { $onUpdateFn: unknown } ? HasDefault<T>
     : T;
   ```

3. **`combinators.ts`** - Add new combinator functions:
   ```typescript
   export const $defaultFn = <A, I, R, C extends ColumnDef = never>(
     fn: () => unknown
   ) => (self: S.Schema<A, I, R> | DSLField<A, I, R, C>): DSLField<...> =>
     attachColumnDef(self, { $defaultFn: fn });

   export const $onUpdateFn = <A, I, R, C extends ColumnDef = never>(
     fn: () => unknown
   ) => (self: S.Schema<A, I, R> | DSLField<A, I, R, C>): DSLField<...> =>
     attachColumnDef(self, { $onUpdateFn: fn });
   ```

4. **`Field.ts`** - Extract new properties from config

5. **Test files** - Update to use new API, add tests for new properties

### Naming Conventions
- Combinator functions: `$defaultFn`, `$onUpdateFn` (match Drizzle naming)
- Alias combinators: `$default` (calls `$defaultFn`), `$onUpdate` (calls `$onUpdateFn`)
- Static default combinator: rename `defaultValue` to `default`

### Export Pattern
All new combinators should be exported from `combinators.ts` and re-exported from `index.ts`.

## Examples

### Before (Current API)
```typescript
// Static default
const status = S.String.pipe(DSL.string, DSL.defaultValue("'active'"));

// Function default (conflated with static)
const createdAt = S.String.pipe(DSL.datetime, DSL.defaultValue(() => "now()"));
```

### After (New API)
```typescript
// Static SQL default (evaluated by database)
const status = S.String.pipe(DSL.string, DSL.default("'active'"));

// Runtime default function (evaluated by Drizzle on INSERT)
const id = S.String.pipe(DSL.uuid, DSL.$defaultFn(() => crypto.randomUUID()));

// Runtime update function (evaluated by Drizzle on UPDATE)
const updatedAt = S.String.pipe(
  DSL.datetime,
  DSL.$onUpdateFn(() => new Date().toISOString())
);

// Combination: static default for INSERT, runtime for UPDATE
const version = S.Number.pipe(
  DSL.integer,
  DSL.default("1"),
  DSL.$onUpdateFn(() => sql`${version} + 1`)
);
```

### Model Definition Example
```typescript
class User extends Model<User>("User")("user", {
  id: Field(UserId)({
    column: {
      type: "uuid",
      primaryKey: true,
      $defaultFn: () => crypto.randomUUID()
    }
  }),
  status: Field(S.String)({
    column: {
      type: "string",
      default: "'active'"
    }
  }),
  createdAt: Field(S.String)({
    column: {
      type: "datetime",
      default: "now()"
    }
  }),
  updatedAt: Field(S.String)({
    column: {
      type: "datetime",
      $onUpdateFn: () => new Date().toISOString()
    }
  }),
}) {}
```

### Drizzle Adapter Output
```typescript
// The columnBuilder should produce equivalent to:
const userTable = pgTable("user", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  status: text("status")
    .notNull()
    .default("'active'"),
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdateFn(() => new Date().toISOString()),
});
```

## Verification Checklist

- [ ] `ColumnDef` interface has `default`, `$default`, `$defaultFn`, `$onUpdate`, `$onUpdateFn` properties
- [ ] `defaultValue` property is removed (or deprecated with clear migration path)
- [ ] `ColumnDef.Any` matches the main interface
- [ ] `ExactColumnDef<C>` correctly infers all five properties
- [ ] All 8 ColumnDefSchema factories updated (String, Number, Integer, Boolean, Datetime, Uuid, Json, Bigint)
- [ ] `ApplyHasDefault` checks for all default-related properties
- [ ] `columnBuilder` applies defaults in correct order (static before runtime)
- [ ] `columnBuilder` calls `.default()` for static, `.$defaultFn()` for runtime, `.$onUpdateFn()` for update
- [ ] New combinators exported: `default`, `$default`, `$defaultFn`, `$onUpdate`, `$onUpdateFn`
- [ ] `MergeColumnDef` handles all five properties
- [ ] Type check passes: `bunx turbo run check --filter='@beep/schema'`
- [ ] Lint passes: `bunx turbo run lint:fix --filter='@beep/schema'`
- [ ] All tests pass: `bun test packages/common/schema/test/integrations/sql/dsl/`
- [ ] No `async/await` or native array/string methods used
- [ ] All Effect import conventions followed

---

## Metadata

### Research Sources
- Files:
  - `packages/common/schema/src/integrations/sql/dsl/types.ts` (lines 442-451, 481-717, 805-836)
  - `packages/common/schema/src/integrations/sql/dsl/adapters/drizzle.ts` (lines 40-132, 214-243)
  - `packages/common/schema/src/integrations/sql/dsl/Field.ts` (lines 245-261)
  - `packages/common/schema/src/integrations/sql/dsl/combinators.ts` (lines 68-75, 96-114, 415-420)
  - `tmp/drizzle-orm/drizzle-orm/src/column-builder.ts` (lines 179-195, 314-364)
- Documentation: Drizzle ORM column builder API
- Packages: `@beep/schema` AGENTS.md

### Refinement History
| Iteration | Issues Found | Fixes Applied |
|-----------|--------------|---------------|
| 0         | Initial      | N/A           |
