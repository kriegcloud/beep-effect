/**
 * Root CLI command definition.
 *
 * @internal
 * @packageDocumentation
 * @since 0.0.0
 */

import { Command } from "effect/unstable/cli";
import { agentEffectivenessCommand } from "./AgentEffectiveness/index.js";
import { aiMetricsCommand } from "./AIMetrics/index.js";
import { architectureCommand } from "./Architecture/index.js";
import { ciCommand } from "./Ci/index.js";
import { codegenCommand } from "./Codegen/index.js";
import { codexCommand } from "./Codex/index.js";
import { createPackageCommand } from "./CreatePackage/index.js";
import { docgenCommand } from "./Docgen/index.js";
import { docsCommand } from "./Docs/index.js";
import { filesCommand } from "./Files/index.js";
import { graphitiCommand } from "./Graphiti/index.js";
import { imageCommand } from "./Image/index.js";
import { lawsCommand } from "./Laws/index.js";
import { lintCommand } from "./Lint/index.js";
import { purgeCommand } from "./Purge/index.js";
import { qualityCommand } from "./Quality/index.js";
import { reuseCommand } from "./Reuse/index.js";
import { syncDataToTsCommand } from "./SyncDataToTs/index.js";
import { topoSortCommand } from "./TopoSort/index.js";
import { tsconfigSyncCommand } from "./TsconfigSync/index.js";
import { versionSyncCommand } from "./VersionSync/index.js";

/**
 * Top-level CLI command that registers all subcommands.
 *
 * This is the command tree root consumed by `Command.run` in the bin entry point.
 *
 * @internal
 * @example
 * ```ts
 * console.log("rootCommand")
 * ```
 * @category utilities
 * @since 0.0.0
 */
export const rootCommand = Command.make("beep-cli").pipe(
  Command.withDescription("CLI tool for managing beep-effect monorepo packages"),
  Command.withSubcommands([
    topoSortCommand,
    agentEffectivenessCommand,
    aiMetricsCommand,
    architectureCommand,
    ciCommand,
    codexCommand,
    docgenCommand,
    docsCommand,
    filesCommand,
    imageCommand,
    lintCommand,
    lawsCommand,
    qualityCommand,
    graphitiCommand,
    createPackageCommand,
    codegenCommand,
    purgeCommand,
    reuseCommand,
    syncDataToTsCommand,
    tsconfigSyncCommand,
    versionSyncCommand,
  ])
) as Command.Command<"beep-cli", {}, {}, never, never>;
