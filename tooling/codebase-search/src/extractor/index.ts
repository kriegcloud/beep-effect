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

/**
 * Re-export all Symbol Assembler utilities for merging extraction results
 * into complete IndexedSymbol records.
 * @since 0.0.0
 */
export {
  /** @since 0.0.0 */
  assembleSymbols,
  /** @since 0.0.0 */
  resolveImports,
  /** @since 0.0.0 */
  resolveModuleName,
  /** @since 0.0.0 */
  extractSignature,
} from "./SymbolAssembler.js";

/**
 * Re-export all File Scanner utilities for filesystem scanning and
 * content hash change detection.
 * @since 0.0.0
 */
export {
  /** @since 0.0.0 */
  scanFiles,
  /** @since 0.0.0 */
  saveFileHashes,
  /** @since 0.0.0 */
  computeFileHashes,
  /** @since 0.0.0 */
  FILE_HASHES_PATH,
} from "./FileScanner.js";

/**
 * Re-export File Scanner types for downstream consumers.
 * @since 0.0.0
 */
export type {
  /** @since 0.0.0 */
  FileHash,
  /** @since 0.0.0 */
  ScanResult,
  /** @since 0.0.0 */
  ScanMode,
} from "./FileScanner.js";
