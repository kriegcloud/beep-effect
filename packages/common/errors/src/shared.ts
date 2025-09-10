import type { LogLevel as LogLevelSchema } from "@beep/constants";
import * as Cause from "effect/Cause";
import * as Chunk from "effect/Chunk";
import * as Clock from "effect/Clock";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as HashMap from "effect/HashMap";
import type * as Layer from "effect/Layer";
import * as List from "effect/List";
import * as Logger from "effect/Logger";
import * as LogLevel from "effect/LogLevel";
import * as LogSpan from "effect/LogSpan";
import * as Match from "effect/Match";
import * as Metric from "effect/Metric";
import * as O from "effect/Option";
import type * as Record from "effect/Record";
import color from "picocolors";
import { makePrettyConsoleLogger } from "./utils";
/**
 * Pretty, colored console logger + small telemetry helpers for Effect.
 *
 * Goals
 * - Beautiful, readable log lines
 * - Include timestamp, level, fiber id, spans, annotations
 * - Helpful cause rendering for warnings/errors
 * - Simple helpers to install the logger and set minimum levels
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

export const defaultConfig: PrettyLoggerConfig = {
  level: LogLevel.Info,
  colors: true,
  showDate: true,
  showFiberId: true,
  showSpans: true,
  showAnnotations: true,
  includeCausePretty: true,
};

const identity = (s: string) => s;

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

export function formatMessage(message: unknown): string {
  if (typeof message === "string") return message;
  if (message instanceof Error) return `${message.name}: ${message.message}`;
  try {
    return typeof message === "object" ? JSON.stringify(message) : String(message);
  } catch {
    return String(message);
  }
}

export function formatAnnotations(ann: HashMap.HashMap<string, unknown>, enableColors: boolean): string {
  const parts: string[] = [];
  for (const [k, v] of HashMap.entries(ann)) {
    // Skip internal keys if needed later
    const key = enableColors ? color.dim(String(k)) : String(k);
    const val = formatMessage(v);
    parts.push(`${key}=${val}`);
  }
  return parts.join(" ");
}

export function formatSpans(nowMs: number, spans: List.List<LogSpan.LogSpan>, enableColors: boolean): string {
  const rendered = List.toArray(spans).map((s) => LogSpan.render(nowMs)(s));
  const spanTxt = rendered.join(" ");
  return enableColors ? color.dim(spanTxt) : spanTxt;
}

export function shouldPrintCause(
  level: LogLevel.LogLevel,
  cause: Cause.Cause<unknown>,
  includePretty: boolean
): boolean {
  if (!includePretty) return false;
  if (!Cause.isEmpty(cause)) return true;
  return level.ordinal >= LogLevel.Warning.ordinal;
}

export function formatCausePretty(cause: Cause.Cause<unknown>, enableColors = true): string {
  const pretty = Cause.isEmpty(cause) ? "" : Cause.pretty(cause);
  return enableColors && pretty ? color.red(pretty) : pretty;
}

export function extractPrimaryError(cause: Cause.Cause<unknown>): { error?: Error; message: string } {
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

export interface CauseHeadingOptions {
  readonly colors?: boolean;
  readonly date?: Date;
  readonly levelLabel?: string;
  readonly fiberName?: string;
  readonly spansText?: string;
  readonly service?: string;
  readonly environment?: string;
  readonly requestId?: string;
  readonly correlationId?: string;
  readonly userId?: string;
  readonly hostname?: string;
  readonly pid?: number | string;
  readonly nodeVersion?: string;
  readonly includeCodeFrame?: boolean;
}

export function makePrettyConsoleLoggerLayer(cfg?: Partial<PrettyLoggerConfig>): Layer.Layer<never> {
  const logger = makePrettyConsoleLogger(cfg);
  return Logger.replace(Logger.defaultLogger, logger);
}

export function withPrettyLogging(cfg?: Partial<PrettyLoggerConfig>) {
  return <A, E, R>(self: Effect.Effect<A, E, R>) =>
    self.pipe(
      Logger.withMinimumLogLevel(cfg?.level ?? defaultConfig.level),
      Effect.provide(makePrettyConsoleLoggerLayer(cfg))
    );
}

/**
 * Helper to annotate logs with a stable set of fields for a component/service.
 * Example: effect.pipe(withLogContext({ service: 'auth', version: '1.2.3' }))
 */
export const withLogContext =
  (annotations: Readonly<Record<string, unknown>>) =>
  <A, E, R>(self: Effect.Effect<A, E, R>) =>
    self.pipe(Effect.annotateLogs(annotations));

/**
 * Helper to add a root span around an operation and ensure logger context includes it.
 */
export const withRootSpan =
  (label: string) =>
  <A, E, R>(self: Effect.Effect<A, E, R>) =>
    self.pipe(Effect.withLogSpan(label));

/**
 * Convenience: run an Effect with pretty logging and return Exit.
 * Useful in CLIs / scripts.
 */
export const runWithPrettyLogsExit = <A, E, R>(eff: Effect.Effect<A, E, R>, cfg?: Partial<PrettyLoggerConfig>) =>
  Effect.exit(eff).pipe(withPrettyLogging(cfg));

/**
 * Log an error cause explicitly using the pretty formatter (independent helper).
 */
export const logCausePretty = (cause: Cause.Cause<unknown>, colors = true) =>
  Effect.sync(() => {
    const pretty = formatCausePretty(cause, colors);
    if (pretty) console.error(pretty);
  });

/**
 * Instrument an effect with:
 * - a log span label
 * - optional annotations
 * - optional metrics (success/error counters and a duration histogram)
 *
 * Preserves the original error Cause by re-failing with the captured cause on failures.
 */
export interface SpanMetricsConfig {
  readonly successCounter?: Metric.Metric.Counter<number>;
  readonly errorCounter?: Metric.Metric.Counter<number>;
  readonly durationHistogram?: Metric.Metric.Histogram<number>;
  /** How to record the duration value into the histogram (default: millis). */
  readonly durationUnit?: "millis" | "seconds";
}

export const withSpanAndMetrics =
  (spanLabel: string, metrics?: SpanMetricsConfig, annotations?: Readonly<Record<string, unknown>>) =>
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

// =========================
// Environment-driven config
// =========================
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
