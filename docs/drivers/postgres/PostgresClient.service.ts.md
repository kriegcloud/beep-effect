---
title: PostgresClient.service.ts
nav_order: 3
parent: "@beep/postgres"
---

## PostgresClient.service.ts overview

Effect Postgres client service wiring.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [PostgresClientValue (type alias)](#postgresclientvalue-type-alias)
  - [PostgresPoolConfig (type alias)](#postgrespoolconfig-type-alias)
- [services](#services)
  - [PostgresClient (class)](#postgresclient-class)
---

# models

## PostgresClientValue (type alias)

Native Effect Postgres client value.

**Example**

```ts
import type { PostgresClientValue } from "@beep/postgres"

const readConfig = (client: PostgresClientValue) => client.config
console.log(readConfig)
```

**Signature**

```ts
type PostgresClientValue = Pg.PgClient
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/postgres/src/PostgresClient.service.ts#L50)

Since v0.0.0

## PostgresPoolConfig (type alias)

Native Effect Postgres pool configuration.

**Example**

```ts
import type { PostgresPoolConfig } from "@beep/postgres"

const config: PostgresPoolConfig = {
  database: "postgres",
  host: "127.0.0.1",
  username: "postgres"
}
console.log(config)
```

**Signature**

```ts
type PostgresPoolConfig = Pg.PgPoolConfig
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/postgres/src/PostgresClient.service.ts#L34)

Since v0.0.0

# services

## PostgresClient (class)

Beep service key for a native Effect Postgres client.

**Example**

```ts
import { PostgresClient } from "@beep/postgres"

const service = PostgresClient
console.log(service)
```

**Signature**

```ts
declare class PostgresClient
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/postgres/src/PostgresClient.service.ts#L66)

Since v0.0.0