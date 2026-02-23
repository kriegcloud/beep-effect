# @beep/effect-orm Design

> Status: **AUTHORITATIVE** -- synthesized from instructions.md with all open questions resolved. Updated for Effect v4 (effect-smol).

## 1. Overview

`@beep/effect-orm` is a TypeScript library that bridges Effect's domain model layer with Drizzle's query layer. A model defined once produces both a valid Effect Model (with 6 variant schemas) and a dialect-specific Drizzle table, with zero manual duplication.

**Target runtime:** Effect v4 (codename "effect-smol"). Source code lives in `.repos/effect-smol/`. The library extends `Model.Class` from `effect/unstable/schema/Model`, which provides the 6 variant schemas, field helpers (Generated, Sensitive, FieldOption, DateTime*), and is compatible with `effect/unstable/sql/SqlModel`'s repository and data loader patterns.

**What it does:**

- Provides a `ModelFactory` that returns dialect-scoped `Column`, `Model`, and `Relation` helpers constrained to valid types for that dialect.
- Extends v4 `Model.Class` with a parallel static metadata registry for column/relation/index metadata.
- Derives fully type-safe Drizzle tables from Model classes via `toDrizzle()`.
- Supports PostgreSQL, MySQL, SQLite, and MSSQL dialects.

**What it does not do (non-goals):**

- Migration generation (remains Drizzle Kit's responsibility).
- Query building (consumers use Drizzle's query API on the derived tables).
- Connection management (handled by `effect/unstable/sql/SqlClient` and Drizzle).
- Runtime validation at query boundaries (handled by `effect/unstable/sql/SqlModel`'s existing machinery).
- Re-implementing variant schemas, field helpers, or repository patterns (these are inherited from `Model.Class`).

---

## 2. Architecture

### 2.1 Dual Structure (Model.Class Extension + Metadata Registry)

Custom metadata does NOT survive v4 VariantSchema extraction. `Field.schemas` only holds Schema instances with no slot for arbitrary metadata. Therefore, the library maintains two parallel structures:

1. **Model.Class (from `effect/unstable/schema/Model`)** -- Powers Effect's schema system: select, insert, update, json, jsonCreate, jsonUpdate variants. Encoding, decoding, validation. This is the upstream v4 `Model.Class` constructor, built on top of `VariantSchema.make()` with 6 variants and `"select"` as the default variant. All of Model's field helpers (`Generated`, `Sensitive`, `FieldOption`, `DateTimeInsert`, `DateTimeUpdate`, `JsonFromString`, `UuidV4Insert`, etc.) are available directly.
2. **Metadata registry** -- Powers Drizzle table generation: column type, FK constraints, relation data, index hints. Stored as a static `Map<fieldName, FieldMeta>` on the Model class.

Both structures are built from the same pipe chain. Model field helpers (e.g., `Model.Generated(UserId)`) initialize the VariantSchema field, and subsequent `pg.Column.xxx()`, `pg.Relation()`, `pg.Index.xxx()` calls enrich the metadata registry.

### 2.2 Model Class Design

The Model produced by the factory wraps and extends v4 `Model.Class` from `effect/unstable/schema/Model`. This is a direct extension, not a reimplementation.

**Rationale:** v4 `Model.Class` is itself built on `VariantSchema.make()` (located at `effect/unstable/schema/VariantSchema`). It provides:
- 6 variants: `["select", "insert", "update", "json", "jsonCreate", "jsonUpdate"]` with `"select"` as the default variant
- Field helpers: `Generated`, `GeneratedByApp`, `Sensitive`, `FieldOption`, `JsonFromString`, `UuidV4Insert`
- DateTime helpers: `DateTimeInsert`, `DateTimeInsertFromDate`, `DateTimeInsertFromNumber`, `DateTimeUpdate`, `DateTimeUpdateFromDate`, `DateTimeUpdateFromNumber`, `DateTimeWithNow`, `DateWithNow`
- `Overrideable` pattern for auto-generated defaults
- Full compatibility with `effect/unstable/sql/SqlModel`'s `makeRepository` and `makeDataLoaders`

Our `pg.Model` extends `Model.Class` by intercepting the field definitions to extract column/relation/index metadata into the parallel registry, while passing through all field definitions unchanged to the upstream constructor. The result is a class that IS a `Model.Class` (compatible with all upstream consumers) AND carries additional metadata for Drizzle derivation.

**Compatibility guarantee:** Our Model IS a `Model.Class`. It produces the same 6 variants and satisfies the `Model.Any` constraint required by `SqlModel.makeRepository` and `SqlModel.makeDataLoaders`. No compatibility shim needed.

The full `VariantSchema.Class` constructor signature is preserved, including the optional `annotations` parameter of type `Schema.Annotations.Declaration<Self, readonly [Schema.Struct<...>]>` for attaching Schema metadata.

The 6 variants (provided by upstream `Model.Class`):

| Variant      | Purpose                                                     |
|--------------|-------------------------------------------------------------|
| `select`     | Full schema for SELECT queries (default variant)            |
| `insert`     | Excludes `Generated` fields                                 |
| `update`     | All fields                                                  |
| `json`       | Excludes `Sensitive` fields                                 |
| `jsonCreate` | Excludes `Generated`, `GeneratedByApp`, `Sensitive`         |
| `jsonUpdate` | Excludes `Generated`, `GeneratedByApp`, `Sensitive`         |

### 2.3 Metadata Registry

The metadata registry is a `Map<string, FieldMeta>` stored as a static property on the Model class.

```ts
interface FieldMeta {
  readonly column?: ColumnMeta
  readonly relation?: RelationMeta
  readonly indexes?: ReadonlyArray<IndexMeta>
}

interface ColumnMeta {
  readonly columnType: string        // e.g., "uuid", "timestamp", "text"
  readonly dataType: string          // Wire type identity, e.g., "string uuid"
  readonly driverType: unknown       // TS type the driver produces (Date, string, number, etc.)
  readonly mode?: string             // Mode override, e.g., "string", "date"
  readonly primaryKey?: boolean
  readonly unique?: boolean
  readonly autoIncrement?: boolean
  readonly hasDefault?: boolean
  readonly default?: unknown         // SQL expression or literal
  readonly defaultFn?: () => unknown
  readonly onUpdateFn?: () => unknown
  readonly generated?: unknown
  readonly identity?: unknown
  readonly enumValues?: ReadonlyArray<string>
  readonly dimensions?: number       // Array column wrapping
  readonly transform?: {
    readonly decode: (raw: unknown) => unknown
    readonly encode: (value: unknown) => unknown
  }
  // Custom column fields (mirrors Drizzle's customType)
  readonly customDataType?: (config?: unknown) => string
  readonly toDriver?: (value: unknown) => unknown
  readonly fromDriver?: (value: unknown) => unknown
}

interface RelationMeta {
  readonly target: () => unknown     // Thunk to target field
  readonly onUpdate?: "cascade" | "restrict" | "no action" | "set null" | "set default"
  readonly onDelete?: "cascade" | "restrict" | "no action" | "set null" | "set default"
}

interface IndexMeta {
  readonly type: "btree" | "hash" | "gin" | "gist" | "unique"
  readonly name?: string
}
```

The registry is NOT embedded in the VariantSchema. It is a parallel static property, accessed by `toDrizzle()` at derivation time.

### 2.4 Type Bridge (Our Types to Drizzle's Type System)

Our `ColumnMeta` captures every field that Drizzle's `ColumnBaseConfig` requires:

| Our ColumnMeta Field | Drizzle Config Field | Source |
|---|---|---|
| `columnType` | Column builder selection | `pg.Column.xxx()` function name |
| `dataType` | `dataType` | Literal from column type |
| `driverType` | `data` | Column type map + mode override |
| (Schema AST) | `notNull` | Derived from SchemaAST at `toDrizzle()` time |
| `hasDefault` / `default` / `defaultFn` | `hasDefault` | Config presence |
| `primaryKey` | `isPrimaryKey` | Config |
| `generated` | `generated` | Config |
| `identity` | `identity` | Config |
| `enumValues` | `enumValues` | Config |
| `dimensions` | `dimensions` | `.array()` support |

The `toDrizzle()` function reads these values and produces actual Drizzle column builder chains at runtime. The type-level computation produces `ColumnBaseConfig` values structurally identical to what hand-written Drizzle tables produce. No type information is lost.

Custom columns produce the same `ColumnMeta` that built-in columns produce. The `toDrizzle()` function handles them identically -- it calls Drizzle's `customType()` with the `customDataType`, `toDriver`, and `fromDriver` from our `ColumnMeta`.

---

## 3. API Design

### 3.1 ModelFactory

A dialect-specific factory produces a dialect-scoped object containing `Column`, `Model`, `Relation`, `Index`, and other helpers. All members are constrained to that dialect's valid types.

```ts
import { ModelFactory } from "@beep/effect-orm"

const pg = ModelFactory.pg({ prefix: "app_" })
```

**Factory configuration:**

| Property | Type | Required | Description |
|---|---|---|---|
| `prefix` | `string` | No | Prepended to derived table names |
| `customColumns` | `(custom) => Record<string, ColumnFn>` | No | Register custom column types (see 3.7) |

**Returned dialect-scoped object:**

| Member | Description |
|---|---|
| `pg.Column` | Column functions constrained to PG-valid types |
| `pg.Model` | Curried Model constructor: `pg.Model<Self>(identifier)(fields, annotations?)` |
| `pg.Relation` | Relation function for FK + query builder metadata |
| `pg.Index` | Index functions (field-level and model-level) |

Dialect selection determines which column types are available. For example:
- `pg.Column.uuid()` exists; `sqlite.Column.uuid()` does not.
- `pg.Column.jsonb()` exists; `mysql.Column.jsonb()` does not.
- `sqlite.Column.integer({ mode: "boolean" })` exists; `pg.Column.integer({ mode: "boolean" })` does not.

Supported dialects:

| Dialect | Factory Method | Drizzle Package |
|---|---|---|
| PostgreSQL | `ModelFactory.pg()` | `drizzle-orm/pg-core` |
| MySQL | `ModelFactory.mysql()` | `drizzle-orm/mysql-core` |
| SQLite | `ModelFactory.sqlite()` | `drizzle-orm/sqlite-core` |
| MSSQL | `ModelFactory.mssql()` | `drizzle-orm/mssql-core` |

**Destructuring is valid** but all examples in this document use dot-access for clarity:

```ts
// Both are equivalent:
const pg = ModelFactory.pg({ prefix: "app_" })
pg.Column.uuid()

const { Column, Model, Relation, Index } = ModelFactory.pg({ prefix: "app_" })
Column.uuid()
```

**Model constructor signature:**

The Model constructor is curried as `pg.Model<Self>(identifier)(fields, annotations?)`. Under the hood, it wraps v4 `Model.Class<Self>(identifier)(fields, annotations?)`. The second call accepts an optional `annotations` parameter of type `Schema.Annotations.Declaration<Self, readonly [Schema.Struct<...>]>`, which attaches Schema metadata to the default variant.

Model field helpers from `effect/unstable/schema/Model` are used directly in the field definitions. Our `pg.Column.xxx()` pipe steps compose with them:

```ts
import { Schema, pipe } from "effect"
import { Model } from "effect/unstable/schema"
import { ModelFactory } from "@beep/effect-orm"

const pg = ModelFactory.pg({ prefix: "app_" })

export class User extends pg.Model<User>("User")({
  id: pipe(Model.Generated(UserId), pg.Column.uuid({ primaryKey: true })),
  name: pipe(Schema.NonEmptyString, pg.Column.text()),
  email: pipe(Schema.NonEmptyString, pg.Column.varchar({ length: 255 })),
  passwordHash: pipe(Model.Sensitive(Schema.String), pg.Column.text()),
  createdAt: pipe(Model.DateTimeInsertFromDate, pg.Column.timestamp()),
  updatedAt: pipe(Model.DateTimeUpdateFromDate, pg.Column.timestamp()),
}) {}
```

With annotations:

```ts
export class User extends pg.Model<User>("User")(
  {
    id: pipe(Model.Generated(UserId), pg.Column.uuid({ primaryKey: true })),
    name: pipe(Schema.NonEmptyString, pg.Column.text()),
    email: pipe(Schema.NonEmptyString, pg.Column.varchar({ length: 255 })),
  },
  {
    title: "User",
    description: "A registered user in the system",
  }
) {}
```

Annotation behavior:

- Annotations apply to the **default variant** (`select`) only. They do not propagate to other variants.
- Each non-default variant automatically receives derived `id` and `title` annotations from the class identifier -- e.g., `"User.insert"`, `"User.update"`, `"User.json"`. This is done by `VariantSchema.Class` internally via `schema.annotate({ id: "${identifier}.${variant}", title: "${identifier}.${variant}" })`.
- Annotations are **transparent to the SQL/Drizzle layer**. They are metadata for Schema reflection, validation error messages, JSON Schema generation, and testing (arbitrary generation). The `toDrizzle()` function does not read or consume them.
- Our Model passes the parameter through to `Model.Class` (which passes it to `VariantSchema.Class`) without modification.

### 3.2 Field Composition

Fields use Effect-idiomatic pipe composition. Model field helpers, `Column`, `Relation`, and `Index` functions all compose in a pipe chain:

```ts
import { Schema, pipe } from "effect"
import { Model } from "effect/unstable/schema"

const field = pipe(
  Model.Generated(Schema.String.pipe(Schema.brand("UserId"))),
  pg.Column.uuid({ primaryKey: true, default: "uuid_generate_v4()" }),
  pg.Index.unique()
)
```

Each step returns a new immutable descriptor. The chain starts from a Schema or Model field helper which captures the Effect Schema (and variant configuration), then enriches the metadata registry through successive pipe steps.

Properties:
- Schema stays pure -- ORM metadata is applied at the pipe level, never mixed into Schema definitions.
- Model field helpers (Generated, Sensitive, FieldOption, DateTime*, etc.) define which variants include the field.
- `pg.Column.xxx()` steps add column type metadata.
- `pg.Relation()` and `pg.Index.xxx()` steps add relation and index metadata.
- The descriptor carries both a VariantSchema-compatible field (for Model class inheritance) and a FieldMeta entry (for Drizzle derivation).

### 3.3 Column Functions

Column functions are dialect-scoped and generic. TypeScript infers the column driver type from the column type name via a type-level mapping:

```ts
type PgColumnTypeMap = {
  timestamp: Date       // default mode
  text: string
  integer: number
  jsonb: unknown
  uuid: string
  boolean: boolean
  // ... (full mapping per dialect)
}
```

When `mode` is specified, it overrides the default driver type:

```ts
pg.Column.timestamp()                     // driver type = Date
pg.Column.timestamp({ mode: "string" })   // driver type = string
pg.Column.timestamp({ mode: "date" })     // driver type = Date (explicit)
```

Column functions accept a config object with dialect-specific options:

```ts
pg.Column.uuid({ primaryKey: true, default: "uuid_generate_v4()" })
pg.Column.varchar({ length: 255 })
pg.Column.numeric({ precision: 19, scale: 4, mode: "string" })
pg.Column.timestamp({ withTimezone: true, precision: 3, mode: "string" })
```

Common config fields across all column functions:

| Field | Type | Description |
|---|---|---|
| `primaryKey` | `boolean` | Mark as primary key |
| `unique` | `boolean` | Add unique constraint |
| `default` | `unknown` | SQL default expression |
| `defaultFn` | `() => unknown` | JS function for default value |
| `onUpdateFn` | `() => unknown` | JS function called on update |
| `mode` | dialect-specific | Override the driver type mapping |

### 3.4 Column.transform()

The `transform()` step is optional. It is only needed when the Schema's `Encoded` type does not match the column driver type.

**Full pipeline:** `DB value -> mode-driven driver type -> Column.transform.decode (if present) -> Schema.Encoded -> Schema.decode -> Schema.Type`

**Type enforcement:** If the column driver type is NOT assignable to `Schema.Encoded`, TypeScript errors unless `pg.Column.transform()` bridges the gap.

**No transform needed** (types already align):

```ts
// Schema.String Encoded = string, pg.Column.text() driver type = string
pipe(Schema.String, pg.Column.text())

// mode: "string" makes driver type = string, matches Schema.DateTimeUtcFromString Encoded = string
pipe(Schema.DateTimeUtcFromString, pg.Column.timestamp({ mode: "string" }))
```

**Transform needed** (type mismatch):

```ts
// timestamp default driver type = Date, but Schema.DateTimeUtcFromString Encoded = string
pipe(
  Schema.DateTimeUtcFromString,
  pg.Column.timestamp(),
  pg.Column.transform({
    decode: (raw: Date) => raw.toISOString(),
    encode: (s: string) => new Date(s)
  })
)
```

**JSON/JSONB columns with rich schemas:**

```ts
pipe(
  MyRichSchema,
  pg.Column.jsonb(),
  pg.Column.transform({
    decode: (json: unknown) => json,
    encode: (value: typeof MyRichSchema.Type) => value,
  })
)
```

**Nullability and transforms:** Nullability is always derived from the Schema AST. Transforms do not affect nullability. Mode affects the driver type (what Drizzle sees), not nullability.

### 3.5 Relations (Unified FK + Query Builder)

A single `pg.Relation()` declaration on a Field emits both:

1. **Drizzle FK constraint** (for DDL/migrations): equivalent to `.references(() => col, { onUpdate, onDelete })`
2. **Drizzle relation data** (for query builder): used by `deriveRelations()` to generate `defineRelations()` config

```ts
organizationId: pipe(
  Schema.NonEmptyString.pipe(Schema.brand("OrganizationId")),
  pg.Column.uuid({ default: "uuid_generate_v4()" }),
  pg.Relation(() => Organization.fields.id, {
    onUpdate: "cascade",
    onDelete: "cascade"
  })
)
```

The thunk pattern (`() => Organization.fields.id`) handles circular references, using the same approach as Drizzle's FK system. The thunk is evaluated lazily at `toDrizzle()` time, not at factory construction time.

A top-level `deriveRelations(models)` function collects all models, resolves thunks, and generates the Drizzle `defineRelations()` config compatible with RQBv2. Consumers declare relations once per field and get both DDL-level FK constraints and query-builder relation support automatically.

### 3.6 Indexes

Indexes are declared at two levels:

**Field-level indexes** (single-column) are pipe steps:

```ts
pipe(
  Schema.String,
  pg.Column.text(),
  pg.Index.unique()
)

pipe(
  Schema.String,
  pg.Column.text(),
  pg.Index.btree()
)
```

Available field-level index functions: `pg.Index.unique()`, `pg.Index.btree()`, `pg.Index.hash()`, and dialect-specific variants (e.g., `pg.Index.gin()`, `pg.Index.gist()`).

**Model-level indexes** (composite, spanning multiple fields) are declared via a separate `indexes` config on the Model constructor:

```ts
export class User extends pg.Model<User>("User")({
  firstName: pipe(Schema.String, pg.Column.text()),
  lastName: pipe(Schema.String, pg.Column.text()),
  email: pipe(Schema.String, pg.Column.text(), pg.Index.unique()),
}, {
  indexes: [
    pg.Index.composite("idx_full_name", ["firstName", "lastName"], { type: "btree" }),
    pg.Index.composite("idx_name_unique", ["firstName", "lastName"], { type: "unique" }),
  ]
}) {}
```

### 3.7 Custom Columns

Custom columns are defined via callback in the ModelFactory config. The callback receives a `custom` factory function:

```ts
const pg = ModelFactory.pg({
  prefix: "app_",
  customColumns: (custom) => ({
    citext: custom({
      dataType: () => "citext",
      toDriver: (value: string) => value,
      fromDriver: (value: string) => value,
    }),
    money: custom<number, string>({
      dataType: () => "numeric(19,4)",
      toDriver: (value) => value.toFixed(4),
      fromDriver: (value) => parseFloat(value),
    }),
  }),
})

// Custom columns are merged onto the Column namespace:
pg.Column.uuid()      // built-in
pg.Column.citext()    // custom
pg.Column.money()     // custom
```

The `custom<TData, TDriverParam>()` generic mirrors Drizzle's `customType`:

| Property | Type | Required | Description |
|---|---|---|---|
| `dataType` | `(config?) => string` | Yes | SQL type string |
| `toDriver` | `(value: TData) => TDriverParam` | No | TS to DB conversion |
| `fromDriver` | `(value: TDriverParam) => TData` | No | DB to TS conversion |
| `fromJson` | `(value: TJsonData) => TData` | No | JSON to TS conversion |

Three tiers of custom columns:

1. **Built-in**: `pg.Column.uuid()`, `pg.Column.text()` -- always available per dialect.
2. **Factory-registered**: `pg.Column.citext()` -- defined in factory config, reusable across all models from that factory.
3. **Inline**: `pg.Column.custom({...})()` -- one-off for a single field.

Custom columns produce the same `ColumnMeta` that built-in columns produce, so `toDrizzle()` handles them identically.

### 3.8 Factory Composition (.extend())

Factories compose through `.extend()`, producing a new factory that inherits and overrides parent configuration:

```ts
import { Schema, pipe } from "effect"
import { Model } from "effect/unstable/schema"

const orgPg = pg.extend({
  defaultFields: (parent) => ({
    ...parent,
    organizationId: pipe(
      Schema.NonEmptyString.pipe(Schema.brand("OrganizationId")),
      pg.Column.uuid({ default: "uuid_generate_v4()" }),
      pg.Relation(() => Organization.fields.id, {
        onUpdate: "cascade",
        onDelete: "cascade"
      })
    )
  })
})

export class OrgModel extends orgPg.Model<OrgModel>("OrgModel")({
  name: pipe(Schema.String, pg.Column.text()),
}) {}
```

Properties:
- `parent` in `defaultFields` receives the resolved parent default fields.
- The extended factory inherits `prefix`, `customColumns`, and dialect from the parent unless overridden.
- The returned object has the same shape (`{ Column, Model, Relation, Index }`), with `Model` including merged default fields.
- Extension is chainable: `a.extend(...).extend(...)`.
- Child fields override parent fields on name collision.

**Relation generics:** The thunk `() => Organization.fields.id` captures a concrete reference. The factory does NOT need to be generic over relation targets. The thunk is evaluated lazily at `toDrizzle()` time, not at factory construction time. This is the same approach Drizzle uses.

**baseFields spread vs .extend():** Both patterns are valid for field reuse:

```ts
import { Schema, pipe } from "effect"
import { Model } from "effect/unstable/schema"

// Option A: Object spread -- ad-hoc reuse, simpler, convention-based
const baseFields = {
  createdAt: pipe(Model.DateTimeInsertFromDate, pg.Column.timestamp()),
  updatedAt: pipe(Model.DateTimeUpdateFromDate, pg.Column.timestamp()),
}

export class MyModel extends pg.Model<MyModel>("MyModel")({
  ...baseFields,
  name: pipe(Schema.String, pg.Column.text()),
}) {}

// Option B: .extend() -- enforced, inheritable defaults
const basePg = pg.extend({
  defaultFields: () => ({
    createdAt: pipe(Model.DateTimeInsertFromDate, pg.Column.timestamp()),
    updatedAt: pipe(Model.DateTimeUpdateFromDate, pg.Column.timestamp()),
  })
})

export class MyModel2 extends basePg.Model<MyModel2>("MyModel2")({
  name: pipe(Schema.String, pg.Column.text()),
}) {}
```

**Guidance:** Use `.extend()` when defaults must be enforced across a team or module boundary (every model from the factory always includes those fields). Use object spread when reuse is ad-hoc and optional.

### 3.9 toDrizzle() Derivation

`toDrizzle()` converts a Model class into a dialect-specific Drizzle table:

```ts
import { toDrizzle } from "@beep/effect-orm"

const UserTable = toDrizzle(User)
// => PgTableWithColumns<{ name: "app_user"; columns: { ... } }>
```

The derivation produces:

| Output | Source |
|---|---|
| Table name | `prefix + snakeCase(identifier)` |
| Column builders | `ColumnMeta.columnType` selects the Drizzle builder per dialect |
| Nullability | Derived from Schema AST (not from metadata) |
| `.$type<T>()` calls | Schema's `Encoded` type, bridged through transform if present |
| Primary key | `ColumnMeta.primaryKey` |
| Unique constraints | `ColumnMeta.unique` |
| Default values | `ColumnMeta.default`, `ColumnMeta.defaultFn` |
| Foreign key references | `RelationMeta.target` thunk, resolved at derivation time |
| Indexes | `IndexMeta` entries, both field-level and model-level |

**Table name derivation:** `prefix + snakeCase(identifier)`. Snake-case uses lodash-style camelCase splitting: `HTTPClient` becomes `http_client`, `UserProfile` becomes `user_profile`. The table name is overridable via an optional `tableName` in the Model constructor:

```ts
export class User extends pg.Model<User>("User", { tableName: "custom_users" })({
  // fields
}) {}
```

**Nullability from SchemaAST:** The Schema AST is inspected for `NullOr`, `optional`, `UndefinedOr`, etc. If the Schema type includes null/undefined, the column is nullable. Otherwise, the column is `notNull`. This is the single source of truth -- no redundant nullability config exists on `ColumnMeta`.

**deriveRelations():** A companion function that collects all models, resolves relation thunks, and produces a Drizzle `defineRelations()` config compatible with RQBv2:

```ts
import { toDrizzle, deriveRelations } from "@beep/effect-orm"

const UserTable = toDrizzle(User)
const OrgTable = toDrizzle(Organization)

const relations = deriveRelations([User, Organization])
// => defineRelations compatible config
```

---

## 4. Dialect Column Inventory

### 4.1 Cross-Dialect Summary

| Dialect | Column Types | Types with Mode | Extension Types |
|---|---|---|---|
| PostgreSQL | 34 | 8 | vector, postgis, network |
| MySQL | 31 | 7 | -- |
| SQLite | 6 | 4 | -- |
| MSSQL | 20 | 8 | -- |

### 4.2 PostgreSQL Columns

#### Integer Types

| Function | SQL Type | dataType | TS Type | Config |
|---|---|---|---|---|
| `integer()` | `integer` | `'number int32'` | `number` | identity support |
| `smallint()` | `smallint` | `'number int16'` | `number` | identity support |
| `bigint({ mode })` | `bigint` | varies | `number \| bigint \| string` | mode: `'number'` \| `'bigint'` \| `'string'` |
| `serial()` | `serial` | `'number int32'` | `number` | auto notNull+hasDefault |
| `smallserial()` | `smallserial` | `'number int16'` | `number` | auto notNull+hasDefault |
| `bigserial({ mode })` | `bigserial` | varies | `number \| bigint` | mode: `'number'` \| `'bigint'` |

#### Float/Decimal Types

| Function | SQL Type | dataType | TS Type | Config |
|---|---|---|---|---|
| `real()` | `real` | `'number float'` | `number` | -- |
| `doublePrecision()` | `double precision` | `'number double'` | `number` | -- |
| `numeric({ precision?, scale?, mode? })` | `numeric(p,s)` | varies | `string \| number \| bigint` | mode: `'string'` \| `'number'` \| `'bigint'` |

#### String Types

| Function | SQL Type | dataType | TS Type | Config |
|---|---|---|---|---|
| `text({ enum? })` | `text` | `'string'` / `'string enum'` | `string` / enum union | enum |
| `varchar({ length?, enum? })` | `varchar(n)` | `'string'` / `'string enum'` | `string` / enum union | length, enum |
| `char({ length?, enum? })` | `char(n)` | `'string'` / `'string enum'` | `string` / enum union | length, enum |

#### Temporal Types

| Function | SQL Type | Default TS | Config |
|---|---|---|---|
| `date({ mode? })` | `date` | `Date` | mode: `'date'` \| `'string'` |
| `timestamp({ mode?, precision?, withTimezone? })` | `timestamp(p) [with time zone]` | `Date` | mode: `'date'` \| `'string'`, precision: 0-6, withTimezone |
| `time({ precision?, withTimezone? })` | `time(p) [with time zone]` | `string` | precision: 0-6, withTimezone |
| `interval({ fields?, precision? })` | `interval` | `string` | fields, precision |

#### Other Types

| Function | SQL Type | TS Type | Config |
|---|---|---|---|
| `boolean()` | `boolean` | `boolean` | -- |
| `uuid()` | `uuid` | `string` | `.defaultRandom()` |
| `json()` | `json` | `unknown` | -- |
| `jsonb()` | `jsonb` | `unknown` | -- |
| `bytea()` | `bytea` | `Buffer` | -- |

#### Network Types (PG-only)

| Function | SQL Type | TS Type |
|---|---|---|
| `inet()` | `inet` | `string` |
| `cidr()` | `cidr` | `string` |
| `macaddr()` | `macaddr` | `string` |
| `macaddr8()` | `macaddr8` | `string` |

#### Geometric Types (PG-only)

| Function | SQL Type | Default TS | Modes |
|---|---|---|---|
| `point({ mode? })` | `point` | `[number, number]` | `'tuple'` \| `'xy'` |
| `line({ mode? })` | `line` | `[number, number, number]` | `'tuple'` \| `'abc'` |
| `geometry({ mode?, type?, srid? })` | `geometry(type, srid)` | `[number, number]` | `'tuple'` \| `'xy'` |

#### Vector Extension (PG-only)

| Function | SQL Type | TS Type | Config |
|---|---|---|---|
| `vector({ dimensions })` | `vector(n)` | `number[]` | dimensions (required) |
| `halfvec({ dimensions })` | `halfvec(n)` | `number[]` | dimensions (required) |
| `sparsevec({ dimensions })` | `sparsevec(n)` | `string` | dimensions (required) |
| `bit({ dimensions })` | `bit(n)` | `string` | dimensions (required) |

#### PG Enum

`pgEnum('name', ['value1', 'value2'])` -- creates a SQL enum type.

### 4.3 MySQL Columns

#### Integer Types

| Function | SQL Type | dataType | TS Type | Config |
|---|---|---|---|---|
| `int()` | `int` | `'number int32'` | `number` | unsigned?, autoIncrement |
| `tinyint()` | `tinyint` | `'number int8'` | `number` | unsigned? |
| `smallint()` | `smallint` | `'number int16'` | `number` | unsigned? |
| `mediumint()` | `mediumint` | `'number int24'` | `number` | unsigned? |
| `bigint({ mode })` | `bigint` | varies | `number \| bigint \| string` | mode + unsigned? |
| `serial()` | `serial` | `'number uint53'` | `number` | auto hasDefault+autoIncrement |

#### Float/Decimal Types

| Function | SQL Type | TS Type | Config |
|---|---|---|---|
| `float()` | `float` | `number` | precision?, scale?, unsigned? |
| `double()` | `double` | `number` | precision?, scale?, unsigned? |
| `real()` | `real` | `number` | precision?, scale? |
| `decimal({ mode? })` | `decimal(p,s)` | `string \| number \| bigint` | mode + precision?, scale?, unsigned? |

#### String Types

| Function | SQL Type | TS Type | Config |
|---|---|---|---|
| `text()` | `text` | `string` | enum? |
| `tinytext()` | `tinytext` | `string` | enum? |
| `mediumtext()` | `mediumtext` | `string` | enum? |
| `longtext()` | `longtext` | `string` | enum? |
| `varchar({ length })` | `varchar(n)` | `string` | length (required), enum? |
| `char({ length? })` | `char(n)` | `string` | length?, enum? |

All MySQL string types support `.charSet()` and `.collate()`.

#### Temporal Types

| Function | SQL Type | Default TS | Config |
|---|---|---|---|
| `date({ mode? })` | `date` | `Date` | mode: `'date'` \| `'string'` |
| `timestamp({ mode?, fsp? })` | `timestamp(fsp)` | `Date` | mode: `'date'` \| `'string'`, fsp: 0-6 |
| `datetime({ mode?, fsp? })` | `datetime(fsp)` | `Date` | mode: `'date'` \| `'string'`, fsp: 0-6 |
| `time({ fsp? })` | `time(fsp)` | `string` | fsp: 0-6 |
| `year()` | `year` | `number` | -- |

MySQL date types support `.defaultNow()` and `.onUpdateNow()`.

#### Other Types

| Function | SQL Type | TS Type | Config |
|---|---|---|---|
| `boolean()` | `boolean` (tinyint(1)) | `boolean` | -- |
| `json()` | `json` | `unknown` | -- |
| `binary({ length? })` | `binary(n)` | `string` | length? |
| `varbinary({ length })` | `varbinary(n)` | `string` | length (required) |
| `blob()` | `blob` | `Buffer` | mode: `'buffer'` \| `'string'` |
| `tinyblob()` | `tinyblob` | `Buffer` | mode: `'buffer'` \| `'string'` |
| `mediumblob()` | `mediumblob` | `Buffer` | mode: `'buffer'` \| `'string'` |
| `longblob()` | `longblob` | `Buffer` | mode: `'buffer'` \| `'string'` |
| `mysqlEnum(['a', 'b'])` | `enum('a','b')` | union type | array or TS enum object |

### 4.4 SQLite Columns

| Function | SQL Type | Default TS | Modes | Config |
|---|---|---|---|---|
| `integer({ mode? })` | `integer` | `number` | `'number'` \| `'timestamp'` \| `'timestamp_ms'` \| `'boolean'` | mode |
| `real()` | `real` | `number` | -- | -- |
| `text({ mode?, enum?, length? })` | `text` | `string` | `'text'` \| `'json'` | mode, enum?, length? |
| `numeric({ mode? })` | `numeric` | `string` | `'string'` \| `'number'` \| `'bigint'` | mode |
| `blob({ mode? })` | `blob` | `Buffer` | `'buffer'` \| `'json'` \| `'bigint'` | mode |
| `customType()` | custom | custom | -- | dataType, toDriver, fromDriver |

### 4.5 MSSQL Columns

#### Integer Types

| Function | SQL Type | TS Type | Config |
|---|---|---|---|
| `int()` | `int` | `number` | identity support |
| `smallint()` | `smallint` | `number` | identity support |
| `tinyint()` | `tinyint` | `number` | identity support |
| `bigint({ mode })` | `bigint` | `number \| bigint \| string` | mode: `'number'` \| `'bigint'` \| `'string'` |
| `bit()` | `bit` | `boolean` | identity support |

#### Float/Decimal Types

| Function | SQL Type | TS Type | Config |
|---|---|---|---|
| `float({ precision? })` | `float(p)` | `number` | precision? |
| `real()` | `real` | `number` | -- |
| `decimal({ mode?, precision?, scale? })` | `decimal(p,s)` | `string \| number \| bigint` | mode: `'string'` \| `'number'` \| `'bigint'` |
| `numeric({ mode?, precision?, scale? })` | `numeric(p,s)` | `string \| number \| bigint` | mode: `'string'` \| `'number'` \| `'bigint'` |

#### String Types

| Function | SQL Type | TS Type | Config |
|---|---|---|---|
| `varchar({ length?, enum? })` | `varchar(n)` | `string` | length?, enum? |
| `nvarchar({ length?, enum?, mode? })` | `nvarchar(n)` | `string \| unknown` | length?, enum?, mode: `'json'` |
| `char({ length?, enum? })` | `char(n)` | `string` | length?, enum? |
| `nchar({ length?, enum? })` | `nchar(n)` | `string` | length?, enum? |
| `text({ enum? })` | `text` | `string` | enum? |
| `ntext({ enum? })` | `ntext` | `string` | enum? |

#### Temporal Types

| Function | SQL Type | Default TS | Config |
|---|---|---|---|
| `date({ mode? })` | `date` | `Date` | mode: `'date'` \| `'string'` |
| `time({ mode?, precision? })` | `time(p)` | `Date` | mode: `'date'` \| `'string'`, precision: 0-7 |
| `datetime({ mode? })` | `datetime` | `Date` | mode: `'date'` \| `'string'` |
| `datetime2({ mode?, precision? })` | `datetime2(p)` | `Date` | mode: `'date'` \| `'string'`, precision: 0-7 |
| `datetimeoffset({ mode?, precision? })` | `datetimeoffset(p)` | `Date` | mode: `'date'` \| `'string'`, precision: 0-7 |

MSSQL date types support `.defaultGetDate()`.

#### Binary Types

| Function | SQL Type | TS Type | Config |
|---|---|---|---|
| `binary({ length? })` | `binary(n)` | `Buffer` | length? |
| `varbinary({ length })` | `varbinary(n\|max)` | `Buffer` | length: number \| 'max' |

### 4.6 Mode Variants Summary

Types where `mode` changes the TS driver type:

| Type | Dialect(s) | Modes | TS Types |
|---|---|---|---|
| `bigint` | PG, MySQL, MSSQL | `'number'` \| `'bigint'` \| `'string'` | `number` \| `bigint` \| `string` |
| `bigserial` | PG | `'number'` \| `'bigint'` | `number` \| `bigint` |
| `numeric`/`decimal` | PG, MySQL, SQLite, MSSQL | `'string'` \| `'number'` \| `'bigint'` | `string` \| `number` \| `bigint` |
| `timestamp` | PG, MySQL | `'date'` \| `'string'` | `Date` \| `string` |
| `datetime` | MySQL, MSSQL | `'date'` \| `'string'` | `Date` \| `string` |
| `date` | PG, MySQL, MSSQL | `'date'` \| `'string'` | `Date` \| `string` |
| `datetime2` | MSSQL | `'date'` \| `'string'` | `Date` \| `string` |
| `datetimeoffset` | MSSQL | `'date'` \| `'string'` | `Date` \| `string` |
| `time` | MSSQL | `'date'` \| `'string'` | `Date` \| `string` |
| `point` | PG | `'tuple'` \| `'xy'` | `[n,n]` \| `{x,y}` |
| `line` | PG | `'tuple'` \| `'abc'` | `[n,n,n]` \| `{a,b,c}` |
| `integer` | SQLite | `'number'` \| `'timestamp'` \| `'timestamp_ms'` \| `'boolean'` | `number` \| `Date` \| `boolean` |
| `blob` | SQLite, MySQL | varies | varies |
| `text` | SQLite | `'text'` \| `'json'` | `string` \| `unknown` |
| `nvarchar` | MSSQL | `'text'` \| `'json'` | `string` \| `unknown` |

### 4.7 Enum Patterns Per Dialect

| Dialect | Pattern | Description |
|---|---|---|
| PG | `pgEnum('name', ['a', 'b'])` | Creates SQL enum type |
| MySQL | `mysqlEnum(['a', 'b'])` | Inline enum column |
| SQLite | `text({ enum: ['a', 'b'] })` | Text with type narrowing |
| MSSQL | `varchar({ enum: ['a', 'b'] })` | Varchar with type narrowing |

---

## 5. Type System

### 5.1 Nullability from SchemaAST

Nullability is always derived from the Effect Schema AST. The Schema is the single source of truth for the data shape:

- If the Schema type includes `null` or `undefined` (via `Schema.NullOr`, `Schema.optional`, `Schema.UndefinedOr`, etc.), the column is nullable.
- If not, the column is `notNull`.

The SchemaAST is inspected at `toDrizzle()` derivation time. There is no redundant nullability config on `ColumnMeta`. Drizzle's `.$notNull()` is applied based on our SchemaAST analysis.

### 5.2 Mode-Driven Driver Types

Each column type has a default driver type (the TypeScript type that the database driver produces). The `mode` option overrides this default:

```
pg.Column.timestamp()                     -> driver type: Date
pg.Column.timestamp({ mode: "string" })   -> driver type: string
pg.Column.bigint({ mode: "number" })      -> driver type: number
pg.Column.bigint({ mode: "bigint" })      -> driver type: bigint
```

The mode affects ONLY the driver type. It does not affect nullability, Schema types, or other metadata.

### 5.3 Transform Pipeline

The full data pipeline from database to application:

```
DB value
  -> Drizzle driver deserialization (produces mode-driven driver type)
  -> Column.transform.decode (OPTIONAL, bridges driver type to Schema.Encoded)
  -> Schema.Encoded
  -> Schema.decode
  -> Schema.Type
```

And in reverse for writes:

```
Schema.Type
  -> Schema.encode
  -> Schema.Encoded
  -> Column.transform.encode (OPTIONAL, bridges Schema.Encoded to driver type)
  -> Drizzle driver serialization
  -> DB value
```

If `Column.transform` is absent, the driver type must be assignable to `Schema.Encoded`. The type system enforces this at compile time.

### 5.4 v4 Schema/Codec Type Bridge

In Effect v4, the Schema type hierarchy has two levels:

- `Schema<Type>` -- the base type, carrying only the decoded `Type`.
- `Codec<Type, Encoded, DecodingServices, EncodingServices>` -- extends `Schema<Type>` with encoding information, service requirements for decoding, and service requirements for encoding.

The `Encoded` type that matters for the Drizzle bridge is accessed via `S["Encoded"]` on any `Codec`. For plain `Schema<T>` (no encoding step), `Encoded = Type`.

Key v4 type-level access patterns used by the bridge:

| Access | v4 API | Purpose |
|---|---|---|
| Decoded type | `S["Type"]` | Application-level TS type |
| Encoded type | `S["Encoded"]` | Wire/DB-level TS type, must align with driver type |
| Decoding services | `S["DecodingServices"]` | Effect requirements for decode |
| Encoding services | `S["EncodingServices"]` | Effect requirements for encode |
| Struct fields | `S["fields"]` | Field-level access on Schema.Struct |

Our `toDrizzle()` type bridge maps:

| ColumnBaseConfig Field | What It Controls | Our Source |
|---|---|---|
| `dataType` | Wire type identity | Literal from `pg.Column.xxx()` function |
| `data` | TypeScript type | Column type map + mode override |
| `notNull` | `T` vs `T \| null` in SELECT; required vs optional in INSERT | SchemaAST analysis |
| `hasDefault` | Required vs optional in INSERT | `default`/`defaultFn` presence |
| `isPrimaryKey` | Implies notNull | `primaryKey` config |
| `generated` | Excluded from INSERT | `generated` config |
| `identity` | always-excluded vs byDefault-optional in INSERT | `identity` config |
| `enumValues` | Restricts string union | `enumValues` config |
| `dimensions` | Array wrapping | `.array()` support |

Drizzle's `.references()` does NOT change column types -- it is purely a constraint. Our unified `pg.Relation()` maps cleanly to it.

### 5.5 Custom Column Type Integration

Custom columns produce the same `ColumnMeta` that built-in columns produce. The `toDrizzle()` function handles them identically:

1. If `ColumnMeta.customDataType` is present, `toDrizzle()` calls Drizzle's `customType()` with `{ dataType, toDriver, fromDriver }`.
2. The resulting Drizzle column builder is used in the table definition identically to a built-in column builder.
3. Type inference works the same way -- the `TData` and `TDriverParam` generics flow through the type bridge.

---

## 6. Constraints and Non-Goals

### Constraints

1. **Peer dependencies only**: `effect` (v4 / effect-smol) and `drizzle-orm` are peer dependencies. The library does not bundle them.

2. **Extends Model.Class**: Our Model IS a v4 `Model.Class` (from `effect/unstable/schema/Model`). We inherit its 6 variants, all field helpers (`Generated`, `Sensitive`, `FieldOption`, `DateTimeInsert*`, `DateTimeUpdate*`, `JsonFromString`, `UuidV4Insert`), the `Overrideable` pattern, and full compatibility with `SqlModel.makeRepository` and `SqlModel.makeDataLoaders`. Our scope is the addition of dialect-specific column metadata, indexes, relations, and the Drizzle bridge.

3. **Tree-shakeable**: Dialect-specific code is only imported when that dialect's factory is used.

4. **No runtime Schema AST walking for column types**: Column types are explicit via `pg.Column.xxx()`. SchemaAST walking is only used for nullability derivation (a targeted, bounded analysis).

5. **Effect coding standards**: Namespace imports, pipe/flow composition, tagged errors, no native Array/String prototype methods.

6. **Drizzle beta stability**: Targets `drizzle-orm@1.0.0-beta.*`. Minimizes dependence on internal/undocumented Drizzle types, but some are unavoidable (e.g., `BuildColumns`, `$Type`).

### Non-Goals

1. **Migration generation**: Drizzle Kit's responsibility.
2. **Query building**: Consumers use Drizzle's query API on derived tables.
3. **Connection management**: Handled by `effect/unstable/sql/SqlClient` (or dialect equivalent) and Drizzle.
4. **Runtime validation at query boundaries**: Handled by `effect/unstable/sql/SqlModel`'s existing machinery.
5. **Reimplementing variant schemas or field helpers**: These come from upstream `Model.Class`. We do not duplicate or replace them.
6. **Repository/data loader patterns**: `SqlModel.makeRepository` and `SqlModel.makeDataLoaders` already exist upstream. Our models are compatible with them directly.

---

## 7. User Stories and Acceptance Criteria

### User Stories

**US-1: Define a Model with Column Metadata.** As a developer, I define an Effect Model class with column-level metadata (type, constraints, defaults) using a pipe-based composition API where Model field helpers compose with dialect Column pipe steps, so that the model carries enough static information to derive database schemas.

```ts
import { Schema, pipe } from "effect"
import { Model } from "effect/unstable/schema"
import { ModelFactory } from "@beep/effect-orm"

const pg = ModelFactory.pg({ prefix: "app_" })

export class User extends pg.Model<User>("User")({
  id: pipe(Model.Generated(UserId), pg.Column.uuid({ primaryKey: true })),
  name: pipe(Schema.NonEmptyString, pg.Column.text()),
  email: pipe(Schema.NonEmptyString, pg.Column.varchar({ length: 255 })),
  passwordHash: pipe(Model.Sensitive(Schema.String), pg.Column.text()),
  createdAt: pipe(Model.DateTimeInsertFromDate, pg.Column.timestamp()),
  updatedAt: pipe(Model.DateTimeUpdateFromDate, pg.Column.timestamp()),
}) {}
```

**US-2: Derive a Drizzle Table from a Model.** As a developer, I call `toDrizzle(MyModel)` to get a fully typed Drizzle table matching my model's field definitions, so I can use Drizzle's query builder with type safety.

```ts
import { toDrizzle } from "@beep/effect-orm"

const UserTable = toDrizzle(User)
// => PgTableWithColumns<{ name: "app_user"; columns: { ... } }>
```

**US-3: Use Factory Default Fields.** As a developer, I define common fields (e.g., `createdAt`, `updatedAt`, `organizationId`) once in a factory via `.extend()` and have them automatically included in every model created by that factory.

```ts
import { Schema, pipe } from "effect"
import { Model } from "effect/unstable/schema"

const basePg = pg.extend({
  defaultFields: () => ({
    createdAt: pipe(Model.DateTimeInsertFromDate, pg.Column.timestamp()),
    updatedAt: pipe(Model.DateTimeUpdateFromDate, pg.Column.timestamp()),
  })
})
```

**US-4: Support Multiple Dialects.** As a developer, I choose a SQL dialect at the factory level and have all derived Drizzle tables use the correct dialect-specific column builders.

**US-5: Compose Factories.** As a developer, I extend a base factory with additional default fields or configuration, creating specialized factories for different contexts (e.g., org-scoped models, audited models).

**US-6: Transform Column Values.** As a developer, I specify decode/encode transforms on a column so that complex domain types (e.g., rich schemas stored as JSON) are correctly serialized/deserialized at the database boundary.

**US-7: Retain Full Model.Class Compatibility.** As a developer, I expect models created through the factory to be full `Model.Class` instances compatible with `SqlModel.makeRepository` and `SqlModel.makeDataLoaders`, with all 6 variant schemas, so I can use insert schemas, JSON schemas, repositories, and data loaders without manual derivation.

```ts
import { SqlModel } from "effect/unstable/sql"

const repo = SqlModel.makeRepository(User, {
  tableName: "app_user",
  spanPrefix: "UserRepo",
  idColumn: "id"
})
```

### Acceptance Criteria

1. **Type safety**: The derived Drizzle table has correct TypeScript types for every column. No `any`, no manual type assertions at the consumer level.

2. **Dialect correctness**: Each dialect produces the correct Drizzle column builders (e.g., `pg.uuid()` for PostgreSQL, `sqlite.text()` for SQLite when the logical type is UUID-like).

3. **Model.Class identity**: Models produced by the factory ARE `Model.Class` instances. They satisfy the `Model.Any` constraint and work with `SqlModel.makeRepository` and `SqlModel.makeDataLoaders`.

4. **Zero duplication**: A model definition in the ORM does not require a separate Drizzle table definition. One source of truth.

5. **Composability**: Factories compose cleanly via `.extend()`. Default fields merge predictably (child overrides parent on name collision).

6. **Pipe ergonomics**: The field builder API uses pipe composition where Model field helpers and Column/Index/Relation steps compose naturally, is immutable, and provides autocomplete/type inference at each step.

7. **Nullability from schema**: Column nullability is derived from the Effect Schema AST, not from explicit metadata on the column definition.

8. **Column transforms**: `decode`/`encode` transforms are type-checked: if the column driver type is not assignable to `Schema.Encoded`, TypeScript errors unless `pg.Column.transform()` bridges the gap.

---

## 8. Reference Material

### 8.1 Project State

The monorepo is bootstrapped:

```
packages/
  orm/
    package.json          # @beep/effect-orm
    src/
      index.ts            # Currently empty
      Literals.ts          # Currently empty
      utils/               # StringLiteralKit and other utilities
    test/
    tsconfig.*.json
```

Peer dependencies: `effect` (v4 / effect-smol), `drizzle-orm`.
Dev dependency: `drizzle-orm@1.0.0-beta.9`.

NOTE: Verify this structure before implementation begins -- it may have changed since this document was written.

### 8.2 Reference Implementations

**Beep-Effect SQL DSL** (single dialect, PostgreSQL only):
Location: `.repos/beep-effect/packages/common/schema/src/integrations/sql/dsl/`

| File | Purpose |
|---|---|
| `Field.ts` | Curried `Field(schema)(config)` factory with type derivation |
| `Model.ts` | `Model<Self>(identifier)(fields)` with variant schema support |
| `types.ts` | Type definitions and type-level validation |
| `literals.ts` | `ColumnType` and `ModelVariant` string literal unions |
| `adapters/drizzle.ts` | `toDrizzle(model)` -- PG-only table derivation |
| `derive-column-type.ts` | AST-based column type inference |
| `nullability.ts` | Schema AST nullability analysis |

Key differences from effect-orm: single dialect only, options-bag Field API (not pipe-based), no factory pattern, no prefix support, no decode/encode transform.

**Drizzle ORM Source** (beta branch): `.repos/drizzle-orm/`
Key areas: column builder types per dialect, `BuildColumns` type utility, `$type<T>()` mechanism, table factory functions.

**Effect v4 Source**: `.repos/effect-smol/`
Key files:
- `packages/effect/src/unstable/schema/Model.ts` -- Model.Class with 6 variants, field helpers (Generated, Sensitive, FieldOption, DateTime*, JsonFromString, UuidV4Insert)
- `packages/effect/src/unstable/schema/VariantSchema.ts` -- VariantSchema.make() with Class, Field, FieldOnly, FieldExcept, Struct, Union, extract, fieldEvolve
- `packages/effect/src/unstable/sql/SqlModel.ts` -- makeRepository, makeDataLoaders
- `packages/effect/src/unstable/sql/SqlClient.ts` -- SqlClient service
- `packages/effect/src/unstable/sql/SqlSchema.ts` -- SqlSchema helpers
- `packages/effect/src/Schema.ts` -- Core Schema/Codec types, Struct, Union, Literals, brand, decodeTo, check, annotate, etc.
- `packages/effect/src/SchemaAST.ts` -- AST types for nullability analysis

### 8.3 v4 Schema API Changes (from v3)

Key changes relevant to this library:

| v3 API | v4 API | Notes |
|---|---|---|
| `Schema<Type, Encoded, Requirements>` | `Schema<Type>` + `Codec<Type, Encoded, RD, RE>` | Schema is base, Codec adds encoding. 4 type params on Codec (decode + encode services split). |
| `Schema.annotations({...})` | `schema.annotate({...})` | Method-based, not pipe-based |
| `Schema.compose()` | `Schema.decodeTo()` | Renamed, curried |
| `Schema.filter(pred)` | `Schema.check(Schema.makeFilter(pred))` | Two-step |
| `Schema.extend(struct)` | `.mapFields(Struct.assign(...))` or `Schema.fieldsAssign(fields)` | Struct-level field manipulation |
| `Schema.pick/omit` | `.mapFields(Struct.pick/omit([...]))` | Via mapFields |
| `Schema.partial` | `.mapFields(Struct.map(Schema.optional))` | Via mapFields |
| `Schema.Union(A, B)` (variadic) | `Schema.Union([A, B])` (array) | Array arg instead of rest params |
| `Schema.Tuple(A, B)` (variadic) | `Schema.Tuple([A, B])` (array) | Array arg instead of rest params |
| `Schema.Literal("a", "b")` (variadic) | `Schema.Literals(["a", "b"])` (array) | Renamed + array arg |
| `Schema.Annotations.Schema<Self>` | `Schema.Annotations.Declaration<Self, readonly [...]>` | Declaration-based annotation type |

### 8.4 Drizzle Beta Findings

1. **FK constraints and relations are still separate** -- `.references()` for DDL, `defineRelations()` for query builder. This is the gap that effect-orm's unified `pg.Relation()` bridges.

2. **RQBv2 (`defineRelations`)** is the new centralized relations API:
   - Single `defineRelations(schema, (r) => ...)` call for entire schema.
   - `from`/`to` naming instead of `fields`/`references`.
   - `.through()` for many-to-many junction tables.
   - `optional`, `where`, `alias` on relation definitions.

3. **FK constraints use thunks** (`() => Column`) for circular references -- same approach adopted by effect-orm.

4. **RQBv2 avoids circular refs architecturally** -- receives whole schema, builds references eagerly. This informs the design of `deriveRelations()`.

5. **Key Drizzle source files**:
   - `drizzle-orm/src/relations.ts` -- RQBv2 system
   - `drizzle-orm/src/_relations.ts` -- old v0.x compat
   - `drizzle-orm/src/pg-core/foreign-keys.ts` -- PG FK definitions
   - `drizzle-orm/src/pg-core/columns/common.ts` -- column builder `.references()`

---

## 9. Glossary

| Term | Definition |
|---|---|
| **Model.Class** | The v4 class constructor from `effect/unstable/schema/Model` that produces a Schema class with 6 variant schemas (select, insert, update, json, jsonCreate, jsonUpdate). Built on VariantSchema.make(). Our ORM extends it. |
| **VariantSchema** | The v4 module at `effect/unstable/schema/VariantSchema` that provides the `make()` constructor for multi-variant schema systems. Model.Class is built on top of it. |
| **Schema** | In v4, `Schema<Type>` is the base type carrying the decoded Type. All schemas are at minimum a `Schema<T>`. |
| **Codec** | In v4, `Codec<Type, Encoded, DecodingServices, EncodingServices>` extends `Schema<Type>` with encoding information and service requirements. Most schemas that involve encoding/decoding are Codecs. |
| **Declaration annotations** | In v4, schema annotations use `Schema.Annotations.Declaration<Self, TypeParameters>` instead of v3's `Schema.Annotations.Schema<Self>`. The `TypeParameters` tuple captures the schema's type parameters for arbitrary generation and validation. |
| **Field** | A composable descriptor for a single model property, built via `pipe` with Model field helpers and dialect Column/Index/Relation steps. Carries variant schema configuration and a `FieldMeta` entry. |
| **FieldMeta** | The metadata record for a single field: column metadata, relation metadata, and index metadata. Stored on the Model's static metadata registry. |
| **ColumnMeta** | Column-level metadata: type, primaryKey, unique, autoIncrement, default, mode, transform, custom column config. |
| **RelationMeta** | Relation-level metadata: target thunk, onUpdate, onDelete. Emits both FK constraint and query builder data. |
| **IndexMeta** | Index-level metadata: type (btree, hash, gin, gist, unique), optional name. |
| **ModelFactory** | A dialect-specific factory that returns a scoped object (`{ Column, Model, Relation, Index }`) constrained to that dialect's valid types. Created via `ModelFactory.pg()`, `.sqlite()`, etc. |
| **Variant** | One of the 6 schema projections from `Model.Class` / `VariantSchema`: select, insert, update, json, jsonCreate, jsonUpdate. |
| **toDrizzle** | The derivation function that converts a Model class (with its metadata registry) into a dialect-specific Drizzle table. |
| **deriveRelations** | A function that collects all models, resolves relation thunks, and generates Drizzle `defineRelations()` config for RQBv2. |
| **Mode** | A column config option that overrides the default TypeScript driver type for a given SQL column type. |
| **Column.transform** | An optional `{ decode, encode }` pair that bridges the column driver type to `Schema.Encoded` when they do not match. |
| **SchemaAST** | The Effect Schema abstract syntax tree (v4: `effect/SchemaAST`), inspected at derivation time to determine column nullability. |
| **SqlModel** | The v4 module at `effect/unstable/sql/SqlModel` providing `makeRepository` and `makeDataLoaders` for CRUD operations on Model.Class instances. |
| **Overrideable** | A VariantSchema pattern that wraps a schema with a default value Effect. Used by Model field helpers like `DateTimeInsert` to auto-set values on insert/update while allowing explicit overrides via `Model.Override(value)`. |
| **Generated** | A Model field helper that marks a field as database-generated. Present in select, update, and json variants. Excluded from insert. |
| **Sensitive** | A Model field helper that marks a field as sensitive. Present in select, insert, and update variants. Excluded from all json variants. |
| **FieldOption** | A Model field helper that makes a field optional across all variants. Uses `OptionFromNullOr` for database variants and `optionalOption` for JSON variants. |
