# Phase 5: ModelFactory & Extension

> Status: **PENDING** -- Implementation spec for new Claude instances.

---

## 1. Overview

Phase 5 is the capstone phase of `@beep/effect-orm`'s PostgreSQL dialect. It wraps all individually-working components from Phases 1-4 into a unified `ModelFactory` pattern that provides a single entry point for defining Effect Models with Drizzle derivation.

The deliverable is `ModelFactory.pg()`, which returns a dialect-scoped object `{ Column, Model, Relation, Index }` where every member is constrained to PostgreSQL-valid types. This factory supports configuration (prefix, custom columns), composition via `.extend()` for default field injection, and chainable extension for specialized contexts (org-scoped models, audited models, etc.).

After Phase 5, a user can write:

```typescript
import { Schema, pipe } from "effect"
import { Model } from "effect/unstable/schema"
import { ModelFactory } from "@beep/effect-orm"

const pg = ModelFactory.pg({ prefix: "app_" })

class User extends pg.Model<User>("User")({
  id: pipe(Model.Generated(UserId), pg.Column.uuid({ primaryKey: true })),
  name: pipe(Schema.NonEmptyString, pg.Column.text()),
  email: pipe(Schema.NonEmptyString, pg.Column.varchar({ length: 255 })),
}) {}

const drizzleUsers = toDrizzle(User)
```

---

## 2. Prerequisites

### Phase 1-4 Deliverables (Must Be Complete)

| Phase | Deliverable | What It Provides |
|-------|-------------|------------------|
| Phase 1 | FieldMeta / ColumnMeta types, Column pipe steps | `ColumnMeta`, `FieldMeta` interfaces; `pg.Column.xxx()` as `Field => Field` pipe step functions that attach column metadata |
| Phase 2 | `pg.Model` constructor, metadata registry | Model class constructor wrapping `Model.Class` from `effect/unstable/schema/Model`; static `Map<string, FieldMeta>` registry on each Model class |
| Phase 3 | `toDrizzle()` derivation | Converts a Model class + its metadata registry into a dialect-specific Drizzle `pgTable(...)` call; nullability from SchemaAST; prefix + snakeCase table name |
| Phase 4 | `pg.Relation()`, `pg.Index.xxx()`, `deriveRelations()` | FK builder as pipe step; field-level and model-level index builders; `deriveRelations()` for RQBv2 `defineRelations()` config |

### Files to Read Before Starting

Read these files in this order to understand the existing codebase:

1. `specs/pending/effect-orm/DESIGN.md` -- Authoritative design document (sections 3.1, 3.7, 3.8 are most relevant)
2. `packages/orm/src/index.ts` -- Current public exports
3. `packages/orm/src/Literals.ts` -- Dialect, RelationAction, IndexMeta literal types
4. `packages/orm/src/dialects/postgres/columns.ts` -- Existing PG column type system (Phase 1 output)
5. `packages/orm/package.json` -- Peer dependencies and scripts

Additionally, you MUST verify the actual file structure before implementing. The codebase may have evolved since this spec was written. Run:

```bash
find packages/orm/src -name "*.ts" | sort
```

Look for files that Phase 2-4 created (e.g., `Model.ts`, `FieldMeta.ts`, `toDrizzle.ts`, `Relation.ts`, `Index.ts`, or their equivalents). The exact file names and locations may differ from what this spec assumes.

### Effect v4 Reference Files

These are in `.repos/effect-smol/`:

- `packages/effect/src/unstable/schema/Model.ts` -- `Model.Class` with 6 variants
- `packages/effect/src/unstable/schema/VariantSchema.ts` -- `VariantSchema.make()`, `Class`, `Field`
- `packages/effect/src/Schema.ts` -- Core Schema/Codec types

---

## 3. Deliverables

### Files to Create

| File | Purpose |
|------|---------|
| `packages/orm/src/ModelFactory.ts` | Core `ModelFactory` namespace with `pg()` static method, config types, and `.extend()` |
| `packages/orm/src/internal/createPgFactory.ts` | Internal implementation: assembles `{ Column, Model, Relation, Index }` from Phase 1-4 components |
| `packages/orm/src/internal/customColumn.ts` | The `custom()` helper function for factory-registered and inline custom columns |
| `packages/orm/test/ModelFactory.test.ts` | Unit tests for factory creation, configuration, custom columns |
| `packages/orm/test/ModelFactory.extend.test.ts` | Unit tests for `.extend()` composition, default fields, inheritance chains |
| `packages/orm/test/ModelFactory.e2e.test.ts` | End-to-end integration: User/Organization/Post model system through full factory pipeline |

### Files to Modify

| File | Change |
|------|--------|
| `packages/orm/src/index.ts` | Add `export * as ModelFactory from "./ModelFactory.js"` (and any other new public exports) |

### Important Note on File Locations

The file paths above are the RECOMMENDED structure. Before creating any file, verify that an equivalent does not already exist. If Phase 2-4 have established different naming conventions or directory structures, follow those conventions instead.

---

## 4. Step 1: ModelFactory Interface

Define the types that describe factory configuration and the returned dialect-scoped object.

### 4.1 ModelFactoryConfig

```typescript
interface ModelFactoryConfig<
  CustomColumns extends Record<string, ColumnFn> = {}
> {
  readonly prefix?: string
  readonly customColumns?: (custom: CustomColumnHelper) => CustomColumns
}
```

- `prefix` is optional. When present, it is prepended to derived table names (e.g., `"app_"` + `"user"` = `"app_user"`).
- `customColumns` is a callback that receives a `custom()` helper and returns a record of named column functions. The callback pattern exists because `Column` does not exist yet at config time -- the custom helper is a standalone factory.

### 4.2 DialectFactory (Returned Object Shape)

```typescript
interface PgDialectFactory<
  CustomColumns extends Record<string, ColumnFn> = {},
  DefaultFields extends Record<string, unknown> = {}
> {
  readonly Column: PgBuiltInColumns & CustomColumns & { custom: InlineCustomFn }
  readonly Model: PgModelConstructor<DefaultFields>
  readonly Relation: RelationFn
  readonly Index: PgIndexFns
  readonly extend: (config: ExtendConfig<DefaultFields>) => PgDialectFactory<CustomColumns, MergedDefaultFields>
}
```

- `Column` merges built-in PG columns (from Phase 1), factory-registered custom columns, and an inline `custom()` escape hatch.
- `Model` is a curried constructor: `pg.Model<Self>(identifier)(fields, annotations?)`. When `DefaultFields` is non-empty, the `fields` parameter receives those fields automatically (merged with user-specified fields, user wins on collision).
- `Relation` and `Index` are the Phase 4 pipe step functions, passed through unchanged.
- `extend` returns a new factory with merged configuration.

### 4.3 ExtendConfig

```typescript
interface ExtendConfig<ParentDefaults extends Record<string, unknown>> {
  readonly defaultFields?: (parent: ParentDefaults) => Record<string, unknown>
}
```

- `defaultFields` receives the resolved parent defaults and returns new defaults.
- Child fields override parent fields on name collision.
- If omitted, the parent's defaults are inherited unchanged.

### 4.4 Type Constraints

- `PgModelConstructor<DefaultFields>` MUST produce classes that satisfy `Model.Any` from `effect/unstable/schema/Model`. This is the compatibility guarantee with `SqlModel.makeRepository` and `SqlModel.makeDataLoaders`.
- The returned `Column` object MUST be structurally typed such that TypeScript autocomplete shows all available column functions (built-in + custom).
- `CustomColumns` is generic so that `pg.Column.citext()` has correct return type inference -- it is NOT `any`.

### Implementation Notes

- Define these interfaces in `packages/orm/src/ModelFactory.ts`.
- The implementation detail of HOW the factory assembles the object goes in `packages/orm/src/internal/createPgFactory.ts`. The public module re-exports a clean API.
- Use namespace-style exports: the user imports `ModelFactory` and calls `ModelFactory.pg(...)`.

---

## 5. Step 2: ModelFactory.pg()

Implement the `pg()` static factory method that wires together all Phase 1-4 components.

### 5.1 Assembly Logic

`ModelFactory.pg(config)` must:

1. Read `config.prefix` (default `""`)
2. If `config.customColumns` is provided, call it with the `custom()` helper to get the custom column record
3. Merge built-in PG columns (from `packages/orm/src/dialects/postgres/columns.ts` Phase 1 output) with custom columns and the inline `custom` function
4. Create the `Model` constructor that:
   - Accepts `<Self>(identifier)(fields, annotations?)`
   - Merges any default fields from the factory into `fields` (user fields override defaults on collision)
   - Delegates to the Phase 2 `pg.Model` constructor (which wraps `Model.Class`)
   - Stores `prefix` and `identifier` on the class for `toDrizzle()` to use
5. Pass through `Relation` and `Index` from Phase 4 unchanged
6. Return `{ Column, Model, Relation, Index, extend }`

### 5.2 Column Namespace Assembly

The built-in PG columns already exist as the `Column` object in `packages/orm/src/dialects/postgres/columns.ts`. However, Phase 1 created these as plain data constructors (returning column metadata objects), not as pipe step functions.

Phase 1-2 should have converted these into `Field => Field` pipe step functions. If they did, the factory simply re-exports them. If they did not (i.e., the pipe step conversion is still needed), this phase must wrap them.

The key transformation is:

```
Phase 1 Column.uuid() -> { _tag: "uuid", type: "uuid", category: "UuidColumnType" }
Phase 2 pg.Column.uuid(config) -> (field: Field) => Field  // pipe step that attaches ColumnMeta
```

Verify which form exists before implementing.

### 5.3 Model Constructor Wrapping

The Model constructor signature:

```typescript
pg.Model<Self>(identifier)(fields, annotations?)
```

Under the hood:

```typescript
function createPgModel<DefaultFields>(prefix: string, defaultFields: DefaultFields) {
  return function <Self>() {
    return function (identifier: string) {
      return function (fields: UserFields, annotations?) {
        const mergedFields = { ...defaultFields, ...fields }
        // Delegate to Phase 2 Model constructor
        // Store prefix + identifier for toDrizzle()
        return Phase2Model<Self>(identifier)(mergedFields, annotations)
      }
    }
  }
}
```

The exact generic signature depends on what Phase 2 established. Read the Phase 2 Model constructor to understand its type parameters before implementing the wrapper.

### 5.4 Prefix Storage

The `prefix` must be accessible at `toDrizzle()` time. Two approaches:

**Option A: Static property on the Model class**
```typescript
class User extends pg.Model<User>("User")({ ... }) {}
User.__prefix  // "app_"
```

**Option B: Metadata registry entry**
```typescript
MetadataRegistry.get(User).prefix  // "app_"
```

Check what Phase 2-3 established for metadata storage. The prefix MUST be stored somewhere that `toDrizzle()` can read. If Phase 3's `toDrizzle()` already handles prefix, this step is just wiring the config value through.

### 5.5 Destructuring Support

The returned object must support destructuring:

```typescript
const { Column, Model, Relation, Index } = ModelFactory.pg({ prefix: "app_" })
```

This means all members must be self-contained (no `this` binding issues). If `Model` internally references the factory's prefix or defaults, those must be captured via closure, not via `this`.

---

## 6. Step 3: Custom Column Registration

### 6.1 The `custom()` Helper

The `custom()` function is passed to the `customColumns` callback. It creates a column pipe step function from a custom column definition.

```typescript
interface CustomColumnDef<TData = unknown, TDriverParam = unknown> {
  readonly dataType: (config?: unknown) => string
  readonly toDriver?: (value: TData) => TDriverParam
  readonly fromDriver?: (value: TDriverParam) => TData
}

function custom<TData = unknown, TDriverParam = unknown>(
  def: CustomColumnDef<TData, TDriverParam>
): ColumnFn
```

The returned `ColumnFn` is a pipe step `(config?) => (field: Field) => Field` that attaches a `ColumnMeta` with:

```typescript
{
  columnType: "custom",
  dataType: def.dataType(),
  customDataType: def.dataType,
  toDriver: def.toDriver,
  fromDriver: def.fromDriver,
}
```

### 6.2 Factory-Registered Columns

When the factory config includes `customColumns`:

```typescript
const pg = ModelFactory.pg({
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
```

These are merged onto `pg.Column`:

```typescript
pg.Column.uuid()    // built-in
pg.Column.citext()  // factory-registered custom
pg.Column.money()   // factory-registered custom
```

Implementation: the factory spreads `{ ...builtInColumns, ...customColumns, custom: inlineCustomFn }`.

### 6.3 Inline Custom Columns

For one-off columns:

```typescript
pipe(
  Schema.String,
  pg.Column.custom<string, string>({
    dataType: () => "tsvector",
    toDriver: (v) => v,
    fromDriver: (v) => v,
  })()
)
```

`pg.Column.custom` is the `custom()` helper exposed directly on the Column namespace. The double-call pattern `custom(def)()` first creates the column function, then invokes it (with optional config) to get the pipe step.

### 6.4 ColumnMeta Uniformity

Custom columns MUST produce the same `ColumnMeta` shape that built-in columns produce. This ensures `toDrizzle()` handles them identically. The `toDrizzle()` function (Phase 3) checks for `ColumnMeta.customDataType` and uses Drizzle's `customType()` when present.

Verify that Phase 3's `toDrizzle()` already handles the `customDataType` / `toDriver` / `fromDriver` fields. If not, this step must add that handling.

### 6.5 Type Safety for Custom Columns

The `custom<TData, TDriverParam>()` generics flow through to the type system:

- `TData` is the TypeScript type the user works with
- `TDriverParam` is the TypeScript type the database driver produces/consumes
- The same driver-type / Schema.Encoded alignment rules apply as for built-in columns
- If `TDriverParam` does not match `Schema.Encoded`, `pg.Column.transform()` is needed

---

## 7. Step 4: Factory Extension (.extend())

### 7.1 .extend() Semantics

```typescript
const orgPg = pg.extend({
  defaultFields: (parent) => ({
    ...parent,
    organizationId: pipe(
      Schema.NonEmptyString.pipe(Schema.brand("OrganizationId")),
      pg.Column.uuid(),
      pg.Relation(() => Organization.fields.id, { onDelete: "cascade" })
    )
  })
})
```

`.extend()` returns a NEW factory with the same shape `{ Column, Model, Relation, Index, extend }`.

### 7.2 Inheritance Rules

| Property | Behavior |
|----------|----------|
| `prefix` | Inherited from parent; NOT overridable via `.extend()` (prefix is set once at `ModelFactory.pg()` time) |
| `customColumns` | Inherited from parent; NOT overridable via `.extend()` (custom columns are set once at `ModelFactory.pg()` time) |
| `Column` | Identical to parent (same reference) |
| `Relation` | Identical to parent (same reference) |
| `Index` | Identical to parent (same reference) |
| `defaultFields` | Resolved by calling `config.defaultFields(parentDefaults)`. Child fields override parent on name collision. |
| `Model` | New constructor that includes merged default fields |
| `extend` | New extend that captures the merged defaults as the new parent |

### 7.3 Chaining

```typescript
const base = ModelFactory.pg({ prefix: "app_" })
const timestamped = base.extend({
  defaultFields: () => ({
    createdAt: pipe(Model.DateTimeInsertFromDate, base.Column.timestamp()),
    updatedAt: pipe(Model.DateTimeUpdateFromDate, base.Column.timestamp()),
  })
})
const orgScoped = timestamped.extend({
  defaultFields: (parent) => ({
    ...parent,
    organizationId: pipe(
      Schema.NonEmptyString.pipe(Schema.brand("OrganizationId")),
      base.Column.uuid(),
      base.Relation(() => Organization.fields.id, { onDelete: "cascade" })
    )
  })
})
```

`orgScoped.Model` automatically includes `createdAt`, `updatedAt`, and `organizationId`.

### 7.4 Implementation Approach

```typescript
function createExtend(currentConfig) {
  return function extend(extendConfig) {
    const parentDefaults = currentConfig.defaultFields ?? {}
    const newDefaults = extendConfig.defaultFields
      ? extendConfig.defaultFields(parentDefaults)
      : parentDefaults

    return createPgFactory({
      ...currentConfig,
      defaultFields: newDefaults,
    })
  }
}
```

Each `.extend()` call creates a new factory via `createPgFactory()` with the merged defaults. The Column, Relation, and Index references are shared (same objects).

### 7.5 Default Field Merging in Model Constructor

When a user defines fields on an extended factory's Model:

```typescript
class OrgModel extends orgPg.Model<OrgModel>("OrgModel")({
  name: pipe(Schema.String, orgPg.Column.text()),
}) {}
```

The Model constructor merges:
1. Factory default fields: `{ createdAt, updatedAt, organizationId }`
2. User-specified fields: `{ name }`
3. Result: `{ createdAt, updatedAt, organizationId, name }`

User fields win on collision. If the user defines `createdAt`, it overrides the factory default.

### 7.6 Relation Thunks in Default Fields

Relations in default fields use thunks (`() => Organization.fields.id`). These thunks are NOT evaluated at factory construction time or at `.extend()` time. They are evaluated lazily at `toDrizzle()` time. This means:

- Circular references between models are safe
- The target model does not need to exist when the factory is created
- The thunk captures a concrete reference, so the factory does NOT need to be generic over relation targets

---

## 8. Step 5: Table Name Prefixing

### 8.1 Prefix Flow

```
ModelFactory.pg({ prefix: "app_" })
  -> stored in factory closure
  -> passed to Model constructor
  -> stored on Model class (static property or metadata registry)
  -> read by toDrizzle() at derivation time
  -> table name = prefix + snakeCase(identifier)
```

### 8.2 snakeCase Conversion

Table name derivation: `prefix + snakeCase(identifier)`.

Snake-case rules (lodash-style camelCase splitting):
- `"User"` -> `"user"`
- `"UserProfile"` -> `"user_profile"`
- `"HTTPClient"` -> `"http_client"` (NOT `"h_t_t_p_client"`)
- `"OrgModel"` -> `"org_model"`

If Phase 3 already implements this conversion in `toDrizzle()`, no additional work is needed here. Just ensure the prefix is available.

### 8.3 Table Name Override

The Model constructor supports an optional `tableName` override:

```typescript
class User extends pg.Model<User>("User", { tableName: "custom_users" })({
  // fields
}) {}
```

When `tableName` is provided, it is used as-is (prefix is NOT applied). Verify whether Phase 2/3 already support this pattern.

### 8.4 Verification

After implementing prefix integration:

```typescript
const pg = ModelFactory.pg({ prefix: "app_" })

class User extends pg.Model<User>("User")({ ... }) {}
class UserProfile extends pg.Model<UserProfile>("UserProfile")({ ... }) {}

const userTable = toDrizzle(User)
const profileTable = toDrizzle(UserProfile)

// userTable name should be "app_user" (or "app_users" depending on convention)
// profileTable name should be "app_user_profile" (or "app_user_profiles")
```

Verify the exact singularity/plurality convention established by Phase 3.

---

## 9. Step 6: Public API Export

### 9.1 Index.ts Updates

`packages/orm/src/index.ts` must export the `ModelFactory` namespace and any supporting types:

```typescript
export * as ModelFactory from "./ModelFactory.js"
```

Users import as:

```typescript
import { ModelFactory } from "@beep/effect-orm"

const pg = ModelFactory.pg({ prefix: "app_" })
```

### 9.2 Re-exports

The `ModelFactory` module should also re-export `toDrizzle` and `deriveRelations` for convenience, OR those should be exported from the package index separately:

```typescript
export { toDrizzle } from "./toDrizzle.js"
export { deriveRelations } from "./deriveRelations.js"
```

Check what Phase 3-4 established for these exports. The goal is a clean import surface:

```typescript
import { ModelFactory, toDrizzle, deriveRelations } from "@beep/effect-orm"
```

### 9.3 Type Exports

Export the config types for users who need to type their factory configurations:

```typescript
export type { ModelFactoryConfig, ExtendConfig, PgDialectFactory } from "./ModelFactory.js"
```

### 9.4 No Barrel Files for Internal Modules

Files in `packages/orm/src/internal/` are NOT exported. They are implementation details consumed only by `ModelFactory.ts`.

---

## 10. Step 7: End-to-End Integration Tests

### 10.1 Test File: `packages/orm/test/ModelFactory.e2e.test.ts`

This test file exercises the full pipeline: factory creation -> model definition -> Drizzle derivation -> relation derivation.

### 10.2 Test Scenario: Multi-Model System

Define a realistic model system:

```typescript
import { Schema, pipe } from "effect"
import { Model } from "effect/unstable/schema"
import { ModelFactory, toDrizzle, deriveRelations } from "@beep/effect-orm"

const UserId = Schema.String.pipe(Schema.brand("UserId"))
const OrganizationId = Schema.String.pipe(Schema.brand("OrganizationId"))
const PostId = Schema.String.pipe(Schema.brand("PostId"))

const pg = ModelFactory.pg({ prefix: "app_" })

const basePg = pg.extend({
  defaultFields: () => ({
    createdAt: pipe(Model.DateTimeInsertFromDate, pg.Column.timestamp()),
    updatedAt: pipe(Model.DateTimeUpdateFromDate, pg.Column.timestamp()),
  })
})

class Organization extends basePg.Model<Organization>("Organization")({
  id: pipe(Model.Generated(OrganizationId), pg.Column.uuid({ primaryKey: true })),
  name: pipe(Schema.NonEmptyString, pg.Column.text()),
}) {}

const orgPg = basePg.extend({
  defaultFields: (parent) => ({
    ...parent,
    organizationId: pipe(
      OrganizationId,
      pg.Column.uuid(),
      pg.Relation(() => Organization.fields.id, { onDelete: "cascade" })
    ),
  })
})

class User extends orgPg.Model<User>("User")({
  id: pipe(Model.Generated(UserId), pg.Column.uuid({ primaryKey: true })),
  name: pipe(Schema.NonEmptyString, pg.Column.text()),
  email: pipe(Schema.NonEmptyString, pg.Column.varchar({ length: 255 }), pg.Index.unique()),
}) {}

class Post extends orgPg.Model<Post>("Post")({
  id: pipe(Model.Generated(PostId), pg.Column.uuid({ primaryKey: true })),
  title: pipe(Schema.NonEmptyString, pg.Column.text()),
  body: pipe(Schema.String, pg.Column.text()),
  authorId: pipe(
    UserId,
    pg.Column.uuid(),
    pg.Relation(() => User.fields.id, { onDelete: "cascade" })
  ),
}) {}
```

### 10.3 Test Cases

```
describe("ModelFactory end-to-end", () => {
  describe("factory creation", () => {
    it("ModelFactory.pg() returns { Column, Model, Relation, Index, extend }")
    it("pg.Column has all built-in PG column functions")
    it("pg.Model is callable with <Self>(identifier)(fields)")
  })

  describe("model definition with factory", () => {
    it("Organization model has id, name, createdAt, updatedAt fields")
    it("User model has id, name, email, organizationId, createdAt, updatedAt fields")
    it("Post model has id, title, body, authorId, organizationId, createdAt, updatedAt fields")
    it("models satisfy Model.Any constraint")
    it("models have all 6 variant schemas (select, insert, update, json, jsonCreate, jsonUpdate)")
  })

  describe("default field injection", () => {
    it("basePg models include createdAt and updatedAt")
    it("orgPg models include createdAt, updatedAt, and organizationId")
    it("user-specified fields override defaults on collision")
  })

  describe("Drizzle derivation", () => {
    it("toDrizzle(Organization) produces table named 'app_organization'")
    it("toDrizzle(User) produces table named 'app_user'")
    it("toDrizzle(Post) produces table named 'app_post'")
    it("derived tables have correct column types")
    it("derived tables have correct primary keys")
    it("derived tables have correct foreign key references")
    it("derived tables have correct indexes")
  })

  describe("relation derivation", () => {
    it("deriveRelations([Organization, User, Post]) produces valid config")
    it("User -> Organization relation is detected")
    it("Post -> Organization relation is detected")
    it("Post -> User relation is detected")
  })

  describe("custom columns", () => {
    it("factory-registered custom columns appear on pg.Column")
    it("custom column produces correct ColumnMeta")
    it("toDrizzle handles custom columns via Drizzle customType()")
    it("inline custom columns work via pg.Column.custom()")
  })

  describe("factory extension chaining", () => {
    it("base.extend().extend() correctly chains defaults")
    it("child factory inherits prefix from parent")
    it("child factory inherits custom columns from parent")
    it("extend without defaultFields inherits parent defaults unchanged")
  })
})
```

### 10.4 Testing Behavior, Not Implementation

Tests MUST verify WHAT the system does, not HOW:

- Verify the Model has the right fields by checking `Model.fields`
- Verify Drizzle tables have correct structure by inspecting the derived table
- Verify relations by checking the `deriveRelations()` output
- Do NOT test internal metadata structures directly
- Do NOT test that specific internal functions were called

### 10.5 Type-Level Tests

Include compile-time type assertions using the `void _check` pattern established in existing tests:

```typescript
it("toDrizzle produces PgTableWithColumns", () => {
  const table = toDrizzle(User)
  const _check: PgTableWithColumns<{ name: "app_user"; columns: { /* ... */ } }> = table
  void _check
})
```

---

## 11. Gates

### Typecheck

```bash
cd /home/elpresidank/YeeBois/projects/effect-orm && turbo run check
```

This runs `tsc -b tsconfig.json` for all packages. ALL type errors must be resolved before the phase is considered complete. No `as any`, no `@ts-ignore`, no `@ts-expect-error`.

### Test

```bash
cd /home/elpresidank/YeeBois/projects/effect-orm && turbo run test
```

This runs vitest for all packages. ALL tests must pass, including existing tests from Phase 1-4.

### Lint

```bash
cd /home/elpresidank/YeeBois/projects/effect-orm && turbo run lint
```

Biome linting must pass. Follow existing code style (no semicolons or with semicolons -- match existing convention).

### Run Order

Always run gates in this order: check -> test -> lint. Fix issues in the same order. A type error may cause test failures; fix the type error first.

---

## 12. Architecture Decisions

### AD-1: Factory Returns Frozen Object

The returned `{ Column, Model, Relation, Index, extend }` should be a plain object. Do NOT use a class instance. This avoids `this` binding issues with destructuring and keeps the API simple.

### AD-2: Prefix is Immutable After Factory Creation

The prefix is set at `ModelFactory.pg({ prefix })` time and cannot be changed via `.extend()`. This prevents confusion about which prefix applies to which models. If a different prefix is needed, create a separate factory.

### AD-3: Custom Columns are Immutable After Factory Creation

Like prefix, custom columns are set once at `ModelFactory.pg()` time. `.extend()` does NOT add or modify custom columns. This keeps the Column namespace stable across the extension chain.

### AD-4: Default Fields Merge with Shallow Override

When `.extend()` provides `defaultFields`, the merge is a shallow object spread: `{ ...parentDefaults, ...childDefaults }`. There is no deep merging. A child field with the same key completely replaces the parent field. This is simple, predictable, and matches JavaScript semantics.

### AD-5: Model Constructor is Self-Contained

`pg.Model<Self>(identifier)(fields)` must work without any external state beyond what is captured in the closure. The factory creates the Model constructor with all necessary context (prefix, defaults, dialect) baked in. This means:

- No global state
- No mutable singletons
- Multiple factories can coexist in the same process
- Each factory is independent

### AD-6: Relation Thunks are Never Eagerly Evaluated

The factory MUST NOT evaluate relation thunks (`() => Organization.fields.id`) during:
- Factory construction (`ModelFactory.pg()`)
- Factory extension (`.extend()`)
- Model class creation (`pg.Model<Self>(identifier)(fields)`)

Thunks are evaluated ONLY by `toDrizzle()` and `deriveRelations()` at derivation time. This is critical for circular reference support.

### AD-7: No Dialect Abstraction Layer

Phase 5 implements ONLY `ModelFactory.pg()`. There is no abstract base factory or shared dialect interface. When mysql/sqlite/mssql are added later, each will be its own implementation. Premature abstraction across dialects would add complexity without value at this stage.

### AD-8: Column Pipe Steps Must Be Idempotent Regarding Schema

A `pg.Column.xxx()` pipe step enriches the field's metadata but MUST NOT modify the Effect Schema. The Schema remains unchanged through the pipe chain. Only `FieldMeta` is affected. This preserves the separation between the Schema world and the ORM metadata world.

---

## 13. Reference Files

### Codebase (Verify These Exist)

| File | What to Look For |
|------|------------------|
| `packages/orm/src/dialects/postgres/columns.ts` | Phase 1: PG column type system, `Column` object |
| `packages/orm/src/Literals.ts` | Dialect, RelationAction, IndexMeta literal types |
| `packages/orm/src/index.ts` | Current exports |
| `packages/orm/test/column-factory.test.ts` | Phase 1 test patterns |
| `packages/orm/test/drizzle-proof.test.ts` | Type bridge proof pattern |
| `packages/orm/package.json` | Dependencies, scripts |

### Design Documents

| File | Relevant Sections |
|------|-------------------|
| `specs/pending/effect-orm/DESIGN.md` | Section 3.1 (ModelFactory), 3.7 (Custom Columns), 3.8 (Factory Composition) |
| `specs/pending/effect-orm/instructions.md` | Section 2.2 (ModelFactory Pattern), 5 (Custom Column Design) |

### Effect v4 Source (in `.repos/effect-smol/`)

| File | What to Reference |
|------|-------------------|
| `packages/effect/src/unstable/schema/Model.ts` | `Model.Class` constructor signature, field helpers |
| `packages/effect/src/unstable/schema/VariantSchema.ts` | `VariantSchema.Class`, `Field`, 6 variants |
| `packages/effect/src/Schema.ts` | `Schema.Struct`, `Schema.brand`, `Schema.NonEmptyString` |

### Drizzle ORM Source (if available in `.repos/drizzle-orm/`)

| File | What to Reference |
|------|-------------------|
| `drizzle-orm/src/pg-core/table.ts` | `pgTable()` function signature |
| `drizzle-orm/src/pg-core/columns/custom.ts` | `customType()` for custom column handling |
| `drizzle-orm/src/relations.ts` | RQBv2 `defineRelations()` |

---

## Appendix A: Complete Usage Example

This is the "gold standard" usage that Phase 5 must support:

```typescript
import { Schema, pipe } from "effect"
import { Model } from "effect/unstable/schema"
import { ModelFactory, toDrizzle, deriveRelations } from "@beep/effect-orm"

const UserId = Schema.String.pipe(Schema.brand("UserId"))
const OrganizationId = Schema.String.pipe(Schema.brand("OrganizationId"))
const PostId = Schema.String.pipe(Schema.brand("PostId"))

const pg = ModelFactory.pg({
  prefix: "app_",
  customColumns: (custom) => ({
    citext: custom({
      dataType: () => "citext",
      toDriver: (v: string) => v,
      fromDriver: (v: string) => v,
    }),
  }),
})

const basePg = pg.extend({
  defaultFields: () => ({
    createdAt: pipe(Model.DateTimeInsertFromDate, pg.Column.timestamp()),
    updatedAt: pipe(Model.DateTimeUpdateFromDate, pg.Column.timestamp()),
  }),
})

class Organization extends basePg.Model<Organization>("Organization")({
  id: pipe(Model.Generated(OrganizationId), pg.Column.uuid({ primaryKey: true })),
  name: pipe(Schema.NonEmptyString, pg.Column.text()),
  slug: pipe(Schema.NonEmptyString, pg.Column.citext(), pg.Index.unique()),
}) {}

const orgPg = basePg.extend({
  defaultFields: (parent) => ({
    ...parent,
    organizationId: pipe(
      OrganizationId,
      pg.Column.uuid(),
      pg.Relation(() => Organization.fields.id, { onDelete: "cascade" }),
    ),
  }),
})

class User extends orgPg.Model<User>("User")({
  id: pipe(Model.Generated(UserId), pg.Column.uuid({ primaryKey: true })),
  name: pipe(Schema.NonEmptyString, pg.Column.text()),
  email: pipe(Schema.NonEmptyString, pg.Column.varchar({ length: 255 }), pg.Index.unique()),
  passwordHash: pipe(Model.Sensitive(Schema.String), pg.Column.text()),
}) {}

class Post extends orgPg.Model<Post>("Post")({
  id: pipe(Model.Generated(PostId), pg.Column.uuid({ primaryKey: true })),
  title: pipe(Schema.NonEmptyString, pg.Column.text()),
  body: pipe(Schema.String, pg.Column.text()),
  authorId: pipe(
    UserId,
    pg.Column.uuid(),
    pg.Relation(() => User.fields.id, { onDelete: "cascade" }),
  ),
}) {}

const OrgTable = toDrizzle(Organization)
const UserTable = toDrizzle(User)
const PostTable = toDrizzle(Post)

const relations = deriveRelations([Organization, User, Post])
```

Expected outcomes:
- `OrgTable` is `pgTable("app_organization", { id: uuid(...).primaryKey(), name: text(...), slug: customType(citext)..., createdAt: timestamp(...), updatedAt: timestamp(...) })`
- `UserTable` is `pgTable("app_user", { id: uuid(...).primaryKey(), name: text(...), email: varchar({ length: 255 })..., passwordHash: text(...), organizationId: uuid(...)..., createdAt: timestamp(...), updatedAt: timestamp(...) })`
- `PostTable` is `pgTable("app_post", { id: uuid(...).primaryKey(), title: text(...), body: text(...), authorId: uuid(...)..., organizationId: uuid(...)..., createdAt: timestamp(...), updatedAt: timestamp(...) })`
- `User` satisfies `Model.Any` and works with `SqlModel.makeRepository`
- `User.insert` schema excludes `id` (Generated) and `passwordHash` is excluded from json variants (Sensitive)

---

## Appendix B: Checklist

Use this checklist to track progress:

- [ ] Read all prerequisite files and verify Phase 1-4 output
- [ ] Step 1: Define ModelFactoryConfig, PgDialectFactory, ExtendConfig types
- [ ] Step 2: Implement ModelFactory.pg() assembling Column, Model, Relation, Index
- [ ] Step 3: Implement custom() helper, factory-registered columns, inline custom
- [ ] Step 4: Implement .extend() with default field merging and chaining
- [ ] Step 5: Verify prefix integration with toDrizzle()
- [ ] Step 6: Update index.ts exports
- [ ] Step 7: Write integration tests
- [ ] Gate: `turbo run check` passes
- [ ] Gate: `turbo run test` passes
- [ ] Gate: `turbo run lint` passes
