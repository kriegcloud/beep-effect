/**
 * @file Layer Verification Command
 *
 * CLI command for detecting Layer composition hygiene violations in the codebase.
 *
 * Usage:
 *   beep verify layers [--filter <package>] [--format <format>] [--severity <level>] [--ci]
 *
 * @module verify/layers
 * @since 0.1.0
 */

import * as Command from "@effect/cli/Command";
import * as Effect from "effect/Effect";
import { ViolationsFoundError } from "../errors.js";
import { ciOption, filterOption, formatOption, severityOption } from "../options.js";
import { formatReport } from "../reporter.js";
import { layerHandler } from "./handler.js";

// -----------------------------------------------------------------------------
// Command
// -----------------------------------------------------------------------------

/**
 * Layer verification command.
 *
 * Scans the codebase for Layer composition hygiene violations:
 * - Exported `layer` without explicit `Layer.Layer<...>` annotation (critical)
 * - Exported `*Live`/`*Layer` without explicit `Layer.Layer<...>` annotation (warning)
 * - `serviceEffect` without explicit `Effect.Effect<...>` annotation (warning)
 *
 * @example
 * ```bash
 * # Scan all server packages
 * beep verify layers
 *
 * # Scan a single slice
 * beep verify layers --filter @beep/knowledge-*
 *
 * # CI mode (exit 1 on critical violations)
 * beep verify layers --ci
 * ```
 *
 * @since 0.1.0
 * @category commands
 */
export const verifyLayersCommand = Command.make(
  "layers",
  {
    filter: filterOption,
    format: formatOption,
    severity: severityOption,
    ci: ciOption,
  },
  ({ filter, format, severity, ci }) =>
    Effect.gen(function* () {
      const report = yield* layerHandler({
        filter,
        format,
        severity,
      });

      // Output report
      yield* formatReport(report, format);

      // CI mode: fail if critical violations found
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
).pipe(Command.withDescription("Detect Layer composition hygiene violations (missing Layer.Layer / Effect.Effect)"));
