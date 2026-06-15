---
title: SyncIn.ts
nav_order: 24
parent: "@beep/sandbox"
---

## SyncIn.ts overview

Git bundle sync-in for isolated sandbox providers.

Since v0.0.0

---
## Exports Grouped by Category
- [combinators](#combinators)
  - [syncIn](#syncin)
- [models](#models)
  - [SyncInResult (class)](#syncinresult-class)
---

# combinators

## syncIn

Sync a host git repository into an isolated sandbox by cloning from a git bundle.

**Example**

```ts
import { syncIn } from "@beep/sandbox/SyncIn"

console.log(syncIn)
```

**Signature**

```ts
declare const syncIn: { <R>(hostRepoDir: string, handle: IsolatedSandboxHandle<R>): Effect.Effect<SyncInResult, SyncError, R | SandboxProcess | FileSystem.FileSystem | Path.Path>; <R>(handle: IsolatedSandboxHandle<R>): (hostRepoDir: string) => Effect.Effect<SyncInResult, SyncError, R | SandboxProcess | FileSystem.FileSystem | Path.Path>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/SyncIn.ts#L196)

Since v0.0.0

# models

## SyncInResult (class)

Result returned after a repository has been copied into an isolated sandbox.

**Example**

```ts
import { SyncInResult } from "@beep/sandbox/SyncIn"

console.log(SyncInResult)
```

**Signature**

```ts
declare class SyncInResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/SyncIn.ts#L37)

Since v0.0.0