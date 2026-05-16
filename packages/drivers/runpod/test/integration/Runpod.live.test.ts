import { Runpod } from "@beep/runpod";
import { A } from "@beep/utils";
import { describe, expect, it } from "@effect/vitest";
import { Config, Effect, Layer } from "effect";
import * as O from "effect/Option";

const provideScopedLayer =
  <ROut, E2, RIn>(layer: Layer.Layer<ROut, E2, RIn>) =>
  <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E | E2, RIn | Exclude<R, ROut>> =>
    Effect.scoped(Layer.build(layer).pipe(Effect.flatMap((context) => effect.pipe(Effect.provide(context)))));

describe("@beep/runpod live", () => {
  it.effect("lists pods when RUNPOD_API_KEY is configured", () =>
    Effect.gen(function* () {
      const apiKey = yield* Config.redacted("RUNPOD_API_KEY").pipe(Config.option);
      if (O.isNone(apiKey)) {
        return;
      }

      const runpod = yield* Runpod;
      const pods = yield* runpod.listPods();
      expect(A.isReadonlyArray(pods)).toBe(true);
    }).pipe(provideScopedLayer(Runpod.layer))
  );

  it.effect("fetches the unauthenticated OpenAPI document", () =>
    Effect.gen(function* () {
      const apiKey = yield* Config.redacted("RUNPOD_API_KEY").pipe(Config.option);
      if (O.isNone(apiKey)) {
        return;
      }

      const runpod = yield* Runpod;
      const openApi = yield* runpod.getOpenAPI();
      expect(openApi).toHaveProperty("openapi");
    }).pipe(provideScopedLayer(Runpod.layer))
  );
});
