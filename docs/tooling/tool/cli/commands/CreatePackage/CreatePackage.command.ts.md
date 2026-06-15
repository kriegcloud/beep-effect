---
title: CreatePackage.command.ts
nav_order: 21
parent: "@beep/repo-cli"
---

## CreatePackage.command.ts overview

Package creation command - scaffold new packages following Effect v4 conventions.

Since v0.0.0

---
## Exports Grouped by Category
- [use-cases](#use-cases)
  - [createPackageCommand](#createpackagecommand)
---

# use-cases

## createPackageCommand

Package creation command.

**Example**

```ts
import { createPackageCommand } from "@beep/repo-cli/commands/CreatePackage"

console.log(createPackageCommand)
```

**Signature**

```ts
declare const createPackageCommand: Command<"create-package", { readonly name: string; readonly type: string; readonly appKind: string; readonly parentDir: string; readonly family: string; readonly kind: string; readonly dirName: string; readonly description: string; readonly dryRun: boolean; readonly skipLockfile: boolean; }, {}, SchemaError | TsMorphProjectLoadError | TsMorphScopeResolutionError | TsMorphSourceFileError | TsMorphSymbolNotFoundError | TsMorphUnsupportedFileError | TsMorphServiceUnavailableError | TsconfigSyncError, FileSystem | Path | ChildProcessSpawner | FsUtils | TSMorphService>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/CreatePackage/CreatePackage.command.ts#L22)

Since v0.0.0