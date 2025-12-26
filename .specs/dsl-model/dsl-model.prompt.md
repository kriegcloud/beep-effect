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

- [ ] Type definitions for `ColumnType`, `ColumnDef`, `IndexDef`, `FieldConfig`
- [ ] Interface for `ModelSchemaInstance<Self, Fields>` with static properties
- [ ] API design for `DSL.Field()` combinator with column metadata
- [ ] API design for `DSL.Model<Self>()(identifier, fields)` curried factory (empty parens first)
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

6. **`const` Type Parameter on Fields**
   - `<const Fields extends Record<string, DSLField<any, any, any>>>`
   - Preserves literal types for column inference

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
// ColumnType - abstract SQL column types
type ColumnType = "string" | "number" | "integer" | "boolean" | "date" | "datetime" | "json" | "uuid" | "blob"

// ColumnDef - driver-agnostic column definition
interface ColumnDef {
  readonly type: ColumnType;
  readonly primaryKey?: boolean;
  readonly autoIncrement?: boolean;  // For pg.serial mapping (_rowId)
  readonly unique?: boolean;
  readonly nullable?: boolean;
  readonly defaultValue?: string;
  readonly maxLength?: number;
  readonly references?: { table: string; column: string };
}

// IndexDef - index configuration
interface IndexDef { /* ... */ }

// VariantConfig - field variant behavior
interface VariantConfig { /* ... */ }

// FieldConfig - DSL.Field configuration
interface FieldConfig { /* ... */ }
```

#### 2. Interface Specifications

```typescript
// DSLField<A, I, R> - Effect Schema with column metadata
interface DSLField<A, I, R> extends S.Schema<A, I, R> { /* ... */ }

// ModelSchemaInstance<Self, Fields> - full Model interface
interface ModelSchemaInstance<Self, Fields> extends S.AnnotableClass<...> {
  readonly tableName: string
  readonly columns: { [K in keyof Fields]: ColumnDef }
  readonly primaryKey: readonly string[]
  readonly indexes: readonly IndexDef[]
  readonly identifier: string
}
```

#### 3. Factory Function Signatures

```typescript
// DSL.Field - create field with column metadata
const Field: <A, I, R>(
  schema: S.Schema<A, I, R>,
  config?: { column?: Partial<ColumnDef>; variants?: VariantConfig }
) => DSLField<A, I, R>

// DSL.Model - create Model class
const Model: <Self>() => <const Fields extends Record<string, DSLField<any, any, any>>>(
  identifier: string,
  fields: Fields
) => ModelSchemaInstance<Self, Fields>
```

#### 4. Adapter Function Signatures

```typescript
// toDrizzle - generate Drizzle PgTable
const toDrizzle: <M extends ModelSchemaInstance<any, any>>(model: M) => PgTable

// toBetterAuth - generate better-auth field config
const toBetterAuth: <M extends ModelSchemaInstance<any, any>>(model: M) => Record<string, DBFieldAttribute>
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
- `DSL.Field()` implementation
- `DSL.Model()` factory implementation
- `annotations()` override pattern
- Column metadata extraction

---

## Examples

### Desired API Usage

```typescript
import { DSL } from "@beep/schema"
import * as S from "effect/Schema"
import { $SharedDomainId } from "@beep/identity/packages"

// Domain entities are exported as namespaces via `export * as Account from "./Account"`
// Access pattern: Account.Model not AccountModel

// Define model with generic column metadata
export class AccountModel extends DSL.Model<AccountModel>()("Account", {
  id: DSL.Field(EntityId.AccountId, {
    column: { type: "uuid", unique: true, defaultValue: "gen_random_uuid()" },
    variants: { insert: "omit", select: "required" },
  }),
  _rowId: DSL.Field(S.Int, {
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
const decodeAccount = S.decode(AccountModel)
const account = S.decodeSync(AccountModel)({ id: "...", email: "...", createdAt: "..." })

// Variant schemas (inherited from VariantSchema.Class)
AccountModel.insert   // Insert variant - no id, no createdAt
AccountModel.update   // Update variant
AccountModel.json     // JSON variant

// ============ Generic static properties ============
AccountModel.tableName    // "account" (snake-case)
AccountModel.columns      // { id: ColumnDef, _rowId: ColumnDef, email: ColumnDef, createdAt: ColumnDef }
AccountModel.primaryKey   // ["_rowId"]
AccountModel.indexes      // []
AccountModel.identifier   // "Account" (original PascalCase)

// ============ Driver adapters (separate functions) ============
const drizzleTable = DSL.toDrizzle(AccountModel)       // Drizzle PgTable
const betterAuthFields = DSL.toBetterAuth(AccountModel) // better-auth config
```

### Type Inference Example

```typescript
// DSL.Field preserves schema types
const emailField = DSL.Field(S.String.pipe(S.maxLength(255)), {
  column: { type: "string", unique: true },
})

type EmailType = S.Schema.Type<typeof emailField>  // string

// Model preserves field types
type AccountType = S.Schema.Type<typeof AccountModel>
// { id: AccountId, _rowId: number, email: string, createdAt: DateTime.Utc }
```

### Adapter Output Examples

```typescript
// toDrizzle output - note _rowId is serial primary key, id is uuid unique
pgTable("account", {
  _rowId: serial("_row_id").primaryKey(),
  id: uuid("id").unique().defaultRandom().notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// toBetterAuth output
{
  email: { type: "string", required: true, unique: true, returned: true, input: true },
  createdAt: { type: "date", required: false, returned: true, input: false },
}
```

---

## Verification Checklist

### Core Schema Requirements
- [ ] `S.decode(Model)` works - Model IS an Effect Schema
- [ ] All VariantSchema variants preserved (`.insert`, `.update`, `.json`, etc.)
- [ ] `.pipe()` and `.annotations()` work with DSL.Model
- [ ] Type inference preserves field literal types via `const` type parameter

### Static Properties (Driver-Agnostic)
- [ ] `.tableName` - snake-case string
- [ ] `.columns` - Record of generic `ColumnDef` per field
- [ ] `.primaryKey` - readonly string array
- [ ] `.indexes` - readonly `IndexDef` array
- [ ] `.identifier` - original PascalCase string

### Adapter Pattern
- [ ] `DSL.toDrizzle(Model)` produces valid Drizzle PgTable
- [ ] `DSL.toBetterAuth(Model)` produces valid better-auth field config
- [ ] No driver-specific types leak into Model interface
- [ ] Adapters can be added without modifying Model

### Implementation Patterns
- [ ] Anonymous class extension for static properties
- [ ] `annotations()` override returns new factory instance
- [ ] Symbol-keyed annotations for column metadata storage
- [ ] Effect-first patterns throughout (A.map, Match, DateTime)

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

| Decision                         | Rationale                                                         |
|----------------------------------|-------------------------------------------------------------------|
| DSL.Model IS an Effect Schema    | Enables `S.decode()`, composability, Effect ecosystem integration |
| Driver-agnostic column metadata  | Domain stays clean, future drivers without Model changes          |
| Adapter functions (not methods)  | Separation of concerns, tree-shakeable, no circular dependencies  |
| Extends VariantSchema.Class      | Reuse battle-tested 6-variant infrastructure                      |
| Anonymous class extension        | Consistent with EntityId, LiteralKit patterns in codebase         |
| `const` type parameter on Fields | Preserve literal types for column inference                       |

### Refinement History

| Iteration | Issues Found | Fixes Applied |
|-----------|--------------|---------------|
| 0         | Initial      | N/A           |
