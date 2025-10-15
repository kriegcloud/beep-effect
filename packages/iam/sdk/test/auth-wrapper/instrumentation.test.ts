import "../setup/client-env.stub";

import { describe } from "bun:test";
import { assertTrue, effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as HashMap from "effect/HashMap";
import * as Metric from "effect/Metric";
import * as MetricBoundaries from "effect/MetricBoundaries";
import { annotateAuthLogs, withAuthSpan, withSpanAndMetrics } from "../../src/auth-wrapper/instrumentation";

// Convenient helper to convert log annotations to a plain object for assertions.
const mapToObject = (map: HashMap.HashMap<string, unknown>) =>
  Array.from(HashMap.entries(map)).reduce<Record<string, unknown>>((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {});

describe("better-auth instrumentation", () => {
  effect("annotates logs with provided values", () =>
    Effect.gen(function* () {
      const annotations = yield* annotateAuthLogs({ values: { foo: "bar" } })(Effect.logAnnotations);

      const plain = mapToObject(annotations);
      strictEqual(plain.foo, "bar");
    })
  );

  effect("creates a span with the expected name", () =>
    withAuthSpan({ spanName: "better-auth:test" })(
      Effect.flatMap(Effect.currentSpan, (span) => Effect.sync(() => strictEqual(span.name, "better-auth:test")))
    ).pipe(Effect.orDie)
  );

  effect("records metrics when configured", () =>
    Effect.gen(function* () {
      const successCounter = Metric.counter("better-auth_success");
      const errorCounter = Metric.counter("better-auth_error");
      const latencyHistogram = Metric.histogram(
        "better-auth_latency",
        MetricBoundaries.exponential({ start: 1, factor: 2, count: 10 })
      );

      yield* withSpanAndMetrics({
        successCounter,
        errorCounter,
        latencyHistogram,
      })(Effect.succeed("ok"));

      const successState = yield* Metric.value(successCounter);
      const errorState = yield* Metric.value(errorCounter);
      const latencyState = yield* Metric.value(latencyHistogram);

      strictEqual(successState.count, 1);
      strictEqual(errorState.count, 0);
      strictEqual(latencyState.count, 1);
    })
  );

  effect("increments error counter on failure", () =>
    Effect.gen(function* () {
      const errorCounter = Metric.counter("better-auth_error_fail");

      const failing = withSpanAndMetrics({ errorCounter })(Effect.fail(new Error("boom")));

      const exit = yield* Effect.exit(failing);
      assertTrue(Exit.isFailure(exit));

      const errorState = yield* Metric.value(errorCounter);
      strictEqual(errorState.count, 1);
    })
  );
});
