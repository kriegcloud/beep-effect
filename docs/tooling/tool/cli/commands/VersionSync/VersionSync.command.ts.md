---
title: VersionSync.command.ts
nav_order: 82
parent: "@beep/repo-cli"
---

## VersionSync.command.ts overview

Version synchronization CLI command.

Since v0.0.0

---
## Exports Grouped by Category
- [use-cases](#use-cases)
  - [versionSyncCommand](#versionsynccommand)
---

# use-cases

## versionSyncCommand

CLI command for synchronizing version pins across the monorepo.

**Example**

```ts
import { versionSyncCommand } from "@beep/repo-cli/commands/VersionSync"
console.log(versionSyncCommand)
```

**Signature**

```ts
declare const versionSyncCommand: Command.Command<"version-sync", { readonly write: boolean; readonly dryRun: boolean; readonly skipNetwork: boolean; readonly bunOnly: boolean; readonly nodeOnly: boolean; readonly dockerOnly: boolean; readonly biomeOnly: boolean; readonly effectOnly: boolean; }, {}, CliReportedExit, FileSystem | Path | HttpClient>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/VersionSync/VersionSync.command.ts#L54)

Since v0.0.0