/**
 * Domain Errors: LLM Errors
 *
 * Errors specific to LLM operations.
 *
 * @since 0.1.0
 * @module Domain/Error/Llm
 */

import { $KnowledgeDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("errors/Llm.errors");

/**
 * LlmError - LLM operation errors
 *
 * @since 0.1.0
 * @category Error
 */
export class LlmError extends S.TaggedError<LlmError>($I`LlmError`)(
  "LlmError",
  {
    message: S.String,
    cause: S.optional(S.Defect),
  },
  $I.annotations("LlmError", {
    description: "General LLM operation error with message and optional cause",
  })
) {}

/**
 * LlmTimeout - LLM call exceeded timeout
 *
 * @since 0.1.0
 * @category Error
 */
export class LlmTimeout extends S.TaggedError<LlmTimeout>($I`LlmTimeout`)(
  "LlmTimeout",
  {
    message: S.String,
    cause: S.optional(S.Defect),

    /**
     * Timeout duration in milliseconds
     */
    timeoutMs: S.optional(S.DurationFromMillis),
  },
  $I.annotations("LlmTimeout", {
    description: "LLM call exceeded configured timeout duration",
  })
) {}

/**
 * LlmRateLimit - Rate limit exceeded
 *
 * @since 0.1.0
 * @category Error
 */
export class LlmRateLimit extends S.TaggedError<LlmRateLimit>($I`LlmRateLimit`)(
  "LlmRateLimit",
  {
    message: S.String,
    cause: S.optional(S.Defect),

    /**
     * Retry after duration in milliseconds (if available)
     */
    retryAfterMs: S.optional(S.Number),
  },
  $I.annotations("LlmRateLimit", {
    description: "Rate limit exceeded for LLM API calls with optional retry-after duration",
  })
) {}

/**
 * LlmInvalidResponse - LLM returned invalid/unparseable response
 *
 * @since 0.1.0
 * @category Error
 */
export class LlmInvalidResponse extends S.TaggedError<LlmInvalidResponse>($I`LlmInvalidResponse`)(
  "LlmInvalidResponse",
  {
    message: S.String,
    cause: S.optional(S.Defect),

    /**
     * Raw response from LLM
     */
    response: S.optional(S.String),
  },
  $I.annotations("LlmInvalidResponse", {
    description: "LLM returned an invalid or unparseable response that could not be processed",
  })
) {}
