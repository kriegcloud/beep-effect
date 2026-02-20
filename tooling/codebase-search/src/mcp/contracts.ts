/**
 * Shared MCP contracts for tool errors and response encoding.
 *
 * @since 0.0.0
 * @module
 */

import { pipe } from "effect/Function";
import * as Match from "effect/Match";
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

type McpErrorResponseForCode<C extends ErrorCode> = {
  readonly error: {
    readonly code: C;
    readonly message: string;
    readonly suggestion: string;
  };
};

/**
 * Structured MCP error response.
 *
 * @since 0.0.0
 * @category types
 */
export type McpErrorResponse =
  | McpErrorResponseForCode<typeof ErrorCodes.INDEX_NOT_FOUND>
  | McpErrorResponseForCode<typeof ErrorCodes.SYMBOL_NOT_FOUND>
  | McpErrorResponseForCode<typeof ErrorCodes.INDEX_STALE>
  | McpErrorResponseForCode<typeof ErrorCodes.EMBEDDING_MODEL_ERROR>
  | McpErrorResponseForCode<typeof ErrorCodes.SEARCH_TIMEOUT>
  | McpErrorResponseForCode<typeof ErrorCodes.INTERNAL_ERROR>;

type McpErrorSeed =
  | { readonly code: typeof ErrorCodes.INDEX_NOT_FOUND; readonly message: string }
  | { readonly code: typeof ErrorCodes.SYMBOL_NOT_FOUND; readonly message: string }
  | { readonly code: typeof ErrorCodes.INDEX_STALE; readonly message: string }
  | { readonly code: typeof ErrorCodes.EMBEDDING_MODEL_ERROR; readonly message: string }
  | { readonly code: typeof ErrorCodes.SEARCH_TIMEOUT; readonly message: string }
  | { readonly code: typeof ErrorCodes.INTERNAL_ERROR; readonly message: string };

/**
 * Schema for structured MCP error responses.
 *
 * @since 0.0.0
 * @category schemas
 */
export const McpErrorResponseSchema = S.Union([
  S.Struct({
    error: S.Struct({
      code: S.Literal(ErrorCodes.INDEX_NOT_FOUND),
      message: S.String,
      suggestion: S.String,
    }),
  }),
  S.Struct({
    error: S.Struct({
      code: S.Literal(ErrorCodes.SYMBOL_NOT_FOUND),
      message: S.String,
      suggestion: S.String,
    }),
  }),
  S.Struct({
    error: S.Struct({
      code: S.Literal(ErrorCodes.INDEX_STALE),
      message: S.String,
      suggestion: S.String,
    }),
  }),
  S.Struct({
    error: S.Struct({
      code: S.Literal(ErrorCodes.EMBEDDING_MODEL_ERROR),
      message: S.String,
      suggestion: S.String,
    }),
  }),
  S.Struct({
    error: S.Struct({
      code: S.Literal(ErrorCodes.SEARCH_TIMEOUT),
      message: S.String,
      suggestion: S.String,
    }),
  }),
  S.Struct({
    error: S.Struct({
      code: S.Literal(ErrorCodes.INTERNAL_ERROR),
      message: S.String,
      suggestion: S.String,
    }),
  }),
]);

const fromSeed = pipe(
  Match.type<McpErrorSeed>(),
  Match.discriminators("code")({
    INDEX_NOT_FOUND: (seed): McpErrorResponse => ({
      error: {
        code: seed.code,
        message: seed.message,
        suggestion: "Run the 'reindex' tool with mode='full' to create the search index.",
      },
    }),
    SYMBOL_NOT_FOUND: (seed): McpErrorResponse => ({
      error: {
        code: seed.code,
        message: seed.message,
        suggestion: "Use 'search_codebase' to find valid symbol IDs.",
      },
    }),
    INDEX_STALE: (seed): McpErrorResponse => ({
      error: {
        code: seed.code,
        message: seed.message,
        suggestion: "Run 'reindex' with mode='incremental' or mode='full' to refresh the index.",
      },
    }),
    EMBEDDING_MODEL_ERROR: (seed): McpErrorResponse => ({
      error: {
        code: seed.code,
        message: seed.message,
        suggestion: "Verify the embedding model is available and the runtime is compatible.",
      },
    }),
    SEARCH_TIMEOUT: (seed): McpErrorResponse => ({
      error: {
        code: seed.code,
        message: seed.message,
        suggestion: "Try a more specific query or reduce the limit parameter.",
      },
    }),
    INTERNAL_ERROR: (seed): McpErrorResponse => ({
      error: {
        code: seed.code,
        message: seed.message,
        suggestion: "Check index files and configuration, then retry.",
      },
    }),
  }),
  Match.exhaustive
);

/**
 * Convert a domain error to a structured MCP error payload.
 *
 * @param error error parameter value.
 * @since 0.0.0
 * @category formatters
 * @returns Returns the computed value.
 */
export const formatError = (error: unknown): McpErrorResponse => {
  if (error instanceof IndexNotFoundError) {
    return fromSeed({
      code: ErrorCodes.INDEX_NOT_FOUND,
      message: error.message,
    });
  }

  if (error instanceof SymbolNotFoundError) {
    return fromSeed({
      code: ErrorCodes.SYMBOL_NOT_FOUND,
      message: error.message,
    });
  }

  if (error instanceof EmbeddingModelError) {
    return fromSeed({
      code: ErrorCodes.EMBEDDING_MODEL_ERROR,
      message: error.message,
    });
  }

  if (error instanceof SearchTimeoutError) {
    return fromSeed({
      code: ErrorCodes.SEARCH_TIMEOUT,
      message: error.message,
    });
  }

  if (error instanceof IndexingError) {
    return fromSeed({
      code: ErrorCodes.INTERNAL_ERROR,
      message: error.message,
    });
  }

  return fromSeed({
    code: ErrorCodes.INTERNAL_ERROR,
    message: String(error),
  });
};
