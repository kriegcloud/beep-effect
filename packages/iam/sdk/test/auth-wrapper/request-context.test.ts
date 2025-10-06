import { emptyHandlerContext, handlerFiberRef, withRequestContext } from "@beep/iam-sdk/auth-wrapper/context";
import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as FiberRef from "effect/FiberRef";
import * as HashMap from "effect/HashMap";
import * as Metric from "effect/Metric";

const mapToObject = (map: HashMap.HashMap<string, unknown>) =>
  Array.from(HashMap.entries(map)).reduce<Record<string, unknown>>((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {});

const withCleanContext = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
  Effect.locally(handlerFiberRef, emptyHandlerContext)(effect);

describe("withRequestContext", () => {
  it("merges fiber context and annotations", () =>
    withCleanContext(
      withRequestContext({
        fiberContext: {
          annotations: { userId: "user-1" },
          metricTags: { region: "us-east" },
        },
        annotations: { action: "sign-in" },
        metricTags: { stage: "prod" },
      })(
        Effect.gen(function* () {
          const context = yield* FiberRef.get(handlerFiberRef);
          assert.strictEqual(context.annotations.userId, "user-1");
          assert.strictEqual(context.annotations.action, "sign-in");
          assert.strictEqual(context.metricTags.region, "us-east");
          assert.strictEqual(context.metricTags.stage, "prod");

          const annotations = yield* Effect.logAnnotations;
          const plain = mapToObject(annotations);
          assert.strictEqual(plain.userId, "user-1");
          assert.strictEqual(plain.action, "sign-in");
        })
      )
    ));

  it("preserves outer annotations and metric tags for nested contexts", () =>
    withCleanContext(
      withRequestContext({
        fiberContext: {
          annotations: { requestId: "req-42" },
          metricTags: { plugin: "sign-in" },
        },
      })(
        withRequestContext({ annotations: { step: "inner" } })(
          Effect.gen(function* () {
            const annotations = yield* Effect.logAnnotations;
            const plain = mapToObject(annotations);
            assert.strictEqual(plain.requestId, "req-42");
            assert.strictEqual(plain.step, "inner");

            const context = yield* FiberRef.get(handlerFiberRef);
            assert.strictEqual(context.annotations.requestId, "req-42");
            assert.strictEqual(context.metricTags.plugin, "sign-in");
          })
        )
      )
    ));

  it("applies metric tags when recording metrics", () =>
    withCleanContext(
      withRequestContext({ metricTags: { plugin: "auth" } })(
        Effect.gen(function* () {
          const counter = Metric.counter("request_context_metric");
          yield* Metric.increment(counter);

          const state = yield* Metric.value(counter);
          assert.strictEqual(state.count, 1);
        })
      )
    ));
});
