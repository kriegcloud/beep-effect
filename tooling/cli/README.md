# @beep/repo-cli

Effect-based CLI toolkit for beep-effect monorepo maintenance and development workflows.

## Purpose

A command-line interface built on `@effect/cli` and `@effect/platform-bun` that provides automated maintenance tasks for the beep-effect monorepo. Commands include environment setup, workspace synchronization, dependency management, and documentation generation. All commands are implemented using Effect patterns with proper error handling and structured logging.

## Key Commands

| Command              | Description                                                                    |
|---------------------|--------------------------------------------------------------------------------|
| `beep env`          | Interactively create or update your `.env` file from `.env.example`          |
| `beep sync`         | Copy `.env` to workspaces and regenerate type definitions                    |
| `beep prune-unused-deps` | Find and remove unused `@beep/*` workspace dependencies              |

## Architecture Fit

- **Effect Platform Integration**: Built on `@effect/platform-bun` runtime layers for file system, path, and terminal access
- **Monorepo-Aware**: Commands understand workspace boundaries and dependency graphs via `@beep/tooling-utils`
- **Safe by Default**: Dry-run modes, interactive prompts, and validation prevent destructive operations
- **Structured Output**: Uses picocolors for terminal output with clear success/error indicators

## Command Structure

```
src/
├── index.ts                          # Main CLI entrypoint with subcommand registration
└── commands/
    ├── env.ts                        # Interactive .env file management
    ├── sync.ts                       # Environment and type synchronization
    ├── prune-unused-deps.ts          # Workspace dependency pruning
    ├── module-composer.ts            # Module composition utilities
    ├── audit-internal-packages.ts    # Package audit tooling
    └── docgen.ts                     # Documentation generation
```

## Usage

### Interactive Environment Setup

Create or update your root `.env` file by answering prompts:

```bash
bun run beep env
```

This command:
- Reads `.env.example` for required variables
- Prompts for missing OAuth credentials (Google, Microsoft)
- Shows defaults from example file
- Validates required fields
- Writes complete `.env` file to repository root

### Sync Environment Variables

Distribute `.env` to workspaces and regenerate types:

```bash
bun run beep sync
```

This command:
- Copies `.env` to `apps/mail/.dev.vars`, `apps/mail/.env`, `apps/server/.dev.vars`
- Runs `bun run types` in `apps/mail` and `apps/server`
- Ensures generated types match current environment configuration

### Prune Unused Dependencies

Detect and remove unused workspace dependencies:

```bash
# Dry-run mode (default, safe)
bun run beep prune-unused-deps --dry-run

# Remove unused dependencies
bun run beep prune-unused-deps --dry-run=false

# Filter to specific workspace
bun run beep prune-unused-deps --filter @beep/iam-infra

# Exclude test directories from scanning
bun run beep prune-unused-deps --exclude-tests
```

The prune command:
- Scans TypeScript/TSX files for `@beep/*` imports
- Compares actual imports against declared dependencies
- Identifies unused entries in `dependencies`, `devDependencies`, and `peerDependencies`
- Updates `package.json` and `tsconfig.json` project references
- Reports summary with file paths and counts

**Import Detection Patterns**:
- `import { X } from "@beep/pkg"`
- `import type { X } from "@beep/pkg"`
- `export { X } from "@beep/pkg"`
- `import "@beep/pkg"` (side-effect)
- `import("@beep/pkg")` (dynamic)
- `require("@beep/pkg")`

**Files Scanned**:
- `src/**/*.{ts,tsx}` (always)
- `test/**/*.{ts,tsx}` (unless `--exclude-tests`)
- Root-level config files (`*.config.{ts,mts,cts,js,mjs}`)

## Implementation Patterns

### Effect-First Command Handlers

All commands use `Effect.gen` with proper context dependencies:

```typescript
import * as Effect from "effect/Effect";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as Console from "effect/Console";
import * as F from "effect/Function";
import * as A from "effect/Array";
import * as Str from "effect/String";

const handleMyCommand = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  // Command logic using Effect utilities
  const files = yield* fs.readDirectory("/some/path");

  yield* Console.log("Operation complete");
});
```

### CLI Command Registration

Commands are registered with `@effect/cli` patterns:

```typescript
import * as CliCommand from "@effect/cli/Command";
import * as CliOptions from "@effect/cli/Options";

const myOption = CliOptions.boolean("dry-run").pipe(
  CliOptions.withAlias("d"),
  CliOptions.withDescription("Report without modifying files"),
  CliOptions.withDefault(true)
);

export const myCommand = CliCommand.make(
  "my-command",
  { dryRun: myOption },
  (args) => handleMyCommand(args)
).pipe(
  CliCommand.withDescription("Description of my command")
);
```

### Runtime Layer Composition

The CLI provides all necessary platform layers:

```typescript
import { FsUtils } from "@beep/tooling-utils";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as BunTerminal from "@effect/platform-bun/BunTerminal";
import * as Layer from "effect/Layer";

const runtimeLayers = Layer.mergeAll(
  BunContext.layer,
  BunTerminal.layer,
  FsUtils.FsUtilsLive
);

export const runRepoCli = (argv: ReadonlyArray<string>) =>
  runBeepCli(argv).pipe(
    Effect.provide(runtimeLayers),
    BunRuntime.runMain
  );
```

### JSON Comments Support

The prune command supports reading `tsconfig.json` files with comments:

```typescript
const stripJsonComments = (content: string): string => {
  // Pure function using imperative parsing
  // (intentional exception for low-level string parsing)
  let result = "";
  let inString = false;
  let inLineComment = false;
  let inBlockComment = false;
  // ... parsing logic
  return result;
};

const readJsonc = (path: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const content = yield* fs.readFileString(path);
    const stripped = stripJsonComments(content);
    return JSON.parse(stripped) as Record<string, unknown>;
  });
```

## Scripts Reference

From `package.json`:

| Script                | Purpose                                                |
|-----------------------|--------------------------------------------------------|
| `build`              | Compile TypeScript to JavaScript                      |
| `check`              | Type check without emitting                           |
| `lint`               | Run Biome linter                                      |
| `lint:fix`           | Auto-fix linting issues                               |
| `test`               | Run test suite                                        |
| `coverage`           | Generate test coverage report                         |
| `execute`            | Run execute.ts script                                 |
| `gen:secrets`        | Generate environment secrets                          |
| `bootstrap`          | Bootstrap repository setup                            |
| `generate-public-paths` | Generate asset path constants                      |
| `gen:locales`        | Generate locale files                                 |
| `iconify`            | Process iconify assets                                |
| `purge`              | Clean build artifacts                                 |
| `docs:lint`          | Lint documentation files                              |
| `docs:lint:file`     | Lint specific documentation file                      |

## Dependencies

| Package                     | Purpose                                          |
|-----------------------------|--------------------------------------------------|
| `@effect/cli`              | Command-line interface framework                 |
| `@effect/platform`         | Effect platform abstractions                     |
| `@effect/platform-bun`     | Bun-specific platform implementations            |
| `@beep/tooling-utils`      | Shared utilities for tooling tasks               |
| `@beep/schema`             | Schema validation and transformations            |
| `@beep/constants`          | Shared constants and enums                       |
| `picocolors`               | Terminal color output                            |
| `ts-morph`                 | TypeScript AST manipulation                      |
| `glob`                     | File pattern matching                            |
| `@jsquash/*`               | Image format conversion utilities                |

## Effect Patterns and Guardrails

### Never Use Native Methods

```typescript
// ❌ FORBIDDEN
items.map((item) => item.name);
str.split(" ");
Object.keys(obj);

// ✅ REQUIRED
F.pipe(items, A.map((item) => item.name));
F.pipe(str, Str.split(" "));
F.pipe(obj, Record.keys);
```

### Import Conventions

```typescript
// Namespace imports for Effect modules
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Console from "effect/Console";

// Single-letter aliases for utilities
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
```

### Uppercase Schema Constructors

Always use PascalCase: `S.Struct`, `S.Array`, `S.String` (never `S.struct`, `S.array`).

### Error Handling

Use tagged errors with `Schema.TaggedError`:

```typescript
import * as S from "effect/Schema";

class CommandError extends S.TaggedError<CommandError>()(
  "CommandError",
  {
    message: S.String,
    cause: S.optional(S.Unknown)
  }
) {}

const handleCommand = Effect.gen(function* () {
  const result = yield* someOperation;
  if (!result) {
    return yield* Effect.fail(new CommandError({
      message: "Operation failed"
    }));
  }
  return result;
});
```

## What Belongs Here

- **Monorepo maintenance commands** that operate on workspace structure
- **Development workflow automation** for environment setup and synchronization
- **Code analysis tools** for dependency management and documentation
- **Repository scaffolding** for bootstrapping and configuration
- **Asset generation** for constants, locales, and public paths

## What Must NOT Go Here

- **Application-specific logic** - keep business rules in domain packages
- **Slice-specific commands** - put those in the owning slice's tooling
- **Production runtime code** - this is development tooling only
- **Database migrations** - use `@beep/_internal/db-admin` instead
- **Testing frameworks** - use `@beep/testkit` for test utilities

## Development

```bash
# Type check
bun run --filter @beep/repo-cli check

# Lint
bun run --filter @beep/repo-cli lint

# Lint and auto-fix
bun run --filter @beep/repo-cli lint:fix

# Build
bun run --filter @beep/repo-cli build

# Run tests
bun run --filter @beep/repo-cli test

# Test with coverage
bun run --filter @beep/repo-cli coverage

# Check for circular dependencies
bun run --filter @beep/repo-cli lint:circular
```

## Adding New Commands

When adding a new command to the CLI:

1. **Create command file** in `src/commands/` following existing patterns
2. **Define handler** using `Effect.gen` with proper dependencies
3. **Register command** in `src/index.ts` subcommands array
4. **Add CLI options** using `@effect/cli/Options` builders
5. **Implement validation** for inputs using Effect schemas
6. **Provide helpful output** with picocolors for success/error/info states
7. **Document usage** in this README with examples
8. **Add tests** covering command behavior and edge cases

Example command template:

```typescript
import * as CliCommand from "@effect/cli/Command";
import * as CliOptions from "@effect/cli/Options";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import color from "picocolors";

const myOption = CliOptions.text("input").pipe(
  CliOptions.withDescription("Input parameter")
);

const handleMyCommand = ({ input }: { input: string }) =>
  Effect.gen(function* () {
    yield* Console.log(color.cyan(`Processing: ${input}`));

    // Command logic here

    yield* Console.log(color.green("Command completed successfully"));
  });

export const myCommand = CliCommand.make(
  "my-command",
  { input: myOption },
  (args) => handleMyCommand(args)
).pipe(
  CliCommand.withDescription("Brief description of command purpose")
);
```

## Guidelines for Contributors

- **Effect-first**: Use Effect utilities for all operations, avoid native methods
- **Namespace imports**: Import Effect modules with full namespace (`import * as Effect`)
- **Proper context**: Request dependencies via `yield*` from Effect context
- **Structured logging**: Use `Console.log` with picocolors for terminal output
- **Validation**: Parse and validate all external input with Effect schemas
- **Error recovery**: Handle failures gracefully with informative messages
- **Dry-run support**: Provide safe preview modes for destructive operations
- **Documentation**: Update README and add inline JSDoc for complex logic

## Relationship to Other Packages

- `@beep/tooling-utils` - Provides FsUtils, RepoUtils, workspace schemas used by commands
- `@beep/_internal/db-admin` - Database migration tooling (separate concern)
- `@beep/testkit` - Effect testing utilities (imported in tests)
- `tooling/repo-scripts` - Legacy scripts being migrated to this CLI
- Root workspace - Target of environment and configuration commands

## Versioning and Changes

- Internal tooling package - breaking changes are acceptable with PR coordination
- Document new commands and options in README
- Update `AGENTS.md` when patterns or guardrails change
- Coordinate with workspace maintainers when modifying cross-cutting commands
