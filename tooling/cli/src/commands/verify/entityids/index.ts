/**
 * @file EntityId Verification Command
 *
 * CLI command for detecting EntityId pattern violations in the codebase.
 * Finds plain S.String ID fields that should use branded EntityIds.
 *
 * Usage:
 *   beep verify entityids [--filter <package>] [--format <format>] [--severity <level>] [--ci]
 *
 * @module verify/entityids
 * @since 1.0.0
 */

import * as Command from "@effect/cli/Command";
import * as Effect from "effect/Effect";
import { ViolationsFoundError } from "../errors.js";
import { ciOption, filterOption, formatOption, severityOption } from "../options.js";
import { formatReport } from "../reporter.js";
import { entityIdHandler } from "./handler.js";

// -----------------------------------------------------------------------------
// Command
// -----------------------------------------------------------------------------

/**
 * EntityId verification command.
 *
 * Scans the codebase for EntityId pattern violations:
 * - Plain S.String IDs in domain models
 * - Plain S.String IDs in client schemas
 * - Missing .$type<>() on table ID columns
 *
 * @example
 * ```bash
 * # Scan all packages
 * beep verify entityids
 *
 * # Scan specific package
 * beep verify entityids --filter @beep/iam-client
 *
 * # Output as JSON
 * beep verify entityids --format json
 *
 * # CI mode (exit 1 on violations)
 * beep verify entityids --ci
 * ```
 *
 * @since 0.1.0
 * @category commands
 */
export const verifyEntityIdsCommand = Command.make(
  "entityids",
  {
    filter: filterOption,
    format: formatOption,
    severity: severityOption,
    ci: ciOption,
  },
  ({ filter, format, severity, ci }) =>
    Effect.gen(function* () {
      const report = yield* entityIdHandler({
        filter,
        format,
        severity,
      });

      // Output report
      yield* formatReport(report, format);

      // CI mode: fail if violations found
      if (ci && report.summary.total > 0) {
        return yield* Effect.fail(
          new ViolationsFoundError({
            count: report.summary.total,
            critical: report.summary.critical,
            warning: report.summary.warning,
          })
        );
      }
    })
).pipe(Command.withDescription("Detect EntityId pattern violations (plain S.String IDs, missing .$type<>())"));
