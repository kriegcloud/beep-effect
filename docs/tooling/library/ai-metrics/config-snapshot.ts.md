---
title: config-snapshot.ts
nav_order: 4
parent: "@beep/repo-ai-metrics"
---

## config-snapshot.ts overview

Repo-local agent configuration snapshots for AI metrics attribution.

Since v0.0.0

---
## Exports Grouped by Category
- [errors](#errors)
  - [AiMetricsConfigSnapshotError (class)](#aimetricsconfigsnapshoterror-class)
- [models](#models)
  - [AiMetricsConfigSnapshotDiff (class)](#aimetricsconfigsnapshotdiff-class)
  - [AiMetricsConfigSnapshotFile (class)](#aimetricsconfigsnapshotfile-class)
  - [AiMetricsConfigSnapshotInput (class)](#aimetricsconfigsnapshotinput-class)
  - [AiMetricsConfigSnapshotResult (class)](#aimetricsconfigsnapshotresult-class)
- [services](#services)
  - [makeAiMetricsConfigSnapshot](#makeaimetricsconfigsnapshot)
  - [writeAiMetricsConfigSnapshotArtifacts](#writeaimetricsconfigsnapshotartifacts)
- [utilities](#utilities)
  - [configSnapshotToJson](#configsnapshottojson)
---

# errors

## AiMetricsConfigSnapshotError (class)

Error raised by config snapshot helpers.

**Example**

```ts
import { AiMetricsConfigSnapshotError } from "@beep/repo-ai-metrics"
console.log(AiMetricsConfigSnapshotError)
```

**Signature**

```ts
declare class AiMetricsConfigSnapshotError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/config-snapshot.ts#L151)

Since v0.0.0

# models

## AiMetricsConfigSnapshotDiff (class)

Diff between the current and previous AI metrics config snapshot.

**Example**

```ts
import { AiMetricsConfigSnapshotDiff } from "@beep/repo-ai-metrics"
console.log(AiMetricsConfigSnapshotDiff)
```

**Signature**

```ts
declare class AiMetricsConfigSnapshotDiff
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/config-snapshot.ts#L72)

Since v0.0.0

## AiMetricsConfigSnapshotFile (class)

One file included in an AI metrics config snapshot.

**Example**

```ts
import { AiMetricsConfigSnapshotFile } from "@beep/repo-ai-metrics"
console.log(AiMetricsConfigSnapshotFile)
```

**Signature**

```ts
declare class AiMetricsConfigSnapshotFile
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/config-snapshot.ts#L102)

Since v0.0.0

## AiMetricsConfigSnapshotInput (class)

Input for repo-local agent configuration snapshotting.

**Example**

```ts
import { AiMetricsConfigSnapshotInput } from "@beep/repo-ai-metrics"
console.log(AiMetricsConfigSnapshotInput)
```

**Signature**

```ts
declare class AiMetricsConfigSnapshotInput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/config-snapshot.ts#L45)

Since v0.0.0

## AiMetricsConfigSnapshotResult (class)

Complete repo-local agent configuration snapshot result.

**Example**

```ts
import { AiMetricsConfigSnapshotResult } from "@beep/repo-ai-metrics"
console.log(AiMetricsConfigSnapshotResult)
```

**Signature**

```ts
declare class AiMetricsConfigSnapshotResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/config-snapshot.ts#L124)

Since v0.0.0

# services

## makeAiMetricsConfigSnapshot

Build a deterministic snapshot of repo-owned agent-facing configuration.

**Example**

```ts
import { makeAiMetricsConfigSnapshot } from "@beep/repo-ai-metrics"
console.log(makeAiMetricsConfigSnapshot)
```

**Signature**

```ts
declare const makeAiMetricsConfigSnapshot: (input: AiMetricsConfigSnapshotInput) => Effect.Effect<AiMetricsConfigSnapshotResult, AiMetricsPrivacyError | AiMetricsConfigSnapshotError, FileSystem.FileSystem | Path.Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/config-snapshot.ts#L424)

Since v0.0.0

## writeAiMetricsConfigSnapshotArtifacts

Persist a config snapshot manifest and latest pointer for future diff attribution.

**Example**

```ts
import { writeAiMetricsConfigSnapshotArtifacts } from "@beep/repo-ai-metrics"
console.log(writeAiMetricsConfigSnapshotArtifacts)
```

**Signature**

```ts
declare const writeAiMetricsConfigSnapshotArtifacts: (args_0: { readonly commitLatest?: boolean; readonly outputDir: string; readonly result: AiMetricsConfigSnapshotResult; }) => Effect.Effect<{ latestPath: string; manifestPath: string; }, AiMetricsConfigSnapshotError, FileSystem.FileSystem | Path.Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/config-snapshot.ts#L477)

Since v0.0.0

# utilities

## configSnapshotToJson

Render a config snapshot result as JSON.

**Example**

```ts
import { configSnapshotToJson } from "@beep/repo-ai-metrics"
console.log(configSnapshotToJson)
```

**Signature**

```ts
declare const configSnapshotToJson: (result: AiMetricsConfigSnapshotResult) => Effect.Effect<string, AiMetricsConfigSnapshotError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/config-snapshot.ts#L543)

Since v0.0.0