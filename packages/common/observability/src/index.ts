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
 * void classifyCause
 *
 * const config = new LoggingConfig({ format: "pretty", minLogLevel: "Info" })
 * const program = Effect.log("hello").pipe(
 *
 * )
 *
 * void Effect.runPromise(program)
 * ```
 *
 * @module
 * @since 0.0.0
 */

/**
 * Current version of the `@beep/observability` package.
 *
 * @example
 * ```typescript
 * import { VERSION } from "@beep/observability"
 *
 * console.log(VERSION) // "0.0.0"
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const VERSION = "0.0.0" as const;

/**
 * Cause and exit diagnostic utilities.
 *
 * @since 0.0.0
 * @category diagnostics
 */
export * from "./CauseDiagnostics.ts";

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
 * @category error handling
 */
export * from "./HttpError.ts";

/**
 * Configurable console logging layer.
 *
 * @since 0.0.0
 * @category logging
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
