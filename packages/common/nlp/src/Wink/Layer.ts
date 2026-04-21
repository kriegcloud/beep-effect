/**
 * Wink layer composition helpers.
 *
 * @since 0.0.0
 * @module
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
 * @category Layers
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
 * @category Layers
 */
export const WinkLayerAllLive = WinkCorpusManagerLiveService.pipe(Layer.provideMerge(WinkLayerSharedLive));

/**
 * @example
 * ```ts
 * import { WinkCorpusManagerLive } from "@beep/nlp/Wink/Layer"
 *
 * console.log(WinkCorpusManagerLive)
 * ```
 *
 * @since 0.0.0
 * @category exports
 */
export const WinkCorpusManagerLive = WinkCorpusManagerLiveService;
/**
 * @example
 * ```ts
 * import { WinkEngine } from "@beep/nlp/Wink/Layer"
 *
 * console.log(WinkEngine)
 * ```
 *
 * @since 0.0.0
 * @category exports
 */
export const WinkEngine = WinkEngineService;
/**
 * @example
 * ```ts
 * import { WinkEngineLive } from "@beep/nlp/Wink/Layer"
 *
 * console.log(WinkEngineLive)
 * ```
 *
 * @since 0.0.0
 * @category exports
 */
export const WinkEngineLive = WinkEngineLiveService;
/**
 * @example
 * ```ts
 * import { WinkEngineRefLive } from "@beep/nlp/Wink/Layer"
 *
 * console.log(WinkEngineRefLive)
 * ```
 *
 * @since 0.0.0
 * @category exports
 */
export const WinkEngineRefLive = WinkEngineRefLiveService;
/**
 * @example
 * ```ts
 * import { WinkSimilarityLive } from "@beep/nlp/Wink/Layer"
 *
 * console.log(WinkSimilarityLive)
 * ```
 *
 * @since 0.0.0
 * @category exports
 */
export const WinkSimilarityLive = WinkSimilarityLiveService;
/**
 * @example
 * ```ts
 * import { WinkTokenization } from "@beep/nlp/Wink/Layer"
 *
 * console.log(WinkTokenization)
 * ```
 *
 * @since 0.0.0
 * @category exports
 */
export const WinkTokenization = WinkTokenizationService;
/**
 * @example
 * ```ts
 * import { WinkTokenizationLive } from "@beep/nlp/Wink/Layer"
 *
 * console.log(WinkTokenizationLive)
 * ```
 *
 * @since 0.0.0
 * @category exports
 */
export const WinkTokenizationLive = WinkTokenizationLiveService;
/**
 * @example
 * ```ts
 * import { WinkUtilsLive } from "@beep/nlp/Wink/Layer"
 *
 * console.log(WinkUtilsLive)
 * ```
 *
 * @since 0.0.0
 * @category exports
 */
export const WinkUtilsLive = WinkUtilsLiveService;
/**
 * @example
 * ```ts
 * import { WinkVectorizerLive } from "@beep/nlp/Wink/Layer"
 *
 * console.log(WinkVectorizerLive)
 * ```
 *
 * @since 0.0.0
 * @category exports
 */
export const WinkVectorizerLive = WinkVectorizerLiveService;
