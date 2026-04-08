/**
 * Wink runtime integrations.
 *
 * @since 0.0.0
 */

import { WinkLayerAllLive as WinkLayerAllLiveSource, WinkLayerLive as WinkLayerLiveSource } from "./Layer.ts";
import { WinkEngineRefLive as WinkEngineRefLiveSource, WinkEngineRef as WinkEngineRefSource } from "./WinkEngineRef.ts";

/**
 * @since 0.0.0
 * @category exports
 */
export const WinkLayerAllLive = WinkLayerAllLiveSource;
/**
 * @since 0.0.0
 * @category exports
 */
export const WinkLayerLive = WinkLayerLiveSource;
/**
 * @since 0.0.0
 * @category exports
 */
export * from "./WinkCorpusManager.ts";
/**
 * @since 0.0.0
 * @category exports
 */
export * from "./WinkEngine.ts";
/**
 * @since 0.0.0
 * @category exports
 */
export const WinkEngineRef = WinkEngineRefSource;
/**
 * @since 0.0.0
 * @category exports
 */
export const WinkEngineRefLive = WinkEngineRefLiveSource;
/**
 * @since 0.0.0
 * @category exports
 */
export * from "./WinkErrors.ts";
/**
 * @since 0.0.0
 * @category exports
 */
export * from "./WinkPattern.ts";
/**
 * @since 0.0.0
 * @category exports
 */
export * from "./WinkSimilarity.ts";
/**
 * @since 0.0.0
 * @category exports
 */
export * from "./WinkTokenizer.ts";
/**
 * @since 0.0.0
 * @category exports
 */
export * from "./WinkUtils.ts";
/**
 * @since 0.0.0
 * @category exports
 */
export * from "./WinkVectorizer.ts";
