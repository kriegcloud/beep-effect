/**
 * Shared MCP contracts for tool errors and response encoding.
 *
 * @since 0.0.0
 * @module
 */
import * as S from "effect/Schema";
import {
  EmbeddingModelError,
  IndexingError,
  IndexNotFoundError,
  SearchTimeoutError,
  SymbolNotFoundError,
} from "../errors.js";

/**
 * Error codes used in MCP tool error responses.
 *
 * @since 0.0.0
 * @category constants
 */
export const ErrorCodes = {
  INDEX_NOT_FOUND: "INDEX_NOT_FOUND",
  SYMBOL_NOT_FOUND: "SYMBOL_NOT_FOUND",
  INDEX_STALE: "INDEX_STALE",
  EMBEDDING_MODEL_ERROR: "EMBEDDING_MODEL_ERROR",
  SEARCH_TIMEOUT: "SEARCH_TIMEOUT",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

/**
 * Error code string union.
 *
 * @since 0.0.0
 * @category types
 */
export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

/**
 * Schema for error code values.
 *
 * @since 0.0.0
 * @category schemas
 */
export const ErrorCodeSchema = S.Literals([
  ErrorCodes.INDEX_NOT_FOUND,
  ErrorCodes.SYMBOL_NOT_FOUND,
  ErrorCodes.INDEX_STALE,
  ErrorCodes.EMBEDDING_MODEL_ERROR,
  ErrorCodes.SEARCH_TIMEOUT,
  ErrorCodes.INTERNAL_ERROR,
]);

/**
 * Structured MCP error response.
 *
 * @since 0.0.0
 * @category types
 */
export interface McpErrorResponse {
  readonly error: {
    readonly code: ErrorCode;
    readonly message: string;
    readonly suggestion: string;
  };
}

/**
 * Schema for structured MCP error responses.
 *
 * @since 0.0.0
 * @category schemas
 */
export const McpErrorResponseSchema = S.Struct({
  error: S.Struct({
    code: ErrorCodeSchema,
    message: S.String,
    suggestion: S.String,
  }),
});

/**
 * Convert a domain error to a structured MCP error payload.
 *
 * @since 0.0.0
 * @category formatters
 */
export const formatError = (error: unknown): McpErrorResponse => {
  if (error instanceof IndexNotFoundError) {
    return {
      error: {
        code: ErrorCodes.INDEX_NOT_FOUND,
        message: error.message,
        suggestion: "Run the 'reindex' tool with mode='full' to create the search index.",
      },
    };
  }

  if (error instanceof SymbolNotFoundError) {
    return {
      error: {
        code: ErrorCodes.SYMBOL_NOT_FOUND,
        message: error.message,
        suggestion: "Use 'search_codebase' to find valid symbol IDs.",
      },
    };
  }

  if (error instanceof EmbeddingModelError) {
    return {
      error: {
        code: ErrorCodes.EMBEDDING_MODEL_ERROR,
        message: error.message,
        suggestion: "Verify the embedding model is available and the runtime is compatible.",
      },
    };
  }

  if (error instanceof SearchTimeoutError) {
    return {
      error: {
        code: ErrorCodes.SEARCH_TIMEOUT,
        message: error.message,
        suggestion: "Try a more specific query or reduce the limit parameter.",
      },
    };
  }

  if (error instanceof IndexingError) {
    return {
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: error.message,
        suggestion: "Check index files and configuration, then retry.",
      },
    };
  }

  return {
    error: {
      code: ErrorCodes.INTERNAL_ERROR,
      message: String(error),
      suggestion: "An unexpected error occurred. Check the server logs and retry.",
    },
  };
};
