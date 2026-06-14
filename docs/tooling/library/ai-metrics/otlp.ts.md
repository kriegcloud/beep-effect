---
title: otlp.ts
nav_order: 12
parent: "@beep/repo-ai-metrics"
---

## otlp.ts overview

OTLP span projections for redacted AI metrics derived storage.

Since v0.0.0

---
## Exports Grouped by Category
- [constants](#constants)
  - [AI_METRICS_OTLP_ATTRIBUTE_ALLOWLIST](#ai_metrics_otlp_attribute_allowlist)
- [errors](#errors)
  - [AiMetricsOtlpExportError (class)](#aimetricsotlpexporterror-class)
- [models](#models)
  - [AiMetricsOtlpAttributeValue (type alias)](#aimetricsotlpattributevalue-type-alias)
  - [AiMetricsOtlpExportInput (class)](#aimetricsotlpexportinput-class)
  - [AiMetricsOtlpExportResult (class)](#aimetricsotlpexportresult-class)
  - [AiMetricsOtlpSpanProjection (class)](#aimetricsotlpspanprojection-class)
  - [AiMetricsOtlpSpanProjectionBatch (class)](#aimetricsotlpspanprojectionbatch-class)
- [schemas](#schemas)
  - [AiMetricsOtlpAttributeValue](#aimetricsotlpattributevalue)
- [services](#services)
  - [readAiMetricsOtlpSpanProjections](#readaimetricsotlpspanprojections)
  - [runAiMetricsOtlpExport](#runaimetricsotlpexport)
- [utilities](#utilities)
  - [otlpExportResultToJson](#otlpexportresulttojson)
---

# constants

## AI_METRICS_OTLP_ATTRIBUTE_ALLOWLIST

OTLP attributes approved for redacted AI metrics span export.

**Example**

```ts
import { AI_METRICS_OTLP_ATTRIBUTE_ALLOWLIST } from "@beep/repo-ai-metrics"
console.log(AI_METRICS_OTLP_ATTRIBUTE_ALLOWLIST)
```

**Signature**

```ts
declare const AI_METRICS_OTLP_ATTRIBUTE_ALLOWLIST: readonly ["ai_metrics.agent_nickname_hash", "ai_metrics.agent_role_hash", "ai_metrics.config_snapshot_id", "ai_metrics.event_name", "ai_metrics.forked_from_id_hash", "ai_metrics.ingest_run_id", "ai_metrics.line_number", "ai_metrics.parent_session_id_hash", "ai_metrics.parent_thread_id_hash", "ai_metrics.provider", "ai_metrics.raw_event_hash", "ai_metrics.session_id_hash", "ai_metrics.source_kind", "ai_metrics.source_path_hash", "ai_metrics.source_role", "ai_metrics.thread_spawn", "ai_metrics.timestamp", "ai_metrics.tool_name", "ai_metrics.turn_id", "openinference.span.kind", "session.id", "tool.name"]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/otlp.ts#L36)

Since v0.0.0

# errors

## AiMetricsOtlpExportError (class)

Error raised by AI metrics OTLP projection or export.

**Example**

```ts
import { AiMetricsOtlpExportError } from "@beep/repo-ai-metrics"
console.log(AiMetricsOtlpExportError)
```

**Signature**

```ts
declare class AiMetricsOtlpExportError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/otlp.ts#L103)

Since v0.0.0

# models

## AiMetricsOtlpAttributeValue (type alias)

Runtime type for `AiMetricsOtlpAttributeValue`.

**Example**

```ts
import type { AiMetricsOtlpAttributeValue } from "@beep/repo-ai-metrics"
const value: AiMetricsOtlpAttributeValue = "hash-only"
console.log(value)
```

**Signature**

```ts
type AiMetricsOtlpAttributeValue = typeof AiMetricsOtlpAttributeValue.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/otlp.ts#L90)

Since v0.0.0

## AiMetricsOtlpExportInput (class)

Input for exporting one derived ingest run as OTLP spans.

**Example**

```ts
import { AiMetricsOtlpExportInput, AiMetricsOtlpEndpointSpec } from "@beep/repo-ai-metrics"

const input = AiMetricsOtlpExportInput.make({
  duckDbPath: ".beep/ai-metrics/derived/ai-metrics.duckdb",
  endpoint: AiMetricsOtlpEndpointSpec.make({
    baseUrl: "http://127.0.0.1:6006",
    protocol: "http/protobuf",
    resourceAttributes: {},
    signalScope: "traces_only",
    traceUrl: "http://127.0.0.1:6006/v1/traces"
  }),
  target: "local"
})
console.log(input)
```

**Signature**

```ts
declare class AiMetricsOtlpExportInput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/otlp.ts#L137)

Since v0.0.0

## AiMetricsOtlpExportResult (class)

Result of a redacted AI metrics OTLP export attempt.

**Example**

```ts
import { AiMetricsOtlpExportResult } from "@beep/repo-ai-metrics"
console.log(AiMetricsOtlpExportResult)
```

**Signature**

```ts
declare class AiMetricsOtlpExportResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/otlp.ts#L206)

Since v0.0.0

## AiMetricsOtlpSpanProjection (class)

One span projection ready to be emitted through Effect tracing.

**Example**

```ts
import { AiMetricsOtlpSpanProjection } from "@beep/repo-ai-metrics"
console.log(AiMetricsOtlpSpanProjection)
```

**Signature**

```ts
declare class AiMetricsOtlpSpanProjection
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/otlp.ts#L160)

Since v0.0.0

## AiMetricsOtlpSpanProjectionBatch (class)

Span projection batch resolved for one derived ingest run.

**Example**

```ts
import { AiMetricsOtlpSpanProjectionBatch } from "@beep/repo-ai-metrics"
console.log(AiMetricsOtlpSpanProjectionBatch)
```

**Signature**

```ts
declare class AiMetricsOtlpSpanProjectionBatch
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/otlp.ts#L181)

Since v0.0.0

# schemas

## AiMetricsOtlpAttributeValue

Attribute value variants allowed on redacted AI metrics OTLP spans.

**Example**

```ts
import { AiMetricsOtlpAttributeValue } from "@beep/repo-ai-metrics"
console.log(AiMetricsOtlpAttributeValue)
```

**Signature**

```ts
declare const AiMetricsOtlpAttributeValue: AnnotatedSchema<S.Union<readonly [S.String, S.Finite, S.Boolean]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/otlp.ts#L72)

Since v0.0.0

# services

## readAiMetricsOtlpSpanProjections

Read derived DuckDB rows and build redacted OTLP span projections.

**Example**

```ts
import { readAiMetricsOtlpSpanProjections } from "@beep/repo-ai-metrics"
console.log(readAiMetricsOtlpSpanProjections)
```

**Signature**

```ts
declare const readAiMetricsOtlpSpanProjections: (input: AiMetricsOtlpExportInput) => Effect.Effect<AiMetricsOtlpSpanProjectionBatch, AiMetricsOtlpExportError, DuckDb>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/otlp.ts#L444)

Since v0.0.0

## runAiMetricsOtlpExport

Emit redacted AI metrics derived spans through the active Effect tracer.

**Example**

```ts
import { runAiMetricsOtlpExport } from "@beep/repo-ai-metrics"
console.log(runAiMetricsOtlpExport)
```

**Signature**

```ts
declare const runAiMetricsOtlpExport: (input: AiMetricsOtlpExportInput) => Effect.Effect<AiMetricsOtlpExportResult, AiMetricsOtlpExportError, DuckDb>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/otlp.ts#L474)

Since v0.0.0

# utilities

## otlpExportResultToJson

Render an OTLP export result as JSON.

**Example**

```ts
import { otlpExportResultToJson } from "@beep/repo-ai-metrics"
console.log(otlpExportResultToJson)
```

**Signature**

```ts
declare const otlpExportResultToJson: (result: AiMetricsOtlpExportResult) => Effect.Effect<string, AiMetricsOtlpExportError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/otlp.ts#L515)

Since v0.0.0