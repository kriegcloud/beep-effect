/**
 * @file Unified Verification Command
 *
 * CLI command that runs all verification checks (EntityId + Effect patterns).
 *
 * Usage:
 *   beep verify all [--filter <package>] [--format <format>] [--severity <level>] [--ci]
 *
 * @module verify/all
 * @since 1.0.0
 */

import * as Command from "@effect/cli/Command";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import { entityIdHandler } from "../entityids/handler.js";
import { ViolationsFoundError } from "../errors.js";
import { ciOption, filterOption, formatOption, severityOption } from "../options.js";
import { patternHandler } from "../patterns/handler.js";
import { formatReport } from "../reporter.js";
import { createReport, type Violation } from "../schemas.js";

// -----------------------------------------------------------------------------
// Command
// -----------------------------------------------------------------------------

/**
 * Unified verification command.
 *
 * Runs all verification checks:
 * - EntityId pattern violations
 * - Effect pattern violations
 *
 * @example
 * ```bash
 * # Run all verifications
 * beep verify all
 *
 * # Filter to specific package
 * beep verify all --filter @beep/iam-*
 *
 * # Summary output for CI
 * beep verify all --format summary --ci
 * ```
 *
 * @since 0.1.0
 * @category commands
 */
export const verifyAllCommand = Command.make(
  "all",
  {
    filter: filterOption,
    format: formatOption,
    severity: severityOption,
    ci: ciOption,
  },
  ({ filter, format, severity, ci }) =>
    Effect.gen(function* () {
      // Run both verifications in parallel
      const [entityIdReport, patternReport] = yield* Effect.all([
        entityIdHandler({
          filter,
          format,
          severity,
        }),
        patternHandler({
          filter,
          format,
          severity,
        }),
      ]);

      // Combine violations
      const allViolations: ReadonlyArray<Violation> = A.appendAll(entityIdReport.violations, patternReport.violations);

      // Combine scanned packages
      const allPackages = A.dedupe(A.appendAll(entityIdReport.scannedPackages, patternReport.scannedPackages));

      // Create combined report
      const combinedReport = createReport(
        allViolations,
        allPackages,
        entityIdReport.scannedFiles + patternReport.scannedFiles
      );

      // Output report
      yield* formatReport(combinedReport, format);

      // CI mode: fail if critical violations found
      if (ci && combinedReport.summary.critical > 0) {
        return yield* Effect.fail(
          new ViolationsFoundError({
            count: combinedReport.summary.total,
            critical: combinedReport.summary.critical,
            warning: combinedReport.summary.warning,
          })
        );
      }
    })
).pipe(Command.withDescription("Run all verification checks (EntityId + Effect patterns)"));
