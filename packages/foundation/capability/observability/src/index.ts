/**
 * Barrel re-exports for `@beep/observability`.
 *
 * Provides diagnostics, logging, HTTP errors, metric helpers, phase profiling,
 * and transport-safe schemas for Effect causes and exits.
 *
 * @example
 * ```typescript
 * import { Effect } from "effect"
 * import { classifyCause, LoggingConfig, layerConsoleLogger } from "@beep/observability"
 *
 * console.log(classifyCause)
 *
 * const config = LoggingConfig.make({ format: "pretty", minLogLevel: "Info" })
 * const program = Effect.log("hello").pipe(
 *
 * )
 *
 * console.log(Effect.runPromise(program))
 * ```
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * Cause and exit diagnostic utilities.
 *
 * @since 0.0.0
 * @category diagnostics
 */
export * from "./CauseDiagnostics.ts";
/**
 * Safe, bounded redaction of errors and causes for logs, telemetry, and clients.
 *
 * @since 0.0.0
 * @category diagnostics
 */
export * from "./CauseRedaction.ts";
/**
 * Browser-safe shared observability configuration.
 *
 * @since 0.0.0
 * @category configuration
 */
export * from "./CoreConfig.ts";
/**
 * Typed HTTP error classes and convenience constructors.
 *
 * @since 0.0.0
 * @category error-handling
 */
export * from "./HttpError.ts";
/**
 * Configurable console logging layer.
 *
 * @since 0.0.0
 * @category observability
 */
export * from "./Logging.ts";
/**
 * Effect metric observation helpers.
 *
 * @since 0.0.0
 * @category observability
 */
export * from "./Metric.ts";
/**
 * Transport-safe schemas for errors, defects, causes, and exits.
 *
 * @since 0.0.0
 * @category observability
 */
export * from "./Observed.ts";
/**
 * Phase profiling with spans, logs, and optional metrics.
 *
 * @since 0.0.0
 * @category observability
 */
export * from "./PhaseProfiler.ts";
