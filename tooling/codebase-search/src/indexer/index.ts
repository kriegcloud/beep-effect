/**
 * Indexing pipeline for building and maintaining the search index.
 * Orchestrates extraction, embeddings, vector storage, and BM25 persistence.
 * @since 0.0.0
 * @packageDocumentation
 */

/**
 * Indexer module identifier.
 * @since 0.0.0
 * @category constants
 */
export const INDEXER_MODULE = "indexer" as const;

/**
 * Re-export BM25 writer APIs.
 * @since 0.0.0
 */
export * from "./Bm25Writer.js";

/**
 * Re-export embedding service APIs.
 * @since 0.0.0
 */
export * from "./EmbeddingService.js";

/**
 * Re-export LanceDB writer APIs.
 * @since 0.0.0
 */
export * from "./LanceDbWriter.js";

/**
 * Re-export indexing pipeline APIs.
 * @since 0.0.0
 */
export * from "./Pipeline.js";
