import { tokenCount } from "@beep/nlp/Core/Tokenization";
import { NLPAppLive } from "@beep/nlp/Layers/index";
import { WinkEngine } from "@beep/nlp/Wink/WinkEngine";
import { Effect, Layer } from "effect";
import { describe, expect, it } from "vitest";

const provideScopedLayer =
  <ROut, E2, RIn>(layer: Layer.Layer<ROut, E2, RIn>) =>
  <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E | E2, RIn | Exclude<R, ROut>> =>
    Effect.scoped(Layer.build(layer).pipe(Effect.flatMap((context) => effect.pipe(Effect.provide(context)))));

describe("Layers", () => {
  it("provides the legacy NLP app bundle with engine and tokenization access", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const result = yield* Effect.gen(function* () {
          const engine = yield* WinkEngine;
          const count = yield* tokenCount("Ada wrote code.");
          const its = yield* engine.its;

          return {
            count,
            hasIts: typeof its === "object",
          };
        }).pipe(provideScopedLayer(NLPAppLive));

        expect(result.count).toBe(4);
        expect(result.hasIts).toBe(true);
      })
    ));
});
