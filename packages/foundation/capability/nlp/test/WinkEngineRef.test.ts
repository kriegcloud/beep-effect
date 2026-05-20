import { WinkEngine, WinkEngineLive } from "@beep/nlp/Wink/WinkEngine";
import { WinkEngineRef, WinkEngineRefLive } from "@beep/nlp/Wink/WinkEngineRef";
import { CustomEntityExample, EntityGroupName, WinkEngineCustomEntities } from "@beep/nlp/Wink/WinkPattern";
import { A } from "@beep/utils";
import { Effect, Layer, Ref } from "effect";
import * as O from "effect/Option";
import { describe, expect, it } from "vitest";

const provideScopedLayer =
  <ROut, E2, RIn>(layer: Layer.Layer<ROut, E2, RIn>) =>
  <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E | E2, RIn | Exclude<R, ROut>> =>
    Effect.scoped(Layer.build(layer).pipe(Effect.flatMap((context) => effect.pipe(Effect.provide(context)))));

const WinkEngineRefBundleLive = WinkEngineRefLive.pipe(Layer.provideMerge(WinkEngineLive));

const moneyEntities = new WinkEngineCustomEntities({
  name: EntityGroupName.make("money"),
  patterns: [
    new CustomEntityExample({
      mark: O.none(),
      name: "MONEY_PATTERN",
      patterns: ["[$]", "[100|200]"],
    }),
  ],
});

describe("WinkEngineRef", () => {
  it("returns one shared ref instance per provided live layer", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const refService1 = yield* WinkEngineRef;
        const refService2 = yield* WinkEngineRef;
        const ref1 = refService1.getRef();
        const ref2 = refService2.getRef();

        expect(ref1).toBe(ref2);

        const state1 = yield* Ref.get(ref1);
        const state2 = yield* Ref.get(ref2);

        expect(state1.instanceId).toBe(state2.instanceId);
      }).pipe(provideScopedLayer(WinkEngineRefBundleLive))
    ));

  it("tracks engine updates through the shared runtime ref", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const engine = yield* WinkEngine;
        const refService = yield* WinkEngineRef;
        const stateRef = refService.getRef();
        const initialState = yield* Ref.get(stateRef);

        yield* engine.learnCustomEntities(moneyEntities);

        const updatedState = yield* Ref.get(stateRef);
        const tokens = yield* engine.getWinkTokens("I have $100 today.");

        expect(updatedState.instanceId).not.toBe(initialState.instanceId);
        expect(updatedState.customEntities._tag).toBe("Some");
        expect(O.getOrThrow(updatedState.customEntities).name).toBe("money");
        expect(A.map(tokens, (token) => token.out())).toContain("$");
      }).pipe(provideScopedLayer(WinkEngineRefBundleLive))
    ));
});
