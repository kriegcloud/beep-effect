---
title: Files.command.ts
nav_order: 30
parent: "@beep/repo-cli"
---

## Files.command.ts overview

Command definitions for dataset file curation.

Since v0.0.0

---
## Exports Grouped by Category
- [use-cases](#use-cases)
  - [filesCommand](#filescommand)
---

# use-cases

## filesCommand

File curation command group.

**Example**

```ts
import { filesCommand } from "@beep/repo-cli/commands/Files"
console.log(filesCommand)
```

**Signature**

```ts
declare const filesCommand: Command.Command<"files", {} | {}, {}, FilesCommandError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Files/Files.command.ts#L501)

Since v0.0.0