---
title: TsconfigSync.command.ts
nav_order: 79
parent: "@beep/repo-cli"
---

## TsconfigSync.command.ts overview

tsconfig-sync command - synchronize workspace tsconfig references and root aliases.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [PlannedFileChange](#plannedfilechange)
  - [PlannedFileChange (type alias)](#plannedfilechange-type-alias)
  - [TsconfigSyncChange](#tsconfigsyncchange)
  - [TsconfigSyncChange (type alias)](#tsconfigsyncchange-type-alias)
  - [TsconfigSyncMode](#tsconfigsyncmode)
  - [TsconfigSyncResult](#tsconfigsyncresult)
  - [TsconfigSyncResult (type alias)](#tsconfigsyncresult-type-alias)
  - [TsconfigSyncRunOptions](#tsconfigsyncrunoptions)
  - [TsconfigSyncRunOptions (type alias)](#tsconfigsyncrunoptions-type-alias)
  - [TsconfigSyncSection](#tsconfigsyncsection)
  - [TsconfigSyncSection (type alias)](#tsconfigsyncsection-type-alias)
  - [TsconfigWithPaths (class)](#tsconfigwithpaths-class)
  - [TsconfigWithReferences (class)](#tsconfigwithreferences-class)
  - [WorkspaceDescriptor (class)](#workspacedescriptor-class)
  - [buildCanonicalAliasTargets](#buildcanonicalaliastargets)
  - [resolveRootExportTarget](#resolverootexporttarget)
- [use-cases](#use-cases)
  - [tsconfigSyncCommand](#tsconfigsynccommand)
- [utilities](#utilities)
  - [syncTsconfigAtRoot](#synctsconfigatroot)
---

# models

## PlannedFileChange

A planned file change with transformed file content.

**Example**

```ts
import { PlannedFileChange } from "@beep/repo-cli/commands/TsconfigSync"
console.log(PlannedFileChange)
```

**Signature**

```ts
declare const PlannedFileChange: S.toTaggedUnion<"section", readonly [typeof RootReferencesPlannedFileChange, typeof RootQualityReferencesPlannedFileChange, typeof RootAliasesPlannedFileChange, typeof RootTstychePlannedFileChange, typeof RootSyncpackPlannedFileChange, typeof PackageReferencesPlannedFileChange, typeof PackageDocgenPlannedFileChange]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/TsconfigSync/TsconfigSync.command.ts#L521)

Since v0.0.0

## PlannedFileChange (type alias)

A planned file change with transformed file content.

**Signature**

```ts
type PlannedFileChange = typeof PlannedFileChange.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/TsconfigSync/TsconfigSync.command.ts#L544)

Since v0.0.0

## TsconfigSyncChange

A single planned file change.

**Example**

```ts
import { TsconfigSyncChange } from "@beep/repo-cli/commands/TsconfigSync"
console.log(TsconfigSyncChange)
```

**Signature**

```ts
declare const TsconfigSyncChange: S.toTaggedUnion<"section", readonly [typeof RootReferencesChange, typeof RootQualityReferencesChange, typeof RootAliasesChange, typeof RootTstycheChange, typeof RootSyncpackChange, typeof PackageReferencesChange, typeof PackageDocgenChange]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/TsconfigSync/TsconfigSync.command.ts#L392)

Since v0.0.0

## TsconfigSyncChange (type alias)

A single planned file change.

**Signature**

```ts
type TsconfigSyncChange = typeof TsconfigSyncChange.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/TsconfigSync/TsconfigSync.command.ts#L415)

Since v0.0.0

## TsconfigSyncMode

Command execution mode.

**Example**

```ts
import { TsconfigSyncMode } from "@beep/repo-cli/commands/TsconfigSync"
console.log(TsconfigSyncMode)
```

**Signature**

```ts
declare const TsconfigSyncMode: AnnotatedSchema<LiteralKit<readonly ["sync", "check", "dry-run"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/TsconfigSync/TsconfigSync.command.ts#L191)

Since v0.0.0

## TsconfigSyncResult

Result emitted after a sync run.

**Example**

```ts
import { TsconfigSyncResult } from "@beep/repo-cli/commands/TsconfigSync"
console.log(TsconfigSyncResult)
```

**Signature**

```ts
declare const TsconfigSyncResult: S.toTaggedUnion<"mode", readonly [typeof TsconfigSyncResultSync, typeof TsconfigSyncResultCheck, typeof TsconfigSyncResultDryRun]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/TsconfigSync/TsconfigSync.command.ts#L591)

Since v0.0.0

## TsconfigSyncResult (type alias)

Result emitted after a sync run.

**Signature**

```ts
type TsconfigSyncResult = typeof TsconfigSyncResult.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/TsconfigSync/TsconfigSync.command.ts#L606)

Since v0.0.0

## TsconfigSyncRunOptions

Runtime options for executing tsconfig sync at a repo root.

**Example**

```ts
import { TsconfigSyncRunOptions } from "@beep/repo-cli/commands/TsconfigSync"
console.log(TsconfigSyncRunOptions)
```

**Signature**

```ts
declare const TsconfigSyncRunOptions: S.toTaggedUnion<"mode", readonly [typeof TsconfigSyncRunOptionsSync, typeof TsconfigSyncRunOptionsCheck, typeof TsconfigSyncRunOptionsDryRun]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/TsconfigSync/TsconfigSync.command.ts#L250)

Since v0.0.0

## TsconfigSyncRunOptions (type alias)

Runtime options for executing tsconfig sync at a repo root.

**Signature**

```ts
type TsconfigSyncRunOptions = typeof TsconfigSyncRunOptions.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/TsconfigSync/TsconfigSync.command.ts#L268)

Since v0.0.0

## TsconfigSyncSection

Sync change section categories.

**Example**

```ts
import { TsconfigSyncSection } from "@beep/repo-cli/commands/TsconfigSync"
console.log(TsconfigSyncSection)
```

**Signature**

```ts
declare const TsconfigSyncSection: AnnotatedSchema<LiteralKit<readonly ["root-references", "root-quality-references", "root-aliases", "root-tstyche", "root-syncpack", "package-references", "package-docgen"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/TsconfigSync/TsconfigSync.command.ts#L281)

Since v0.0.0

## TsconfigSyncSection (type alias)

Sync change section categories.

**Signature**

```ts
type TsconfigSyncSection = typeof TsconfigSyncSection.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/TsconfigSync/TsconfigSync.command.ts#L301)

Since v0.0.0

## TsconfigWithPaths (class)

Minimal tsconfig shape containing optional `compilerOptions.paths`.

**Example**

```ts
import { TsconfigWithPaths } from "@beep/repo-cli/commands/TsconfigSync"
console.log(TsconfigWithPaths)
```

**Signature**

```ts
declare class TsconfigWithPaths
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/TsconfigSync/TsconfigSync.command.ts#L704)

Since v0.0.0

## TsconfigWithReferences (class)

Minimal tsconfig shape containing optional `references`.

**Example**

```ts
import { TsconfigWithReferences } from "@beep/repo-cli/commands/TsconfigSync"
console.log(TsconfigWithReferences)
```

**Signature**

```ts
declare class TsconfigWithReferences
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/TsconfigSync/TsconfigSync.command.ts#L684)

Since v0.0.0

## WorkspaceDescriptor (class)

Workspace package descriptor with metadata for tsconfig synchronization.

**Example**

```ts
import { WorkspaceDescriptor } from "@beep/repo-cli/commands/TsconfigSync"
console.log(WorkspaceDescriptor)
```

**Signature**

```ts
declare class WorkspaceDescriptor
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/TsconfigSync/TsconfigSync.command.ts#L627)

Since v0.0.0

## buildCanonicalAliasTargets

Build canonical tsconfig alias targets from a package root export.

**Signature**

```ts
declare const buildCanonicalAliasTargets: { (packagePath: string, rootExportTarget: string): CanonicalAliasTargets; (rootExportTarget: string): (packagePath: string) => CanonicalAliasTargets; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/TsconfigSync/TsconfigSync.command.ts#L57)

Since v0.0.0

## resolveRootExportTarget

Resolve the canonical root export target from a package `exports` field.

**Signature**

```ts
declare const resolveRootExportTarget: (exportsField: unknown) => O.Option<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/TsconfigSync/TsconfigSync.command.ts#L64)

Since v0.0.0

# use-cases

## tsconfigSyncCommand

CLI command for synchronizing root and workspace tsconfig state.

**Example**

```ts
import { tsconfigSyncCommand } from "@beep/repo-cli/commands/TsconfigSync"
console.log(tsconfigSyncCommand)
```

**Signature**

```ts
declare const tsconfigSyncCommand: Command.Command<"tsconfig-sync", { readonly check: boolean; readonly dryRun: boolean; readonly filter: O.Option<string>; readonly verbose: boolean; }, {}, CliReportedExit | DomainError | NoSuchFileError | CyclicDependencyError, FileSystem.FileSystem | Path.Path | ChildProcessSpawner | FsUtils>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/TsconfigSync/TsconfigSync.command.ts#L1846)

Since v0.0.0

# utilities

## syncTsconfigAtRoot

Synchronize tsconfig references and root aliases under a specific repository root.

**Example**

```ts
import { syncTsconfigAtRoot } from "@beep/repo-cli/commands/TsconfigSync"
console.log(syncTsconfigAtRoot)
```

**Signature**

```ts
declare const syncTsconfigAtRoot: { (rootDir: string, options: TsconfigSyncRunOptions): Effect.Effect<TsconfigSyncResult, TsconfigSyncError, FileSystem.FileSystem | Path.Path | FsUtils | ChildProcessSpawner>; (options: TsconfigSyncRunOptions): (rootDir: string) => Effect.Effect<TsconfigSyncResult, TsconfigSyncError, FileSystem.FileSystem | Path.Path | FsUtils | ChildProcessSpawner>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/TsconfigSync/TsconfigSync.command.ts#L1706)

Since v0.0.0