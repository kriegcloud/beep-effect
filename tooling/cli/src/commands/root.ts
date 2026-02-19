/**
 * Root CLI command definition.
 *
 * @since 0.0.0
 * @internal
 */

import { Command } from "effect/unstable/cli";
import { codegenCommand } from "./codegen.js";
import { createPackageCommand } from "./create-package/index.js";
import { topoSortCommand } from "./topo-sort.js";

/**
 * @since 0.0.0
 * @internal
 */
export const rootCommand = Command.make("beep-cli").pipe(
  Command.withDescription("CLI tool for managing beep-effect monorepo packages"),
  Command.withSubcommands([topoSortCommand, createPackageCommand, codegenCommand])
);
