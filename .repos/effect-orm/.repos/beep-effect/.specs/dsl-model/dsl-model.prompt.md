---
name: dsl-model
version: 1
created: 2025-12-26T15:30:00Z
iterations: 0
status: initial
---

# DSL.Model - Effect Schema Factory with Driver-Agnostic SQL Metadata

## Context

### Project Environment
This task operates within `beep-effect`, a Bun-managed monorepo implementing an Effect-first full-stack application. The codebase enforces strict patterns:
- Effect collections/utilities over native methods (`A.map`, `Str.split`, `Match.value`)
- `effect/DateTime` instead of native `Date`
- Effect Schema for all validation (`S.Schema`, `S.decode`)
- Dependency injection via Effect Layers

### Existing Infrastructure

**VariantSchema.Class** (`packages/common/schema/src/core/VariantSchema.ts`):
- 6-variant system: `select`, `insert`, `update`, `json`, `jsonCreate`, `jsonUpdate`
- Field wrappers control variant presence (`M.Generated`, `M.Sensitive`)
- `Class<Self>(identifier)(fields)` curried factory pattern
- Static variant properties: `.insert`, `.update`, `.json`, etc.

**EntityId Pattern** (`packages/common/schema/src/identity/entity-id/entity-id.ts`):
- Anonymous class extending `S.make<Type>(ast)`
- Static properties: `.tableName`, `.create`, `.is`, `.publicId()`, `.privateId()`
- `annotations()` override returns new factory instance with merged annotations
- Type intersection for static member exposure

**@effect/sql/Model** (`packages/common/schema/src/integrations/sql/Model.ts`):
- Extends VariantSchema with SQL-specific field wrappers
- `M.Generated(schema)` - present in select/update/json, omitted from insert
- `M.Sensitive(schema)` - omitted from JSON variants
- Date/time helpers with auto-generation

### Current Gap
Domain models (`M.Class`), Drizzle tables (`Table.make`), and better-auth configs are defined separately. Changes require manual synchronization across three locations, risking drift.

### Target Module Structure
```
packages/common/schema/src/integrations/sql/dsl/
├── Model.ts           # DSL.Model factory
├── Field.ts           # DSL.Field combinator
├── types.ts           # ColumnDef, ColumnType, IndexDef, FieldConfig
├── inference.ts       # Schema → ColumnType inference
├── adapters/
│   ├── drizzle.ts     # toDrizzle(Model) → PgTable
│   ├── better-auth.ts # toBetterAuth(Model) → DBFieldAttribute
│   └── index.ts
└── index.ts           # Public exports
```

---

## Objective

Design a complete type system and API for `DSL.Model` - an Effect Schema factory that:

1. **IS a valid Effect Schema** - `S.decode(Model)`, `.pipe()`, `.annotations()` all work
2. **Extends VariantSchema.Class** - inherits 6 variants automatically
3. **Exposes driver-agnostic SQL metadata** as static properties
4. **Enables adapter functions** to generate driver-specific outputs

### Measurable Outcomes

- [ ] Type definitions for `ColumnType`, `ColumnDef`, `IndexDef`, `FieldConfig<C, V>`
- [ ] Interface for `DSLField<A, I, R, Config>` with Config generic for type preservation
- [ ] Interface for `ModelSchemaInstance<Self, Fields>` with static properties
- [ ] Type extraction helpers: `ExtractConfig<F>`, `PrimaryKeyColumns<Fields>`, `InsertFields<Fields>`
- [ ] API design for `DSL.Field()` with REQUIRED `const Config` parameter
- [ ] API design for `DSL.Model<Self>()(identifier)(fields, options)` curried factory
- [ ] Type signatures for adapter functions: `toDrizzle()`, `toBetterAuth()`
- [ ] Answers to 5 research questions from original spec

---

## Role

You are an **Effect Schema architect** with deep expertise in:
- Effect Schema AST structure and annotation system (`SchemaAST.getAnnotation`, Symbol-keyed metadata)
- TypeScript advanced patterns (const type parameters, mapped types, conditional types, type intersections)
- VariantSchema multi-variant infrastructure
- Anonymous class extension for static property exposure
- Drizzle ORM column/table construction
- better-auth database field configuration

You understand that DSL.Model must seamlessly integrate with existing Effect patterns while enabling a new layer of SQL metadata abstraction.

---

## Constraints

### Effect-First Patterns (from AGENTS.md)

```typescript
// REQUIRED: Effect utilities over native methods
F.pipe(items, A.map(fn))           // NOT items.map(fn)
F.pipe(str, Str.split(" "))        // NOT str.split(" ")
Match.value(x).pipe(...)           // NOT switch/if-else
DateTime.unsafeNow()               // NOT new Date()

// REQUIRED: Namespace imports
import * as S from "effect/Schema"
import * as A from "effect/Array"
import * as F from "effect/Function"
import * as O from "effect/Option"
import * as AST from "effect/SchemaAST"
import * as Match from "effect/Match"
```

### DSL.Model Design Constraints

1. **DSL.Model IS an Effect Schema**
   - Must satisfy `S.Schema<Self, Encoded, R>`
   - All Schema methods must work: `.pipe()`, `.annotations()`, `S.decode()`

2. **Driver-Agnostic Column Metadata**
   - Static properties expose abstract types (`ColumnType`), NOT driver-specific types
   - `"string"`, `"number"`, `"uuid"`, `"datetime"` - NOT `varchar`, `integer`, `pg.uuid()`

3. **Adapter Pattern for Drivers**
   - `DSL.toDrizzle(Model)` - separate function, NOT a method on Model
   - `DSL.toBetterAuth(Model)` - separate function, NOT a method on Model
   - Driver-specific imports only in adapter modules

4. **Extends VariantSchema.Class**
   - Inherit 6-variant system: `select`, `insert`, `update`, `json`, `jsonCreate`, `jsonUpdate`
   - `DSL.Field` configures variant presence via `variants` option

5. **Static Properties via Class Extension**
   - Anonymous class extending `BaseClass` with static assignments
   - Type intersection: `as typeof BaseClass & { readonly tableName: string; ... }`
   - `annotations()` override must return new factory instance preserving statics

6. **`const` Type Parameter for Literal Inference**
   - `<const Fields extends Record<string, DSLField<any, any, any, any>>>`
   - `<const Config extends FieldConfig>` on Field function
   - Config parameter is REQUIRED (not optional) for type preservation
   - Preserves literal types for column/variant config inference

### Forbidden Patterns

```typescript
// ❌ FORBIDDEN - Driver-specific static properties
AccountModel.drizzleTable      // NO - use DSL.toDrizzle(AccountModel)
AccountModel.betterAuthFields  // NO - use DSL.toBetterAuth(AccountModel)

// ❌ FORBIDDEN - Native methods
items.map(fn)                  // Use A.map
str.split(" ")                 // Use Str.split
switch (x._tag) { ... }        // Use Match.value(x).pipe(...)
new Date()                     // Use DateTime.unsafeNow()

// ❌ FORBIDDEN - Direct driver imports in Model factory
import { pgTable } from "drizzle-orm/pg-core"  // Only in adapters/drizzle.ts
```

---

## Resources

### Primary References

| Resource            | Path                                                            | What to Study                                      |
|---------------------|-----------------------------------------------------------------|----------------------------------------------------|
| VariantSchema.Class | `packages/common/schema/src/core/VariantSchema.ts`              | 6-variant system, Field wrappers, Class factory    |
| EntityId pattern    | `packages/common/schema/src/identity/entity-id/entity-id.ts`    | Static property exposure, `annotations()` override |
| LiteralKit pattern  | `packages/common/schema/src/derived/kits/string-literal-kit.ts` | Interface + factory, `annotations()` chaining      |
| @effect/sql/Model   | `packages/common/schema/src/integrations/sql/Model.ts`          | SQL field wrappers, variant configurations         |
| Table factory       | `packages/shared/tables/src/Table/Table.ts`                     | Drizzle table construction patterns                |

### Exploration Results (Aligned)

| Document                                 | Key Insights                                                         |
|------------------------------------------|----------------------------------------------------------------------|
| `schema-internals-dsl-model-research.md` | AST annotations, VariantSchema internals, field wrapper patterns     |
| `schema-static-properties-pattern.md`    | Anonymous class extension, type intersection, eager metadata         |
| `variant-schema-extension-pattern.md`    | Curried factory, `static [TypeId]` storage, `annotations()` override |
| `entity-id-kit-patterns.md`              | Static `.tableName`, interface declaring statics                     |
| `effect-exposed-values-pattern.md`       | `S.Literal.literals`, `S.Struct.fields` exposure mechanism           |
| `drizzle-effect-research.md`             | ColumnType → Drizzle mapping for `toDrizzle()` adapter               |
| `better-auth-db-system.md`               | DBFieldAttribute, 6 types, `input`/`returned` flags                  |
| `livestore-patterns-synthesis.md`        | Column factories, driver-agnostic architecture, adapter pattern      |
| `beep-effect-codebase.md`                | `makeFields()`, `modelKit()`, existing domain patterns               |
| `effect-schema-ast-patterns.md`          | AST introspection, `Match`-based pattern matching                    |

### Effect Documentation

- Schema Annotations: `effect.website/docs/schema/annotations`
- Class APIs: `effect.website/docs/schema/class-apis`
- SchemaAST: `effect.website/docs/schema/ast`

---

## Output Specification

### Deliverable: Design Document

Produce a detailed design document containing:

#### 1. Core Type Definitions

```typescript
import * as S from "effect/Schema";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";

// ColumnType - abstract SQL column types
type ColumnType = "string" | "number" | "integer" | "boolean" | "date" | "datetime" | "json" | "uuid" | "blob"

// ColumnDef - driver-agnostic column definition
interface ColumnDef {
  readonly type: ColumnType;
  readonly primaryKey?: boolean;
  readonly autoIncrement?: boolean;  // For pg.serial mapping (_rowId)
  readonly unique?: boolean;
  readonly nullable?: boolean;
  readonly defaultValue?: string | (() => string);
  readonly maxLength?: number;
  readonly references?: {
    readonly table: string;
    readonly column: string;
    readonly onDelete?: "cascade" | "restrict" | "set null" | "set default" | "no action";
  };
  readonly index?: boolean | string;
  readonly columnName?: string;
}

// IndexDef - index configuration
interface IndexDef {
  readonly name?: string;
  readonly columns: readonly string[];
  readonly type?: "btree" | "hash" | "gin" | "gist";
  readonly unique?: boolean;
  readonly where?: string;
}

// VariantConfig - field variant behavior
type VariantBehavior = "required" | "optional" | "omit";

interface VariantConfig {
  readonly select?: VariantBehavior;
  readonly insert?: VariantBehavior;
  readonly update?: VariantBehavior;
  readonly json?: VariantBehavior;
  readonly jsonCreate?: VariantBehavior;
  readonly jsonUpdate?: VariantBehavior;
}

// FieldConfig - DSL.Field configuration (generic for type preservation)
interface FieldConfig<
  C extends Partial<ColumnDef> = Partial<ColumnDef>,
  V extends VariantConfig = VariantConfig
> {
  readonly column?: C;
  readonly variants?: V;
}
```

#### 2. Interface Specifications

```typescript
// DSLField<A, I, R, Config> - Effect Schema with column metadata
// Config parameter is REQUIRED for type preservation (not optional)
interface DSLField<
  A,
  I = A,
  R = never,
  Config extends FieldConfig = FieldConfig
> extends S.Schema<A, I, R> {
  readonly getColumnDef: () => O.Option<ColumnDef>;
  readonly getVariantConfig: () => O.Option<VariantConfig>;
}

// Type extraction helpers
type ExtractConfig<F> = F extends DSLField<any, any, any, infer C> ? C : never;

type PrimaryKeyColumns<Fields extends Record<string, DSLField<any, any, any, any>>> = {
  [K in keyof Fields]: ExtractConfig<Fields[K]> extends { column: { primaryKey: true } }
    ? K
    : never;
}[keyof Fields];

type InsertFields<Fields extends Record<string, DSLField<any, any, any, any>>> = {
  readonly [K in keyof Fields as ExtractConfig<Fields[K]> extends { variants: { insert: "omit" } }
    ? never
    : K]: ExtractConfig<Fields[K]> extends { variants: { insert: "optional" } }
    ? S.Schema.Type<Fields[K]> | undefined
    : S.Schema.Type<Fields[K]>;
};

// ModelSchemaInstance<Self, Fields> - full Model interface
interface ModelSchemaInstance<
  Self,
  Fields extends Record<string, DSLField<any, any, any, any>>
> extends S.AnnotableClass<
    ModelSchemaInstance<Self, Fields>,
    ModelType<Fields>,
    ModelEncoded<Fields>,
    ModelContext<Fields>
  > {
  readonly tableName: string;
  readonly columns: { readonly [K in keyof Fields]: ColumnDef };
  readonly primaryKey: readonly PrimaryKeyColumns<Fields>[];
  readonly indexes: readonly IndexDef[];
  readonly identifier: string;
  readonly fields: Fields;

  // VariantSchema variants (inherited)
  readonly select: S.Schema<ModelType<Fields>, ModelEncoded<Fields>, ModelContext<Fields>>;
  readonly insert: S.Schema<InsertFields<Fields>, InsertEncoded<Fields>, ModelContext<Fields>>;
  readonly update: S.Schema<UpdateType<Fields>, UpdateEncoded<Fields>, ModelContext<Fields>>;
  readonly json: S.Schema<ModelType<Fields>, ModelEncoded<Fields>, ModelContext<Fields>>;
  readonly jsonCreate: S.Schema<InsertFields<Fields>, InsertEncoded<Fields>, ModelContext<Fields>>;
  readonly jsonUpdate: S.Schema<UpdateType<Fields>, UpdateEncoded<Fields>, ModelContext<Fields>>;

  // Override annotations to preserve statics
  annotations(annotations: S.Annotations.Schema<Self>): ModelSchemaInstance<Self, Fields>;
}

// Model type inference helpers
type ModelType<Fields extends Record<string, DSLField<any, any, any, any>>> = {
  readonly [K in keyof Fields]: S.Schema.Type<Fields[K]>;
};

type ModelEncoded<Fields extends Record<string, DSLField<any, any, any, any>>> = {
  readonly [K in keyof Fields]: S.Schema.Encoded<Fields[K]>;
};

type ModelContext<Fields extends Record<string, DSLField<any, any, any, any>>> =
  S.Schema.Context<Fields[keyof Fields]>;
```

#### 3. Factory Function Signatures

```typescript
// DSL.Field - create field with column metadata
// Config parameter uses `const` modifier for literal type inference
const Field: <A, I, R, const Config extends FieldConfig>(
  schema: S.Schema<A, I, R>,
  config: Config  // REQUIRED, not optional - for type preservation
) => DSLField<A, I, R, Config>

// DSL.Model - create Model class (curried: empty parens first)
// Uses `const` modifier on Fields for literal type preservation
const Model: <Self>() => (identifier: string) => <
  const Fields extends Record<string, DSLField<any, any, any, any>>
>(
  fields: Fields,
  options?: { readonly indexes?: readonly IndexDef[] }
) => ModelSchemaInstance<Self, Fields>
```

#### 4. Adapter Function Signatures

```typescript
import type { PgTable } from "drizzle-orm/pg-core";
import type { DBFieldAttribute } from "better-auth";

// toDrizzle - generate Drizzle PgTable
const toDrizzle: <M extends ModelSchemaInstance<any, any>>(model: M) => PgTable

// toBetterAuth - generate better-auth field config
const toBetterAuth: <M extends ModelSchemaInstance<any, any>>(
  model: M,
  options?: {
    excludePrimaryKey?: boolean;
    excludeGenerated?: boolean;
  }
) => Record<string, DBFieldAttribute>
```

#### 5. Research Question Answers

Provide detailed answers to:

1. **AST Introspection**: How to extract type information from wrapped schemas like `M.Generated(S.String)` or branded types?

2. **Default Value Handling**: How should `defaultValue: "gen_random_uuid()"` translate to Drizzle's `.defaultRandom()` vs `.default(sql\`...\`)`?

3. **Type Inference**: How to infer `ColumnType` from an Effect Schema when no explicit `column.type` is provided?

4. **Variant Mapping**: How do VariantSchema variants map to better-auth's `input: true/false`, `returned: true/false`?

5. **Index Definition**: How should compound indexes and named indexes be specified in the DSL?

#### 6. Implementation Pseudocode

High-level pseudocode for:
- `DSL.Field()` implementation with `const Config` parameter
- `DSL.Model()` factory implementation with `const Fields` parameter
- `annotations()` override pattern preserving statics
- Column metadata extraction using Effect patterns (`F.pipe`, `A.map`, `Match.exhaustive`)
- Type extraction helpers: `ExtractConfig<F>`, `PrimaryKeyColumns<Fields>`, `InsertFields<Fields>`

---

## Examples

### Desired API Usage

```typescript
import { DSL } from "@beep/schema"
import * as S from "effect/Schema"
import * as A from "effect/Array"
import * as F from "effect/Function"
import * as O from "effect/Option"
import { $SharedDomainId } from "@beep/identity/packages"
import { SharedEntityIds } from "@beep/shared-domain/entity-ids"

// Domain entities are exported as namespaces via `export * as Account from "./Account"`
// Access pattern: Account.Model not AccountModel

const $I = $SharedDomainId.create("entities/Account/Account.model")

// Define model with generic column metadata
// Note: DSL.Model curried with empty parens first, then identifier
export class Model extends DSL.Model<Model>()($I`AccountModel`)({
  // Public UUID identifier (NOT the primary key)
  id: DSL.Field(SharedEntityIds.AccountId, {
    column: { type: "uuid", unique: true, defaultValue: () => SharedEntityIds.AccountId.create() },
    variants: { insert: "omit", select: "required" },
  }),
  // Internal primary key (pg.serial)
  _rowId: DSL.Field(SharedEntityIds.AccountId.modelRowIdSchema, {
    column: { type: "integer", primaryKey: true, autoIncrement: true },
    variants: { insert: "omit", select: "required" },
  }),
  email: DSL.Field(S.String, {
    column: { type: "string", unique: true, maxLength: 255 },
    variants: { insert: "required", update: "optional" },
  }),
  createdAt: DSL.Field(S.DateTimeUtc, {
    column: { type: "datetime", defaultValue: "now()" },
    variants: { insert: "omit", select: "required" },
  }),
}) {}

// ============ MUST work as Effect Schema ============
// Access via namespace: Account.Model (after `export * as Account from "./Account"`)
const decodeAccount = S.decode(Model)
const account = S.decodeSync(Model)({
  id: "account__a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  _rowId: 1,
  email: "test@example.com",
  createdAt: "2025-01-15T10:30:00Z",
})

// Variant schemas (inherited from VariantSchema.Class)
Model.insert   // Insert variant - no id, no _rowId, no createdAt
Model.update   // Update variant
Model.json     // JSON variant

// ============ Generic static properties ============
Model.tableName    // "account_model" (snake-case from identifier)
Model.columns      // { id: ColumnDef, _rowId: ColumnDef, email: ColumnDef, createdAt: ColumnDef }
Model.primaryKey   // ["_rowId"] - NOT ["id"]!
Model.indexes      // []
Model.identifier   // Full identifier with package path
Model.fields       // Raw DSL.Field definitions for introspection

// ============ Driver adapters (separate functions) ============
import { toDrizzle, toBetterAuth } from "@beep/schema/integrations/sql/dsl/adapters"

const drizzleTable = toDrizzle(Model)       // Drizzle PgTable
const betterAuthFields = toBetterAuth(Model) // better-auth config
```

### Type Inference Example

```typescript
import * as S from "effect/Schema"
import * as F from "effect/Function"

// DSL.Field preserves schema types AND config types
const emailField = DSL.Field(F.pipe(S.String, S.maxLength(255)), {
  column: { type: "string", unique: true },
  variants: { insert: "required", update: "optional" },
})

type EmailType = S.Schema.Type<typeof emailField>  // string

// Config is preserved at type level via const modifier
type EmailConfig = ExtractConfig<typeof emailField>
// { column: { type: "string", unique: true }, variants: { insert: "required", update: "optional" } }

// Model preserves field types with full config inference
type AccountType = S.Schema.Type<typeof Model>
// { readonly id: AccountId, readonly _rowId: number, readonly email: string, readonly createdAt: DateTime.Utc }

// Insert type excludes omitted fields
type AccountInsert = InsertFields<typeof Model["fields"]>
// { readonly email: string }  - id, _rowId, createdAt are omitted
```

### Adapter Output Examples

```typescript
// toDrizzle output - note _rowId is serial primary key, id is uuid unique
// Uses F.pipe and A.map patterns internally for column transformation
pgTable("account_model", {
  id: uuid("id").unique().notNull().$defaultFn(() => SharedEntityIds.AccountId.create()),
  _row_id: serial("_row_id").primaryKey(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
})

// toBetterAuth output - excludes primary key by default
{
  email: { type: "string", required: true, unique: true, returned: true, input: true },
  createdAt: { type: "date", required: false, returned: true, input: false },
}
// Note: id and _rowId excluded from additionalFields
```

---

## Verification Checklist

### Core Schema Requirements
- [ ] `S.decode(Model)` works - Model IS an Effect Schema
- [ ] All VariantSchema variants preserved (`.insert`, `.update`, `.json`, etc.)
- [ ] `.pipe()` and `.annotations()` work with DSL.Model
- [ ] Type inference preserves field literal types via `const` type parameter
- [ ] Config parameter is REQUIRED on DSL.Field (not optional)

### Static Properties (Driver-Agnostic)
- [ ] `.tableName` - snake-case string
- [ ] `.columns` - Record of generic `ColumnDef` per field
- [ ] `.primaryKey` - readonly array of primary key column names (typed via `PrimaryKeyColumns<Fields>`)
- [ ] `.indexes` - readonly `IndexDef` array
- [ ] `.identifier` - full package-qualified identifier string
- [ ] `.fields` - Raw DSL.Field definitions for introspection

### Adapter Pattern
- [ ] `toDrizzle(Model)` produces valid Drizzle PgTable (separate function, not method)
- [ ] `toBetterAuth(Model)` produces valid better-auth field config (separate function, not method)
- [ ] No driver-specific types leak into Model interface
- [ ] Adapters can be added without modifying Model

### Implementation Patterns
- [ ] Anonymous class extension for static properties
- [ ] `annotations()` override returns new factory instance
- [ ] Symbol-keyed annotations for column metadata storage
- [ ] Effect-first patterns throughout (`F.pipe`, `A.map`, `Match.exhaustive`)
- [ ] Type extraction helpers: `ExtractConfig<F>`, `PrimaryKeyColumns<Fields>`, `InsertFields<Fields>`

---

## Metadata

### Research Sources

1. `schema-internals-dsl-model-research.md` - AST annotations, VariantSchema internals
2. `effect-schema-ast-patterns.md` - AST introspection utilities
3. `schema-static-properties-pattern.md` - Class extension pattern
4. `variant-schema-extension-pattern.md` - Curried factory, static storage
5. `entity-id-kit-patterns.md` - Static property exposure pattern
6. `effect-exposed-values-pattern.md` - S.Literal.literals mechanism
7. `drizzle-effect-research.md` - Drizzle column mapping
8. `better-auth-db-system.md` - DBFieldAttribute system
9. `livestore-patterns-synthesis.md` - Driver-agnostic architecture
10. `beep-effect-codebase.md` - Existing codebase patterns

### Design Decisions (Authoritative)

| Decision                            | Rationale                                                                    |
|-------------------------------------|------------------------------------------------------------------------------|
| DSL.Model IS an Effect Schema       | Enables `S.decode()`, composability, Effect ecosystem integration            |
| Driver-agnostic column metadata     | Domain stays clean, future drivers without Model changes                     |
| Adapter functions (not methods)     | Separation of concerns, tree-shakeable, no circular dependencies             |
| Extends VariantSchema.Class         | Reuse battle-tested 6-variant infrastructure                                 |
| Anonymous class extension           | Consistent with EntityId, LiteralKit patterns in codebase                    |
| `const` type parameter on Fields    | Preserve literal types for column/variant config inference                   |
| `const` type parameter on Config    | Preserve literal config types for `ExtractConfig<F>` helper                  |
| Config parameter is REQUIRED        | Ensures type preservation; optional config loses literal type information    |
| Generic FieldConfig<C, V>           | Enables precise type extraction of column and variant configuration          |
| `_rowId` as PRIMARY KEY (not `id`)  | `id` is public UUID with default; `_rowId` is internal serial auto-increment |
| Namespace exports (`User.Model`)    | Domain entities exported as namespaces via `export * as User from "./User"`  |

### Refinement History

| Iteration | Issues Found                    | Fixes Applied                                               |
|-----------|---------------------------------|-------------------------------------------------------------|
| 0         | Initial                         | N/A                                                         |
| 1         | Type corrections from design doc| Added Config generic, type helpers, const modifiers, imports|
