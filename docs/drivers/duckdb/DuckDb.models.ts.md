---
title: DuckDb.models.ts
nav_order: 2
parent: "@beep/duckdb"
---

## DuckDb.models.ts overview

Schema-first models for the DuckDB driver boundary.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [DuckDbConnectionOptions (class)](#duckdbconnectionoptions-class)
  - [DuckDbParquetExport (class)](#duckdbparquetexport-class)
  - [DuckDbRow (type alias)](#duckdbrow-type-alias)
  - [DuckDbRows (type alias)](#duckdbrows-type-alias)
- [schemas](#schemas)
  - [DuckDbRow](#duckdbrow)
  - [DuckDbRows](#duckdbrows)
---

# models

## DuckDbConnectionOptions (class)

Connection options for a DuckDB database.

**Example**

```ts
import { DuckDbConnectionOptions } from "@beep/duckdb"

const options = DuckDbConnectionOptions.make({
  databasePath: "metrics.duckdb"
})

console.log(options)
```

**Signature**

```ts
declare class DuckDbConnectionOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/duckdb/src/DuckDb.models.ts#L31)

Since v0.0.0

## DuckDbParquetExport (class)

Parquet export request for a DuckDB table.

**Example**

```ts
import { DuckDbParquetExport } from "@beep/duckdb"

const request = DuckDbParquetExport.make({
  filePath: "exports/table.parquet",
  tableName: "ai_metrics_ingest_runs"
})

console.log(request)
```

**Signature**

```ts
declare class DuckDbParquetExport
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/duckdb/src/DuckDb.models.ts#L59)

Since v0.0.0

## DuckDbRow (type alias)

Type for `DuckDbRow`.

**Example**

```ts
import type { DuckDbRow } from "@beep/duckdb"

const row: DuckDbRow = { count: 1 }
console.log(row)
```

**Signature**

```ts
type DuckDbRow = typeof DuckDbRow.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/duckdb/src/DuckDb.models.ts#L108)

Since v0.0.0

## DuckDbRows (type alias)

Type for `DuckDbRows`.

**Example**

```ts
import type { DuckDbRows } from "@beep/duckdb"

const rows: DuckDbRows = []
console.log(rows)
```

**Signature**

```ts
type DuckDbRows = typeof DuckDbRows.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/duckdb/src/DuckDb.models.ts#L149)

Since v0.0.0

# schemas

## DuckDbRow

JSON-compatible row returned from DuckDB queries.

**Example**

```ts
import { DuckDbRow } from "@beep/duckdb"
import { Effect } from "effect"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  return yield* S.decodeUnknownEffect(DuckDbRow)({ count: 1 })
})

console.log(program)
```

**Signature**

```ts
declare const DuckDbRow: AnnotatedSchema<S.$Record<S.String, S.Unknown>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/duckdb/src/DuckDb.models.ts#L88)

Since v0.0.0

## DuckDbRows

JSON-compatible rows returned from DuckDB queries.

**Example**

```ts
import { DuckDbRows } from "@beep/duckdb"
import { Effect } from "effect"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  return yield* S.decodeUnknownEffect(DuckDbRows)([])
})

console.log(program)
```

**Signature**

```ts
declare const DuckDbRows: AnnotatedSchema<S.$Array<AnnotatedSchema<S.$Record<S.String, S.Unknown>>>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/duckdb/src/DuckDb.models.ts#L129)

Since v0.0.0