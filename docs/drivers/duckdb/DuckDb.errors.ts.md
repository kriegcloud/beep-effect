---
title: DuckDb.errors.ts
nav_order: 1
parent: "@beep/duckdb"
---

## DuckDb.errors.ts overview

Typed errors raised by the DuckDB driver boundary.

Since v0.0.0

---
## Exports Grouped by Category
- [errors](#errors)
  - [DuckDbError (class)](#duckdberror-class)
  - [DuckDbErrorFromUnknownOptions (class)](#duckdberrorfromunknownoptions-class)
---

# errors

## DuckDbError (class)

Technical failure raised by the `@beep/duckdb` driver boundary.

**Example**

```ts
import { DuckDbError } from "@beep/duckdb"

const error = DuckDbError.make({
  message: "DuckDB query failed.",
  operation: "query"
})

console.log(error)
```

**Signature**

```ts
declare class DuckDbError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/duckdb/src/DuckDb.errors.ts#L72)

Since v0.0.0

## DuckDbErrorFromUnknownOptions (class)

Options used when normalizing unknown DuckDB boundary failures.

**Example**

```ts
import { DuckDbErrorFromUnknownOptions } from "@beep/duckdb"

const options = DuckDbErrorFromUnknownOptions.make({
  databasePath: "metrics.duckdb",
  statement: "select 1"
})
console.log(options)
```

**Signature**

```ts
declare class DuckDbErrorFromUnknownOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/duckdb/src/DuckDb.errors.ts#L40)

Since v0.0.0