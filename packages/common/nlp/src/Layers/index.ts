/**
 * Compatibility layer composition helpers for the ported NLP package.
 *
 * @since 0.0.0
 * @module @beep/nlp/Layers
 */

import { Layer } from "effect";
import { WinkEngine, WinkEngineLive } from "../Wink/WinkEngine.ts";
import { WinkTokenization } from "../Wink/WinkTokenizer.ts";

/**
 * Base runtime layer exposing the shared wink engine service.
 *
 * @since 0.0.0
 * @category Layers
 */
export const NLPBaseLive = WinkEngineLive;

/**
 * Tokenization module layer exposing both the wink engine and tokenization service.
 *
 * @since 0.0.0
 * @category Layers
 */
export const TokenizationModuleLive = WinkTokenization.pipe(Layer.provideMerge(WinkEngineLive));

/**
 * Compatibility application layer matching the legacy tokenization-focused bundle.
 *
 * @since 0.0.0
 * @category Layers
 */
export const NLPAppLive = TokenizationModuleLive;

export { WinkEngine, WinkEngineLive };
