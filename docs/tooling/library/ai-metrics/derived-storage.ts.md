---
title: derived-storage.ts
nav_order: 5
parent: "@beep/repo-ai-metrics"
---

## derived-storage.ts overview

DuckDB-derived storage projection for repo AI metrics.

Since v0.0.0

---
## Exports Grouped by Category
- [errors](#errors)
  - [AiMetricsDerivedStorageError (class)](#aimetricsderivedstorageerror-class)
- [models](#models)
  - [AiMetricsDerivedStorageWriteInput (class)](#aimetricsderivedstoragewriteinput-class)
  - [AiMetricsDerivedStorageWriteResult (class)](#aimetricsderivedstoragewriteresult-class)
  - [AiMetricsDerivedTranscriptRecord (class)](#aimetricsderivedtranscriptrecord-class)
  - [AiMetricsParquetExportMode (type alias)](#aimetricsparquetexportmode-type-alias)
- [schemas](#schemas)
  - [AiMetricsParquetExportMode](#aimetricsparquetexportmode)
- [services](#services)
  - [ensureAiMetricsDerivedStorage](#ensureaimetricsderivedstorage)
  - [writeAiMetricsDerivedStorage](#writeaimetricsderivedstorage)
---

# errors

## AiMetricsDerivedStorageError (class)

Error raised by the DuckDB derived storage projection.

**Example**

```ts
import { AiMetricsDerivedStorageError } from "@beep/repo-ai-metrics"
const error = AiMetricsDerivedStorageError.make({
  cause: "boom",
  message: "Projection failed."
})
console.log(error)
```

**Signature**

```ts
declare class AiMetricsDerivedStorageError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/derived-storage.ts#L506)

Since v0.0.0

# models

## AiMetricsDerivedStorageWriteInput (class)

Input for a derived DuckDB storage write.

**Example**

```ts
import { AiMetricsDerivedStorageWriteInput } from "@beep/repo-ai-metrics"
console.log(AiMetricsDerivedStorageWriteInput)
```

**Signature**

```ts
declare class AiMetricsDerivedStorageWriteInput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/derived-storage.ts#L553)

Since v0.0.0

## AiMetricsDerivedStorageWriteResult (class)

Result of a derived DuckDB storage write.

**Example**

```ts
import { AiMetricsDerivedStorageWriteResult } from "@beep/repo-ai-metrics"
console.log(AiMetricsDerivedStorageWriteResult)
```

**Signature**

```ts
declare class AiMetricsDerivedStorageWriteResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/derived-storage.ts#L585)

Since v0.0.0

## AiMetricsDerivedTranscriptRecord (class)

One sanitized transcript ready for derived storage projection.

**Example**

```ts
import { AiMetricsDerivedTranscriptRecord } from "@beep/repo-ai-metrics"
console.log(AiMetricsDerivedTranscriptRecord)
```

**Signature**

```ts
declare class AiMetricsDerivedTranscriptRecord
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/derived-storage.ts#L530)

Since v0.0.0

## AiMetricsParquetExportMode (type alias)

Runtime type for `AiMetricsParquetExportMode`.

**Example**

```ts
import type { AiMetricsParquetExportMode } from "@beep/repo-ai-metrics"
const mode: AiMetricsParquetExportMode = "latest"
console.log(mode)
```

**Signature**

```ts
type AiMetricsParquetExportMode = typeof AiMetricsParquetExportMode.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/derived-storage.ts#L67)

Since v0.0.0

# schemas

## AiMetricsParquetExportMode

Parquet export behavior for one derived AI metrics write.

**Example**

```ts
import { AiMetricsParquetExportMode } from "@beep/repo-ai-metrics"
console.log(AiMetricsParquetExportMode.Enum.snapshot)
```

**Signature**

```ts
declare const AiMetricsParquetExportMode: AnnotatedSchema<LiteralKit<readonly ["none", "latest", "snapshot"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/derived-storage.ts#L49)

Since v0.0.0

# services

## ensureAiMetricsDerivedStorage

Ensure the AI metrics derived DuckDB schema exists and has P4 columns.

**Example**

```ts
import { ensureAiMetricsDerivedStorage } from "@beep/repo-ai-metrics"
console.log(ensureAiMetricsDerivedStorage)
```

**Signature**

```ts
declare const ensureAiMetricsDerivedStorage: Effect.Effect<void, AiMetricsDerivedStorageError, DuckDb>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/derived-storage.ts#L728)

Since v0.0.0

## writeAiMetricsDerivedStorage

Project sanitized AI metrics records into DuckDB and export Parquet snapshots.

**Example**

```ts
import {
  AiMetricsDerivedStorageWriteInput,
  writeAiMetricsDerivedStorage
} from "@beep/repo-ai-metrics"
const input = AiMetricsDerivedStorageWriteInput
const write = writeAiMetricsDerivedStorage
console.log(input)
console.log(write)
```

**Signature**

```ts
declare const writeAiMetricsDerivedStorage: (input: AiMetricsDerivedStorageWriteInput) => Effect.Effect<AiMetricsDerivedStorageWriteResult, AiMetricsDerivedStorageError, DuckDb | FileSystem.FileSystem | Path.Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/derived-storage.ts#L1156)

Since v0.0.0