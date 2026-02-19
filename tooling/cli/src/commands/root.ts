/**
 * Root CLI command definition.
 *
 * @since 0.0.0
 * @internal
 */

import { Command } from "effect/unstable/cli";
import { topoSortCommand } from "./topo-sort.js";
import { createPackageCommand } from "./create-package.js";
import { codegenCommand } from "./codegen.js";

/**
 * @since 0.0.0
 * @internal
 */
export const rootCommand = Command.make("beep-cli").pipe(
  Command.withDescription("CLI tool for managing beep-effect monorepo packages"),
  Command.withSubcommands([topoSortCommand, createPackageCommand, codegenCommand]),
);
