/**
 * Compatibility service exposing the shared live wink runtime ref.
 *
 * @since 0.0.0
 * @module
 */

import { $NlpId } from "@beep/identity";
import { Context, Effect, Layer, Ref } from "effect";
import {
  InstanceId as InstanceIdService,
  type WinkEngineRuntimeState as WinkEngineRuntimeStateType,
  WinkEngine as WinkEngineService,
  WinkEngineState as WinkEngineStateService,
} from "./WinkEngine.ts";
import type { WinkEntityError } from "./WinkErrors.ts";
import type { WinkEngineCustomEntities } from "./WinkPattern.ts";

const $I = $NlpId.create("Wink/WinkEngineRef");

type WinkEngineRefShape = {
  readonly getRef: () => Ref.Ref<WinkEngineRuntimeStateType>;
  readonly updateWithCustomEntities: (
    customEntities: WinkEngineCustomEntities
  ) => Effect.Effect<WinkEngineRuntimeStateType, WinkEntityError>;
};

const makeWinkEngineRef = Effect.gen(function* () {
  const engine = yield* WinkEngineService;
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
export class WinkEngineRef extends Context.Service<WinkEngineRef, WinkEngineRefShape>()($I`WinkEngineRef`) {}

/**
 * Live layer for {@link WinkEngineRef}.
 *
 * @since 0.0.0
 * @category Layers
 */
export const WinkEngineRefLive = Layer.effect(WinkEngineRef, makeWinkEngineRef);

/**
 * @since 0.0.0
 * @category exports
 */
export type WinkEngineRuntimeState = WinkEngineRuntimeStateType;
/**
 * @since 0.0.0
 * @category exports
 */
export const InstanceId = InstanceIdService;
/**
 * @since 0.0.0
 * @category exports
 */
export const WinkEngineState = WinkEngineStateService;
