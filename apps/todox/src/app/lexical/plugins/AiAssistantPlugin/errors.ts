import * as S from "effect/Schema";

/**
 * AI error codes for categorization
 */
export const AiErrorCode = {
  STREAM_ABORT: "STREAM_ABORT",
  SELECTION_INVALID: "SELECTION_INVALID",
  API_ERROR: "API_ERROR",
  RATE_LIMITED: "RATE_LIMITED",
  NETWORK_ERROR: "NETWORK_ERROR",
  UNKNOWN: "UNKNOWN",
} as const;

export type AiErrorCodeType = (typeof AiErrorCode)[keyof typeof AiErrorCode];

/**
 * General AI operation error
 */
export class AiError extends S.TaggedError<AiError>()("AiError", {
  message: S.String,
  code: S.optional(S.String),
}) {}

/**
 * AI streaming-specific error
 */
export class AiStreamError extends S.TaggedError<AiStreamError>()("AiStreamError", {
  message: S.String,
  code: S.optionalWith(S.String, { default: () => AiErrorCode.STREAM_ABORT }),
  cause: S.optional(S.Unknown),
}) {}

/**
 * Selection-related error (invalid or lost selection)
 */
export class AiSelectionError extends S.TaggedError<AiSelectionError>()("AiSelectionError", {
  message: S.String,
}) {}
