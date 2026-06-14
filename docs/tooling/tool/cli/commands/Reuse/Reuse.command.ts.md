---
title: Reuse.command.ts
nav_order: 70
parent: "@beep/repo-cli"
---

## Reuse.command.ts overview

Reuse-discovery command suite.

Since v0.0.0

---
## Exports Grouped by Category
- [testing](#testing)
  - [printLookupSummaryForTesting](#printlookupsummaryfortesting)
- [use-cases](#use-cases)
  - [reuseCommand](#reusecommand)
- [utilities](#utilities)
  - [sanitizeTerminalText](#sanitizeterminaltext)
---

# testing

## printLookupSummaryForTesting

Print human-readable lookup output for focused command-renderer tests.

**Signature**

```ts
declare const printLookupSummaryForTesting: (result: RepoCodegraphLookupResult, snippet: boolean) => Effect.Effect<void, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Reuse/Reuse.command.ts#L404)

Since v0.0.0

# use-cases

## reuseCommand

Reuse-discovery command group.

**Example**

```ts
import { reuseCommand } from "@beep/repo-cli/commands/Reuse"
console.log(reuseCommand)
```

**Signature**

```ts
declare const reuseCommand: Command.Command<"reuse", {} | {}, {}, ReuseProgramError | CodexRunnerError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Reuse/Reuse.command.ts#L680)

Since v0.0.0

# utilities

## sanitizeTerminalText

Remove terminal control sequences from human-readable reuse output.

**Example**

```ts
import { sanitizeTerminalText } from "@beep/repo-cli/commands/Reuse"
const text = sanitizeTerminalText("\u001b[31munsafe\u001b[0m")
console.log(text)
```

**Signature**

```ts
declare const sanitizeTerminalText: (input: string) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Reuse/Reuse.command.ts#L161)

Since v0.0.0