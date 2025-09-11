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

/**
 * Helper to annotate logs with a stable set of fields for a component/service.
 */
export const withLogContext =
  (annotations: Readonly<Record<string, unknown>>) =>
  <A, E, R>(self: Effect.Effect<A, E, R>) =>
    self.pipe(Effect.annotateLogs(annotations));

/**
 * Helper to add a root span around an operation.
 */
export const withRootSpan =
  (label: string) =>
  <A, E, R>(self: Effect.Effect<A, E, R>) =>
    self.pipe(Effect.withLogSpan(label));

/**
 * Instrument an effect with span, optional annotations, and optional metrics.
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

/**
 * Convenience: log a cause pretty-printed (independent helper).
 */
export const logCausePretty = (cause: Cause.Cause<unknown>, colors = true) =>
  Effect.sync(() => {
    const pretty = formatCausePretty(cause, colors);
    if (pretty) console.error(pretty);
  });

// =========================
// Environment-driven config (shared parse only)
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

// =========================
// Accumulation helpers (pure/shared)
// =========================

export interface AccumulateResult<A, E> {
  readonly successes: ReadonlyArray<A>;
  readonly errors: ReadonlyArray<Cause.Cause<E>>;
}

export interface AccumulateOptions {
  readonly concurrency?: number | "unbounded";
  readonly spanLabel?: string;
  readonly annotations?: Readonly<Record<string, string>>;
  readonly colors?: boolean;
}

export const accumulateEffects = <A, E, R>(
  effects: ReadonlyArray<Effect.Effect<A, E, R>>,
  options?: { readonly concurrency?: number | "unbounded" }
): Effect.Effect<AccumulateResult<A, E>, never, R> =>
  Effect.gen(function* () {
    const [errs, oks] = yield* Effect.partition(effects, (eff) => Effect.sandbox(eff), {
      concurrency: options?.concurrency ?? "unbounded",
    });
    return { successes: oks, errors: errs };
  });

export * as BeepError from "./errors";
