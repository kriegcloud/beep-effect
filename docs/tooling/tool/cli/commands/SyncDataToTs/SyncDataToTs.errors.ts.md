---
title: SyncDataToTs.errors.ts
nav_order: 75
parent: "@beep/repo-cli"
---

## SyncDataToTs.errors.ts overview

Tagged errors for the SyncDataToTs command suite.

Since v0.0.0

---
## Exports Grouped by Category
- [utilities](#utilities)
  - [SyncDataToTsDriftError (class)](#syncdatatotsdrifterror-class)
  - [SyncDataToTsError (class)](#syncdatatotserror-class)
---

# utilities

## SyncDataToTsDriftError (class)

Drift detected in check mode.

**Example**

```ts
import { SyncDataToTsDriftError } from "@beep/repo-cli/commands/SyncDataToTs"
console.log(SyncDataToTsDriftError)
```

**Signature**

```ts
declare class SyncDataToTsDriftError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/SyncDataToTs/SyncDataToTs.errors.ts#L96)

Since v0.0.0

## SyncDataToTsError (class)

Operational error during source fetch, parsing, projection, or file writes.

**Example**

```ts
import { SyncDataToTsError } from "@beep/repo-cli/commands/SyncDataToTs"
console.log(SyncDataToTsError)
```

**Signature**

```ts
declare class SyncDataToTsError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/SyncDataToTs/SyncDataToTs.errors.ts#L40)

Since v0.0.0