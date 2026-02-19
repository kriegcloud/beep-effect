/**
 * Hybrid search engine combining vector similarity and BM25 keyword search.
 * Provides ranked results with reciprocal rank fusion, keyword-only search
 * for hook contexts, and symbol relationship resolution.
 * @since 0.0.0
 * @packageDocumentation
 */

export type {
  /**
   * @since 0.0.0
   */
  HybridSearchConfig,
  /**
   * @since 0.0.0
   */
  HybridSearchResult,
  /**
   * @since 0.0.0
   */
  HybridSearchShape,
} from "./HybridSearch.js";
export {
  /**
   * @since 0.0.0
   */
  HybridSearch,
  /**
   * @since 0.0.0
   */
  HybridSearchLive,
  /**
   * @since 0.0.0
   */
  RRF_K,
  /**
   * @since 0.0.0
   */
  reciprocalRankFusion,
} from "./HybridSearch.js";
export type {
  /**
   * @since 0.0.0
   */
  KeywordSearchConfig,
  /**
   * @since 0.0.0
   */
  KeywordSearchResult,
  /**
   * @since 0.0.0
   */
  KeywordSearchShape,
} from "./KeywordSearch.js";
export {
  /**
   * @since 0.0.0
   */
  KeywordSearch,
  /**
   * @since 0.0.0
   */
  KeywordSearchLive,
} from "./KeywordSearch.js";
export type {
  /**
   * @since 0.0.0
   */
  RelatedSymbol,
  /**
   * @since 0.0.0
   */
  RelationResolverConfig,
  /**
   * @since 0.0.0
   */
  RelationResolverShape,
  /**
   * @since 0.0.0
   */
  RelationType,
} from "./RelationResolver.js";
export {
  /**
   * @since 0.0.0
   */
  RelationResolver,
  /**
   * @since 0.0.0
   */
  RelationResolverLive,
} from "./RelationResolver.js";
