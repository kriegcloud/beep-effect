---
title: Yeet.command.ts
nav_order: 85
parent: "@beep/repo-cli"
---

## Yeet.command.ts overview

Yeet quality feedback and commit/push command.

Since v0.0.0

---
## Exports Grouped by Category
- [cli-commands](#cli-commands)
  - [yeetCommand](#yeetcommand)
---

# cli-commands

## yeetCommand

Command that repairs, verifies, or publishes repository work through Yeet.

**Example**

```ts
import { yeetCommand } from "@beep/repo-cli/commands/Yeet"

console.log(yeetCommand)
```

**Signature**

```ts
declare const yeetCommand: Command.Command<"yeet", {} | { readonly allowStaleBase: boolean; readonly amend: boolean; readonly fast: boolean; readonly message: string; readonly monitor: boolean; readonly noEdit: boolean; readonly pr: boolean; readonly pushOnly: boolean; readonly reuseVerified: boolean; readonly stagedOnly: boolean; readonly startPrEarly: boolean; readonly base: string; readonly head: string; readonly json: boolean; readonly packetDir: string; readonly plan: boolean; readonly tier: "full" | "review-fix"; }, {}, YeetCommandError, FileSystem | Path | ChildProcessSpawner>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Yeet/Yeet.command.ts#L336)

Since v0.0.0