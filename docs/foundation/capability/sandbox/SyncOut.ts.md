---
title: SyncOut.ts
nav_order: 25
parent: "@beep/sandbox"
---

## SyncOut.ts overview

Git patch sync-out for isolated sandbox providers.

Since v0.0.0

---
## Exports Grouped by Category
- [combinators](#combinators)
  - [syncOut](#syncout)
- [models](#models)
  - [SyncOutOptions (class)](#syncoutoptions-class)
  - [SyncOutResult (class)](#syncoutresult-class)
---

# combinators

## syncOut

Sync committed, uncommitted, and untracked sandbox changes back to a host repository.

**Example**

```ts
import { syncOut } from "@beep/sandbox/SyncOut"

console.log(syncOut)
```

**Signature**

```ts
declare const syncOut: { <R>(hostRepoDir: string, handle: IsolatedSandboxHandle<R>): Effect.Effect<SyncOutResult, SyncError, R | SandboxProcess | FileSystem.FileSystem | Path.Path>; <R>(hostRepoDir: string, handle: IsolatedSandboxHandle<R>, options: SyncOutOptions): Effect.Effect<SyncOutResult, SyncError, R | SandboxProcess | FileSystem.FileSystem | Path.Path>; <R>(handle: IsolatedSandboxHandle<R>, options?: SyncOutOptions): (hostRepoDir: string) => Effect.Effect<SyncOutResult, SyncError, R | SandboxProcess | FileSystem.FileSystem | Path.Path>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/SyncOut.ts#L381)

Since v0.0.0

# models

## SyncOutOptions (class)

Optional sync-out recovery settings.

**Example**

```ts
import { SyncOutOptions } from "@beep/sandbox/SyncOut"

console.log(SyncOutOptions)
```

**Signature**

```ts
declare class SyncOutOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/SyncOut.ts#L48)

Since v0.0.0

## SyncOutResult (class)

Result returned after sandbox changes have been applied to the host.

**Example**

```ts
import { SyncOutResult } from "@beep/sandbox/SyncOut"

console.log(SyncOutResult)
```

**Signature**

```ts
declare class SyncOutResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/SyncOut.ts#L70)

Since v0.0.0