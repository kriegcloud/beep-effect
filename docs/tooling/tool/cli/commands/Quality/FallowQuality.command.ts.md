---
title: FallowQuality.command.ts
nav_order: 65
parent: "@beep/repo-cli"
---

## FallowQuality.command.ts overview

Advisory Fallow quality command wrappers.

Since v0.0.0

---
## Exports Grouped by Category
- [cli-commands](#cli-commands)
  - [qualityFallowCommand](#qualityfallowcommand)
- [testing](#testing)
  - [fallowCiUploadDiagnosticsForTesting](#fallowciuploaddiagnosticsfortesting)
---

# cli-commands

## qualityFallowCommand

Fallow command group under the canonical repo quality surface.

**Example**

```ts
import { qualityFallowCommand } from "@beep/repo-cli/commands/Quality"

console.log(qualityFallowCommand)
```

**Signature**

```ts
declare const qualityFallowCommand: Command.Command<"fallow", {} | {}, {}, QualityScriptCommandError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Quality/FallowQuality.command.ts#L2335)

Since v0.0.0

# testing

## fallowCiUploadDiagnosticsForTesting

Return Fallow CI upload diagnostics for contract tests.

**Example**

```ts
import { fallowCiUploadDiagnosticsForTesting } from "@beep/repo-cli/commands/Quality/FallowQuality.command"

const diagnostics = fallowCiUploadDiagnosticsForTesting(false, [], [], ".beep/fallow", "error")
console.log(diagnostics)
```

**Signature**

```ts
declare const fallowCiUploadDiagnosticsForTesting: (requireUpload: boolean, jobUsesValues: ReadonlyArray<string>, uploadArtifactSteps: ReadonlyArray<unknown>, expectOutDir: string, ifNoFilesFound: string) => ReadonlyArray<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Quality/FallowQuality.command.ts#L2112)

Since v0.0.0