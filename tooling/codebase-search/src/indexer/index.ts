/**
 * Indexing pipeline for building and maintaining the search index.
 * Orchestrates symbol extraction, embedding generation, and LanceDB storage.
 * @since 0.0.0
 * @packageDocumentation
 */

/**
 * Placeholder for indexer module.
 * @since 0.0.0
 * @category constants
 */
export const INDEXER_MODULE = "indexer" as const;

export type {
  /**
   * @since 0.0.0
   */
  Bm25SearchResult,
  /**
   * @since 0.0.0
   */
  Bm25WriterShape,
} from "./Bm25Writer.js";
export {
  /**
   * @since 0.0.0
   */
  Bm25Writer,
  /**
   * @since 0.0.0
   */
  Bm25WriterLive,
  /**
   * @since 0.0.0
   */
  Bm25WriterMock,
} from "./Bm25Writer.js";
export type {
  /**
   * @since 0.0.0
   */
  EmbeddingServiceShape,
} from "./EmbeddingService.js";
export {
  /**
   * @since 0.0.0
   */
  DEFAULT_BATCH_SIZE,
  /**
   * @since 0.0.0
   */
  EMBEDDING_DIMENSIONS,
  /**
   * @since 0.0.0
   */
  EmbeddingService,
  /**
   * @since 0.0.0
   */
  EmbeddingServiceLive,
  /**
   * @since 0.0.0
   */
  EmbeddingServiceMock,
} from "./EmbeddingService.js";
export type {
  /**
   * @since 0.0.0
   */
  LanceDbWriterShape,
  /**
   * @since 0.0.0
   */
  SymbolWithVector,
  /**
   * @since 0.0.0
   */
  VectorSearchOptions,
  /**
   * @since 0.0.0
   */
  VectorSearchResult,
} from "./LanceDbWriter.js";
export {
  /**
   * @since 0.0.0
   */
  LanceDbWriter,
  /**
   * @since 0.0.0
   */
  LanceDbWriterLive,
  /**
   * @since 0.0.0
   */
  LanceDbWriterMock,
} from "./LanceDbWriter.js";
export type {
  /**
   * @since 0.0.0
   */
  PipelineConfig,
  /**
   * @since 0.0.0
   */
  PipelineShape,
  /**
   * @since 0.0.0
   */
  PipelineStats,
} from "./Pipeline.js";
export {
  /**
   * @since 0.0.0
   */
  Pipeline,
  /**
   * @since 0.0.0
   */
  PipelineLive,
  /**
   * @since 0.0.0
   */
  PipelineMock,
} from "./Pipeline.js";
