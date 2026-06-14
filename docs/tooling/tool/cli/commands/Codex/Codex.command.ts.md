---
title: Codex.command.ts
nav_order: 18
parent: "@beep/repo-cli"
---

## Codex.command.ts overview

Codex agent helper commands.

Since v0.0.0

---
## Exports Grouped by Category
- [cli-commands](#cli-commands)
  - [codexCommand](#codexcommand)
- [use-cases](#use-cases)
  - [runCodexQualityReviewFixLoop](#runcodexqualityreviewfixloop)
---

# cli-commands

## codexCommand

Codex helper command group.

**Example**

```ts
console.log("codexCommand")
```

**Signature**

```ts
declare const codexCommand: Command.Command<"codex", {} | {}, {}, CodexCommandError, FileSystem.FileSystem | ChildProcessSpawner.ChildProcessSpawner>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Codex/Codex.command.ts#L92)

Since v0.0.0

# use-cases

## runCodexQualityReviewFixLoop

Launch Codex with the repo-local quality review fix loop prompt.

**Example**

```ts
import { runCodexQualityReviewFixLoop } from "@beep/repo-cli/commands/Codex"
const program = runCodexQualityReviewFixLoop(["close", "current", "initiative"])
```

**Signature**

```ts
declare const runCodexQualityReviewFixLoop: (summaryParts: ReadonlyArray<string>) => Effect.Effect<void, CodexCommandError, FileSystem.FileSystem | ChildProcessSpawner.ChildProcessSpawner>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Codex/Codex.command.ts#L47)

Since v0.0.0