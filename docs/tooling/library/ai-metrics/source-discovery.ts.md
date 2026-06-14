---
title: source-discovery.ts
nav_order: 17
parent: "@beep/repo-ai-metrics"
---

## source-discovery.ts overview

Source discovery for repo AI metrics.

Since v0.0.0

---
## Exports Grouped by Category
- [errors](#errors)
  - [AiMetricsSourceDiscoveryError (class)](#aimetricssourcediscoveryerror-class)
- [models](#models)
  - [AiMetricsDiscoveredSource (class)](#aimetricsdiscoveredsource-class)
  - [AiMetricsDiscoveredTranscriptFile (class)](#aimetricsdiscoveredtranscriptfile-class)
  - [AiMetricsSourceDiscoveryInput (class)](#aimetricssourcediscoveryinput-class)
  - [AiMetricsSourceDiscoveryResult (class)](#aimetricssourcediscoveryresult-class)
  - [AiMetricsSourceStatus](#aimetricssourcestatus)
  - [AiMetricsSourceStatus (type alias)](#aimetricssourcestatus-type-alias)
- [services](#services)
  - [discoverAiMetricsSources](#discoveraimetricssources)
- [utilities](#utilities)
  - [sourceDiscoveryToJson](#sourcediscoverytojson)
---

# errors

## AiMetricsSourceDiscoveryError (class)

Error raised by source discovery.

**Example**

```ts
import { AiMetricsSourceDiscoveryError } from "@beep/repo-ai-metrics"
console.log(AiMetricsSourceDiscoveryError)
```

**Signature**

```ts
declare class AiMetricsSourceDiscoveryError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/source-discovery.ts#L224)

Since v0.0.0

# models

## AiMetricsDiscoveredSource (class)

Source-level discovery summary.

**Example**

```ts
import { AiMetricsDiscoveredSource } from "@beep/repo-ai-metrics"
console.log(AiMetricsDiscoveredSource)
```

**Signature**

```ts
declare class AiMetricsDiscoveredSource
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/source-discovery.ts#L150)

Since v0.0.0

## AiMetricsDiscoveredTranscriptFile (class)

One transcript or source metadata file discovered for AI metrics.

**Example**

```ts
import { AiMetricsDiscoveredTranscriptFile } from "@beep/repo-ai-metrics"
console.log(AiMetricsDiscoveredTranscriptFile)
```

**Signature**

```ts
declare class AiMetricsDiscoveredTranscriptFile
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/source-discovery.ts#L117)

Since v0.0.0

## AiMetricsSourceDiscoveryInput (class)

Input for local AI metrics source discovery.

**Example**

```ts
import { AiMetricsSourceDiscoveryInput } from "@beep/repo-ai-metrics"
console.log(AiMetricsSourceDiscoveryInput)
```

**Signature**

```ts
declare class AiMetricsSourceDiscoveryInput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/source-discovery.ts#L76)

Since v0.0.0

## AiMetricsSourceDiscoveryResult (class)

Complete P1 source discovery result.

**Example**

```ts
import { AiMetricsSourceDiscoveryResult } from "@beep/repo-ai-metrics"
console.log(AiMetricsSourceDiscoveryResult)
```

**Signature**

```ts
declare class AiMetricsSourceDiscoveryResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/source-discovery.ts#L192)

Since v0.0.0

## AiMetricsSourceStatus

P1 source discovery availability status.

**Example**

```ts
import { AiMetricsSourceStatus } from "@beep/repo-ai-metrics"
console.log(AiMetricsSourceStatus.Enum.available)
```

**Signature**

```ts
declare const AiMetricsSourceStatus: AnnotatedSchema<LiteralKit<readonly ["available", "missing", "unavailable"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/source-discovery.ts#L45)

Since v0.0.0

## AiMetricsSourceStatus (type alias)

Runtime type for `AiMetricsSourceStatus`.

**Example**

```ts
import type { AiMetricsSourceStatus } from "@beep/repo-ai-metrics"
const status: AiMetricsSourceStatus = "available"
console.log(status)
```

**Signature**

```ts
type AiMetricsSourceStatus = typeof AiMetricsSourceStatus.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/source-discovery.ts#L63)

Since v0.0.0

# services

## discoverAiMetricsSources

Discover local AI metrics transcript sources for the smoke target.

**Example**

```ts
import { discoverAiMetricsSources } from "@beep/repo-ai-metrics"
console.log(discoverAiMetricsSources)
```

**Signature**

```ts
declare const discoverAiMetricsSources: (input: AiMetricsSourceDiscoveryInput) => Effect.Effect<AiMetricsSourceDiscoveryResult, AiMetricsPrivacyError, FileSystem.FileSystem | Path.Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/source-discovery.ts#L574)

Since v0.0.0

# utilities

## sourceDiscoveryToJson

Render a source discovery result as JSON.

**Example**

```ts
import { sourceDiscoveryToJson } from "@beep/repo-ai-metrics"
console.log(sourceDiscoveryToJson)
```

**Signature**

```ts
declare const sourceDiscoveryToJson: (result: AiMetricsSourceDiscoveryResult) => Effect.Effect<string, AiMetricsSourceDiscoveryError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/source-discovery.ts#L631)

Since v0.0.0