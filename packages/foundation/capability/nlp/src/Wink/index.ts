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
 * @category layers
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
 * @category layers
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
 * @example
 * ```ts
 * import { WinkEngineRef } from "@beep/nlp/Wink"
 *
 * console.log(WinkEngineRef)
 * ```
 *
 * @since 0.0.0
 * @category services
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
 * @category layers
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
