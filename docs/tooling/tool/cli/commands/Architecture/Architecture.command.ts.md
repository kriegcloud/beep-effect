---
title: Architecture.command.ts
nav_order: 8
parent: "@beep/repo-cli"
---

## Architecture.command.ts overview

Architecture command wiring.

Since v0.0.0

---
## Exports Grouped by Category
- [commands](#commands)
  - [architectureCommand](#architecturecommand)
---

# commands

## architectureCommand

Architecture automation command group.

**Example**

```ts
import { architectureCommand } from "@beep/repo-cli/commands/Architecture/index"

console.log(architectureCommand)
```

**Signature**

```ts
declare const architectureCommand: Command.Command<"architecture", {} | {}, {}, S.SchemaError | PlatformError | DomainError | NoSuchFileError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Architecture/Architecture.command.ts#L282)

Since v0.0.0