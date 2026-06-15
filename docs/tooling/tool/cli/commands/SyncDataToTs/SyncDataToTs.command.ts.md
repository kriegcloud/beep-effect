---
title: SyncDataToTs.command.ts
nav_order: 74
parent: "@beep/repo-cli"
---

## SyncDataToTs.command.ts overview

Sync checked-in official datasets into deterministic TypeScript modules.

Since v0.0.0

---
## Exports Grouped by Category
- [use-cases](#use-cases)
  - [syncDataToTsCommand](#syncdatatotscommand)
---

# use-cases

## syncDataToTsCommand

CLI command for syncing official upstream datasets into checked-in TypeScript modules.

**Example**

```ts
import { syncDataToTsCommand } from "@beep/repo-cli/commands/SyncDataToTs"
console.log(syncDataToTsCommand)
```

**Signature**

```ts
declare const syncDataToTsCommand: Command.Command<"sync-data-to-ts", { readonly target: O.Option<string>; readonly all: boolean; readonly check: boolean; readonly dryRun: boolean; readonly verbose: boolean; }, {}, CliReportedExit, FileSystem.FileSystem | Path.Path | HttpClient.HttpClient>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/SyncDataToTs/SyncDataToTs.command.ts#L446)

Since v0.0.0