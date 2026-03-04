/**
 * Root CLI command definition.
 *
 * @since 0.0.0
 * @internal
 * @module
 */

import { Command } from "effect/unstable/cli";
import { codegenCommand } from "./Codegen.js";
import { createPackageCommand } from "./CreatePackage/index.js";
import { docsCommand } from "./Docs.js";
import { purgeCommand } from "./Purge.js";
import { topoSortCommand } from "./TopoSort.js";
import { tsconfigSyncCommand } from "./TsconfigSync.js";
import { versionSyncCommand } from "./VersionSync/index.js";

/**
 * Top-level CLI command that registers all subcommands.
 *
 * This is the command tree root consumed by `Command.run` in the bin entry point.
 *
 * @since 0.0.0
 * @category UseCase
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
