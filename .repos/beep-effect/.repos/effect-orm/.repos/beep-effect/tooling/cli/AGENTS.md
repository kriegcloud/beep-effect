# @beep/repo-cli Agent Guide

## Purpose & Fit
- Provides a unified `@effect/cli`-based command-line interface for repository automation tasks
- Consolidates documentation generation, environment configuration, dependency management, and workspace synchronization
- All commands are Effect-based and run with BunRuntime
- Serves as the single entry point for developer tooling workflows

## Surface Map
- **`src/index.ts`** — Main CLI entry point exposing `runRepoCli`
- **`src/commands/docgen.ts`** — Documentation generation and analysis command
  - `docgen analyze` — Analyzes packages and generates documentation
  - Integrates with `@effect/ai-anthropic` for intelligent documentation analysis
- **`src/commands/env.ts`** — Interactive environment variable configuration
  - Guides developers through setting up required environment variables
  - Validates configurations and updates `.env` files
- **`src/commands/prune-unused-deps.ts`** — Dependency cleanup automation
  - Scans workspace packages for unused dependencies
  - Provides dry-run and interactive removal options
- **`src/commands/sync.ts`** — Cross-workspace synchronization
  - Syncs `.env` files across workspace boundaries
  - Ensures configuration consistency

## Usage Snapshots
- Root `package.json` exposes CLI via `bun run beep <command>`
- `bun run beep docgen analyze -p packages/common/schema` — Generate docs for schema package
- `bun run beep env` — Interactive environment setup
- `bun run beep prune-unused-deps --dry-run` — Check for unused dependencies without removing
- `bun run beep sync` — Synchronize workspace configurations

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

## Dependencies

- `@beep/tooling-utils` — Filesystem and repository utilities
- `@beep/schema` — Schema validation
- `@beep/constants` — Shared constants
- `@beep/invariant` — Assertion contracts
- `@effect/cli` — Command-line interface framework
- `@effect/ai-anthropic` — AI integration for documentation analysis
- `ts-morph` — TypeScript AST manipulation for code analysis

## Verifications
- `bun run lint --filter @beep/repo-cli`
- `bun run check --filter @beep/repo-cli`
- `bun run test --filter @beep/repo-cli`
- Test CLI commands: `bun run beep --help`

## Contributor Checklist
- [ ] All commands use Effect-based control flow (no async/await)
- [ ] Namespace imports maintained (`import * as Effect from "effect/Effect"`)
- [ ] New commands registered in `src/index.ts` subcommands array
- [ ] Interactive prompts use `@effect/cli` Options/Args
- [ ] Error handling uses tagged errors with meaningful context
- [ ] Documentation updated in this guide when adding commands
- [ ] Ran `bun run lint` and `bun run check` before committing
