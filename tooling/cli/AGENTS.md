# @beep/repo-cli Agent Guide

## Purpose & Fit
- Provides a unified `@effect/cli`-based command-line interface for repository automation tasks
- Consolidates documentation generation, environment configuration, dependency management, workspace synchronization, slice scaffolding, and topological sorting
- All commands are Effect-based and run with BunRuntime
- Serves as the single entry point for developer tooling workflows

## Surface Map
- **`src/index.ts`** — Main CLI entry point exposing `runRepoCli`
- **`src/commands/agents-validate.ts`** — Agent manifest validation command
  - Validates `.claude/agents-manifest.yaml` sync with agent definitions in `.claude/agents/`
  - Designed for pre-commit hooks to ensure agent documentation stays current
  - Detects missing agents, manifest mismatches, and configuration drift
- **`src/commands/docgen.ts`** — Documentation generation and analysis command group
  - `docgen init` — Bootstrap docgen configuration for packages
  - `docgen analyze` — Analyze JSDoc coverage and generate reports
  - `docgen generate` — Run @effect/docgen for packages
  - `docgen aggregate` — Aggregate docs to central docs/ folder
  - `docgen status` — Show docgen configuration status across packages
  - `docgen agents` — AI-powered documentation generation and analysis
  - Integrates with `@effect/ai-anthropic` for intelligent documentation analysis
- **`src/commands/env.ts`** — Interactive environment variable configuration
  - Guides developers through setting up required environment variables
  - Validates configurations and updates `.env` files
- **`src/commands/prune-unused-deps.ts`** — Dependency cleanup automation
  - Scans workspace packages for unused `@beep/*` dependencies
  - Provides dry-run mode, package filtering, and test directory exclusion
- **`src/commands/sync.ts`** — Cross-workspace synchronization
  - Syncs root `.env` to workspace packages (apps/mail, apps/server)
  - Regenerates TypeScript type definitions for environment variables
- **`src/commands/bootstrap-spec/`** — Specification scaffolding
  - Creates standardized spec structures in `specs/` directory
  - Supports three complexity levels: simple, medium, complex
  - Generates README, REFLECTION_LOG, and additional files based on complexity
  - Supports dry-run mode for previewing changes
- **`src/commands/create-slice/`** — Vertical slice scaffolding
  - Creates all 5 sub-packages (domain, tables, server, client, ui)
  - Updates workspace configuration and path aliases automatically
  - Supports dry-run mode for previewing changes
- **`src/commands/topo-sort.ts`** — Topological dependency sorting
  - Outputs workspace packages in dependency order (fewest dependencies first)
  - Uses Kahn's algorithm to detect cycles
  - Useful for sequential processing pipelines
- **`src/commands/tsconfig-sync/`** — TypeScript configuration synchronization
  - Syncs tsconfig `references` arrays to match `package.json` dependencies
  - Generates `paths` aliases and `references` for Next.js apps (including transitive deps)
  - Sorts package.json dependencies: workspace (topological) + external (alphabetical)
  - Supports `--check` mode for CI validation, `--dry-run` for previews
  - Detects and reports circular dependencies

## Usage Snapshots
- Root `package.json` exposes CLI via `bun run repo-cli <command>`
- `bun run repo-cli agents-validate` — Validate agents-manifest.yaml sync with .claude/agents/
- `bun run repo-cli docgen init -p packages/common/schema` — Initialize docgen configuration
- `bun run repo-cli docgen analyze -p packages/common/schema` — Analyze JSDoc coverage
- `bun run repo-cli docgen generate --parallel 8` — Generate docs with 8 parallel workers
- `bun run repo-cli docgen aggregate --clean` — Aggregate docs and clean target directory
- `bun run repo-cli env` — Interactive environment setup
- `bun run repo-cli prune-unused-deps --dry-run` — Check for unused dependencies without removing
- `bun run repo-cli prune-unused-deps --filter @beep/iam-server` — Prune deps from specific package
- `bun run repo-cli sync` — Synchronize workspace configurations
- `bun run repo-cli bootstrap-spec -n my-feature -d "Feature description"` — Create new spec (medium complexity)
- `bun run repo-cli bootstrap-spec -n api-redesign -d "API improvements" -c complex` — Create complex spec
- `bun run repo-cli bootstrap-spec -n quick-fix -d "Bug fix" -c simple --dry-run` — Preview simple spec
- `bun run repo-cli create-slice -n notifications -d "User notification system"` — Create new slice
- `bun run repo-cli create-slice --name billing --description "Billing" --dry-run` — Preview slice creation
- `bun run repo-cli topo-sort` — Output packages in topological order
- `bun run repo-cli tsconfig-sync` — Sync all tsconfig files and package.json dependencies
- `bun run repo-cli tsconfig-sync --check` — Validate configs without modifying (CI mode)
- `bun run repo-cli tsconfig-sync --dry-run --verbose` — Preview changes
- `bun run repo-cli tsconfig-sync --filter @beep/schema` — Sync specific package
- `bun run repo-cli tsconfig-sync --packages-only` — Skip Next.js apps
- `bun run repo-cli tsconfig-sync --apps-only` — Only sync Next.js apps

## Authoring Guardrails
- All commands must be Effect-based using `@effect/cli/Command`
- Commands should provide `FsUtilsLive`, `BunContext.layer`, and `BunTerminal.layer`
- Use namespace imports: `import * as Effect from "effect/Effect"`, `import * as CliCommand from "@effect/cli/Command"`
- Avoid native Array/String methods; use `A.*`, `Str.*` from Effect
- Interactive prompts should use `@effect/cli` primitives (Options, Args)
- Error handling via tagged errors (`S.TaggedError`) with proper context
- Document new commands in this guide and update root CLI registration

## Quick Recipes

```typescript
import * as Effect from "effect/Effect";
import * as Command from "@effect/cli/Command";
import * as Console from "effect/Console";
import * as Layer from "effect/Layer";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import { FsUtilsLive } from "@beep/tooling-utils";
import { runRepoCli } from "@beep/repo-cli";

// Run a CLI command programmatically
const runDocgen = Effect.gen(function* () {
  yield* runRepoCli(["bun", "run", "docgen", "analyze", "-p", "packages/common/schema"]);
});
```

```typescript
import * as Effect from "effect/Effect";
import * as CliCommand from "@effect/cli/Command";
import * as Options from "@effect/cli/Options";
import * as Args from "@effect/cli/Args";
import * as Console from "effect/Console";
import { FsUtils } from "@beep/tooling-utils";
import * as F from "effect/Function";
import * as Str from "effect/String";

// Define a new CLI command
const myCommand = CliCommand.make(
  "my-command",
  { packagePath: Options.directory("package") },
  ({ packagePath }) =>
    Effect.gen(function* () {
      const fs = yield* FsUtils;
      yield* Console.log(F.pipe(packagePath, Str.concat(": processing")));
      // Command logic here
    })
);
```

```typescript
import { runRepoCli } from "@beep/repo-cli";

// Execute from script
if (import.meta.main) {
  runRepoCli(process.argv);
}
```

```typescript
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import { createSliceCommand } from "@beep/repo-cli/commands/create-slice";

// Create a new slice programmatically
const createNotificationsSlice = Effect.gen(function* () {
  yield* Console.log("Creating notifications slice...");
  // Command handler logic here
});
```

```typescript
import * as Effect from "effect/Effect";
import * as A from "effect/Array";
import * as F from "effect/Function";
import { topoSortCommand } from "@beep/repo-cli/commands/topo-sort";

// Get topologically sorted packages
const getSortedPackages = Effect.gen(function* () {
  const sortedPackages = yield* Effect.succeed(["@beep/types", "@beep/schema", "@beep/utils"]);
  return F.pipe(
    sortedPackages,
    A.map(pkg => `Processing: ${pkg}`)
  );
});
```

## Dependencies

| Package | Purpose |
|---------|---------|
| `@beep/tooling-utils` | Filesystem utilities, repository discovery, workspace management |
| `@beep/schema` | Schema validation for CLI inputs and outputs |
| `@beep/identity` | Entity ID generation for slice scaffolding |
| `@effect/cli` | Command-line interface framework with Effect integration |
| `@effect/ai-anthropic` | AI integration for intelligent documentation analysis |
| `@effect/platform` | Cross-platform filesystem, process, and path APIs |
| `@effect/platform-bun` | Bun-specific runtime and terminal implementations |
| `ts-morph` | TypeScript AST manipulation for code analysis and generation |
| `handlebars` | Template engine for slice scaffolding |
| `picocolors` | Terminal color formatting |

## Verifications
- `bun run lint --filter @beep/repo-cli`
- `bun run check --filter @beep/repo-cli`
- `bun run test --filter @beep/repo-cli`
- Test CLI commands: `bun run repo-cli --help`

## Contributor Checklist
- [ ] All commands use Effect-based control flow (no async/await)
- [ ] Namespace imports maintained (`import * as Effect from "effect/Effect"`)
- [ ] New commands registered in `src/index.ts` subcommands array
- [ ] Interactive prompts use `@effect/cli` Options/Args
- [ ] Error handling uses tagged errors with meaningful context
- [ ] Documentation updated in this guide when adding commands
- [ ] Ran `bun run lint` and `bun run check` before committing
