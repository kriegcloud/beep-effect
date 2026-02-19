/**
 * AST symbol extraction pipeline using ts-morph and doctrine.
 * Extracts type-aware symbol metadata from TypeScript source files.
 * @since 0.0.0
 * @packageDocumentation
 */

/**
 * Placeholder for extractor module.
 * @since 0.0.0
 * @category constants
 */
export const EXTRACTOR_MODULE = "extractor" as const;

/**
 * Re-export all JSDoc extraction utilities for convenient module access.
 * @since 0.0.0
 */
export {
  /** @since 0.0.0 */
  extractJsDoc,
  /** @since 0.0.0 */
  extractModuleDoc,
  /** @since 0.0.0 */
  DEFAULT_JSDOC_RESULT,
} from "./JsDocExtractor.js";

/**
 * Re-export the JsDocResult interface type for downstream consumers.
 * @since 0.0.0
 */
export type {
  /** @since 0.0.0 */
  JsDocResult,
} from "./JsDocExtractor.js";

/**
 * Re-export all Effect pattern detection and Schema annotation extraction utilities.
 * @since 0.0.0
 */
export {
  /** @since 0.0.0 */
  detectEffectPattern,
  /** @since 0.0.0 */
  extractSchemaAnnotations,
  /** @since 0.0.0 */
  extractFieldAnnotations,
} from "./EffectPatternDetector.js";

/**
 * Re-export the SchemaAnnotations interface type for downstream consumers.
 * @since 0.0.0
 */
export type {
  /** @since 0.0.0 */
  SchemaAnnotations,
} from "./EffectPatternDetector.js";
