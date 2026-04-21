/**
 * Wink runtime integrations.
 *
 * @since 0.0.0
 */

import { WinkLayerAllLive as WinkLayerAllLiveSource, WinkLayerLive as WinkLayerLiveSource } from "./Layer.ts";
import { WinkEngineRefLive as WinkEngineRefLiveSource, WinkEngineRef as WinkEngineRefSource } from "./WinkEngineRef.ts";

/**
 * @example
 * ```ts
 * import { WinkLayerAllLive } from "@beep/nlp/Wink"
 *
 * console.log(WinkLayerAllLive)
 * ```
 *
 * @since 0.0.0
 * @category exports
 */
export const WinkLayerAllLive = WinkLayerAllLiveSource;
/**
 * @example
 * ```ts
 * import { WinkLayerLive } from "@beep/nlp/Wink"
 *
 * console.log(WinkLayerLive)
 * ```
 *
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
 * @example
 * ```ts
 * import { WinkEngineRef } from "@beep/nlp/Wink"
 *
 * console.log(WinkEngineRef)
 * ```
 *
 * @since 0.0.0
 * @category exports
 */
export const WinkEngineRef = WinkEngineRefSource;
/**
 * @example
 * ```ts
 * import { WinkEngineRefLive } from "@beep/nlp/Wink"
 *
 * console.log(WinkEngineRefLive)
 * ```
 *
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
