# CLI Pattern Research: repo-cli Command Architecture

> Verified against source on 2026-02-05. All file:line references confirmed accurate.

---

## 1. Directory Structure

```
tooling/cli/src/
  index.ts                    -- Root "beep" command + subcommands + runtime layers
  commands/
    errors.ts                 -- Shared error classes (legacy, plain string tags)
    topo-sort.ts              -- Single-file command (no options)
    agents-validate.ts        -- Single-file command (with options)
    tsconfig-sync/            -- Multi-file command pattern
      index.ts                -- Options + Command.make + Command.provide(Layer)
      handler.ts              -- Business logic (takes validated Input)
      schemas.ts              -- S.Class input validation
      errors.ts               -- $RepoCliId tagged errors
    create-slice/             -- Multi-file command (complex, with services)
      index.ts                -- Options + validation + Command.provide(Layer)
      handler.ts              -- Business logic with explicit service requirements
      schemas.ts              -- Branded schemas (SliceName) + S.Class
      errors.ts               -- $RepoCliId tagged errors + CauseFields
    verify/                   -- Command group (nested subcommands)
      index.ts                -- Command.make("verify") + withSubcommands
      options.ts              -- Shared options reused by subcommands
      schemas.ts              -- Shared data schemas (Violation, Report)
      errors.ts               -- Shared errors with $RepoCliId
      all/index.ts            -- Subcommand
      entityids/index.ts      -- Subcommand
```

---

## 2. CLI Entry Point (`tooling/cli/src/index.ts`)

### Runtime Layers (line 69)

```typescript
const runtimeLayers = Layer.mergeAll(BunContext.layer, BunTerminal.layer, FsUtilsLive);
```

`FsUtilsLive` already includes `BunFileSystem.layer` and `BunPath.layerPosix` internally.

### Root Command Registration (lines 46-61)

```typescript
const repoCommand = CliCommand.make("beep").pipe(
  CliCommand.withDescription("Beep repository maintenance CLI."),
  CliCommand.withSubcommands([
    agentsUsageReportCommand,
    agentsValidateCommand,
    bootstrapSpecCommand,
    contextFreshnessCommand,
    createSliceCommand,
    docgenCommand,
    envCommand,
    syncCommand,
    topoSortCommand,
    tsconfigSyncCommand,
    verifyCommand,
  ])
);
```

### CLI Runner (lines 63-66)

```typescript
const runBeepCli = CliCommand.run(repoCommand, {
  name: "beep",
  version: "0.1.0",
});
```

### Entry Point (lines 92-97)

```typescript
export const runRepoCli = (argv: ReadonlyArray<string>) =>
  runBeepCli(argv).pipe(Effect.provide(runtimeLayers), BunRuntime.runMain);

if (import.meta.main) {
  runRepoCli(process.argv);
}
```

---

## 3. Pattern Catalog

### Pattern 1: Single-File Command (No Options)

**Reference**: `tooling/cli/src/commands/topo-sort.ts`

Handler is a plain `Effect.gen` expression (not a function):

```typescript
// topo-sort.ts:93-127
const handleTopoSortCommand = Effect.gen(function* () {
  yield* Console.log(color.cyan("Analyzing workspace dependencies..."));
  const adjacencyList = yield* buildAdjacencyList;
  const sorted = yield* F.pipe(
    topologicalSort(adjacencyList),
    Effect.catchTag("CyclicDependencyError", (err) => ...)
  );
  yield* Effect.forEach(sorted, (pkg) => Console.log(pkg), { discard: true });
});
```

Command registration — empty options object, thunk handler:

```typescript
// topo-sort.ts:143-145
export const topoSortCommand = CliCommand.make("topo-sort", {}, () => handleTopoSortCommand).pipe(
  CliCommand.withDescription("Output packages in topological order (least dependencies first).")
);
```

**Key**: `CliCommand.make(name, {}, () => handler)` — second arg is `{}`, third is thunk.

### Pattern 2: Single-File Command (With Options)

**Reference**: `tooling/cli/src/commands/agents-validate.ts`

Options defined at module scope:

```typescript
// agents-validate.ts:351-360
const strictOption = Options.boolean("strict").pipe(
  Options.withAlias("s"),
  Options.withDescription("Fail if agent files changed but manifest was not updated"),
  Options.withDefault(false)
);

const preCommitOption = Options.boolean("pre-commit").pipe(
  Options.withDescription("Run in pre-commit mode (only validate if agent files changed)"),
  Options.withDefault(false)
);
```

Handler takes options object:

```typescript
// agents-validate.ts:279-345
const handleAgentsValidateCommand = (options: { readonly strict: boolean; readonly preCommit: boolean }) =>
  Effect.gen(function* () {
    // ... handler logic
  });
```

Command registration with options:

```typescript
// agents-validate.ts:383-391
export const agentsValidateCommand = CliCommand.make(
  "agents-validate",
  { strict: strictOption, preCommit: preCommitOption },
  (options) => handleAgentsValidateCommand(options)
).pipe(
  CliCommand.withDescription("Validate agents-manifest.yaml ...")
);
```

**Key**: Options object keys become property names in the callback argument. Types are inferred.

### Pattern 3: Multi-File Command

**Reference**: `tooling/cli/src/commands/tsconfig-sync/`

#### index.ts — Options + Command + Layer

Options (lines 50-108):

| Option | Type | Default | Alias | Line |
|--------|------|---------|-------|------|
| `check` | `Options.boolean("check")` | `false` | — | 50 |
| `dryRun` | `Options.boolean("dry-run")` | `false` | — | 59 |
| `filter` | `Options.text("filter")` | `Options.optional` | — | 68 |
| `noHoist` | `Options.boolean("no-hoist")` | `false` | — | 77 |
| `verbose` | `Options.boolean("verbose")` | `false` | `"v"` | 86 |
| `packagesOnly` | `Options.boolean("packages-only")` | `false` | — | 96 |
| `appsOnly` | `Options.boolean("apps-only")` | `false` | — | 105 |

Command-local service layer (line 117):

```typescript
const TsconfigSyncServiceLayer = Layer.mergeAll(RepoUtilsLive, BunFileSystem.layer);
```

Command definition with handler wiring (lines 142-203):

```typescript
export const tsconfigSyncCommand = Command.make(
  "tsconfig-sync",
  { check: checkOption, dryRun: dryRunOption, filter: filterOption, /* ... */ },
  ({ check, dryRun, filter, noHoist, verbose, packagesOnly, appsOnly }) =>
    Effect.gen(function* () {
      const filterValue = O.getOrUndefined(filter);
      const input = new TsconfigSyncInput({
        check, dryRun, filter: filterValue, noHoist, verbose, packagesOnly, appsOnly,
      });
      yield* tsconfigSyncHandler(input).pipe(
        Effect.catchTag("CyclicDependencyError", (err) => ...),
        Effect.catchIf(...),
        Effect.catchAll(...)
      );
    })
).pipe(
  Command.withDescription("Sync tsconfig references based on package.json dependencies"),
  Command.provide(TsconfigSyncServiceLayer)
);
```

**Critical**: `Command.provide(layer)` chains onto the command, providing deps to the handler. `Option<string>` → `string | undefined` via `O.getOrUndefined`.

#### handler.ts — Business Logic

```typescript
// tsconfig-sync/handler.ts:49-199
export const tsconfigSyncHandler = (input: TsconfigSyncInput) =>
  Effect.gen(function* () {
    // ... orchestration logic
  }).pipe(Effect.withSpan("tsconfigSyncHandler"));
```

Handler takes validated input, returns Effect. Uses `Effect.withSpan` for telemetry.

#### schemas.ts — Input Validation

```typescript
// tsconfig-sync/schemas.ts:18-33
export class TsconfigSyncInput extends S.Class<TsconfigSyncInput>("TsconfigSyncInput")({
  check: S.Boolean,
  dryRun: S.Boolean,
  filter: S.optional(S.String),
  noHoist: S.Boolean,
  verbose: S.Boolean,
  packagesOnly: S.Boolean,
  appsOnly: S.Boolean,
}) {}
```

Uses `S.Class` (not `S.Struct`) for constructor support: `new TsconfigSyncInput({...})`.

#### errors.ts — Identity-Based Errors

```typescript
// tsconfig-sync/errors.ts:11-20
import { $RepoCliId } from "@beep/identity/packages";

const $I = $RepoCliId.create("commands/tsconfig-sync");

// tsconfig-sync/errors.ts:28-36
export class DriftDetectedError extends S.TaggedError<DriftDetectedError>()($I`DriftDetectedError`, {
  fileCount: S.Number,
  summary: S.String,
}) {
  get displayMessage(): string {
    return `Configuration drift detected: ${this.fileCount} file(s) need updating. ${this.summary}`;
  }
}

// tsconfig-sync/errors.ts:64
export type TsconfigSyncCommandError = DriftDetectedError | TsconfigSyncError;
```

`$I\`DriftDetectedError\`` → `"@beep/repo-cli/commands/tsconfig-sync/DriftDetectedError"`.

### Pattern 4: Command Group (Nested Subcommands)

**Reference**: `tooling/cli/src/commands/verify/`

```typescript
// verify/index.ts:62
const VerifyServiceLayer = Layer.mergeAll(BunFileSystem.layer, BunPath.layerPosix, RepoUtilsLive, FsUtilsLive);

// verify/index.ts:79-83
export const verifyCommand = Command.make("verify").pipe(
  Command.withDescription("Verify codebase patterns and conventions"),
  Command.withSubcommands([verifyEntityIdsCommand, verifyPatternsCommand, verifyAllCommand]),
  Command.provide(VerifyServiceLayer)
);
```

Parent command with no handler or options — just `withSubcommands` and `provide`.

Shared options in `verify/options.ts`:

| Option | Type | Default | Alias | Line |
|--------|------|---------|-------|------|
| `filter` | `Options.text("filter")` | `Options.optional` | `"f"` | 24 |
| `format` | `Options.choice("format", ["table","json","summary"])` | `"table"` | — | 41 |
| `severity` | `Options.choice("severity", ["critical","warning","all"])` | `"all"` | — | 54 |
| `ci` | `Options.boolean("ci")` | `false` | — | 67 |

---

## 4. Error Pattern

### $RepoCliId Identity Chain

Source: `packages/common/identity/src/packages.ts`

```
Identifier.make("beep").$BeepId          → TaggedComposer<"@beep">
  .compose("repo-cli", ...)              → { $RepoCliId: TaggedComposer<"@beep/repo-cli"> }
$RepoCliId.create("commands/tsconfig-sync") → TaggedComposer<"@beep/repo-cli/commands/tsconfig-sync">
$I`DriftDetectedError`                   → "@beep/repo-cli/commands/tsconfig-sync/DriftDetectedError"
```

### Error Template

```typescript
import { $RepoCliId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $RepoCliId.create("commands/<name>");

const CauseFields = {
  underlyingCause: S.optional(S.Unknown),
  stack: S.optional(S.String),
  operation: S.optional(S.String),
};

export class MyError extends S.TaggedError<MyError>()($I`MyError`, {
  field: S.String,
  ...CauseFields,
}) {
  get displayMessage(): string {
    return `Description: ${this.field}`;
  }
}

export type CommandError = MyError | OtherError;
```

---

## 5. Utility Services

### FsUtils (`tooling/utils/src/FsUtils.ts`)

Service tag (line 416): `Context.GenericTag<FsUtils>("@beep/tooling-utils/FsUtils")`

Live layer (lines 437-440): `FsUtilsLive` includes `BunFileSystem.layer` + `BunPath.layerPosix`.

| Method | Signature | Line | Purpose |
|--------|-----------|------|---------|
| `glob` | `(pattern: string \| string[], options?) => Effect<string[], DomainError>` | 93 | Match files/dirs against glob |
| `globFiles` | `(pattern: string \| string[], options?) => Effect<string[], DomainError>` | 111 | Files only (nodir) |
| `modifyFile` | `(path: string, f: (s: string, path: string) => string) => Effect<void, DomainError>` | 128 | Read-transform-write-if-changed |
| `modifyGlob` | `(pattern: string \| string[], f, options?) => Effect<void, DomainError>` | 151 | Transform all matching files |
| `rmAndCopy` | `(from: string, to: string) => Effect<void, DomainError>` | 174 | Remove target then copy |
| `copyIfExists` | `(from: string, to: string) => Effect<void, DomainError>` | 225 | Copy only if source exists |
| `mkdirCached` | `(path: string) => Effect<void, DomainError>` | 251 | Create dir recursively (cached) |
| `copyGlobCached` | `(baseDir: string, pattern: string, to: string) => Effect<void, DomainError>` | 259 | Copy glob-matched preserving structure |
| `rmAndMkdir` | `(path: string) => Effect<void, DomainError>` | 288 | Remove then re-create dir |
| `readJson` | `(path: string) => Effect<any, DomainError>` | 324 | Read and parse JSON |
| `writeJson` | `(path: string, json: unknown) => Effect<void, DomainError>` | 344 | Write JSON with stable formatting |
| `existsOrThrow` | `(path: string) => Effect<string, DomainError>` | 301 | Assert path exists or fail |
| `isDirectory` | `(path: string) => Effect<boolean, DomainError>` | 185 | Check if path is directory |
| `isFile` | `(path: string) => Effect<boolean, DomainError>` | 193 | Check if path is file |
| `dirHasFile` | `(dir: string, filename: string) => Effect<boolean, DomainError>` | 201 | Check if dir contains file |
| `getParentDirectory` | `(path: string) => Effect<string, DomainError>` | 210 | Get parent directory |

**Relevant for migration**: `glob`, `globFiles` (file discovery), `readJson` (reading package.json), `existsOrThrow` (validating paths).

### RepoUtils (`tooling/utils/src/RepoUtils.ts`)

Service tag (line 90): `Context.GenericTag<RepoUtils>("@beep/tooling-utils/RepoUtils")`

Live layer (lines 111-115): `RepoUtilsLive` depends on `FsUtilsLive`, `BunFileSystem.layer`, `BunPath.layerPosix`.

| Member | Type | Line | Purpose |
|--------|------|------|---------|
| `REPOSITORY_ROOT` | `string` | 23 | Absolute path to monorepo root |
| `RepoWorkspaceMap` | `HashMap<string, string>` | 24 | Package name → directory path |
| `getWorkspaceDir` | `(pkgName: string) => Effect<string, DomainError>` | 25 | Look up workspace directory |

**Relevant for migration**: `REPOSITORY_ROOT` (replaces hardcoded paths), `RepoWorkspaceMap` (package discovery).

---

## 6. Options API Quick Reference

| API | Usage | Result Type |
|-----|-------|-------------|
| `Options.boolean("name")` | Boolean flag | `boolean` (with default) |
| `Options.text("name")` | String argument | `string` (required) |
| `Options.text("name").pipe(Options.optional)` | Optional string | `Option<string>` |
| `Options.choice("name", ["a","b","c"])` | Enum choice | `string` literal union |
| `Options.withAlias("x")` | Short alias `-x` | — |
| `Options.withDefault(value)` | Default value | unwrapped type |
| `Options.withDescription("text")` | Help text | — |

---

## 7. Layer Provision Hierarchy

```
Root (index.ts:69):
  Layer.mergeAll(BunContext.layer, BunTerminal.layer, FsUtilsLive)
  ↓ provides: Console, Terminal, FsUtils, FileSystem, Path

Command-level (via Command.provide):
  tsconfig-sync:  Layer.mergeAll(RepoUtilsLive, BunFileSystem.layer)
  create-slice:   Layer.mergeAll(FileGeneratorLayer, TsMorphLayer, ConfigUpdaterLayer, RepoUtilsLive, BunFileSystem.layer)
  verify:         Layer.mergeAll(BunFileSystem.layer, BunPath.layerPosix, RepoUtilsLive, FsUtilsLive)
```

Commands needing `RepoUtils` or custom services provide them at command level via `Command.provide()`. Root only provides basic runtime layers.

---

## 8. Pattern Selection Guide (for migration)

| Command | Pattern | Rationale |
|---------|---------|-----------|
| `analyze-agents` | Multi-file | Complex analysis, needs schemas/errors, dynamic discovery |
| `analyze-readmes` | Multi-file | Complex analysis, needs schemas/errors, output formatting |
| `find-missing-docs` | Single-file (with options) | Simple existence checks, `--format` option |
| `sync-cursor-rules` | Single-file (no options) | Already Effect-idiomatic, minimal wrapping |

---

## 9. Implementation Checklist (for Phase 3+)

For each new command:

1. Choose pattern (single-file or multi-file)
2. Define options with `Options.*` API
3. Create `$I = $RepoCliId.create("commands/<name>")`
4. Define tagged errors with `CauseFields` spread
5. Define `S.Class` input schema
6. Create handler taking validated input
7. Wire command: `Command.make` → options → handler → `Command.provide(Layer)`
8. Register in `index.ts` `withSubcommands` array
9. Replace hardcoded paths with `RepoUtils.REPOSITORY_ROOT`
10. Replace `node:fs` with `FsUtils` methods (`glob`, `globFiles`, `readJson`)

---

**END OF DOCUMENT**
