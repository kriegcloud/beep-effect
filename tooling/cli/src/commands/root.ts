/**
 * Root CLI command definition.
 *
 * @since 0.0.0
 * @internal
 * @module
 */

import { Command } from "effect/unstable/cli";
import { codegenCommand } from "./codegen.js";
import { createPackageCommand } from "./create-package/index.js";
import { purgeCommand } from "./purge.js";
import { topoSortCommand } from "./topo-sort.js";

/**
 * Top-level CLI command that registers all subcommands (codegen, create-package, purge, topo-sort).
 *
 * This is the command tree root consumed by `Command.run` in the bin entry point.
 *
 * @since 0.0.0
 * @category commands
 * @internal
 */
export const rootCommand = Command.make("beep-cli").pipe(
  Command.withDescription("CLI tool for managing beep-effect monorepo packages"),
  Command.withSubcommands([topoSortCommand, createPackageCommand, codegenCommand, purgeCommand])
);
