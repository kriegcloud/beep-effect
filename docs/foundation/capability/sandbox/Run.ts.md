---
title: Run.ts
nav_order: 16
parent: "@beep/sandbox"
---

## Run.ts overview

Programmatic sandbox run API.

Since v0.0.0

---
## Exports Grouped by Category
- [combinators](#combinators)
  - [run](#run)
- [models](#models)
  - [FileDisplayStartupOptions (class)](#filedisplaystartupoptions-class)
  - [FileLoggingOption (class)](#fileloggingoption-class)
  - [LogFilenameOptions (class)](#logfilenameoptions-class)
  - [LoggingOption (type alias)](#loggingoption-type-alias)
  - [LoggingOptionKind (type alias)](#loggingoptionkind-type-alias)
  - [RunResult (class)](#runresult-class)
  - [RunSummaryRowOptions (class)](#runsummaryrowoptions-class)
  - [StdoutLoggingOption (class)](#stdoutloggingoption-class)
  - [Timeouts (class)](#timeouts-class)
- [schemas](#schemas)
  - [LoggingOption](#loggingoption)
  - [LoggingOptionKind](#loggingoptionkind)
- [services](#services)
  - [RunOptions (interface)](#runoptions-interface)
- [utilities](#utilities)
  - [DEFAULT_MAX_ITERATIONS](#default_max_iterations)
  - [buildCompletionMessage](#buildcompletionmessage)
  - [buildContextWindowLines](#buildcontextwindowlines)
  - [buildLogFilename](#buildlogfilename)
  - [buildRunSummaryRows](#buildrunsummaryrows)
  - [formatContextWindowSize](#formatcontextwindowsize)
  - [sanitizeBranchForFilename](#sanitizebranchforfilename)
---

# combinators

## run

Run an agent in a sandbox provider.

**Example**

```ts
import { run } from "@beep/sandbox/Run"

console.log(run)
```

**Signature**

```ts
declare const run: <R>(options: RunOptions<R>) => Effect.Effect<RunResult, SandboxError, R | SandboxProcess | FileSystem.FileSystem | Path.Path | Display | AgentStreamEmitter>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Run.ts#L874)

Since v0.0.0

# models

## FileDisplayStartupOptions (class)

Startup options for file display mode.

**Example**

```ts
import { FileDisplayStartupOptions } from "@beep/sandbox/Run"

console.log(FileDisplayStartupOptions)
```

**Signature**

```ts
declare class FileDisplayStartupOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Run.ts#L292)

Since v0.0.0

## FileLoggingOption (class)

File logging options.

**Example**

```ts
import { FileLoggingOption } from "@beep/sandbox/Run"

console.log(FileLoggingOption)
```

**Signature**

```ts
declare class FileLoggingOption
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Run.ts#L194)

Since v0.0.0

## LogFilenameOptions (class)

Options for building a sandbox run log filename.

**Example**

```ts
import { LogFilenameOptions } from "@beep/sandbox/Run"

console.log(LogFilenameOptions)
```

**Signature**

```ts
declare class LogFilenameOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Run.ts#L317)

Since v0.0.0

## LoggingOption (type alias)

Runtime type for `LoggingOption`.

**Signature**

```ts
type LoggingOption = typeof LoggingOption.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Run.ts#L251)

Since v0.0.0

## LoggingOptionKind (type alias)

Runtime type for `LoggingOptionKind`.

**Signature**

```ts
type LoggingOptionKind = typeof LoggingOptionKind.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Run.ts#L110)

Since v0.0.0

## RunResult (class)

Result returned by `run`.

**Example**

```ts
import { RunResult } from "@beep/sandbox/Run"

console.log(RunResult)
```

**Signature**

```ts
declare class RunResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Run.ts#L340)

Since v0.0.0

## RunSummaryRowOptions (class)

Options for building run summary rows.

**Example**

```ts
import { RunSummaryRowOptions } from "@beep/sandbox/Run"

console.log(RunSummaryRowOptions)
```

**Signature**

```ts
declare class RunSummaryRowOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Run.ts#L266)

Since v0.0.0

## StdoutLoggingOption (class)

Terminal logging options.

**Example**

```ts
import { StdoutLoggingOption } from "@beep/sandbox/Run"

console.log(StdoutLoggingOption)
```

**Signature**

```ts
declare class StdoutLoggingOption
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Run.ts#L218)

Since v0.0.0

## Timeouts (class)

Override default timeouts for built-in lifecycle steps.

**Example**

```ts
import { Timeouts } from "@beep/sandbox/Run"

console.log(Timeouts)
```

**Signature**

```ts
declare class Timeouts
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Run.ts#L125)

Since v0.0.0

# schemas

## LoggingOption

Logging mode for a sandbox run.

**Example**

```ts
import { LoggingOption } from "@beep/sandbox/Run"

console.log(LoggingOption)
```

**Signature**

```ts
declare const LoggingOption: AnnotatedSchema<S.Union<readonly [typeof FileLoggingOption, typeof StdoutLoggingOption]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Run.ts#L239)

Since v0.0.0

## LoggingOptionKind

Logging option discriminator.

**Example**

```ts
import { LoggingOptionKind } from "@beep/sandbox/Run"

console.log(LoggingOptionKind)
```

**Signature**

```ts
declare const LoggingOptionKind: AnnotatedSchema<LiteralKit<readonly ["File", "Stdout"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Run.ts#L98)

Since v0.0.0

# services

## RunOptions (interface)

Programmatic run options.

**Example**

```ts
import type { RunOptions } from "@beep/sandbox/Run"

const value = {} as RunOptions
console.log(value)
```

**Signature**

```ts
export interface RunOptions<R = never> {
  readonly agent: AgentProvider;
  readonly branchStrategy?: BranchStrategy;
  readonly completionSignal?: string | ReadonlyArray<string>;
  readonly copyToWorktree?: ReadonlyArray<string>;
  readonly cwd?: string;
  readonly hooks?: SandboxHooks;
  readonly logging?: LoggingOption;
  readonly maxIterations?: number;
  readonly mounts?: ReadonlyArray<MountEntry>;
  readonly name?: string;
  readonly prompt?: string;
  readonly promptArgs?: PromptArgs;
  readonly promptFile?: string;
  readonly sandbox: SandboxProvider<R>;
  readonly timeouts?: Timeouts;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Run.ts#L374)

Since v0.0.0

# utilities

## DEFAULT_MAX_ITERATIONS

Default maximum number of iterations.

**Example**

```ts
import { DEFAULT_MAX_ITERATIONS } from "@beep/sandbox/Run"

console.log(DEFAULT_MAX_ITERATIONS)
```

**Signature**

```ts
declare const DEFAULT_MAX_ITERATIONS: 1
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Run.ts#L83)

Since v0.0.0

## buildCompletionMessage

Build the final run status message.

**Example**

```ts
import { buildCompletionMessage } from "@beep/sandbox/Run"

console.log(buildCompletionMessage)
```

**Signature**

```ts
declare const buildCompletionMessage: { (completionSignal: string | undefined, iterationsRun: number): { readonly message: string; readonly severity: Severity; }; (iterationsRun: number): (completionSignal: string | undefined) => { readonly message: string; readonly severity: Severity; }; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Run.ts#L470)

Since v0.0.0

## buildContextWindowLines

Build context-window summary lines.

**Example**

```ts
import { buildContextWindowLines } from "@beep/sandbox/Run"

console.log(buildContextWindowLines)
```

**Signature**

```ts
declare const buildContextWindowLines: (iterations: ReadonlyArray<Pick<IterationResult, "usage">>) => ReadonlyArray<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Run.ts#L529)

Since v0.0.0

## buildLogFilename

Build a log filename for a branch/run pair.

**Example**

```ts
import { buildLogFilename } from "@beep/sandbox/Run"

console.log(buildLogFilename)
```

**Signature**

```ts
declare const buildLogFilename: { (resolvedBranch: string): string; (resolvedBranch: string, options: LogFilenameOptions): string; (options: LogFilenameOptions): (resolvedBranch: string) => string; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Run.ts#L420)

Since v0.0.0

## buildRunSummaryRows

Build summary rows for display output.

**Example**

```ts
import { buildRunSummaryRows } from "@beep/sandbox/Run"

console.log(buildRunSummaryRows)
```

**Signature**

```ts
declare const buildRunSummaryRows: (options: RunSummaryRowOptions) => Record<string, string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Run.ts#L450)

Since v0.0.0

## formatContextWindowSize

Format an iteration context-window size.

**Example**

```ts
import { formatContextWindowSize } from "@beep/sandbox/Run"

console.log(formatContextWindowSize)
```

**Signature**

```ts
declare const formatContextWindowSize: (usage: { readonly cacheCreationInputTokens: number; readonly cacheReadInputTokens: number; readonly inputTokens: number; }) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Run.ts#L506)

Since v0.0.0

## sanitizeBranchForFilename

Replace path-hostile branch characters with dashes.

**Example**

```ts
import { sanitizeBranchForFilename } from "@beep/sandbox/Run"

console.log(sanitizeBranchForFilename)
```

**Signature**

```ts
declare const sanitizeBranchForFilename: (branch: string) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/sandbox/src/Run.ts#L405)

Since v0.0.0