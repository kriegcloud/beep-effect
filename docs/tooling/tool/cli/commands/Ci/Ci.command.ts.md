---
title: Ci.command.ts
nav_order: 13
parent: "@beep/repo-cli"
---

## Ci.command.ts overview

CI helper command group.

Since v0.0.0

---
## Exports Grouped by Category
- [cli-commands](#cli-commands)
  - [ciCommand](#cicommand)
- [use-cases](#use-cases)
  - [appendTurboSummary](#appendturbosummary)
---

# cli-commands

## ciCommand

CI helper command group.

**Example**

```ts
console.log("ciCommand")
```

**Signature**

```ts
declare const ciCommand: Command.Command<"ci", {} | {}, {}, CliReportedExit, FileSystem.FileSystem | Path.Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Ci/Ci.command.ts#L309)

Since v0.0.0

# use-cases

## appendTurboSummary

Append the latest Turbo run summary to GitHub step summary or stdout.

**Example**

```ts
import { appendTurboSummary } from "@beep/repo-cli/commands/Ci"
import * as O from "effect/Option"

const program = appendTurboSummary(O.none())
```

**Signature**

```ts
declare const appendTurboSummary: (explicitPath: O.Option<string>) => Effect.Effect<void, CiCommandError, FileSystem.FileSystem | Path.Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Ci/Ci.command.ts#L257)

Since v0.0.0