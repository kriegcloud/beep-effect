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
 * @since 0.0.0
 */
export * as Core from "./Core/index.ts";
/**
 * @since 0.0.0
 */
export * as IdentifierText from "./IdentifierText.ts";
/**
 * @since 0.0.0
 */
export * as Layers from "./Layers/index.ts";
/**
 * @since 0.0.0
 */
export * as PathText from "./PathText.ts";
/**
 * @since 0.0.0
 */
export * as QueryText from "./QueryText.ts";
/**
 * @since 0.0.0
 */
export * as Tools from "./Tools/index.ts";
/**
 * @since 0.0.0
 */
export * as VariantText from "./VariantText.ts";
/**
 * @since 0.0.0
 */
export * as Wink from "./Wink/index.ts";
