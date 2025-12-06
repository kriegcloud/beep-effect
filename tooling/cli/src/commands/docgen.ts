/**
 * @file Docgen CLI Main Command
 *
 * Aggregates all docgen subcommands into a single CLI command group.
 * This is the entry point registered in the main CLI (tooling/cli/src/index.ts).
 *
 * Subcommands:
 * - init: Bootstrap docgen configuration for a package
 * - analyze: Analyze JSDoc coverage and generate reports
 * - generate: Run docgen for packages
 * - aggregate: Aggregate docs to central folder
 * - status: Show docgen configuration status
 *
 * Usage:
 *   beep docgen <subcommand> [options]
 *
 * Examples:
 *   beep docgen init -p packages/common/contract
 *   beep docgen analyze -p packages/common/schema --json
 *   beep docgen generate --parallel 8
 *   beep docgen aggregate --clean
 *   beep docgen status --verbose
 *
 * @module docgen
 * @see DOCGEN_CLI_IMPLEMENTATION.md for full specification
 */

import * as CliCommand from "@effect/cli/Command";
import { aggregateCommand } from "./docgen/aggregate.js";
import { analyzeCommand } from "./docgen/analyze.js";
import { generateCommand } from "./docgen/generate.js";
import { initCommand } from "./docgen/init.js";
import { statusCommand } from "./docgen/status.js";

/**
 * Main docgen command that groups all subcommands.
 *
 * Provides documentation generation utilities for the beep-effect monorepo:
 * - Initialize docgen configuration from existing tsconfigs
 * - Analyze JSDoc coverage with agent-friendly reports
 * - Generate documentation using @effect/docgen
 * - Aggregate docs to a central location
 * - View status of docgen configuration across packages
 */
export const docgenCommand = CliCommand.make("docgen").pipe(
  CliCommand.withDescription("Documentation generation utilities for the beep-effect monorepo."),
  CliCommand.withSubcommands([initCommand, analyzeCommand, generateCommand, aggregateCommand, statusCommand])
);
