import type * as Cause from "effect/Cause";
import * as Clock from "effect/Clock";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as Metric from "effect/Metric";

export interface BetterAuthMetricsConfig {
  readonly latencyHistogram?: Metric.Metric.Histogram<number>;
  readonly successCounter?: Metric.Metric.Counter<number>;
  readonly errorCounter?: Metric.Metric.Counter<number>;
  readonly durationUnit?: "millis" | "seconds";
}

export const withSpanAndMetrics =
  (config: BetterAuthMetricsConfig | undefined) =>
  <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E, R> => {
    if (!config) {
      return effect;
    }

    return Effect.gen(function* () {
      const start = yield* Clock.currentTimeMillis;
      const exit = yield* Effect.exit(effect);
      const end = yield* Clock.currentTimeMillis;
      const durationMs = end - start;

      if (config.latencyHistogram) {
        const value = config.durationUnit === "seconds" ? durationMs / 1000 : durationMs;
        yield* Metric.update(config.latencyHistogram, value);
      }

      if (Exit.isSuccess(exit)) {
        if (config.successCounter) {
          yield* Metric.increment(config.successCounter);
        }
        return exit.value;
      }

      if (config.errorCounter) {
        yield* Metric.increment(config.errorCounter);
      }

      return yield* Effect.failCause(exit.cause as Cause.Cause<E>);
    });
  };
