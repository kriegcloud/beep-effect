/**
 * @fileoverview Beep repository maintenance CLI entry point
 *
 * Provides a unified CLI for repository automation tasks including documentation
 * generation, environment configuration, dependency management, and workspace
 * synchronization. All commands are Effect-based and run with BunRuntime.
 *
 * @module @beep/tooling-cli
 * @since 1.0.0
 * @category CLI
 *
 * @example
 * ```typescript
 * import { runRepoCli } from "@beep/tooling-cli"
 *
 * // Generate documentation analysis
 * runRepoCli(["bun", "run", "docgen", "analyze", "-p", "packages/common/schema"])
 *
 * // Configure environment variables interactively
 * runRepoCli(["bun", "run", "env"])
 *
 * // Sync .env across workspaces
 * runRepoCli(["bun", "run", "sync"])
 * ```
 */

import { FsUtilsLive } from "@beep/tooling-utils";
import * as CliCommand from "@effect/cli/Command";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as BunTerminal from "@effect/platform-bun/BunTerminal";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { agentsValidateCommand } from "./commands/agents-validate.js";
import { bootstrapSpecCommand } from "./commands/bootstrap-spec/index.js";
import { createSliceCommand } from "./commands/create-slice/index.js";
import { docgenCommand } from "./commands/docgen.js";
import { envCommand } from "./commands/env.js";
import { syncCommand } from "./commands/sync.js";
import { topoSortCommand } from "./commands/topo-sort.js";
import { tsconfigSyncCommand } from "./commands/tsconfig-sync/index.js";

const repoCommand = CliCommand.make("beep").pipe(
  CliCommand.withDescription("Beep repository maintenance CLI."),
  CliCommand.withSubcommands([
    agentsValidateCommand,
    bootstrapSpecCommand,
    createSliceCommand,
    docgenCommand,
    envCommand,
    syncCommand,
    topoSortCommand,
    tsconfigSyncCommand,
  ])
);

const runBeepCli = CliCommand.run(repoCommand, {
  name: "beep",
  version: "0.1.0",
});

// FsUtilsLive already includes BunFileSystem.layer and BunPath.layerPosix internally
const runtimeLayers = Layer.mergeAll(BunContext.layer, BunTerminal.layer, FsUtilsLive);

/**
 * Runs the repository CLI with the provided command-line arguments.
 *
 * Bootstraps the beep CLI with all necessary runtime layers (BunContext, BunTerminal, FsUtils)
 * and executes the command specified in the argv array. Supports all subcommands: docgen,
 * env, prune-unused-deps, and sync.
 *
 * @example
 * ```ts
 * import { runRepoCli } from "@beep/repo-cli"
 *
 * // Run docgen analyze command
 * runRepoCli(["bun", "run", "docgen", "analyze", "-p", "packages/common/schema"])
 *
 * // Run env command
 * runRepoCli(["bun", "run", "env"])
 * ```
 *
 * @since 0.1.0
 * @category constructors
 */
export const runRepoCli = (argv: ReadonlyArray<string>) =>
  runBeepCli(argv).pipe(Effect.provide(runtimeLayers), BunRuntime.runMain);

if (import.meta.main) {
  runRepoCli(process.argv);
}
