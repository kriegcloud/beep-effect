---
title: index.ts
nav_order: 87
parent: "@beep/repo-cli"
---

## index.ts overview

Agent-effectiveness evidence command group.

**Example**

```ts
import { agentEffectivenessCommand } from "@beep/repo-cli"

console.log(agentEffectivenessCommand)
```

Since v0.0.0

---
## Exports Grouped by Category
- [cli-commands](#cli-commands)
  - [agentEffectivenessCommand](#agenteffectivenesscommand)
  - [ciCommand](#cicommand)
  - [codegenCommand](#codegencommand)
  - [codexCommand](#codexcommand)
  - [createPackageCommand](#createpackagecommand)
  - [docgenCommand](#docgencommand)
  - [docsCommand](#docscommand)
  - [fallowCommand](#fallowcommand)
  - [filesCommand](#filescommand)
  - [graphitiCommand](#graphiticommand)
  - [imageCommand](#imagecommand)
  - [lawsCommand](#lawscommand)
  - [lintCommand](#lintcommand)
  - [purgeCommand](#purgecommand)
  - [qualityCommand](#qualitycommand)
  - [reuseCommand](#reusecommand)
  - [rootCommand](#rootcommand)
  - [syncDataToTsCommand](#syncdatatotscommand)
  - [topoSortCommand](#toposortcommand)
  - [tsconfigSyncCommand](#tsconfigsynccommand)
  - [versionSyncCommand](#versionsynccommand)
  - [yeetCommand](#yeetcommand)
---

# cli-commands

## agentEffectivenessCommand

Agent-effectiveness evidence command group.

**Example**

```ts
import { agentEffectivenessCommand } from "@beep/repo-cli"

console.log(agentEffectivenessCommand)
```

**Signature**

```ts
declare const agentEffectivenessCommand: Command<"agent-effectiveness", {} | {}, {}, AgentEffectivenessError | CliReportedExit, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/index.ts#L40)

Since v0.0.0

## ciCommand

CI helper command group.

**Example**

```ts
import { ciCommand } from "@beep/repo-cli"

console.log(ciCommand)
```

**Signature**

```ts
declare const ciCommand: Command<"ci", {} | {}, {}, CliReportedExit, FileSystem | Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/index.ts#L67)

Since v0.0.0

## codegenCommand

Code generation command for workspace barrels and exports.

**Signature**

```ts
declare const codegenCommand: Command<"codegen", { readonly packageDir: string; readonly dryRun: boolean; }, {}, PlatformError, FileSystem | Path | FsUtils>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/index.ts#L82)

Since v0.0.0

## codexCommand

Codex helper command group.

**Example**

```ts
import { codexCommand } from "@beep/repo-cli"

console.log(codexCommand)
```

**Signature**

```ts
declare const codexCommand: Command<"codex", {} | {}, {}, CodexCommandError, FileSystem | ChildProcessSpawner>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/index.ts#L109)

Since v0.0.0

## createPackageCommand

Package scaffolding command for creating new workspace packages.

**Signature**

```ts
declare const createPackageCommand: Command<"create-package", { readonly name: string; readonly type: string; readonly appKind: string; readonly parentDir: string; readonly family: string; readonly kind: string; readonly dirName: string; readonly description: string; readonly dryRun: boolean; readonly skipLockfile: boolean; }, {}, SchemaError | TsMorphProjectLoadError | TsMorphScopeResolutionError | TsMorphSourceFileError | TsMorphSymbolNotFoundError | TsMorphUnsupportedFileError | TsMorphServiceUnavailableError | TsconfigSyncError, FileSystem | Path | ChildProcessSpawner | FsUtils | TSMorphService>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/index.ts#L124)

Since v0.0.0

## docgenCommand

Human-first docgen command group.

**Signature**

```ts
declare const docgenCommand: Command<"docgen", {} | {}, {}, PlatformError | CliReportedExit | DocgenGenerationResult, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/index.ts#L139)

Since v0.0.0

## docsCommand

Command-first docs discovery command tree.

**Signature**

```ts
declare const docsCommand: Command<"docs", {} | {}, {}, CliReportedExit, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/index.ts#L154)

Since v0.0.0

## fallowCommand

Fallow quality-tooling command group.

**Signature**

```ts
declare const fallowCommand: Command<"fallow", {} | {}, {}, PlatformError | CliReportedExit | DomainError | NoSuchFileError, FileSystem | Path | FsUtils>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/index.ts#L169)

Since v0.0.0

## filesCommand

Dataset file curation command group.

**Signature**

```ts
declare const filesCommand: Command<"files", {} | {}, {}, FilesCommandError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/index.ts#L184)

Since v0.0.0

## graphitiCommand

Graphiti operational command group.

**Signature**

```ts
declare const graphitiCommand: Command<"graphiti", {} | {}, {}, ConfigError | GraphitiProxyConfigLoadError | GraphitiProxyOpsError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/index.ts#L199)

Since v0.0.0

## imageCommand

Image and video curation command group.

**Signature**

```ts
declare const imageCommand: Command<"image", {} | {}, {}, FFmpegError | ImageCommandError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/index.ts#L214)

Since v0.0.0

## lawsCommand

Effect laws command group.

**Signature**

```ts
declare const lawsCommand: Command<"laws", {}, {}, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/index.ts#L229)

Since v0.0.0

## lintCommand

Lint policy command group.

**Signature**

```ts
declare const lintCommand: Command<"lint", {} | {}, {}, SchemaError | PlatformError | CliReportedExit | DomainError | NoSuchFileError | Issue | LintCircularAnalysisError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/index.ts#L244)

Since v0.0.0

## purgeCommand

Purge command for removing root/workspace build artifacts.

**Signature**

```ts
declare const purgeCommand: Command<"purge", { readonly lock: boolean; }, {}, DomainError | NoSuchFileError, FileSystem | Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/index.ts#L259)

Since v0.0.0

## qualityCommand

Repository operational quality command group.

**Example**

```ts
import { qualityCommand } from "@beep/repo-cli"

console.log(qualityCommand)
```

**Signature**

```ts
declare const qualityCommand: Command<"quality", {} | {}, {}, GithubCheckError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/index.ts#L286)

Since v0.0.0

## reuseCommand

Reuse-discovery command group.

**Signature**

```ts
declare const reuseCommand: Command<"reuse", {} | {}, {}, ReuseProgramError | CodexRunnerError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/index.ts#L301)

Since v0.0.0

## rootCommand

Root CLI command that composes subcommands.

**Signature**

```ts
declare const rootCommand: Command<"beep-cli", {}, {}, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/index.ts#L316)

Since v0.0.0

## syncDataToTsCommand

Official data sync command for checked-in generated TypeScript modules.

**Signature**

```ts
declare const syncDataToTsCommand: Command<"sync-data-to-ts", { readonly target: Option<string>; readonly all: boolean; readonly check: boolean; readonly dryRun: boolean; readonly verbose: boolean; }, {}, CliReportedExit, FileSystem | Path | HttpClient>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/index.ts#L331)

Since v0.0.0

## topoSortCommand

Dependency topological sort command.

**Signature**

```ts
declare const topoSortCommand: Command<"topo-sort", {}, {}, DomainError | NoSuchFileError | CyclicDependencyError, FileSystem | FsUtils>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/index.ts#L346)

Since v0.0.0

## tsconfigSyncCommand

Tsconfig sync command for workspace tsconfig references and root aliases.

**Signature**

```ts
declare const tsconfigSyncCommand: Command<"tsconfig-sync", { readonly check: boolean; readonly dryRun: boolean; readonly filter: Option<string>; readonly verbose: boolean; }, {}, CliReportedExit | DomainError | NoSuchFileError | CyclicDependencyError, FileSystem | Path | ChildProcessSpawner | FsUtils>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/index.ts#L361)

Since v0.0.0

## versionSyncCommand

Version sync command for detecting and fixing version drift.

**Signature**

```ts
declare const versionSyncCommand: Command<"version-sync", { readonly write: boolean; readonly dryRun: boolean; readonly skipNetwork: boolean; readonly bunOnly: boolean; readonly nodeOnly: boolean; readonly dockerOnly: boolean; readonly biomeOnly: boolean; readonly effectOnly: boolean; }, {}, CliReportedExit, FileSystem | Path | HttpClient>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/index.ts#L376)

Since v0.0.0

## yeetCommand

Yeet quality feedback and publish command.

**Signature**

```ts
declare const yeetCommand: Command<"yeet", {} | { readonly allowStaleBase: boolean; readonly amend: boolean; readonly fast: boolean; readonly message: string; readonly monitor: boolean; readonly noEdit: boolean; readonly pr: boolean; readonly pushOnly: boolean; readonly reuseVerified: boolean; readonly stagedOnly: boolean; readonly startPrEarly: boolean; readonly base: string; readonly head: string; readonly json: boolean; readonly packetDir: string; readonly plan: boolean; readonly tier: "full" | "review-fix"; }, {}, YeetCommandError, FileSystem | Path | ChildProcessSpawner>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/index.ts#L391)

Since v0.0.0