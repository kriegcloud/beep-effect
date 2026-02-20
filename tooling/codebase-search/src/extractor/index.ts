/**
 * AST symbol extraction pipeline using ts-morph and doctrine.
 * Extracts type-aware symbol metadata from TypeScript source files.
 *
 * @since 0.0.0
 * @packageDocumentation
 * @category codebase-search
 */

/**
 * Extractor module identifier.
 *
 * @since 0.0.0
 * @category constants
 */
export const EXTRACTOR_MODULE = "extractor" as const;

/**
 * Re-export Effect pattern detection and annotation extraction APIs.
 *
 * @since 0.0.0
 */
export * from "./EffectPatternDetector.js";

/**
 * Re-export file scanning and hash-diff extraction APIs.
 *
 * @since 0.0.0
 */
export * from "./FileScanner.js";

/**
 * Re-export JSDoc parsing and module-doc extraction APIs.
 *
 * @since 0.0.0
 */
export * from "./JsDocExtractor.js";

/**
 * Re-export symbol assembly and import-resolution APIs.
 *
 * @since 0.0.0
 */
export * from "./SymbolAssembler.js";
