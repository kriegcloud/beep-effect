/**
 * Console-backed server error reporting helpers.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import bc from "@beep/colors";
import { ErrorReporter, Match } from "effect";
import * as R from "effect/Record";
import { renderObservedCause, summarizeCause } from "../CauseDiagnostics.ts";

/**
 * Create a console-backed error reporter with cause fingerprints and pretty rendering.
 *
 * @example
 * ```typescript
 * import { makeConsoleErrorReporter } from "@beep/observability/server"
 *
 * const reporter = makeConsoleErrorReporter({ includeCause: true })
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const makeConsoleErrorReporter = (options?: {
  readonly includeCause?: boolean | undefined;
}): ErrorReporter.ErrorReporter =>
  ErrorReporter.make(({ cause, error, severity, attributes }) => {
    const summary = summarizeCause(cause);
    const severityColor = Match.value(severity).pipe(
      Match.when("Fatal", () => bc.bgRed(bc.white(` ${severity} `))),
      Match.when("Error", () => bc.red(severity)),
      Match.when("Warn", () => bc.yellow(severity)),
      Match.when("Info", () => bc.cyan(severity)),
      Match.when("Debug", () => bc.gray(severity)),
      Match.when("Trace", () => bc.dim(severity)),
      Match.exhaustive
    );

    console.error(
      `${severityColor} ${error.name}: ${error.message} fingerprint=${summary.fingerprint.value} classification=${summary.classification}`
    );

    if (R.keys(attributes).length > 0) {
      console.error(attributes);
    }

    if (options?.includeCause ?? true) {
      console.error(renderObservedCause(cause));
    }
  });

/**
 * Register a console-backed error reporter.
 *
 * @example
 * ```typescript
 * import { Layer } from "effect"
 * import { layerErrorReporter } from "@beep/observability/server"
 *
 * const ErrorReporterLive = layerErrorReporter({ includeCause: true })
 * ```
 *
 * @since 0.0.0
 * @category layers
 */
export const layerErrorReporter = (options?: {
  readonly includeCause?: boolean | undefined;
  readonly mergeWithExisting?: boolean | undefined;
}) =>
  ErrorReporter.layer([makeConsoleErrorReporter({ includeCause: options?.includeCause })], {
    mergeWithExisting: options?.mergeWithExisting ?? true,
  });
