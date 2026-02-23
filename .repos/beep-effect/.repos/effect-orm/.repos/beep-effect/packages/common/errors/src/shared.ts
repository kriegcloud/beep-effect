/**
 * Shared, environment-safe logging helpers and Beep error taxonomy utilities.
 *
 * @example
 * import * as Effect from "effect/Effect";
 * import { withLogContext, withRootSpan } from "@beep/errors/shared";
 *
 * const program = Effect.gen(function* () {
 *   yield* Effect.logInfo("hello");
 * });
 *
 * export const run = program.pipe(
 *   withLogContext({ service: "demo" }),
 *   withRootSpan("demo.run")
 * );
 *
 * @category Documentation/Modules
 * @since 0.1.0
 */
import type { LogLevel as LogLevelSchema } from "@beep/constants";
import * as Cause from "effect/Cause";
import * as Chunk from "effect/Chunk";
import * as Clock from "effect/Clock";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as HashMap from "effect/HashMap";
import * as List from "effect/List";
import * as LogLevel from "effect/LogLevel";
import * as LogSpan from "effect/LogSpan";
import * as Match from "effect/Match";
import * as Metric from "effect/Metric";
import * as O from "effect/Option";
import color from "picocolors";

/**
 * Pretty, colored console logger helpers + small telemetry helpers for Effect (shared/client-safe core).
 *
 * Node/server-specific features (env, FS, OS, process) are intentionally excluded here.
 *
 * @category Documentation/Config
 * @since 0.1.0
 */
export interface PrettyLoggerConfig {
  readonly level: LogLevel.LogLevel;
  readonly colors: boolean;
  readonly showDate: boolean;
  readonly showFiberId: boolean;
  readonly showSpans: boolean;
  readonly showAnnotations: boolean;
  /**
   * When true, will render Cause.pretty(cause) as a separate line
   * for Warning and above (and any time a non-empty cause exists).
   */
  readonly includeCausePretty: boolean;
}

/**
 * Default pretty logger configuration.
 *
 * @category Documentation/Config
 * @since 0.1.0
 */
export const defaultConfig: PrettyLoggerConfig = {
  level: LogLevel.All,
  colors: true,
  showDate: true,
  showFiberId: true,
  showSpans: true,
  showAnnotations: true,
  includeCausePretty: true,
};

const identity = (s: string) => s;

/**
 * Colorizes log levels when enabled.
 *
 * @category Documentation/Functions
 * @since 0.1.0
 */
export function colorForLevel(level: LogLevel.LogLevel, enabled: boolean) {
  if (!enabled) return identity;
  const ord = level.ordinal;
  if (ord >= LogLevel.Fatal.ordinal) return color.magenta;
  if (ord >= LogLevel.Error.ordinal) return color.red;
  if (ord >= LogLevel.Warning.ordinal) return color.yellow;
  if (ord >= LogLevel.Info.ordinal) return color.green;
  if (ord >= LogLevel.Debug.ordinal) return color.cyan;
  return color.gray; // Trace and below
}

/**
 * Normalizes messages into strings for logging.
 *
 * @category Documentation/Functions
 * @since 0.1.0
 */
export function formatMessage(message: unknown): string {
  if (typeof message === "string") return message;
  if (message instanceof Error) return `${message.name}: ${message.message}`;
  try {
    return typeof message === "object" ? JSON.stringify(message) : String(message);
  } catch {
    return String(message);
  }
}

/**
 * Renders annotations into a log-friendly string.
 *
 * @category Documentation/Functions
 * @since 0.1.0
 */
export function formatAnnotations(ann: HashMap.HashMap<string, unknown>, enableColors: boolean): string {
  const parts: string[] = [];
  for (const [k, v] of HashMap.entries(ann)) {
    const key = enableColors ? color.dim(String(k)) : String(k);
    const val = formatMessage(v);
    parts.push(`${key}=${val}`);
  }
  return parts.join(" ");
}

/**
 * Formats spans relative to a timestamp.
 *
 * @category Documentation/Functions
 * @since 0.1.0
 */
export function formatSpans(nowMs: number, spans: List.List<LogSpan.LogSpan>, enableColors: boolean): string {
  const rendered = List.toArray(spans).map((s) => LogSpan.render(nowMs)(s));
  const spanTxt = rendered.join(" ");
  return enableColors ? color.dim(spanTxt) : spanTxt;
}

/**
 * Determines whether to print a cause alongside a log line.
 *
 * @category Documentation/Functions
 * @since 0.1.0
 */
export function shouldPrintCause(
  level: LogLevel.LogLevel,
  cause: Cause.Cause<unknown>,
  includePretty: boolean
): boolean {
  if (!includePretty) return false;
  if (!Cause.isEmpty(cause)) return true;
  return level.ordinal >= LogLevel.Warning.ordinal;
}

/**
 * Pretty-prints a cause with optional color.
 *
 * @category Documentation/Functions
 * @since 0.1.0
 */
export function formatCausePretty(cause: Cause.Cause<unknown>, enableColors = true): string {
  const pretty = Cause.isEmpty(cause) ? "" : Cause.pretty(cause);
  if (!enableColors || !pretty) return pretty;
  const colored = color.red(pretty);
  return colored === pretty ? `\u001b[31m${pretty}\u001b[39m` : colored;
}

/**
 * Extracts the primary error/value from a cause.
 *
 * @category Documentation/Functions
 * @since 0.1.0
 */
export function extractPrimaryError(cause: Cause.Cause<unknown>): {
  readonly error?: Error | undefined;
  readonly message: string;
} {
  const failOpt = Cause.failureOption(cause);
  if (O.isSome(failOpt)) {
    const val = failOpt.value;
    if (val instanceof Error) return { error: val, message: val.message };
    return { message: String(val) };
  }
  const defects = Cause.defects(cause);
  const arr = Chunk.toArray(defects);
  const err = arr.find((d): d is Error => d instanceof Error);
  if (err) return { error: err, message: err.message };
  return { message: "Unknown error" };
}

/**
 * Formatting options for rendered cause headings.
 *
 * @category Documentation/Config
 * @since 0.1.0
 */
export interface CauseHeadingOptions {
  readonly colors?: boolean | undefined;
  readonly date?: Date | undefined;
  readonly levelLabel?: string | undefined;
  readonly fiberName?: string | undefined;
  readonly spansText?: string | undefined;
  readonly service?: string | undefined;
  readonly environment?: string | undefined;
  readonly requestId?: string | undefined;
  readonly correlationId?: string | undefined;
  readonly userId?: string | undefined;
  readonly hostname?: string | undefined;
  readonly pid?: number | string | undefined;
  readonly nodeVersion?: string | undefined;
  readonly includeCodeFrame?: boolean | undefined;
}

/**
 * Helper to annotate logs with a stable set of fields for a component/service.
 *
 * @category Documentation/Functions
 * @since 0.1.0
 */
export const withLogContext =
  (annotations: Readonly<Record<string, unknown>>) =>
  <A, E, R>(self: Effect.Effect<A, E, R>) =>
    self.pipe(Effect.annotateLogs(annotations));

/**
 * Helper to add a root span around an operation.
 *
 * @category Documentation/Functions
 * @since 0.1.0
 */
export const withRootSpan =
  (label: string) =>
  <A, E, R>(self: Effect.Effect<A, E, R>) =>
    self.pipe(Effect.withLogSpan(label));

/**
 * Metrics configuration for span instrumentation.
 *
 * @category Documentation/Config
 * @since 0.1.0
 */
export interface SpanMetricsConfig {
  readonly successCounter?: Metric.Metric.Counter<number> | undefined;
  readonly errorCounter?: Metric.Metric.Counter<number> | undefined;
  readonly durationHistogram?: Metric.Metric.Histogram<number> | undefined;
  /** How to record the duration value into the histogram (default: millis). */
  readonly durationUnit?: "millis" | "seconds" | undefined;
}

/**
 * Instrument an effect with span, optional annotations, and optional metrics.
 *
 * @category Documentation/Functions
 * @since 0.1.0
 */
export const withSpanAndMetrics =
  (
    spanLabel: string,
    metrics?: SpanMetricsConfig | undefined,
    annotations?: Readonly<Record<string, unknown>> | undefined
  ) =>
  <A, E, R>(self: Effect.Effect<A, E, R>) =>
    Effect.gen(function* () {
      const start = yield* Clock.currentTimeMillis;
      const exit = yield* Effect.exit(
        self.pipe(Effect.withLogSpan(spanLabel), annotations ? Effect.annotateLogs(annotations) : (eff) => eff)
      );
      const end = yield* Clock.currentTimeMillis;
      const durationMs = end - start;

      if (metrics?.durationHistogram) {
        const value = metrics.durationUnit === "seconds" ? durationMs / 1000 : durationMs;
        yield* Metric.update(metrics.durationHistogram, value);
      }

      if (Exit.isSuccess(exit)) {
        if (metrics?.successCounter) {
          yield* Metric.increment(metrics.successCounter);
        }
        return exit.value;
      }

      if (metrics?.errorCounter) {
        yield* Metric.increment(metrics.errorCounter);
      }
      // Re-emit the original cause to preserve failure semantics
      return yield* Effect.failCause(exit.cause);
    });

/**
 * Convenience: log a cause pretty-printed (independent helper).
 *
 * @category Documentation/Functions
 * @since 0.1.0
 */
export const logCausePretty = (cause: Cause.Cause<unknown>, colors = true) =>
  Effect.sync(() => {
    const pretty = formatCausePretty(cause, colors);
    if (pretty) console.error(pretty);
  });

// =========================
// Environment-driven config (shared parse only)
// =========================
/**
 * Parse a log level literal into a LogLevel value.
 *
 * @category Documentation/Functions
 * @since 0.1.0
 */
export const parseLevel = (raw: LogLevelSchema.Type): LogLevel.LogLevel => {
  return Match.value(raw).pipe(
    Match.when("All", () => LogLevel.All),
    Match.when("Trace", () => LogLevel.Trace),
    Match.when("Debug", () => LogLevel.Debug),
    Match.when("Info", () => LogLevel.Info),
    Match.when("Warning", () => LogLevel.Warning),
    Match.when("Error", () => LogLevel.Error),
    Match.when("Fatal", () => LogLevel.Fatal),
    Match.when("None", () => LogLevel.None),
    Match.exhaustive
  );
};

// =========================
// Accumulation helpers (pure/shared)
// =========================

/**
 * Aggregated successes/errors from a batch of effects.
 *
 * @category Documentation/Results
 * @since 0.1.0
 */
export interface AccumulateResult<A, E> {
  readonly successes: ReadonlyArray<A>;
  readonly errors: ReadonlyArray<Cause.Cause<E>>;
}

/**
 * Options for concurrent accumulation helpers.
 *
 * @category Documentation/Config
 * @since 0.1.0
 */
export interface AccumulateOptions {
  readonly concurrency?: number | "unbounded" | undefined;
  readonly spanLabel?: string | undefined;
  readonly annotations?: Readonly<Record<string, string>> | undefined;
  readonly colors?: boolean | undefined;
}

/**
 * Partition a collection of effects into successes and errors.
 *
 * @category Documentation/Functions
 * @since 0.1.0
 */
export const accumulateEffects = <A, E, R>(
  effects: ReadonlyArray<Effect.Effect<A, E, R>>,
  options?: { readonly concurrency?: number | "unbounded" | undefined }
): Effect.Effect<AccumulateResult<A, E>, never, R> =>
  Effect.gen(function* () {
    const [errs, oks] = yield* Effect.partition(effects, (eff) => Effect.sandbox(eff), {
      concurrency: options?.concurrency ?? "unbounded",
    });
    return { successes: oks, errors: errs };
  });

/**
 * Re-export tagged errors namespace.
 *
 * @category Documentation/Reexports
 * @since 0.1.0
 */
export * as BeepError from "./errors";
