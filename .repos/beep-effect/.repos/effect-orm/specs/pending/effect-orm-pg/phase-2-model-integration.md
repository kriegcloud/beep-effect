# Phase 2: Model Integration

> Status: **PENDING** -- awaiting Phase 1 completion

## 1. Overview

Phase 2 builds the `pg.Model` constructor that wraps Effect v4's `Model.Class` with a parallel metadata registry for Drizzle table derivation. This is the central integration point where Effect's variant schema system meets our column/relation/index metadata pipeline.

Phase 2 takes the field descriptor and metadata types produced by Phase 1 (FieldMeta, ColumnMeta, and pg.Column pipe step functions) and wires them into a Model constructor that:

1. Passes field definitions through to upstream `Model.Class` for 6-variant schema generation
2. Intercepts field definitions to extract FieldMeta from pipe step descriptors into a static registry
3. Derives table names from the model identifier with prefix and snakeCase support
4. Preserves full compatibility with `SqlModel.makeRepository` and `SqlModel.makeDataLoaders`

The result is a class that IS a `Model.Class` (satisfies `Model.Any`) AND carries a `Map<string, FieldMeta>` static property for downstream `toDrizzle()` derivation in Phase 3.

---

## 2. Prerequisites

### Phase 1 Deliverables Required

Phase 1 must have produced the following before Phase 2 begins. Verify each file exists and exports what is listed.

| File | Exports | Purpose |
|------|---------|---------|
| `packages/orm/src/FieldMeta.ts` | `FieldMeta`, `ColumnMeta`, `RelationMeta`, `IndexMeta` schemas/interfaces | Metadata types for the registry |
| `packages/orm/src/Field.ts` (or equivalent) | Field descriptor type carrying Schema + FieldMeta through pipes | The composable descriptor that pg.Column steps operate on |
| `packages/orm/src/dialects/postgres/Column.ts` (or integrated into existing columns.ts) | `pg.Column.uuid()`, `pg.Column.text()`, `pg.Column.timestamp()`, etc. as `Field => Field` pipe step functions | Pipe steps that wrap a Schema with ColumnMeta |

### Files to Read Before Starting

Read these files in order to build sufficient context:

1. **Phase 1 output files** (listed above) -- understand the Field descriptor shape, FieldMeta structure, and how pg.Column steps attach metadata
2. **`packages/orm/src/dialects/postgres/columns.ts`** -- existing column type system with tagged unions and match functions (152+ tests)
3. **`packages/orm/src/Literals.ts`** -- DialectLiteral, RelationActionLiteral, IndexMetaLiteral
4. **`.repos/effect-v4/packages/effect/src/unstable/schema/Model.ts`** -- the upstream Model.Class implementation (field helpers, variant definitions)
5. **`.repos/effect-v4/packages/effect/src/unstable/schema/VariantSchema.ts`** -- the VariantSchema.make() constructor, Class factory, Field/Struct types, extract mechanism
6. **`.repos/effect-v4/packages/effect/src/unstable/sql/SqlModel.ts`** -- makeRepository/makeDataLoaders that consume Model.Any
7. **`specs/pending/effect-orm/DESIGN.md`** -- authoritative design spec, sections 2.1-2.4, 3.1-3.2

---

## 3. Deliverables

### Files to Create

| File | Purpose |
|------|---------|
| `packages/orm/src/Model.ts` | Core pg.Model constructor implementation |
| `packages/orm/src/ModelFactory.ts` | ModelFactory.pg() factory that returns `{ Column, Model, Relation, Index }` scoped object |
| `packages/orm/src/internal/snakeCase.ts` | Table name derivation utility |
| `packages/orm/src/internal/extractFieldMeta.ts` | Utility to extract FieldMeta from a processed field descriptor |
| `packages/orm/test/Model.test.ts` | Integration tests for pg.Model |
| `packages/orm/test/internal/snakeCase.test.ts` | Unit tests for snakeCase |

### Files to Modify

| File | Change |
|------|--------|
| `packages/orm/src/index.ts` | Export Model and ModelFactory |

### Verification

After all files are created, run:

```bash
pnpm run typecheck   # or the project's typecheck command
pnpm run test        # or the project's test command
```

Confirm the exact commands by checking `packages/orm/package.json` scripts before running.

---

## 4. Step 1: Study Model.Class

### What to Read

Read the entire file at `.repos/effect-v4/packages/effect/src/unstable/schema/Model.ts`. This is 611 lines. Understand every export.

### Key Structures

**Model.Class constructor** is created by `VariantSchema.make()` at the top of the file:

```typescript
const {
  Class,
  Field,
  FieldExcept,
  FieldOnly,
  Struct,
  Union,
  extract,
  fieldEvolve
} = VariantSchema.make({
  variants: ["select", "insert", "update", "json", "jsonCreate", "jsonUpdate"],
  defaultVariant: "select"
})
```

The `Class` function is curried:

```typescript
Class<Self>(identifier: string)(fields, annotations?)
```

Where `annotations` is optional with type:
```typescript
Schema.Annotations.Declaration<Self, readonly [Schema.Struct<...>]>
```

### Variant System

The 6 variants and their semantics:

| Variant | Default variant? | What it excludes |
|---------|-----------------|------------------|
| `select` | Yes (default) | Nothing -- full schema |
| `insert` | No | Fields wrapped in `Generated` |
| `update` | No | Nothing (all fields present) |
| `json` | No | Fields wrapped in `Sensitive` |
| `jsonCreate` | No | Fields wrapped in `Generated`, `GeneratedByApp`, `Sensitive` |
| `jsonUpdate` | No | Fields wrapped in `Generated`, `GeneratedByApp`, `Sensitive` |

### Field Helpers

These are the Model field helpers that our pg.Column pipe steps must compose with:

| Helper | Creates `Field<{ ... }>` with these variant entries |
|--------|------------------------------------------------------|
| `Model.Generated(schema)` | `{ select, update, json }` -- excluded from insert |
| `Model.GeneratedByApp(schema)` | `{ select, insert, update, json }` -- excluded from jsonCreate/jsonUpdate |
| `Model.Sensitive(schema)` | `{ select, insert, update }` -- excluded from all json variants |
| `Model.FieldOption(field)` | Evolves all variants to use `OptionFromNullOr` (db) or `optionalOption` (json) |
| `Model.DateTimeInsert` | `{ select: DateTimeUtcFromString, insert: Overrideable(DateTimeUtcFromString), json: DateTimeUtcFromString }` |
| `Model.DateTimeInsertFromDate` | Same pattern but with `DateTimeUtcFromDate` for db variants |
| `Model.DateTimeUpdate` | Same as DateTimeInsert but also includes `update: Overrideable(...)` |
| `Model.DateTimeUpdateFromDate` | Same pattern with `DateTimeUtcFromDate` for db variants |
| `Model.JsonFromString(schema)` | `{ select/insert/update: fromJsonString(schema), json/jsonCreate/jsonUpdate: schema }` |
| `Model.UuidV4Insert(schema)` | `{ select, insert: Overrideable(brand), update, json }` |

### VariantSchema.Class Internals

Read `.repos/effect-v4/packages/effect/src/unstable/schema/VariantSchema.ts` lines 376-401. The Class factory:

1. Creates a `variantStruct` from the fields via `Struct(fields)`
2. Extracts the default variant schema via `extract(variantStruct, defaultVariant, { isDefault: true })`
3. Creates a `Schema.Class` from the extracted default variant fields
4. Defines static properties for each variant by calling `extract(variantStruct, variant).annotate({ id, title })`
5. Stores the raw fields on `Base[TypeId]`

The critical insight: `Schema.Class` is called with `schema.fields` from the extracted default variant. The raw VariantSchema fields (including `Field<Config>` wrappers) are stored separately on `[TypeId]`. Our metadata extraction must happen before or during this process.

### What a Field Looks Like

A plain Schema passed as a field (e.g., `Schema.String`) is treated as present in ALL variants.

A `Model.Field({ select: S1, insert: S2 })` is a VariantSchema.Field that carries per-variant schemas. The `extract` function pulls the schema for the requested variant from `field.schemas[variant]`.

A `Model.Generated(Schema.String)` produces `Field({ select: Schema.String, update: Schema.String, json: Schema.String })` -- no insert variant means Generated fields are absent from insert.

### Compatibility with SqlModel

Read `.repos/effect-v4/packages/effect/src/unstable/sql/SqlModel.ts` lines 24-66. The `makeRepository` function accepts:

```typescript
S extends Model.Any
```

Where `Model.Any` is:

```typescript
type Any = Schema.Top & {
  readonly fields: Schema.Struct.Fields
  readonly insert: Schema.Top
  readonly update: Schema.Top
  readonly json: Schema.Top
  readonly jsonCreate: Schema.Top
  readonly jsonUpdate: Schema.Top
}
```

Our Model class MUST satisfy this constraint. Since we extend `Model.Class`, this is automatic -- but verify it after implementation.

---

## 5. Step 2: Design pg.Model Constructor

### Constructor Signature

```typescript
pg.Model<Self>(identifier: string)(
  fields: Fields,
  annotations?: Schema.Annotations.Declaration<Self, readonly [Schema.Struct<...>]>
)
```

With optional tableName override:

```typescript
pg.Model<Self>(identifier: string, options?: { tableName?: string })(
  fields: Fields,
  annotations?: Schema.Annotations.Declaration<Self, readonly [Schema.Struct<...>]>
)
```

The first call binds the identifier (and optional table name override). The second call receives fields and optional annotations, exactly mirroring `Model.Class`.

### Implementation Strategy

The pg.Model constructor wraps `Model.Class` from `effect/unstable/schema/Model`. It does NOT reimplement variant schema machinery. The implementation:

1. Receives the `fields` object (each value is either a plain Schema, a VariantSchema.Field, or a pipe-processed descriptor carrying FieldMeta)
2. Iterates over fields to extract FieldMeta from each descriptor, building a `Map<string, FieldMeta>`
3. Strips the FieldMeta wrapper from each field, producing clean Schema/VariantSchema.Field values
4. Passes the clean fields to upstream `Model.Class<Self>(identifier)(cleanFields, annotations)`
5. Attaches the metadata Map as a static property on the returned class
6. Computes and attaches the table name as a static property

### Pseudocode

```typescript
import { Model } from "effect/unstable/schema"
import * as S from "effect/Schema"

const MetadataSymbol = Symbol.for("@beep/effect-orm/metadata")
const TableNameSymbol = Symbol.for("@beep/effect-orm/tableName")

function createPgModel(config: { prefix?: string }) {
  return function PgModel<Self = never>(
    identifier: string,
    options?: { tableName?: string }
  ) {
    return function(
      fields: Record<string, unknown>,
      annotations?: unknown
    ) {
      const metadata = new Map<string, FieldMeta>()
      const cleanFields: Record<string, unknown> = {}

      for (const [key, value] of Object.entries(fields)) {
        if (isFieldDescriptor(value)) {
          metadata.set(key, value[FieldMetaSymbol])
          cleanFields[key] = value[SchemaSymbol]
        } else {
          cleanFields[key] = value
        }
      }

      const tableName = options?.tableName
        ?? (config.prefix ?? "") + snakeCase(identifier)

      const BaseClass = Model.Class<Self>(identifier)(
        cleanFields as any,
        annotations as any
      )

      Object.defineProperty(BaseClass, MetadataSymbol, {
        value: metadata,
        enumerable: false
      })

      Object.defineProperty(BaseClass, TableNameSymbol, {
        value: tableName,
        enumerable: false
      })

      return BaseClass
    }
  }
}
```

### Field Descriptor Detection

The pg.Column pipe steps from Phase 1 produce a "field descriptor" -- an object that carries both the original Schema/VariantSchema.Field AND the accumulated FieldMeta. Phase 2 must detect these descriptors and extract both parts.

Phase 1 defines the shape. Phase 2 consumes it. The detection mechanism is a branded symbol check:

```typescript
const FieldDescriptorTypeId = Symbol.for("@beep/effect-orm/FieldDescriptor")

function isFieldDescriptor(value: unknown): value is FieldDescriptor {
  return typeof value === "object"
    && value !== null
    && FieldDescriptorTypeId in value
}
```

If Phase 1 uses a different detection mechanism, adapt accordingly. The key contract is:

- A field descriptor has a way to extract the original Schema/Field (for Model.Class)
- A field descriptor has a way to extract the FieldMeta (for the metadata registry)
- A plain Schema (not wrapped by pg.Column) passes through unchanged with no FieldMeta entry

### Handling Fields Without Column Metadata

Not every field in a Model definition will have pg.Column metadata. A field like:

```typescript
name: Schema.NonEmptyString
```

has no column metadata. This is valid -- it means the field participates in the Effect Schema system but has no Drizzle column metadata. The metadata Map simply has no entry for that field name.

However, for `toDrizzle()` to work (Phase 3), every field that should appear in the Drizzle table MUST have column metadata. Phase 3 can enforce this. Phase 2 does not need to validate completeness.

### Type-Level Requirements

The returned class type MUST satisfy:

1. `Model.Any` -- for SqlModel compatibility
2. Has `.fields` property with Schema.Struct.Fields
3. Has `.insert`, `.update`, `.json`, `.jsonCreate`, `.jsonUpdate` static variant schemas
4. Has `[MetadataSymbol]` static property of type `ReadonlyMap<string, FieldMeta>`
5. Has `[TableNameSymbol]` static property of type `string`

The class constructor (`new(props)`) produces instances of `Self` type.

---

## 6. Step 3: Metadata Registry Implementation

### Registry Shape

```typescript
interface FieldMeta {
  readonly column?: ColumnMeta
  readonly relation?: RelationMeta
  readonly indexes?: ReadonlyArray<IndexMeta>
}
```

The FieldMeta, ColumnMeta, RelationMeta, and IndexMeta types are defined by Phase 1. Read `packages/orm/src/FieldMeta.ts` for the exact definitions.

### Storage Location

The registry is a `ReadonlyMap<string, FieldMeta>` stored as a static (class-level) property using a well-known Symbol:

```typescript
const MetadataRegistrySymbol = Symbol.for("@beep/effect-orm/MetadataRegistry")
```

Using `Symbol.for()` (global registry) ensures cross-module access without import coupling.

### Population Strategy

The registry is populated during the pg.Model constructor's field processing loop. For each field in the fields object:

1. Check if the value is a field descriptor (produced by a pg.Column/pg.Relation/pg.Index pipe step)
2. If yes: extract the FieldMeta, store it in the Map keyed by field name
3. If no: skip -- field has no ORM metadata (pure Schema field)

The population is a single pass. No recursive walking. No lazy evaluation. The Map is fully populated before `Model.Class` is called.

### Accessor Function

Provide a typed accessor function to retrieve the registry from a Model class:

```typescript
function getMetadata(model: Model.Any): ReadonlyMap<string, FieldMeta> {
  const registry = (model as any)[MetadataRegistrySymbol]
  if (registry === undefined) {
    return new Map()
  }
  return registry
}
```

Also provide a function to retrieve the table name:

```typescript
function getTableName(model: Model.Any): string {
  return (model as any)[TableNameSymbol]
}
```

These accessors are used by Phase 3's `toDrizzle()` function.

### Immutability

The Map is created during construction and never mutated afterward. Use `Object.freeze` or construct as a plain Map and do not expose mutation methods. The `ReadonlyMap` type constraint prevents callers from mutating.

---

## 7. Step 4: Field Processing Pipeline

### How Pipe Steps Produce FieldMeta

In Phase 1, a pg.Column pipe step function takes a Schema (or VariantSchema.Field, or an existing field descriptor) and returns a new field descriptor that wraps the original with ColumnMeta:

```typescript
pipe(
  Model.Generated(UserId),      // VariantSchema.Field
  pg.Column.uuid({ primaryKey: true })  // Field => FieldDescriptor
)
```

The pg.Column.uuid() step:
1. Receives the VariantSchema.Field (or plain Schema)
2. Creates a ColumnMeta: `{ columnType: "uuid", dataType: "string uuid", primaryKey: true, ... }`
3. Wraps the input in a FieldDescriptor: `{ [TypeId]: true, schema: <original>, meta: { column: <ColumnMeta> } }`
4. Returns the FieldDescriptor

Subsequent pipe steps (pg.Relation, pg.Index) receive the FieldDescriptor and accumulate additional metadata:

```typescript
pipe(
  Schema.NonEmptyString,
  pg.Column.uuid(),                    // creates FieldDescriptor with column meta
  pg.Relation(() => Org.fields.id, { onDelete: "cascade" }),  // adds relation meta
  pg.Index.unique()                    // adds index meta
)
```

Each step returns a new FieldDescriptor with merged metadata. No mutation.

### Extraction During Model Construction

The pg.Model constructor iterates over fields and for each:

```
field value
  |
  v
isFieldDescriptor(value)?
  |            |
  yes          no
  |            |
  v            v
Extract:       Pass through as-is
  schema = value[SchemaSymbol]    -> goes to Model.Class fields
  meta = value[MetaSymbol]        -> goes to metadata Map
```

### FieldDescriptor Contract

Phase 1 defines the exact shape. Phase 2 depends on these properties:

| Property | Type | Purpose |
|----------|------|---------|
| `[FieldDescriptorTypeId]` | symbol brand | Detection: is this a field descriptor? |
| `schema` (or `[SchemaSymbol]`) | `Schema.Top \| VariantSchema.Field<any>` | The original Schema/Field to pass to Model.Class |
| `meta` (or `[MetaSymbol]`) | `FieldMeta` | The accumulated metadata to store in registry |

If Phase 1 uses different property names or access patterns, adapt. The contract is: given a field descriptor, you can extract (a) the clean schema and (b) the metadata.

### Pipe Step Composition Rules

The pipe chain has a specific order:

1. **First**: Schema or Model field helper (e.g., `Model.Generated(S.String)`, `S.NonEmptyString`)
2. **Second**: `pg.Column.xxx()` -- converts to FieldDescriptor with ColumnMeta
3. **Third (optional)**: `pg.Relation()` -- adds RelationMeta to existing FieldDescriptor
4. **Fourth (optional)**: `pg.Index.xxx()` -- adds IndexMeta to existing FieldDescriptor

A pg.Column step MUST come before pg.Relation or pg.Index (since Column creates the FieldDescriptor that subsequent steps augment). Enforce this via types: pg.Relation and pg.Index accept FieldDescriptor, not raw Schema.

### Fields Without Pipe Steps

A field can be a plain Schema or VariantSchema.Field without any pg.Column step:

```typescript
class User extends pg.Model<User>("User")({
  name: Schema.NonEmptyString,  // no pg.Column -- just a Schema
  email: pipe(Schema.NonEmptyString, pg.Column.varchar({ length: 255 })),
}) {}
```

The `name` field participates in all 6 variants (since it's a plain Schema present in all variants) but has no column metadata. The metadata registry has no entry for "name". Phase 3 (`toDrizzle()`) will need to decide how to handle fields without column metadata -- this is Phase 3's concern, not Phase 2's.

---

## 8. Step 5: Table Name Derivation

### Algorithm

```
tableName = overrideTableName ?? (prefix + snakeCase(identifier))
```

Where:
- `overrideTableName` is from `pg.Model<Self>(identifier, { tableName: "custom_name" })`
- `prefix` is from `ModelFactory.pg({ prefix: "app_" })`
- `snakeCase` converts PascalCase/camelCase identifiers to snake_case

### snakeCase Implementation

The snakeCase function uses lodash-style camelCase splitting. This means consecutive uppercase letters are treated as an acronym:

| Input | Output |
|-------|--------|
| `User` | `user` |
| `UserProfile` | `user_profile` |
| `HTTPClient` | `http_client` |
| `XMLHTTPRequest` | `xmlhttp_request` |
| `userId` | `user_id` |
| `getHTTPSUrl` | `get_https_url` |
| `ABCDef` | `abc_def` |
| `Already_Snake` | `already_snake` |

Implementation approach:

```typescript
function snakeCase(input: string): string {
  return input
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2")
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[\s-]+/g, "_")
    .toLowerCase()
}
```

This handles:
- PascalCase: `UserProfile` -> `User_Profile` -> `user_profile`
- camelCase: `userId` -> `user_Id` -> `user_id`
- Acronyms: `HTTPClient` -> `HTTP_Client` -> `http_client`
- Mixed: `getHTTPSUrl` -> `get_HTTPS_Url` -> `get_https_url`
- Already snake: passthrough (no uppercase to split)

### Prefix Handling

The prefix is a plain string prepended directly. No separator is added between prefix and table name -- the prefix must include any desired separator:

| Prefix | Identifier | Table Name |
|--------|-----------|------------|
| `"app_"` | `"User"` | `"app_user"` |
| `"my_schema."` | `"User"` | `"my_schema.user"` |
| `""` (empty) | `"User"` | `"user"` |
| `undefined` | `"User"` | `"user"` |

### Where to Store

The computed table name is stored as a static property on the Model class:

```typescript
const TableNameSymbol = Symbol.for("@beep/effect-orm/TableName")

Object.defineProperty(BaseClass, TableNameSymbol, {
  value: tableName,
  enumerable: false,
  writable: false,
  configurable: false
})
```

---

## 9. Step 6: Integration Tests

### Test File: `packages/orm/test/Model.test.ts`

Write tests using the project's existing test framework (check `packages/orm/package.json` for vitest or similar).

### Test 1: Basic Model Definition

Verify that a pg.Model produces a class with all 6 variant schemas.

```typescript
import { pipe } from "effect"
import * as S from "effect/Schema"
import { Model } from "effect/unstable/schema"
import { ModelFactory } from "@beep/effect-orm"

const pg = ModelFactory.pg({ prefix: "app_" })

class User extends pg.Model<User>("User")({
  id: pipe(Model.Generated(S.String), pg.Column.uuid({ primaryKey: true })),
  name: pipe(S.NonEmptyString, pg.Column.text()),
  email: pipe(S.NonEmptyString, pg.Column.varchar({ length: 255 })),
}) {}

it("produces a class with select variant (default)", () => {
  expect(User).toBeDefined()
  expect(User.fields).toBeDefined()
})

it("produces insert variant excluding Generated fields", () => {
  expect(User.insert).toBeDefined()
  // id should NOT be in insert variant fields
})

it("produces update variant with all fields", () => {
  expect(User.update).toBeDefined()
})

it("produces json variant excluding Sensitive fields", () => {
  expect(User.json).toBeDefined()
})

it("produces jsonCreate and jsonUpdate variants", () => {
  expect(User.jsonCreate).toBeDefined()
  expect(User.jsonUpdate).toBeDefined()
})
```

### Test 2: Metadata Registry

Verify the metadata Map is populated correctly.

```typescript
import { getMetadata, getTableName } from "@beep/effect-orm"

it("stores metadata for fields with pg.Column steps", () => {
  const meta = getMetadata(User)
  expect(meta.size).toBe(3)
  expect(meta.get("id")?.column?.columnType).toBe("uuid")
  expect(meta.get("id")?.column?.primaryKey).toBe(true)
  expect(meta.get("name")?.column?.columnType).toBe("text")
  expect(meta.get("email")?.column?.columnType).toBe("varchar")
})
```

### Test 3: Table Name Derivation

```typescript
it("derives table name from prefix + snakeCase(identifier)", () => {
  expect(getTableName(User)).toBe("app_user")
})

class UserProfile extends pg.Model<UserProfile>("UserProfile")({
  id: pipe(Model.Generated(S.String), pg.Column.uuid({ primaryKey: true })),
}) {}

it("handles PascalCase identifiers", () => {
  expect(getTableName(UserProfile)).toBe("app_user_profile")
})
```

### Test 4: Table Name Override

```typescript
class Custom extends pg.Model<Custom>("Custom", { tableName: "my_custom_table" })({
  id: pipe(Model.Generated(S.String), pg.Column.uuid({ primaryKey: true })),
}) {}

it("allows tableName override", () => {
  expect(getTableName(Custom)).toBe("my_custom_table")
})
```

### Test 5: Model Field Helpers Integration

Verify that Model field helpers (Generated, Sensitive, DateTimeInsertFromDate, DateTimeUpdateFromDate) compose correctly with pg.Column steps.

```typescript
class Article extends pg.Model<Article>("Article")({
  id: pipe(Model.Generated(S.String), pg.Column.uuid({ primaryKey: true })),
  title: pipe(S.NonEmptyString, pg.Column.text()),
  passwordHash: pipe(Model.Sensitive(S.String), pg.Column.text()),
  createdAt: pipe(Model.DateTimeInsertFromDate, pg.Column.timestamp()),
  updatedAt: pipe(Model.DateTimeUpdateFromDate, pg.Column.timestamp()),
}) {}

it("Generated fields excluded from insert variant", () => {
  // Article.insert should NOT have 'id' field
})

it("Sensitive fields excluded from json variants", () => {
  // Article.json should NOT have 'passwordHash' field
})

it("DateTime fields have correct variant behavior", () => {
  // Article.insert should have 'createdAt' as Overrideable
  // Article.update should have 'updatedAt' as Overrideable
})

it("all fields have column metadata", () => {
  const meta = getMetadata(Article)
  expect(meta.get("id")?.column?.columnType).toBe("uuid")
  expect(meta.get("createdAt")?.column?.columnType).toBe("timestamp")
  expect(meta.get("updatedAt")?.column?.columnType).toBe("timestamp")
  expect(meta.get("passwordHash")?.column?.columnType).toBe("text")
})
```

### Test 6: Fields Without Column Metadata

```typescript
class Mixed extends pg.Model<Mixed>("Mixed")({
  id: pipe(Model.Generated(S.String), pg.Column.uuid({ primaryKey: true })),
  plainField: S.NonEmptyString,
}) {}

it("fields without pg.Column have no metadata entry", () => {
  const meta = getMetadata(Mixed)
  expect(meta.has("id")).toBe(true)
  expect(meta.has("plainField")).toBe(false)
})
```

### Test 7: Model.Any Compatibility

```typescript
import type { Model as ModelType } from "effect/unstable/schema"

it("satisfies Model.Any constraint", () => {
  const _check: ModelType.Any = User
})
```

### Test 8: Relation and Index Metadata

```typescript
class Post extends pg.Model<Post>("Post")({
  id: pipe(Model.Generated(S.String), pg.Column.uuid({ primaryKey: true })),
  authorId: pipe(
    S.String,
    pg.Column.uuid(),
    pg.Relation(() => User.fields.id, { onDelete: "cascade" })
  ),
  slug: pipe(
    S.NonEmptyString,
    pg.Column.varchar({ length: 200 }),
    pg.Index.unique()
  ),
}) {}

it("stores relation metadata", () => {
  const meta = getMetadata(Post)
  expect(meta.get("authorId")?.relation).toBeDefined()
  expect(meta.get("authorId")?.relation?.onDelete).toBe("cascade")
})

it("stores index metadata", () => {
  const meta = getMetadata(Post)
  expect(meta.get("slug")?.indexes).toBeDefined()
  expect(meta.get("slug")?.indexes?.[0]?.type).toBe("unique")
})
```

### Test File: `packages/orm/test/internal/snakeCase.test.ts`

```typescript
import { snakeCase } from "../../src/internal/snakeCase"

it.each([
  ["User", "user"],
  ["UserProfile", "user_profile"],
  ["HTTPClient", "http_client"],
  ["userId", "user_id"],
  ["getHTTPSUrl", "get_https_url"],
  ["ABCDef", "abc_def"],
  ["already_snake", "already_snake"],
  ["A", "a"],
  ["AB", "ab"],
  ["XMLHTTPRequest", "xmlhttp_request"],
])("snakeCase(%s) === %s", (input, expected) => {
  expect(snakeCase(input)).toBe(expected)
})
```

---

## 10. Gates

### Typecheck

```bash
cd packages/orm && pnpm run typecheck
```

If no `typecheck` script exists, check `tsconfig.json` and run:

```bash
cd packages/orm && npx tsc --noEmit
```

All files must typecheck without errors. No `as any`, no `@ts-ignore`, no `@ts-expect-error`.

### Tests

```bash
cd packages/orm && pnpm run test
```

If using vitest:

```bash
cd packages/orm && npx vitest run
```

All existing tests (152+) must continue to pass. All new tests must pass.

### Verification Order

1. Run typecheck first -- type errors block everything
2. Run tests second -- behavioral verification
3. Verify that the existing 152+ column type tests still pass (no regressions)

---

## 11. Architecture Decisions

### AD-1: Extend Model.Class, Do Not Reimplement

**Decision**: pg.Model wraps upstream `Model.Class` from `effect/unstable/schema/Model`. It does NOT reimplement variant schema machinery.

**Rationale**: Model.Class provides 6 variants, field helpers, Overrideable pattern, and SqlModel compatibility. Reimplementing any of this is a maintenance burden and a correctness risk. Our scope is adding a parallel metadata registry and table name derivation.

**Consequence**: Any future changes to Model.Class (new variants, new field helpers) automatically flow through to pg.Model without code changes.

### AD-2: Parallel Metadata Registry, Not Schema Annotations

**Decision**: Column/relation/index metadata is stored in a separate `Map<string, FieldMeta>` on the class, NOT embedded in Schema annotations or VariantSchema.Field.

**Rationale**: Custom metadata does NOT survive VariantSchema extraction. `Field.schemas` only holds Schema instances with no slot for arbitrary metadata. The VariantSchema `extract()` function walks fields and pulls out `field.schemas[variant]` -- anything not in `.schemas` is lost. A parallel registry avoids this limitation entirely.

**Consequence**: Two parallel structures exist on every Model class: (1) the VariantSchema fields for Effect's schema system, (2) the metadata Map for Drizzle derivation. Both are built from the same pipe chain but stored separately.

### AD-3: Symbol-Based Static Properties

**Decision**: Metadata and table name are stored using `Symbol.for()` keys, not string property names.

**Rationale**: Avoids naming collisions with user-defined static properties on the Model class. `Symbol.for()` uses a global registry, enabling cross-module access without import coupling. The symbols are well-known strings (`"@beep/effect-orm/MetadataRegistry"`, `"@beep/effect-orm/TableName"`) that can be reconstructed anywhere.

**Consequence**: Accessing metadata requires the accessor functions (`getMetadata`, `getTableName`) rather than direct property access. This is intentional -- it provides a stable API boundary.

### AD-4: Single-Pass Field Processing

**Decision**: The pg.Model constructor processes fields in a single pass -- iterate once, extract metadata and clean schemas simultaneously.

**Rationale**: Two-pass processing (first extract metadata, then build Model.Class) would iterate the fields twice with no benefit. Single-pass is simpler and sufficient since each field's metadata is self-contained.

### AD-5: snakeCase Uses Lodash-Style Acronym Splitting

**Decision**: `HTTPClient` becomes `http_client`, not `h_t_t_p_client`.

**Rationale**: Lodash-style splitting treats consecutive uppercase letters as an acronym and splits before the last uppercase letter that starts a new word. This matches developer expectations and is the de facto standard (Drizzle itself uses this convention). Character-by-character splitting (`h_t_t_p_client`) is confusing and uncommon.

### AD-6: Fields Without Column Metadata Are Valid

**Decision**: A field can exist in a pg.Model without any pg.Column pipe step. It simply has no metadata entry.

**Rationale**: Not every field in an Effect Model maps to a database column. Computed fields, transient fields, or fields used only for Schema validation may exist. Forcing every field through pg.Column would be unnecessarily restrictive. Completeness validation (every field that should be in Drizzle has metadata) is Phase 3's concern.

---

## 12. Reference Files

### Effect v4 (effect-smol) Source

| File | Purpose | Key Lines/Exports |
|------|---------|-------------------|
| `.repos/effect-v4/packages/effect/src/unstable/schema/Model.ts` | Model.Class, all field helpers | `Class`, `Generated`, `Sensitive`, `FieldOption`, `DateTimeInsert*`, `DateTimeUpdate*`, `JsonFromString`, `UuidV4Insert` |
| `.repos/effect-v4/packages/effect/src/unstable/schema/VariantSchema.ts` | VariantSchema.make(), Class factory, Field, Struct, extract | Lines 287-456: `make()` function including `Class` constructor at line 376 |
| `.repos/effect-v4/packages/effect/src/unstable/sql/SqlModel.ts` | makeRepository, makeDataLoaders | Lines 24-66: `makeRepository` showing `Model.Any` constraint |
| `.repos/effect-v4/packages/effect/src/Schema.ts` | Schema.Class, Schema.Struct, Schema.Top, annotations types | Core Schema API |
| `.repos/effect-v4/packages/effect/src/SchemaAST.ts` | AST types for future nullability analysis (Phase 3) | AST node types |

### ORM Project Source

| File | Purpose |
|------|---------|
| `packages/orm/src/dialects/postgres/columns.ts` | Existing column type system (tagged unions, match functions, Column factory object) |
| `packages/orm/src/Literals.ts` | DialectLiteral, RelationActionLiteral, IndexMetaLiteral, IndexMeta |
| `packages/orm/src/utils/StringLiteralKit.ts` | StringLiteralKit utility used by column types |
| `packages/orm/src/index.ts` | Package entry point -- update with new exports |
| `packages/orm/src/FieldMeta.ts` | Phase 1 deliverable: FieldMeta, ColumnMeta, RelationMeta, IndexMeta |
| `packages/orm/src/Field.ts` | Phase 1 deliverable: Field descriptor type |

### Design Documents

| File | Relevant Sections |
|------|-------------------|
| `specs/pending/effect-orm/DESIGN.md` | Section 2.1-2.4 (architecture), Section 3.1-3.2 (API), Section 5.1 (nullability), Section 8 (reference material) |
| `specs/pending/effect-orm/instructions.md` | Section 2.3 (pipe composition), Section 2.7 (extends Model.Class), Section 3.1-3.4 (architecture research) |
