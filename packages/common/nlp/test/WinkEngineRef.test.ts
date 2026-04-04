import { Effect, Layer, Ref } from "effect";
import * as O from "effect/Option";
import { describe, expect, it } from "vitest";
import { WinkEngine, WinkEngineLive } from "../src/Wink/WinkEngine.ts";
import { WinkEngineRef, WinkEngineRefLive } from "../src/Wink/WinkEngineRef.ts";
import { CustomEntityExample, EntityGroupName, WinkEngineCustomEntities } from "../src/Wink/WinkPattern.ts";

const WinkEngineRefBundleLive = WinkEngineRefLive.pipe(Layer.provideMerge(WinkEngineLive));

const moneyEntities = new WinkEngineCustomEntities({
  name: EntityGroupName.makeUnsafe("money"),
  patterns: [
    new CustomEntityExample({
      mark: O.none(),
      name: "MONEY_PATTERN",
      patterns: ["[$]", "[100|200]"],
    }),
  ],
});

describe("WinkEngineRef", () => {
  it("returns one shared ref instance per provided live layer", async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        const refService1 = yield* WinkEngineRef;
        const refService2 = yield* WinkEngineRef;
        const ref1 = refService1.getRef();
        const ref2 = refService2.getRef();

        expect(ref1).toBe(ref2);

        const state1 = yield* Ref.get(ref1);
        const state2 = yield* Ref.get(ref2);

        expect(state1.instanceId).toBe(state2.instanceId);
      }).pipe(Effect.provide(WinkEngineRefBundleLive))
    );
  });

  it("tracks engine updates through the shared runtime ref", async () => {
    await Effect.runPromise(
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
        expect(updatedState.customEntities.value.name).toBe("money");
        expect(tokens.map((token) => token.out())).toContain("$");
      }).pipe(Effect.provide(WinkEngineRefBundleLive))
    );
  });
});
