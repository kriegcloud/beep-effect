/**
 * Wink layer composition helpers.
 *
 * @since 0.0.0
 * @module \@beep/nlp/Wink/Layer
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
 * @since 0.0.0
 * @category Layers
 */
export const WinkLayerAllLive = WinkCorpusManagerLiveService.pipe(Layer.provideMerge(WinkLayerSharedLive));

/**
 * @since 0.0.0
 * @category exports
 */
export const WinkCorpusManagerLive = WinkCorpusManagerLiveService;
/**
 * @since 0.0.0
 * @category exports
 */
export const WinkEngine = WinkEngineService;
/**
 * @since 0.0.0
 * @category exports
 */
export const WinkEngineLive = WinkEngineLiveService;
/**
 * @since 0.0.0
 * @category exports
 */
export const WinkEngineRefLive = WinkEngineRefLiveService;
/**
 * @since 0.0.0
 * @category exports
 */
export const WinkSimilarityLive = WinkSimilarityLiveService;
/**
 * @since 0.0.0
 * @category exports
 */
export const WinkTokenization = WinkTokenizationService;
/**
 * @since 0.0.0
 * @category exports
 */
export const WinkTokenizationLive = WinkTokenizationLiveService;
/**
 * @since 0.0.0
 * @category exports
 */
export const WinkUtilsLive = WinkUtilsLiveService;
/**
 * @since 0.0.0
 * @category exports
 */
export const WinkVectorizerLive = WinkVectorizerLiveService;
