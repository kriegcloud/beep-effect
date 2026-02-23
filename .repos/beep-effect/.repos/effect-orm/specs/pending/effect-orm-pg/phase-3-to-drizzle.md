# Phase 3: `toDrizzle()` Derivation -- PostgreSQL

> Status: **PENDING**
> Depends on: Phase 1 (Column Factories + FieldMeta), Phase 2 (pg.Model + Metadata Registry)

---

## 1. Overview

Phase 3 builds the bridge between Effect's domain model layer and Drizzle's query/DDL layer. The `toDrizzle()` function reads a Model class (produced by Phase 2's `pg.Model`) together with its static metadata registry and produces a fully-typed Drizzle `PgTableWithColumns`. This is the core derivation that makes "define once, use everywhere" possible.

The function performs three jobs:

1. **Column dispatch** -- For each field in the metadata registry, select the correct `drizzle-orm/pg-core` column builder based on `ColumnMeta.columnType`.
2. **Constraint application** -- Apply `.notNull()`, `.primaryKey()`, `.unique()`, `.default()`, `.$defaultFn()`, `.$type<T>()` to each builder based on metadata + Schema AST analysis.
3. **Table assembly** -- Feed the resulting column builder record into Drizzle's `pgTable()` factory to produce the final table object.

Nullability is derived exclusively from the Effect Schema AST at derivation time. There is NO redundant nullable/notNull flag on ColumnMeta. The Schema is the single source of truth.

---

## 2. Prerequisites

### Phase 1 & 2 Must Be Complete

Before starting Phase 3, verify:

- `ColumnMeta` interface exists with at minimum: `columnType`, `primaryKey`, `unique`, `default`, `defaultFn`, `onUpdateFn`, `mode`, `enumName`, `enumValues`, `transform`, `dimensions`, and all type-specific config fields (precision, scale, length, withTimezone, etc.)
- `Column` pipe step functions exist in `packages/orm/src/dialects/postgres/` and produce ColumnMeta entries.
- `pg.Model` constructor extends `Model.Class` and populates a static `Map<string, FieldMeta>` on the class.
- The metadata registry is accessible via a known static property (e.g., `MyModel._fieldMeta` or `MyModel[FieldMetaSymbol]`).

### Files to Read Before Implementation

Read these files to understand the full context. Read them IN ORDER.

**ORM source (current state):**
1. `packages/orm/src/dialects/postgres/columns.ts` -- Column factory functions, `_tag` values, mode generics
2. `packages/orm/test/drizzle-proof.test.ts` -- Validated patterns for Column-to-Drizzle dispatch, `stripUndefined`, `toTimestampConfig`

**Drizzle source (reference):**
3. `.repos/drizzle-orm/drizzle-orm/src/pg-core/table.ts` -- `pgTable()`, `pgTableWithSchema()`, `PgTableWithColumns` type
4. `.repos/drizzle-orm/drizzle-orm/src/pg-core/columns/common.ts` -- `PgColumnBuilder` base class, `.notNull()`, `.default()`, `.$defaultFn()`, `.primaryKey()`, `.unique()`, `.$type<T>()`, `.references()` chain methods
5. `.repos/drizzle-orm/drizzle-orm/src/pg-core/columns/bigint.ts` -- Mode-based dispatch example (PgBigInt53Builder vs PgBigInt64Builder)
6. `.repos/drizzle-orm/drizzle-orm/src/pg-core/columns/timestamp.ts` -- Config-based builder example (PgTimestampConfig, precision, withTimezone)
7. `.repos/drizzle-orm/drizzle-orm/src/pg-core/columns/enum.ts` -- `pgEnum()` factory, `PgEnum<T>`, `PgEnumColumnBuilder`
8. `.repos/drizzle-orm/drizzle-orm/src/pg-core/columns/varchar.ts` -- Length + enum config example

**Effect v4 Schema AST (reference):**
9. `.repos/effect-smol/packages/effect/src/SchemaAST.ts` -- AST node types. Key types: `Union` (has `.types` array), `Null`, `Undefined`, `Void`, `Suspend` (has `.thunk()`), `Objects` (has `.propertySignatures`), `Base` (has `.encoding`, `.context`)
10. `.repos/effect-smol/packages/effect/src/Schema.ts` -- `NullOr`, `UndefinedOr`, `NullishOr`, `optional`, `optionalKey` constructors. These produce Union AST nodes containing Null/Undefined members.

**Prior art (reference):**
11. `.repos/beep-effect/packages/common/schema/src/integrations/sql/dsl/nullability.ts` -- v3 `isNullable()` implementation. NOTE: v4 AST tags differ (e.g., no `Refinement`, no `Transformation` -- see Step 2).
12. `.repos/beep-effect/packages/common/schema/src/integrations/sql/dsl/adapters/drizzle.ts` -- v3 `toDrizzle()` implementation. Pattern of type-level modifier composition.

**Design spec:**
13. `specs/pending/effect-orm/DESIGN.md` -- Sections 2.3 (Metadata Registry), 2.4 (Type Bridge), 3.9 (toDrizzle Derivation), 5.1 (Nullability from SchemaAST), 5.3 (Transform Pipeline)

---

## 3. Deliverables

### Files to Create

| File | Purpose |
|------|---------|
| `packages/orm/src/dialects/postgres/nullability.ts` | Schema AST nullability inspector for v4 |
| `packages/orm/src/dialects/postgres/toDrizzle.ts` | The `toDrizzle()` function |
| `packages/orm/test/nullability.test.ts` | Tests for AST nullability detection |
| `packages/orm/test/toDrizzle.test.ts` | Tests for full Model-to-Drizzle derivation |

### Files to Modify

| File | Change |
|------|--------|
| `packages/orm/src/index.ts` | Export `toDrizzle` |
| `packages/orm/src/dialects/postgres/index.ts` | Export nullability + toDrizzle (if barrel exists) |

---

## 4. Step 1: Study the v4 Schema AST

**Goal:** Understand the v4 AST node types so the nullability inspector is exhaustive and correct.

### v4 AST Node Types

The AST type is defined in `.repos/effect-smol/packages/effect/src/SchemaAST.ts`:

```typescript
type AST =
  | Declaration
  | Null
  | Undefined
  | Void
  | Never
  | Unknown
  | Any
  | String
  | Number
  | Boolean
  | BigInt
  | Symbol
  | Literal
  | UniqueSymbol
  | ObjectKeyword
  | Enum
  | TemplateLiteral
  | Arrays
  | Objects
  | Union
  | Suspend
```

### Critical Differences from v3

The v3 AST had `Refinement`, `Transformation`, `TypeLiteral`, `TupleType`, `StringKeyword`, `NumberKeyword`, etc. The v4 AST is simplified:

| v3 | v4 | Notes |
|----|-----|-------|
| `Refinement` | Absent | Refinements are represented via `checks` on the AST node |
| `Transformation` | Absent | Transformations are represented via `encoding` (a `Link` chain) on the AST node |
| `TypeLiteral` | `Objects` | Renamed, now has `propertySignatures` and `indexSignatures` |
| `TupleType` | `Arrays` | Renamed |
| `StringKeyword` | `String` | Simplified names |
| `NumberKeyword` | `Number` | Simplified names |
| `BooleanKeyword` | `Boolean` | Simplified names |
| `BigIntKeyword` | `BigInt` | Simplified names |
| `SymbolKeyword` | `Symbol` | Simplified names |
| `UndefinedKeyword` | `Undefined` | Simplified names |
| `VoidKeyword` | `Void` | Simplified names |
| `NeverKeyword` | `Never` | Simplified names |
| `UnknownKeyword` | `Unknown` | Simplified names |
| `AnyKeyword` | `Any` | Simplified names |
| `ObjectKeyword` | `ObjectKeyword` | Same |
| `Enums` | `Enum` | Singular |
| `UniqueSymbol` | `UniqueSymbol` | Same |
| `Literal` | `Literal` | Same |
| `TemplateLiteral` | `TemplateLiteral` | Same |

### How Encoding Works in v4

In v4, transformations are not separate AST nodes. Instead, every AST node has an optional `encoding` property of type `Encoding = readonly [Link, ...Array<Link>]`. Each `Link` has:
- `to: AST` -- the target AST of the encoding step
- `transformation` -- the encode/decode logic

To analyze the "encoded" (database/wire) side, follow the `encoding` links. The terminal `to` AST in the encoding chain is the encoded representation.

### How Optional Works in v4

Each AST node has an optional `context: Context` property. `Context` has:
- `isOptional: boolean` -- whether the field can be absent from the containing struct
- `isMutable: boolean`
- `defaultValue: Encoding | undefined`

The `Schema.optional(S)` constructor produces `optionalKey(UndefinedOr(S))`, which is a `Union([S, Undefined])` with `context.isOptional = true`.

### Key Insight for Nullability

`Schema.NullOr(S)` produces `Union([S, Null])`. The `Null` member in a Union is what makes a column nullable. `Schema.optional(S)` produces `Union([S, Undefined])` with `isOptional = true` -- the `Undefined` member also signals nullable for SQL purposes.

---

## 5. Step 2: Nullability Inspector

**Goal:** Implement `isNullable(ast: AST): boolean` that detects whether a Schema AST encodes to null/undefined.

### File: `packages/orm/src/dialects/postgres/nullability.ts`

### Algorithm

```
isNullable(ast, visited = new WeakSet()):
  if visited.has(ast) -> return false  // cycle guard
  visited.add(ast)

  // Follow encoding chain to get the encoded AST
  // For SQL columns, we care about the "from" (encoded) side
  let target = ast
  if target.encoding exists:
    target = getEncodedAST(target)  // follow Link chain to terminal

  match target._tag:
    "Null"      -> true
    "Undefined" -> true
    "Void"      -> true
    "Union"     -> target.types.some(t => isNullable(t, visited))
    "Suspend"   -> isNullable(target.thunk(), visited)
    "Declaration" -> check typeParameters recursively (rare, usually false)
    otherwise   -> false
```

### Encoding Chain Follower

To get the terminal encoded AST from an encoding chain:

```
getEncodedAST(ast):
  if ast.encoding is undefined -> return ast
  let current = ast
  for each link in ast.encoding:
    current = link.to
  // The last link.to is the encoded AST
  // But that AST may itself have encoding, so recurse
  return getEncodedAST(current)
```

### Context-Based Optional Detection

For fields in a struct (Objects), `context.isOptional = true` means the property can be absent. For SQL purposes, an optional field translates to nullable (the database stores NULL when the property is absent).

However, the nullability inspector operates on the field's AST TYPE, not the context. The `optional(S)` constructor wraps S as `Union([S, Undefined])`, so the `Undefined` member in the Union is what the inspector detects. The `isOptional` context flag is handled at the struct level by the caller, not by the AST type inspector.

### Edge Cases

1. **Branded types:** Branding does not affect nullability. Branded schemas add `Declaration` wrappers or checks but do not introduce null/undefined members.
2. **Schema.OptionFromNullOr:** In v4, this is `decodeTo(Option<T>, NullOr<S>)`. The encoding chain ends at `NullOr(S)` which is `Union([S, Null])`. The inspector follows the encoding chain and finds `Null` in the Union -- correctly nullable.
3. **Schema.check / filters:** In v4, checks are on the AST node, not separate wrapper nodes. They do not affect nullability.
4. **Model.Generated / Model.Sensitive:** These are VariantSchema field helpers. They wrap the inner Schema but do not introduce nullability. The inner Schema's AST is what gets inspected.

### Tests (in `packages/orm/test/nullability.test.ts`)

Test each of these and assert the expected nullability:

| Schema Expression | Expected | Reason |
|---|---|---|
| `Schema.String` | `false` | Plain string, not nullable |
| `Schema.Number` | `false` | Plain number |
| `Schema.NullOr(Schema.String)` | `true` | Union with Null |
| `Schema.UndefinedOr(Schema.String)` | `true` | Union with Undefined |
| `Schema.NullishOr(Schema.String)` | `true` | Union with Null and Undefined |
| `Schema.optional(Schema.String)` | `true` | Union with Undefined (via optionalKey(UndefinedOr(S))) |
| `Schema.String.pipe(Schema.brand("UserId"))` | `false` | Brand does not add null |
| `Schema.Boolean` | `false` | Plain boolean |
| `Schema.Literal(null)` | `true` | Null literal |
| `Schema.Literal("active", "inactive")` | `false` | String literals only |
| `Schema.DateTimeUtcFromString` (or v4 equivalent) | Depends on encoding | Follow the encoding chain |

---

## 6. Step 3: Column Dispatcher

**Goal:** Build a dispatch record that maps `ColumnMeta.columnType` (the `_tag` string) to the correct Drizzle builder factory call with config forwarding.

### File: `packages/orm/src/dialects/postgres/toDrizzle.ts`

### Dispatch Table

Each entry receives the column name (snake_case) and the `ColumnMeta` object, and returns a Drizzle column builder.

```typescript
import * as pg from "drizzle-orm/pg-core"

const columnDispatch: Record<string, (name: string, meta: ColumnMeta) => AnyPgColumnBuilder> = {
  // Integer types
  integer:     (name, _meta) => pg.integer(name),
  smallint:    (name, _meta) => pg.smallint(name),
  bigint:      (name, meta)  => pg.bigint(name, { mode: meta.mode as "number" | "bigint" }),
  serial:      (name, _meta) => pg.serial(name),
  smallserial: (name, _meta) => pg.smallserial(name),
  bigserial:   (name, meta)  => pg.bigserial(name, { mode: meta.mode as "number" | "bigint" }),

  // Float/decimal types
  real:                (name, _meta) => pg.real(name),
  "double precision":  (name, _meta) => pg.doublePrecision(name),
  numeric:             (name, meta)  => pg.numeric(name, stripUndefined({
    precision: meta.precision,
    scale: meta.scale,
    mode: meta.mode as "string" | "number" | undefined,
  })),

  // Character types
  text:    (name, _meta) => pg.text(name),
  varchar: (name, meta)  => meta.length !== undefined
    ? pg.varchar(name, { length: meta.length })
    : pg.varchar(name),
  char:    (name, meta)  => meta.length !== undefined
    ? pg.char(name, { length: meta.length })
    : pg.char(name),

  // Boolean
  boolean: (name, _meta) => pg.boolean(name),

  // Temporal types
  date:      (name, meta) => pg.date(name, { mode: meta.mode as "date" | "string" }),
  time:      (name, meta) => pg.time(name, stripUndefined({
    precision: meta.precision,
    withTimezone: meta.withTimezone,
  })),
  timestamp: (name, meta) => pg.timestamp(name, toTimestampConfig(meta)),
  interval:  (name, meta) => pg.interval(name, stripUndefined({
    fields: meta.fields,
    precision: meta.precision,
  })),

  // JSON types
  json:  (name, _meta) => pg.json(name),
  jsonb: (name, _meta) => pg.jsonb(name),

  // Binary
  bytea: (name, _meta) => pg.customType<{ data: Buffer; driverData: Buffer }>({
    dataType: () => "bytea",
  })(name),

  // UUID
  uuid: (name, _meta) => pg.uuid(name),

  // Network types
  inet:     (name, _meta) => pg.inet(name),
  cidr:     (name, _meta) => pg.cidr(name),
  macaddr:  (name, _meta) => pg.macaddr(name),
  macaddr8: (name, _meta) => pg.macaddr8(name),

  // Geometric types
  point:    (name, _meta) => pg.point(name),
  line:     (name, _meta) => pg.line(name),
  geometry: (name, meta)  => pg.geometry(name, stripUndefined({
    type: meta.geometryType,
    srid: meta.srid,
  })),

  // Vector types
  vector:    (name, meta) => pg.vector(name, { dimensions: meta.dimensions! }),
  halfvec:   (name, meta) => pg.halfvec(name, { dimensions: meta.dimensions! }),
  sparsevec: (name, meta) => pg.sparsevec(name, { dimensions: meta.dimensions! }),
  bit:       (name, meta) => pg.bit(name, { dimensions: meta.length! }),
}
```

### Important: `stripUndefined` Utility

Because `exactOptionalPropertyTypes` is enabled in the tsconfig, Drizzle column factories reject `{ precision: undefined }` (they expect absent-or-defined, not explicitly undefined). The `stripUndefined` utility removes undefined-valued keys from an object before passing it to Drizzle.

Implement this in the same file or a shared utility:

```typescript
function stripUndefined<T extends Record<string, unknown>>(obj: T): StripUndefinedValues<T> {
  const result: Record<string, unknown> = {}
  for (const key of Object.keys(obj)) {
    if (obj[key] !== undefined) {
      result[key] = obj[key]
    }
  }
  return result as StripUndefinedValues<T>
}
```

### Important: `toTimestampConfig` Utility

Timestamp has a particularly tricky config because `PgTimestampConfig<TMode>` expects specific shape:

```typescript
function toTimestampConfig(meta: ColumnMeta): pg.PgTimestampConfig<"date" | "string"> {
  return {
    mode: meta.mode as "date" | "string",
    ...(meta.withTimezone !== undefined ? { withTimezone: meta.withTimezone } : {}),
    ...(meta.precision !== undefined ? { precision: meta.precision as pg.Precision } : {}),
  }
}
```

### Enum Handling -- NOT in the dispatch table

Enums are special. They require creating a `pgEnum` object first, then using it as a column factory. This is handled separately in Step 5.

---

## 7. Step 4: Builder Configuration

**Goal:** After selecting the base Drizzle builder from the dispatcher, apply constraint chain methods based on ColumnMeta and AST analysis.

### Configuration Order

Apply in this exact order:

1. `.primaryKey()` -- if `meta.primaryKey === true`
2. `.notNull()` -- if the field's Schema AST is NOT nullable AND the column is NOT a serial/smallserial/bigserial (serials handle their own notNull)
3. `.unique()` -- if `meta.unique === true`
4. `.default(value)` -- if `meta.default` is present (SQL expression or literal)
5. `.$defaultFn(fn)` -- if `meta.defaultFn` is present (JS function)
6. `.$onUpdateFn(fn)` -- if `meta.onUpdateFn` is present
7. `.$type<EncodedType>()` -- ALWAYS applied last, bridges to Schema's Encoded type

### Implementation Pattern

```typescript
const applyConstraints = (
  builder: AnyPgColumnBuilder,
  meta: ColumnMeta,
  fieldAST: SchemaAST.AST,
  isSerial: boolean,
): AnyPgColumnBuilder => {
  let col = builder

  if (meta.primaryKey) {
    col = col.primaryKey()
  }

  if (meta.unique) {
    col = col.unique()
  }

  // Nullability from Schema AST -- single source of truth
  const nullable = isNullable(fieldAST)
  if (!nullable && !isSerial) {
    col = col.notNull()
  }

  // Defaults
  if (meta.default !== undefined) {
    col = col.default(meta.default)
  } else if (meta.defaultFn !== undefined) {
    col = col.$defaultFn(meta.defaultFn)
  }

  if (meta.onUpdateFn !== undefined) {
    col = col.$onUpdateFn(meta.onUpdateFn)
  }

  // .$type<T>() is applied at the type level via DrizzleTypedBuildersFor.
  // At runtime, .$type() returns `this`, so the call is:
  col = col.$type()

  return col
}
```

### Serial Column Handling

Serial (`serial`, `smallserial`, `bigserial`) columns are special in Drizzle:
- They automatically have `notNull` and `hasDefault` semantics.
- Do NOT call `.notNull()` on serial builders.
- The `isSerial` flag is derived from `meta.columnType`:

```typescript
const isSerial = meta.columnType === "serial"
  || meta.columnType === "smallserial"
  || meta.columnType === "bigserial"
```

### `.$type<T>()` Type Bridge

`.$type<T>()` tells Drizzle what TypeScript type the column produces/consumes. The `T` is the Schema's **Encoded** type (the wire/database type), NOT the Schema's **Type** (the application type).

If `meta.transform` is present, the `.$type<T>()` parameter is the output of `transform.decode` (what the Schema receives as Encoded). If no transform, it's the column's driver type directly.

At runtime, `.$type()` returns `this` -- it is purely a type-level cast. The important thing is that the TYPE SYSTEM sees the correct type. This is accomplished via the type-level `DrizzleTypedBuildersFor` utility (see Architecture Decisions).

---

## 8. Step 5: Enum Handling

**Goal:** Handle `pgEnum` creation and column usage as a special path outside the normal dispatch table.

### How Drizzle pgEnum Works

```typescript
// Step 1: Create the enum type object
const statusEnum = pgEnum("user_status", ["active", "inactive", "banned"])

// Step 2: Use the enum object as a column factory
const statusColumn = statusEnum("status")  // returns PgEnumColumnBuilder

// Step 3: Apply constraints
statusColumn.notNull().default("active")
```

### Implementation

When `ColumnMeta.columnType === "enum"`, the dispatcher should:

1. Call `pg.pgEnum(meta.enumName, meta.enumValues as [string, ...string[]])` to create the enum type.
2. Call the resulting enum object with the column name to create the builder.
3. Apply constraints normally.

### Enum Deduplication

Multiple fields might reference the same enum type (same `enumName`). The `toDrizzle()` function must deduplicate enum creation:

```typescript
const enumCache = new Map<string, pg.PgEnum<[string, ...string[]]>>()

function getOrCreateEnum(enumName: string, values: readonly string[]): pg.PgEnum<[string, ...string[]]> {
  let pgEnumObj = enumCache.get(enumName)
  if (!pgEnumObj) {
    pgEnumObj = pg.pgEnum(enumName, values as [string, ...string[]])
    enumCache.set(enumName, pgEnumObj)
  }
  return pgEnumObj
}
```

### Enum Export

The created `pgEnum` objects need to be accessible for Drizzle Kit migrations. The `toDrizzle()` function should either:
- Attach them to the returned table object under a known property, OR
- Return them separately alongside the table, OR
- Expose an `extractEnums(model)` companion function.

**Decision required from Phase 2 design.** For now, implement the companion function approach:

```typescript
export const extractEnums = (model: ModelWithMeta): Record<string, pg.PgEnum<[string, ...string[]]>> => {
  // iterate metadata, collect enum columns, build pgEnum objects
}
```

---

## 9. Step 6: `toDrizzle()` Function

**Goal:** Assemble the full `pgTable()` call from Model metadata.

### File: `packages/orm/src/dialects/postgres/toDrizzle.ts`

### Signature

```typescript
export const toDrizzle = <M extends ModelWithMeta>(
  model: M
): PgTableWithColumns<{
  name: /* derived table name */;
  schema: undefined;
  columns: /* DrizzleTypedBuildersFor result */;
  dialect: "pg";
}> => { ... }
```

Where `ModelWithMeta` is the constraint for classes produced by `pg.Model` -- they must have the static metadata registry and field definitions.

### Implementation Outline

```typescript
export const toDrizzle = (model: ModelWithMeta) => {
  // 1. Derive table name
  const tableName = model._tableName ?? (model._prefix + snakeCase(model.identifier))

  // 2. Collect field metadata
  const fieldMeta: Map<string, FieldMeta> = model[FieldMetaSymbol]

  // 3. Enum cache for deduplication
  const enumCache = new Map<string, pg.PgEnum<any>>()

  // 4. Build column record
  const columns: Record<string, AnyPgColumnBuilder> = {}

  for (const [fieldName, meta] of fieldMeta) {
    if (!meta.column) continue  // skip non-column fields (pure relation fields)

    const colMeta = meta.column
    const colName = snakeCase(fieldName)  // camelCase field -> snake_case column

    // 4a. Get the field's Schema AST for nullability analysis
    const fieldAST = getFieldAST(model, fieldName)

    // 4b. Dispatch to create base builder
    let builder: AnyPgColumnBuilder
    if (colMeta.columnType === "enum") {
      const pgEnumObj = getOrCreateEnum(enumCache, colMeta.enumName!, colMeta.enumValues!)
      builder = pgEnumObj(colName)
    } else {
      const factory = columnDispatch[colMeta.columnType]
      if (!factory) throw new Error(`Unknown column type: ${colMeta.columnType}`)
      builder = factory(colName, colMeta)
    }

    // 4c. Apply constraints
    const isSerial = colMeta.columnType === "serial"
      || colMeta.columnType === "smallserial"
      || colMeta.columnType === "bigserial"

    builder = applyConstraints(builder, colMeta, fieldAST, isSerial)

    columns[fieldName] = builder
  }

  // 5. Create pgTable
  return pg.pgTable(tableName, columns) as any
}
```

### Table Name Derivation

The table name is: `prefix + snakeCase(identifier)`, unless overridden by `tableName` in the Model constructor config.

Snake-case conversion uses lodash-style splitting:
- `HTTPClient` -> `http_client`
- `UserProfile` -> `user_profile`
- `User` -> `user`
- `IAMPolicy` -> `iam_policy`

Implement or import a `snakeCase` utility. Consider reusing a well-tested implementation from a dependency or writing a minimal one.

### Getting Field AST

To get the Schema AST for a field, you need to access the Model's field definitions. The Model class (from `Model.Class`) exposes field schemas. The approach depends on the Phase 2 API:

```typescript
const getFieldAST = (model: ModelWithMeta, fieldName: string): SchemaAST.AST => {
  // Option A: model.fields[fieldName] is a Schema, access .ast
  const field = model.fields[fieldName]

  // If it's a VariantSchema Field, get the "select" variant schema's AST
  if ("schemas" in field) {
    const selectSchema = field.schemas.select
    return extractAST(selectSchema)
  }

  // If it's a plain Schema
  return field.ast
}
```

The exact access pattern depends on how Phase 2 stores field definitions. Adapt accordingly after reading Phase 2 output.

### Column Name Mapping

Field names in the Model (camelCase) map to column names in the database (snake_case). This mapping is straightforward:
- `createdAt` -> `created_at`
- `organizationId` -> `organization_id`
- `id` -> `id`

The mapping could be overridable per-column via `ColumnMeta.columnName`, but the default is `snakeCase(fieldName)`.

---

## 10. Step 7: Transform Bridge

**Goal:** When `ColumnMeta.transform` is present, integrate the encode/decode functions into the Drizzle column.

### When Transform is Needed

A transform bridges the gap between the column's driver type (what Drizzle/the DB driver produces) and the Schema's Encoded type (what the Effect Schema expects as input for decoding).

Example:
- Column: `pg.Column.timestamp()` -- driver type is `Date`
- Schema: `DateTimeUtcFromString` -- Encoded type is `string`
- Transform: `{ decode: (d: Date) => d.toISOString(), encode: (s: string) => new Date(s) }`

### Drizzle's `customType` for Transform Integration

Drizzle provides `customType()` for columns with custom serialization. However, for standard column types with transforms, a better approach is to use Drizzle's `mapFromDriverValue` and `mapToDriverValue` overrides. But those are internal to column classes, not public API.

**Recommended approach:** Use `.$type<TransformOutput>()` for the type bridge and handle the actual transform at the SQL/query execution layer (in `SqlModel.makeRepository` or an Effect-level middleware). The transform functions are stored on `ColumnMeta` and consumed by the Effect SQL integration, not by Drizzle directly.

**Rationale:** Drizzle's job is DDL and query building. The actual decode/encode transform happens in the Effect pipeline:

```
DB row -> Drizzle deserializes (via driver) -> Column.transform.decode -> Schema.Encoded -> Schema.decode -> Schema.Type
```

The `toDrizzle()` function only needs to ensure the Drizzle table's column types match what the transform pipeline expects. The `.$type<T>()` call handles this at the type level.

### If Transform Must Be Applied at the Drizzle Level

If the consumer needs Drizzle queries to return the transformed type (e.g., for standalone Drizzle usage without Effect), then use `customType()`:

```typescript
if (colMeta.transform) {
  builder = pg.customType<{
    data: TransformedType;
    driverData: DriverType;
  }>({
    dataType: () => colMeta.sqlType,
    fromDriver: colMeta.transform.decode,
    toDriver: colMeta.transform.encode,
  })(colName)
}
```

This is an advanced path. Implement the basic `.$type<T>()` approach first, then add `customType` support if needed.

---

## 11. Step 8: Tests

### File: `packages/orm/test/toDrizzle.test.ts`

### Test Categories

#### Category 1: Basic Column Type Derivation

For each column type, verify that `toDrizzle()` produces the correct Drizzle builder type:

```typescript
describe("toDrizzle column dispatch", () => {
  it("derives integer column", () => {
    class TestModel extends pg.Model<TestModel>("Test")({
      count: pipe(Schema.Number, pg.Column.integer()),
    }) {}

    const table = toDrizzle(TestModel)
    // Assert column exists, correct SQL type
  })

  it("derives bigint with mode='number'", () => {
    class TestModel extends pg.Model<TestModel>("Test")({
      score: pipe(Schema.Number, pg.Column.bigint({ mode: "number" })),
    }) {}

    const table = toDrizzle(TestModel)
    // Assert PgBigInt53 column type
  })

  // ... one test per column type
})
```

#### Category 2: Nullability from Schema AST

```typescript
describe("toDrizzle nullability", () => {
  it("non-nullable field -> notNull column", () => {
    class TestModel extends pg.Model<TestModel>("Test")({
      name: pipe(Schema.String, pg.Column.text()),
    }) {}

    const table = toDrizzle(TestModel)
    // Assert column has notNull: true
  })

  it("NullOr field -> nullable column", () => {
    class TestModel extends pg.Model<TestModel>("Test")({
      bio: pipe(Schema.NullOr(Schema.String), pg.Column.text()),
    }) {}

    const table = toDrizzle(TestModel)
    // Assert column has notNull: false
  })

  it("optional field -> nullable column", () => {
    class TestModel extends pg.Model<TestModel>("Test")({
      nickname: pipe(Schema.optional(Schema.String), pg.Column.text()),
    }) {}

    const table = toDrizzle(TestModel)
    // Assert column has notNull: false
  })

  it("serial column -> notNull regardless of schema", () => {
    class TestModel extends pg.Model<TestModel>("Test")({
      id: pipe(Schema.Number, pg.Column.serial()),
    }) {}

    const table = toDrizzle(TestModel)
    // Assert serial columns always notNull + hasDefault
  })
})
```

#### Category 3: Constraint Application

```typescript
describe("toDrizzle constraints", () => {
  it("primaryKey flag", () => { /* ... */ })
  it("unique flag", () => { /* ... */ })
  it("default value", () => { /* ... */ })
  it("defaultFn", () => { /* ... */ })
})
```

#### Category 4: Table Name Derivation

```typescript
describe("toDrizzle table name", () => {
  it("applies prefix + snakeCase", () => {
    // pg factory with prefix "app_", model identifier "UserProfile"
    // -> table name "app_user_profile"
  })

  it("allows tableName override", () => {
    // Model with explicit tableName
    // -> uses override instead of derived name
  })
})
```

#### Category 5: Enum Handling

```typescript
describe("toDrizzle enum", () => {
  it("creates pgEnum and uses it as column", () => {
    class TestModel extends pg.Model<TestModel>("Test")({
      status: pipe(Schema.Literal("active", "inactive"), pg.Column.enum({
        enumName: "test_status",
        values: ["active", "inactive"],
      })),
    }) {}

    const table = toDrizzle(TestModel)
    // Assert enum column with correct values
  })

  it("deduplicates shared enum types", () => {
    // Two fields using the same enumName
    // -> only one pgEnum object created
  })
})
```

#### Category 6: Type-Level Verification

```typescript
describe("toDrizzle type safety", () => {
  it("$inferSelect matches Schema.Encoded types", () => {
    class User extends pg.Model<User>("User")({
      id: pipe(Schema.String.pipe(Schema.brand("UserId")), pg.Column.uuid()),
      name: pipe(Schema.String, pg.Column.text()),
      score: pipe(Schema.Number, pg.Column.bigint({ mode: "number" })),
    }) {}

    const table = toDrizzle(User)
    type SelectType = typeof table.$inferSelect

    // Type-level assertions (these are compile-time checks):
    // SelectType.id should be string (the Encoded type of branded string is string)
    // SelectType.name should be string
    // SelectType.score should be number
    const _proof: SelectType = { id: "uuid-here", name: "Alice", score: 42 }
    void _proof
  })
})
```

#### Category 7: Full Model Round-Trip

```typescript
describe("toDrizzle full model", () => {
  it("complete User model produces valid Drizzle table", () => {
    class User extends pg.Model<User>("User")({
      id: pipe(Model.Generated(UserId), pg.Column.uuid({ primaryKey: true })),
      name: pipe(Schema.NonEmptyString, pg.Column.text()),
      email: pipe(Schema.NonEmptyString, pg.Column.varchar({ length: 255 })),
      active: pipe(Schema.Boolean, pg.Column.boolean()),
      score: pipe(Schema.NullOr(Schema.Number), pg.Column.bigint({ mode: "number" })),
      metadata: pipe(Schema.Unknown, pg.Column.jsonb()),
      createdAt: pipe(Model.DateTimeInsertFromDate, pg.Column.timestamp({ withTimezone: true })),
    }) {}

    const table = toDrizzle(User)

    // Verify table name
    expect(table[Symbol.for("drizzle:Name")]).toBe("app_user")

    // Verify each column exists and has correct config
    // (access internals via Drizzle's table symbol or column properties)
  })
})
```

---

## 12. Gates

### Typecheck

```bash
cd packages/orm && npx tsc --noEmit
```

This must pass with zero errors. No `any` casts, no `@ts-ignore`, no `@ts-expect-error`.

### Tests

```bash
cd packages/orm && npx vitest run test/nullability.test.ts test/toDrizzle.test.ts
```

All tests must pass.

### Existing Tests Must Not Break

```bash
cd packages/orm && npx vitest run
```

The existing `drizzle-proof.test.ts` and any Phase 1/2 tests must continue to pass.

---

## 13. Architecture Decisions

### AD-1: Nullability from AST, Not Metadata

**Decision:** Column nullability is derived exclusively from the Schema AST at `toDrizzle()` time. There is no `nullable` or `notNull` field on `ColumnMeta`.

**Rationale:** The Schema IS the source of truth for the data shape. A `Schema.NullOr(Schema.String)` field is nullable by definition. Duplicating this as metadata would create a synchronization hazard (Schema says nullable, metadata says notNull -- which wins?). By deriving from AST, the answer is always consistent.

**Consequence:** The `isNullable()` function must be correct and exhaustive. It must handle all AST node types. Any bug in nullability detection propagates to all derived tables.

### AD-2: v4 AST Encoding Chain Following

**Decision:** The nullability inspector follows the `encoding` chain on AST nodes to analyze the encoded (database) side.

**Rationale:** In v4, transformations are not separate AST nodes -- they are `Link` chains on the `encoding` property. `Schema.NullOr(S)` produces a Union AST directly (no encoding chain). But `Schema.OptionFromNullOr(S)` produces a decoded Schema with an encoding chain that terminates at `NullOr(S)`. Following the chain is necessary to correctly detect nullability for these transformation-based schemas.

### AD-3: `stripUndefined` for exactOptionalPropertyTypes

**Decision:** Use a `stripUndefined` utility to clean config objects before passing them to Drizzle column factories.

**Rationale:** With `exactOptionalPropertyTypes: true` in tsconfig, `{ precision: undefined }` is NOT assignable to `{ precision?: number }`. Drizzle's config types use optional properties. Our ColumnMeta may have `undefined` values for unset config fields. `stripUndefined` bridges this gap.

### AD-4: Enum Deduplication via Cache

**Decision:** `toDrizzle()` maintains a local `Map<string, PgEnum>` cache to deduplicate `pgEnum()` calls for columns sharing the same `enumName`.

**Rationale:** Creating duplicate `pgEnum` objects with the same name would cause Drizzle Kit migration issues. The cache ensures each enum name produces exactly one `pgEnum` object per `toDrizzle()` call.

### AD-5: `.$type<T>()` for Type Bridge, Not `customType`

**Decision:** Use `.$type<EncodedType>()` on standard column builders for the type bridge. Reserve `customType()` for actual custom SQL types and Column.transform scenarios where the transform must execute at the Drizzle level.

**Rationale:** `.$type<T>()` is a zero-cost type-level cast (returns `this` at runtime). It is the correct tool for telling Drizzle "this column's TypeScript type is T" without changing the SQL DDL or serialization behavior. `customType()` is heavier -- it creates a new column class with custom serialization. Use it only when serialization customization is actually needed.

### AD-6: Column Name Derivation via snakeCase

**Decision:** Column names default to `snakeCase(fieldName)`. Override via `ColumnMeta.columnName` if present.

**Rationale:** JavaScript convention is camelCase. SQL convention is snake_case. Automatic conversion reduces boilerplate. Override support handles edge cases (acronyms, legacy schemas).

### AD-7: Serial Detection by columnType Tag

**Decision:** Serial columns (`serial`, `smallserial`, `bigserial`) are detected by checking `ColumnMeta.columnType` and skipped for `.notNull()` application.

**Rationale:** Drizzle's serial builders already set `notNull: true` and `hasDefault: true` internally. Calling `.notNull()` on them is redundant and could cause issues. The detection is simple and reliable.

---

## 14. Reference Files

| Path | Purpose |
|------|---------|
| `packages/orm/src/dialects/postgres/columns.ts` | Column factory functions, `_tag` values |
| `packages/orm/test/drizzle-proof.test.ts` | Validated dispatch patterns |
| `.repos/drizzle-orm/drizzle-orm/src/pg-core/table.ts` | `pgTable()` implementation |
| `.repos/drizzle-orm/drizzle-orm/src/pg-core/columns/common.ts` | Builder base class, chain methods |
| `.repos/drizzle-orm/drizzle-orm/src/pg-core/columns/bigint.ts` | Mode-based dispatch reference |
| `.repos/drizzle-orm/drizzle-orm/src/pg-core/columns/timestamp.ts` | Config forwarding reference |
| `.repos/drizzle-orm/drizzle-orm/src/pg-core/columns/enum.ts` | `pgEnum()` factory reference |
| `.repos/drizzle-orm/drizzle-orm/src/pg-core/columns/varchar.ts` | Length + enum config reference |
| `.repos/effect-smol/packages/effect/src/SchemaAST.ts` | v4 AST node types |
| `.repos/effect-smol/packages/effect/src/Schema.ts` | `NullOr`, `optional`, `UndefinedOr` |
| `.repos/beep-effect/.../nullability.ts` | v3 nullability reference (adapt for v4) |
| `.repos/beep-effect/.../adapters/drizzle.ts` | v3 toDrizzle reference |
| `specs/pending/effect-orm/DESIGN.md` | Authoritative design document |

---

## 15. Checklist

Before marking Phase 3 as complete, verify:

- [ ] `isNullable()` handles all 20 v4 AST node types exhaustively
- [ ] `isNullable()` follows encoding chains correctly
- [ ] `isNullable()` has cycle protection for `Suspend` (recursive schemas)
- [ ] Column dispatcher covers all 34+ PostgreSQL column types
- [ ] `stripUndefined` correctly removes undefined values
- [ ] `toTimestampConfig` correctly forwards precision/withTimezone
- [ ] Serial columns skip `.notNull()` application
- [ ] Enum columns create `pgEnum` objects and deduplicate by name
- [ ] Table name derives from `prefix + snakeCase(identifier)`
- [ ] Table name override via `tableName` config works
- [ ] Column names derive from `snakeCase(fieldName)`
- [ ] `.primaryKey()`, `.unique()`, `.default()`, `.$defaultFn()` applied correctly
- [ ] `.$type<T>()` uses Schema's Encoded type
- [ ] All nullability tests pass
- [ ] All column dispatch tests pass
- [ ] All constraint tests pass
- [ ] Full model round-trip tests pass
- [ ] Type-level `$inferSelect` matches expected types
- [ ] Existing `drizzle-proof.test.ts` still passes
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] No `any` casts, no `@ts-ignore`, no `@ts-expect-error`
