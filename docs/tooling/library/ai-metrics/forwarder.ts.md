---
title: forwarder.ts
nav_order: 6
parent: "@beep/repo-ai-metrics"
---

## forwarder.ts overview

Durable local forwarder for repo AI metrics.

Since v0.0.0

---
## Exports Grouped by Category
- [errors](#errors)
  - [AiMetricsForwarderError (class)](#aimetricsforwardererror-class)
- [models](#models)
  - [AiMetricsForwarderInput (class)](#aimetricsforwarderinput-class)
  - [AiMetricsForwarderOtlpExport (type alias)](#aimetricsforwarderotlpexport-type-alias)
  - [AiMetricsForwarderOtlpExportFailed (class)](#aimetricsforwarderotlpexportfailed-class)
  - [AiMetricsForwarderOtlpExported (class)](#aimetricsforwarderotlpexported-class)
  - [AiMetricsForwarderRunResult (class)](#aimetricsforwarderrunresult-class)
  - [AiMetricsForwarderSourceCoverage (class)](#aimetricsforwardersourcecoverage-class)
  - [AiMetricsForwarderTimerInput (class)](#aimetricsforwardertimerinput-class)
  - [AiMetricsForwarderTimerPlan (class)](#aimetricsforwardertimerplan-class)
- [schemas](#schemas)
  - [AiMetricsForwarderOtlpExport](#aimetricsforwarderotlpexport)
- [services](#services)
  - [renderAiMetricsForwarderTimerPlan](#renderaimetricsforwardertimerplan)
  - [runAiMetricsForwarder](#runaimetricsforwarder)
- [utilities](#utilities)
  - [forwarderRunResultToJson](#forwarderrunresulttojson)
  - [forwarderTimerPlanToJson](#forwardertimerplantojson)
---

# errors

## AiMetricsForwarderError (class)

Error raised by the durable AI metrics forwarder.

**Example**

```ts
import { AiMetricsForwarderError } from "@beep/repo-ai-metrics"
const error = AiMetricsForwarderError.make({
  cause: "boom",
  message: "Forwarder failed."
})
console.log(error)
```

**Signature**

```ts
declare class AiMetricsForwarderError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/forwarder.ts#L77)

Since v0.0.0

# models

## AiMetricsForwarderInput (class)

Input for the durable AI metrics forwarder.

**Example**

```ts
import { AiMetricsForwarderInput } from "@beep/repo-ai-metrics"
console.log(AiMetricsForwarderInput)
```

**Signature**

```ts
declare class AiMetricsForwarderInput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/forwarder.ts#L99)

Since v0.0.0

## AiMetricsForwarderOtlpExport (type alias)

Runtime type for `AiMetricsForwarderOtlpExport`.

**Example**

```ts
import type { AiMetricsForwarderOtlpExport } from "@beep/repo-ai-metrics"
const status: AiMetricsForwarderOtlpExport["status"] = "exported"
console.log(status)
```

**Signature**

```ts
type AiMetricsForwarderOtlpExport = typeof AiMetricsForwarderOtlpExport.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/forwarder.ts#L250)

Since v0.0.0

## AiMetricsForwarderOtlpExportFailed (class)

Failed derived OTLP export status attached to a forwarder run.

**Example**

```ts
import { AiMetricsForwarderOtlpExportFailed } from "@beep/repo-ai-metrics"
console.log(AiMetricsForwarderOtlpExportFailed)
```

**Signature**

```ts
declare class AiMetricsForwarderOtlpExportFailed
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/forwarder.ts#L203)

Since v0.0.0

## AiMetricsForwarderOtlpExported (class)

Successful derived OTLP export status attached to a forwarder run.

**Example**

```ts
import { AiMetricsForwarderOtlpExported } from "@beep/repo-ai-metrics"
console.log(AiMetricsForwarderOtlpExported)
```

**Signature**

```ts
declare class AiMetricsForwarderOtlpExported
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/forwarder.ts#L175)

Since v0.0.0

## AiMetricsForwarderRunResult (class)

Safe result emitted by one durable AI metrics forwarder run.

**Example**

```ts
import { AiMetricsForwarderRunResult } from "@beep/repo-ai-metrics"
console.log(AiMetricsForwarderRunResult)
```

**Signature**

```ts
declare class AiMetricsForwarderRunResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/forwarder.ts#L263)

Since v0.0.0

## AiMetricsForwarderSourceCoverage (class)

Per-source coverage selected by one durable forwarder run.

**Example**

```ts
import { AiMetricsForwarderSourceCoverage } from "@beep/repo-ai-metrics"
console.log(AiMetricsForwarderSourceCoverage)
```

**Signature**

```ts
declare class AiMetricsForwarderSourceCoverage
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/forwarder.ts#L146)

Since v0.0.0

## AiMetricsForwarderTimerInput (class)

Input for rendering a workstation-owned forwarder timer.

**Example**

```ts
import { AiMetricsForwarderTimerInput } from "@beep/repo-ai-metrics"
console.log(AiMetricsForwarderTimerInput)
```

**Signature**

```ts
declare class AiMetricsForwarderTimerInput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/forwarder.ts#L298)

Since v0.0.0

## AiMetricsForwarderTimerPlan (class)

Rendered systemd user units for the workstation-owned forwarder timer.

**Example**

```ts
import { AiMetricsForwarderTimerPlan } from "@beep/repo-ai-metrics"
console.log(AiMetricsForwarderTimerPlan)
```

**Signature**

```ts
declare class AiMetricsForwarderTimerPlan
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/forwarder.ts#L333)

Since v0.0.0

# schemas

## AiMetricsForwarderOtlpExport

Tagged derived OTLP export status attached to a forwarder run.

**Example**

```ts
import { AiMetricsForwarderOtlpExport } from "@beep/repo-ai-metrics"
console.log(AiMetricsForwarderOtlpExport)
```

**Signature**

```ts
declare const AiMetricsForwarderOtlpExport: AnnotatedSchema<S.Union<readonly [typeof AiMetricsForwarderOtlpExported, typeof AiMetricsForwarderOtlpExportFailed]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/forwarder.ts#L229)

Since v0.0.0

# services

## renderAiMetricsForwarderTimerPlan

Render a systemd user timer that repeatedly runs the forwarder with locking and status evidence.

**Example**

```ts
import { renderAiMetricsForwarderTimerPlan } from "@beep/repo-ai-metrics"

console.log(renderAiMetricsForwarderTimerPlan)
```

**Signature**

```ts
declare const renderAiMetricsForwarderTimerPlan: (input: AiMetricsForwarderTimerInput) => AiMetricsForwarderTimerPlan
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/forwarder.ts#L421)

Since v0.0.0

## runAiMetricsForwarder

Run durable ingest: encrypted raw archive, DuckDB projection, and Parquet export.

**Example**

```ts
import {
  AiMetricsForwarderInput,
  runAiMetricsForwarder
} from "@beep/repo-ai-metrics"
import { Redacted } from "effect"
const input = AiMetricsForwarderInput.make({
  homeDir: "/home/example",
  rawArchiveKey: Redacted.make("base64-32-byte-key"),
  repoRoot: "/work/repo"
})
const program = runAiMetricsForwarder(input)
console.log(program)
```

**Signature**

```ts
declare const runAiMetricsForwarder: (input: AiMetricsForwarderInput) => Effect.Effect<AiMetricsForwarderRunResult, AiMetricsForwarderError, DuckDb | FileSystem.FileSystem | Path.Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/forwarder.ts#L756)

Since v0.0.0

# utilities

## forwarderRunResultToJson

Render a durable forwarder run result as JSON.

**Example**

```ts
import {
  AiMetricsForwarderRunResult,
  forwarderRunResultToJson
} from "@beep/repo-ai-metrics"
const result = AiMetricsForwarderRunResult.make({
  archiveObjectCount: 0,
  configSnapshotId: "config-1",
  duckDbPath: ".ai-metrics/derived/ai-metrics.duckdb",
  ingestRunId: "forwarder-1",
  parquetExportDir: ".ai-metrics/derived/parquet/forwarder-1",
  parquetExportMode: "snapshot",
  parquetTables: [],
  rawArchiveDir: ".ai-metrics/raw",
  sourceFileCount: 0,
  target: "local",
  turnCount: 0
})
const program = forwarderRunResultToJson(result)
console.log(program)
```

**Signature**

```ts
declare const forwarderRunResultToJson: (result: AiMetricsForwarderRunResult) => Effect.Effect<string, AiMetricsForwarderError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/forwarder.ts#L864)

Since v0.0.0

## forwarderTimerPlanToJson

Render a forwarder timer plan as JSON.

**Example**

```ts
import { forwarderTimerPlanToJson } from "@beep/repo-ai-metrics"
console.log(forwarderTimerPlanToJson)
```

**Signature**

```ts
declare const forwarderTimerPlanToJson: (result: AiMetricsForwarderTimerPlan) => Effect.Effect<string, AiMetricsForwarderError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/forwarder.ts#L885)

Since v0.0.0