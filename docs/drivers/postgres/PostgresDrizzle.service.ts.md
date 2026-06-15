---
title: PostgresDrizzle.service.ts
nav_order: 5
parent: "@beep/postgres"
---

## PostgresDrizzle.service.ts overview

Postgres-backed Drizzle Effect composition.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [makeDrizzle](#makedrizzle)
  - [migrate](#migrate)
- [layers](#layers)
  - [makeDrizzleLayer](#makedrizzlelayer)
- [models](#models)
  - [PostgresDrizzleConfig (type alias)](#postgresdrizzleconfig-type-alias)
  - [PostgresDrizzleDatabase (type alias)](#postgresdrizzledatabase-type-alias)
- [services](#services)
  - [PostgresDrizzle (class)](#postgresdrizzle-class)
---

# constructors

## makeDrizzle

Create a Postgres-backed Drizzle Effect database from a provided PgClient.

**Example**

```ts
import { makeDrizzle } from "@beep/postgres"

const effect = makeDrizzle()
console.log(effect)
```

**Signature**

```ts
declare const makeDrizzle: <TSchema extends Record<string, unknown> = Record<string, never>, TRelations extends AnyRelations = EmptyRelations>(config?: PostgresDrizzleConfig<TSchema, TRelations>) => Effect.Effect<PostgresDrizzleDatabase<TSchema, TRelations>, PostgresError, Pg.PgClient>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/postgres/src/PostgresDrizzle.service.ts#L98)

Since v0.0.0

## migrate

Run Drizzle Effect Postgres migrations and normalize failures.

**Example**

```ts
import { migrate } from "@beep/postgres"
import type { PostgresDrizzleDatabase } from "@beep/postgres"

const runMigration = (db: PostgresDrizzleDatabase) => {
  const effect = migrate(db, { migrationsFolder: "./drizzle" })
  const deferred = migrate({ migrationsFolder: "./drizzle" })(db)
  return { deferred, effect }
}
console.log(runMigration)
```

**Signature**

```ts
declare const migrate: { <TSchema extends Record<string, unknown>, TRelations extends AnyRelations>(db: PostgresDrizzleDatabase<TSchema, TRelations>, config: MigrationConfig): Effect.Effect<undefined, PostgresError>; (config: MigrationConfig): <TSchema extends Record<string, unknown>, TRelations extends AnyRelations>(db: PostgresDrizzleDatabase<TSchema, TRelations>) => Effect.Effect<undefined, PostgresError>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/postgres/src/PostgresDrizzle.service.ts#L146)

Since v0.0.0

# layers

## makeDrizzleLayer

Build a Layer for a default-typed Postgres-backed Drizzle database.

**Example**

```ts
import { makeDrizzleLayer } from "@beep/postgres"

const layer = makeDrizzleLayer()
console.log(layer)
```

**Signature**

```ts
declare const makeDrizzleLayer: (config?: PostgresDrizzleConfig) => Layer.Layer<PostgresDrizzle, PostgresError, Pg.PgClient>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/postgres/src/PostgresDrizzle.service.ts#L123)

Since v0.0.0

# models

## PostgresDrizzleConfig (type alias)

Configuration accepted by `makeDrizzle`.

**Example**

```ts
import type { PostgresDrizzleConfig } from "@beep/postgres"

const config: PostgresDrizzleConfig = {}
console.log(config)
```

**Signature**

```ts
type PostgresDrizzleConfig<TSchema, TRelations> = PgDrizzle.EffectDrizzlePgConfig<NonNullable<TRelations>> & PostgresDrizzleSchemaPhantom<TSchema>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/postgres/src/PostgresDrizzle.service.ts#L63)

Since v0.0.0

## PostgresDrizzleDatabase (type alias)

Native Drizzle Effect Postgres database value.

**Example**

```ts
import type { PostgresDrizzleDatabase } from "@beep/postgres"

const readClient = (db: PostgresDrizzleDatabase) => db.$client
console.log(readClient)
```

**Signature**

```ts
type PostgresDrizzleDatabase<TSchema, TRelations> = PgDrizzle.EffectPgDatabase<NonNullable<TRelations>> &
  PostgresDrizzleSchemaPhantom<TSchema> & {
    readonly $client: Pg.PgClient;
  }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/postgres/src/PostgresDrizzle.service.ts#L41)

Since v0.0.0

# services

## PostgresDrizzle (class)

Service key for a default-typed Postgres-backed Drizzle database.

**Example**

```ts
import { PostgresDrizzle } from "@beep/postgres"

const service = PostgresDrizzle
console.log(service)
```

**Signature**

```ts
declare class PostgresDrizzle
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/postgres/src/PostgresDrizzle.service.ts#L82)

Since v0.0.0