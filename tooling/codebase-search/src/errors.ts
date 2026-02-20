/**
 * Error types for the codebase search system.
 *
 * @since 0.0.0
 * @packageDocumentation
 */
import * as S from "effect/Schema";

/**
 * Indicates the search index does not exist or cannot be found at the expected path.
 * Typically occurs on first run before any indexing has been performed.
 *
 * @since 0.0.0
 * @category errors
 */
export class IndexNotFoundError extends S.TaggedErrorClass<IndexNotFoundError>(
  "@beep/codebase-search/errors/IndexNotFoundError"
)(
  "IndexNotFoundError",
  {
    message: S.String,
    indexPath: S.String,
  },
  {
    title: "Index Not Found Error",
    description: "Indicates the search index does not exist or cannot be found at the expected path.",
  }
) {}

/**
 * Indicates a requested symbol could not be found in the search index.
 * May occur if the index is stale or the symbol ID is invalid.
 *
 * @since 0.0.0
 * @category errors
 */
export class SymbolNotFoundError extends S.TaggedErrorClass<SymbolNotFoundError>(
  "@beep/codebase-search/errors/SymbolNotFoundError"
)(
  "SymbolNotFoundError",
  {
    message: S.String,
    symbolId: S.String,
  },
  {
    title: "Symbol Not Found Error",
    description: "Indicates a requested symbol could not be found in the search index.",
  }
) {}

/**
 * Indicates a failure loading or running the ONNX embedding model for vector search.
 * May occur if the model file is missing, corrupted, or the runtime is incompatible.
 *
 * @since 0.0.0
 * @category errors
 */
export class EmbeddingModelError extends S.TaggedErrorClass<EmbeddingModelError>(
  "@beep/codebase-search/errors/EmbeddingModelError"
)(
  "EmbeddingModelError",
  {
    message: S.String,
    modelName: S.String,
  },
  {
    title: "Embedding Model Error",
    description: "Indicates a failure loading or running the ONNX embedding model for vector search.",
  }
) {}

/**
 * Indicates a search operation exceeded the configured timeout threshold.
 * Common in hook contexts where the 5-second timeout is strict.
 *
 * @since 0.0.0
 * @category errors
 */
export class SearchTimeoutError extends S.TaggedErrorClass<SearchTimeoutError>(
  "@beep/codebase-search/errors/SearchTimeoutError"
)(
  "SearchTimeoutError",
  {
    message: S.String,
    timeoutMs: S.Number,
  },
  {
    title: "Search Timeout Error",
    description: "Indicates a search operation exceeded the configured timeout threshold.",
  }
) {}

/**
 * Indicates a failure during the indexing pipeline execution.
 * Wraps underlying errors from file scanning, AST extraction, or storage operations.
 *
 * @since 0.0.0
 * @category errors
 */
export class IndexingError extends S.TaggedErrorClass<IndexingError>("@beep/codebase-search/errors/IndexingError")(
  "IndexingError",
  {
    message: S.String,
    phase: S.String,
  },
  {
    title: "Indexing Error",
    description: "Indicates a failure during the indexing pipeline execution.",
  }
) {}
