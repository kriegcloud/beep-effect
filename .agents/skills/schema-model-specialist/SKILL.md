---
name: schema-model-specialist
description: >
  Advanced schema-first domain modeling with Model.Class, EntityId, $I identity
  composers, LiteralKit, S.TemplateLiteral, S.toTaggedUnion, Table.make, and
  DomainModel.make. Use when creating persisted CRUD entities, defining entity
  ids, composing tagged unions, building URI schemas, wiring drizzle tables, or
  reviewing domain model code for repo-law compliance.
---

# Schema Model Specialist

Use this skill for domain model authoring in this repository. It extends
`schema-first-development` with the advanced patterns required for persisted
entities, identity composers, variant-aware Model classes, and drizzle table
factories.

Treat every rule below as enforced repository law.

## Workflow

1. Classify the task.
   - New persisted CRUD entity (Model.Class + Table.make)
   - New EntityId definition
   - New literal domain or tagged union (LiteralKit + S.toTaggedUnion)
   - New URI or template-validated string (S.TemplateLiteral)
   - New tagged error (TaggedErrorClass)
   - Review or lint-fix of model code

2. Load only the reference sections you need from this document plus:
   - Repository laws: `schema-first-development` skill
   - Effect-first rules: `effect-first-development` skill

3. Apply the patterns in the order documented below.

4. Verify before finishing using the checklist at the end.

## Identity Composer Pattern ($I)

Every schema in the codebase receives a unique identity path via an
`IdentityComposer`. The root composers live in `@beep/identity/packages` and
are named `$SharedDomainId`, `$SchemaId`, `$IamDomainId`, etc.

### Setup

```ts
import { $SharedDomainId } from "@beep/identity/packages"

// Create a file-scoped composer. The segment is the path from the package
// `src/` directory to this file, without extension.
const $I = $SharedDomainId.create("entities/Task/Task.model")
```

### Usage with class schemas (S.Class, Model.Class)

The first argument to `S.Class` or `Model.Class` is the schema identifier
produced by the template-literal call. The annotation object produced by
`$I.annote(...)` is passed as a trailing argument.

```ts
class Task extends S.Class<Task>($I`Task`)({
  name: S.String,
}, $I.annote("Task", { description: "A task entity." })) {}
```

### Usage with TaggedErrorClass

```ts
import { TaggedErrorClass } from "@beep/schema"

class TaskNotFoundError extends TaggedErrorClass<TaskNotFoundError>($I`TaskNotFoundError`)(
  "TaskNotFoundError",
  { taskId: S.Number, message: S.String },
  $I.annote("TaskNotFoundError", { description: "Raised when a task lookup fails." })
) {}
```

### Usage with non-class schemas

Non-class schemas use `$I.annoteSchema(...)` which returns a function that
calls `self.annotate(...)`.

```ts
const TaskName = S.NonEmptyTrimmedString.pipe(
  S.brand("TaskName"),
  $I.annoteSchema("TaskName", { description: "A validated task name." })
)
export type TaskName = typeof TaskName.Type
```

### How $I works internally

- `$I\`SchemaName\`` (template literal call) produces an identity string:
  `"@beep/shared-domain/entities/Task/Task.model/SchemaName"`.
- `$I.annote("Name", extras)` returns an annotation record containing
  `schemaId` (an interned `Symbol` via `Symbol.for`), `identifier`, `title`,
  and any caller-supplied extras (e.g. `description`).
- `$I.annoteSchema("Name", extras)` returns a function
  `(self: Schema) => Schema` that applies the annotation record to a schema via
  `self.annotate(...)`.
- `$I.create("subpath")` creates a child composer for deeper nesting.
- `$I.compose("a", "b")` batch-creates child composers keyed as `$AId`, `$BId`.

## Model.Class (variant-aware domain models)

For any entity persisted to SQLite, use the `DomainModel.make` factory from
`@beep/shared-domain`. This factory is built on `@beep/schema/Model` which
itself wraps `VariantSchema`. It pre-merges the standard audit columns so
every model automatically gets `createdAt`, `updatedAt`, `deletedAt`,
`createdBy`, `updatedBy`, `deletedBy`, `version`, and `source`.

### Canonical pattern

```ts
import { $SharedDomainId } from "@beep/identity/packages"
import * as M from "@beep/schema/Model"
import { Shared } from "@beep/shared-domain/entity-ids"
import { DomainModel } from "@beep/shared-domain/factories"

const $I = $SharedDomainId.create("entities/Task/Task.model")

export class Task extends DomainModel.make<Task>($I`TaskModel`)(
  {
    id: M.Generated(Shared.TaskId),
    name: S.NonEmptyTrimmedString,
    status: TaskStatus,
  },
  $I.annote("TaskModel", { description: "Persisted task entity." })
) {}
```

### Auto-generated variants

A Model class produces six variant schemas:

| Variant          | Purpose                 | Generated/Optional fields            |
|------------------|-------------------------|--------------------------------------|
| `Task`           | select (default)        | All fields present                   |
| `Task.insert`    | database insert          | `M.Generated` fields omitted         |
| `Task.update`    | database patch           | id required, rest optional           |
| `Task.json`      | API read                 | `M.Sensitive` fields omitted         |
| `Task.jsonCreate`| API creation payload     | No Generated or Sensitive fields     |
| `Task.jsonUpdate`| API update payload       | id required, rest optional, no Sensitive |

Each variant has a `.make()` constructor.

### DomainModel.make default fields

The `DomainModel` factory merges these default audit fields into every model:

```ts
// From packages/shared/domain/src/factories/DomainModel.ts
{
  createdAt: M.DateTimeInsertFromNumber,  // DateTimeUtc from millis, auto-set on insert
  updatedAt: M.DateTimeUpdateFromNumber,  // DateTimeUtc from millis, auto-set on insert+update
  deletedAt: M.FieldOption(S.DateTimeUtcFromMillis),  // optional nullable
  createdBy: M.FieldOption(S.String),     // optional actor string
  updatedBy: M.FieldOption(S.String),
  deletedBy: M.FieldOption(S.String),
  version:   M.Generated(NonNegativeInt), // auto-incrementing, db-generated
  source:    M.FieldOption(S.String),     // optional provenance
}
```

You only define the entity-specific fields (e.g. `id`, `name`, `status`).

### Model field helpers

| Helper                    | Variants present                        | Use case                          |
|---------------------------|-----------------------------------------|-----------------------------------|
| `M.Generated(schema)`    | select, update, json                    | DB-generated (id, version)        |
| `M.GeneratedByApp(schema)` | select, insert, update, json          | App-generated (UUID, slug)        |
| `M.Sensitive(schema)`    | select, insert, update                  | Never in JSON (password hash)     |
| `M.FieldOption(schema)`  | All variants, nullable/optional         | Nullable columns                  |
| `M.Field({...})`         | Specified variants only                 | Custom per-variant schemas        |
| `M.FieldOnly(["json"])(s)` | Only listed variants                  | JSON-only computed fields         |
| `M.FieldExcept(["insert"])(s)` | All except listed                 | Read-only fields                  |
| `M.DateTimeInsertFromNumber` | select+insert+json, auto-now on insert | `createdAt`                    |
| `M.DateTimeUpdateFromNumber` | select+insert+update+json, auto-now   | `updatedAt`                    |
| `M.BooleanSqlite`        | All (0/1 in DB, boolean in JSON)        | Boolean columns                   |

## EntityId

Entity ids are branded positive integers created via a per-slice factory.

### Defining entity ids

```ts
import { $SharedDomainId } from "@beep/identity/packages"
import { EntityId } from "@beep/shared-domain/entity-ids/_internal"

const $I = $SharedDomainId.create("entity-ids/MySlice")
const make = EntityId.factory("my_slice", $I)

export const TaskId = make("TaskId", { tableName: "task" })
export type TaskId = typeof TaskId.Type
```

The resulting schema:
- Validates: safe integer, >= 1, <= `Number.MAX_SAFE_INTEGER`
- Branded with the tag string (e.g. `"TaskId"`)
- Carries `_tag`, `tableName`, and `slice` statics for table factory consumption

### Using entity ids in models

```ts
id: M.Generated(Shared.TaskId)
```

The `M.Generated` wrapper ensures the `id` field is omitted from `insert`
(auto-increment) and present in `select`, `update`, and `json`.

## LiteralKit

Use `LiteralKit` for any literal string union that needs runtime helpers.
Never use raw `S.Literal(...)` or `S.Literals(...)` for internal literal
domains.

### Definition

```ts
import { LiteralKit } from "@beep/schema"

const TaskStatus = LiteralKit(["draft", "active", "completed", "archived"])
```

### Available helpers

| Helper                | Type                                     | Purpose                       |
|-----------------------|------------------------------------------|-------------------------------|
| `TaskStatus.Options`  | `readonly ["draft", "active", ...]`      | The raw literal tuple         |
| `TaskStatus.Enum`     | `{ draft: "draft", active: "active", ...}` | Enum-like object            |
| `TaskStatus.is.draft` | `(u: unknown) => boolean`                | Per-member type guard         |
| `TaskStatus.$match`   | `(value, cases) => result`               | Exhaustive pattern match      |
| `TaskStatus.thunk.draft` | `() => "draft"`                       | Thunk returning the literal   |
| `TaskStatus.pickOptions(["draft", "active"])` | Subset tuple          | Subset selection              |
| `TaskStatus.omitOptions(["archived"])` | Complement tuple             | Omit selection                |

### LiteralKit.toTaggedUnion

`LiteralKit` provides a `.toTaggedUnion(tag)` method that builds a full
discriminated union from a cases record:

```ts
const TaskEvent = TaskStatus.toTaggedUnion("status")({
  draft:     { body: S.String },
  active:    { activatedAt: S.DateTimeUtcFromMillis },
  completed: { completedBy: S.String },
  archived:  { reason: S.String },
})
```

This produces a union with `.match`, `.cases`, `.guards`, and `.isAnyOf`.

### LiteralKit with mapMembers + S.toTaggedUnion

`mapMembers` is inherited from the underlying `S.Literals` type, not a
LiteralKit-specific addition. Use it with `Tuple.evolve` + `S.toTaggedUnion`
when each member needs to be a full `S.Class` with methods and identity.

When to use each approach:
- `toTaggedUnion(tag)(cases)` -- quick struct-based unions from inline field definitions (no per-member class needed)
- `mapMembers` + `S.toTaggedUnion` -- when each member is a full `S.Class` with its own identity, methods, or annotations

```ts
import { LiteralKit } from "@beep/schema"
import { Tuple } from "effect"
import * as S from "effect/Schema"

const TaskStateTag = LiteralKit(["draft", "active", "archived"])

class TaskDraft extends S.Class<TaskDraft>($I`TaskDraft`)(
  { state: S.tag("draft"), body: S.String },
  $I.annote("TaskDraft", { description: "Draft task state." })
) {}

class TaskActive extends S.Class<TaskActive>($I`TaskActive`)(
  { state: S.tag("active"), assignee: S.String },
  $I.annote("TaskActive", { description: "Active task state." })
) {}

class TaskArchived extends S.Class<TaskArchived>($I`TaskArchived`)(
  { state: S.tag("archived"), reason: S.String },
  $I.annote("TaskArchived", { description: "Archived task state." })
) {}

export const TaskState = TaskStateTag
  .mapMembers(Tuple.evolve([
    () => TaskDraft,
    () => TaskActive,
    () => TaskArchived,
  ]))
  .pipe(S.toTaggedUnion("state"))
  .annotate($I.annote("TaskState", { description: "Task lifecycle states." }))

export type TaskState = typeof TaskState.Type
```

## S.TemplateLiteral for branded URIs

Use `S.TemplateLiteral` to create schemas that validate strings matching a
template literal pattern. Each part can be a literal string or a schema.

```ts
import * as S from "effect/Schema"

// Simple URI pattern
const PageNodeId = S.TemplateLiteral(["beep:page/", S.NonEmptyString]).pipe(
  $I.annoteSchema("PageNodeId", { description: "URI for page nodes." })
)
// Validates: "beep:page/my-page-slug"

// Compound URI with multiple schema parts
const SymbolNodeId = S.TemplateLiteral([
  "beep:symbol/", RepoId, "/", QualifiedName
]).pipe(
  $I.annoteSchema("SymbolNodeId", { description: "URI for code symbol nodes." })
)
// Validates: "beep:symbol/my-repo/com.example.MyClass"
```

For parsing the matched parts back into a tuple, use `S.TemplateLiteralParser`:

```ts
const UserPath = S.TemplateLiteralParser(["/user/", S.NumberFromString])
// Decodes "/user/42" => readonly ["/user/", 42]
```

## S.toTaggedUnion

`S.toTaggedUnion` augments an existing `S.Union` of tagged structs with
utility methods keyed by the discriminant field.

### Construction

```ts
import * as S from "effect/Schema"

const A = S.TaggedStruct("A", { value: S.Number })
const B = S.TaggedStruct("B", { name: S.String })

const MyUnion = S.Union([A, B]).pipe(S.toTaggedUnion("_tag"))
```

### Attached helpers

| Helper              | Signature                                       | Purpose                    |
|---------------------|-------------------------------------------------|----------------------------|
| `MyUnion.match`     | `(value, cases) => R` or `(cases) => (value) => R` | Exhaustive pattern match |
| `MyUnion.cases.A`   | Schema for variant A                             | Per-variant schema access  |
| `MyUnion.guards.A`  | `(u: unknown) => u is A`                         | Per-variant type guard     |
| `MyUnion.isAnyOf`   | `(keys: K[]) => (value) => boolean`              | Multi-variant guard        |

Rules:
- Always use `S.tag(literal)` on the discriminator field in struct members.
- Use `S.toTaggedUnion` for non-`_tag` discriminants (e.g. `"kind"`, `"status"`, `"type"`).
- Use `S.TaggedUnion({...})` shorthand only for canonical `_tag` unions.

## S.optionalKey + withKeyDefaults

When a field should have a default value for both construction and decoding of
missing keys:

```ts
import { SchemaUtils } from "@beep/schema"
import * as S from "effect/Schema"

const status = S.optionalKey(TaskStatus).pipe(SchemaUtils.withKeyDefaults("draft"))
// Constructor: new Task({}) => status defaults to "draft"
// Decoding: missing "status" key => defaults to "draft"
```

`withKeyDefaults` is a dual that combines `S.withConstructorDefault` and
`S.withDecodingDefaultKey` using the same value. The default value must be
valid for both the schema's `Type` and `Encoded` representations.

## Table.make (drizzle)

Drizzle table definitions use the `Table.make` factory from
`@beep/shared-tables`. It auto-injects the canonical audit columns so you only
define entity-specific columns.

```ts
import { Shared } from "@beep/shared-domain/entity-ids"
import * as sqlite from "drizzle-orm/sqlite-core"
import { Table } from "@beep/shared-tables"

export const tasks = Table.make(Shared.TaskId)({
  name:   sqlite.text("name").notNull(),
  status: sqlite.text("status").notNull(),
}, (t) => [
  sqlite.index("task_status_idx").on(t.status),
])
```

### Auto-injected columns

`Table.make` merges these via `makeGlobalColumns()`:

| Column       | Drizzle definition                                          |
|--------------|-------------------------------------------------------------|
| `id`         | `integer("id").primaryKey({ autoIncrement: true })`         |
| `createdAt`  | `integer("created_at").notNull().default(sqlNowMillis)`     |
| `updatedAt`  | `integer("updated_at").notNull().default(sqlNowMillis).$onUpdate(...)` |
| `deletedAt`  | `integer("deleted_at")`                                     |
| `createdBy`  | `text("created_by").default("app")`                         |
| `updatedBy`  | `text("updated_by").default("app")`                         |
| `deletedBy`  | `text("deleted_by")`                                        |
| `version`    | `integer("version").notNull().default(1).$onUpdate(v+1)`    |
| `source`     | `text("source")`                                            |

Never define these columns manually. Never create drizzle tables without
`Table.make`.

## Enforcement Rules

These rules are non-negotiable and override any conflicting guidance.

1. **Schema-first**: Always `S.Class` or `Model.Class` over type aliases and
   interfaces for data models, even when runtime validation is not immediately
   needed.

2. **Identity required**: Every schema MUST use `$I.annote(...)` (class
   schemas) or `$I.annoteSchema(...)` (non-class schemas). No anonymous
   schemas in exported APIs.

3. **Discriminated unions**: MUST use `S.tag(literal)` on discriminator fields
   and finalize with `S.toTaggedUnion(discriminant)` to get `.match`, `.cases`,
   `.guards`. Use `S.TaggedUnion({...})` only when the discriminant is `_tag`.

4. **Literal unions**: MUST use `LiteralKit` for any literal string union that
   needs guards, matching, or enum access. Never use raw `S.Literal` or
   `S.Literals` for internal literal domains.

5. **Optional keys with defaults**: MUST use
   `S.optionalKey(schema).pipe(SchemaUtils.withKeyDefaults(default))` to set
   both constructor and decoding defaults in one step.

6. **CRUD entities**: MUST use `DomainModel.make` with entity-specific fields
   for anything persisted to SQLite. The factory provides all audit columns.

7. **Append-only events**: Use `S.TaggedClass` or `S.Class` with `S.tag` and
   `$I` identity. Do not use Model.Class for non-persisted event schemas.

8. **URIs and template strings**: Use `S.TemplateLiteral` for branded URI
   types. Brand and annotate the result.

9. **Tables**: Use `Table.make(entityId)(columns)`. Never define drizzle
   tables manually or redefine audit columns.

10. **EntityId**: Use `EntityId.factory(slice, $I)` to create a per-slice
    maker, then `make(tag, { tableName })` for each entity id. Always export
    the companion type alias: `export type TaskId = typeof TaskId.Type`.

11. **Non-class schema type aliases**: For non-class schemas, always export the
    runtime type alias with the same name:
    `export type TaskName = typeof TaskName.Type`.

12. **No `Schema` suffix**: Never suffix schema constants with `Schema`. Use
    the domain name directly.

## Source References

- `packages/common/identity/src/Id.ts` (IdentityComposer interface)
- `packages/common/identity/src/packages.ts` (pre-built composers)
- `packages/common/schema/src/Model.ts` (Model.Class, Generated, Field helpers)
- `packages/common/schema/src/LiteralKit.ts` (LiteralKit constructor and types)
- `packages/common/schema/src/SchemaUtils/withKeyDefaults.ts` (withKeyDefaults dual)
- `packages/common/schema/src/TaggedErrorClass.ts` (TaggedErrorClass constructor)
- `packages/shared/domain/src/factories/DomainModel.ts` (DomainModel.make factory)
- `packages/shared/domain/src/entity-ids/_internal/entity-id.ts` (EntityId.factory)
- `packages/shared/domain/src/entity-ids/Shared.ts` (canonical EntityId examples)
- `packages/shared/domain/src/entities/Organization/Organization.model.ts` (canonical model)
- `packages/shared/tables/src/table/Table.ts` (Table.make)
- `packages/shared/tables/src/common.ts` (audit column definitions)
- `.repos/effect-v4/packages/effect/src/Schema.ts` (TemplateLiteral, toTaggedUnion)
- `.repos/effect-v4/packages/effect/src/unstable/schema/Model.ts` (upstream Model)

## Verification Checklist

Run these grep patterns after completing model work to check compliance.

### Identity and annotation

```sh
# Every S.Class / Model.Class must have $I annotation
rg -n "extends S\.Class<" packages --glob "*.ts" | grep -v "\$I"
rg -n "extends DomainModel\.make<" packages --glob "*.ts" | grep -v "\$I"

# No anonymous non-class schemas in exports
rg -n "^export const [A-Za-z]+ = S\." packages --glob "*.ts" | grep -v "annoteSchema\|annotate"
```

### Schema naming

```sh
# No Schema suffix on constants
rg -n "export const [A-Za-z0-9_]+Schema\b" packages --glob "*.ts"

# Non-class schemas must export type alias
rg -n "^export const ([A-Za-z]+) = S\." packages --glob "*.ts"
# Then check each has: export type X = typeof X.Type
```

### Model and entity usage

```sh
# Persisted entities must use DomainModel.make or Model.Class, not S.Class
rg -n "Table\.make" packages --glob "*.ts"
# Cross-reference: each table entity should have a Model.Class counterpart

# EntityId must use factory pattern
rg -n "EntityId\.factory\|EntityId\.make" packages --glob "*.ts"
```

### LiteralKit compliance

```sh
# No raw S.Literal or S.Literals for internal domains
rg -n "S\.Literal\b\(|S\.Literals\b\(" packages --glob "*.ts"
# Verify each is either a one-off S.tag() usage or has been migrated to LiteralKit
```

### Tagged union compliance

```sh
# All toTaggedUnion calls should use S.tag on discriminator fields
rg -n "S\.toTaggedUnion" packages --glob "*.ts"

# No manual _tag guard helpers
rg -n "P\.hasProperty.*_tag|_tag.*===|typeof.*_tag" packages --glob "*.ts"
```

### Table compliance

```sh
# No manual drizzle table definitions
rg -n "sqliteTable\(" packages --glob "*.ts" | grep -v "Table\.make\|shared-tables"

# All tables use Table.make
rg -n "Table\.make" packages --glob "*.ts"
```

### withKeyDefaults usage

```sh
# Optional keys with defaults should use withKeyDefaults
rg -n "withConstructorDefault" packages --glob "*.ts"
# If paired with withDecodingDefaultKey on the same value, migrate to withKeyDefaults
```

## Escalation

- Use `schema-first-development` for basic schema work without Model.Class.
- Use `effect-first-development` for broader Effect patterns.
- Use `effect-services` or `effect-v4-services` for service and layer wiring.
- Use `effect-error-handling` or `effect-v4-errors` for recovery strategy
  outside schema modeling.
