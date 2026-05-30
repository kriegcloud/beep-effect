/**
 * Wink layer composition helpers.
 *
 * @since 0.0.0
 * @packageDocumentation
 */

import { Layer } from "effect";
import { WinkCorpusManagerLive as WinkCorpusManagerLiveService } from "./WinkCorpusManager.ts";
import { WinkEngineLive as WinkEngineLiveService, WinkEngine as WinkEngineService } from "./WinkEngine.ts";
import { WinkEngineRefLive as WinkEngineRefLiveService } from "./WinkEngineRef.ts";
import { WinkSimilarityLive as WinkSimilarityLiveService } from "./WinkSimilarity.ts";
import {
  WinkTokenizationLive as WinkTokenizationLiveService,
  WinkTokenization as WinkTokenizationService,
} from "./WinkTokenizer.ts";
import { WinkUtilsLive as WinkUtilsLiveService } from "./WinkUtils.ts";
import { WinkVectorizerLive as WinkVectorizerLiveService } from "./WinkVectorizer.ts";

/**
 * Live layer bundle for the engine-backed tokenization surface.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { Tokenization } from "@beep/nlp/Core"
 * import { WinkLayerLive } from "@beep/nlp/Wink/Layer"
 *
 * const count = Effect.gen(function* () {
 *   const tokenization = yield* Tokenization
 *   return yield* tokenization.tokenCount("Wink tokenizes this sentence.")
 * })
 *
 * Effect.runPromise(count.pipe(Effect.provide(WinkLayerLive))).then(console.log)
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const WinkLayerLive = WinkTokenizationService.pipe(Layer.provideMerge(WinkEngineLiveService));

const WinkEngineBackedLive = Layer.mergeAll(WinkTokenizationService, WinkVectorizerLiveService).pipe(
  Layer.provideMerge(WinkEngineLiveService)
);

const WinkLayerCoreLive = Layer.mergeAll(WinkEngineBackedLive, WinkSimilarityLiveService, WinkUtilsLiveService);

const WinkLayerSharedLive = WinkEngineRefLiveService.pipe(Layer.provideMerge(WinkLayerCoreLive));

/**
 * Full live wink layer bundle including corpus management and shared utilities.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { WinkCorpusManager } from "@beep/nlp/Wink/WinkCorpusManager"
 * import { WinkLayerAllLive } from "@beep/nlp/Wink/Layer"
 *
 * const create = Effect.gen(function* () {
 *   const corpus = yield* WinkCorpusManager
 *   return yield* corpus.createCorpus({ corpusId: "docs" })
 * })
 *
 * Effect.runPromise(create.pipe(Effect.provide(WinkLayerAllLive))).then((summary) =>
 *   console.log(summary.corpusId)
 * )
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const WinkLayerAllLive = WinkCorpusManagerLiveService.pipe(Layer.provideMerge(WinkLayerSharedLive));

/**
 * Live layer for stateful corpus indexing and query services.
 *
 * @example
 * ```ts
 * import { Layer } from "effect"
 * import { WinkCorpusManagerLive, WinkEngineLive, WinkSimilarityLive } from "@beep/nlp/Wink/Layer"
 *
 * const runnable = WinkCorpusManagerLive.pipe(
 *   Layer.provideMerge(Layer.mergeAll(WinkEngineLive, WinkSimilarityLive))
 * )
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const WinkCorpusManagerLive = WinkCorpusManagerLiveService;
/**
 * Service tag for direct access to the underlying wink runtime.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { WinkEngine, WinkEngineLive } from "@beep/nlp/Wink/Layer"
 *
 * const count = Effect.gen(function* () {
 *   const engine = yield* WinkEngine
 *   return yield* engine.getWinkTokenCount("Direct wink engine access.")
 * })
 *
 * Effect.runPromise(count.pipe(Effect.provide(WinkEngineLive))).then(console.log)
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export const WinkEngine = WinkEngineService;
/**
 * Live layer that initializes `wink-nlp` with the English lite web model.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { WinkEngine, WinkEngineLive } from "@beep/nlp/Wink/Layer"
 *
 * const readHelpers = Effect.gen(function* () {
 *   const engine = yield* WinkEngine
 *   return yield* engine.its
 * })
 *
 * Effect.runPromise(readHelpers.pipe(Effect.provide(WinkEngineLive))).then((its) =>
 *   console.log(typeof its.normal)
 * )
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const WinkEngineLive = WinkEngineLiveService;
/**
 * Live layer for compatibility access to the shared wink engine state ref.
 *
 * @example
 * ```ts
 * import { Effect, Layer } from "effect"
 * import { WinkEngineRef } from "@beep/nlp/Wink/WinkEngineRef"
 * import { WinkEngineLive, WinkEngineRefLive } from "@beep/nlp/Wink/Layer"
 *
 * const readRef = Effect.gen(function* () {
 *   const ref = yield* WinkEngineRef
 *   return ref.getRef()
 * })
 *
 * const runnable = readRef.pipe(Effect.provide(WinkEngineRefLive.pipe(Layer.provide(WinkEngineLive))))
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const WinkEngineRefLive = WinkEngineRefLiveService;
/**
 * Live layer for wink-backed vector, set, and bag-of-words similarity.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { WinkSimilarity } from "@beep/nlp/Wink/WinkSimilarity"
 * import { WinkSimilarityLive } from "@beep/nlp/Wink/Layer"
 *
 * const program = Effect.gen(function* () {
 *   const similarity = yield* WinkSimilarity
 *   return similarity
 * })
 *
 * Effect.runPromise(program.pipe(Effect.provide(WinkSimilarityLive))).then((service) =>
 *   console.log(typeof service.vectorCosine)
 * )
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const WinkSimilarityLive = WinkSimilarityLiveService;
/**
 * Engine-dependent layer that implements the core tokenization service.
 *
 * @example
 * ```ts
 * import { Layer } from "effect"
 * import { WinkEngineLive, WinkTokenization } from "@beep/nlp/Wink/Layer"
 *
 * const runnable = WinkTokenization.pipe(Layer.provide(WinkEngineLive))
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const WinkTokenization = WinkTokenizationService;
/**
 * Live tokenization layer with the wink engine already provided.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { Tokenization } from "@beep/nlp/Core"
 * import { WinkTokenizationLive } from "@beep/nlp/Wink/Layer"
 *
 * const program = Effect.gen(function* () {
 *   const tokenization = yield* Tokenization
 *   return yield* tokenization.tokenize("Tokenize this.")
 * })
 *
 * Effect.runPromise(program.pipe(Effect.provide(WinkTokenizationLive))).then((tokens) =>
 *   console.log(tokens.length)
 * )
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const WinkTokenizationLive = WinkTokenizationLiveService;
/**
 * Live layer for `wink-nlp-utils` string and token helper wrappers.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { WinkUtils } from "@beep/nlp/Wink/WinkUtils"
 * import { WinkUtilsLive } from "@beep/nlp/Wink/Layer"
 *
 * const program = Effect.gen(function* () {
 *   const utils = yield* WinkUtils
 *   return yield* utils.removeExtraSpaces("too    much")
 * })
 *
 * Effect.runPromise(program.pipe(Effect.provide(WinkUtilsLive))).then(console.log)
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const WinkUtilsLive = WinkUtilsLiveService;
/**
 * Live layer for BM25 vectorization backed by the wink engine.
 *
 * @example
 * ```ts
 * import { Effect, Layer } from "effect"
 * import { WinkVectorizer } from "@beep/nlp/Wink/WinkVectorizer"
 * import { WinkEngineLive, WinkVectorizerLive } from "@beep/nlp/Wink/Layer"
 *
 * const readConfig = Effect.gen(function* () {
 *   const vectorizer = yield* WinkVectorizer
 *   return yield* vectorizer.getConfig
 * })
 *
 * const runnable = readConfig.pipe(Effect.provide(WinkVectorizerLive.pipe(Layer.provide(WinkEngineLive))))
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const WinkVectorizerLive = WinkVectorizerLiveService;
