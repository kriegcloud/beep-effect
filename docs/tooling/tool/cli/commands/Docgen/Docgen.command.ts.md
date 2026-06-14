---
title: Docgen.command.ts
nav_order: 23
parent: "@beep/repo-cli"
---

## Docgen.command.ts overview

Human-first docgen command group.

Restores the old subtree command surface in current repo style while
keeping generation deterministic and quality review advisory.

Since v0.0.0

---
## Exports Grouped by Category
- [use-cases](#use-cases)
  - [docgenCommand](#docgencommand)
---

# use-cases

## docgenCommand

Human-first docgen command suite.

**Example**

```ts
import { docgenCommand } from "@beep/repo-cli/commands/Docgen"
console.log(docgenCommand)
```

**Signature**

```ts
declare const docgenCommand: Command.Command<"docgen", {} | {}, {}, PlatformError | CliReportedExit | DocgenGenerationResult, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Docgen/Docgen.command.ts#L1151)

Since v0.0.0