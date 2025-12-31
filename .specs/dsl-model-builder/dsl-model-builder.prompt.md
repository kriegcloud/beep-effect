---
name: dsl-model-builder
version: 2
created: 2025-12-30T00:00:00Z
iterations: 1
---

# ModelBuilder Implementation Prompt

## Context

You are implementing `ModelBuilder.create()` in the beep-effect monorepo's DSL module. This is a factory function that creates custom model builders with pre-applied default fields, enabling organization-specific conventions (audit timestamps, tenant columns, naming strategies) to be automatically applied to all models.

**Codebase Structure:**
- DSL module location: `packages/common/schema/src/integrations/sql/dsl/`
- New file to create: `ModelBuilder.ts`
- Export via: `index.ts` (add to DSL namespace)

**Existing Infrastructure:**
- `Field.ts` - Curried field factory with column metadata attachment
- `Model.ts` - Model class factory with variant schema support; contains inline `getColumnDef()` and `validateModelInvariants()` (not exported - duplicate pattern in ModelBuilder)
- `types.ts` - Type definitions (ColumnDef, DSLField, DSLVariantField, ModelClassWithVariants, isDSLVariantField, VariantFieldSymbol)
- `combinators.ts` - Pipe-friendly DSL operators
- `validate.ts` - Effect-based validators (`validateModel`, `validateField`, `validateModelSync`)
- `errors.ts` - TaggedError classes for validation failures
- `derive-column-type.ts` - AST analysis for column type inference
- `literals.ts` - ModelVariant enum with `Options` array (select, insert, update, json, jsonCreate, jsonUpdate)

**Related Patterns:**
- `packages/shared/tables/src/Table/Table.ts` - Table.make factory with default columns
- `packages/shared/tables/src/Table/OrgTable.ts` - Extended factory with organizationId

**Key API Difference from Model:**
The existing `Model` function uses: `Model<Self>(identifier)(tableName, fields, annotations?)` with separate identifier and tableName. ModelBuilder simplifies this by deriving tableName from identifier via optional `tableNameFn`, resulting in: `makeModel<Self>(identifier)(fields, annotations?)`.

## Objective

Implement `ModelBuilder.create()` that:

1. **Accepts configuration** with default fields and optional table naming strategy
2. **Returns a curried factory** with simplified API: `makeModel<Self>(identifier)(fields)`
3. **Derives tableName** from identifier using `tableNameFn` (defaults to snake_case conversion)
4. **Merges default fields with user fields** using right-bias (user overrides defaults)
5. **Produces model classes** with all static properties and variant accessors
6. **Validates invariants** with error accumulation

**Success Criteria:**
- [ ] Three-stage curried API: `ModelBuilder.create(config)<Self>(identifier)(fields)`
- [ ] Field merging preserves literal types via `const` type parameters
- [ ] Self-referential generic guard prevents missing `<Self>` generic
- [ ] All 6 variant schemas lazily computed and cached
- [ ] Validation throws aggregated errors (not first-failure)
- [ ] Works with existing `toDrizzleTable()` adapter
- [ ] Full test coverage for basic usage, overrides, variants, validation errors

## Role

You are an Effect TypeScript expert implementing a type-safe factory pattern. You must:
- Follow Effect-first idioms exclusively
- Preserve type-level precision for column metadata
- Integrate seamlessly with existing DSL infrastructure
- Write production-quality code with comprehensive tests

## Constraints

### Effect-First Patterns (MANDATORY)

**Forbidden - Never use these:**
```typescript
// ❌ FORBIDDEN
items.map(fn);              // Native array methods
items.filter(pred);
str.split(" ");             // Native string methods
str.trim();
Object.keys(obj);           // Native object methods
new Date();                 // Native Date
switch (x) { case: ... }    // Switch statements
typeof x === "string"       // Bare typeof guards
async () => { ... }         // async/await
```

**Required - Always use these:**
```typescript
// ✅ REQUIRED
import * as F from "effect/Function";
import * as A from "effect/Array";
import * as R from "effect/Record";
import * as Str from "effect/String";
import * as Struct from "effect/Struct";
import * as Match from "effect/Match";
import * as P from "effect/Predicate";
import * as DateTime from "effect/DateTime";

F.pipe(items, A.map(fn));           // Effect Array
F.pipe(items, A.filter(pred));
F.pipe(str, Str.split(" "));        // Effect String
F.pipe(str, Str.trim);
F.pipe(obj, Struct.keys);           // Effect Struct
DateTime.unsafeNow();               // Effect DateTime

Match.value(x).pipe(                // Effect Match
  Match.when(P.isString, (s) => ...),
  Match.exhaustive
);
```

### Import Conventions

```typescript
// Effect imports
import * as S from "effect/Schema";
import * as F from "effect/Function";
import * as A from "effect/Array";
import * as R from "effect/Record";
import * as Str from "effect/String";
import * as Struct from "effect/Struct";
import * as Match from "effect/Match";
import * as P from "effect/Predicate";
import * as O from "effect/Option";

// VariantSchema from experimental
import * as VariantSchema from "@effect/experimental/VariantSchema";

// Internal DSL imports - NOTE: isDSLVariantField is in types.ts, NOT Field.ts
import { type DSLField, type DSLVariantField } from "./Field";
import {
  type ColumnDef,
  ColumnMetaSymbol,
  VariantFieldSymbol,
  isDSLVariantField,  // Exported from types.ts
  type ModelClassWithVariants
} from "./types";
import { ModelVariant } from "./literals";
import { ModelValidationAggregateError, EmptyModelIdentifierError, IdentifierTooLongError } from "./errors";

// Utility imports
import { thunk } from "@beep/utils";
import type { UnsafeTypes } from "@beep/types";
```

### ModelBuilderConfig Interface

```typescript
/**
 * Configuration for creating a ModelBuilder factory.
 */
export interface ModelBuilderConfig<
  DefaultFields extends Record<string, DSLField<any, any, any, any> | DSLVariantField<any, any>> =
    Record<string, DSLField<any, any, any, any> | DSLVariantField<any, any>>
> {
  /** Default fields to merge into every model created by this builder */
  readonly defaultFields: DefaultFields;

  /**
   * Function to derive SQL table name from model identifier.
   * Defaults to snake_case conversion if not provided.
   * @example (name) => `org__${name.toLowerCase()}`
   */
  readonly tableNameFn?: (identifier: string) => string;
}
```

### Field Merging - Right-Bias Pattern

```typescript
// Record.union requires EXPLICIT combiner function for right-bias
const rightBias = <A, B>(_left: A, right: B): B => right;

const mergedFields = F.pipe(
  defaultFields,
  R.union(userFields, rightBias)
) as DefaultFields & UserFields;

// For column extraction, use Struct.entries (NOT Object.entries)
const columns = F.pipe(
  mergedFields,
  Struct.entries,
  A.map(([key, field]) => [key, extractColumnDef(field)] as const),
  R.fromEntries
);
```

### Column Extraction Pattern

Since `getColumnDef` is private in Model.ts, implement your own:

```typescript
/**
 * Extract ColumnDef from a DSL field.
 * Duplicates pattern from Model.ts since getColumnDef is not exported.
 */
const extractColumnDef = (field: DSLField<any, any, any, any> | DSLVariantField<any, any>): ColumnDef => {
  // Check for ColumnMetaSymbol annotation
  const columnMeta = field[ColumnMetaSymbol];
  if (columnMeta !== undefined) {
    return columnMeta;
  }
  // Fallback to deriving from schema AST
  return deriveColumnDefFromSchema(field);
};
```

### Type-Level Requirements

```typescript
// 1. Const type parameters for literal preservation
<const Config extends ModelBuilderConfig>
<const Fields extends Record<string, DSLField<any, any, any, any> | DSLVariantField<any, any>>>

// 2. Self-referential generic guard
type MissingSelfGeneric<Params extends string = ""> =
  `Missing \`Self\` generic - use \`class Self extends makeModel<Self>()${Params}({ ... })\``;

// In return type:
[Self] extends [never]
  ? MissingSelfGeneric<`("${typeof identifier}")`>
  : ModelClassWithVariants<Self, MergedFields>

// 3. Tuple wrapping to prevent distributive conditional types
[F] extends [DSLVariantField<infer Config, any>] ? ... : ...
```

### S.Class Extension Pattern

```typescript
// Use UnsafeAny for the class extension type assertion (project standard)
class BaseClass extends S.Class<UnsafeTypes.UnsafeAny>(identifier)(
  selectSchema.fields,
  annotations
) {
  static readonly tableName = tableName;
  static readonly columns = columns;
  static readonly primaryKey = primaryKey;
  static override readonly identifier = identifier;
  static readonly _fields = mergedFields;
  static readonly config = config;
}
```

### Validation with Error Accumulation

```typescript
// Collect ALL errors, don't fail on first
const errors: Array<S.TaggedError<any>> = [];

if (Str.isEmpty(identifier)) {
  errors.push(new EmptyModelIdentifierError({
    message: "Model identifier cannot be empty",
    code: "INV-MODEL-ID-001",
    severity: "error",
    path: ["identifier"],
  }));
}

if (F.pipe(identifier, Str.length) > 63) {
  errors.push(new IdentifierTooLongError({
    message: `Identifier exceeds 63 character limit`,
    code: "INV-SQL-ID-001",
    severity: "error",
    path: ["identifier"],
  }));
}

// Throw aggregate only if errors exist
if (A.isNonEmptyArray(errors)) {
  throw new ModelValidationAggregateError({
    message: `ModelBuilder validation failed with ${A.length(errors)} error(s)`,
    code: "INV-MODEL-AGG",
    severity: "error",
    path: [],
    modelName: identifier,
    errorCount: A.length(errors),
    errors,
  });
}
```

### Lazy Variant Accessors

```typescript
const variantCache: Record<string, S.Schema.All> = {};

// Use ModelVariant.Options (NOT .literals)
for (const variant of ModelVariant.Options) {
  Object.defineProperty(BaseClass, variant, {
    get: () => {
      if (variantCache[variant] === undefined) {
        variantCache[variant] = VariantSchema.extract(vsStruct, variant).annotations({
          identifier: `${identifier}.${variant}`,
          title: `${identifier}.${variant}`,
        });
      }
      return variantCache[variant];
    },
    enumerable: true,
    configurable: false,
  });
}
```

## Resources

**Files to Read (in order):**
1. `packages/common/schema/src/integrations/sql/dsl/Model.ts` - Understand existing Model factory, inline getColumnDef and validateModelInvariants patterns
2. `packages/common/schema/src/integrations/sql/dsl/Field.ts` - Understand field metadata attachment
3. `packages/common/schema/src/integrations/sql/dsl/types.ts` - Type definitions to reuse, isDSLVariantField export
4. `packages/common/schema/src/integrations/sql/dsl/literals.ts` - ModelVariant.Options array
5. `packages/common/schema/src/integrations/sql/dsl/errors.ts` - Error class patterns and constructors
6. `packages/shared/tables/src/Table/Table.ts` - Default column merging pattern

**Research Documents:**
- `.specs/dsl-model-builder/current-module-state-report.md` - DSL architecture synthesis
- `.specs/dsl-model-builder/implementation-research-report.md` - Implementation patterns

**Effect Documentation:**
- Query Effect docs for `Record.union`, `Schema.Class`, type-level patterns

## Output Specification

### File: `packages/common/schema/src/integrations/sql/dsl/ModelBuilder.ts`

```typescript
/**
 * @module ModelBuilder
 * @description Factory for creating custom model builders with pre-applied default fields.
 *
 * Unlike the base `Model` function which requires separate identifier and tableName,
 * ModelBuilder derives tableName automatically via configurable `tableNameFn`.
 *
 * @example
 * ```typescript
 * const makeModel = ModelBuilder.create({
 *   defaultFields: {
 *     id: Field(S.String)({ column: { type: "uuid", primaryKey: true } }),
 *     createdAt: Field(BS.DateTimeUtcFromAllAcceptable)({ column: { type: "timestamp" } }),
 *   },
 *   tableNameFn: (name) => `org__${name.toLowerCase()}`,
 * });
 *
 * class User extends makeModel<User>("User")({
 *   email: Field(S.String)({ column: { type: "string", unique: true } }),
 * }) {}
 *
 * User.tableName    // "org__user" (derived via tableNameFn)
 * User.columns.id   // { type: "uuid", primaryKey: true, ... }
 * User.select       // Schema for SELECT queries
 * ```
 */

// Exports:
// - ModelBuilderConfig interface
// - create function (the factory)
// - MissingSelfGeneric type (for error messages)
```

### File: `packages/common/schema/src/integrations/sql/dsl/index.ts`

Add export:
```typescript
export * as ModelBuilder from "./ModelBuilder.js";
```

### File: `packages/common/schema/test/integrations/sql/dsl/model-builder.test.ts`

Test cases covering:
1. Basic usage - merges default and user fields
2. Field override - user fields override defaults
3. Table naming - applies tableNameFn, defaults to snake_case
4. Variant access - all 6 variants available and cached
5. Validation errors - empty identifier, multiple autoIncrement
6. Drizzle integration - works with toDrizzleTable()
7. Type safety - Self generic enforcement (compile-time test)
8. Missing Self generic - produces helpful error message

## Examples

### Basic Usage

```typescript
import * as ModelBuilder from "./ModelBuilder";
import { Field } from "./Field";
import * as S from "effect/Schema";

const makeModel = ModelBuilder.create({
  defaultFields: {
    id: Field(S.String)({ column: { type: "uuid", primaryKey: true } }),
    createdAt: Field(S.DateTimeUtc)({ column: { type: "timestamp" } }),
    updatedAt: Field(S.DateTimeUtc)({ column: { type: "timestamp" } }),
  },
});

class User extends makeModel<User>("User")({
  email: Field(S.String)({ column: { type: "string", unique: true } }),
  name: Field(S.String)({ column: { type: "string" } }),
}) {}

// User has: id, createdAt, updatedAt (defaults) + email, name (user-defined)
// User.tableName === "user" (default snake_case conversion)
```

### Field Override

```typescript
class CustomEntity extends makeModel<CustomEntity>("CustomEntity")({
  // Override default id with integer autoIncrement
  id: Field(S.Number)({ column: { type: "integer", primaryKey: true, autoIncrement: true } }),
}) {}

// CustomEntity.columns.id.type === "integer"
// CustomEntity.columns.id.autoIncrement === true
```

### Table Naming Strategy

```typescript
const makeOrgModel = ModelBuilder.create({
  defaultFields: { /* ... */ },
  tableNameFn: (identifier) => `org__${F.pipe(identifier, Str.toLowerCase)}`,
});

class Project extends makeOrgModel<Project>("Project")({}) {}
// Project.tableName === "org__project"
```

### Drizzle Integration

```typescript
import { toDrizzleTable } from "./adapters/drizzle";

const makeModel = ModelBuilder.create({ defaultFields: { /* ... */ } });

class Task extends makeModel<Task>("Task")({
  title: Field(S.String)({ column: { type: "string" } }),
}) {}

// Convert to Drizzle table definition
const taskTable = toDrizzleTable(Task);
// taskTable is a valid Drizzle pgTable
```

## Verification Checklist

- [ ] Uses Effect namespace imports exclusively (no native methods)
- [ ] Field merging uses `R.union` with explicit right-bias combiner `(_, right) => right`
- [ ] Const type parameters on Config and Fields
- [ ] Self-referential generic guard with helpful error message
- [ ] Validation accumulates all errors before throwing
- [ ] Variant accessors are lazy (Object.defineProperty with getter)
- [ ] Variant cache prevents recomputation
- [ ] Uses `ModelVariant.Options` (not `.literals`)
- [ ] `isDSLVariantField` imported from `./types` (not `./Field`)
- [ ] All static properties attached: tableName, columns, primaryKey, identifier, _fields
- [ ] Implements own `extractColumnDef` (Model.ts version is private)
- [ ] Exports through index.ts
- [ ] JSDoc with usage examples on all exports
- [ ] Test coverage for happy path and error cases
- [ ] Type tests for generic enforcement
- [ ] Works with toDrizzleTable() adapter

---

## Metadata

### Research Sources

**Files Explored:**
- `packages/common/schema/src/integrations/sql/dsl/Field.ts`
- `packages/common/schema/src/integrations/sql/dsl/Model.ts`
- `packages/common/schema/src/integrations/sql/dsl/types.ts`
- `packages/common/schema/src/integrations/sql/dsl/combinators.ts`
- `packages/common/schema/src/integrations/sql/dsl/validate.ts`
- `packages/common/schema/src/integrations/sql/dsl/errors.ts`
- `packages/common/schema/src/integrations/sql/dsl/literals.ts`
- `packages/common/schema/src/integrations/sql/dsl/derive-column-type.ts`
- `packages/common/schema/src/integrations/sql/dsl/nullability.ts`
- `packages/common/schema/src/integrations/sql/dsl/adapters/drizzle.ts`
- `packages/shared/tables/src/Table/Table.ts`
- `packages/shared/tables/src/Table/OrgTable.ts`

**AGENTS.md Files Consulted:**
- Root `AGENTS.md` - Effect-first patterns, forbidden patterns, import conventions
- `packages/common/schema/AGENTS.md` - Schema package standards
- `packages/shared/tables/AGENTS.md` - Table factory patterns
- `packages/common/utils/AGENTS.md` - Utility standards
- `packages/common/contract/AGENTS.md` - Contract patterns

**Effect Documentation:**
- `Record.union` - requires explicit combiner function
- `Schema.Class` - class factory pattern
- Const type parameters - literal type preservation
- VariantSchema - variant field handling

### Refinement History

| Iteration | Issues Found | Fixes Applied |
|-----------|--------------|---------------|
| 0         | Initial      | N/A           |
| 1         | 3 HIGH, 4 MEDIUM, 4 LOW | Fixed incorrect imports (isDSLVariantField→types.ts, getColumnDef→implement own), corrected ModelVariant.Options, added VariantSchema import, clarified Model API difference, added S.Class pattern, fixed error constructors, added UnsafeTypes import, added Drizzle integration example |
