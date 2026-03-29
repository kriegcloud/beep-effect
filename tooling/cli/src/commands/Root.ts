/**
 * Root CLI command definition.
 *
 * @module
 * @internal
 * @since 0.0.0
 */

import { Command } from "effect/unstable/cli";
import { agentsCommand } from "./Agents/index.js";
import { claudeCommand } from "./Claude/index.js";
import { codegenCommand } from "./Codegen.js";
import { createPackageCommand } from "./CreatePackage/index.js";
import { docgenCommand } from "./Docgen/index.js";
import { docsCommand } from "./Docs.js";
import { graphitiCommand } from "./Graphiti/index.js";
import { lawsCommand } from "./Laws/index.js";
import { lintCommand } from "./Lint/index.js";
import { purgeCommand } from "./Purge.js";
import { syncDataToTsCommand } from "./SyncDataToTs/index.js";
import { topoSortCommand } from "./TopoSort.js";
import { tsconfigSyncCommand } from "./TsconfigSync.js";
import { versionSyncCommand } from "./VersionSync/index.js";

/**
 * Top-level CLI command that registers all subcommands.
 *
 * This is the command tree root consumed by `Command.run` in the bin entry point.
 *
 * @internal
 * @category UseCase
 * @since 0.0.0
 */
export const rootCommand = Command.make("beep-cli").pipe(
  Command.withDescription("CLI tool for managing beep-effect monorepo packages"),
  Command.withSubcommands([
    topoSortCommand,
    docgenCommand,
    docsCommand,
    agentsCommand,
    lintCommand,
    lawsCommand,
    graphitiCommand,
    claudeCommand,
    createPackageCommand,
    codegenCommand,
    purgeCommand,
    syncDataToTsCommand,
    tsconfigSyncCommand,
    versionSyncCommand,
  ])
);
