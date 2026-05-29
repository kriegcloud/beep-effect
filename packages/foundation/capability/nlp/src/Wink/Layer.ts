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
 * Live wink layer bundle for the currently ported runtime surface.
 *
 * @example
 * ```ts
 * import { WinkLayerLive } from "@beep/nlp/Wink/Layer"
 *
 * console.log(WinkLayerLive)
 * ```
 *
 * @since 0.0.0
 * @category layers
 */
export const WinkLayerLive = WinkTokenizationService.pipe(Layer.provideMerge(WinkEngineLiveService));

const WinkEngineBackedLive = Layer.mergeAll(WinkTokenizationService, WinkVectorizerLiveService).pipe(
  Layer.provideMerge(WinkEngineLiveService)
);

const WinkLayerCoreLive = Layer.mergeAll(WinkEngineBackedLive, WinkSimilarityLiveService, WinkUtilsLiveService);

const WinkLayerSharedLive = WinkEngineRefLiveService.pipe(Layer.provideMerge(WinkLayerCoreLive));

/**
 * Full live wink layer bundle including corpus management.
 *
 * @example
 * ```ts
 * import { WinkLayerAllLive } from "@beep/nlp/Wink/Layer"
 *
 * console.log(WinkLayerAllLive)
 * ```
 *
 * @since 0.0.0
 * @category layers
 */
export const WinkLayerAllLive = WinkCorpusManagerLiveService.pipe(Layer.provideMerge(WinkLayerSharedLive));

/**
 * Wink corpus manager live layer.
 *
 * @example
 * ```ts
 * import { WinkCorpusManagerLive } from "@beep/nlp/Wink/Layer"
 *
 * console.log(WinkCorpusManagerLive)
 * ```
 *
 * @since 0.0.0
 * @category layers
 */
export const WinkCorpusManagerLive = WinkCorpusManagerLiveService;
/**
 * Wink engine service.
 *
 * @example
 * ```ts
 * import { WinkEngine } from "@beep/nlp/Wink/Layer"
 *
 * console.log(WinkEngine)
 * ```
 *
 * @since 0.0.0
 * @category services
 */
export const WinkEngine = WinkEngineService;
/**
 * Wink engine live layer.
 *
 * @example
 * ```ts
 * import { WinkEngineLive } from "@beep/nlp/Wink/Layer"
 *
 * console.log(WinkEngineLive)
 * ```
 *
 * @since 0.0.0
 * @category layers
 */
export const WinkEngineLive = WinkEngineLiveService;
/**
 * Wink engine ref live layer.
 *
 * @example
 * ```ts
 * import { WinkEngineRefLive } from "@beep/nlp/Wink/Layer"
 *
 * console.log(WinkEngineRefLive)
 * ```
 *
 * @since 0.0.0
 * @category layers
 */
export const WinkEngineRefLive = WinkEngineRefLiveService;
/**
 * Wink similarity live layer.
 *
 * @example
 * ```ts
 * import { WinkSimilarityLive } from "@beep/nlp/Wink/Layer"
 *
 * console.log(WinkSimilarityLive)
 * ```
 *
 * @since 0.0.0
 * @category layers
 */
export const WinkSimilarityLive = WinkSimilarityLiveService;
/**
 * Wink tokenization layer.
 *
 * @example
 * ```ts
 * import { WinkTokenization } from "@beep/nlp/Wink/Layer"
 *
 * console.log(WinkTokenization)
 * ```
 *
 * @since 0.0.0
 * @category layers
 */
export const WinkTokenization = WinkTokenizationService;
/**
 * Wink tokenization live layer.
 *
 * @example
 * ```ts
 * import { WinkTokenizationLive } from "@beep/nlp/Wink/Layer"
 *
 * console.log(WinkTokenizationLive)
 * ```
 *
 * @since 0.0.0
 * @category layers
 */
export const WinkTokenizationLive = WinkTokenizationLiveService;
/**
 * Wink utils live layer.
 *
 * @example
 * ```ts
 * import { WinkUtilsLive } from "@beep/nlp/Wink/Layer"
 *
 * console.log(WinkUtilsLive)
 * ```
 *
 * @since 0.0.0
 * @category layers
 */
export const WinkUtilsLive = WinkUtilsLiveService;
/**
 * Wink vectorizer live layer.
 *
 * @example
 * ```ts
 * import { WinkVectorizerLive } from "@beep/nlp/Wink/Layer"
 *
 * console.log(WinkVectorizerLive)
 * ```
 *
 * @since 0.0.0
 * @category layers
 */
export const WinkVectorizerLive = WinkVectorizerLiveService;
