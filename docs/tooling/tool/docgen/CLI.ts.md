---
title: CLI.ts
nav_order: 3
parent: "@beep/repo-docgen"
---

## CLI.ts overview

Command-line interface wiring for the docgen package.

Since v0.0.0

---
## Exports Grouped by Category
- [cli-commands](#cli-commands)
  - [cli](#cli)
---

# cli-commands

## cli

Runs the docgen command with the package version banner.

**Example**

```ts
import { cli } from "@beep/repo-docgen/CLI"
console.log(cli)
```

**Signature**

```ts
declare const cli: (input: ReadonlyArray<string>) => Effect.Effect<void, CliError | Domain.DocgenError, Domain.Process | FsUtils | Command.Environment>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/docgen/src/CLI.ts#L207)

Since v0.0.0