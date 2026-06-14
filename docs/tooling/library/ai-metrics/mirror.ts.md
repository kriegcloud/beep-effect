---
title: mirror.ts
nav_order: 10
parent: "@beep/repo-ai-metrics"
---

## mirror.ts overview

P7 sanitized mirror bundle helpers for repo AI metrics.

Since v0.0.0

---
## Exports Grouped by Category
- [errors](#errors)
  - [AiMetricsMirrorError (class)](#aimetricsmirrorerror-class)
- [models](#models)
  - [AiMetricsMirrorBundleInput (class)](#aimetricsmirrorbundleinput-class)
  - [AiMetricsMirrorBundleManifest (class)](#aimetricsmirrorbundlemanifest-class)
  - [AiMetricsMirrorBundleResult (class)](#aimetricsmirrorbundleresult-class)
  - [AiMetricsMirrorPrivacyProof (class)](#aimetricsmirrorprivacyproof-class)
  - [AiMetricsMirrorTableExport (class)](#aimetricsmirrortableexport-class)
- [services](#services)
  - [buildAiMetricsMirrorBundle](#buildaimetricsmirrorbundle)
  - [locateLatestAiMetricsMirrorBundle](#locatelatestaimetricsmirrorbundle)
- [utilities](#utilities)
  - [aiMetricsMirrorBundleToJson](#aimetricsmirrorbundletojson)
---

# errors

## AiMetricsMirrorError (class)

Error raised by the P7 AI metrics mirror bundle workflow.

**Example**

```ts
import { AiMetricsMirrorError } from "@beep/repo-ai-metrics"
console.log(AiMetricsMirrorError)
```

**Signature**

```ts
declare class AiMetricsMirrorError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/mirror.ts#L367)

Since v0.0.0

# models

## AiMetricsMirrorBundleInput (class)

Input for building a sanitized P7 mirror bundle.

**Example**

```ts
import { AiMetricsMirrorBundleInput } from "@beep/repo-ai-metrics"
console.log(AiMetricsMirrorBundleInput.make({}).remoteRoot)
```

**Signature**

```ts
declare class AiMetricsMirrorBundleInput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/mirror.ts#L401)

Since v0.0.0

## AiMetricsMirrorBundleManifest (class)

Deploy-safe manifest written into every P7 mirror bundle.

**Example**

```ts
import { AiMetricsMirrorBundleManifest } from "@beep/repo-ai-metrics"
console.log(AiMetricsMirrorBundleManifest)
```

**Signature**

```ts
declare class AiMetricsMirrorBundleManifest
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/mirror.ts#L479)

Since v0.0.0

## AiMetricsMirrorBundleResult (class)

Result of building a sanitized P7 mirror bundle.

**Example**

```ts
import { AiMetricsMirrorBundleResult } from "@beep/repo-ai-metrics"
console.log(AiMetricsMirrorBundleResult)
```

**Signature**

```ts
declare class AiMetricsMirrorBundleResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/mirror.ts#L513)

Since v0.0.0

## AiMetricsMirrorPrivacyProof (class)

Privacy proof summary attached to a P7 mirror bundle.

**Example**

```ts
import { AiMetricsMirrorPrivacyProof } from "@beep/repo-ai-metrics"
console.log(AiMetricsMirrorPrivacyProof)
```

**Signature**

```ts
declare class AiMetricsMirrorPrivacyProof
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/mirror.ts#L456)

Since v0.0.0

## AiMetricsMirrorTableExport (class)

One sanitized table exported into a P7 mirror bundle.

**Example**

```ts
import { AiMetricsMirrorTableExport } from "@beep/repo-ai-metrics"
console.log(AiMetricsMirrorTableExport)
```

**Signature**

```ts
declare class AiMetricsMirrorTableExport
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/mirror.ts#L434)

Since v0.0.0

# services

## buildAiMetricsMirrorBundle

Build a sanitized deploy-safe P7 mirror bundle from local derived DuckDB data.

**Example**

```ts
import { buildAiMetricsMirrorBundle } from "@beep/repo-ai-metrics"
console.log(buildAiMetricsMirrorBundle)
```

**Signature**

```ts
declare const buildAiMetricsMirrorBundle: (input: AiMetricsMirrorBundleInput) => Effect.Effect<AiMetricsMirrorBundleResult, AiMetricsMirrorError, FileSystem.FileSystem | Path.Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/mirror.ts#L643)

Since v0.0.0

## locateLatestAiMetricsMirrorBundle

Locate the latest local mirror bundle pointer for a data root.

**Example**

```ts
import { locateLatestAiMetricsMirrorBundle } from "@beep/repo-ai-metrics"
console.log(locateLatestAiMetricsMirrorBundle)
```

**Signature**

```ts
declare const locateLatestAiMetricsMirrorBundle: (dataRoot?: string | undefined) => Effect.Effect<string, AiMetricsMirrorError, FileSystem.FileSystem>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/mirror.ts#L540)

Since v0.0.0

# utilities

## aiMetricsMirrorBundleToJson

Render a mirror bundle build result as JSON.

**Example**

```ts
import { aiMetricsMirrorBundleToJson } from "@beep/repo-ai-metrics"
console.log(aiMetricsMirrorBundleToJson)
```

**Signature**

```ts
declare const aiMetricsMirrorBundleToJson: (result: AiMetricsMirrorBundleResult) => Effect.Effect<string, AiMetricsMirrorError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/mirror.ts#L789)

Since v0.0.0