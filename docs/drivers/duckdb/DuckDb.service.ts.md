---
title: DuckDb.service.ts
nav_order: 3
parent: "@beep/duckdb"
---

## DuckDb.service.ts overview

Product-neutral DuckDB execution service.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [DuckDbClient (interface)](#duckdbclient-interface)
  - [DuckDbQueryParameters (type alias)](#duckdbqueryparameters-type-alias)
- [services](#services)
  - [DuckDb (class)](#duckdb-class)
  - [DuckDbShape (interface)](#duckdbshape-interface)
---

# models

## DuckDbClient (interface)

Narrow adapter accepted by `DuckDb.makeLayer`.

**Example**

```ts
import type { DuckDbClient } from "@beep/duckdb"
import { Effect } from "effect"

const client: DuckDbClient = {
  copyTableToParquet: () => Effect.void,
  query: () => Effect.succeed([]),
  run: () => Effect.void,
  runMany: () => Effect.void,
  withTransaction: (use) => use(client)
}

console.log(client)
```

**Signature**

```ts
export interface DuckDbClient {
  readonly copyTableToParquet: (request: DuckDbParquetExport) => Effect.Effect<void, DuckDbError>;
  readonly query: (
    statement: string,
    parameters?: DuckDbQueryParameters | undefined
  ) => Effect.Effect<DuckDbRows, DuckDbError>;
  readonly run: (statement: string, parameters?: DuckDbQueryParameters | undefined) => Effect.Effect<void, DuckDbError>;
  readonly runMany: (statements: ReadonlyArray<string>) => Effect.Effect<void, DuckDbError>;
  readonly withTransaction: <A, R>(
    use: (transaction: DuckDbClient) => Effect.Effect<A, DuckDbError, R>
  ) => Effect.Effect<A, DuckDbError, R>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/duckdb/src/DuckDb.service.ts#L60)

Since v0.0.0

## DuckDbQueryParameters (type alias)

Parameter values accepted by the DuckDB Node API.

**Example**

```ts
import type { DuckDbQueryParameters } from "@beep/duckdb"

const params: DuckDbQueryParameters = { id: "run-1" }
console.log(params)
```

**Signature**

```ts
type DuckDbQueryParameters = Array<DuckDBValue> | Record<string, DuckDBValue>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/duckdb/src/DuckDb.service.ts#L36)

Since v0.0.0

# services

## DuckDb (class)

Effect service for product-neutral DuckDB execution.

**Example**

```ts
import { DuckDb } from "@beep/duckdb"

const service = DuckDb
console.log(service)
```

**Signature**

```ts
declare class DuckDb
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/duckdb/src/DuckDb.service.ts#L358)

Since v0.0.0

## DuckDbShape (interface)

Runtime shape exposed by the `DuckDb` service.

**Example**

```ts
import type { DuckDbShape } from "@beep/duckdb"
import { Effect } from "effect"

const service: DuckDbShape = {
  copyTableToParquet: () => Effect.void,
  query: () => Effect.succeed([]),
  run: () => Effect.void,
  runMany: () => Effect.void,
  withTransaction: (use) => use(service)
}

console.log(service)
```

**Signature**

```ts
export interface DuckDbShape extends DuckDbClient {}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/duckdb/src/DuckDb.service.ts#L95)

Since v0.0.0