---
title: retention.ts
nav_order: 14
parent: "@beep/repo-ai-metrics"
---

## retention.ts overview

P7 retention, restore, delete, and compaction workflows for repo AI metrics.

Since v0.0.0

---
## Exports Grouped by Category
- [errors](#errors)
  - [AiMetricsRetentionError (class)](#aimetricsretentionerror-class)
- [models](#models)
  - [AiMetricsRetentionEnforcementPolicy (class)](#aimetricsretentionenforcementpolicy-class)
  - [AiMetricsRetentionEnforcementResult (class)](#aimetricsretentionenforcementresult-class)
  - [AiMetricsRetentionFileItem (class)](#aimetricsretentionfileitem-class)
  - [AiMetricsRetentionInventory (class)](#aimetricsretentioninventory-class)
  - [AiMetricsRetentionMutationResult (class)](#aimetricsretentionmutationresult-class)
  - [AiMetricsRetentionRawArchiveItem (class)](#aimetricsretentionrawarchiveitem-class)
  - [AiMetricsRetentionRestoreDrillInput (class)](#aimetricsretentionrestoredrillinput-class)
  - [AiMetricsRetentionRestoreDrillResult (class)](#aimetricsretentionrestoredrillresult-class)
  - [AiMetricsRetentionSelector (class)](#aimetricsretentionselector-class)
- [services](#services)
  - [enforceAiMetricsRetentionPolicy](#enforceaimetricsretentionpolicy)
  - [listAiMetricsRetentionInventory](#listaimetricsretentioninventory)
  - [runAiMetricsRetentionCompact](#runaimetricsretentioncompact)
  - [runAiMetricsRetentionDelete](#runaimetricsretentiondelete)
  - [runAiMetricsRetentionRestoreDrill](#runaimetricsretentionrestoredrill)
- [utilities](#utilities)
  - [aiMetricsRetentionEnforcementToJson](#aimetricsretentionenforcementtojson)
  - [aiMetricsRetentionInventoryToJson](#aimetricsretentioninventorytojson)
  - [aiMetricsRetentionMutationToJson](#aimetricsretentionmutationtojson)
  - [aiMetricsRetentionRestoreDrillToJson](#aimetricsretentionrestoredrilltojson)
---

# errors

## AiMetricsRetentionError (class)

Error raised by P7 AI metrics retention workflows.

**Example**

```ts
import { AiMetricsRetentionError } from "@beep/repo-ai-metrics"
console.log(AiMetricsRetentionError)
```

**Signature**

```ts
declare class AiMetricsRetentionError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/retention.ts#L172)

Since v0.0.0

# models

## AiMetricsRetentionEnforcementPolicy (class)

Policy for preventive local AI metrics retention enforcement.

**Example**

```ts
import { AiMetricsRetentionEnforcementPolicy } from "@beep/repo-ai-metrics"
console.log(AiMetricsRetentionEnforcementPolicy.make({}).maxSnapshotExports)
```

**Signature**

```ts
declare class AiMetricsRetentionEnforcementPolicy
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/retention.ts#L323)

Since v0.0.0

## AiMetricsRetentionEnforcementResult (class)

Result for preventive local AI metrics retention enforcement.

**Example**

```ts
import { AiMetricsRetentionEnforcementResult } from "@beep/repo-ai-metrics"
console.log(AiMetricsRetentionEnforcementResult)
```

**Signature**

```ts
declare class AiMetricsRetentionEnforcementResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/retention.ts#L356)

Since v0.0.0

## AiMetricsRetentionFileItem (class)

Deploy-safe retained file inventory row.

**Example**

```ts
import { AiMetricsRetentionFileItem } from "@beep/repo-ai-metrics"
console.log(AiMetricsRetentionFileItem)
```

**Signature**

```ts
declare class AiMetricsRetentionFileItem
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/retention.ts#L247)

Since v0.0.0

## AiMetricsRetentionInventory (class)

Path-safe inventory returned by `ai-metrics retention list`.

**Example**

```ts
import { AiMetricsRetentionInventory } from "@beep/repo-ai-metrics"
console.log(AiMetricsRetentionInventory)
```

**Signature**

```ts
declare class AiMetricsRetentionInventory
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/retention.ts#L268)

Since v0.0.0

## AiMetricsRetentionMutationResult (class)

Result for delete or compaction retention commands.

**Example**

```ts
import { AiMetricsRetentionMutationResult } from "@beep/repo-ai-metrics"
console.log(AiMetricsRetentionMutationResult)
```

**Signature**

```ts
declare class AiMetricsRetentionMutationResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/retention.ts#L295)

Since v0.0.0

## AiMetricsRetentionRawArchiveItem (class)

Deploy-safe raw archive inventory row.

**Example**

```ts
import { AiMetricsRetentionRawArchiveItem } from "@beep/repo-ai-metrics"
console.log(AiMetricsRetentionRawArchiveItem)
```

**Signature**

```ts
declare class AiMetricsRetentionRawArchiveItem
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/retention.ts#L220)

Since v0.0.0

## AiMetricsRetentionRestoreDrillInput (class)

Input for a retained raw archive restore drill.

**Example**

```ts
import { AiMetricsRetentionRestoreDrillInput } from "@beep/repo-ai-metrics"
console.log(AiMetricsRetentionRestoreDrillInput)
```

**Signature**

```ts
declare class AiMetricsRetentionRestoreDrillInput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/retention.ts#L383)

Since v0.0.0

## AiMetricsRetentionRestoreDrillResult (class)

Result for a retained raw archive restore drill.

**Example**

```ts
import { AiMetricsRetentionRestoreDrillResult } from "@beep/repo-ai-metrics"
console.log(AiMetricsRetentionRestoreDrillResult)
```

**Signature**

```ts
declare class AiMetricsRetentionRestoreDrillResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/retention.ts#L409)

Since v0.0.0

## AiMetricsRetentionSelector (class)

Time-window selector for AI metrics retention commands.

**Example**

```ts
import { AiMetricsRetentionSelector } from "@beep/repo-ai-metrics"
console.log(AiMetricsRetentionSelector.make({}).dataRoot)
```

**Signature**

```ts
declare class AiMetricsRetentionSelector
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/retention.ts#L194)

Since v0.0.0

# services

## enforceAiMetricsRetentionPolicy

Enforce local AI metrics retention for old per-run Parquet snapshots.

**Example**

```ts
import { enforceAiMetricsRetentionPolicy } from "@beep/repo-ai-metrics"
console.log(enforceAiMetricsRetentionPolicy)
```

**Signature**

```ts
declare const enforceAiMetricsRetentionPolicy: (policy: AiMetricsRetentionEnforcementPolicy) => Effect.Effect<AiMetricsRetentionEnforcementResult, AiMetricsRetentionError, FileSystem.FileSystem | Path.Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/retention.ts#L793)

Since v0.0.0

## listAiMetricsRetentionInventory

List retained AI metrics raw archive objects and derived/report outputs.

**Example**

```ts
import { listAiMetricsRetentionInventory } from "@beep/repo-ai-metrics"
console.log(listAiMetricsRetentionInventory)
```

**Signature**

```ts
declare const listAiMetricsRetentionInventory: (input: AiMetricsRetentionSelector) => Effect.Effect<AiMetricsRetentionInventory, AiMetricsRetentionError, FileSystem.FileSystem | Path.Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/retention.ts#L650)

Since v0.0.0

## runAiMetricsRetentionCompact

Compact selected AI metrics derived Parquet and report outputs.

**Example**

```ts
import { runAiMetricsRetentionCompact } from "@beep/repo-ai-metrics"
console.log(runAiMetricsRetentionCompact)
```

**Signature**

```ts
declare const runAiMetricsRetentionCompact: { (input: AiMetricsRetentionSelector, dryRun: boolean): Effect.Effect<AiMetricsRetentionMutationResult, AiMetricsRetentionError, FileSystem.FileSystem | Path.Path>; (dryRun: boolean): (input: AiMetricsRetentionSelector) => Effect.Effect<AiMetricsRetentionMutationResult, AiMetricsRetentionError, FileSystem.FileSystem | Path.Path>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/retention.ts#L926)

Since v0.0.0

## runAiMetricsRetentionDelete

Delete selected AI metrics raw, derived, and report data.

**Example**

```ts
import { runAiMetricsRetentionDelete } from "@beep/repo-ai-metrics"
console.log(runAiMetricsRetentionDelete)
```

**Signature**

```ts
declare const runAiMetricsRetentionDelete: { (input: AiMetricsRetentionSelector, dryRun: boolean): Effect.Effect<AiMetricsRetentionMutationResult, AiMetricsRetentionError, FileSystem.FileSystem | Path.Path>; (dryRun: boolean): (input: AiMetricsRetentionSelector) => Effect.Effect<AiMetricsRetentionMutationResult, AiMetricsRetentionError, FileSystem.FileSystem | Path.Path>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/retention.ts#L901)

Since v0.0.0

## runAiMetricsRetentionRestoreDrill

Restore selected encrypted raw archive objects into disposable derived storage.

**Example**

```ts
import { runAiMetricsRetentionRestoreDrill } from "@beep/repo-ai-metrics"
console.log(runAiMetricsRetentionRestoreDrill)
```

**Signature**

```ts
declare const runAiMetricsRetentionRestoreDrill: (input: AiMetricsRetentionRestoreDrillInput) => Effect.Effect<AiMetricsRetentionRestoreDrillResult, AiMetricsRetentionError, FileSystem.FileSystem | Path.Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/retention.ts#L951)

Since v0.0.0

# utilities

## aiMetricsRetentionEnforcementToJson

Render a retention enforcement result as JSON.

**Example**

```ts
import { aiMetricsRetentionEnforcementToJson } from "@beep/repo-ai-metrics"
console.log(aiMetricsRetentionEnforcementToJson)
```

**Signature**

```ts
declare const aiMetricsRetentionEnforcementToJson: (result: AiMetricsRetentionEnforcementResult) => Effect.Effect<string, AiMetricsRetentionError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/retention.ts#L1109)

Since v0.0.0

## aiMetricsRetentionInventoryToJson

Render a retention inventory as JSON.

**Example**

```ts
import { aiMetricsRetentionInventoryToJson } from "@beep/repo-ai-metrics"
console.log(aiMetricsRetentionInventoryToJson)
```

**Signature**

```ts
declare const aiMetricsRetentionInventoryToJson: (result: AiMetricsRetentionInventory) => Effect.Effect<string, AiMetricsRetentionError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/retention.ts#L1089)

Since v0.0.0

## aiMetricsRetentionMutationToJson

Render a retention mutation result as JSON.

**Example**

```ts
import { aiMetricsRetentionMutationToJson } from "@beep/repo-ai-metrics"
console.log(aiMetricsRetentionMutationToJson)
```

**Signature**

```ts
declare const aiMetricsRetentionMutationToJson: (result: AiMetricsRetentionMutationResult) => Effect.Effect<string, AiMetricsRetentionError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/retention.ts#L1129)

Since v0.0.0

## aiMetricsRetentionRestoreDrillToJson

Render a restore drill result as JSON.

**Example**

```ts
import { aiMetricsRetentionRestoreDrillToJson } from "@beep/repo-ai-metrics"
console.log(aiMetricsRetentionRestoreDrillToJson)
```

**Signature**

```ts
declare const aiMetricsRetentionRestoreDrillToJson: (result: AiMetricsRetentionRestoreDrillResult) => Effect.Effect<string, AiMetricsRetentionError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/retention.ts#L1149)

Since v0.0.0