---
title: TsconfigSync.errors.ts
nav_order: 80
parent: "@beep/repo-cli"
---

## TsconfigSync.errors.ts overview

Tagged errors for the TsconfigSync command suite.

Since v0.0.0

---
## Exports Grouped by Category
- [utilities](#utilities)
  - [TsconfigSyncCycleError (class)](#tsconfigsynccycleerror-class)
  - [TsconfigSyncDriftError (class)](#tsconfigsyncdrifterror-class)
  - [TsconfigSyncFilterError (class)](#tsconfigsyncfiltererror-class)
---

# utilities

## TsconfigSyncCycleError (class)

Cycle error raised when workspace dependency cycles are detected.

**Example**

```ts
import { TsconfigSyncCycleError } from "@beep/repo-cli/commands/TsconfigSync"
console.log(TsconfigSyncCycleError)
```

**Signature**

```ts
declare class TsconfigSyncCycleError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/TsconfigSync/TsconfigSync.errors.ts#L70)

Since v0.0.0

## TsconfigSyncDriftError (class)

Drift error raised in check mode when changes are required.

**Example**

```ts
import { TsconfigSyncDriftError } from "@beep/repo-cli/commands/TsconfigSync"
console.log(TsconfigSyncDriftError)
```

**Signature**

```ts
declare class TsconfigSyncDriftError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/TsconfigSync/TsconfigSync.errors.ts#L26)

Since v0.0.0

## TsconfigSyncFilterError (class)

Filter error raised when `--filter` does not match any workspace package.

**Example**

```ts
import { TsconfigSyncFilterError } from "@beep/repo-cli/commands/TsconfigSync"
console.log(TsconfigSyncFilterError)
```

**Signature**

```ts
declare class TsconfigSyncFilterError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/TsconfigSync/TsconfigSync.errors.ts#L114)

Since v0.0.0