---
title: CsvFormatter.formatter.ts
nav_order: 40
parent: "@beep/schema"
---

## CsvFormatter.formatter.ts overview

Whole-text CSV formatting helpers.

Since v0.0.0

---
## Exports Grouped by Category
- [schemas](#schemas)
  - [format](#format)
- [utilities](#utilities)
  - [formatCsvDataRow](#formatcsvdatarow)
  - [formatCsvDocument](#formatcsvdocument)
  - [formatCsvHeaderRow](#formatcsvheaderrow)
---

# schemas

## format

Public aliases for concise namespace roles.

**Signature**

```ts
declare const format: { (headers: ReadonlyArray<string>, rows: ReadonlyArray<ReadonlyArray<string>>, options: CsvCodecOptions): Effect.Effect<string, CsvError>; (rows: ReadonlyArray<ReadonlyArray<string>>, options: CsvCodecOptions): (headers: ReadonlyArray<string>) => Effect.Effect<string, CsvError>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CsvFormatter/CsvFormatter.formatter.ts#L201)

Since v0.0.0

# utilities

## formatCsvDataRow

Format a CSV data row.

**Example**

```ts
import { Effect } from "effect"
import { CsvCodecOptions } from "@beep/schema/CsvCodecOptions"
import { formatCsvDataRow } from "@beep/schema/CsvFormatter"

const row = Effect.runSync(formatCsvDataRow(["Ada", "36"], CsvCodecOptions.make({})))
console.log(row)
```

**Signature**

```ts
declare const formatCsvDataRow: { (fields: ReadonlyArray<string>, options: CsvCodecOptions): Effect.Effect<string, CsvError>; (options: CsvCodecOptions): (fields: ReadonlyArray<string>) => Effect.Effect<string, CsvError>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CsvFormatter/CsvFormatter.formatter.ts#L146)

Since v0.0.0

## formatCsvDocument

Format a whole CSV document.

**Example**

```ts
import { Effect } from "effect"
import { CsvCodecOptions } from "@beep/schema/CsvCodecOptions"
import { formatCsvDocument } from "@beep/schema/CsvFormatter"

const csv = Effect.runSync(formatCsvDocument(["name"], [["Ada"]], CsvCodecOptions.make({})))
console.log(csv)
```

**Signature**

```ts
declare const formatCsvDocument: { (headers: ReadonlyArray<string>, rows: ReadonlyArray<ReadonlyArray<string>>, options: CsvCodecOptions): Effect.Effect<string, CsvError>; (rows: ReadonlyArray<ReadonlyArray<string>>, options: CsvCodecOptions): (headers: ReadonlyArray<string>) => Effect.Effect<string, CsvError>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CsvFormatter/CsvFormatter.formatter.ts#L183)

Since v0.0.0

## formatCsvHeaderRow

Format a CSV header row.

**Example**

```ts
import { Effect } from "effect"
import { CsvCodecOptions } from "@beep/schema/CsvCodecOptions"
import { formatCsvHeaderRow } from "@beep/schema/CsvFormatter"

const header = Effect.runSync(formatCsvHeaderRow(["name", "age"], CsvCodecOptions.make({})))
console.log(header)
```

**Signature**

```ts
declare const formatCsvHeaderRow: { (headers: ReadonlyArray<string>, options: CsvCodecOptions): Effect.Effect<string, CsvError>; (options: CsvCodecOptions): (headers: ReadonlyArray<string>) => Effect.Effect<string, CsvError>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CsvFormatter/CsvFormatter.formatter.ts#L111)

Since v0.0.0