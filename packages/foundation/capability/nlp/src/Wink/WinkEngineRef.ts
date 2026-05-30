/**
 * Compatibility service exposing the shared live wink runtime ref.
 *
 * @since 0.0.0
 * @packageDocumentation
 */

import { $NlpId } from "@beep/identity";
import { Context, Effect, Layer, Ref } from "effect";
import {
  InstanceId as InstanceIdService,
  WinkEngine as WinkEngineService,
  WinkEngineState as WinkEngineStateService,
} from "./WinkEngine.ts";
import type { WinkEngineRuntimeState as WinkEngineRuntimeStateType } from "./WinkEngine.ts";
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
 * Compatibility service for reading the live wink runtime ref and updating custom entities.
 *
 * @remarks
 * Prefer {@link WinkEngineRef} when code needs stable access to the shared `Ref`
 * itself, such as cache invalidation or compatibility bridges. For normal NLP
 * operations use the higher-level `WinkEngine` service.
 *
 * @example
 * ```ts
 * import { Effect, Layer, Ref } from "effect"
 * import { WinkEngineLive } from "@beep/nlp/Wink/WinkEngine"
 * import { WinkEngineRef, WinkEngineRefLive } from "@beep/nlp/Wink/WinkEngineRef"
 *
 * const program = Effect.gen(function* () {
 *   const ref = yield* WinkEngineRef
 *   const stateRef = ref.getRef()
 *   const state = yield* Ref.get(stateRef)
 *   return state.instanceId
 * })
 *
 * Effect.runPromise(
 *   program.pipe(Effect.provide(WinkEngineRefLive.pipe(Layer.provide(WinkEngineLive))))
 * ).then(console.log)
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export class WinkEngineRef extends Context.Service<WinkEngineRef, WinkEngineRefShape>()($I`WinkEngineRef`) {}

/**
 * Live compatibility layer backed by the shared wink engine runtime.
 *
 * @example
 * ```ts
 * import { Effect, Layer, Ref } from "effect"
 * import { WinkEngineLive } from "@beep/nlp/Wink/WinkEngine"
 * import { WinkEngineRef, WinkEngineRefLive } from "@beep/nlp/Wink/WinkEngineRef"
 *
 * const readInstance = Effect.gen(function* () {
 *   const ref = yield* WinkEngineRef
 *   const state = yield* Ref.get(ref.getRef())
 *   return state.instanceId
 * })
 *
 * Effect.runPromise(
 *   readInstance.pipe(Effect.provide(WinkEngineRefLive.pipe(Layer.provide(WinkEngineLive))))
 * ).then(console.log)
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const WinkEngineRefLive = Layer.effect(WinkEngineRef, makeWinkEngineRef);

/**
 * Runtime state stored inside the shared wink engine ref.
 *
 * @example
 * ```ts
 * import { Effect, Layer, Ref } from "effect"
 * import type { WinkEngineRuntimeState } from "@beep/nlp/Wink/WinkEngineRef"
 * import { WinkEngineLive } from "@beep/nlp/Wink/WinkEngine"
 * import { WinkEngineRef, WinkEngineRefLive } from "@beep/nlp/Wink/WinkEngineRef"
 *
 * const readState = Effect.gen(function* () {
 *   const ref = yield* WinkEngineRef
 *   return yield* Ref.get(ref.getRef())
 * }).pipe(Effect.provide(WinkEngineRefLive.pipe(Layer.provide(WinkEngineLive))))
 *
 * Effect.runPromise(readState).then((state) => console.log(state.instanceId))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type WinkEngineRuntimeState = WinkEngineRuntimeStateType;
/**
 * Branded schema for live wink engine instance identifiers.
 *
 * @example
 * ```ts
 * import { InstanceId } from "@beep/nlp/Wink/WinkEngineRef"
 *
 * const instanceId = InstanceId.make("wink-engine-example-1")
 * console.log(instanceId)
 * ```
 *
 * @category identifiers
 * @since 0.0.0
 */
export const InstanceId = InstanceIdService;
/**
 * Serializable schema for wink engine state metadata.
 *
 * @example
 * ```ts
 * import * as O from "effect/Option"
 * import { InstanceId, WinkEngineState } from "@beep/nlp/Wink/WinkEngineRef"
 *
 * const state = WinkEngineState.make({
 *   customEntities: O.none(),
 *   instanceId: InstanceId.make("wink-engine-example-1")
 * })
 *
 * console.log(state.instanceId)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const WinkEngineState = WinkEngineStateService;
