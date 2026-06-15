---
title: drift.ts
nav_order: 3
parent: "@beep/ai-sync"
---

## drift.ts overview

Local and strict drift checks for generated AI sync artifacts.

Since v0.0.0

---
## Exports Grouped by Category
- [constants](#constants)
  - [getGeneratedSourceMetadata](#getgeneratedsourcemetadata)
- [validation](#validation)
  - [assertNoStrictDrift](#assertnostrictdrift)
  - [checkGeneratedArtifacts](#checkgeneratedartifacts)
  - [checkSourceDriftWithFetcher](#checksourcedriftwithfetcher)
  - [checkStrictDrift](#checkstrictdrift)
---

# constants

## getGeneratedSourceMetadata

Decode committed generated source metadata.

**Example**

```ts
import { getGeneratedSourceMetadata } from "@beep/ai-sync"
console.log(getGeneratedSourceMetadata)
```

**Signature**

```ts
declare const getGeneratedSourceMetadata: () => Effect.Effect<ReadonlyArray<AiSyncSourceMetadata>, AiSyncError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/drift.ts#L48)

Since v0.0.0

# validation

## assertNoStrictDrift

Fail when strict drift reports any findings.

**Example**

```ts
import { assertNoStrictDrift } from "@beep/ai-sync"
console.log(assertNoStrictDrift)
```

**Signature**

```ts
declare const assertNoStrictDrift: () => Effect.Effect<AiSyncDriftReport, AiSyncError, HttpClient>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/drift.ts#L187)

Since v0.0.0

## checkGeneratedArtifacts

Offline generated artifact freshness check.

**Example**

```ts
import { checkGeneratedArtifacts } from "@beep/ai-sync"
console.log(checkGeneratedArtifacts)
```

**Signature**

```ts
declare const checkGeneratedArtifacts: () => Effect.Effect<AiSyncDriftReport, AiSyncError, FileSystem.FileSystem | Path.Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/drift.ts#L70)

Since v0.0.0

## checkSourceDriftWithFetcher

Compare a set of sources with an injected fetcher.

**Example**

```ts
import { checkSourceDriftWithFetcher } from "@beep/ai-sync"
console.log(checkSourceDriftWithFetcher)
```

**Signature**

```ts
declare const checkSourceDriftWithFetcher: <R>(options: { readonly sources: ReadonlyArray<AiSyncSourceMetadata>; readonly fetcher: (source: AiSyncSourceMetadata) => Effect.Effect<string, AiSyncError, R>; }) => Effect.Effect<ReadonlyArray<AiSyncDriftFinding>, AiSyncError, R>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/drift.ts#L133)

Since v0.0.0

## checkStrictDrift

Networked strict drift check against committed Tier-1 hashes.

**Example**

```ts
import { checkStrictDrift } from "@beep/ai-sync"
console.log(checkStrictDrift)
```

**Signature**

```ts
declare const checkStrictDrift: () => Effect.Effect<AiSyncDriftReport, AiSyncError, HttpClient>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/drift.ts#L169)

Since v0.0.0