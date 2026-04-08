/**
 * Natural language processing utilities for deterministic tokenization,
 * normalization, and variant generation across identifiers, paths, and queries.
 *
 * @since 0.0.0
 * @module @beep/nlp
 */

/**
 * Package version constant.
 *
 * @example
 * ```typescript
 * import { VERSION } from "@beep/nlp"
 *
 * console.log(VERSION) // "0.0.0"
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const VERSION = "0.0.0";

/**
 * Core NLP models, tokenization, and pattern utilities.
 *
 * @example
 * ```typescript
 * import { Core } from "@beep/nlp"
 *
 * const tokenize = Core.tokenize
 * console.log(tokenize)
 * ```
 *
 * @since 0.0.0
 * @category modules
 */
export * as Core from "./Core/index.ts";
/**
 * Deterministic identifier tokenization and variant helpers.
 *
 * @example
 * ```typescript
 * import { IdentifierText } from "@beep/nlp"
 *
 * const result = IdentifierText.tokens("myVariable")
 * console.log(result) // ["my", "variable"]
 * ```
 *
 * @since 0.0.0
 * @category modules
 */
export * as IdentifierText from "./IdentifierText.ts";
/**
 * Layer composition helpers for the NLP runtime.
 *
 * @example
 * ```typescript
 * import { Layers } from "@beep/nlp"
 *
 * const liveLayer = Layers.NLPAppLive
 * console.log(liveLayer)
 * ```
 *
 * @since 0.0.0
 * @category modules
 */
export * as Layers from "./Layers/index.ts";
/**
 * Deterministic path and module-specifier normalization helpers.
 *
 * @example
 * ```typescript
 * import { PathText } from "@beep/nlp"
 *
 * const normalized = PathText.normalizePathPhrase("src\\utils")
 * console.log(normalized) // "src/utils"
 * ```
 *
 * @since 0.0.0
 * @category modules
 */
export * as PathText from "./PathText.ts";
/**
 * Deterministic query-text normalization helpers.
 *
 * @example
 * ```typescript
 * import { QueryText } from "@beep/nlp"
 *
 * const normalized = QueryText.normalizeQuestion("  hello   world  ")
 * console.log(normalized) // "hello world"
 * ```
 *
 * @since 0.0.0
 * @category modules
 */
export * as QueryText from "./QueryText.ts";
/**
 * NLP AI tool schemas and corpus utilities.
 *
 * @example
 * ```typescript
 * import { Tools } from "@beep/nlp"
 *
 * const tokenizeTool = Tools.Tokenize
 * console.log(tokenizeTool.name)
 * ```
 *
 * @since 0.0.0
 * @category modules
 */
export * as Tools from "./Tools/index.ts";
/**
 * Ordered string-variant deduplication helpers.
 *
 * @example
 * ```typescript
 * import { VariantText } from "@beep/nlp"
 *
 * const deduped = VariantText.orderedDedupe(["foo", "bar", "foo"])
 * console.log(deduped) // ["foo", "bar"]
 * ```
 *
 * @since 0.0.0
 * @category modules
 */
export * as VariantText from "./VariantText.ts";
/**
 * Wink NLP engine runtime integrations.
 *
 * @example
 * ```typescript
 * import { Wink } from "@beep/nlp"
 *
 * const liveLayer = Wink.WinkEngineLive
 * console.log(liveLayer)
 * ```
 *
 * @since 0.0.0
 * @category modules
 */
export * as Wink from "./Wink/index.ts";
