/**
 * @file DocgenLogger - Structured logging service for docgen CLI.
 *
 * Provides leveled, structured logging with context propagation.
 * Supports console and JSON output modes.
 *
 * @module docgen/shared/logger
 * @since 1.0.0
 */

import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Str from "effect/String";
import * as Struct from "effect/Struct";
import color from "picocolors";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/**
 * Log severity levels in ascending order.
 *
 * @example
 * ```ts
 * import type { LogLevel } from "@beep/repo-cli/commands/docgen/shared"
 *
 * const level: LogLevel = "info"
 * ```
 *
 * @category models
 * @since 0.1.0
 */
export type LogLevel = "trace" | "debug" | "info" | "warn" | "error";

/** Numeric values for level comparison */
const LOG_LEVEL_VALUES: Record<LogLevel, number> = {
  trace: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
};

/**
 * Structured log entry containing timestamp, level, message, and context.
 *
 * @example
 * ```ts
 * import type { LogEntry } from "@beep/repo-cli/commands/docgen/shared"
 * import * as O from "effect/Option"
 *
 * const entry: LogEntry = {
 *   timestamp: "2025-01-15T10:30:00.000Z",
 *   level: "info",
 *   message: "Application started",
 *   context: { version: "1.0.0" },
 *   correlationId: O.none(),
 *   operation: O.none(),
 *   durationMs: O.none(),
 * }
 * ```
 *
 * @category models
 * @since 0.1.0
 */
export interface LogEntry {
  readonly timestamp: string;
  readonly level: LogLevel;
  readonly message: string;
  readonly context: Record<string, unknown>;
  readonly correlationId: O.Option<string>;
  readonly operation: O.Option<string>;
  readonly durationMs: O.Option<number>;
}

/**
 * Logger configuration options for customizing output format and filtering.
 *
 * @example
 * ```ts
 * import type { LoggerOptions } from "@beep/repo-cli/commands/docgen/shared"
 * import * as O from "effect/Option"
 *
 * const options: LoggerOptions = {
 *   minLevel: "debug",
 *   format: "console",
 *   correlationId: O.some("req-123"),
 *   operation: O.some("analyze"),
 * }
 * ```
 *
 * @category models
 * @since 0.1.0
 */
export interface LoggerOptions {
  readonly minLevel: LogLevel;
  readonly format: "console" | "json";
  readonly correlationId: O.Option<string>;
  readonly operation: O.Option<string>;
}

// -----------------------------------------------------------------------------
// Service Definition
// -----------------------------------------------------------------------------

/**
 * DocgenLogger service interface providing structured logging capabilities.
 *
 * Supports leveled logging, child loggers with context propagation,
 * and automatic timing of effectful operations.
 *
 * @example
 * ```ts
 * import { DocgenLogger, DocgenLoggerLive } from "@beep/repo-cli/commands/docgen/shared"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const logger = yield* DocgenLogger
 *   yield* logger.info("Starting operation")
 *
 *   const childLogger = logger.child("subsystem")
 *   yield* childLogger.debug("Processing data")
 *
 *   const result = yield* logger.timed(
 *     "expensive-operation",
 *     Effect.succeed("result")
 *   )
 *
 *   return result
 * }).pipe(Effect.provide(DocgenLoggerLive()))
 * ```
 *
 * @category services
 * @since 0.1.0
 */
export interface DocgenLogger {
  readonly trace: (message: string, context?: Record<string, unknown>) => Effect.Effect<void>;
  readonly debug: (message: string, context?: Record<string, unknown>) => Effect.Effect<void>;
  readonly info: (message: string, context?: Record<string, unknown>) => Effect.Effect<void>;
  readonly warn: (message: string, context?: Record<string, unknown>) => Effect.Effect<void>;
  readonly error: (message: string, context?: Record<string, unknown>) => Effect.Effect<void>;

  /** Create child logger with additional context */
  readonly withContext: (context: Record<string, unknown>) => DocgenLogger;

  /** Create named child logger for a subsystem */
  readonly child: (name: string) => DocgenLogger;

  /** Time an operation and log its duration */
  readonly timed: <A, E, R>(operation: string, effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
}

/**
 * DocgenLogger service tag for dependency injection.
 *
 * @example
 * ```ts
 * import { DocgenLogger, DocgenLoggerLive } from "@beep/repo-cli/commands/docgen/shared"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const logger = yield* DocgenLogger
 *   yield* logger.info("Hello from logger")
 * }).pipe(Effect.provide(DocgenLoggerLive()))
 * ```
 *
 * @category symbols
 * @since 0.1.0
 */
export const DocgenLogger = Context.GenericTag<DocgenLogger>("docgen/Logger");

// -----------------------------------------------------------------------------
// Console Formatter
// -----------------------------------------------------------------------------

const LEVEL_COLORS: Record<LogLevel, (s: string) => string> = {
  trace: color.gray,
  debug: color.cyan,
  info: color.blue,
  warn: color.yellow,
  error: color.red,
};

const formatConsole = (entry: LogEntry): string => {
  const time = F.pipe(entry.timestamp, Str.slice(11, 23)); // HH:MM:SS.mmm
  const level = F.pipe(entry.level, Str.toUpperCase, (s) => s.padEnd(5), LEVEL_COLORS[entry.level]);

  const contextKeys = F.pipe(entry.context, Struct.keys);
  const contextStr = A.length(contextKeys) > 0 ? ` ${color.gray(JSON.stringify(entry.context))}` : "";

  const durationStr = F.pipe(
    entry.durationMs,
    O.match({
      onNone: () => "",
      onSome: (ms) => color.gray(` (${ms}ms)`),
    })
  );

  return `[${time}] ${level} ${entry.message}${durationStr}${contextStr}`;
};

const formatJson = (entry: LogEntry): string =>
  JSON.stringify({
    timestamp: entry.timestamp,
    level: entry.level,
    message: entry.message,
    ...entry.context,
    correlationId: O.getOrUndefined(entry.correlationId),
    operation: O.getOrUndefined(entry.operation),
    durationMs: O.getOrUndefined(entry.durationMs),
  });

// -----------------------------------------------------------------------------
// Layer Implementation
// -----------------------------------------------------------------------------

const makeLogger = (options: LoggerOptions, baseContext: Record<string, unknown> = {}): DocgenLogger => {
  const shouldLog = (level: LogLevel): boolean => LOG_LEVEL_VALUES[level] >= LOG_LEVEL_VALUES[options.minLevel];

  const log = (
    level: LogLevel,
    message: string,
    context: Record<string, unknown> = {},
    durationMs: O.Option<number> = O.none()
  ): Effect.Effect<void> =>
    Effect.gen(function* () {
      if (!shouldLog(level)) return;

      const now = DateTime.unsafeNow();
      const timestamp = DateTime.formatIso(now);

      const entry: LogEntry = {
        timestamp,
        level,
        message,
        context: { ...baseContext, ...context },
        correlationId: options.correlationId,
        operation: options.operation,
        durationMs,
      };

      const formatted = options.format === "json" ? formatJson(entry) : formatConsole(entry);

      yield* Effect.sync(() => {
        if (level === "error") {
          console.error(formatted);
        } else {
          console.log(formatted);
        }
      });
    });

  return {
    trace: (msg, ctx) => log("trace", msg, ctx),
    debug: (msg, ctx) => log("debug", msg, ctx),
    info: (msg, ctx) => log("info", msg, ctx),
    warn: (msg, ctx) => log("warn", msg, ctx),
    error: (msg, ctx) => log("error", msg, ctx),

    withContext: (context) => makeLogger(options, { ...baseContext, ...context }),

    child: (name) => makeLogger({ ...options, operation: O.some(name) }, { ...baseContext, subsystem: name }),

    timed: <A, E, R>(operation: string, effect: Effect.Effect<A, E, R>) =>
      Effect.gen(function* () {
        const start = DateTime.unsafeNow();
        yield* log("debug", `Starting ${operation}`);

        const result = yield* effect;

        const end = DateTime.unsafeNow();
        const duration = DateTime.distance(start, end);
        const durationMs = Number(duration) / 1_000_000; // nanoseconds to ms

        yield* log("info", `Completed ${operation}`, {}, O.some(durationMs));

        return result;
      }),
  };
};

/**
 * Live layer for console output.
 *
 * Creates a DocgenLogger layer with configurable console-based output.
 * Defaults to "info" level with colored console formatting.
 *
 * @example
 * ```ts
 * import { DocgenLogger, DocgenLoggerLive } from "@beep/repo-cli/commands/docgen/shared"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const logger = yield* DocgenLogger
 *   yield* logger.info("Application started")
 * }).pipe(Effect.provide(DocgenLoggerLive({ minLevel: "debug" })))
 * ```
 *
 * @category layers
 * @since 0.1.0
 */
export const DocgenLoggerLive = (options?: Partial<LoggerOptions>): Layer.Layer<DocgenLogger> =>
  Layer.succeed(
    DocgenLogger,
    makeLogger({
      minLevel: options?.minLevel ?? "info",
      format: options?.format ?? "console",
      correlationId: options?.correlationId ?? O.none(),
      operation: options?.operation ?? O.none(),
    })
  );

/**
 * Layer for JSON output (CI/CD mode).
 *
 * Creates a DocgenLogger layer with JSON-formatted output at debug level.
 * Useful for automated pipelines and log aggregation systems.
 *
 * @example
 * ```ts
 * import { DocgenLogger, DocgenLoggerJson } from "@beep/repo-cli/commands/docgen/shared"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const logger = yield* DocgenLogger
 *   yield* logger.debug("Processing package", { name: "@beep/schema" })
 * }).pipe(Effect.provide(DocgenLoggerJson("correlation-123")))
 * ```
 *
 * @category layers
 * @since 0.1.0
 */
export const DocgenLoggerJson = (correlationId?: string): Layer.Layer<DocgenLogger> =>
  DocgenLoggerLive({
    format: "json",
    minLevel: "debug",
    correlationId: O.fromNullable(correlationId),
  });

/**
 * Layer for verbose debug output.
 *
 * Creates a DocgenLogger layer with debug-level console output.
 * Use this for detailed troubleshooting during development.
 *
 * @example
 * ```ts
 * import { DocgenLogger, DocgenLoggerDebug } from "@beep/repo-cli/commands/docgen/shared"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const logger = yield* DocgenLogger
 *   yield* logger.debug("Analyzing package structure")
 * }).pipe(Effect.provide(DocgenLoggerDebug))
 * ```
 *
 * @category layers
 * @since 0.1.0
 */
export const DocgenLoggerDebug: Layer.Layer<DocgenLogger> = DocgenLoggerLive({ minLevel: "debug" });

/**
 * Layer for trace-level output.
 *
 * Creates a DocgenLogger layer with trace-level console output.
 * Use this for maximum verbosity during diagnostic investigations.
 *
 * @example
 * ```ts
 * import { DocgenLogger, DocgenLoggerTrace } from "@beep/repo-cli/commands/docgen/shared"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const logger = yield* DocgenLogger
 *   yield* logger.trace("Low-level operation details")
 * }).pipe(Effect.provide(DocgenLoggerTrace))
 * ```
 *
 * @category layers
 * @since 0.1.0
 */
export const DocgenLoggerTrace: Layer.Layer<DocgenLogger> = DocgenLoggerLive({ minLevel: "trace" });
