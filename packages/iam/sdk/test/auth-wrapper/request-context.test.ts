import "../setup/client-env.stub";

import { describe } from "bun:test";
import { effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as FiberRef from "effect/FiberRef";
import * as HashMap from "effect/HashMap";
import * as Metric from "effect/Metric";
import { emptyHandlerContext, handlerFiberRef, withRequestContext } from "../../src/auth-wrapper/context";

const mapToObject = (map: HashMap.HashMap<string, unknown>) =>
  Array.from(HashMap.entries(map)).reduce<Record<string, unknown>>((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {});

const withCleanContext = <A, E, R>(effect: Effect.Effect<A, E, R>) =>
  Effect.locally(handlerFiberRef, emptyHandlerContext)(effect);

describe("withRequestContext", () => {
  effect("merges fiber context and annotations", () =>
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
          strictEqual(context.annotations.userId, "user-1");
          strictEqual(context.annotations.action, "sign-in");
          strictEqual(context.metricTags.region, "us-east");
          strictEqual(context.metricTags.stage, "prod");

          const annotations = yield* Effect.logAnnotations;
          const plain = mapToObject(annotations);
          strictEqual(plain.userId, "user-1");
          strictEqual(plain.action, "sign-in");
        })
      )
    )
  );

  effect("preserves outer annotations and metric tags for nested contexts", () =>
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
            strictEqual(plain.requestId, "req-42");
            strictEqual(plain.step, "inner");

            const context = yield* FiberRef.get(handlerFiberRef);
            strictEqual(context.annotations.requestId, "req-42");
            strictEqual(context.metricTags.plugin, "sign-in");
          })
        )
      )
    )
  );

  effect("applies metric tags when recording metrics", () =>
    withCleanContext(
      withRequestContext({ metricTags: { plugin: "auth" } })(
        Effect.gen(function* () {
          const counter = Metric.counter("request_context_metric");
          yield* Metric.increment(counter);

          const state = yield* Metric.value(counter);
          strictEqual(state.count, 1);
        })
      )
    )
  );
});
