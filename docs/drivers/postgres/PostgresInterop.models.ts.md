---
title: PostgresInterop.models.ts
nav_order: 6
parent: "@beep/postgres"
---

## PostgresInterop.models.ts overview

Native Drizzle and Effect Postgres interop helpers.

Since v0.0.0

---
## Exports Grouped by Category
- [errors](#errors)
  - [NativeMigrationError (type alias)](#nativemigrationerror-type-alias)
- [interop](#interop)
  - [EffectDrizzleConfig](#effectdrizzleconfig)
  - [EffectDrizzlePgConfig](#effectdrizzlepgconfig)
  - [EffectLogger](#effectlogger)
  - [EffectPgDatabase](#effectpgdatabase)
  - [NativePgClient (namespace export)](#nativepgclient-namespace-export)
---

# errors

## NativeMigrationError (type alias)

Error union emitted by native Drizzle Effect Postgres migrations.

**Example**

```ts
import type { NativeMigrationError } from "@beep/postgres/interop"

const describeMigrationError = (_error: NativeMigrationError) => "migration failed"
console.log(describeMigrationError)
```

**Signature**

```ts
type NativeMigrationError = EffectDrizzleQueryError | MigratorInitError | SqlError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/postgres/src/PostgresInterop.models.ts#L25)

Since v0.0.0

# interop

## EffectDrizzleConfig

Native Drizzle Effect Postgres database types.

**Example**

```ts
import type { EffectDrizzlePgConfig, EffectLogger, EffectPgDatabase } from "@beep/postgres/interop"

const config: EffectDrizzlePgConfig = {}
const useDatabase = (_database: EffectPgDatabase) => config
const useLogger = (_logger: EffectLogger) => config
console.log(useDatabase)
console.log(useLogger)
```

**Signature**

```ts
declare const EffectDrizzleConfig: EffectDrizzlePgConfig<TRelations>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/postgres/src/PostgresInterop.models.ts#L61)

Since v0.0.0

## EffectDrizzlePgConfig

Native Drizzle Effect Postgres database types.

**Example**

```ts
import type { EffectDrizzlePgConfig, EffectLogger, EffectPgDatabase } from "@beep/postgres/interop"

const config: EffectDrizzlePgConfig = {}
const useDatabase = (_database: EffectPgDatabase) => config
const useLogger = (_logger: EffectLogger) => config
console.log(useDatabase)
console.log(useLogger)
```

**Signature**

```ts
declare const EffectDrizzlePgConfig: EffectDrizzlePgConfig<TRelations>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/postgres/src/PostgresInterop.models.ts#L60)

Since v0.0.0

## EffectLogger

Native Drizzle Effect Postgres database types.

**Example**

```ts
import type { EffectDrizzlePgConfig, EffectLogger, EffectPgDatabase } from "@beep/postgres/interop"

const config: EffectDrizzlePgConfig = {}
const useDatabase = (_database: EffectPgDatabase) => config
const useLogger = (_logger: EffectLogger) => config
console.log(useDatabase)
console.log(useLogger)
```

**Signature**

```ts
declare const EffectLogger: EffectLogger
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/postgres/src/PostgresInterop.models.ts#L62)

Since v0.0.0

## EffectPgDatabase

Native Drizzle Effect Postgres database types.

**Example**

```ts
import type { EffectDrizzlePgConfig, EffectLogger, EffectPgDatabase } from "@beep/postgres/interop"

const config: EffectDrizzlePgConfig = {}
const useDatabase = (_database: EffectPgDatabase) => config
const useLogger = (_logger: EffectLogger) => config
console.log(useDatabase)
console.log(useLogger)
```

**Signature**

```ts
declare const EffectPgDatabase: EffectPgDatabase<TRelations>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/postgres/src/PostgresInterop.models.ts#L63)

Since v0.0.0

## NativePgClient (namespace export)

Re-exports all named exports from the "@effect/sql-pg/PgClient" module as `NativePgClient`.

**Example**

```ts
import { NativePgClient } from "@beep/postgres/interop"

const pgClientTag = NativePgClient.PgClient
console.log(pgClientTag)
```

**Signature**

```ts
export * as NativePgClient from "@effect/sql-pg/PgClient"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/postgres/src/PostgresInterop.models.ts#L41)

Since v0.0.0