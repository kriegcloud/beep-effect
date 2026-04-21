/**
 * Compatibility layer composition helpers for the ported NLP package.
 *
 * @since 0.0.0
 * @module
 */

import { Layer } from "effect";
import { WinkTokenization } from "../Wink/index.ts";
import { WinkEngineLive as WinkEngineLiveService, WinkEngine as WinkEngineService } from "../Wink/WinkEngine.ts";

/**
 * Base runtime layer exposing the shared wink engine service.
 *
 * @example
 * ```ts
 * import { NLPBaseLive } from "@beep/nlp/Layers"
 *
 * console.log(NLPBaseLive)
 * ```
 *
 * @since 0.0.0
 * @category Layers
 */
export const NLPBaseLive = WinkEngineLiveService;

/**
 * Tokenization module layer exposing both the wink engine and tokenization service.
 *
 * @example
 * ```ts
 * import { TokenizationModuleLive } from "@beep/nlp/Layers"
 *
 * console.log(TokenizationModuleLive)
 * ```
 *
 * @since 0.0.0
 * @category Layers
 */
export const TokenizationModuleLive = WinkTokenization.pipe(Layer.provideMerge(WinkEngineLiveService));

/**
 * Compatibility application layer matching the legacy tokenization-focused bundle.
 *
 * @example
 * ```ts
 * import { NLPAppLive } from "@beep/nlp/Layers"
 *
 * console.log(NLPAppLive)
 * ```
 *
 * @since 0.0.0
 * @category Layers
 */
export const NLPAppLive = TokenizationModuleLive;

/**
 * @example
 * ```ts
 * import { WinkEngine } from "@beep/nlp/Layers"
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
 * import { WinkEngineLive } from "@beep/nlp/Layers"
 *
 * console.log(WinkEngineLive)
 * ```
 *
 * @since 0.0.0
 * @category exports
 */
export const WinkEngineLive = WinkEngineLiveService;
