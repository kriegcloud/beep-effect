/**
 * Semantic codebase search with vector embeddings, BM25 keyword search,
 * and MCP server integration for Effect v4 monorepos.
 * @since 0.0.0
 * @packageDocumentation
 */

/**
 * Current version of the codebase-search package.
 * @since 0.0.0
 * @category constants
 */
export const VERSION = "0.0.0" as const;

export {
  /**
   * @since 0.0.0
   */
  IndexNotFoundError,
  /**
   * @since 0.0.0
   */
  SymbolNotFoundError,
  /**
   * @since 0.0.0
   */
  EmbeddingModelError,
  /**
   * @since 0.0.0
   */
  SearchTimeoutError,
  /**
   * @since 0.0.0
   */
  IndexingError,
} from "./errors.js";

export type {
  /**
   * @since 0.0.0
   */
  IndexedSymbol,
  /**
   * @since 0.0.0
   */
  SymbolKind,
  /**
   * @since 0.0.0
   */
  EffectPattern,
  /**
   * @since 0.0.0
   */
  ParamDoc,
  /**
   * @since 0.0.0
   */
  FieldDoc,
  /**
   * @since 0.0.0
   */
  ClassifyInput,
} from "./IndexedSymbol.js";

export {
  /**
   * @since 0.0.0
   */
  IndexMeta,
  /**
   * @since 0.0.0
   */
  generateId,
  /**
   * @since 0.0.0
   */
  classifySymbol,
  /**
   * @since 0.0.0
   */
  buildEmbeddingText,
  /**
   * @since 0.0.0
   */
  buildKeywordText,
  /**
   * @since 0.0.0
   */
  validateIndexedSymbol,
  /**
   * @since 0.0.0
   */
  computeContentHash,
} from "./IndexedSymbol.js";
