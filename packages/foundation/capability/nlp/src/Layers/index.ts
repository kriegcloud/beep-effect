/**
 * Compatibility layer composition helpers for the ported NLP package.
 *
 * @since 0.0.0
 * @packageDocumentation
 */

import { Layer } from "effect";
import { WinkTokenization } from "../Wink/index.ts";
import { WinkEngineLive as WinkEngineLiveService, WinkEngine as WinkEngineService } from "../Wink/WinkEngine.ts";

/**
 * Base NLP runtime layer that provides the shared wink engine service.
 *
 * @remarks
 * Use this when lower-level modules need direct wink engine access without the
 * tokenization service facade.
 *
 * @example
 * ```ts
 * import { NLPBaseLive } from "@beep/nlp/Layers"
 *
 * const layer = NLPBaseLive
 * console.log(layer)
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const NLPBaseLive = WinkEngineLiveService;

/**
 * Layer bundle for wink-backed tokenization services.
 *
 * @remarks
 * The layer provides the shared wink engine and merges in the tokenization
 * module so callers can run token, sentence, and document tokenization effects.
 *
 * @example
 * ```ts
 * import { TokenizationModuleLive } from "@beep/nlp/Layers"
 *
 * const layer = TokenizationModuleLive
 * console.log(layer)
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const TokenizationModuleLive = WinkTokenization.pipe(Layer.provideMerge(WinkEngineLiveService));

/**
 * Legacy-compatible application layer for the tokenization-focused NLP bundle.
 *
 * @remarks
 * This currently aliases {@link TokenizationModuleLive}; keeping the name lets
 * older composition code depend on a stable application-layer export while the
 * package grows additional modules.
 *
 * @example
 * ```ts
 * import { NLPAppLive } from "@beep/nlp/Layers"
 *
 * const layer = NLPAppLive
 * console.log(layer)
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const NLPAppLive = TokenizationModuleLive;

/**
 * Service tag for direct access to the shared wink engine.
 *
 * @example
 * ```ts
 * import { WinkEngine } from "@beep/nlp/Layers"
 *
 * console.log(WinkEngine.key)
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export const WinkEngine = WinkEngineService;
/**
 * Live layer that initializes and provides the wink engine service.
 *
 * @example
 * ```ts
 * import { WinkEngineLive } from "@beep/nlp/Layers"
 *
 * const layer = WinkEngineLive
 * console.log(layer)
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const WinkEngineLive = WinkEngineLiveService;
