---
title: Fallow.command.ts
nav_order: 28
parent: "@beep/repo-cli"
---

## Fallow.command.ts overview

Fallow integration helpers for repo quality experiments.

Since v0.0.0

---
## Exports Grouped by Category
- [cli-commands](#cli-commands)
  - [fallowCommand](#fallowcommand)
---

# cli-commands

## fallowCommand

Fallow quality-tooling command group.

**Example**

```ts
import { fallowCommand } from "@beep/repo-cli/commands/Fallow"

console.log(fallowCommand)
```

**Signature**

```ts
declare const fallowCommand: Command.Command<"fallow", {} | {}, {}, PlatformError | CliReportedExit | DomainError | NoSuchFileError, FileSystem.FileSystem | Path.Path | FsUtils>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Fallow/Fallow.command.ts#L219)

Since v0.0.0