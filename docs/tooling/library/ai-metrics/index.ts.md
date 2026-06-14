---
title: index.ts
nav_order: 7
parent: "@beep/repo-ai-metrics"
---

## index.ts overview

Agent-effectiveness doctor and annotation-plan helpers.

**Example**

```ts
import { makeAgentEffectivenessDoctorReport } from "@beep/repo-ai-metrics"
console.log(makeAgentEffectivenessDoctorReport)
```

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - ["./models.ts" (namespace export)](#modelsts-namespace-export)
- [services](#services)
  - ["./agent-effectiveness.ts" (namespace export)](#agent-effectivenessts-namespace-export)
  - ["./archive.ts" (namespace export)](#archivets-namespace-export)
  - ["./compose.ts" (namespace export)](#composets-namespace-export)
  - ["./config-snapshot.ts" (namespace export)](#config-snapshotts-namespace-export)
  - ["./derived-storage.ts" (namespace export)](#derived-storagets-namespace-export)
  - ["./forwarder.ts" (namespace export)](#forwarderts-namespace-export)
  - ["./ingest.ts" (namespace export)](#ingestts-namespace-export)
  - ["./install.ts" (namespace export)](#installts-namespace-export)
  - ["./mirror.ts" (namespace export)](#mirrorts-namespace-export)
  - ["./otlp.ts" (namespace export)](#otlpts-namespace-export)
  - ["./privacy.ts" (namespace export)](#privacyts-namespace-export)
  - ["./retention.ts" (namespace export)](#retentionts-namespace-export)
  - ["./scorecard.ts" (namespace export)](#scorecardts-namespace-export)
  - ["./source-discovery.ts" (namespace export)](#source-discoveryts-namespace-export)
- [utilities](#utilities)
  - ["./shell.ts" (namespace export)](#shellts-namespace-export)
---

# models

## "./models.ts" (namespace export)

Re-exports all named exports from the "./models.ts" module.

**Example**

```ts
import { AiMetricsDeployTarget } from "@beep/repo-ai-metrics"
console.log(AiMetricsDeployTarget.Enum.local)
```

**Signature**

```ts
export * from "./models.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/index.ts#L127)

Since v0.0.0

# services

## "./agent-effectiveness.ts" (namespace export)

Re-exports all named exports from the "./agent-effectiveness.ts" module.

**Example**

```ts
import { makeAgentEffectivenessDoctorReport } from "@beep/repo-ai-metrics"
console.log(makeAgentEffectivenessDoctorReport)
```

**Signature**

```ts
export * from "./agent-effectiveness.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/index.ts#L19)

Since v0.0.0

## "./archive.ts" (namespace export)

Re-exports all named exports from the "./archive.ts" module.

**Example**

```ts
import { writeEncryptedRawArchiveObject } from "@beep/repo-ai-metrics"
console.log(writeEncryptedRawArchiveObject)
```

**Signature**

```ts
export * from "./archive.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/index.ts#L31)

Since v0.0.0

## "./compose.ts" (namespace export)

Re-exports all named exports from the "./compose.ts" module.

**Example**

```ts
import { renderAiMetricsLocalPhoenixCompose } from "@beep/repo-ai-metrics"
console.log(renderAiMetricsLocalPhoenixCompose)
```

**Signature**

```ts
export * from "./compose.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/index.ts#L43)

Since v0.0.0

## "./config-snapshot.ts" (namespace export)

Re-exports all named exports from the "./config-snapshot.ts" module.

**Example**

```ts
import { makeAiMetricsConfigSnapshot } from "@beep/repo-ai-metrics"
console.log(makeAiMetricsConfigSnapshot)
```

**Signature**

```ts
export * from "./config-snapshot.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/index.ts#L55)

Since v0.0.0

## "./derived-storage.ts" (namespace export)

Re-exports all named exports from the "./derived-storage.ts" module.

**Example**

```ts
import { writeAiMetricsDerivedStorage } from "@beep/repo-ai-metrics"
console.log(writeAiMetricsDerivedStorage)
```

**Signature**

```ts
export * from "./derived-storage.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/index.ts#L67)

Since v0.0.0

## "./forwarder.ts" (namespace export)

Re-exports all named exports from the "./forwarder.ts" module.

**Example**

```ts
import { runAiMetricsForwarder } from "@beep/repo-ai-metrics"
console.log(runAiMetricsForwarder)
```

**Signature**

```ts
export * from "./forwarder.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/index.ts#L79)

Since v0.0.0

## "./ingest.ts" (namespace export)

Re-exports all named exports from the "./ingest.ts" module.

**Example**

```ts
import { summarizeTranscriptText } from "@beep/repo-ai-metrics"
console.log(summarizeTranscriptText)
```

**Signature**

```ts
export * from "./ingest.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/index.ts#L91)

Since v0.0.0

## "./install.ts" (namespace export)

Re-exports all named exports from the "./install.ts" module.

**Example**

```ts
import { makeAiMetricsInstallSpec } from "@beep/repo-ai-metrics"
console.log(makeAiMetricsInstallSpec)
```

**Signature**

```ts
export * from "./install.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/index.ts#L103)

Since v0.0.0

## "./mirror.ts" (namespace export)

Re-exports all named exports from the "./mirror.ts" module.

**Example**

```ts
import { buildAiMetricsMirrorBundle } from "@beep/repo-ai-metrics"
console.log(buildAiMetricsMirrorBundle)
```

**Signature**

```ts
export * from "./mirror.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/index.ts#L115)

Since v0.0.0

## "./otlp.ts" (namespace export)

Re-exports all named exports from the "./otlp.ts" module.

**Example**

```ts
import { runAiMetricsOtlpExport } from "@beep/repo-ai-metrics"
console.log(runAiMetricsOtlpExport)
```

**Signature**

```ts
export * from "./otlp.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/index.ts#L139)

Since v0.0.0

## "./privacy.ts" (namespace export)

Re-exports all named exports from the "./privacy.ts" module.

**Example**

```ts
import { makeAiMetricsPrivacyCheckResult } from "@beep/repo-ai-metrics"
console.log(makeAiMetricsPrivacyCheckResult)
```

**Signature**

```ts
export * from "./privacy.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/index.ts#L151)

Since v0.0.0

## "./retention.ts" (namespace export)

Re-exports all named exports from the "./retention.ts" module.

**Example**

```ts
import { listAiMetricsRetentionInventory } from "@beep/repo-ai-metrics"
console.log(listAiMetricsRetentionInventory)
```

**Signature**

```ts
export * from "./retention.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/index.ts#L163)

Since v0.0.0

## "./scorecard.ts" (namespace export)

Re-exports all named exports from the "./scorecard.ts" module.

**Example**

```ts
import { generateAiMetricsWeeklyReport } from "@beep/repo-ai-metrics"
console.log(generateAiMetricsWeeklyReport)
```

**Signature**

```ts
export * from "./scorecard.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/index.ts#L175)

Since v0.0.0

## "./source-discovery.ts" (namespace export)

Re-exports all named exports from the "./source-discovery.ts" module.

**Example**

```ts
import { discoverAiMetricsSources } from "@beep/repo-ai-metrics"
console.log(discoverAiMetricsSources)
```

**Signature**

```ts
export * from "./source-discovery.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/index.ts#L199)

Since v0.0.0

# utilities

## "./shell.ts" (namespace export)

Re-exports all named exports from the "./shell.ts" module.

**Example**

```ts
import { shellQuote } from "@beep/repo-ai-metrics"
console.log(shellQuote("op://vault/item/field"))
```

**Signature**

```ts
export * from "./shell.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/index.ts#L187)

Since v0.0.0