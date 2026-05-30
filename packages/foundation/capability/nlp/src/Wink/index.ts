/**
 * Wink runtime integrations.
 *
 * @since 0.0.0
 */

import { WinkLayerAllLive as WinkLayerAllLiveSource, WinkLayerLive as WinkLayerLiveSource } from "./Layer.ts";
import { WinkEngineRefLive as WinkEngineRefLiveSource, WinkEngineRef as WinkEngineRefSource } from "./WinkEngineRef.ts";

/**
 * Full live Wink integration layer exported from the module entry point.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { WinkCorpusManager, WinkLayerAllLive } from "@beep/nlp/Wink"
 *
 * const createCorpus = Effect.gen(function* () {
 *   const manager = yield* WinkCorpusManager
 *   return yield* manager.createCorpus({ corpusId: "docs" })
 * })
 *
 * Effect.runPromise(createCorpus.pipe(Effect.provide(WinkLayerAllLive))).then((summary) =>
 *   console.log(summary.corpusId)
 * )
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const WinkLayerAllLive = WinkLayerAllLiveSource;
/**
 * Live entry-point layer for the engine-backed tokenization surface.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { Tokenization } from "@beep/nlp/Core"
 * import { WinkLayerLive } from "@beep/nlp/Wink"
 *
 * const tokenize = Effect.gen(function* () {
 *   const tokenization = yield* Tokenization
 *   return yield* tokenization.tokenize("Entry point wink layer.")
 * })
 *
 * Effect.runPromise(tokenize.pipe(Effect.provide(WinkLayerLive))).then((tokens) =>
 *   console.log(tokens.length)
 * )
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const WinkLayerLive = WinkLayerLiveSource;
/**
 * @since 0.0.0
 * @category services
 */
export * from "./WinkCorpusManager.ts";
/**
 * @since 0.0.0
 * @category services
 */
export * from "./WinkEngine.ts";
/**
 * Compatibility service for reading and updating the shared wink engine ref.
 *
 * @example
 * ```ts
 * import { Effect, Layer, Ref } from "effect"
 * import { WinkEngineLive } from "@beep/nlp/Wink/WinkEngine"
 * import { WinkEngineRef, WinkEngineRefLive } from "@beep/nlp/Wink"
 *
 * const readInstanceId = Effect.gen(function* () {
 *   const engineRef = yield* WinkEngineRef
 *   const state = yield* Ref.get(engineRef.getRef())
 *   return state.instanceId
 * })
 *
 * Effect.runPromise(
 *   readInstanceId.pipe(Effect.provide(WinkEngineRefLive.pipe(Layer.provide(WinkEngineLive))))
 * ).then(console.log)
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export const WinkEngineRef = WinkEngineRefSource;
/**
 * Live entry-point layer for {@link WinkEngineRef}.
 *
 * @example
 * ```ts
 * import { Effect, Layer, Ref } from "effect"
 * import { WinkEngineLive } from "@beep/nlp/Wink/WinkEngine"
 * import { WinkEngineRef, WinkEngineRefLive } from "@beep/nlp/Wink"
 *
 * const readState = Effect.gen(function* () {
 *   const engineRef = yield* WinkEngineRef
 *   return yield* Ref.get(engineRef.getRef())
 * })
 *
 * Effect.runPromise(
 *   readState.pipe(Effect.provide(WinkEngineRefLive.pipe(Layer.provide(WinkEngineLive))))
 * ).then((state) => console.log(state.instanceId))
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const WinkEngineRefLive = WinkEngineRefLiveSource;
/**
 * @since 0.0.0
 * @category errors
 */
export * from "./WinkErrors.ts";
/**
 * @since 0.0.0
 * @category models
 */
export * from "./WinkPattern.ts";
/**
 * @since 0.0.0
 * @category services
 */
export * from "./WinkSimilarity.ts";
/**
 * @since 0.0.0
 * @category services
 */
export * from "./WinkTokenizer.ts";
/**
 * @since 0.0.0
 * @category utilities
 */
export * from "./WinkUtils.ts";
/**
 * @since 0.0.0
 * @category services
 */
export * from "./WinkVectorizer.ts";
