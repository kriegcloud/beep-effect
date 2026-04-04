/**
 * Wink layer composition helpers.
 *
 * @since 0.0.0
 * @module @beep/nlp/Wink/Layer
 */

import { Layer } from "effect";
import { WinkCorpusManagerLive } from "./WinkCorpusManager.ts";
import { WinkEngine, WinkEngineLive } from "./WinkEngine.ts";
import { WinkEngineRefLive } from "./WinkEngineRef.ts";
import { WinkSimilarityLive } from "./WinkSimilarity.ts";
import { WinkTokenization, WinkTokenizationLive } from "./WinkTokenizer.ts";
import { WinkUtilsLive } from "./WinkUtils.ts";
import { WinkVectorizerLive } from "./WinkVectorizer.ts";

/**
 * Live wink layer bundle for the currently ported runtime surface.
 *
 * @since 0.0.0
 * @category Layers
 */
export const WinkLayerLive = WinkTokenization.pipe(Layer.provideMerge(WinkEngineLive));

const WinkEngineBackedLive = Layer.mergeAll(WinkTokenization, WinkVectorizerLive).pipe(
  Layer.provideMerge(WinkEngineLive)
);

const WinkLayerCoreLive = Layer.mergeAll(WinkEngineBackedLive, WinkSimilarityLive, WinkUtilsLive);

const WinkLayerSharedLive = WinkEngineRefLive.pipe(Layer.provideMerge(WinkLayerCoreLive));

/**
 * Full live wink layer bundle including corpus management.
 *
 * @since 0.0.0
 * @category Layers
 */
export const WinkLayerAllLive = WinkCorpusManagerLive.pipe(Layer.provideMerge(WinkLayerSharedLive));

export {
  WinkCorpusManagerLive,
  WinkEngine,
  WinkEngineLive,
  WinkEngineRefLive,
  WinkSimilarityLive,
  WinkTokenization,
  WinkTokenizationLive,
  WinkUtilsLive,
  WinkVectorizerLive,
};
