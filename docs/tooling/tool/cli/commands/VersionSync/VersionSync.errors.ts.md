---
title: VersionSync.errors.ts
nav_order: 83
parent: "@beep/repo-cli"
---

## VersionSync.errors.ts overview

Tagged errors for the VersionSync command suite.

Since v0.0.0

---
## Exports Grouped by Category
- [utilities](#utilities)
  - [NetworkUnavailableError (class)](#networkunavailableerror-class)
  - [VersionSyncDriftError (class)](#versionsyncdrifterror-class)
  - [VersionSyncError (class)](#versionsyncerror-class)
---

# utilities

## NetworkUnavailableError (class)

Network unavailable during upstream version resolution.

**Example**

```ts
import { NetworkUnavailableError } from "@beep/repo-cli/commands/VersionSync"
console.log(NetworkUnavailableError)
```

**Signature**

```ts
declare class NetworkUnavailableError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/VersionSync/VersionSync.errors.ts#L89)

Since v0.0.0

## VersionSyncDriftError (class)

Drift detected in check mode (non-zero exit).

**Example**

```ts
import { VersionSyncDriftError } from "@beep/repo-cli/commands/VersionSync"
console.log(VersionSyncDriftError)
```

**Signature**

```ts
declare class VersionSyncDriftError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/VersionSync/VersionSync.errors.ts#L115)

Since v0.0.0

## VersionSyncError (class)

Operational error during version sync (file read/write, parse failures).

**Example**

```ts
import { VersionSyncError } from "@beep/repo-cli/commands/VersionSync"
console.log(VersionSyncError)
```

**Signature**

```ts
declare class VersionSyncError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/VersionSync/VersionSync.errors.ts#L40)

Since v0.0.0