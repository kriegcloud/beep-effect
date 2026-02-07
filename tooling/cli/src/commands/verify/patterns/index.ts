/**
 * @file Effect Pattern Verification Command
 *
 * CLI command for detecting Effect pattern violations in the codebase.
 * Finds native Set/Map/Error/Date usage that should use Effect utilities.
 *
 * Usage:
 *   beep verify patterns [--filter <package>] [--format <format>] [--severity <level>] [--ci]
 *
 * @module verify/patterns
 * @since 0.1.0
 */

import * as Command from "@effect/cli/Command";
import * as Effect from "effect/Effect";
import { ViolationsFoundError } from "../errors.js";
import { ciOption, filterOption, formatOption, severityOption } from "../options.js";
import { formatReport } from "../reporter.js";
import { patternHandler } from "./handler.js";

// -----------------------------------------------------------------------------
// Command
// -----------------------------------------------------------------------------

/**
 * Effect pattern verification command.
 *
 * Scans the codebase for Effect pattern violations:
 * - Native Set usage (should use MutableHashSet)
 * - Native Map usage (should use MutableHashMap)
 * - Native Error constructors (should use S.TaggedError)
 * - Native Date constructors (should use DateTime)
 *
 * @example
 * ```bash
 * # Scan all packages
 * beep verify patterns
 *
 * # Scan specific package
 * beep verify patterns --filter @beep/knowledge-server
 *
 * # Show only critical violations
 * beep verify patterns --severity critical
 *
 * # Output as JSON
 * beep verify patterns --format json
 *
 * # CI mode (exit 1 on critical violations)
 * beep verify patterns --ci
 * ```
 *
 * @since 0.1.0
 * @category commands
 */
export const verifyPatternsCommand = Command.make(
  "patterns",
  {
    filter: filterOption,
    format: formatOption,
    severity: severityOption,
    ci: ciOption,
  },
  ({ filter, format, severity, ci }) =>
    Effect.gen(function* () {
      const report = yield* patternHandler({
        filter,
        format,
        severity,
      });

      // Output report
      yield* formatReport(report, format);

      // CI mode: fail if violations found (only critical for patterns)
      if (ci && report.summary.critical > 0) {
        return yield* Effect.fail(
          new ViolationsFoundError({
            count: report.summary.total,
            critical: report.summary.critical,
            warning: report.summary.warning,
          })
        );
      }
    })
).pipe(Command.withDescription("Detect Effect pattern violations (native Set, Map, Error, Date usage)"));
