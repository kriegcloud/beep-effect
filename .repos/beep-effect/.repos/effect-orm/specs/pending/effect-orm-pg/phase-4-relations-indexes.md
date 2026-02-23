# Phase 4: Relations & Indexes

> Status: **PENDING** -- Implementation spec for new Claude instances.

---

## 1. Overview

Phase 4 adds two major capabilities to the effect-orm PostgreSQL dialect:

1. **Relations** -- A unified `pg.Relation()` pipe step that produces both Drizzle FK constraints (for DDL/migrations) and Drizzle relation data (for the RQBv2 query builder via `defineRelations()`). A single declaration replaces what Drizzle requires as two separate systems.

2. **Indexes** -- Field-level pipe steps (`pg.Index.unique()`, `pg.Index.btree()`, etc.) and model-level composite indexes (`pg.Index.composite()`) that generate Drizzle index/unique-constraint builders at `toDrizzle()` time.

3. **deriveRelations()** -- A top-level function that collects all models, resolves lazy relation thunks, and produces a config compatible with Drizzle's `defineRelations()` API.

---

## 2. Prerequisites

### Completed Phases

- **Phase 1**: `FieldMeta` / `ColumnMeta` schemas, `Column` pipe steps, `Field` descriptor. The `FieldMeta` interface already has slots for `relation?: RelationMeta` and `indexes?: ReadonlyArray<IndexMeta>`.
- **Phase 2**: `pg.Model` constructor, metadata registry (`Map<string, FieldMeta>` stored as static property on Model class), variant schemas via `Model.Class`.
- **Phase 3**: `toDrizzle()` derivation with column dispatch, nullability from SchemaAST, constraints. Produces `PgTableWithColumns` from a Model class.

### Files to Read Before Starting

Read these files in this order to build context:

| Priority | File | Purpose |
|----------|------|---------|
| 1 | `specs/pending/effect-orm/DESIGN.md` | Authoritative design -- sections 3.5 (Relations), 3.6 (Indexes), 3.9 (toDrizzle) |
| 2 | `packages/orm/src/Literals.ts` | `RelationActionLiteral`, `IndexMetaLiteral`, `IndexMeta` -- already defined |
| 3 | `packages/orm/src/dialects/postgres/columns.ts` | Existing `Column` namespace and column type schemas |
| 4 | `.repos/drizzle-orm/drizzle-orm/src/pg-core/foreign-keys.ts` | Drizzle FK builder: `ForeignKeyBuilder`, `foreignKey()`, `UpdateDeleteAction` |
| 5 | `.repos/drizzle-orm/drizzle-orm/src/pg-core/indexes.ts` | Drizzle index builder: `IndexBuilderOn`, `IndexBuilder`, `index()`, `uniqueIndex()` |
| 6 | `.repos/drizzle-orm/drizzle-orm/src/pg-core/unique-constraint.ts` | Drizzle unique constraint: `unique()`, `UniqueConstraintBuilder` |
| 7 | `.repos/drizzle-orm/drizzle-orm/src/pg-core/table.ts` | `PgTableExtraConfig`, `extraConfig` callback pattern |
| 8 | `.repos/drizzle-orm/drizzle-orm/src/relations.ts` | `defineRelations()`, `One`, `Many`, `RelationsBuilder`, RQBv2 system |
| 9 | `packages/orm/test/drizzle-proof.test.ts` | Existing pattern: Column -> Drizzle builder bridge tests |

### Existing Literals (Already Implemented)

These are already defined in `packages/orm/src/Literals.ts` -- do NOT redefine them:

```typescript
// RelationActionLiteral: "cascade" | "restrict" | "no action" | "set null" | "set default"
export const RelationActionLiteral = StringLiteralKit(
  "cascade", "restrict", "no action", "set null", "set default"
);

// IndexMetaLiteral: "btree" | "hash" | "gin" | "gist" | "unique"
export const IndexMetaLiteral = StringLiteralKit(
  "btree", "hash", "gin", "gist", "unique"
);
```

---

## 3. Deliverables

### Files to Create

| File | Purpose |
|------|---------|
| `packages/orm/src/dialects/postgres/Relation.ts` | `pg.Relation()` pipe step function |
| `packages/orm/src/dialects/postgres/Index.ts` | `pg.Index` namespace: field-level + composite |
| `packages/orm/src/deriveRelations.ts` | Top-level `deriveRelations()` function |
| `packages/orm/test/relation.test.ts` | Relation pipe step + FK derivation tests |
| `packages/orm/test/index.test.ts` | Index pipe step + index derivation tests |
| `packages/orm/test/deriveRelations.test.ts` | deriveRelations() with circular references |

### Files to Modify

| File | Changes |
|------|---------|
| `packages/orm/src/dialects/postgres/toDrizzle.ts` | Add FK constraint generation from `RelationMeta`, index generation from `IndexMeta` |
| `packages/orm/src/index.ts` | Export new modules |
| `packages/orm/src/dialects/postgres/index.ts` | Export Relation and Index from PG dialect (if barrel exists) |

---

## 4. Step 1: Relation Pipe Step

### Goal

Implement `pg.Relation()` as a `FieldDescriptor => FieldDescriptor` pipe step that populates `FieldMeta.relation` with a `RelationMeta`.

### RelationMeta Interface

This is defined in DESIGN.md section 2.3:

```typescript
interface RelationMeta {
  readonly target: () => unknown   // Thunk to target field (lazy for circular refs)
  readonly onUpdate?: "cascade" | "restrict" | "no action" | "set null" | "set default"
  readonly onDelete?: "cascade" | "restrict" | "no action" | "set null" | "set default"
}
```

### Function Signature

```typescript
function Relation(
  target: () => unknown,
  config?: {
    readonly onUpdate?: RelationActionLiteral
    readonly onDelete?: RelationActionLiteral
  }
): (field: FieldDescriptor) => FieldDescriptor
```

### Thunk Pattern

The first argument is always a thunk: `() => TargetModel.fields.id`. This is critical for handling circular references between models (e.g., User references Organization, Organization references User).

The thunk is NOT evaluated at pipe construction time. It is stored as-is in the `RelationMeta` and only resolved at:
- `toDrizzle()` time (for FK constraints)
- `deriveRelations()` time (for query builder relations)

### Implementation Pattern

```typescript
const Relation = (
  target: () => unknown,
  config?: {
    readonly onUpdate?: RelationActionLiteral
    readonly onDelete?: RelationActionLiteral
  }
) => (field: FieldDescriptor): FieldDescriptor => ({
  ...field,
  meta: {
    ...field.meta,
    relation: {
      target,
      onUpdate: config?.onUpdate,
      onDelete: config?.onDelete,
    }
  }
})
```

### Usage

```typescript
organizationId: pipe(
  Schema.NonEmptyString.pipe(Schema.brand("OrganizationId")),
  pg.Column.uuid(),
  pg.Relation(() => Organization.fields.id, {
    onDelete: "cascade",
    onUpdate: "cascade"
  })
)
```

### Key Constraints

- `pg.Relation()` MUST appear after `pg.Column.xxx()` in the pipe chain (the column type must be set before relation metadata is added).
- A field may have at most ONE relation. Adding a second `pg.Relation()` in the pipe should overwrite, not merge.
- The thunk must remain unevaluated until derivation time.

### Tests for Step 1

1. `pg.Relation()` populates `FieldMeta.relation` correctly
2. Thunk is stored, not evaluated
3. `onUpdate` and `onDelete` default to `undefined` when not provided
4. Relation composes with Column in a pipe chain
5. Type: `RelationActionLiteral` is validated (only valid actions accepted)

---

## 5. Step 2: Field-Level Index Steps

### Goal

Implement field-level index pipe steps that append to `FieldMeta.indexes`.

### Available Functions

```typescript
const Index = {
  unique: (name?: string) => (field: FieldDescriptor): FieldDescriptor => ...
  btree:  (name?: string) => (field: FieldDescriptor): FieldDescriptor => ...
  hash:   (name?: string) => (field: FieldDescriptor): FieldDescriptor => ...
  gin:    (name?: string) => (field: FieldDescriptor): FieldDescriptor => ...
  gist:   (name?: string) => (field: FieldDescriptor): FieldDescriptor => ...
}
```

### IndexMeta Interface

```typescript
interface IndexMeta {
  readonly type: "btree" | "hash" | "gin" | "gist" | "unique"
  readonly name?: string
}
```

### Implementation Pattern

Each index function appends to the `indexes` array (a field can have multiple indexes):

```typescript
const unique = (name?: string) => (field: FieldDescriptor): FieldDescriptor => ({
  ...field,
  meta: {
    ...field.meta,
    indexes: [
      ...(field.meta.indexes ?? []),
      { type: "unique" as const, name }
    ]
  }
})
```

### Usage

```typescript
// Single index
email: pipe(Schema.String, pg.Column.text(), pg.Index.unique())

// Named index
email: pipe(Schema.String, pg.Column.text(), pg.Index.unique("idx_user_email"))

// Multiple indexes on one field
searchText: pipe(Schema.String, pg.Column.text(), pg.Index.gin(), pg.Index.btree())
```

### Key Constraints

- Index steps MUST appear after `pg.Column.xxx()` in the pipe chain.
- A field can have MULTIPLE indexes (append, not replace).
- `unique` at the index level is separate from `ColumnMeta.unique` (which is a column-level constraint). Both produce different Drizzle outputs: `ColumnMeta.unique` uses `.unique()` on the column builder, while `IndexMeta.unique` produces a `uniqueIndex()` in extraConfig.

### Tests for Step 2

1. Each index type populates `FieldMeta.indexes` correctly
2. Multiple indexes on one field accumulate (not overwrite)
3. Optional `name` parameter is stored
4. Index composes with Column in a pipe chain
5. `IndexMetaLiteral` type values are enforced

---

## 6. Step 3: Model-Level Composite Indexes

### Goal

Implement `pg.Index.composite()` for multi-column indexes declared in the Model constructor config.

### Function Signature

```typescript
function composite(
  name: string,
  columns: readonly string[],
  config: { readonly type: IndexMetaLiteral }
): CompositeIndexDef
```

### CompositeIndexDef Interface

```typescript
interface CompositeIndexDef {
  readonly name: string
  readonly columns: readonly string[]
  readonly type: "btree" | "hash" | "gin" | "gist" | "unique"
}
```

### Usage in Model Constructor

The Model constructor's second argument (currently annotations) needs to accept an optional `indexes` array:

```typescript
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

### Storage

Composite indexes are stored on the Model's metadata registry as a separate static property (e.g., `Model.__compositeIndexes`), not in per-field `FieldMeta`.

### Key Constraints

- Column names in the `columns` array MUST match field names in the model. Runtime validation at model construction time should warn or error on unknown column names.
- Composite index names MUST be provided (unlike field-level indexes which auto-generate names).
- Composite indexes are NOT stored in `FieldMeta.indexes` -- they are model-level, not field-level.

### Tests for Step 3

1. `pg.Index.composite()` returns a valid `CompositeIndexDef`
2. Composite indexes are stored on the Model's metadata registry
3. Column name validation: error if referencing a non-existent field
4. Integration with Model constructor: indexes passed as config

---

## 7. Step 4: Update toDrizzle() for Relations

### Goal

Extend `toDrizzle()` to generate Drizzle FK constraints from `RelationMeta` entries in the metadata registry.

### Drizzle FK API (from `.repos/drizzle-orm/drizzle-orm/src/pg-core/foreign-keys.ts`)

Two approaches exist in Drizzle for FK constraints:

**Approach A: Inline `.references()` on column builder**

```typescript
columnBuilder.references(() => otherTable.id, {
  onDelete: "cascade",
  onUpdate: "cascade"
})
```

This is the simpler approach for single-column FKs. The column builder's `.references()` method accepts a thunk and an optional actions config.

**Approach B: `foreignKey()` in extraConfig**

```typescript
pgTable("users", { ... }, (t) => [
  foreignKey({
    columns: [t.organizationId],
    foreignColumns: [otherTable.id],
  }).onDelete("cascade").onUpdate("cascade")
])
```

### Chosen Approach

Use **Approach A** (inline `.references()`) because:
- Our relations are always single-column (the thunk points to a single target field)
- It produces cleaner generated code
- It avoids the extraConfig complexity

### Implementation

During the column builder chain in `toDrizzle()`, after constructing the Drizzle column builder:

```typescript
function buildColumn(fieldName: string, fieldMeta: FieldMeta, ...) {
  let builder = /* ... existing column builder logic ... */

  // Apply FK reference from RelationMeta
  if (fieldMeta.relation) {
    const { target, onUpdate, onDelete } = fieldMeta.relation
    // Resolve the thunk NOW (at toDrizzle time)
    const targetColumn = target()
    // targetColumn is a reference to a Drizzle column on another table
    builder = builder.references(() => targetColumn, {
      ...(onDelete ? { onDelete } : {}),
      ...(onUpdate ? { onUpdate } : {}),
    })
  }

  return builder
}
```

### Thunk Resolution

The `RelationMeta.target` thunk (e.g., `() => Organization.fields.id`) must be resolved to a Drizzle column reference. This requires:

1. The target Model must already have been passed through `toDrizzle()` (or the target table must be available)
2. The resolved thunk returns a reference that can be used in `.references(() => ...)`.

**Critical Design Decision**: The thunk `() => Organization.fields.id` returns a reference to a field descriptor from the Effect Model. This is NOT directly a Drizzle column. The `toDrizzle()` function needs a way to map from effect-orm field references to Drizzle column references.

**Resolution Strategy**: Maintain a registry that maps `(ModelClass, fieldName)` -> `DrizzleColumn`. When `toDrizzle()` is called for a model, it registers each built column in this registry. When resolving a relation thunk, look up the target in the registry.

Alternatively, the thunk can directly reference the Drizzle table column if the target table has already been derived:

```typescript
// If UserTable = toDrizzle(User) has been called first:
pg.Relation(() => UserTable.id, { onDelete: "cascade" })
```

This is the simpler approach but requires derivation ordering. Document both approaches and let the implementer choose based on what Phase 3's `toDrizzle()` looks like.

### Tests for Step 4

1. `toDrizzle()` generates `.references()` calls for fields with `RelationMeta`
2. FK actions (`onDelete`, `onUpdate`) are correctly passed through
3. Thunks are resolved at derivation time, not before
4. Missing relation target errors gracefully
5. Generated table structure includes inline FK constraints

---

## 8. Step 5: Update toDrizzle() for Indexes

### Goal

Extend `toDrizzle()` to generate Drizzle index builders from both field-level `IndexMeta` and model-level `CompositeIndexDef`.

### Drizzle Index API (from `.repos/drizzle-orm/drizzle-orm/src/pg-core/indexes.ts`)

Indexes are added via the extraConfig callback on `pgTable()`:

```typescript
pgTable("users", {
  email: text("email"),
  firstName: text("first_name"),
  lastName: text("last_name"),
}, (t) => [
  uniqueIndex("idx_email").on(t.email),
  index("idx_name").on(t.firstName, t.lastName).using("btree"),
])
```

Key Drizzle functions:
- `index(name?)` -- creates `IndexBuilderOn` (non-unique)
- `uniqueIndex(name?)` -- creates `IndexBuilderOn` (unique)
- `.on(col1, col2, ...)` -- specifies columns, returns `IndexBuilder`
- `.using(method)` -- specifies index method (btree, hash, gin, gist, etc.)

### Drizzle Unique Constraint API (from `.repos/drizzle-orm/drizzle-orm/src/pg-core/unique-constraint.ts`)

```typescript
unique(name?).on(col1, col2, ...)
```

### Implementation

The `toDrizzle()` function must generate an `extraConfig` callback that produces index builders:

```typescript
function generateExtraConfig(
  fieldMetas: Map<string, FieldMeta>,
  compositeIndexes: readonly CompositeIndexDef[],
): (self: Record<string, PgColumn>) => PgTableExtraConfigValue[] {
  return (t) => {
    const configs: PgTableExtraConfigValue[] = []

    // Field-level indexes
    for (const [fieldName, meta] of fieldMetas) {
      if (!meta.indexes) continue
      for (const idx of meta.indexes) {
        const col = t[fieldName]
        if (idx.type === "unique") {
          configs.push(uniqueIndex(idx.name).on(col))
        } else {
          configs.push(index(idx.name).on(col).using(idx.type))
        }
      }
    }

    // Composite indexes
    for (const comp of compositeIndexes) {
      const cols = comp.columns.map(name => t[name])
      if (comp.type === "unique") {
        configs.push(uniqueIndex(comp.name).on(...cols))
      } else {
        configs.push(index(comp.name).on(...cols).using(comp.type))
      }
    }

    return configs
  }
}
```

### Index Name Generation

If no name is provided for a field-level index, generate one:
- Pattern: `idx_{tableName}_{fieldName}_{type}`
- Example: `idx_app_user_email_unique`

For composite indexes, the name is always required (provided by the user).

### Mapping IndexMeta.type to Drizzle

| IndexMeta.type | Drizzle Builder | Method |
|----------------|-----------------|--------|
| `"unique"` | `uniqueIndex(name).on(col)` | N/A (unique is the builder type) |
| `"btree"` | `index(name).on(col).using("btree")` | btree |
| `"hash"` | `index(name).on(col).using("hash")` | hash |
| `"gin"` | `index(name).on(col).using("gin")` | gin |
| `"gist"` | `index(name).on(col).using("gist")` | gist |

Note: `btree` is actually Drizzle's default method, but we specify it explicitly for clarity.

### Tests for Step 5

1. Field-level `unique` index generates `uniqueIndex().on(col)` in extraConfig
2. Field-level `btree` index generates `index().on(col).using("btree")`
3. Multiple field-level indexes on one column all appear in extraConfig
4. Composite index generates `index(name).on(col1, col2).using(type)`
5. Composite unique index generates `uniqueIndex(name).on(col1, col2)`
6. Auto-generated index names follow the convention
7. The generated table has both columns AND extraConfig
8. `PgTableExtraConfigValue[]` array format (not deprecated object format)

---

## 9. Step 6: deriveRelations()

### Goal

Implement a top-level function that collects all models, resolves relation thunks, and produces a config compatible with Drizzle's `defineRelations()` API.

### Drizzle defineRelations() API

From `.repos/drizzle-orm/drizzle-orm/src/relations.ts`:

```typescript
const rels = defineRelations(
  { UserTable, OrganizationTable },  // schema: all tables
  ({ one, many }) => ({
    UserTable: {
      organization: one(OrganizationTable, {
        from: UserTable.organizationId,
        to: OrganizationTable.id,
      }),
    },
    OrganizationTable: {
      users: many(UserTable, {
        from: OrganizationTable.id,
        to: UserTable.organizationId,
      }),
    },
  })
)
```

Key points:
- `one()` for belongs-to (FK holder side)
- `many()` for has-many (reverse side)
- `from`/`to` specify source/target columns
- The schema object maps table names to Drizzle table instances

### Function Signature

```typescript
function deriveRelations(
  models: readonly ModelAny[],
  tables: Record<string, PgTableWithColumns<any>>,
): ReturnType<typeof defineRelations>
```

OR a simpler approach that takes `toDrizzle` results:

```typescript
function deriveRelations(
  modelsWithTables: ReadonlyArray<{
    model: ModelAny
    table: PgTableWithColumns<any>
  }>
): ReturnType<typeof defineRelations>
```

### Algorithm

```
1. For each model, iterate over its metadata registry
2. For each field with a RelationMeta:
   a. Resolve the target thunk
   b. Identify the target model and field from the resolved reference
   c. Record: sourceModel.field -> targetModel.field (one-to-one FK link)
3. Build the schema object: { [tableTsName]: DrizzleTable }
4. Build the relations config:
   a. For each FK link (sourceModel.sourceField -> targetModel.targetField):
      - Add a `one()` relation on the source table side
      - Add a `many()` relation on the target table side (reverse)
   b. Relation names: derive from field name or target model name
5. Call defineRelations(schema, relationsConfig) and return the result
```

### Relation Name Derivation

For the FK-holding side (one):
- Use the field name without the "Id" suffix if it ends with "Id"
- Example: `organizationId` -> `organization`
- Fallback: use the target model's identifier in camelCase

For the reverse side (many):
- Use the source model's identifier in camelCase, pluralized
- Example: Source=User -> `users`
- Fallback: `${sourceModelName}s` (simple pluralization)

### Usage

```typescript
import { toDrizzle, deriveRelations } from "@beep/effect-orm"

const UserTable = toDrizzle(User)
const OrgTable = toDrizzle(Organization)

const relations = deriveRelations([
  { model: User, table: UserTable },
  { model: Organization, table: OrgTable },
])
```

### Edge Cases

1. **Self-referential relations**: A model with a FK to itself (e.g., `parentId` on a Category model). Must produce both `one` and `many` on the same table.
2. **Multiple FKs to the same target**: A model with `createdById` and `updatedById` both pointing to User. Must use `alias` to distinguish.
3. **No reverse relation needed**: Some FKs are pure DDL constraints with no query-builder relation needed. Consider an opt-out mechanism.

### Tests for Step 6

1. Basic one-to-many: User.organizationId -> Organization.id produces `one` on User, `many` on Organization
2. Self-referential: Category.parentId -> Category.id
3. Multiple FKs to same target: Post.createdById + Post.updatedById -> User.id (uses alias)
4. Return value is compatible with Drizzle's `defineRelations()` output
5. Models without relations are included in the schema but have no relation entries
6. Order of model registration does not matter

---

## 10. Step 7: Circular Reference Tests

### Goal

Verify the thunk pattern correctly handles circular references between models.

### Test Scenario: User <-> Organization

```typescript
const pg = ModelFactory.pg({ prefix: "app_" })

const OrganizationId = Schema.NonEmptyString.pipe(Schema.brand("OrganizationId"))
const UserId = Schema.NonEmptyString.pipe(Schema.brand("UserId"))

class Organization extends pg.Model<Organization>("Organization")({
  id: pipe(Model.Generated(OrganizationId), pg.Column.uuid({ primaryKey: true })),
  name: pipe(Schema.NonEmptyString, pg.Column.text()),
  // Circular: Organization references User
  ownerId: pipe(
    UserId,
    pg.Column.uuid(),
    pg.Relation(() => User.fields.id, { onDelete: "set null" })
  ),
}) {}

class User extends pg.Model<User>("User")({
  id: pipe(Model.Generated(UserId), pg.Column.uuid({ primaryKey: true })),
  name: pipe(Schema.NonEmptyString, pg.Column.text()),
  // Circular: User references Organization
  organizationId: pipe(
    OrganizationId,
    pg.Column.uuid(),
    pg.Relation(() => Organization.fields.id, { onDelete: "cascade" })
  ),
}) {}
```

### What Must Work

1. Both models can be defined without runtime errors (thunks are not evaluated at definition time)
2. `toDrizzle(User)` and `toDrizzle(Organization)` both succeed
3. FK constraints are correctly generated on both tables
4. `deriveRelations([User, Organization])` correctly resolves both directions
5. No infinite loops during thunk resolution

### Test Cases

1. **Definition-time safety**: Models with mutual thunks can be defined without errors
2. **Derivation ordering**: `toDrizzle(Organization)` works even if called before `toDrizzle(User)`, as long as both are derived before relations are resolved
3. **Relation resolution**: Both FK directions are present in the derived tables
4. **Query builder**: `deriveRelations()` produces bidirectional relations (User->Organization, Organization->User)
5. **Three-way circular**: A -> B -> C -> A, all with lazy thunks

---

## 11. Gates

### Typecheck

```bash
cd packages/orm && npx tsc --noEmit
```

### Test

```bash
cd packages/orm && npx vitest run
```

### Specific Test Files

```bash
cd packages/orm && npx vitest run test/relation.test.ts
cd packages/orm && npx vitest run test/index.test.ts
cd packages/orm && npx vitest run test/deriveRelations.test.ts
```

### Gate Policy

- Typecheck MUST pass after every step.
- Tests MUST pass after every step.
- Do NOT bypass types with `as any`, `as unknown`, `@ts-ignore`, or `@ts-expect-error`.
- If types don't fit, fix the implementation, not the type system.
- Tests verify BEHAVIOR, not implementation. A refactor of internals must not break tests.

---

## 12. Architecture Decisions

### AD-1: Thunks for Circular References

**Decision**: Use `() => TargetModel.fields.id` thunks for relation targets.

**Rationale**: JavaScript hoisting allows class declarations to be referenced before their definition in the same module scope, but the class body (including static properties like `fields`) is not initialized until the class statement executes. Wrapping in a thunk defers evaluation until `toDrizzle()` / `deriveRelations()` time, when all models are fully constructed. This is the same pattern Drizzle uses for `.references()`.

**Constraint**: Thunks MUST NOT be evaluated during model definition or pipe construction.

### AD-2: Inline .references() over foreignKey() in extraConfig

**Decision**: Use the column builder's `.references()` method rather than `foreignKey()` in extraConfig.

**Rationale**: Our relations are single-column FKs (the `pg.Relation()` pipe step is attached to a single field). The inline approach is simpler and avoids the extraConfig array merging complexity. If composite FK support is needed later, it can use `foreignKey()` in extraConfig as an additive feature.

### AD-3: extraConfig for Indexes (not inline)

**Decision**: Use the `pgTable()` extraConfig callback for index generation.

**Rationale**: Drizzle's column builders do not have inline index methods (unlike `.references()`). Indexes must be declared via `index()` / `uniqueIndex()` in the extraConfig. The `toDrizzle()` function already (or will) produce a `pgTable()` call -- adding an extraConfig callback is the natural extension point.

The extraConfig uses the ARRAY format (not the deprecated object format):

```typescript
pgTable("name", columns, (t) => [
  uniqueIndex("idx").on(t.email),
  index("idx2").on(t.firstName, t.lastName),
])
```

### AD-4: Field-Level unique vs Column-Level unique

**Decision**: `ColumnMeta.unique` (from `pg.Column.xxx({ unique: true })`) and `IndexMeta.unique` (from `pg.Index.unique()`) are separate.

**Rationale**:
- `ColumnMeta.unique` produces `.unique()` on the column builder -- a column-level UNIQUE constraint.
- `IndexMeta.unique` produces `uniqueIndex()` in extraConfig -- a table-level UNIQUE INDEX.

Both achieve uniqueness enforcement but through different DDL mechanisms. Column-level unique is simpler; index-level unique allows naming and future options (e.g., WHERE clause for partial unique indexes).

In practice, users should prefer one or the other, not both on the same field. However, the system does not prevent it.

### AD-5: deriveRelations() Takes Pre-Derived Tables

**Decision**: `deriveRelations()` takes model+table pairs, not raw models.

**Rationale**: The function needs Drizzle table instances (with built columns) to produce the `defineRelations()` config. Requiring pre-derived tables ensures the caller controls derivation order and avoids hidden side effects. The function does not call `toDrizzle()` internally.

### AD-6: Relation Name Convention

**Decision**: Auto-derive relation names from field names using these rules:
- FK holder side: strip "Id" suffix -> camelCase (e.g., `organizationId` -> `organization`)
- Reverse side: source model identifier -> lowercase + "s" (e.g., `User` -> `users`)

**Rationale**: Provides sensible defaults without requiring explicit naming in most cases. Users can override via a future `name` option on `pg.Relation()` if needed.

---

## 13. Reference Files

### Internal (effect-orm repository)

| File | Purpose |
|------|---------|
| `specs/pending/effect-orm/DESIGN.md` | Authoritative design document |
| `packages/orm/src/Literals.ts` | `RelationActionLiteral`, `IndexMetaLiteral` definitions |
| `packages/orm/src/dialects/postgres/columns.ts` | Column namespace, type schemas, `CaseMember` utility type |
| `packages/orm/test/drizzle-proof.test.ts` | Pattern: Column factory -> Drizzle builder type proof tests |

### External (Drizzle ORM source in `.repos/drizzle-orm/`)

| File | Purpose |
|------|---------|
| `drizzle-orm/src/pg-core/foreign-keys.ts` | `ForeignKeyBuilder`, `foreignKey()`, `UpdateDeleteAction` type |
| `drizzle-orm/src/pg-core/indexes.ts` | `IndexBuilderOn`, `IndexBuilder`, `index()`, `uniqueIndex()`, `PgIndexMethod` |
| `drizzle-orm/src/pg-core/unique-constraint.ts` | `unique()`, `UniqueConstraintBuilder`, `UniqueOnConstraintBuilder` |
| `drizzle-orm/src/pg-core/table.ts` | `PgTableExtraConfig`, `PgTableExtraConfigValue`, `pgTableWithSchema()`, extraConfig pattern |
| `drizzle-orm/src/pg-core/columns/common.ts` | `.references()` method on column builder (line ~358), `.unique()` method |
| `drizzle-orm/src/relations.ts` | `defineRelations()`, `One`, `Many`, `Relation`, `RelationsBuilder`, `buildRelations()` |

### External (Effect v4 source in `.repos/effect-smol/`)

| File | Purpose |
|------|---------|
| `packages/effect/src/unstable/schema/Model.ts` | `Model.Class`, field helpers, `Model.Any` |
| `packages/effect/src/Schema.ts` | Core Schema types |
| `packages/effect/src/SchemaAST.ts` | AST types for nullability analysis |

---

## Appendix: Complete Example

After Phase 4, the full workflow looks like this:

```typescript
import { Schema, pipe } from "effect"
import { Model } from "effect/unstable/schema"
import { ModelFactory, toDrizzle, deriveRelations } from "@beep/effect-orm"

const pg = ModelFactory.pg({ prefix: "app_" })

const OrganizationId = Schema.NonEmptyString.pipe(Schema.brand("OrganizationId"))
const UserId = Schema.NonEmptyString.pipe(Schema.brand("UserId"))

// --- Model Definitions ---

export class Organization extends pg.Model<Organization>("Organization")({
  id: pipe(Model.Generated(OrganizationId), pg.Column.uuid({ primaryKey: true })),
  name: pipe(Schema.NonEmptyString, pg.Column.text()),
  slug: pipe(Schema.NonEmptyString, pg.Column.varchar({ length: 63 }), pg.Index.unique()),
}) {}

export class User extends pg.Model<User>("User")({
  id: pipe(Model.Generated(UserId), pg.Column.uuid({ primaryKey: true })),
  name: pipe(Schema.NonEmptyString, pg.Column.text()),
  email: pipe(Schema.NonEmptyString, pg.Column.varchar({ length: 255 }), pg.Index.unique()),
  organizationId: pipe(
    OrganizationId,
    pg.Column.uuid(),
    pg.Relation(() => Organization.fields.id, { onDelete: "cascade" })
  ),
  createdAt: pipe(Model.DateTimeInsertFromDate, pg.Column.timestamp()),
  updatedAt: pipe(Model.DateTimeUpdateFromDate, pg.Column.timestamp()),
}, {
  indexes: [
    pg.Index.composite("idx_user_org_email", ["organizationId", "email"], { type: "unique" }),
  ]
}) {}

// --- Drizzle Table Derivation ---

const OrganizationTable = toDrizzle(Organization)
// => PgTableWithColumns<{ name: "app_organization"; columns: { id, name, slug } }>
// Includes: uniqueIndex on slug

const UserTable = toDrizzle(User)
// => PgTableWithColumns<{ name: "app_user"; columns: { id, name, email, organizationId, ... } }>
// Includes: FK on organizationId -> app_organization.id (onDelete: cascade)
// Includes: uniqueIndex on email
// Includes: uniqueIndex("idx_user_org_email") on (organizationId, email)

// --- Relations for Query Builder ---

const relations = deriveRelations([
  { model: User, table: UserTable },
  { model: Organization, table: OrganizationTable },
])
// Produces:
// UserTable: { organization: one(OrganizationTable, { from: UserTable.organizationId, to: OrganizationTable.id }) }
// OrganizationTable: { users: many(UserTable, { from: OrganizationTable.id, to: UserTable.organizationId }) }

// --- Usage with Drizzle Query Builder ---
// const user = await db.query.UserTable.findFirst({
//   with: { organization: true }
// })
```
