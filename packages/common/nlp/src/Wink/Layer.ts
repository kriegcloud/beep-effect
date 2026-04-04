/**
 * Wink layer composition utilities.
 */

import { Layer } from "effect";
import { WinkCorpusManager, WinkCorpusManagerLive as WinkCorpusManagerLayerLive } from "./WinkCorpusManager.ts";
import { WinkEngine } from "./WinkEngine.ts";
import { WinkEngineRefLive } from "./WinkEngineRef.ts";
import { WinkSimilarity, WinkSimilarityLive as WinkSimilarityLayerLive } from "./WinkSimilarity.ts";
import { WinkTokenization, WinkTokenizationLive as WinkTokenizationLayerLive } from "./WinkTokenizer.ts";
import { WinkVectorizer, WinkVectorizerLive as WinkVectorizerLayerLive } from "./WinkVectorizer.ts";

const EngineWithRefLive = WinkEngine.Default.pipe(Layer.provide(WinkEngineRefLive));

export const WinkEngineLive = EngineWithRefLive;

export const WinkTokenizationLive = Layer.provide(WinkTokenization, EngineWithRefLive);

export const WinkVectorizerLive = Layer.provide(WinkVectorizerLayerLive, EngineWithRefLive);

export const WinkSimilarityLive = Layer.provide(WinkSimilarityLayerLive, EngineWithRefLive);

export const WinkCorpusManagerLive = WinkCorpusManagerLayerLive;

export const WinkVectorizationLive = Layer.mergeAll(
  WinkEngineLive,
  WinkVectorizerLive,
  WinkSimilarityLive,
  WinkCorpusManagerLive
);

export const WinkBaseLive = WinkEngineLive;

export const WinkLayerLive = Layer.mergeAll(
  WinkEngineLive,
  WinkTokenizationLive,
  WinkVectorizerLive,
  WinkSimilarityLive,
  WinkCorpusManagerLive
);

export const WinkLayerTest = WinkTokenizationLive;

export const WinkNLPLive = WinkLayerLive;

export {
  WinkCorpusManager,
  WinkCorpusManagerLayerLive,
  WinkEngine,
  WinkSimilarity,
  WinkSimilarityLayerLive,
  WinkTokenization,
  WinkTokenizationLayerLive,
  WinkVectorizer,
  WinkVectorizerLayerLive,
};

export default WinkLayerLive;
