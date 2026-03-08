/**
 * Wink layer composition utilities.
 */

import { Layer } from "effect";
import { WinkEngine } from "./WinkEngine.js";
import { WinkEngineRefLive } from "./WinkEngineRef.js";
import {
  WinkTokenization,
  WinkTokenizationLive as WinkTokenizationLayerLive,
} from "./WinkTokenizer.js";
import {
  WinkVectorizer,
  WinkVectorizerLive as WinkVectorizerLayerLive,
} from "./WinkVectorizer.js";
import {
  WinkSimilarity,
  WinkSimilarityLive as WinkSimilarityLayerLive,
} from "./WinkSimilarity.js";
import {
  WinkCorpusManager,
  WinkCorpusManagerLive as WinkCorpusManagerLayerLive,
} from "./WinkCorpusManager.js";

const EngineWithRefLive = WinkEngine.Default.pipe(
  Layer.provide(WinkEngineRefLive)
);

export const WinkEngineLive = EngineWithRefLive;

export const WinkTokenizationLive = Layer.provide(
  WinkTokenization,
  EngineWithRefLive
);

export const WinkVectorizerLive = Layer.provide(
  WinkVectorizerLayerLive,
  EngineWithRefLive
);

export const WinkSimilarityLive = Layer.provide(
  WinkSimilarityLayerLive,
  EngineWithRefLive
);

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
  WinkEngine,
  WinkTokenization,
  WinkTokenizationLayerLive,
  WinkVectorizer,
  WinkVectorizerLayerLive,
  WinkSimilarity,
  WinkSimilarityLayerLive,
  WinkCorpusManager,
  WinkCorpusManagerLayerLive,
};

export default WinkLayerLive;
