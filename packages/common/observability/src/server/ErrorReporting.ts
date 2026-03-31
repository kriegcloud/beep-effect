import bc from "@beep/colors";
import { ErrorReporter, Match } from "effect";
import { renderObservedCause, summarizeCause } from "../CauseDiagnostics.ts";

/**
 * Create a console-backed error reporter with cause fingerprints and pretty rendering.
 *
 * @since 0.0.0
 * @category Constructors
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

    if (Object.keys(attributes).length > 0) {
      console.error(attributes);
    }

    if (options?.includeCause ?? true) {
      console.error(renderObservedCause(cause));
    }
  });

/**
 * Register a console-backed error reporter.
 *
 * @since 0.0.0
 * @category Layers
 */
export const layerErrorReporter = (options?: {
  readonly includeCause?: boolean | undefined;
  readonly mergeWithExisting?: boolean | undefined;
}) =>
  ErrorReporter.layer([makeConsoleErrorReporter({ includeCause: options?.includeCause })], {
    mergeWithExisting: options?.mergeWithExisting ?? true,
  });
