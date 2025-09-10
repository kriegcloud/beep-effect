import type { SpanMetricsConfig } from "@beep/errors/shared";
import * as Cause from "effect/Cause";
import * as Clock from "effect/Clock";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as Metric from "effect/Metric";

// =========================
// Client-safe logging helpers
// =========================

export const withLogContext =
  (annotations: Readonly<Record<string, unknown>>) =>
  <A, E, R>(self: Effect.Effect<A, E, R>) =>
    self.pipe(Effect.annotateLogs(annotations));

export const withRootSpan =
  (label: string) =>
  <A, E, R>(self: Effect.Effect<A, E, R>) =>
    self.pipe(Effect.withLogSpan(label));

// =========================
// Metrics span wrapper (client)
// =========================

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
// Accumulation helpers (client)
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

export const accumulateEffectsAndReport = <A, E, R>(
  effects: ReadonlyArray<Effect.Effect<A, E, R>>,
  options?: AccumulateOptions
): Effect.Effect<AccumulateResult<A, E>, never, R> =>
  Effect.gen(function* () {
    const res = yield* accumulateEffects(effects, { concurrency: options?.concurrency });

    yield* Effect.logInfo("accumulate summary", {
      successes: res.successes.length,
      errors: res.errors.length,
    });

    for (const [i, cause] of res.errors.entries()) {
      yield* Effect.logError(`accumulate error[${i}]`);
      // Pretty print cause without server-only extras
      yield* Effect.sync(() => console.error(Cause.pretty(cause)));
    }

    let eff: Effect.Effect<AccumulateResult<A, E>, never, R> = Effect.succeed(res);
    if (options?.annotations) eff = eff.pipe(Effect.annotateLogs(options.annotations));
    if (options?.spanLabel) eff = eff.pipe(Effect.withLogSpan(options.spanLabel));
    return yield* eff;
  });

// =========================
// Env logging (client-safe no-op)
// =========================

export const withEnvLogging = <A, E, R>(self: Effect.Effect<A, E, R>) => self;
