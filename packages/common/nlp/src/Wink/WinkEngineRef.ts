/**
 * Compatibility service exposing the shared live wink runtime ref.
 *
 * @since 0.0.0
 * @module @beep/nlp/Wink/WinkEngineRef
 */

import { $NlpId } from "@beep/identity";
import { Effect, Layer, Ref, ServiceMap } from "effect";
import { WinkEngine, type WinkEngineRuntimeState } from "./WinkEngine.ts";
import type { WinkEntityError } from "./WinkErrors.ts";
import type { WinkEngineCustomEntities } from "./WinkPattern.ts";

const $I = $NlpId.create("Wink/WinkEngineRef");

type WinkEngineRefShape = {
  readonly getRef: () => Ref.Ref<WinkEngineRuntimeState>;
  readonly updateWithCustomEntities: (
    customEntities: WinkEngineCustomEntities
  ) => Effect.Effect<WinkEngineRuntimeState, WinkEntityError>;
};

const makeWinkEngineRef = Effect.gen(function* () {
  const engine = yield* WinkEngine;
  const stateRef = yield* engine.getRef;

  return WinkEngineRef.of({
    getRef: () => stateRef,
    updateWithCustomEntities: Effect.fn("Nlp.Wink.WinkEngineRef.updateWithCustomEntities")(function* (
      customEntities: WinkEngineCustomEntities
    ) {
      yield* engine.learnCustomEntities(customEntities);
      return yield* Ref.get(stateRef);
    }),
  });
}).pipe(Effect.withSpan("Nlp.Wink.WinkEngineRef.make"));

/**
 * Compatibility service for inspecting and updating the shared wink runtime state ref.
 *
 * @since 0.0.0
 * @category Services
 */
export class WinkEngineRef extends ServiceMap.Service<WinkEngineRef, WinkEngineRefShape>()($I`WinkEngineRef`) {}

/**
 * Live layer for {@link WinkEngineRef}.
 *
 * @since 0.0.0
 * @category Layers
 */
export const WinkEngineRefLive = Layer.effect(WinkEngineRef, makeWinkEngineRef);

export type { WinkEngineRuntimeState } from "./WinkEngine.ts";
export { InstanceId, WinkEngineState } from "./WinkEngine.ts";
