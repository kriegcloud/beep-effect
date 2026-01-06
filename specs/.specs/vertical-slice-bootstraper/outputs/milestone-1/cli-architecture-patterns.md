# CLI Architecture Patterns

> Comprehensive guide to CLI command development in the `beep-effect` monorepo using `@effect/cli`.

---

## 1. Overview

The CLI lives in `tooling/cli/` and provides repository automation tasks through a unified Effect-based command interface. All commands:

- Use `@effect/cli` for command/option parsing
- Follow Effect-first patterns (no `async/await`)
- Run via `BunRuntime.runMain`
- Compose dependencies through Layers

### Directory Structure

```
tooling/cli/
├── src/
│   ├── index.ts              # Entry point, command registration
│   └── commands/
│       ├── docgen.ts         # Parent command with subcommands
│       ├── env.ts            # Minimal command example
│       ├── sync.ts           # Basic command with file operations
│       ├── prune-unused-deps.ts
│       ├── topo-sort.ts
│       └── docgen/
│           ├── analyze.ts    # Complex command with options
│           ├── errors.ts     # TaggedError definitions
│           ├── types.ts      # Schema and type definitions
│           ├── generate.ts
│           ├── aggregate.ts
│           ├── init.ts
│           └── status.ts
```

---

## 2. Command Registration Pattern

Commands are registered in `index.ts` via `CliCommand.withSubcommands`:

```typescript
// tooling/cli/src/index.ts
import * as CliCommand from "@effect/cli/Command";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as BunTerminal from "@effect/platform-bun/BunTerminal";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import { FsUtilsLive } from "@beep/tooling-utils";
import { docgenCommand } from "./commands/docgen.js";
import { envCommand } from "./commands/env.js";
import { syncCommand } from "./commands/sync.js";

// Root command with subcommands
const repoCommand = CliCommand.make("beep").pipe(
  CliCommand.withDescription("Beep repository maintenance CLI."),
  CliCommand.withSubcommands([docgenCommand, envCommand, syncCommand])
);

// Runner configuration
const runBeepCli = CliCommand.run(repoCommand, {
  name: "beep",
  version: "0.1.0",
});

// Runtime layers (FsUtilsLive includes BunFileSystem and BunPath)
const runtimeLayers = Layer.mergeAll(
  BunContext.layer,
  BunTerminal.layer,
  FsUtilsLive
);

// Public entry point
export const runRepoCli = (argv: ReadonlyArray<string>) =>
  runBeepCli(argv).pipe(
    Effect.provide(runtimeLayers),
    BunRuntime.runMain
  );

if (import.meta.main) {
  runRepoCli(process.argv);
}
```

### Key Points

1. **Root command** - Created with `CliCommand.make("beep")`
2. **Subcommands** - Attached via `CliCommand.withSubcommands([...])`
3. **Runner** - `CliCommand.run()` returns an Effect that parses argv
4. **Layers** - Provided once at the top level
5. **Entry** - `BunRuntime.runMain` executes the Effect

---

## 3. Options Definition Pattern

Options are defined using `@effect/cli/Options`:

```typescript
// tooling/cli/src/commands/docgen/analyze.ts
import * as CliOptions from "@effect/cli/Options";

// Required text option with alias
const packageOption = CliOptions.optional(CliOptions.text("package")).pipe(
  CliOptions.withAlias("p"),
  CliOptions.withDescription("Target package (path or @beep/* name)")
);

// Optional text option with alias
const outputOption = CliOptions.optional(CliOptions.text("output")).pipe(
  CliOptions.withAlias("o"),
  CliOptions.withDescription("Custom output path for the report")
);

// Boolean flag with default
const jsonOption = CliOptions.boolean("json").pipe(
  CliOptions.withDefault(false),
  CliOptions.withDescription("Also output JSON results")
);

// Boolean flag with default (no short alias)
const fixModeOption = CliOptions.boolean("fix-mode").pipe(
  CliOptions.withDefault(false),
  CliOptions.withDescription("Generate agent-actionable checklist format")
);
```

### Common Option Patterns

| Pattern | Code |
|---------|------|
| Required text | `CliOptions.text("name")` |
| Optional text | `CliOptions.optional(CliOptions.text("name"))` |
| Boolean flag | `CliOptions.boolean("flag").pipe(CliOptions.withDefault(false))` |
| With alias | `.pipe(CliOptions.withAlias("n"))` |
| With description | `.pipe(CliOptions.withDescription("..."))` |
| Number | `CliOptions.integer("count")` |

### Accessing Option Values

```typescript
// Options are passed as object with keys matching option names
export const analyzeCommand = CliCommand.make(
  "analyze",
  {
    package: packageOption,
    output: outputOption,
    json: jsonOption,
    fixMode: fixModeOption,
  },
  (args) =>
    handleAnalyze({
      // Optional options return Option<T>, use O.getOrUndefined
      package: O.getOrUndefined(args.package),
      output: O.getOrUndefined(args.output),
      // Boolean options with defaults are plain boolean
      json: args.json,
      fixMode: args.fixMode,
    })
);
```

---

## 4. Effect-First Implementation Pattern

All command handlers use `Effect.gen` - never `async/await`:

```typescript
// tooling/cli/src/commands/sync.ts
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as ProcessCommand from "@effect/platform/Command";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";

const handleSyncCommand = Effect.gen(function* () {
  // Access services via yield*
  const path = yield* Path.Path;
  const fs = yield* FileSystem.FileSystem;
  const repoRoot = yield* findRepoRoot;

  // File operations
  const envPath = path.join(repoRoot, ".env");
  const envExists = yield* fs.exists(envPath);

  if (!envExists) {
    yield* Console.log(color.red("No .env file exists."));
    return yield* Effect.fail(new Error("Missing .env file."));
  }

  // Iterate with Effect.forEach (not native array methods!)
  yield* Effect.forEach(
    envCopies,
    (destination) => copyEnvFile(fs, path, envPath, repoRoot, destination),
    { discard: true }
  );

  // Run external processes
  yield* Effect.forEach(
    typeTargets,
    (target) => runTypesCommand(path, repoRoot, target.relativeDir),
    { discard: true }
  );

  yield* Console.log(color.green("Sync complete."));
});

// Process execution pattern
const runTypesCommand = (path: Path.Path, repoRoot: string, relativeDir: string) =>
  Effect.gen(function* () {
    const cwd = path.join(repoRoot, relativeDir);
    yield* Console.log(color.cyan(`Running bun run types in ${relativeDir}`));

    const command = F.pipe(
      ProcessCommand.make("bun", "run", "types"),
      ProcessCommand.workingDirectory(cwd),
      ProcessCommand.stdout("inherit"),
      ProcessCommand.stderr("inherit")
    );

    const exitCode = Number(yield* ProcessCommand.exitCode(command));
    if (exitCode !== 0) {
      return yield* Effect.fail(
        new Error(`Types generation failed in ${relativeDir} (exit ${exitCode}).`)
      );
    }
  });
```

### Key Rules

1. **Always `Effect.gen`** - Never use `async/await` in command handlers
2. **Service access** - Use `yield* ServiceTag` to get services
3. **Iteration** - Use `Effect.forEach`, never native `.map()` or `.forEach()`
4. **Console output** - Use `Console.log` from `effect/Console`
5. **File operations** - Use `FileSystem` and `Path` from `@effect/platform`
6. **Process execution** - Use `Command` from `@effect/platform`

---

## 5. Error Handling Pattern

Errors are defined using `S.TaggedError` from Effect Schema:

```typescript
// tooling/cli/src/commands/docgen/errors.ts
import * as S from "effect/Schema";

// Base fields for cause chain support
const CauseFields = {
  underlyingCause: S.optional(S.Unknown),
  stack: S.optional(S.String),
  operation: S.optional(S.String),
};

// Define a tagged error
export class PackageNotFoundError extends S.TaggedError<PackageNotFoundError>()(
  "PackageNotFoundError",
  {
    path: S.String,
    message: S.optional(S.String),
    ...CauseFields,
  }
) {
  get displayMessage(): string {
    return `Package not found: ${this.path}${this.message ? ` (${this.message})` : ""}`;
  }
}

export class TsMorphError extends S.TaggedError<TsMorphError>()(
  "TsMorphError",
  {
    filePath: S.String,
    cause: S.Unknown,
    ...CauseFields,
  }
) {
  get displayMessage(): string {
    return `AST parsing failed for ${this.filePath}: ${String(this.cause)}`;
  }
}

// Union type for error channel
export type DocgenError =
  | PackageNotFoundError
  | DocgenConfigError
  | TsMorphError
  | DocgenProcessError;
```

### Error Handling in Commands

```typescript
// Catching specific tagged errors
const exports = yield* analyzePackage(pkgPath, srcDir, exclude).pipe(
  Effect.tapError((e) =>
    logger.error("Package analysis failed", {
      package: pkgName,
      error: e._tag,
      filePath: e.filePath,
    })
  ),
  Effect.catchTag("TsMorphError", (e) =>
    Effect.gen(function* () {
      yield* errorAccumulator.add(e);
      yield* error(`Failed to analyze ${pkgName}: ${String(e.cause)}`);
      return A.empty() as ReadonlyArray<ExportAnalysis>;
    })
  )
);

// Exit code handling
Effect.catchAll((exitCode) =>
  Effect.gen(function* () {
    if (Num.isNumber(exitCode)) {
      yield* Effect.sync(() => {
        process.exitCode = exitCode;
      });
    }
  })
);
```

---

## 6. Layer Composition Pattern

### Per-Command Layers

```typescript
// Commands can provide their own layers at the command level
export const analyzeCommand = CliCommand.make(
  "analyze",
  { /* options */ },
  (args) =>
    handleAnalyze({
      /* ... */
    }).pipe(Effect.provide(DocgenLoggerLive()))
).pipe(CliCommand.withDescription("Analyze JSDoc coverage"));
```

### Shared Runtime Layers

```typescript
// index.ts - Top-level layers for all commands
const runtimeLayers = Layer.mergeAll(
  BunContext.layer,    // Bun-specific context
  BunTerminal.layer,   // Terminal I/O
  FsUtilsLive          // File system utilities (includes BunFileSystem, BunPath)
);

export const runRepoCli = (argv: ReadonlyArray<string>) =>
  runBeepCli(argv).pipe(
    Effect.provide(runtimeLayers),
    BunRuntime.runMain
  );
```

---

## 7. Command Templates

### Template A: Minimal Command (No Options)

```typescript
/**
 * @fileoverview Simple command with no options
 */
import * as CliCommand from "@effect/cli/Command";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";

const handleCommand = Effect.gen(function* () {
  yield* Console.log("Executing minimal command...");
  // Command logic here
  yield* Console.log("Done.");
});

export const minimalCommand = CliCommand.make("minimal", {}, () => handleCommand).pipe(
  CliCommand.withDescription("A minimal command with no options.")
);
```

### Template B: Intermediate Command (With Options)

```typescript
/**
 * @fileoverview Command with options and file operations
 */
import * as CliCommand from "@effect/cli/Command";
import * as CliOptions from "@effect/cli/Options";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";

const packageOption = CliOptions.optional(CliOptions.text("package")).pipe(
  CliOptions.withAlias("p"),
  CliOptions.withDescription("Target package path")
);

const dryRunOption = CliOptions.boolean("dry-run").pipe(
  CliOptions.withDefault(false),
  CliOptions.withDescription("Preview changes without applying")
);

const handleCommand = (args: {
  readonly package: string | undefined;
  readonly dryRun: boolean;
}) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;

    if (args.dryRun) {
      yield* Console.log("Dry run mode - no changes will be made.");
    }

    const targetPath = args.package ?? ".";
    const exists = yield* fs.exists(targetPath);

    if (!exists) {
      return yield* Effect.fail(new Error(`Path not found: ${targetPath}`));
    }

    yield* Console.log(`Processing: ${targetPath}`);
    // Command logic here
  });

export const intermediateCommand = CliCommand.make(
  "intermediate",
  {
    package: packageOption,
    dryRun: dryRunOption,
  },
  (args) =>
    handleCommand({
      package: O.getOrUndefined(args.package),
      dryRun: args.dryRun,
    })
).pipe(CliCommand.withDescription("An intermediate command with options."));
```

### Template C: Complex Command (With Subcommands and Custom Errors)

```typescript
/**
 * @fileoverview Complex command with subcommands, custom errors, and logging
 */
import * as CliCommand from "@effect/cli/Command";
import * as CliOptions from "@effect/cli/Options";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as S from "effect/Schema";

// --- Errors ---
class ConfigError extends S.TaggedError<ConfigError>()("ConfigError", {
  path: S.String,
  reason: S.String,
}) {
  get displayMessage() {
    return `Config error at ${this.path}: ${this.reason}`;
  }
}

// --- Types ---
const ExitCode = {
  Success: 0,
  InvalidInput: 1,
  ConfigurationError: 2,
} as const;

// --- Logger Service ---
class Logger extends Effect.Service<Logger>()("Logger", {
  accessors: true,
  effect: Effect.succeed({
    info: (msg: string) => Console.log(`[INFO] ${msg}`),
    error: (msg: string) => Console.log(`[ERROR] ${msg}`),
  }),
}) {}

const LoggerLive = Layer.succeed(Logger, {
  info: (msg: string) => Console.log(`[INFO] ${msg}`),
  error: (msg: string) => Console.log(`[ERROR] ${msg}`),
});

// --- Options ---
const targetOption = CliOptions.text("target").pipe(
  CliOptions.withAlias("t"),
  CliOptions.withDescription("Target path (required)")
);

const verboseOption = CliOptions.boolean("verbose").pipe(
  CliOptions.withAlias("v"),
  CliOptions.withDefault(false),
  CliOptions.withDescription("Enable verbose output")
);

// --- Subcommand Handlers ---
const handleInit = (args: { target: string; verbose: boolean }) =>
  Effect.gen(function* () {
    const logger = yield* Logger;
    const fs = yield* FileSystem.FileSystem;

    yield* logger.info(`Initializing at ${args.target}`);

    const exists = yield* fs.exists(args.target);
    if (!exists) {
      yield* logger.error(`Target not found: ${args.target}`);
      return yield* Effect.fail(
        new ConfigError({ path: args.target, reason: "Directory not found" })
      );
    }

    if (args.verbose) {
      yield* logger.info("Verbose mode enabled");
    }

    // Init logic here
    yield* logger.info("Initialization complete");
  }).pipe(Effect.provide(LoggerLive));

const handleStatus = Effect.gen(function* () {
  const logger = yield* Logger;
  yield* logger.info("Checking status...");
  // Status logic here
}).pipe(Effect.provide(LoggerLive));

// --- Subcommands ---
const initCommand = CliCommand.make(
  "init",
  { target: targetOption, verbose: verboseOption },
  (args) => handleInit({ target: args.target, verbose: args.verbose })
).pipe(CliCommand.withDescription("Initialize configuration"));

const statusCommand = CliCommand.make("status", {}, () => handleStatus).pipe(
  CliCommand.withDescription("Show current status")
);

// --- Parent Command ---
export const complexCommand = CliCommand.make("complex").pipe(
  CliCommand.withDescription("Complex command with subcommands"),
  CliCommand.withSubcommands([initCommand, statusCommand])
);
```

---

## 8. Interactive Prompts

For interactive commands, use `@effect/cli/Prompt`:

```typescript
// tooling/cli/src/commands/env.ts
import * as Prompt from "@effect/cli/Prompt";
import * as Bool from "effect/Boolean";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Str from "effect/String";

const runValuePrompt = (
  key: string,
  defaultValue: string,
  options: { readonly required: boolean }
) => {
  const message = `Enter value for ${key}`;

  const baseOptions = {
    message,
    default: defaultValue,
  } as const;

  const prompt = options.required
    ? Prompt.text({
        ...baseOptions,
        validate: (value: string) =>
          F.pipe(
            value,
            Str.trim,
            Str.isNonEmpty,
            Bool.match({
              onTrue: () => Effect.succeed(value),
              onFalse: () => Effect.fail("A value is required."),
            })
          ),
      })
    : Prompt.text(baseOptions);

  return Prompt.run(prompt).pipe(
    Effect.map(Str.trim),
    Effect.map((value) => (Str.isEmpty(value) ? defaultValue : value))
  );
};
```

---

## 9. Best Practices Checklist

- [ ] Use `Effect.gen` for all command handlers
- [ ] Define options with `@effect/cli/Options`
- [ ] Use `S.TaggedError` for custom errors
- [ ] Access services via `yield* ServiceTag`
- [ ] Use Effect utilities (`A.map`, `Str.trim`, etc.) not native methods
- [ ] Provide layers at command or top level appropriately
- [ ] Include JSDoc with `@fileoverview`, `@since`, `@category`, `@example`
- [ ] Use `Console.log` from `effect/Console` for output
- [ ] Handle exit codes via `Effect.catchAll` when needed
- [ ] Use `O.getOrUndefined` for optional option values

---

## 10. Reference Files

| File | Purpose |
|------|---------|
| `tooling/cli/src/index.ts` | Entry point, command registration |
| `tooling/cli/src/commands/env.ts` | Minimal command, interactive prompts |
| `tooling/cli/src/commands/sync.ts` | File operations, process execution |
| `tooling/cli/src/commands/docgen/analyze.ts` | Complex command with many options |
| `tooling/cli/src/commands/docgen/errors.ts` | TaggedError definitions |
| `tooling/cli/src/commands/docgen/types.ts` | Schema and type definitions |
