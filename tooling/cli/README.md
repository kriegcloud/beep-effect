# @beep/repo-cli

A CLI tool for the repo.

## Purpose

A command-line interface built on `@effect/cli` and `@effect/platform-bun` that provides automated maintenance tasks for the beep-effect monorepo. The CLI exposes four main commands: environment setup (`env`), workspace synchronization (`sync`), dependency pruning (`prune-deps`), and comprehensive documentation generation (`docgen`). All commands are implemented using Effect patterns with proper error handling, structured logging, and dry-run modes for safe operation.

## Installation

This package is internal to the monorepo and not published to npm. Add it as a dependency in your package.json:

```json
{
  "dependencies": {
    "@beep/repo-cli": "workspace:*"
  }
}
```

Commands are executed via direct execution or root package scripts:

```bash
# From repository root (direct execution)
bun run tooling/cli/src/index.ts <command> [options]

# Via root package.json scripts (recommended)
bun run init:env           # Interactive environment setup
bun run docgen:init        # Initialize docgen configuration
bun run docgen:analyze     # Analyze JSDoc coverage
bun run docgen:generate    # Generate documentation
bun run docgen:aggregate   # Aggregate docs to central location
bun run docgen:status      # Show docgen status
bun run docgen:agents      # AI-powered JSDoc improvements
```

The main entry point is `src/index.ts`, which exports `runRepoCli` for programmatic use and supports direct execution via `import.meta.main`.

## Key Exports

| Export | Description |
|--------|-------------|
| `runRepoCli` | Main CLI runner accepting argv array, provides all runtime layers |
| `envCommand` | Interactive environment configuration command |
| `syncCommand` | Workspace environment synchronization command |
| `pruneUnusedDepsCommand` | Unused dependency detection and removal |
| `docgenCommand` | Documentation generation command group |

**Subcommands** (docgen):
- `initCommand` - Bootstrap docgen.json configuration
- `analyzeCommand` - JSDoc coverage analysis
- `generateCommand` - Run @effect/docgen
- `aggregateCommand` - Collect docs to central location
- `statusCommand` - Show docgen configuration status
- `agentsCommand` - AI-powered JSDoc improvements

## Key Commands

| Command              | Description                                                                    |
|---------------------|--------------------------------------------------------------------------------|
| `env`               | Interactively create or update your `.env` file from `.env.example`          |
| `sync`              | Copy `.env` to workspaces and regenerate type definitions                    |
| `prune-deps` | Find and remove unused `@beep/*` workspace dependencies                      |
| `docgen`            | Documentation generation suite with JSDoc analysis and AI-powered fixes      |

All commands are accessible via `bun run tooling/cli/src/index.ts <command> [options]` or through root package.json scripts.

## Architecture Fit

- **Effect Platform Integration**: Built on `@effect/platform-bun` runtime layers for file system, path, and terminal access
- **Monorepo-Aware**: Commands understand workspace boundaries and dependency graphs via `@beep/tooling-utils`
- **Safe by Default**: Dry-run modes, interactive prompts, and validation prevent destructive operations
- **Structured Output**: Uses picocolors for terminal output with clear success/error indicators
- **AI-Powered**: Leverages `@effect/ai` and `@effect/workflow` for intelligent documentation improvements

## Command Structure

```
src/
├── index.ts                          # Main CLI entrypoint with subcommand registration
└── commands/
    ├── env.ts                        # Interactive .env file management
    ├── sync.ts                       # Environment and type synchronization
    ├── prune-deps.ts          # Workspace dependency pruning
    └── docgen/                       # Documentation generation system
        ├── docgen.ts                 # Docgen command aggregator
        ├── init.ts                   # Bootstrap docgen.json configuration
        ├── analyze.ts                # JSDoc coverage analysis
        ├── generate.ts               # Run @effect/docgen
        ├── aggregate.ts              # Collect docs to central location
        ├── status.ts                 # Show configuration status
        ├── agents/                   # AI-powered JSDoc improvement
        │   ├── index.ts              # Agents command with token tracking
        │   ├── workflow.ts           # Durable workflow orchestration
        │   ├── activities.ts         # Workflow activities
        │   ├── service.ts            # Agent service layer
        │   ├── tools.ts              # AI tool definitions
        │   └── prompts.ts            # Agent prompts and instructions
        └── shared/
            ├── config.ts             # Configuration file operations
            ├── discovery.ts          # Package discovery
            ├── ast.ts                # TypeScript AST analysis
            ├── markdown.ts           # Markdown generation
            └── output.ts             # Terminal output formatting
```

## Usage

### Interactive Environment Setup

Create or update your root `.env` file by answering prompts:

```bash
bun run init:env
# Or directly:
bun run tooling/cli/src/index.ts env
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
bun run tooling/cli/src/index.ts sync
```

This command:
- Copies `.env` to `apps/mail/.dev.vars`, `apps/mail/.env`, `apps/server/.dev.vars`
- Runs `bun run types` in `apps/mail` and `apps/server`
- Ensures generated types match current environment configuration

### Prune Unused Dependencies

Detect and remove unused workspace dependencies:

```bash
# Dry-run mode (default, safe)
bun run tooling/cli/src/index.ts prune-deps --dry-run

# Remove unused dependencies
bun run tooling/cli/src/index.ts prune-deps --dry-run=false

# Filter to specific workspace
bun run tooling/cli/src/index.ts prune-deps --filter @beep/iam-server

# Exclude test directories from scanning
bun run tooling/cli/src/index.ts prune-deps --exclude-tests
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

### Documentation Generation (docgen)

The `docgen` command provides a complete suite for managing TypeScript documentation:

#### Initialize Configuration

Bootstrap a `docgen.json` configuration file for a package:

```bash
# Create docgen.json from existing tsconfig
bun run docgen:init -p packages/common/schema
# Or directly:
bun run tooling/cli/src/index.ts docgen init -p packages/common/schema

# Preview without writing (dry-run)
bun run tooling/cli/src/index.ts docgen init -p packages/common/schema --dry-run

# Overwrite existing configuration
bun run tooling/cli/src/index.ts docgen init -p packages/common/schema --force
```

The init command:
- Discovers existing TypeScript configuration (tsconfig.src.json → tsconfig.build.json → tsconfig.json)
- Extracts compiler options and path mappings for `@beep/*` dependencies
- Generates Effect-compatible docgen.json with correct srcLink and paths
- Validates configuration against `@effect/docgen` schema

#### Analyze JSDoc Coverage

Scan packages for JSDoc documentation quality and completeness:

```bash
# Analyze specific package
bun run docgen:analyze -p packages/common/schema
# Or directly:
bun run tooling/cli/src/index.ts docgen analyze -p packages/common/schema

# Output JSON for programmatic use
bun run tooling/cli/src/index.ts docgen analyze -p packages/common/schema --json

# Analyze all packages with docgen.json
bun run tooling/cli/src/index.ts docgen analyze --all
```

The analyze command:
- Uses ts-morph to parse TypeScript AST
- Checks JSDoc presence on exported functions, classes, interfaces
- Validates JSDoc tags (@param, @returns, @example, @since, @category)
- Generates markdown reports with coverage statistics
- Outputs agent-friendly JSON for AI-powered improvements

**Output includes**:
- Overall JSDoc coverage percentage
- Missing documentation by symbol type
- Tag coverage (params, returns, examples)
- Detailed symbol-by-symbol breakdown

#### Generate Documentation

Run `@effect/docgen` to generate API documentation:

```bash
# Generate docs for specific package
bun run docgen:generate -p packages/common/schema
# Or directly:
bun run tooling/cli/src/index.ts docgen generate -p packages/common/schema

# Generate for all packages (parallel)
bun run tooling/cli/src/index.ts docgen generate --all --parallel 8

# Dry-run to see what would be generated
bun run tooling/cli/src/index.ts docgen generate --all --dry-run
```

The generate command:
- Locates packages with valid docgen.json
- Runs `@effect/docgen` with configured options
- Outputs documentation to package-local `docs/` directory
- Supports parallel execution for multiple packages

#### Aggregate Documentation

Collect generated docs to a central repository location:

```bash
# Aggregate all package docs to docs/api/
bun run docgen:aggregate
# Or directly:
bun run tooling/cli/src/index.ts docgen aggregate

# Clean existing docs before aggregating
bun run tooling/cli/src/index.ts docgen aggregate --clean

# Dry-run to preview structure
bun run tooling/cli/src/index.ts docgen aggregate --dry-run
```

The aggregate command:
- Discovers all packages with generated documentation
- Copies docs to centralized directory (default: `docs/api/`)
- Preserves package structure and navigation
- Optionally cleans destination before copying

#### View Configuration Status

Display docgen configuration status across all packages:

```bash
# Show summary of docgen setup
bun run docgen:status
# Or directly:
bun run tooling/cli/src/index.ts docgen status

# Verbose output with file paths
bun run tooling/cli/src/index.ts docgen status --verbose

# JSON output for automation
bun run tooling/cli/src/index.ts docgen status --json
```

The status command shows:
- Which packages have docgen.json configured
- Configuration validity and errors
- Missing configurations in packages that should have them
- TypeScript config sources (tsconfig.src.json, etc.)

#### AI-Powered JSDoc Improvements

Use AI agents to automatically improve JSDoc documentation:

```bash
# Fix JSDoc for a specific package
bun run docgen:agents --package @beep/schema
# Or directly (requires ANTHROPIC_API_KEY):
ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY bun run tooling/cli/src/index.ts docgen agents --package @beep/schema

# Durable mode with crash recovery (uses @effect/workflow)
bun run tooling/cli/src/index.ts docgen agents --durable --package @beep/schema

# Resume interrupted workflow
bun run tooling/cli/src/index.ts docgen agents --durable --resume docgen-packages-schema

# Dry-run to see proposed changes
bun run tooling/cli/src/index.ts docgen agents --package @beep/schema --dry-run

# Process multiple packages in parallel
bun run tooling/cli/src/index.ts docgen agents --all --parallel 4
```

The agents command:
- Analyzes current JSDoc coverage using AST analysis
- Invokes Anthropic Claude via `@effect/ai-anthropic`
- Applies AI-suggested JSDoc improvements to source files
- Tracks token usage and estimates API costs in real-time
- Supports durable execution with crash recovery via `@effect/workflow`

**Features**:
- **Token Tracking**: Real-time monitoring of input/output/cached tokens
- **Cost Estimation**: Calculates approximate API costs (Claude Sonnet 4/Opus 4)
- **Durable Workflows**: Crash-resilient execution with state persistence
- **Resume Capability**: Continue interrupted workflows by ID
- **Dry-Run Mode**: Preview changes without modifying files
- **Parallel Processing**: Concurrent package processing with configurable limits

**Token Usage Display**:
```
Token Usage:
  Input: 1,234 tokens
  Output: 567 tokens
  Cached: 890 tokens
  Estimated cost: $0.02 USD
```

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
| `lint:circular`      | Check for circular dependencies                       |

**Note**: Additional repository scripts exist in `package.json` but reference implementations in other packages:
- `bootstrap`, `purge` — Execute via `@beep/repo-scripts`
- `execute` — Turbo-orchestrated build task

## Dependencies

| Package                     | Purpose                                          |
|-----------------------------|--------------------------------------------------|
| `@effect/cli`              | Command-line interface framework                 |
| `@effect/platform`         | Effect platform abstractions                     |
| `@effect/platform-bun`     | Bun-specific platform implementations            |
| `@effect/ai`               | AI integration framework                         |
| `@effect/ai-anthropic`     | Anthropic Claude provider for AI                 |
| `@effect/workflow`         | Durable workflow orchestration                   |
| `@effect/cluster`          | Distributed execution support                    |
| `@beep/tooling-utils`      | Shared utilities for tooling tasks               |
| `@beep/schema`             | Schema validation and transformations            |
| `@beep/constants`          | Shared constants and enums                       |
| `@beep/invariant`          | Assertion contracts                              |
| `@beep/utils`              | Pure runtime helpers                             |
| `@beep/identity`           | Package identity utilities                       |
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
- **Code analysis tools** for dependency management and JSDoc documentation
- **AI-powered documentation improvements** using effect/ai and Anthropic Claude
- **Repository scaffolding** for bootstrapping and configuration
- **Asset generation** for constants, locales, and public paths
- **Documentation generation** orchestration and aggregation

## What Must NOT Go Here

- **Application-specific logic** - keep business rules in domain packages
- **Slice-specific commands** - put those in the owning slice's tooling
- **Production runtime code** - this is development tooling only
- **Database migrations** - use `@beep/db-admin` instead
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

## Docgen Workflow Architecture

The documentation generation system follows a multi-stage pipeline:

### Stage 1: Configuration Bootstrap (init)

1. Discovers package location and validates structure
2. Locates TypeScript configuration files (priority: tsconfig.src.json → tsconfig.build.json → tsconfig.json)
3. Extracts compiler options and `@beep/*` path mappings
4. Generates docgen.json with Effect-compatible settings
5. Validates against `@effect/docgen` schema

### Stage 2: Analysis (analyze)

1. Parses TypeScript AST using ts-morph
2. Identifies exported symbols (functions, classes, interfaces, types)
3. Checks JSDoc presence and completeness
4. Validates JSDoc tags (@param, @returns, @example, @since, @category)
5. Generates coverage reports (markdown and JSON formats)

**Output Formats**:
- **Markdown**: Human-readable coverage report with statistics
- **JSON**: Machine-readable analysis for AI consumption

### Stage 3: AI Improvement (agents)

The agents system uses Effect's AI framework with durable workflow support:

#### Standard Mode (Fast)
- Direct invocation of Anthropic Claude API
- Real-time token tracking and cost estimation
- Immediate feedback and file updates
- No crash recovery

#### Durable Mode (Resilient)
- Workflow orchestration via `@effect/workflow`
- State persistence and crash recovery
- Resume capability for interrupted executions
- Activity-based task decomposition

**Agent Workflow**:
1. Load analysis results from Stage 2
2. Invoke Claude with specialized JSDoc prompt
3. Parse AI-suggested improvements
4. Apply changes to source files (respecting dry-run)
5. Track token usage (input, output, cached)
6. Estimate API costs based on Anthropic pricing

**Tools Available to AI**:
- `read_file`: Read source code
- `write_file`: Apply JSDoc improvements
- `analyze_exports`: Get symbol information
- `validate_jsdoc`: Check documentation quality

### Stage 4: Documentation Generation (generate)

1. Locates packages with valid docgen.json
2. Invokes `@effect/docgen` for each package
3. Generates API documentation in markdown format
4. Outputs to package-local `docs/` directory
5. Supports parallel execution for multiple packages

### Stage 5: Aggregation (aggregate)

1. Discovers all packages with generated documentation
2. Creates centralized documentation structure
3. Copies package docs to repository-wide location (docs/api/)
4. Preserves navigation and cross-references
5. Optionally cleans destination before aggregating

### Token Tracking and Cost Estimation

The agents command provides real-time visibility into API usage:

```typescript
// Token statistics interface
interface TokenStats {
  inputTokens: number;      // Tokens sent to API
  outputTokens: number;     // Tokens generated
  cachedTokens: number;     // Prompt caching hits
}

// Cost estimation (December 2025 pricing)
const ANTHROPIC_PRICING = {
  "claude-sonnet-4-20250514": {
    input: 3.0,       // $3 per million tokens
    output: 15.0,     // $15 per million tokens
    cachedInput: 0.3, // $0.30 per million tokens
  },
  "claude-opus-4-20250514": {
    input: 15.0,      // $15 per million tokens
    output: 75.0,     // $75 per million tokens
    cachedInput: 1.5, // $1.50 per million tokens
  },
};
```

**Real-time Display**:
- Incremental token counts as API calls complete
- Running cost estimation
- Cached token savings (90% cost reduction)
- Per-package and aggregate statistics

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

| Package | Relationship |
|---------|-------------|
| `@beep/tooling-utils` | Provides FsUtils, RepoUtils, workspace schemas, and dependency resolution |
| `@beep/db-admin` | Database migration tooling (separate concern, not integrated) |
| `@beep/testkit` | Effect testing utilities (used in test suites) |
| `@beep/schema` | Schema validation, EntityId factories, JSDoc schema definitions |
| `@beep/constants` | Shared constants and enums used across commands |
| `@beep/invariant` | Assertion contracts for validation |
| `@beep/utils` | Pure runtime helpers (noOp, nullOp, Effect array/string utilities) |
| `@beep/identity` | Package identity utilities |
| `tooling/repo-scripts` | Legacy bash/node scripts (being migrated to Effect-based commands) |
| Root workspace | Target of environment and configuration synchronization commands |

**Integration Points**:
- Commands depend on `@beep/tooling-utils` for file system operations and repo structure queries
- The docgen agents system uses `@beep/schema` for JSDoc validation schemas
- Environment commands write to root `.env` and sync to app workspaces
- Prune command reads workspace dependency graphs from `@beep/tooling-utils`

## Notes

### Docgen Configuration

Each package that wants API documentation should have a `docgen.json` file in its root:

```json
{
  "$schema": "../../node_modules/@effect/docgen/schema.json",
  "srcDir": "src",
  "outDir": "docs",
  "srcLink": "https://github.com/kriegcloud/beep-effect/tree/main/packages/path/to/package/src/",
  "exclude": ["src/internal/**/*.ts"],
  "examplesCompilerOptions": {
    "paths": {
      "@beep/package-name": ["./src/index.ts"],
      "@beep/dependency": ["../../path/to/dependency/src/index.js"]
    }
  }
}
```

The `init` command automates this process by reading existing TypeScript configurations.

### AI Agent Prompts

The agents command uses specialized prompts that:
- Emphasize Effect patterns and conventions
- Require examples for all exported functions
- Enforce consistent JSDoc tag usage (@since, @category, @example)
- Follow the repository's documentation standards from AGENTS.md

Prompts are maintained in `src/commands/docgen/agents/prompts.ts` and can be customized for specific documentation needs.

### Durable Workflows

When using `--durable` mode, workflows are orchestrated by `@effect/workflow`:
- State is persisted to disk (default: `.workflow-state/`)
- Workflows can be resumed after crashes or interruptions
- Each workflow is identified by a unique ID (e.g., `docgen-packages-contract`)
- Use `--resume <workflow-id>` to continue interrupted workflows

**Trade-offs**:
- Standard mode: Faster, simpler, but no crash recovery
- Durable mode: Slower startup, but resilient to failures

### Environment Variable Synchronization

The `sync` command copies `.env` to specific workspace locations:
- `apps/mail/.dev.vars` - Cloudflare Workers development
- `apps/mail/.env` - Local mail app configuration
- `apps/server/.dev.vars` - Server runtime configuration

After copying, it runs `bun run types` in each workspace to regenerate TypeScript type definitions for environment variables.

## Known Considerations

### Legacy Scripts in package.json

Some scripts in `package.json` reference source files that have been moved to other packages or are no longer actively maintained:
- `execute`, `gen:secrets`, `bootstrap`, `generate-public-paths`, `gen:locales`, `iconify`, `purge`

These are maintained for backward compatibility but new workflows should use the Effect-based commands in this package (env, sync, docgen, prune-deps).

For legacy script execution:
```bash
# Execute from repository root, not directly through @beep/repo-cli
bun run bootstrap
bun run purge
```

## Versioning and Changes

- Internal tooling package - breaking changes are acceptable with PR coordination
- Document new commands and options in README
- Update JSDOC_ANALYSIS.md when JSDoc analysis patterns change
- Coordinate with workspace maintainers when modifying cross-cutting commands
- AI prompts and tools should evolve with repository conventions
