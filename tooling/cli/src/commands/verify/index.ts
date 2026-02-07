/**
 * @file Verify CLI Command
 *
 * CLI command group for codebase verification.
 * Provides subcommands for detecting various code quality violations.
 *
 * Usage:
 *   beep verify <subcommand> [options]
 *
 * Subcommands:
 *   entityids   - Detect EntityId pattern violations (plain S.String IDs)
 *   patterns    - Detect Effect pattern violations (native Set, Map, Error, Date)
 *   all         - Run all verification checks
 *
 * Options (shared across subcommands):
 *   --filter, -f   Filter packages by name pattern (e.g., @beep/iam-*)
 *   --format       Output format: table, json, or summary (default: table)
 *   --severity     Filter by severity: critical, warning, or all (default: all)
 *   --ci           CI mode: exit non-zero on violations
 *
 * @module verify
 * @since 0.1.0
 *
 * @example
 * ```bash
 * # Run all verifications
 * beep verify all
 *
 * # Check only EntityId patterns
 * beep verify entityids
 *
 * # Check Effect patterns for specific package
 * beep verify patterns --filter @beep/knowledge-server
 *
 * # CI-friendly output
 * beep verify all --format summary --ci
 * ```
 */

import { FsUtilsLive, RepoUtilsLive } from "@beep/tooling-utils";
import * as Command from "@effect/cli/Command";
import * as BunFileSystem from "@effect/platform-bun/BunFileSystem";
import * as BunPath from "@effect/platform-bun/BunPath";
import * as Layer from "effect/Layer";
import { verifyAllCommand } from "./all/index.js";
import { verifyEntityIdsCommand } from "./entityids/index.js";
import { verifyPatternsCommand } from "./patterns/index.js";

// -----------------------------------------------------------------------------
// Service Layer
// -----------------------------------------------------------------------------

/**
 * Combined layer providing all services needed for verify commands.
 *
 * Provides:
 * - FileSystem (for reading files)
 * - Path (for path operations)
 * - RepoUtils (for repo root discovery)
 * - FsUtils (for filesystem utilities)
 */
const VerifyServiceLayer = Layer.mergeAll(BunFileSystem.layer, BunPath.layerPosix, RepoUtilsLive, FsUtilsLive);

// -----------------------------------------------------------------------------
// Parent Command
// -----------------------------------------------------------------------------

/**
 * Verify command with subcommands.
 *
 * Provides codebase verification capabilities:
 * - EntityId pattern checking
 * - Effect pattern checking
 * - Combined verification
 *
 * @since 0.1.0
 * @category commands
 */
export const verifyCommand = Command.make("verify").pipe(
  Command.withDescription("Verify codebase patterns and conventions"),
  Command.withSubcommands([verifyEntityIdsCommand, verifyPatternsCommand, verifyAllCommand]),
  Command.provide(VerifyServiceLayer)
);

// -----------------------------------------------------------------------------
// Re-exports
// -----------------------------------------------------------------------------

export { verifyAllCommand } from "./all/index.js";
export { verifyEntityIdsCommand } from "./entityids/index.js";
export * from "./errors.js";
export * from "./options.js";
export { verifyPatternsCommand } from "./patterns/index.js";
export * from "./schemas.js";
