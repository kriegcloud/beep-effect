---
title: EntityTable.models.ts
nav_order: 3
parent: "@beep/drizzle"
---

## EntityTable.models.ts overview

Drizzle table projection for schema-first entities.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [pgTableFrom](#pgtablefrom)
- [getters](#getters)
  - [columns](#columns)
- [models](#models)
  - [ColumnBuilderFor (type alias)](#columnbuilderfor-type-alias)
  - [ColumnBuilderMapFor (type alias)](#columnbuildermapfor-type-alias)
  - [TableFor (type alias)](#tablefor-type-alias)
---

# constructors

## pgTableFrom

Project a schema-first entity class into a typed Postgres Drizzle table.

**Example**

```ts
import { EntityTable } from "@beep/drizzle"
import { $SchemaId } from "@beep/identity"
import * as EntitySchema from "@beep/schema/EntitySchema"
import * as S from "effect/Schema"

const $I = $SchemaId.create("EntityTableExample")
const Widget = EntitySchema.ClassFactory($I`Widget`)({
  fields: {
    name: S.String
  },
  persisted: {
    name: EntitySchema.persist.text()
  },
  tableName: "widget"
})

const table = EntityTable.pgTableFrom(Widget)
console.log(table)
```

**Signature**

```ts
declare const pgTableFrom: <const Entity extends EntitySchema.EntityClass.Any>(entity: Entity) => TableFor<Entity>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/drizzle/src/EntityTable.models.ts#L460)

Since v0.0.0

# getters

## columns

Get projected table columns using Drizzle metadata.

**Example**

```ts
import { EntityTable } from "@beep/drizzle"
import { $SchemaId } from "@beep/identity"
import * as EntitySchema from "@beep/schema/EntitySchema"
import * as S from "effect/Schema"

const $I = $SchemaId.create("EntityTableColumnsExample")
const Widget = EntitySchema.ClassFactory($I`Widget`)({
  fields: {
    name: S.String
  },
  persisted: {
    name: EntitySchema.persist.text()
  },
  tableName: "widget"
})

const table = EntityTable.pgTableFrom(Widget)
const columns = EntityTable.columns(table)
console.log(columns.name.name)
```

**Signature**

```ts
declare const columns: <T extends Table | View | Subquery>(table: T) => T extends Table ? T["_"]["columns"] : T extends View ? T["_"]["selectedFields"] : T extends Subquery ? T["_"]["selectedFields"] : never
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/drizzle/src/EntityTable.models.ts#L499)

Since v0.0.0

# models

## ColumnBuilderFor (type alias)

Drizzle column builder type derived from one persisted descriptor.

**Example**

```ts
import { EntityTable } from "@beep/drizzle"
import * as EntitySchema from "@beep/schema/EntitySchema"

const descriptor = EntitySchema.persist.text()
type NameColumn = EntityTable.ColumnBuilderFor<typeof descriptor, string>
```

**Signature**

```ts
type ColumnBuilderFor<Descriptor, Encoded> = ColumnBuilderWithNullability<
  Descriptor,
  Encoded,
  ColumnBuilderBaseFor<Descriptor, Encoded>
>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/drizzle/src/EntityTable.models.ts#L131)

Since v0.0.0

## ColumnBuilderMapFor (type alias)

Drizzle column-builder map derived from an entity definition.

**Example**

```ts
import { EntityTable } from "@beep/drizzle"
import type * as EntitySchema from "@beep/schema/EntitySchema"

type Columns = EntityTable.ColumnBuilderMapFor<EntitySchema.Definition>
```

**Signature**

```ts
type ColumnBuilderMapFor<Definition> = {
  readonly [K in keyof Definition["persisted"] & string]: K extends keyof Definition["fields"]
    ? ColumnBuilderFor<Definition["persisted"][K], S.Codec.Encoded<Definition["fields"][K]>>
    : never;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/drizzle/src/EntityTable.models.ts#L151)

Since v0.0.0

## TableFor (type alias)

Drizzle table type derived from a schema-first entity class.

**Example**

```ts
import { EntityTable } from "@beep/drizzle"
import type * as EntitySchema from "@beep/schema/EntitySchema"

type Table = EntityTable.TableFor<EntitySchema.EntityClass.Any>
```

**Signature**

```ts
type TableFor<Entity> = PgTableWithColumns<{
  name: EntitySchema.EntityClass.DefinitionOf<Entity>["tableName"];
  schema: undefined;
  columns: PgBuildColumns<
    EntitySchema.EntityClass.DefinitionOf<Entity>["tableName"],
    ColumnBuilderMapFor<EntitySchema.EntityClass.DefinitionOf<Entity>>
  >;
  dialect: "pg";
}> & {
  readonly definition: EntitySchema.EntityClass.DefinitionOf<Entity>;
  readonly entitySchema: Entity;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/drizzle/src/EntityTable.models.ts#L171)

Since v0.0.0