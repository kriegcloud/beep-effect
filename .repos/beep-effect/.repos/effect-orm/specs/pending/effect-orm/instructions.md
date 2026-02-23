# effect-orm Instructions

> **IMPORTANT: Effect v4 Migration**
> This document was originally written targeting Effect v3. The project has since migrated to **Effect v4** (effect-smol).
> The authoritative design document is `DESIGN.md` which reflects all v4 changes.
> Source code references in this document pointing to `.repos/effect/` should be understood as `.repos/effect-smol/` equivalents.
> Key v4 changes: Schema → Codec rename, `Schema.annotate()` replaces `Schema.annotations()`,
> variadic → array for Union/Tuple/Literals, `decodeTo` replaces `compose`,
> `Model.Class` from `effect/unstable/schema/Model` provides 6 built-in variants.

> Status: **DRAFT** -- living document, actively evolving through design discussion.

## 1. Project Goal

Build an ORM library (`@beep/effect-orm`) that extends `@effect/sql/Model` with
static field metadata expressive enough to derive **100% type-safe Drizzle tables**
for **multiple SQL dialects**.

The library bridges two worlds:

- **Effect's domain model layer** (`@effect/sql/Model`,
  `@effect/experimental/VariantSchema`) -- rich, composable schemas with variant
  support (select/insert/update/json/jsonCreate/jsonUpdate).
- **Drizzle's query layer** -- dialect-aware table definitions with full
  TypeScript inference for queries.

A model defined once produces both a valid `@effect/sql/Model` class and a
dialect-specific Drizzle table, with zero manual duplication.

---

## 2. Design Decisions (decided)

### 2.1 Multi-Dialect Support

Supported SQL dialects:

| Dialect  | Drizzle Package        | Status   |
|----------|------------------------|----------|
| sqlite   | `drizzle-orm/sqlite-core` | Planned |
| pg       | `drizzle-orm/pg-core`     | Planned |
| mysql    | `drizzle-orm/mysql-core`  | Planned |
| mssql    | `drizzle-orm/mssql-core`  | Planned |

The dialect is selected at the **factory level** (see 2.2), not per-field or
per-model. All models produced by a factory share the same dialect.

### 2.2 ModelFactory Pattern

A dialect-specific factory produces a **dialect-scoped object** containing
`Column`, `Model`, `Relation`, and other helpers -- all constrained to that
dialect's valid types. The factory accepts configuration that applies to every
model it creates:

```ts
import { ModelFactory, Field } from "@beep/effect-orm"
import { Schema, DateTime, pipe } from "effect"
import { Organization } from "./Organization"

const pg = ModelFactory.pg({ prefix: "my_tableprefix_" })

const baseFields = {
  createdAt: pipe(
    Field(Schema.DateTimeUtc),
    pg.Column.timestamp({
      mode: "string",
      defaultFn: () => pipe(DateTime.unsafeNow(), DateTime.toDateUtc).toISOString(),
      onUpdateFn: () => pipe(DateTime.unsafeNow(), DateTime.toDateUtc).toISOString(),
    })
  ),
  updatedAt: pipe(
    Field(Schema.DateTimeUtc),
    pg.Column.timestamp({ default: "CURRENT_TIMESTAMP" })
  ),
}

export class MyModel extends pg.Model<MyModel>("<my-model>")({
  ...baseFields,
  name: pipe(Field(Schema.String), pg.Column.text()),
}) {}

// Extended factory with organization-scoped default fields
const orgPg = pg.extend({
  defaultFields: (parent) => ({
    ...parent,
    organizationId: pipe(
      Field(Schema.NonEmptyString.pipe(Schema.brand("OrganizationId"))),
      pg.Column.uuid({ default: "uuid_generate_v4()" }),
      pg.Relation(() => Organization.fields.id, {
        onUpdate: "cascade",
        onDelete: "cascade"
      })
    )
  })
})

export class MyOrgModel extends orgPg.Model<MyOrgModel>("<my-org-model>")({
  /* extra fields */
}) {}
```

Key properties of a factory:

- **`prefix`** -- string literal prepended to derived table names.
- **Returns a dialect-scoped object** with `{ Column, Model, Relation }` where
  each is constrained to the dialect's valid types.
- **`Column`** methods are dialect-specific (e.g., `pg.Column.uuid()` exists
  for PostgreSQL but not SQLite). This solves the chicken-and-egg problem:
  `pg.Column` is available immediately for defining fields.
- **`Model`** is a curried constructor: `pg.Model<Self>(identifier)(fields)`.
- **`defaultFields`** (via `.extend()`) -- thunk receiving parent fields,
  returning merged fields for every model.

### 2.2.1 Factory Returns Dialect-Scoped Object

`ModelFactory.pg()` (and `.sqlite()`, `.mysql()`, `.mssql()`) returns a
dialect-scoped object rather than a bare Model constructor:

```ts
const pg = ModelFactory.pg({ prefix: "my_tableprefix_" })

// pg.Column  -- Column functions constrained to PG-valid types
// pg.Model   -- Model constructor for the PG dialect
// pg.Relation -- Relation function for the PG dialect
```

Each member of the returned object is constrained to the dialect's valid
types. For example:

- `pg.Column.uuid()` exists, but `sqlite.Column.uuid()` does not (SQLite has
  no native UUID type).
- `pg.Column.jsonb()` exists, but `mysql.Column.jsonb()` does not.
- `sqlite.Column.integer({ mode: "boolean" })` exists, but
  `pg.Column.integer({ mode: "boolean" })` does not.

This design solves the chicken-and-egg problem: the `Column` functions need to
know the target dialect, but they are used **inside** model field definitions
(before the model exists). By returning them from the factory, the dialect is
already determined and `pg.Column` is available immediately for defining fields.

### 2.3 Pipe-based Field Composition

Fields use Effect-idiomatic pipe composition where `Column`, `Relation`,
`Index`, etc. are `Field => Field` functions. Column and Relation functions
come from the dialect-scoped factory object (see section 2.2.1):

```ts
import { pipe } from "effect"
import { ModelFactory, Field } from "@beep/effect-orm"

const pg = ModelFactory.pg({ prefix: "app_" })

organizationId: pipe(
  Field(Schema.NonEmptyString.pipe(Schema.brand("OrganizationId"))),
  pg.Column.uuid({ default: "uuid_generate_v4()" }),
  pg.Relation(() => Organization.fields.id, { onUpdate: "cascade", onDelete: "cascade" })
)
```

Each step in the pipe returns a new (immutable) Field descriptor -- no
mutation. The chain starts from `Field(schema)` which captures the Effect
Schema, then builds up column metadata, index hints, and foreign key
references through successive `Field<A> => Field<A>` functions.

Key properties:

- **Schema stays pure** -- ORM metadata is applied at the Field level via pipe,
  not mixed into Schema definitions.
- **`pg.Column.xxx()`** functions (e.g., `pg.Column.uuid()`,
  `pg.Column.timestamp()`, `pg.Column.text()`) are dialect-scoped
  `Field<A> => Field<A>` functions that attach column metadata.
- **`pg.Relation()`** is also a `Field<A> => Field<A>` function that attaches
  both FK constraint metadata and relation query builder metadata.
- **`Index()`** is a `Field<A> => Field<A>` function that attaches index hints.
- Column and Relation functions are obtained from the dialect-scoped factory
  object (see section 2.2.1), ensuring only dialect-valid types are available.
- This is more idiomatic for Effect developers than fluent chaining.
- Each step in the pipe narrows/enriches the Field type.

### 2.3.1 Column Type via Generic Method

The dialect-scoped `Column.xxx()` functions are generic. TypeScript infers the
column driver type from the column type name via a type-level mapping:

```ts
type PgColumnTypeMap = {
  timestamp: Date      // default mode
  text: string
  integer: number
  jsonb: unknown
  uuid: string
  boolean: boolean
}
```

When `mode` is specified, it overrides the default driver type:

```ts
pg.Column.timestamp()                    // ColumnDriverType = Date (default)
pg.Column.timestamp({ mode: "string" }) // ColumnDriverType = string
pg.Column.timestamp({ mode: "date" })   // ColumnDriverType = Date (explicit)
```

Each dialect has its own column type map. The factory's dialect determines
which map is active.

### 2.4 Factory Composition via `.extend()`

Factories compose through an `.extend()` method that produces a new factory
inheriting and overriding parent configuration:

```ts
const orgPg = pg.extend({
  defaultFields: (parent) => ({
    ...parent,
    organizationId: pipe(
      Field(Schema.NonEmptyString.pipe(Schema.brand("OrganizationId"))),
      pg.Column.uuid({ default: "uuid_generate_v4()" }),
      pg.Relation(() => Organization.fields.id, {
        onUpdate: "cascade",
        onDelete: "cascade"
      })
    )
  })
})
```

- `parent` in `defaultFields` receives the resolved parent default fields.
- The extended factory inherits `prefix` and dialect from the parent unless
  overridden.
- The extended factory returns the same dialect-scoped shape (`{ Column, Model,
  Relation }`), with the `Model` constructor now including the merged default
  fields.
- Extension is chainable: `a.extend(...).extend(...)`.

### 2.5 Prefix as Plain String

`prefix` is a string literal, not a thunk:

```ts
ModelFactory.pg({ prefix: "my_tableprefix_" })
```

The prefix is prepended to the snake_case table name derived from the model
identifier. E.g., model identifier `"UserProfile"` with prefix `"app_"` yields
table name `"app_user_profile"`.

### 2.6 Optional Column.transform()

The `.transform()` step is **optional**. It is only needed when the Schema's
`Encoded` type does not match the column driver type (as determined by the
`pg.Column.xxx()` function and its `mode` option).

- **`decode`**: transforms from column/DB driver representation to `Schema.Encoded`
- **`encode`**: transforms from `Schema.Encoded` to column/DB driver representation

The transform sits "below" the Schema transform in the pipeline:
`DB -> Column.transform.decode -> Schema.Encoded -> Schema.decode -> Schema.Type`.

**No transform needed** -- when the types already align:

```ts
// Schema.String Encoded = string, pg.Column.text() driver type = string
pipe(Field(Schema.String), pg.Column.text())

// mode: "string" makes driver type = string, matches Schema.DateTimeUtc Encoded = string
pipe(Field(Schema.DateTimeUtc), pg.Column.timestamp({ mode: "string" }))
```

**Transform needed** -- when there is a type mismatch:

```ts
// timestamp default driver type = Date, but Schema.DateTimeUtc Encoded = string
pipe(
  Field(Schema.DateTimeUtc),
  pg.Column.timestamp(),
  pg.Column.transform({
    decode: (raw: Date) => raw.toISOString(),
    encode: (s: string) => new Date(s)
  })
)
```

**Type enforcement**: If `ColumnDriverType` is NOT assignable to
`Schema.Encoded`, TypeScript errors unless `pg.Column.transform()` bridges the
gap. This is a compile-time safety net that prevents runtime type mismatches.

This is particularly powerful for json/jsonb columns where rich Effect Schema
types can be stored as JSON in the database:

```ts
pipe(
  Field(MyRichSchema),
  pg.Column.jsonb(),
  pg.Column.transform({
    decode: (json: unknown) => Schema.decodeSync(MyRichSchema)(json),
    encode: (value: MyRichType) => Schema.encodeSync(MyRichSchema)(value),
  })
)
```

### 2.9 Unified Relation (FK + Query Builder)

This is a key differentiator from Drizzle. In Drizzle beta, FK constraints
(`.references()`) and relations (`defineRelations()`) are still two separate
systems. In effect-orm, a single `Relation()` declaration on the Field emits
**both**:

1. **Drizzle FK constraint** (for DDL/migrations): equivalent to
   `.references(() => col, { onUpdate, onDelete })`
2. **Drizzle relation data** (for query builder): used by a top-level
   `defineRelations()` call

```ts
organizationId: pipe(
  Field(Schema.NonEmptyString.pipe(Schema.brand("OrganizationId"))),
  pg.Column.uuid({ default: "uuid_generate_v4()" }),
  pg.Relation(() => Organization.fields.id, { onUpdate: "cascade", onDelete: "cascade" })
)
```

The thunk pattern (`() => Organization.fields.id`) handles circular references,
using the same approach as Drizzle's FK system.

A top-level function like `deriveRelations(models)` collects all models,
resolves thunks, and generates the Drizzle `defineRelations()` config. This
means consumers declare relations once per field and get both DDL-level FK
constraints and query-builder relation support automatically.

### 2.7 Extends @effect/sql/Model

The Model produced by the factory extends `@effect/sql/Model` so consumers
get all 6 variant schemas for free via `@effect/experimental/VariantSchema`:

| Variant      | Purpose                                        |
|--------------|------------------------------------------------|
| `select`     | Full schema for SELECT queries                 |
| `insert`     | Excludes `Generated` fields                    |
| `update`     | All fields                                     |
| `json`       | Excludes `Sensitive` fields                    |
| `jsonCreate` | Excludes `Generated`, `GeneratedByApp`, `Sensitive` |
| `jsonUpdate` | Excludes `Generated`, `GeneratedByApp`, `Sensitive` |

The variant machinery is provided by `@effect/sql/Model` and
`@effect/experimental/VariantSchema`. The ORM library adds column metadata
without breaking the existing variant behavior.

### 2.8 Drizzle Table Derivation

The end goal: given a Model class with Field metadata, derive a 100% type-safe
Drizzle table for the factory's dialect. The derivation must produce:

- Correct Drizzle column builder per dialect (e.g., `pg.text()`, `pg.uuid()`,
  `pg.integer()`, `sqlite.text()`, etc.)
- Correct nullability (derived from Effect Schema AST, not stored in metadata)
- Correct primary key, unique, autoIncrement constraints
- Correct `.$type<T>()` calls using the Schema's encoded type
- Correct default values (SQL expressions, functions)
- Correct foreign key references
- Correct index definitions

The static properties on Field carry enough information for this derivation
at the type level. Runtime derivation mirrors the type-level mapping.

---

## 3. Internal Architecture Research

### 3.1 VariantSchema Internals

`@effect/sql/Model` is built on `VariantSchema.make()` from `@effect/experimental/VariantSchema` (677 lines at `.repos/effect/packages/experimental/src/VariantSchema.ts`).

Key findings:
- `VariantSchema.make({ variants: ["select", "insert", "update", "json", "jsonCreate", "jsonUpdate"], defaultVariant: "select" })` creates a multi-variant schema system
- A `Field` is a map of `{ variantName: Schema }` stored in `Field.schemas`
- `extract("insert")` pulls the insert-specific schema from each field
- The `Class` factory creates a class with static properties for each variant: `Group.insert`, `Group.update`, `Group.json`, etc.
- Extension points: `fieldEvolve()` transforms schemas per variant, `fieldFromKey()` renames fields per variant, `Overrideable()` for Effect-based value generation (timestamps, UUIDs)
- **Critical limitation**: Custom metadata does NOT survive variant extraction. `Field.schemas` only holds Schema instances. No slot for arbitrary metadata.

Source files:
- `.repos/effect/packages/experimental/src/VariantSchema.ts` -- Core module (677 lines)
- `.repos/effect/packages/sql/src/Model.ts` -- SQL Model using VariantSchema (965 lines)

### 3.2 @effect/sql Has NO Column Metadata

Critical discovery: `@effect/sql` has zero column type metadata system. There's no annotation mapping Schema types to SQL column types. The SQL layer is entirely value-driven -- template literals with parameterized values, each dialect compiler handles serialization.

This means effect-orm is NOT extending an existing metadata system -- we're building the column metadata layer from scratch.

### 3.3 Dual Structure Architecture

Because VariantSchema metadata doesn't survive extraction, our `ModelFactory` needs TWO parallel structures:

1. **VariantSchema fields** -- Powers Effect's schema system (select/insert/update/json variants, encoding/decoding, validation)
2. **Column/Relation/Index metadata** -- Powers Drizzle table generation (DDL, migrations, query builder)

Our `Field(schema, Column.uuid(), Relation(...))` API produces BOTH:
- A VariantSchema-compatible field (for the `Model.Class` inheritance)
- Metadata records (column type, FK constraints, relation data) stored on a parallel registry

### 3.4 Drizzle Type Bridge Proof

We verified that our API can produce fully type-safe Drizzle table definitions. Drizzle's `InferSelectModel<T>` and `InferInsertModel<T>` read from `ColumnBaseConfig`:

| Config Field | What It Controls |
|---|---|
| `dataType` | Wire type identity (e.g., `'string uuid'`, `'number int32'`) |
| `data` | TypeScript type (string, number, Date, etc.) |
| `notNull` | SELECT: `T` vs `T \| null`. INSERT: required vs optional |
| `hasDefault` | INSERT: required vs optional |
| `isPrimaryKey` | Implies notNull |
| `generated` | INSERT: excluded |
| `identity` | INSERT: always-excluded vs byDefault-optional |
| `enumValues` | Restricts string union |
| `dimensions` | Array wrapping |

Our `Column.xxx(config)` captures ALL of these:
- `dataType` -- literal type from function name
- `data` -- known per column type + `mode` override
- `notNull` -- **derived from SchemaAST** (resolved decision: Schema is source of truth for nullability)
- `hasDefault` -- from `{ default: ... }` or `{ defaultFn: ... }` in config
- `isPrimaryKey` -- from `{ primaryKey: true }` in config
- `generated` -- from config
- `identity` -- from config
- `enumValues` -- from config
- `dimensions` -- from `.array()` support

The `toDrizzle()` function produces actual Drizzle builder chains at runtime, and the type-level computation produces `PgColumnBaseConfig` that's structurally identical to what Drizzle's `ResolvePgColumnConfig` produces from its builder brand.

**Drizzle's `.references()` does NOT change column types** -- it's purely a constraint. Our unified `Relation()` maps cleanly.

---

## 4. Dialect Column Type Inventory

### 4.1 Cross-Dialect Summary

| Dialect | Column Types | Types with Mode | Extension Types |
|---|---|---|---|
| PostgreSQL | 34 | 8 (bigint, bigserial, numeric, date, timestamp, point, line, geometry) | vector, postgis, network |
| MySQL | 31 | 7 (bigint, decimal, timestamp, datetime, date, blob) | -- |
| SQLite | 6 | 4 (integer, blob, text, numeric) | -- |
| MSSQL | 20 | 8 (bigint, decimal, numeric, date, time, datetime, datetime2, datetimeoffset) | -- |

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
`pgEnum('name', ['value1', 'value2'])` -- creates a SQL enum type

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

All string types support `.charSet()` and `.collate()`.

#### Temporal Types
| Function | SQL Type | Default TS | Config |
|---|---|---|---|
| `date({ mode? })` | `date` | `Date` | mode: `'date'` \| `'string'` |
| `timestamp({ mode?, fsp? })` | `timestamp(fsp)` | `Date` | mode: `'date'` \| `'string'`, fsp: 0-6 |
| `datetime({ mode?, fsp? })` | `datetime(fsp)` | `Date` | mode: `'date'` \| `'string'`, fsp: 0-6 |
| `time({ fsp? })` | `time(fsp)` | `string` | fsp: 0-6 |
| `year()` | `year` | `number` | -- |

Date types support `.defaultNow()` and `.onUpdateNow()`.

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

Date types support `.defaultGetDate()`.

#### Binary Types
| Function | SQL Type | TS Type | Config |
|---|---|---|---|
| `binary({ length? })` | `binary(n)` | `Buffer` | length? |
| `varbinary({ length })` | `varbinary(n\|max)` | `Buffer` | length: number \| 'max' |

### 4.6 Mode Variants Summary (Types Where `mode` Changes TS Type)

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

## 5. Custom Column Design

### 5.1 Custom Column Registration

Custom columns are defined via callback in the ModelFactory config. The callback receives a `custom` factory function because `Column` doesn't exist yet at config time:

```typescript
const { Model, Column, Index } = ModelFactory.pg({
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

// Custom columns merged onto Column namespace:
Column.uuid()      // built-in PG
Column.citext()    // custom
Column.money()     // custom
```

### 5.2 Custom Column Interface

The `custom<TData, TDriverParam>()` generic mirrors Drizzle's `customType`:

| Property | Type | Required | Description |
|---|---|---|---|
| `dataType` | `(config?) => string` | Yes | SQL type string |
| `toDriver` | `(value: TData) => TDriverParam \| SQL` | No | TS to DB conversion |
| `fromDriver` | `(value: TDriverParam) => TData` | No | DB to TS conversion |
| `fromJson` | `(value: TJsonData) => TData` | No | JSON to TS conversion |

### 5.3 Three Tiers of Custom Columns

1. **Built-in**: `Column.uuid()`, `Column.text()` -- always available per dialect
2. **Factory-registered**: `Column.citext()` -- defined in factory config, reusable across all models using that factory
3. **Inline**: `Column.custom({...})()` -- one-off for a single field

Custom columns produce the same `ColumnMeta<{data, driverParam, dataType, ...}>` that built-in columns produce, so `toDrizzle()` handles them identically.

---

## 6. Open Questions

### 6.1 Transform Bridge Direction

> **RESOLVED** -- Option B selected. The `Column.transform()` bridges
> `ColumnDriverType <-> Schema.Encoded`. The Schema itself handles
> `Encoded <-> Type`. The transform is optional -- only needed when the
> column driver type does not match `Schema.Encoded`. See section 2.6.

### 6.2 Dialect-Specific Column Types

> **RESOLVED** -- Column types are dialect-specific, expressed via generic
> `pg.Column.xxx()` methods (e.g., `pg.Column.uuid()`, `pg.Column.timestamp()`,
> `pg.Column.text()`). Each dialect has its own column type map (see section
> 2.3.1). The factory returns a dialect-scoped object where only valid column
> types are available (see section 2.2.1). No abstract/portable column type
> enum.

### 6.3 Index and Reference API Shape

The `Index()` function is a `Field<A> => Field<A>` pipe step. Its exact API
shape is not yet specified:

- Simple index? composite index? unique index? named index?
- How to express composite indexes that span multiple fields?

The `Relation()` function's API shape is decided -- see section 2.9. It
uses a thunk to the target field (`() => Model.fields.id`) for type-safe,
circular-reference-safe FK + relation declaration.

### 6.4 Relation Definitions

> **RESOLVED** -- Unified `Relation()` on the Field level. A single
> `Relation()` declaration emits both Drizzle FK constraints (DDL) and
> relation data (query builder). A top-level `deriveRelations(models)`
> function collects all models and generates the `defineRelations()` config.
> See section 2.9.

### 6.5 Table Name Derivation

Current approach: `prefix + snakeCase(identifier)`. Questions:

- Should the table name be overridable per-model?
- Should the snake_case conversion handle edge cases like acronyms
  (e.g., `"HTTPClient"` -> `"h_t_t_p_client"` vs `"http_client"`)?

### 6.6 Drizzle Beta Compatibility

The project depends on `drizzle-orm@1.0.0-beta.9`. The Drizzle 1.0 beta has
API changes from the stable 0.x line. We need to track:

- Which Drizzle beta APIs are stable enough to depend on
- Whether the internal type-level helpers (`BuildColumns`, `$Type`,
  `HasDefault`, etc.) are considered public API
- RQBv2 (`defineRelations`) is the new centralized relations API -- see
  section 7.4 for details on its shape and stability

### 6.7 Fluent vs Pipe Field API

> **RESOLVED** -- Pipe-based `Field => Field` composition selected over
> fluent chaining. See section 2.3.

### 6.8 Relation Interaction with ModelFactory.extend()

If a base factory has no `Relation` fields but an extended one adds them, how
does the type propagate? The thunk `() => Model.fields.id` references a
specific Model -- does the factory need to be generic over the relation target?

This matters for factories like:

```ts
const orgPg = pg.extend({
  defaultFields: (parent) => ({
    ...parent,
    organizationId: pipe(
      Field(Schema.NonEmptyString.pipe(Schema.brand("OrganizationId"))),
      pg.Column.uuid({ default: "uuid_generate_v4()" }),
      pg.Relation(() => Organization.fields.id, { onUpdate: "cascade", onDelete: "cascade" })
    )
  })
})
```

The extended factory's `defaultFields` now has a concrete relation target
(`Organization`). How does this interact with the factory's generic type
parameter? Does the relation target need to be a factory-level type parameter,
or is the concrete reference sufficient?

### 6.9 Transform Required vs Optional

> **RESOLVED** -- `.transform()` is optional. Only needed when `Schema.Encoded`
> does not match the column driver type. The type system enforces this: if the
> types do not match, TypeScript errors unless `.transform()` bridges the gap.
> See section 2.6.

### 6.10 Relations Separate vs Unified

> **RESOLVED** -- Unified. A single `Relation()` declaration on the Field
> emits both Drizzle FK constraints (DDL) and query builder relation data.
> See section 2.9.

### 6.11 Factory `.factory()` Method for Curried Constructors

Should the dialect-scoped factory object support a `.factory()` method that
returns a curried model constructor with pre-applied default fields?

```ts
const makeModel = pg.factory({
  defaultFields: () => ({ ...baseFields })
})

export class MyModel extends makeModel<MyModel>("<my-model>")({
  name: pipe(Field(Schema.String), pg.Column.text()),
}) {}
```

Or is object spread of `baseFields` into each model definition sufficient?

```ts
export class MyModel extends pg.Model<MyModel>("<my-model>")({
  ...baseFields,
  name: pipe(Field(Schema.String), pg.Column.text()),
}) {}
```

Tradeoffs:
- `.factory()` enforces consistency (all models from the factory always include
  the default fields) and provides a single extension point via `.extend()`.
- Object spread is simpler, more explicit, and does not require learning an
  additional abstraction. However, it relies on convention rather than
  enforcement.

### 6.12 notNull Derivation

> **RESOLVED** -- Derive `notNull` from SchemaAST. Schema is the single source
> of truth for the data shape. If the Schema type includes null/undefined, the
> column is nullable. If not, it's notNull. No redundant config needed. The
> SchemaAST is inspected at field definition time to determine nullability.
> See section 3.4 for the full Drizzle type bridge proof.

### 6.13 Type Bridge to Drizzle is Feasible

> **RESOLVED** -- Our `Column.xxx(config)` API captures every type parameter
> that Drizzle's `ResolvePgColumnConfig` needs. `toDrizzle()` produces actual
> Drizzle builder chains at runtime. The type-level computation produces
> structurally identical types to hand-written Drizzle tables. No type
> information is lost in the transformation. See section 3.4.

### 6.14 Custom Columns via Callback Pattern

> **RESOLVED** -- `customColumns: (custom) => ({...})` in factory config.
> Same chicken-and-egg solution as `defaultFields: ({ Column, Relation }) =>
> ({...})`. Custom columns appear on the returned `Column` namespace alongside
> built-ins. See section 5 for full design.

---

## 7. Reference Implementations

### 7.1 Beep-Effect SQL DSL (single dialect, PostgreSQL only)

Location: `.repos/beep-effect/packages/common/schema/src/integrations/sql/dsl/`

This is the direct ancestor of the effect-orm design. Key files:

| File | Purpose |
|------|---------|
| `Field.ts` | Curried `Field(schema)(config)` factory with type derivation |
| `Model.ts` | `Model<Self>(identifier)(fields)` with variant schema support |
| `types.ts` | `ColumnDef`, `DSLField`, `DSLVariantField`, type-level validation |
| `literals.ts` | `ColumnType` and `ModelVariant` string literal unions |
| `adapters/drizzle.ts` | `toDrizzle(model)` -- PG-only table derivation |
| `derive-column-type.ts` | AST-based column type inference |
| `nullability.ts` | Schema AST nullability analysis |

Key differences from the target effect-orm design:

- **Single dialect** (PostgreSQL only) vs multi-dialect
- **Options-bag Field API** (`Field(schema)({ column: { ... } })`) vs pipe-based
- **No factory pattern** -- `Model` is used directly
- **No prefix support**
- **No decode/encode transform** -- relies on AST-based type derivation

### 7.2 Drizzle ORM Source

Location: `.repos/drizzle-orm/`

The Drizzle ORM source (beta branch) is available for understanding internal
types and builder patterns. Key areas of interest:

- Column builder types per dialect
- `BuildColumns` type utility
- `$type<T>()` mechanism
- Table factory functions (`pgTable`, `sqliteTable`, `mysqlTable`, `mssqlTable`)

### 7.3 Effect Source

Location: `.repos/effect/`

Key files:

- `packages/sql/src/Model.ts` -- `@effect/sql/Model` source
- `packages/experimental/src/VariantSchema.ts` -- variant schema machinery

### 7.4 Drizzle Beta Research Findings

Key findings from exploring `.repos/drizzle-orm/`:

1. **FK constraints and relations are still separate in Drizzle beta** --
   `.references()` for DDL, `defineRelations()` for query builder. This is the
   gap that effect-orm's unified `Relation()` bridges (see section 2.9).

2. **RQBv2 (`defineRelations`)** is the new centralized relations API replacing
   per-table `relations()`:
   - Single `defineRelations(schema, (r) => ...)` call for entire schema
   - `from`/`to` naming instead of `fields`/`references`
   - `.through()` for many-to-many junction tables
   - `optional`, `where`, `alias` on relation definitions

3. **FK constraints use thunks** (`() => Column`) for circular references --
   same approach adopted by effect-orm's `Relation()`.

4. **RQBv2 avoids circular refs architecturally** -- receives whole schema,
   builds references eagerly. This informs the design of `deriveRelations()`.

5. **Key files** in the Drizzle source:
   - `drizzle-orm/src/relations.ts` -- RQBv2 system
   - `drizzle-orm/src/_relations.ts` -- old v0.x compat
   - `drizzle-orm/src/pg-core/foreign-keys.ts` -- PG FK definitions
   - `drizzle-orm/src/pg-core/columns/common.ts` -- column builder `.references()`

---

## 8. Existing Project State

The monorepo is bootstrapped with the following structure:

```
packages/
  orm/
    package.json          # @beep/effect-orm, peer deps on effect/drizzle-orm/@effect/sql
    src/
      index.ts            # Currently empty (single commented-out import)
      Literals.ts          # Currently empty
      utils/               # StringLiteralKit and other utilities
    test/
    tsconfig.*.json
```

Peer dependencies: `effect`, `drizzle-orm`, `@effect/sql`, `@effect/experimental`.

Dev dependency on `drizzle-orm@1.0.0-beta.9` (beta branch).

---

## 9. User Stories

### US-1: Define a Model with Column Metadata

> As a developer, I want to define an Effect Model class with column-level
> metadata (type, constraints, defaults) using a pipe-based `Field => Field`
> composition API, so that the model carries enough static information to
> derive database schemas.

### US-2: Derive a Drizzle Table from a Model

> As a developer, I want to call a single function (e.g., `toDrizzle(MyModel)`)
> to get a fully typed Drizzle table that matches my model's field definitions,
> so I can use Drizzle's query builder with type safety.

### US-3: Use Factory Default Fields

> As a developer, I want to define common fields (e.g., `createdAt`,
> `updatedAt`, `organizationId`) once in a factory and have them automatically
> included in every model created by that factory.

### US-4: Support Multiple Dialects

> As a developer, I want to choose a SQL dialect at the factory level and have
> all derived Drizzle tables use the correct dialect-specific column builders.

### US-5: Compose Factories

> As a developer, I want to extend a base factory with additional default
> fields or configuration, creating specialized factories for different
> contexts (e.g., org-scoped models, audited models).

### US-6: Transform Column Values

> As a developer, I want to specify decode/encode transforms on a column
> so that complex domain types (e.g., rich schemas stored as JSON) are
> correctly serialized/deserialized at the database boundary.

### US-7: Retain Variant Schema Support

> As a developer, I want models created through the factory to retain all
> 6 variant schemas from `@effect/sql/Model`, so I can use insert schemas,
> JSON schemas, etc. without manual derivation.

---

## 10. Acceptance Criteria

1. **Type safety**: The derived Drizzle table must have correct TypeScript
   types for every column. No `any`, no manual type assertions at the
   consumer level.

2. **Dialect correctness**: Each dialect produces the correct Drizzle column
   builders (e.g., `pg.uuid()` for PostgreSQL, `sqlite.text()` for SQLite
   when column type is UUID).

3. **Variant preservation**: Models produced by the factory must support all
   6 variant schemas identically to `@effect/sql/Model`.

4. **Zero duplication**: A model definition in the ORM should not require
   a separate Drizzle table definition. One source of truth.

5. **Composability**: Factories compose cleanly via `.extend()`. Default
   fields merge predictably (child overrides parent on name collision).

6. **Pipe ergonomics**: The Field builder API uses `pipe` composition with
   `Field => Field` functions, is immutable, and provides autocomplete/type
   inference at each step.

7. **Nullability from schema**: Column nullability is derived from the
   Effect Schema AST (presence of `NullOr`, `optional`, etc.), not from
   explicit metadata on the column definition.

8. **Column transforms**: `decode`/`encode` transforms on `.column()` are
   type-checked: the encode input type must match the schema type (or
   encoded type, depending on resolution of open question 3.1), and the
   decode output must match as well.

---

## 11. Constraints

1. **Peer dependencies only**: `effect`, `drizzle-orm`, `@effect/sql`,
   `@effect/experimental` are peer dependencies. The library must not
   bundle them.

2. **Tree-shakeable**: The library must be tree-shakeable. Dialect-specific
   code should only be imported when that dialect's factory is used.

3. **No runtime Schema AST walking for column types**: The reference
   implementation's `deriveColumnType` walks the Schema AST at runtime to
   infer column types. The new design avoids this by requiring explicit
   column type in `.column()`. Type-level derivation as a convenience
   (when column type is omitted) is acceptable.

4. **Effect coding standards**: All code follows the project's Effect coding
   standards (namespace imports, pipe/flow, tagged errors, no native
   Array/String methods, etc.).

5. **Drizzle beta stability**: The library targets `drizzle-orm@1.0.0-beta.*`.
   We should minimize dependence on internal/undocumented Drizzle types, but
   some are unavoidable (e.g., `BuildColumns`, `$Type`).

---

## 12. Non-Goals (explicit exclusions)

1. **Migration generation**: The ORM does not generate SQL migrations. That
   remains Drizzle's responsibility via `drizzle-kit`.

2. **Query building**: The ORM does not provide its own query builder. It
   produces Drizzle tables that consumers use with Drizzle's query API.

3. **Connection management**: Database connections are managed by
   `@effect/sql-pg` (or dialect equivalent) and Drizzle, not by this library.

4. **Runtime validation at query boundaries**: Schema validation at the
   DB boundary is handled by `@effect/sql/Model`'s existing machinery.
   The ORM does not add additional runtime validation layers.

---

## 13. Glossary

| Term | Definition |
|------|------------|
| **Field** | A composable descriptor for a single model property, built via `pipe` with `Field => Field` functions. Carries Effect Schema, column metadata, index hints, and relation references. |
| **ModelFactory** | A dialect-specific factory that returns a scoped object (`{ Column, Model, Relation }`) constrained to that dialect's valid types. Created via `ModelFactory.pg()`, `.sqlite()`, etc. |
| **ColumnDef** | The column-level metadata: type, primaryKey, unique, autoIncrement, default, decode/encode transforms. |
| **Variant** | One of the 6 schema projections from `@effect/experimental/VariantSchema`: select, insert, update, json, jsonCreate, jsonUpdate. |
| **DSLField** | A Field wrapping a plain Effect Schema with column metadata attached. |
| **DSLVariantField** | A Field wrapping a `VariantSchema.Field` with column metadata attached. |
| **toDrizzle** | The derivation function that converts a Model class into a dialect-specific Drizzle table. |
