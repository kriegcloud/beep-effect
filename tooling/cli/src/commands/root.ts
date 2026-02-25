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
import { docsCommand } from "./docs.js";
import { purgeCommand } from "./purge.js";
import { topoSortCommand } from "./topo-sort.js";
import { tsconfigSyncCommand } from "./tsconfig-sync.js";
import { versionSyncCommand } from "./version-sync/index.js";

/**
 * Top-level CLI command that registers all subcommands.
 *
 * This is the command tree root consumed by `Command.run` in the bin entry point.
 *
 * @since 0.0.0
 * @category commands
 * @internal
 */
export const rootCommand = Command.make("beep-cli").pipe(
  Command.withDescription("CLI tool for managing beep-effect monorepo packages"),
  Command.withSubcommands([
    topoSortCommand,
    docsCommand,
    createPackageCommand,
    codegenCommand,
    purgeCommand,
    tsconfigSyncCommand,
    versionSyncCommand,
  ])
);
