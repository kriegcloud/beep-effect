# Phase 1: FieldMeta Schemas & Column Pipe Steps

> Status: **PENDING**
> Depends on: Column Type System (COMPLETE), Utility Layer (COMPLETE), Literals (COMPLETE)
> Unlocks: Phase 2 (Model.Class Extension), Phase 3 (toDrizzle Derivation)

---

## 1. Overview

Phase 1 establishes the foundational data structures and pipe-step functions that connect Effect Schemas to column-level database metadata. It transforms the existing Column factory (which produces plain tagged union objects) into pipe-step functions that wrap Schema fields with immutable `FieldMeta` descriptors.

After this phase is complete, a field definition will look like:

```typescript
import { pipe } from "effect"
import * as S from "effect/Schema"

const field = pipe(
  S.String,
  pg.Column.uuid({ primaryKey: true })
)
```

The result is an immutable descriptor carrying:
1. The original Schema (or Model field helper output) -- unchanged, passthrough
2. A `FieldMeta` record containing `ColumnMeta` (column type, constraints, defaults, transforms)

This phase does NOT implement `Model.Class` extension, `toDrizzle()` derivation, relations, or indexes. It builds the metadata layer that those phases consume.

**Why it is foundational:** Every subsequent phase reads `FieldMeta`. The `Model.Class` extension (Phase 2) stores `FieldMeta` in the static registry. The `toDrizzle()` function (Phase 3) reads `ColumnMeta` to select Drizzle column builders. If the descriptor shape is wrong, everything downstream breaks.

---

## 2. Prerequisites

Before implementing, read and understand these files:

### Existing ORM Source (packages/orm/)

| File | What to understand |
|---|---|
| `packages/orm/src/dialects/postgres/columns.ts` | The 12 column type categories, tagged unions, `Column` factory namespace with 33 constructors, `CaseMember` helper type, driver type conditionals (`BigintDriverType<M>`, etc.) |
| `packages/orm/src/Literals.ts` | `IndexMetaLiteral`, `IndexMeta`, `RelationActionLiteral`, `DialectLiteral` -- these are already defined and should be reused |
| `packages/orm/src/utils/StringLiteralKit.ts` | The `StringLiteralKit` utility used to define literal unions with `is` guards and `Enum` objects |
| `packages/orm/src/utils/index.ts` | Current utility exports |
| `packages/orm/test/column-factory.test.ts` | 61 tests covering factory constructors, generic mode inference, driver type mappings |
| `packages/orm/test/drizzle-proof.test.ts` | 31 tests proving Column -> Drizzle type flow, mode generics, enum tuple preservation |

### Effect v4 Source (.repos/effect-smol/)

| File | What to understand |
|---|---|
| `.repos/effect-smol/packages/effect/src/unstable/schema/Model.ts` | `Model.Class`, `Generated`, `GeneratedByApp`, `Sensitive`, `FieldOption`, `Field`, `fieldEvolve` -- how variant schemas work |
| `.repos/effect-smol/packages/effect/src/unstable/schema/VariantSchema.ts` | `VariantSchema.Field`, `VariantSchema.Struct`, `isField`, `isStruct` -- the `Field` has a `schemas` property holding variant configs |
| `.repos/effect-smol/packages/effect/src/Schema.ts` | `Schema.Top` (the base schema type in v4), `Schema.Struct`, `Schema.Struct.Fields` |

### Drizzle ORM Source (.repos/drizzle-orm/)

| File | What to understand |
|---|---|
| `.repos/drizzle-orm/drizzle-orm/src/pg-core/columns/common.ts` | `PgColumnBuilderConfig` (lines 29-44), `PgColumnBuilderRuntimeConfig` (lines 46-63), `PgColumnBaseConfig` (lines 66-81) -- these define the fields our `ColumnMeta` must capture |
| `.repos/drizzle-orm/drizzle-orm/src/pg-core/columns/common.ts` | Chain methods on `PgColumnBuilder`: `.notNull()`, `.default()`, `.$defaultFn()`, `.$onUpdateFn()`, `.primaryKey()`, `.unique()`, `.generatedAlwaysAs()`, `.array()`, `.$type<T>()` (lines 182-421) |
| `.repos/drizzle-orm/drizzle-orm/src/pg-core/columns/integer.ts` | Simple column pattern: `PgIntegerBuilder` constructor takes `name`, sets `dataType` and `columnType` |
| `.repos/drizzle-orm/drizzle-orm/src/pg-core/columns/bigint.ts` | Mode-based column pattern: `PgBigIntConfig<T>`, mode selects between `PgBigInt53Builder` and `PgBigInt64Builder` |
| `.repos/drizzle-orm/drizzle-orm/src/pg-core/columns/timestamp.ts` | Config-based column pattern: `PgTimestampConfig<TMode>` with `mode`, `precision`, `withTimezone` |
| `.repos/drizzle-orm/drizzle-orm/src/pg-core/columns/uuid.ts` | Simple column with extra method: `defaultRandom()` |
| `.repos/drizzle-orm/drizzle-orm/src/column-builder.ts` | `ColumnDataType` union (lines 13-20) -- the dataType string families |

### Design Doc

| File | Sections |
|---|---|
| `specs/pending/effect-orm/DESIGN.md` | Section 2.3 (Metadata Registry), Section 3.2 (Field Composition), Section 3.3 (Column Functions), Section 3.4 (Column.transform), Section 5.1-5.4 (Type System) |

### Project Config

| File | What to understand |
|---|---|
| `packages/orm/package.json` | Scripts: `build` = `tsc -b tsconfig.json`, `test` = `vitest`, `check` = `tsc -b tsconfig.json` |
| `packages/orm/tsconfig.json` | References `tsconfig.src.json` and `tsconfig.test.json` |
| `packages/orm/tsconfig.src.json` | `include: ["src"]`, `outDir: "build/src"`, `rootDir: "src"` |

---

## 3. Deliverables

### Files to Create

| File | Purpose |
|---|---|
| `packages/orm/src/FieldMeta.ts` | `FieldMeta`, `ColumnMeta`, `RelationMeta` types (plain TypeScript interfaces, NOT Effect Schemas) |
| `packages/orm/src/FieldDescriptor.ts` | `FieldDescriptor` type and constructor, the immutable wrapper carrying Schema + FieldMeta through pipes |
| `packages/orm/src/dialects/postgres/ColumnPipeSteps.ts` | Pipe-step versions of all 33 Column factory constructors, plus `transform()` |
| `packages/orm/test/field-meta.test.ts` | Tests for FieldMeta construction |
| `packages/orm/test/field-descriptor.test.ts` | Tests for FieldDescriptor creation and composition |
| `packages/orm/test/column-pipe-steps.test.ts` | Tests for all Column pipe steps, config options, pipe composition |

### Files to Modify

| File | Change |
|---|---|
| `packages/orm/src/index.ts` | Add exports for new modules |
| `packages/orm/src/dialects/postgres/columns.ts` | No changes to existing code. The existing `Column` factory and type system remain as-is. Pipe steps are a new module that imports from it. |

### Files NOT to Modify

The existing test files (`columns.test.ts`, `column-factory.test.ts`, `drizzle-proof.test.ts`) must continue passing unchanged. The pipe steps are additive -- they do not replace the existing factory.

---

## 4. Step 1: FieldMeta Type Definitions

Create `packages/orm/src/FieldMeta.ts`.

These are plain TypeScript interfaces, not Effect Schemas. They are data-only records that will be stored in the Model's static metadata registry (Phase 2). They are not decoded/encoded/validated at runtime -- they are constructed by pipe steps and read by `toDrizzle()` (Phase 3).

### ColumnMeta

```typescript
export interface ColumnMeta {
  readonly columnType: string
  readonly dataType: string
  readonly mode?: string
  readonly primaryKey?: boolean
  readonly unique?: boolean
  readonly autoIncrement?: boolean
  readonly hasDefault?: boolean
  readonly default?: unknown
  readonly defaultFn?: () => unknown
  readonly onUpdateFn?: () => unknown
  readonly generated?: unknown
  readonly identity?: "always" | "byDefault"
  readonly enumValues?: ReadonlyArray<string>
  readonly dimensions?: number
  readonly length?: number
  readonly precision?: number
  readonly scale?: number
  readonly withTimezone?: boolean
  readonly enumName?: string
  readonly srid?: number
  readonly geometryType?: string
  readonly fields?: string
  readonly transform?: ColumnTransform
}

export interface ColumnTransform {
  readonly decode: (raw: unknown) => unknown
  readonly encode: (value: unknown) => unknown
}
```

**Design notes:**

- `columnType` is the Drizzle column builder name string, e.g. `"PgInteger"`, `"PgUUID"`, `"PgTimestamp"`, `"PgBigInt53"`. This is the string Drizzle uses in its `entityKind` and constructor. It is the dispatch key for `toDrizzle()` in Phase 3.
- `dataType` is the Drizzle `ColumnDataType` string, e.g. `"number int32"`, `"string uuid"`, `"object date"`. Varies by mode.
- Column-type-specific config fields (`length`, `precision`, `scale`, `withTimezone`, `enumName`, `srid`, `geometryType`, `fields`) are hoisted to top level rather than nested, because `toDrizzle()` needs flat access to pass them into Drizzle column constructors.
- `transform` is optional. When present, `toDrizzle()` will use it in Drizzle's `mapFromDriverValue`/`mapToDriverValue` hooks.
- `mode` is stored as a plain string. The type-level narrowing happens at the pipe step function signature, not at the ColumnMeta level.

### RelationMeta

```typescript
export interface RelationMeta {
  readonly target: () => unknown
  readonly onUpdate?: "cascade" | "restrict" | "no action" | "set null" | "set default"
  readonly onDelete?: "cascade" | "restrict" | "no action" | "set null" | "set default"
}
```

**Note:** RelationMeta is defined here for completeness but is NOT used in Phase 1. It will be implemented in a later phase.

### IndexMeta

Reuse the existing `IndexMeta` from `packages/orm/src/Literals.ts`. Do NOT redefine it.

```typescript
import type { IndexMeta } from "./Literals.js"
```

### FieldMeta

```typescript
export interface FieldMeta {
  readonly column?: ColumnMeta
  readonly relation?: RelationMeta
  readonly indexes?: ReadonlyArray<IndexMeta>
}
```

### Complete file structure

```typescript
// packages/orm/src/FieldMeta.ts

import type * as S from "effect/Schema"

export interface ColumnTransform {
  readonly decode: (raw: unknown) => unknown
  readonly encode: (value: unknown) => unknown
}

export interface ColumnMeta {
  readonly columnType: string
  readonly dataType: string
  readonly mode?: string
  readonly primaryKey?: boolean
  readonly unique?: boolean
  readonly autoIncrement?: boolean
  readonly hasDefault?: boolean
  readonly default?: unknown
  readonly defaultFn?: () => unknown
  readonly onUpdateFn?: () => unknown
  readonly generated?: unknown
  readonly identity?: "always" | "byDefault"
  readonly enumValues?: ReadonlyArray<string>
  readonly dimensions?: number
  readonly length?: number
  readonly precision?: number
  readonly scale?: number
  readonly withTimezone?: boolean
  readonly enumName?: string
  readonly srid?: number
  readonly geometryType?: string
  readonly fields?: string
  readonly transform?: ColumnTransform
}

export interface RelationMeta {
  readonly target: () => unknown
  readonly onUpdate?: "cascade" | "restrict" | "no action" | "set null" | "set default"
  readonly onDelete?: "cascade" | "restrict" | "no action" | "set null" | "set default"
}

export interface FieldMeta {
  readonly column?: ColumnMeta
  readonly relation?: RelationMeta
  readonly indexes?: ReadonlyArray<import("./Literals.js").IndexMeta>
}
```

---

## 5. Step 2: Field Descriptor Type

Create `packages/orm/src/FieldDescriptor.ts`.

A `FieldDescriptor` is the immutable value that flows through pipe chains. It wraps either a plain `Schema.Top`, a `VariantSchema.Field`, or a `VariantSchema.Struct` (i.e., anything that can appear as a value in a `Model.Class` field definition) together with a `FieldMeta`.

### The key constraint

The descriptor must be usable in place of the original Schema/Field in the `Model.Class` field definitions. This means it must satisfy the `Schema.Struct.Fields` value type:

```typescript
// From VariantSchema.ts:
type Fields = {
  readonly [key: string]:
    | Schema.Top
    | Field<any>
    | Struct<any>
    | undefined
}
```

So a FieldDescriptor must look like one of `Schema.Top | VariantSchema.Field<any> | VariantSchema.Struct<any>` to the Model.Class constructor, while also carrying `FieldMeta` metadata.

### Design: Brand + property attachment

The descriptor attaches `FieldMeta` as a branded property on the original schema/field value. This way, the value IS still a `Schema.Top` or `VariantSchema.Field`, so it passes through `Model.Class` unchanged. The metadata is extracted separately by Phase 2's Model extension.

```typescript
// packages/orm/src/FieldDescriptor.ts

import type { FieldMeta, ColumnMeta } from "./FieldMeta.js"

export const FieldMetaSymbol: unique symbol = Symbol.for(
  "@beep/effect-orm/FieldMeta"
)
export type FieldMetaSymbol = typeof FieldMetaSymbol

export interface WithFieldMeta {
  readonly [FieldMetaSymbol]: FieldMeta
}

export const getFieldMeta = (value: unknown): FieldMeta | undefined => {
  if (
    typeof value === "object" &&
    value !== null &&
    FieldMetaSymbol in value
  ) {
    return (value as WithFieldMeta)[FieldMetaSymbol]
  }
  return undefined
}

export const attachFieldMeta = <T>(value: T, meta: FieldMeta): T & WithFieldMeta => {
  const patched = Object.create(
    Object.getPrototypeOf(value),
    Object.getOwnPropertyDescriptors(value)
  )
  Object.defineProperty(patched, FieldMetaSymbol, {
    value: meta,
    enumerable: false,
    writable: false,
    configurable: false
  })
  return patched as T & WithFieldMeta
}

export const mergeFieldMeta = (
  existing: FieldMeta | undefined,
  patch: Partial<FieldMeta>
): FieldMeta => ({
  ...existing,
  ...patch,
  column: patch.column
    ? { ...existing?.column, ...patch.column }
    : existing?.column,
  indexes: patch.indexes
    ? [...(existing?.indexes ?? []), ...patch.indexes]
    : existing?.indexes,
})
```

### Why `Object.create` + property descriptors

Schema objects in Effect v4 are complex -- they have prototype chains, symbols, and non-enumerable properties. A naive spread `{ ...schema, [FieldMetaSymbol]: meta }` would lose the prototype, breaking `instanceof` checks and prototype methods. `Object.create` preserves the full prototype chain while adding our symbol.

### Why a Symbol property instead of a wrapper type

If we wrapped the schema in a container `{ schema: S, meta: FieldMeta }`, the Model.Class constructor would see the wrapper, not the schema. It would fail type checking for `Schema.Struct.Fields`. By attaching metadata as a non-enumerable symbol property, the value remains the original schema/field for all practical purposes. Model.Class never sees the metadata. Our Phase 2 Model extension reads it via `getFieldMeta()`.

### Why not use Effect `Brand`

Effect's Brand system is for type-level tagging of decoded values. Our symbol property is for runtime metadata attachment on schema definition objects. Different use case, different mechanism.

### `attachFieldMeta` on VariantSchema.Field values

`VariantSchema.Field` values (like the output of `Model.Generated(schema)`) are objects with a `[FieldTypeId]` symbol and a `schemas` property. They also implement `Pipeable`. The same `Object.create` approach works -- we create a shallow clone with the added symbol.

Test this explicitly (Step 8 covers this).

---

## 6. Step 3: Column Pipe Step Functions

Create `packages/orm/src/dialects/postgres/ColumnPipeSteps.ts`.

Each pipe step is a function that:
1. Takes column-specific config (same as the existing factory, plus common config like `primaryKey`, `unique`, `default`, etc.)
2. Returns a function `(input: T) => T & WithFieldMeta` -- a pipe-compatible step

The input `T` is whatever the previous pipe step produced: a `Schema.Top`, a `VariantSchema.Field`, or an already-branded `T & WithFieldMeta`.

### Imports

```typescript
import { type FieldMeta, type ColumnMeta } from "../../FieldMeta.js"
import { attachFieldMeta, getFieldMeta, mergeFieldMeta, type WithFieldMeta } from "../../FieldDescriptor.js"
import {
  type CaseMember,
  IntegerColumnType,
  FloatingPointColumnType,
  CharacterColumnType,
  BooleanColumnType,
  DateTimeColumnType,
  JsonColumnType,
  BinaryColumnType,
  UuidColumnType,
  NetworkColumnType,
  GeometricColumnType,
  VectorColumnType,
  EnumColumnType,
} from "./columns.js"
```

### Common config type

```typescript
interface ColumnCommonConfig {
  readonly primaryKey?: boolean
  readonly unique?: boolean
  readonly default?: unknown
  readonly defaultFn?: () => unknown
  readonly onUpdateFn?: () => unknown
  readonly identity?: "always" | "byDefault"
  readonly generated?: unknown
}
```

This is merged into every column-specific config type via intersection.

### Pattern: Simple column (no mode, no extra config)

Example: `integer`, `smallint`, `serial`, `smallserial`, `text`, `boolean`, `bytea`, `uuid`, `inet`, `cidr`, `macaddr`, `macaddr8`, `point`, `line`

```typescript
export const integer = (
  config?: ColumnCommonConfig
) => <T>(input: T): T & WithFieldMeta => {
  const existing = getFieldMeta(input)
  const columnMeta: ColumnMeta = {
    columnType: "PgInteger",
    dataType: "number int32",
    ...extractCommonConfig(config),
  }
  return attachFieldMeta(input, mergeFieldMeta(existing, { column: columnMeta }))
}
```

Where `extractCommonConfig` is a helper:

```typescript
const extractCommonConfig = (config?: ColumnCommonConfig): Partial<ColumnMeta> => {
  if (!config) return {}
  const result: Record<string, unknown> = {}
  if (config.primaryKey !== undefined) result.primaryKey = config.primaryKey
  if (config.unique !== undefined) result.unique = config.unique
  if (config.default !== undefined) {
    result.default = config.default
    result.hasDefault = true
  }
  if (config.defaultFn !== undefined) {
    result.defaultFn = config.defaultFn
    result.hasDefault = true
  }
  if (config.onUpdateFn !== undefined) {
    result.onUpdateFn = config.onUpdateFn
    result.hasDefault = true
  }
  if (config.identity !== undefined) result.identity = config.identity
  if (config.generated !== undefined) result.generated = config.generated
  return result as Partial<ColumnMeta>
}
```

### Pattern: Mode-based column

Example: `bigint`, `bigserial`, `numeric`, `date`, `timestamp`, `json`, `jsonb`

These accept a `mode` generic that narrows the dataType.

```typescript
export const bigint = <M extends "bigint" | "number" = "bigint">(
  config?: { readonly mode?: M } & ColumnCommonConfig
) => <T>(input: T): T & WithFieldMeta => {
  const existing = getFieldMeta(input)
  const mode = (config?.mode ?? "bigint") as M
  const columnMeta: ColumnMeta = {
    columnType: mode === "number" ? "PgBigInt53" : "PgBigInt64",
    dataType: mode === "number" ? "number int53" : "bigint int64",
    mode,
    ...extractCommonConfig(config),
  }
  return attachFieldMeta(input, mergeFieldMeta(existing, { column: columnMeta }))
}
```

### Pattern: Config-based column

Example: `varchar`, `char`, `numeric`, `timestamp`, `time`, `interval`, `geometry`, `vector`, `halfvec`, `sparsevec`, `bit`

These accept extra config fields beyond mode/common.

```typescript
export const varchar = (
  config?: { readonly length?: number } & ColumnCommonConfig
) => <T>(input: T): T & WithFieldMeta => {
  const existing = getFieldMeta(input)
  const columnMeta: ColumnMeta = {
    columnType: "PgVarchar",
    dataType: "string",
    ...config?.length !== undefined ? { length: config.length } : {},
    ...extractCommonConfig(config),
  }
  return attachFieldMeta(input, mergeFieldMeta(existing, { column: columnMeta }))
}

export const timestamp = <M extends "date" | "string" = "date">(
  config?: {
    readonly precision?: number
    readonly withTimezone?: boolean
    readonly mode?: M
  } & ColumnCommonConfig
) => <T>(input: T): T & WithFieldMeta => {
  const existing = getFieldMeta(input)
  const mode = (config?.mode ?? "date") as M
  const columnMeta: ColumnMeta = {
    columnType: mode === "string" ? "PgTimestampString" : "PgTimestamp",
    dataType: mode === "string" ? "string timestamp" : "object date",
    mode,
    ...(config?.precision !== undefined ? { precision: config.precision } : {}),
    ...(config?.withTimezone !== undefined ? { withTimezone: config.withTimezone } : {}),
    ...extractCommonConfig(config),
  }
  return attachFieldMeta(input, mergeFieldMeta(existing, { column: columnMeta }))
}
```

### Pattern: Enum column

```typescript
export const pgEnum = <const V extends readonly [string, ...string[]]>(
  config: {
    readonly enumName: string
    readonly values: V
  } & ColumnCommonConfig
) => <T>(input: T): T & WithFieldMeta => {
  const existing = getFieldMeta(input)
  const columnMeta: ColumnMeta = {
    columnType: "PgEnumColumn",
    dataType: "string enum",
    enumName: config.enumName,
    enumValues: config.values as unknown as ReadonlyArray<string>,
    ...extractCommonConfig(config),
  }
  return attachFieldMeta(input, mergeFieldMeta(existing, { column: columnMeta }))
}
```

### transform() step

```typescript
export const transform = (
  config: {
    readonly decode: (raw: unknown) => unknown
    readonly encode: (value: unknown) => unknown
  }
) => <T>(input: T): T & WithFieldMeta => {
  const existing = getFieldMeta(input)
  if (!existing?.column) {
    throw new Error("transform() must be called after a Column pipe step")
  }
  const columnMeta: ColumnMeta = {
    ...existing.column,
    transform: config,
  }
  return attachFieldMeta(input, mergeFieldMeta(existing, { column: columnMeta }))
}
```

### Complete list of all 33 column pipe steps

Each maps to a Drizzle `columnType` string and `dataType` string. The table below is the authoritative reference for implementers.

| Pipe Step | Drizzle columnType | Drizzle dataType | Extra Config | Mode Generic |
|---|---|---|---|---|
| `integer(config?)` | `"PgInteger"` | `"number int32"` | -- | -- |
| `smallint(config?)` | `"PgSmallInt"` | `"number int16"` | -- | -- |
| `bigint(config?)` | `"PgBigInt53"` / `"PgBigInt64"` | `"number int53"` / `"bigint int64"` | -- | `M extends "bigint" \| "number"` |
| `serial(config?)` | `"PgSerial"` | `"number int32"` | auto `autoIncrement: true, hasDefault: true` | -- |
| `smallserial(config?)` | `"PgSmallSerial"` | `"number int16"` | auto `autoIncrement: true, hasDefault: true` | -- |
| `bigserial(config?)` | `"PgBigSerial53"` / `"PgBigSerial64"` | `"number int53"` / `"bigint int64"` | auto `autoIncrement: true, hasDefault: true` | `M extends "bigint" \| "number"` |
| `real(config?)` | `"PgReal"` | `"number float"` | -- | -- |
| `doublePrecision(config?)` | `"PgDoublePrecision"` | `"number double"` | -- | -- |
| `numeric(config?)` | `"PgNumeric"` / `"PgNumericNumber"` | `"string numeric"` / `"number"` | `precision?, scale?` | `M extends "string" \| "number"` |
| `text(config?)` | `"PgText"` | `"string"` | -- | -- |
| `varchar(config?)` | `"PgVarchar"` | `"string"` | `length?` | -- |
| `char(config?)` | `"PgChar"` | `"string"` | `length?` | -- |
| `boolean(config?)` | `"PgBoolean"` | `"boolean"` | -- | -- |
| `date(config?)` | `"PgDate"` / `"PgDateString"` | `"object date"` / `"string date"` | -- | `M extends "date" \| "string"` |
| `time(config?)` | `"PgTime"` | `"string time"` | `precision?` | -- |
| `timestamp(config?)` | `"PgTimestamp"` / `"PgTimestampString"` | `"object date"` / `"string timestamp"` | `precision?, withTimezone?` | `M extends "date" \| "string"` |
| `interval(config?)` | `"PgInterval"` | `"string interval"` | `fields?` | -- |
| `json(config?)` | `"PgJson"` | `"object json"` / `"string"` | -- | `M extends "json" \| "text"` |
| `jsonb(config?)` | `"PgJsonb"` | `"object json"` / `"string"` | -- | `M extends "json" \| "text"` |
| `bytea(config?)` | `"PgBytea"` | `"object buffer"` | -- | -- |
| `uuid(config?)` | `"PgUUID"` | `"string uuid"` | -- | -- |
| `inet(config?)` | `"PgInet"` | `"string inet"` | -- | -- |
| `cidr(config?)` | `"PgCidr"` | `"string cidr"` | -- | -- |
| `macaddr(config?)` | `"PgMacaddr"` | `"string macaddr"` | -- | -- |
| `macaddr8(config?)` | `"PgMacaddr8"` | `"string macaddr8"` | -- | -- |
| `point(config?)` | `"PgPointTuple"` | `"array point"` | -- | -- |
| `line(config?)` | `"PgLine"` | `"array line"` | -- | -- |
| `geometry(config?)` | `"PgGeometry"` | `"array geometry"` | `srid?, geometryType?` | -- |
| `vector(config)` | `"PgVector"` | `"array vector"` | `dimensions` (required) | -- |
| `halfvec(config)` | `"PgHalfVector"` | `"array halfvector"` | `dimensions` (required) | -- |
| `sparsevec(config)` | `"PgSparseVector"` | `"string sparsevec"` | `dimensions` (required) | -- |
| `bit(config)` | `"PgBinaryVector"` | `"string binary"` | `length` (required) | -- |
| `pgEnum(config)` | `"PgEnumColumn"` | `"string enum"` | `enumName, values` (required) | `V extends readonly [string, ...string[]]` |
| `transform(config)` | (modifies existing) | (modifies existing) | `decode, encode` (required) | -- |

**IMPORTANT:** The exact `columnType` and `dataType` strings above must match what Drizzle uses internally. Cross-reference with the Drizzle source files listed in Section 2. The `columnType` values come from the `entityKind` static property on each column builder class. The `dataType` values come from the first argument to the `PgColumnBuilder` constructor (see each column file's constructor call).

To verify a `columnType`: look at the `static override readonly [entityKind]: string = 'XxxBuilder'` line in each Drizzle column file.

To verify a `dataType`: look at the second argument passed to `super(name, <dataType>, <columnType>)` in each builder's constructor.

---

## 7. Step 4: Column Configuration Details

### Serial types auto-set flags

`serial`, `smallserial`, and `bigserial` must automatically set:
- `autoIncrement: true`
- `hasDefault: true`

These are intrinsic properties of serial types in PostgreSQL. The user should not need to set them.

```typescript
export const serial = (
  config?: ColumnCommonConfig
) => <T>(input: T): T & WithFieldMeta => {
  const existing = getFieldMeta(input)
  const columnMeta: ColumnMeta = {
    columnType: "PgSerial",
    dataType: "number int32",
    autoIncrement: true,
    hasDefault: true,
    ...extractCommonConfig(config),
  }
  return attachFieldMeta(input, mergeFieldMeta(existing, { column: columnMeta }))
}
```

### primaryKey implies hasDefault for serial types but NOT for others

When `primaryKey: true` is set on a serial column, it is already auto-increment. When set on a uuid column, it does NOT imply hasDefault -- the user must separately specify `default` or `defaultFn`.

The `extractCommonConfig` function copies `primaryKey` as-is. It does NOT set `hasDefault` based on `primaryKey`. That inference is for `toDrizzle()` in Phase 3.

### identity config

The `identity` field supports PostgreSQL `GENERATED ALWAYS AS IDENTITY` and `GENERATED BY DEFAULT AS IDENTITY`:

```typescript
export const integer = (
  config?: ColumnCommonConfig
) => <T>(input: T): T & WithFieldMeta => {
  const existing = getFieldMeta(input)
  const columnMeta: ColumnMeta = {
    columnType: "PgInteger",
    dataType: "number int32",
    ...extractCommonConfig(config),
  }
  return attachFieldMeta(input, mergeFieldMeta(existing, { column: columnMeta }))
}

// Usage:
// pipe(Model.Generated(UserId), integer({ identity: "always" }))
```

### generated config

The `generated` field captures `GENERATED ALWAYS AS (expression) STORED`. Its value is the SQL expression (or a thunk returning SQL). Phase 3 will pass it to Drizzle's `.generatedAlwaysAs()`.

```typescript
// Usage:
// pipe(S.Number, integer({ generated: sql`col1 + col2` }))
```

For Phase 1, `generated` is `unknown`. Phase 3 will narrow it when consuming.

### dimensions (array columns)

Array column support is NOT part of Phase 1. The `dimensions` field exists on `ColumnMeta` for forward compatibility but no pipe step sets it in this phase. It will be added as an `.array()` chain method in a later phase.

### enum column: values tuple preservation

The `pgEnum` pipe step preserves the literal tuple type of `values` via `const V extends readonly [string, ...string[]]`. This is critical for type-safe enum unions downstream.

```typescript
const field = pipe(
  S.String,
  pgEnum({ enumName: "status", values: ["active", "inactive"] as const })
)
```

The `ColumnMeta.enumValues` stores the runtime array. The type-level tuple is available at the call site for Phase 3's Drizzle derivation.

---

## 8. Step 5: Column Namespace Export

Expose all pipe steps via a `Column` namespace on the postgres dialect, mirroring the existing `Column` factory pattern.

```typescript
// At the bottom of packages/orm/src/dialects/postgres/ColumnPipeSteps.ts

export const Column = {
  integer,
  smallint,
  bigint,
  serial,
  smallserial,
  bigserial,
  real,
  doublePrecision,
  numeric,
  text,
  varchar,
  char,
  boolean,
  date,
  time,
  timestamp,
  interval,
  json,
  jsonb,
  bytea,
  uuid,
  inet,
  cidr,
  macaddr,
  macaddr8,
  point,
  line,
  geometry,
  vector,
  halfvec,
  sparsevec,
  bit,
  pgEnum,
  transform,
} as const
```

---

## 9. Step 6: Update Exports

### packages/orm/src/index.ts

```typescript
export * as Literals from "./Literals.js"
export * as FieldMeta from "./FieldMeta.js"
export * as FieldDescriptor from "./FieldDescriptor.js"
```

The postgres-specific Column pipe steps are NOT re-exported from the top-level index. They will be exported from a dialect-specific entry point in a later phase. For now, tests import them directly:

```typescript
import { Column } from "../src/dialects/postgres/ColumnPipeSteps.js"
```

---

## 10. Step 7: Tests

### packages/orm/test/field-meta.test.ts

Test the FieldMeta types and construction. Since these are plain interfaces, tests verify structural correctness.

```typescript
import { describe, expect, it } from "vitest"
import type { FieldMeta, ColumnMeta, RelationMeta, ColumnTransform } from "../src/FieldMeta.js"

describe("FieldMeta types", () => {
  it("ColumnMeta holds column type information", () => {
    const meta: ColumnMeta = {
      columnType: "PgUUID",
      dataType: "string uuid",
      primaryKey: true,
    }
    expect(meta.columnType).toBe("PgUUID")
    expect(meta.dataType).toBe("string uuid")
    expect(meta.primaryKey).toBe(true)
  })

  it("ColumnMeta with mode", () => {
    const meta: ColumnMeta = {
      columnType: "PgBigInt53",
      dataType: "number int53",
      mode: "number",
    }
    expect(meta.mode).toBe("number")
  })

  it("ColumnMeta with transform", () => {
    const transform: ColumnTransform = {
      decode: (raw) => String(raw),
      encode: (value) => Number(value),
    }
    const meta: ColumnMeta = {
      columnType: "PgTimestamp",
      dataType: "object date",
      transform,
    }
    expect(meta.transform?.decode(42)).toBe("42")
    expect(meta.transform?.encode("42")).toBe(42)
  })

  it("ColumnMeta with all optional fields", () => {
    const meta: ColumnMeta = {
      columnType: "PgVarchar",
      dataType: "string",
      primaryKey: false,
      unique: true,
      autoIncrement: false,
      hasDefault: true,
      default: "hello",
      defaultFn: () => "generated",
      onUpdateFn: () => "updated",
      generated: undefined,
      identity: "always",
      enumValues: ["a", "b"],
      dimensions: 1,
      length: 255,
      precision: 10,
      scale: 2,
      withTimezone: true,
      enumName: "my_enum",
      srid: 4326,
      geometryType: "POINT",
      fields: "day to hour",
    }
    expect(meta.length).toBe(255)
    expect(meta.identity).toBe("always")
  })

  it("FieldMeta combines column, relation, and indexes", () => {
    const meta: FieldMeta = {
      column: {
        columnType: "PgUUID",
        dataType: "string uuid",
        primaryKey: true,
      },
      relation: {
        target: () => "some_ref",
        onDelete: "cascade",
      },
      indexes: [],
    }
    expect(meta.column?.primaryKey).toBe(true)
    expect(meta.relation?.onDelete).toBe("cascade")
  })

  it("FieldMeta with only column", () => {
    const meta: FieldMeta = {
      column: {
        columnType: "PgText",
        dataType: "string",
      },
    }
    expect(meta.relation).toBeUndefined()
    expect(meta.indexes).toBeUndefined()
  })
})
```

### packages/orm/test/field-descriptor.test.ts

Test that `attachFieldMeta` and `getFieldMeta` work on various input types.

```typescript
import { describe, expect, it } from "vitest"
import * as S from "effect/Schema"
import {
  attachFieldMeta,
  getFieldMeta,
  mergeFieldMeta,
  FieldMetaSymbol,
} from "../src/FieldDescriptor.js"
import type { FieldMeta, ColumnMeta } from "../src/FieldMeta.js"

describe("FieldDescriptor", () => {
  describe("attachFieldMeta", () => {
    it("attaches metadata to a Schema.String", () => {
      const meta: FieldMeta = {
        column: { columnType: "PgText", dataType: "string" },
      }
      const result = attachFieldMeta(S.String, meta)
      expect(getFieldMeta(result)).toEqual(meta)
    })

    it("preserves the original schema identity for type checking", () => {
      const meta: FieldMeta = {
        column: { columnType: "PgText", dataType: "string" },
      }
      const result = attachFieldMeta(S.String, meta)
      // The result should still decode/encode as S.String
      expect(S.decodeUnknownSync(result)("hello")).toBe("hello")
    })

    it("the FieldMetaSymbol property is non-enumerable", () => {
      const meta: FieldMeta = {
        column: { columnType: "PgText", dataType: "string" },
      }
      const result = attachFieldMeta(S.String, meta)
      expect(Object.keys(result)).not.toContain(FieldMetaSymbol.toString())
      const descriptor = Object.getOwnPropertyDescriptor(result, FieldMetaSymbol)
      expect(descriptor?.enumerable).toBe(false)
    })

    it("works with Schema.Number", () => {
      const meta: FieldMeta = {
        column: { columnType: "PgInteger", dataType: "number int32" },
      }
      const result = attachFieldMeta(S.Number, meta)
      expect(getFieldMeta(result)?.column?.columnType).toBe("PgInteger")
    })
  })

  describe("getFieldMeta", () => {
    it("returns undefined for a plain Schema (no metadata attached)", () => {
      expect(getFieldMeta(S.String)).toBeUndefined()
    })

    it("returns undefined for non-object inputs", () => {
      expect(getFieldMeta(null)).toBeUndefined()
      expect(getFieldMeta(undefined)).toBeUndefined()
      expect(getFieldMeta(42)).toBeUndefined()
      expect(getFieldMeta("hello")).toBeUndefined()
    })

    it("returns the metadata for a branded schema", () => {
      const meta: FieldMeta = {
        column: { columnType: "PgUUID", dataType: "string uuid" },
      }
      const result = attachFieldMeta(S.String, meta)
      expect(getFieldMeta(result)).toEqual(meta)
    })
  })

  describe("mergeFieldMeta", () => {
    it("merges column metadata", () => {
      const existing: FieldMeta = {
        column: { columnType: "PgUUID", dataType: "string uuid" },
      }
      const merged = mergeFieldMeta(existing, {
        column: { columnType: "PgUUID", dataType: "string uuid", primaryKey: true },
      })
      expect(merged.column?.primaryKey).toBe(true)
      expect(merged.column?.columnType).toBe("PgUUID")
    })

    it("merges from undefined", () => {
      const merged = mergeFieldMeta(undefined, {
        column: { columnType: "PgText", dataType: "string" },
      })
      expect(merged.column?.columnType).toBe("PgText")
    })

    it("appends indexes", () => {
      const existing: FieldMeta = {
        indexes: [{ _tag: "btree" as const }],
      }
      const merged = mergeFieldMeta(existing, {
        indexes: [{ _tag: "unique" as const, type: "unique" as const }],
      })
      expect(merged.indexes).toHaveLength(2)
    })
  })
})
```

### packages/orm/test/column-pipe-steps.test.ts

This is the most comprehensive test file. It verifies:
1. Every pipe step produces correct ColumnMeta
2. Common config (primaryKey, unique, default, etc.) flows through
3. Mode generics narrow columnType and dataType correctly
4. Pipe composition works (chaining Schema -> Column -> transform)
5. Serial types auto-set autoIncrement and hasDefault
6. Enum values are preserved
7. Vector dimensions are required and captured
8. transform() requires a prior Column step

```typescript
import { describe, expect, it } from "vitest"
import { pipe } from "effect"
import * as S from "effect/Schema"
import { Column } from "../src/dialects/postgres/ColumnPipeSteps.js"
import { getFieldMeta } from "../src/FieldDescriptor.js"

describe("Column pipe steps", () => {
  describe("integer types", () => {
    it("integer() produces correct ColumnMeta", () => {
      const result = pipe(S.Number, Column.integer())
      const meta = getFieldMeta(result)
      expect(meta?.column?.columnType).toBe("PgInteger")
      expect(meta?.column?.dataType).toBe("number int32")
    })

    it("smallint() produces correct ColumnMeta", () => {
      const result = pipe(S.Number, Column.smallint())
      const meta = getFieldMeta(result)
      expect(meta?.column?.columnType).toBe("PgSmallInt")
      expect(meta?.column?.dataType).toBe("number int16")
    })

    it("bigint() defaults to bigint mode", () => {
      const result = pipe(S.BigIntFromSelf, Column.bigint())
      const meta = getFieldMeta(result)
      expect(meta?.column?.columnType).toBe("PgBigInt64")
      expect(meta?.column?.dataType).toBe("bigint int64")
      expect(meta?.column?.mode).toBe("bigint")
    })

    it("bigint({ mode: 'number' }) narrows to PgBigInt53", () => {
      const result = pipe(S.Number, Column.bigint({ mode: "number" }))
      const meta = getFieldMeta(result)
      expect(meta?.column?.columnType).toBe("PgBigInt53")
      expect(meta?.column?.dataType).toBe("number int53")
      expect(meta?.column?.mode).toBe("number")
    })

    it("serial() auto-sets autoIncrement and hasDefault", () => {
      const result = pipe(S.Number, Column.serial())
      const meta = getFieldMeta(result)
      expect(meta?.column?.columnType).toBe("PgSerial")
      expect(meta?.column?.autoIncrement).toBe(true)
      expect(meta?.column?.hasDefault).toBe(true)
    })

    it("smallserial() auto-sets autoIncrement and hasDefault", () => {
      const result = pipe(S.Number, Column.smallserial())
      const meta = getFieldMeta(result)
      expect(meta?.column?.columnType).toBe("PgSmallSerial")
      expect(meta?.column?.autoIncrement).toBe(true)
      expect(meta?.column?.hasDefault).toBe(true)
    })

    it("bigserial() defaults to bigint mode with auto flags", () => {
      const result = pipe(S.BigIntFromSelf, Column.bigserial())
      const meta = getFieldMeta(result)
      expect(meta?.column?.columnType).toBe("PgBigSerial64")
      expect(meta?.column?.autoIncrement).toBe(true)
      expect(meta?.column?.hasDefault).toBe(true)
    })

    it("bigserial({ mode: 'number' }) narrows to PgBigSerial53", () => {
      const result = pipe(S.Number, Column.bigserial({ mode: "number" }))
      const meta = getFieldMeta(result)
      expect(meta?.column?.columnType).toBe("PgBigSerial53")
      expect(meta?.column?.dataType).toBe("number int53")
    })
  })

  describe("floating point types", () => {
    it("real()", () => {
      const result = pipe(S.Number, Column.real())
      const meta = getFieldMeta(result)
      expect(meta?.column?.columnType).toBe("PgReal")
      expect(meta?.column?.dataType).toBe("number float")
    })

    it("doublePrecision()", () => {
      const result = pipe(S.Number, Column.doublePrecision())
      const meta = getFieldMeta(result)
      expect(meta?.column?.columnType).toBe("PgDoublePrecision")
      expect(meta?.column?.dataType).toBe("number double")
    })

    it("numeric() defaults to string mode", () => {
      const result = pipe(S.String, Column.numeric())
      const meta = getFieldMeta(result)
      expect(meta?.column?.columnType).toBe("PgNumeric")
      expect(meta?.column?.dataType).toBe("string numeric")
      expect(meta?.column?.mode).toBe("string")
    })

    it("numeric({ mode: 'number', precision: 10, scale: 2 })", () => {
      const result = pipe(S.Number, Column.numeric({ mode: "number", precision: 10, scale: 2 }))
      const meta = getFieldMeta(result)
      expect(meta?.column?.columnType).toBe("PgNumericNumber")
      expect(meta?.column?.dataType).toBe("number")
      expect(meta?.column?.precision).toBe(10)
      expect(meta?.column?.scale).toBe(2)
    })
  })

  describe("character types", () => {
    it("text()", () => {
      const result = pipe(S.String, Column.text())
      const meta = getFieldMeta(result)
      expect(meta?.column?.columnType).toBe("PgText")
      expect(meta?.column?.dataType).toBe("string")
    })

    it("varchar({ length: 255 })", () => {
      const result = pipe(S.String, Column.varchar({ length: 255 }))
      const meta = getFieldMeta(result)
      expect(meta?.column?.columnType).toBe("PgVarchar")
      expect(meta?.column?.length).toBe(255)
    })

    it("char({ length: 1 })", () => {
      const result = pipe(S.String, Column.char({ length: 1 }))
      const meta = getFieldMeta(result)
      expect(meta?.column?.columnType).toBe("PgChar")
      expect(meta?.column?.length).toBe(1)
    })
  })

  describe("boolean type", () => {
    it("boolean()", () => {
      const result = pipe(S.Boolean, Column.boolean())
      const meta = getFieldMeta(result)
      expect(meta?.column?.columnType).toBe("PgBoolean")
      expect(meta?.column?.dataType).toBe("boolean")
    })
  })

  describe("datetime types", () => {
    it("date() defaults to date mode", () => {
      const result = pipe(S.DateFromSelf, Column.date())
      const meta = getFieldMeta(result)
      expect(meta?.column?.columnType).toBe("PgDate")
      expect(meta?.column?.mode).toBe("date")
    })

    it("date({ mode: 'string' })", () => {
      const result = pipe(S.String, Column.date({ mode: "string" }))
      const meta = getFieldMeta(result)
      expect(meta?.column?.columnType).toBe("PgDateString")
      expect(meta?.column?.mode).toBe("string")
    })

    it("time({ precision: 3 })", () => {
      const result = pipe(S.String, Column.time({ precision: 3 }))
      const meta = getFieldMeta(result)
      expect(meta?.column?.columnType).toBe("PgTime")
      expect(meta?.column?.precision).toBe(3)
    })

    it("timestamp() defaults to date mode", () => {
      const result = pipe(S.DateFromSelf, Column.timestamp())
      const meta = getFieldMeta(result)
      expect(meta?.column?.columnType).toBe("PgTimestamp")
      expect(meta?.column?.mode).toBe("date")
    })

    it("timestamp({ mode: 'string', withTimezone: true, precision: 6 })", () => {
      const result = pipe(S.String, Column.timestamp({ mode: "string", withTimezone: true, precision: 6 }))
      const meta = getFieldMeta(result)
      expect(meta?.column?.columnType).toBe("PgTimestampString")
      expect(meta?.column?.mode).toBe("string")
      expect(meta?.column?.withTimezone).toBe(true)
      expect(meta?.column?.precision).toBe(6)
    })

    it("interval({ fields: 'day to hour' })", () => {
      const result = pipe(S.String, Column.interval({ fields: "day to hour" }))
      const meta = getFieldMeta(result)
      expect(meta?.column?.columnType).toBe("PgInterval")
      expect(meta?.column?.fields).toBe("day to hour")
    })
  })

  describe("json types", () => {
    it("json() defaults to json mode", () => {
      const result = pipe(S.Unknown, Column.json())
      const meta = getFieldMeta(result)
      expect(meta?.column?.columnType).toBe("PgJson")
      expect(meta?.column?.dataType).toBe("object json")
      expect(meta?.column?.mode).toBe("json")
    })

    it("jsonb() defaults to json mode", () => {
      const result = pipe(S.Unknown, Column.jsonb())
      const meta = getFieldMeta(result)
      expect(meta?.column?.columnType).toBe("PgJsonb")
      expect(meta?.column?.dataType).toBe("object json")
      expect(meta?.column?.mode).toBe("json")
    })

    it("json({ mode: 'text' })", () => {
      const result = pipe(S.String, Column.json({ mode: "text" }))
      const meta = getFieldMeta(result)
      expect(meta?.column?.dataType).toBe("string")
      expect(meta?.column?.mode).toBe("text")
    })
  })

  describe("binary, uuid, network types", () => {
    it("bytea()", () => {
      const result = pipe(S.Uint8ArrayFromSelf, Column.bytea())
      const meta = getFieldMeta(result)
      expect(meta?.column?.columnType).toBe("PgBytea")
      expect(meta?.column?.dataType).toBe("object buffer")
    })

    it("uuid()", () => {
      const result = pipe(S.String, Column.uuid())
      const meta = getFieldMeta(result)
      expect(meta?.column?.columnType).toBe("PgUUID")
      expect(meta?.column?.dataType).toBe("string uuid")
    })

    it("inet()", () => {
      const result = pipe(S.String, Column.inet())
      expect(getFieldMeta(result)?.column?.columnType).toBe("PgInet")
      expect(getFieldMeta(result)?.column?.dataType).toBe("string inet")
    })

    it("cidr()", () => {
      const result = pipe(S.String, Column.cidr())
      expect(getFieldMeta(result)?.column?.columnType).toBe("PgCidr")
      expect(getFieldMeta(result)?.column?.dataType).toBe("string cidr")
    })

    it("macaddr()", () => {
      const result = pipe(S.String, Column.macaddr())
      expect(getFieldMeta(result)?.column?.columnType).toBe("PgMacaddr")
      expect(getFieldMeta(result)?.column?.dataType).toBe("string macaddr")
    })

    it("macaddr8()", () => {
      const result = pipe(S.String, Column.macaddr8())
      expect(getFieldMeta(result)?.column?.columnType).toBe("PgMacaddr8")
      expect(getFieldMeta(result)?.column?.dataType).toBe("string macaddr8")
    })
  })

  describe("geometric types", () => {
    it("point()", () => {
      const result = pipe(S.Unknown, Column.point())
      expect(getFieldMeta(result)?.column?.columnType).toBe("PgPointTuple")
      expect(getFieldMeta(result)?.column?.dataType).toBe("array point")
    })

    it("line()", () => {
      const result = pipe(S.Unknown, Column.line())
      expect(getFieldMeta(result)?.column?.columnType).toBe("PgLine")
      expect(getFieldMeta(result)?.column?.dataType).toBe("array line")
    })

    it("geometry({ srid: 4326, geometryType: 'POINT' })", () => {
      const result = pipe(S.Unknown, Column.geometry({ srid: 4326, geometryType: "POINT" }))
      const meta = getFieldMeta(result)
      expect(meta?.column?.columnType).toBe("PgGeometry")
      expect(meta?.column?.dataType).toBe("array geometry")
      expect(meta?.column?.srid).toBe(4326)
      expect(meta?.column?.geometryType).toBe("POINT")
    })
  })

  describe("vector types", () => {
    it("vector({ dimensions: 1536 })", () => {
      const result = pipe(S.Unknown, Column.vector({ dimensions: 1536 }))
      const meta = getFieldMeta(result)
      expect(meta?.column?.columnType).toBe("PgVector")
      expect(meta?.column?.dataType).toBe("array vector")
      expect(meta?.column?.dimensions).toBe(1536)
    })

    it("halfvec({ dimensions: 768 })", () => {
      const result = pipe(S.Unknown, Column.halfvec({ dimensions: 768 }))
      const meta = getFieldMeta(result)
      expect(meta?.column?.columnType).toBe("PgHalfVector")
      expect(meta?.column?.dataType).toBe("array halfvector")
      expect(meta?.column?.dimensions).toBe(768)
    })

    it("sparsevec({ dimensions: 256 })", () => {
      const result = pipe(S.String, Column.sparsevec({ dimensions: 256 }))
      const meta = getFieldMeta(result)
      expect(meta?.column?.columnType).toBe("PgSparseVector")
      expect(meta?.column?.dataType).toBe("string sparsevec")
      expect(meta?.column?.dimensions).toBe(256)
    })

    it("bit({ length: 8 })", () => {
      const result = pipe(S.String, Column.bit({ length: 8 }))
      const meta = getFieldMeta(result)
      expect(meta?.column?.columnType).toBe("PgBinaryVector")
      expect(meta?.column?.dataType).toBe("string binary")
      expect(meta?.column?.length).toBe(8)
    })
  })

  describe("enum type", () => {
    it("pgEnum preserves enumName and values", () => {
      const result = pipe(
        S.String,
        Column.pgEnum({ enumName: "status", values: ["active", "inactive"] as const })
      )
      const meta = getFieldMeta(result)
      expect(meta?.column?.columnType).toBe("PgEnumColumn")
      expect(meta?.column?.enumName).toBe("status")
      expect(meta?.column?.enumValues).toEqual(["active", "inactive"])
    })
  })

  describe("common config", () => {
    it("primaryKey flows through", () => {
      const result = pipe(S.String, Column.uuid({ primaryKey: true }))
      expect(getFieldMeta(result)?.column?.primaryKey).toBe(true)
    })

    it("unique flows through", () => {
      const result = pipe(S.String, Column.text({ unique: true }))
      expect(getFieldMeta(result)?.column?.unique).toBe(true)
    })

    it("default sets hasDefault", () => {
      const result = pipe(S.String, Column.text({ default: "hello" }))
      const meta = getFieldMeta(result)
      expect(meta?.column?.hasDefault).toBe(true)
      expect(meta?.column?.default).toBe("hello")
    })

    it("defaultFn sets hasDefault", () => {
      const fn = () => "generated"
      const result = pipe(S.String, Column.text({ defaultFn: fn }))
      const meta = getFieldMeta(result)
      expect(meta?.column?.hasDefault).toBe(true)
      expect(meta?.column?.defaultFn).toBe(fn)
    })

    it("onUpdateFn sets hasDefault", () => {
      const fn = () => "updated"
      const result = pipe(S.String, Column.text({ onUpdateFn: fn }))
      const meta = getFieldMeta(result)
      expect(meta?.column?.hasDefault).toBe(true)
      expect(meta?.column?.onUpdateFn).toBe(fn)
    })

    it("identity flows through", () => {
      const result = pipe(S.Number, Column.integer({ identity: "always" }))
      expect(getFieldMeta(result)?.column?.identity).toBe("always")
    })

    it("multiple config fields combine", () => {
      const result = pipe(
        S.String,
        Column.uuid({ primaryKey: true, unique: true, default: "uuid_generate_v4()" })
      )
      const meta = getFieldMeta(result)
      expect(meta?.column?.primaryKey).toBe(true)
      expect(meta?.column?.unique).toBe(true)
      expect(meta?.column?.hasDefault).toBe(true)
      expect(meta?.column?.default).toBe("uuid_generate_v4()")
    })
  })

  describe("transform", () => {
    it("attaches transform to existing column metadata", () => {
      const result = pipe(
        S.String,
        Column.timestamp(),
        Column.transform({
          decode: (raw: unknown) => (raw as Date).toISOString(),
          encode: (s: unknown) => new Date(s as string),
        })
      )
      const meta = getFieldMeta(result)
      expect(meta?.column?.columnType).toBe("PgTimestamp")
      expect(meta?.column?.transform).toBeDefined()
      expect(meta?.column?.transform?.decode(new Date("2024-01-01"))).toBe("2024-01-01T00:00:00.000Z")
    })

    it("throws when called without a prior Column step", () => {
      expect(() =>
        pipe(
          S.String,
          Column.transform({
            decode: (raw) => raw,
            encode: (value) => value,
          })
        )
      ).toThrow("transform() must be called after a Column pipe step")
    })
  })

  describe("pipe composition", () => {
    it("Schema -> Column produces a value with metadata", () => {
      const result = pipe(S.String, Column.text())
      expect(getFieldMeta(result)?.column).toBeDefined()
      // The result should still be usable as a Schema
      expect(S.decodeUnknownSync(result)("hello")).toBe("hello")
    })

    it("Schema -> Column -> transform chains correctly", () => {
      const result = pipe(
        S.String,
        Column.timestamp({ mode: "string", withTimezone: true }),
        Column.transform({
          decode: (raw) => raw,
          encode: (value) => value,
        })
      )
      const meta = getFieldMeta(result)
      expect(meta?.column?.columnType).toBe("PgTimestampString")
      expect(meta?.column?.withTimezone).toBe(true)
      expect(meta?.column?.transform).toBeDefined()
    })
  })
})
```

### Verify existing tests still pass

After implementation, run:

```bash
cd packages/orm && pnpm test
```

All 152+ existing tests must pass unchanged.

---

## 11. Gates

### Typecheck

```bash
cd packages/orm && pnpm check
```

Must exit 0 with no errors.

### Test

```bash
cd packages/orm && pnpm test
```

Must exit 0. All existing tests (columns.test.ts, column-factory.test.ts, drizzle-proof.test.ts, LiteralKit.test.ts, MappedLiteralKit.test.ts, StringLiteralKit.test.ts) plus all new tests must pass.

### Verification checklist

- [ ] `FieldMeta.ts` exports `ColumnMeta`, `ColumnTransform`, `RelationMeta`, `FieldMeta` interfaces
- [ ] `FieldDescriptor.ts` exports `FieldMetaSymbol`, `WithFieldMeta`, `getFieldMeta`, `attachFieldMeta`, `mergeFieldMeta`
- [ ] `ColumnPipeSteps.ts` exports all 33 column pipe steps plus `transform` in a `Column` namespace
- [ ] Every pipe step produces correct `columnType` and `dataType` values
- [ ] Mode-based pipe steps default correctly and narrow when mode is specified
- [ ] Serial types auto-set `autoIncrement: true` and `hasDefault: true`
- [ ] Common config (primaryKey, unique, default, defaultFn, onUpdateFn, identity, generated) flows through all pipe steps
- [ ] `transform()` requires a prior Column step (throws otherwise)
- [ ] `attachFieldMeta` preserves Schema prototype chain (decode/encode still works)
- [ ] `getFieldMeta` returns `undefined` for unbranded inputs
- [ ] Pipe composition `pipe(Schema, Column.xxx(), Column.transform())` works
- [ ] All existing tests pass unchanged

---

## 12. Architecture Decisions

### AD-1: Plain interfaces, not Effect Schemas, for FieldMeta

**Decision:** `ColumnMeta`, `RelationMeta`, and `FieldMeta` are plain TypeScript interfaces.

**Rationale:** These are metadata records constructed at module definition time and read by `toDrizzle()` at derivation time. They are never decoded from unknown input, never serialized, never validated at runtime. Making them Effect Schemas would add unnecessary complexity (runtime overhead, circular dependency risk with Schema imports in definition-time code). The existing `IndexMeta` in `Literals.ts` IS an Effect Schema because it was built as part of the StringLiteralKit tagged union system, and it is reused as-is.

### AD-2: Symbol property attachment instead of wrapper type

**Decision:** Metadata is attached as a non-enumerable Symbol property on the schema/field object via `Object.create`.

**Rationale:** The value must satisfy `Schema.Struct.Fields` value types (`Schema.Top | VariantSchema.Field | VariantSchema.Struct | undefined`). A wrapper type `{ schema: S, meta: FieldMeta }` would fail this constraint. A Symbol property on the original object is invisible to the Model.Class constructor, invisible to JSON serialization, and invisible to enumeration. Phase 2's Model extension reads it explicitly via `getFieldMeta()`.

**Risk:** `Object.create` cloning may not preserve all internal state of complex Schema objects. The tests in Step 7 verify that decode/encode still works after attachment. If specific Schema types break (e.g., those with internal closures), the approach may need refinement to use a WeakMap fallback.

### AD-3: Existing Column factory preserved, not replaced

**Decision:** The existing `Column` factory in `columns.ts` remains unchanged. Pipe steps are a new, parallel module.

**Rationale:** The existing factory has 61 tests and 31 drizzle-proof tests. It produces plain tagged union objects used for column type matching. The pipe steps serve a different purpose (composing Schema fields with metadata). They import column type definitions from the existing module but do not modify it. This avoids regression risk.

### AD-4: columnType strings match Drizzle entityKind exactly

**Decision:** The `columnType` field in `ColumnMeta` uses the exact string from Drizzle's `static [entityKind]` on each column builder class.

**Rationale:** Phase 3's `toDrizzle()` must select the correct Drizzle column builder constructor. Using the exact string enables a simple dispatch map. The values are: `"PgInteger"`, `"PgSmallInt"`, `"PgBigInt53"`, `"PgBigInt64"`, `"PgSerial"`, `"PgSmallSerial"`, `"PgBigSerial53"`, `"PgBigSerial64"`, `"PgReal"`, `"PgDoublePrecision"`, `"PgNumeric"`, `"PgNumericNumber"`, `"PgText"`, `"PgVarchar"`, `"PgChar"`, `"PgBoolean"`, `"PgDate"`, `"PgDateString"`, `"PgTime"`, `"PgTimestamp"`, `"PgTimestampString"`, `"PgInterval"`, `"PgJson"`, `"PgJsonb"`, `"PgBytea"`, `"PgUUID"`, `"PgInet"`, `"PgCidr"`, `"PgMacaddr"`, `"PgMacaddr8"`, `"PgPointTuple"`, `"PgLine"`, `"PgGeometry"`, `"PgVector"`, `"PgHalfVector"`, `"PgSparseVector"`, `"PgBinaryVector"`, `"PgEnumColumn"`. These are the 3rd argument to each builder's `super(name, dataType, columnType)` call -- NOT the `entityKind` (which has a "Builder" suffix).

### AD-5: dataType strings match Drizzle's internal dataType argument

**Decision:** The `dataType` field uses the string that Drizzle passes to the `PgColumnBuilder` super constructor.

**Rationale:** Drizzle's type system uses `dataType` for type-level computation of `data` and `driverParam` types. Our metadata must carry the same values so Phase 3 can produce correctly typed column builder instances.

### AD-6: Flat ColumnMeta structure

**Decision:** Column-type-specific fields (`length`, `precision`, `scale`, `withTimezone`, `enumName`, `srid`, `geometryType`, `fields`) are top-level properties on `ColumnMeta`, not nested in a `config` sub-object.

**Rationale:** Phase 3's `toDrizzle()` needs direct access to these values to pass them into Drizzle column constructors. Nesting would require destructuring at every dispatch site. The flat structure mirrors Drizzle's own `PgColumnBuilderRuntimeConfig`.

### AD-7: mergeFieldMeta for composability

**Decision:** The `mergeFieldMeta` function deep-merges column metadata and appends indexes.

**Rationale:** Pipe steps may be chained (e.g., `Column.uuid()` then `Column.transform()`). The transform step must merge its transform into the existing ColumnMeta without losing the columnType and dataType set by the preceding uuid step. Indexes are appended because a field may have multiple indexes (e.g., btree + unique).

---

## 13. Reference Files

### ORM Source (read before implementing)

| Absolute Path | Purpose |
|---|---|
| `/home/elpresidank/YeeBois/projects/effect-orm/packages/orm/src/dialects/postgres/columns.ts` | Existing column type system and factory |
| `/home/elpresidank/YeeBois/projects/effect-orm/packages/orm/src/Literals.ts` | Existing IndexMeta, RelationActionLiteral |
| `/home/elpresidank/YeeBois/projects/effect-orm/packages/orm/src/utils/StringLiteralKit.ts` | StringLiteralKit utility |
| `/home/elpresidank/YeeBois/projects/effect-orm/packages/orm/src/utils/index.ts` | Utility exports |
| `/home/elpresidank/YeeBois/projects/effect-orm/packages/orm/src/index.ts` | Current top-level exports |
| `/home/elpresidank/YeeBois/projects/effect-orm/packages/orm/test/column-factory.test.ts` | Existing factory tests (61 tests) |
| `/home/elpresidank/YeeBois/projects/effect-orm/packages/orm/test/drizzle-proof.test.ts` | Existing drizzle proof tests (31 tests) |
| `/home/elpresidank/YeeBois/projects/effect-orm/packages/orm/test/columns.test.ts` | Existing column type tests (60 tests) |
| `/home/elpresidank/YeeBois/projects/effect-orm/packages/orm/package.json` | Package config, scripts |
| `/home/elpresidank/YeeBois/projects/effect-orm/packages/orm/tsconfig.json` | TypeScript config |
| `/home/elpresidank/YeeBois/projects/effect-orm/packages/orm/tsconfig.src.json` | Source TypeScript config |

### Effect v4 Source (reference, do not modify)

| Absolute Path | Purpose |
|---|---|
| `/home/elpresidank/YeeBois/projects/effect-orm/.repos/effect-smol/packages/effect/src/unstable/schema/Model.ts` | Model.Class, Generated, Sensitive, FieldOption, Field |
| `/home/elpresidank/YeeBois/projects/effect-orm/.repos/effect-smol/packages/effect/src/unstable/schema/VariantSchema.ts` | VariantSchema.Field, isField, isStruct, Field.Config |
| `/home/elpresidank/YeeBois/projects/effect-orm/.repos/effect-smol/packages/effect/src/Schema.ts` | Schema.Top, Schema.Struct.Fields |

### Drizzle ORM Source (reference, do not modify)

| Absolute Path | Purpose |
|---|---|
| `/home/elpresidank/YeeBois/projects/effect-orm/.repos/drizzle-orm/drizzle-orm/src/pg-core/columns/common.ts` | PgColumnBuilder base class, chain methods, PgColumnBuilderConfig, PgColumnBuilderRuntimeConfig |
| `/home/elpresidank/YeeBois/projects/effect-orm/.repos/drizzle-orm/drizzle-orm/src/pg-core/columns/integer.ts` | PgIntegerBuilder -- simple column pattern |
| `/home/elpresidank/YeeBois/projects/effect-orm/.repos/drizzle-orm/drizzle-orm/src/pg-core/columns/bigint.ts` | PgBigInt53Builder/PgBigInt64Builder -- mode-based pattern |
| `/home/elpresidank/YeeBois/projects/effect-orm/.repos/drizzle-orm/drizzle-orm/src/pg-core/columns/timestamp.ts` | PgTimestampBuilder/PgTimestampStringBuilder -- config-based pattern |
| `/home/elpresidank/YeeBois/projects/effect-orm/.repos/drizzle-orm/drizzle-orm/src/pg-core/columns/uuid.ts` | PgUUIDBuilder -- simple column with defaultRandom |
| `/home/elpresidank/YeeBois/projects/effect-orm/.repos/drizzle-orm/drizzle-orm/src/column-builder.ts` | ColumnDataType union |

### Design Doc (reference)

| Absolute Path | Relevant Sections |
|---|---|
| `/home/elpresidank/YeeBois/projects/effect-orm/specs/pending/effect-orm/DESIGN.md` | Section 2.3 (Metadata Registry), Section 3.2-3.4 (Field Composition, Column Functions, Column.transform), Section 5.1-5.4 (Type System) |

---

## 14. Implementation Order Summary

1. Create `packages/orm/src/FieldMeta.ts` with all interfaces
2. Create `packages/orm/src/FieldDescriptor.ts` with Symbol, attach, get, merge functions
3. Create `packages/orm/test/field-meta.test.ts` -- run, verify passing
4. Create `packages/orm/test/field-descriptor.test.ts` -- run, verify passing
5. Create `packages/orm/src/dialects/postgres/ColumnPipeSteps.ts` with `extractCommonConfig` helper, all 33 column pipe steps, `transform`, and `Column` namespace export
6. Create `packages/orm/test/column-pipe-steps.test.ts` -- run, verify passing
7. Update `packages/orm/src/index.ts` with new exports
8. Run full test suite: `cd packages/orm && pnpm test` -- all tests pass
9. Run typecheck: `cd packages/orm && pnpm check` -- exits 0
