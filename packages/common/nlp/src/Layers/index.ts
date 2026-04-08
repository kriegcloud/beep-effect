/**
 * Compatibility layer composition helpers for the ported NLP package.
 *
 * @since 0.0.0
 * @module @beep/nlp/Layers
 */

import { Layer } from "effect";
import { WinkEngineLive as WinkEngineLiveService, WinkEngine as WinkEngineService } from "../Wink/WinkEngine.ts";
import { WinkTokenization } from "../Wink/WinkTokenizer.ts";

/**
 * Base runtime layer exposing the shared wink engine service.
 *
 * @since 0.0.0
 * @category Layers
 */
export const NLPBaseLive = WinkEngineLiveService;

/**
 * Tokenization module layer exposing both the wink engine and tokenization service.
 *
 * @since 0.0.0
 * @category Layers
 */
export const TokenizationModuleLive = WinkTokenization.pipe(Layer.provideMerge(WinkEngineLiveService));

/**
 * Compatibility application layer matching the legacy tokenization-focused bundle.
 *
 * @since 0.0.0
 * @category Layers
 */
export const NLPAppLive = TokenizationModuleLive;

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
