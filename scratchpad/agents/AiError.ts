/**
 * Defines shared errors for AI operations.
 *
 * `AiError` records where a failure happened and stores the detailed reason in a
 * `reason` field. Those reasons cover transport problems, provider responses,
 * rate limits, authentication, content policy failures, invalid requests,
 * invalid output, unsupported schemas, tool failures, invalid user input, and
 * unknown failures. This module also includes metadata schemas, guards,
 * constructors, and helpers for converting HTTP response information into AI
 * error reasons.
 *
 * @since 0.0.0
 */

import { $AgentsDomainId } from "@beep/identity/packages";
import { O, P } from "@beep/utils";
import { Duration, Effect, Redacted } from "effect";
import { redact } from "effect/Redactable";
import * as S from "effect/Schema";
import type * as HttpClientError from "effect/unstable/http/HttpClientError";
import { HttpRequestDetails, HttpResponseDetails } from "./Response.ts";

const $I = $AgentsDomainId.create("AiError");

const ReasonTypeId = "~effect/unstable/ai/AiError/Reason" as const;

const providerMetadataWithDefaults = <Metadata extends ProviderMetadata>() =>
  (ProviderMetadata as unknown as typeof ProviderMetadata & S.Schema<Metadata>).pipe(
    S.withConstructorDefault(Effect.succeed({})),
    S.withDecodingDefault(Effect.succeed({}))
  );

const redactHeaders = (headers: Record<string, string>): Record<string, string> => {
  const redacted = redact(headers) as Record<string, string | Redacted.Redacted>;
  const result: Record<string, string> = {};
  for (const key in redacted) {
    const value = redacted[key];
    result[key] = Redacted.isRedacted(value) ? value.toString() : value;
  }
  return result;
};

// =============================================================================
// Http Request Error
// =============================================================================

/**
 * Error indicating a network-level failure before receiving a response.
 *
 * **Details**
 *
 * This error is raised when issues arise before receiving an HTTP response,
 * such as network connectivity problems, request encoding issues, or invalid
 * URLs.
 *
 * @example Creating a network error
 *
 * ```ts
 * import { AiError } from "effect/unstable/ai"
 *
 * const error = new AiError.NetworkError({
 *   reason: "TransportError",
 *   request: {
 *     method: "POST",
 *     url: "https://api.openai.com/v1/completions",
 *     urlParams: [],
 *     hash: undefined,
 *     headers: { "Content-Type": "application/json" }
 *   },
 *   description: "Connection timeout after 30 seconds"
 * })
 *
 * console.log(error.isRetryable) // true
 * console.log(error.message)
 * // "Transport: Connection timeout after 30 seconds (POST https://api.openai.com/v1/completions)"
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class NetworkError extends S.ErrorClass<NetworkError>($I`NetworkError`)(
  {
    _tag: S.tag("NetworkError"),
    reason: S.Literals(["TransportError", "EncodeError", "InvalidUrlError"]),
    request: HttpRequestDetails,
    description: S.optional(S.String),
  },
  $I.annote("NetworkError", {
    description: "Error indicating a network-level failure before receiving a response.",
  })
) {
  /**
   * Marks `NetworkError` as a semantic AI error reason for runtime guards.
   *
   * @since 0.0.0
   */
  readonly [ReasonTypeId] = ReasonTypeId;

  /**
   * Transport errors are retryable; encoding and URL errors are not.
   *
   * @since 0.0.0
   */
  get isRetryable(): boolean {
    return this.reason === "TransportError";
  }

  /**
   * Creates a NetworkError from a platform HttpClientError.RequestError.
   *
   * @example Creating a network error from a request error
   *
   * ```ts
   * import { Effect } from "effect"
   * import { AiError } from "effect/unstable/ai"
   *
   * const aiError = AiError.NetworkError.make({
   *   request: { method: "GET", url: "https://api.example.test" },
   *   cause: Effect.dieMessage("connection reset")
   * })
   * ```
   *
   * @since 0.0.0
   */
  static fromRequestError(error: HttpClientError.RequestError): NetworkError {
    return NetworkError.make({
      description: error.description,
      reason: error._tag,
      request: {
        hash: O.getOrUndefined(error.request.hash),
        headers: redactHeaders(error.request.headers),
        method: error.request.method,
        url: error.request.url,
        urlParams: Array.from(error.request.urlParams),
      },
    });
  }

  override get message(): string {
    const methodAndUrl = `${this.request.method} ${this.request.url}`;

    let baseMessage = P.isNotUndefined(this.description)
      ? `${this.reason}: ${this.description}`
      : `${this.reason}: A network error occurred.`;

    baseMessage += ` (${methodAndUrl})`;

    let suggestion = "";
    switch (this.reason) {
      case "EncodeError": {
        suggestion += "Check that the request body data is properly formatted and matches the expected content type.";
        break;
      }

      case "InvalidUrlError": {
        suggestion += "Verify that the URL format is correct and that all required parameters have been provided.";
        suggestion += " Check for any special characters that may need encoding.";
        break;
      }

      case "TransportError": {
        suggestion += "Check your network connection and verify that the requested URL is accessible.";
        break;
      }
    }

    baseMessage += `\n\n${suggestion}`;

    return baseMessage;
  }
}

// =============================================================================
// Http Response Error
// =============================================================================

// =============================================================================
// Supporting Schemas
// =============================================================================

/**
 * Schema for provider-specific metadata which can be attached to error reasons.
 *
 * **Details**
 *
 * Provider-specific metadata is namespaced by provider name. Each provider
 * value can contain arbitrary mutable JSON metadata or `null`.
 *
 * @example Inspecting metadata shape
 *
 * ```ts
 * const metadata = {
 *   openai: {
 *     errorCode: "rate_limit_exceeded",
 *     requestId: "req_123"
 *   },
 *   anthropic: null
 * }
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const ProviderMetadata: S.$Record<S.String, S.NullOr<S.Codec<S.MutableJson>>> = S.Record(
  S.String,
  S.NullOr(S.MutableJson)
).pipe(
  $I.annoteSchema("ProviderMetadata", {
    description: "Schema for provider-specific metadata which can be attached to error reasons.",
  })
);

/**
 * Type of provider-specific metadata attached to AI error reasons.
 *
 * **Details**
 *
 * Metadata is keyed by provider name, and each provider value is either mutable
 * JSON metadata or `null`.
 *
 * @category models
 * @since 0.0.0
 */
export type ProviderMetadata = typeof ProviderMetadata.Type;

/**
 * Provider-specific metadata attached to `RateLimitError`.
 *
 * @category configuration
 * @since 0.0.0
 */
export interface RateLimitErrorMetadata extends ProviderMetadata {}

/**
 * Provider-specific metadata attached to `QuotaExhaustedError`.
 *
 * @category configuration
 * @since 0.0.0
 */
export interface QuotaExhaustedErrorMetadata extends ProviderMetadata {}

/**
 * Provider-specific metadata attached to `AuthenticationError`.
 *
 * @category configuration
 * @since 0.0.0
 */
export interface AuthenticationErrorMetadata extends ProviderMetadata {}

/**
 * Provider-specific metadata attached to `ContentPolicyError`.
 *
 * @category configuration
 * @since 0.0.0
 */
export interface ContentPolicyErrorMetadata extends ProviderMetadata {}

/**
 * Provider-specific metadata attached to `InvalidRequestError`.
 *
 * @category configuration
 * @since 0.0.0
 */
export interface InvalidRequestErrorMetadata extends ProviderMetadata {}

/**
 * Provider-specific metadata attached to `InternalProviderError`.
 *
 * @category configuration
 * @since 0.0.0
 */
export interface InternalProviderErrorMetadata extends ProviderMetadata {}

/**
 * Provider-specific metadata attached to `InvalidOutputError`.
 *
 * @category configuration
 * @since 0.0.0
 */
export interface InvalidOutputErrorMetadata extends ProviderMetadata {}

/**
 * Provider-specific metadata attached to `StructuredOutputError`.
 *
 * @category configuration
 * @since 0.0.0
 */
export interface StructuredOutputErrorMetadata extends ProviderMetadata {}

/**
 * Provider-specific metadata attached to `UnsupportedSchemaError`.
 *
 * @category configuration
 * @since 0.0.0
 */
export interface UnsupportedSchemaErrorMetadata extends ProviderMetadata {}

/**
 * Provider-specific metadata attached to `UnknownError`.
 *
 * @category configuration
 * @since 0.0.0
 */
export interface UnknownErrorMetadata extends ProviderMetadata {}

/**
 * Schema for token usage information from AI operations.
 *
 * **Details**
 *
 * Schema for optional provider-reported token counts for prompt tokens,
 * completion tokens, and total tokens.
 *
 * @category schemas
 * @since 0.0.0
 */
export const UsageInfo = S.Struct({
  promptTokens: S.optional(S.Finite),
  completionTokens: S.optional(S.Finite),
  totalTokens: S.optional(S.Finite),
}).annotate(
  $I.annote("UsageInfo", {
    identifier: "UsageInfo",
    description: "Schema for token usage information from AI operations.",
  })
);

/**
 * Type of token usage information from AI operations.
 *
 * @category models
 * @since 0.0.0
 */
export type UsageInfo = typeof UsageInfo.Type;

/**
 * Schema for the combined HTTP context used in error reporting.
 *
 * **When to use**
 *
 * Use to attach request details, optional response details, and optional body
 * text to AI provider errors.
 *
 * **Details**
 *
 * Includes the required request details plus optional response details and raw
 * response body.
 *
 * @see {@link HttpRequestDetails} for captured request details
 * @see {@link HttpResponseDetails} for captured response details
 *
 * @category schemas
 * @since 0.0.0
 */
export const HttpContext = S.Struct({
  request: HttpRequestDetails,
  response: S.optional(HttpResponseDetails),
  body: S.optional(S.String),
}).annotate(
  $I.annote("HttpContext", {
    identifier: "HttpContext",
    description: "Schema for the combined HTTP context used in error reporting.",
  })
);

/**
 * Type of the combined HTTP context used in error reporting.
 *
 * @category models
 * @since 0.0.0
 */
export type HttpContext = typeof HttpContext.Type;

// =============================================================================
// Reason Classes
// =============================================================================

/**
 * Error indicating the request was rate limited.
 *
 * **Details**
 *
 * Rate limit errors are always retryable. When `retryAfter` is provided,
 * callers should wait that duration before retrying.
 *
 * @example Creating a rate limit error
 *
 * ```ts
 * import { Duration } from "effect"
 * import { AiError } from "effect/unstable/ai"
 *
 * const rateLimitError = new AiError.RateLimitError({
 *   retryAfter: Duration.seconds(60)
 * })
 *
 * console.log(rateLimitError.isRetryable) // true
 * console.log(rateLimitError.message) // "Rate limit exceeded. Retry after 1 minute"
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class RateLimitError extends S.ErrorClass<RateLimitError>($I`RateLimitError`)(
  {
    _tag: S.tag("RateLimitError"),
    retryAfter: S.optional(S.Duration),
    metadata: providerMetadataWithDefaults<RateLimitErrorMetadata>(),
    http: S.optional(HttpContext),
  },
  $I.annote("RateLimitError", {
    description: "Error indicating the request was rate limited.",
  })
) {
  /**
   * Marks `RateLimitError` as a semantic AI error reason for runtime guards.
   *
   * @since 0.0.0
   */
  readonly [ReasonTypeId] = ReasonTypeId;

  /**
   * Rate limit errors are always retryable.
   *
   * @since 0.0.0
   */
  get isRetryable(): boolean {
    return true;
  }

  override get message(): string {
    let msg = "Rate limit exceeded";
    if (P.isNotUndefined(this.retryAfter)) msg += `. Retry after ${Duration.format(this.retryAfter)}`;
    return msg;
  }
}

/**
 * Error indicating account or billing limits have been reached.
 *
 * **Details**
 *
 * Quota exhausted errors are not retryable without user action.
 *
 * @example Creating a quota exhausted error
 *
 * ```ts
 * import { AiError } from "effect/unstable/ai"
 *
 * const quotaError = new AiError.QuotaExhaustedError({})
 *
 * console.log(quotaError.isRetryable) // false
 * console.log(quotaError.message)
 * // "Quota exhausted. Check your account billing and usage limits."
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class QuotaExhaustedError extends S.ErrorClass<QuotaExhaustedError>($I`QuotaExhaustedError`)(
  {
    _tag: S.tag("QuotaExhaustedError"),
    resetAt: S.optional(S.DateTimeUtc),
    metadata: providerMetadataWithDefaults<QuotaExhaustedErrorMetadata>(),
    http: S.optional(HttpContext),
  },
  $I.annote("QuotaExhaustedError", {
    description: "Error indicating account or billing limits have been reached.",
  })
) {
  /**
   * Marks `QuotaExhaustedError` as a semantic AI error reason for runtime guards.
   *
   * @since 0.0.0
   */
  readonly [ReasonTypeId] = ReasonTypeId;

  /**
   * Quota exhausted errors require user action and are not retryable.
   *
   * @since 0.0.0
   */
  get isRetryable(): boolean {
    return false;
  }

  override get message(): string {
    let msg = "Quota exhausted";
    if (P.isNotUndefined(this.resetAt)) msg += `. Resets at ${this.resetAt}`;
    return `${msg}. Check your account billing and usage limits.`;
  }
}

/**
 * Error indicating authentication or authorization failure.
 *
 * **Details**
 *
 * Authentication errors are never retryable without credential changes.
 *
 * @example Creating an authentication error
 *
 * ```ts
 * import { AiError } from "effect/unstable/ai"
 *
 * const authError = new AiError.AuthenticationError({
 *   kind: "InvalidKey"
 * })
 *
 * console.log(authError.isRetryable) // false
 * console.log(authError.message)
 * // "InvalidKey: Verify your API key is correct"
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class AuthenticationError extends S.ErrorClass<AuthenticationError>($I`AuthenticationError`)(
  {
    _tag: S.tag("AuthenticationError"),
    kind: S.Literals(["InvalidKey", "ExpiredKey", "MissingKey", "InsufficientPermissions", "Unknown"]),
    metadata: providerMetadataWithDefaults<AuthenticationErrorMetadata>(),
    http: S.optional(HttpContext),
  },
  $I.annote("AuthenticationError", {
    description: "Error indicating authentication or authorization failure.",
  })
) {
  /**
   * Marks `AuthenticationError` as a semantic AI error reason for runtime guards.
   *
   * @since 0.0.0
   */
  readonly [ReasonTypeId] = ReasonTypeId;

  /**
   * Authentication errors require credential changes and are not retryable.
   *
   * @since 0.0.0
   */
  get isRetryable(): boolean {
    return false;
  }

  override get message(): string {
    const suggestions: Record<string, string> = {
      InvalidKey: "Verify your API key is correct",
      ExpiredKey: "Your API key has expired. Generate a new one",
      MissingKey: "No API key provided. Set the appropriate environment variable",
      InsufficientPermissions: "Your API key lacks required permissions",
      Unknown: "Authentication failed. Check your credentials",
    };
    return `${this.kind}: ${suggestions[this.kind]}`;
  }
}

/**
 * Error indicating content policy violation.
 *
 * **Details**
 *
 * Content policy errors are never retryable without content changes.
 *
 * @example Creating a content policy error
 *
 * ```ts
 * import { AiError } from "effect/unstable/ai"
 *
 * const policyError = new AiError.ContentPolicyError({
 *   description: "Input contains prohibited content"
 * })
 *
 * console.log(policyError.isRetryable) // false
 * console.log(policyError.message)
 * // "Content policy violation: Input contains prohibited content"
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class ContentPolicyError extends S.ErrorClass<ContentPolicyError>($I`ContentPolicyError`)(
  {
    _tag: S.tag("ContentPolicyError"),
    description: S.String,
    metadata: providerMetadataWithDefaults<ContentPolicyErrorMetadata>(),
    http: S.optional(HttpContext),
  },
  $I.annote("ContentPolicyError", {
    description: "Error indicating content policy violation.",
  })
) {
  /**
   * Marks `ContentPolicyError` as a semantic AI error reason for runtime guards.
   *
   * @since 0.0.0
   */
  readonly [ReasonTypeId] = ReasonTypeId;

  /**
   * Content policy errors require content changes and are not retryable.
   *
   * @since 0.0.0
   */
  get isRetryable(): boolean {
    return false;
  }

  override get message(): string {
    return `Content policy violation: ${this.description}`;
  }
}

/**
 * Error indicating the request had invalid or malformed parameters.
 *
 * **Details**
 *
 * Invalid request errors require fixing the request and are not retryable.
 *
 * @example Creating an invalid request error
 *
 * ```ts
 * import { AiError } from "effect/unstable/ai"
 *
 * const invalidRequestError = new AiError.InvalidRequestError({
 *   parameter: "temperature",
 *   constraint: "must be between 0 and 2",
 *   description: "Temperature value 5 is out of range"
 * })
 *
 * console.log(invalidRequestError.isRetryable) // false
 * console.log(invalidRequestError.message)
 * // "Invalid request: parameter 'temperature' must be between 0 and 2. Temperature value 5 is out of range"
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class InvalidRequestError extends S.ErrorClass<InvalidRequestError>($I`InvalidRequestError`)(
  {
    _tag: S.tag("InvalidRequestError"),
    parameter: S.optional(S.String),
    constraint: S.optional(S.String),
    description: S.optional(S.String),
    metadata: providerMetadataWithDefaults<InvalidRequestErrorMetadata>(),
    http: S.optional(HttpContext),
  },
  $I.annote("InvalidRequestError", {
    description: "Error indicating the request had invalid or malformed parameters.",
  })
) {
  /**
   * Marks `InvalidRequestError` as a semantic AI error reason for runtime guards.
   *
   * @since 0.0.0
   */
  readonly [ReasonTypeId] = ReasonTypeId;

  /**
   * Invalid request errors require fixing the request and are not retryable.
   *
   * @since 0.0.0
   */
  get isRetryable(): boolean {
    return false;
  }

  override get message(): string {
    let msg = "Invalid request";
    if (P.isNotUndefined(this.parameter)) msg += `: parameter '${this.parameter}'`;
    if (P.isNotUndefined(this.constraint)) msg += ` ${this.constraint}`;
    if (P.isNotUndefined(this.description)) msg += `. ${this.description}`;
    return msg;
  }
}

/**
 * Error indicating the AI provider experienced an internal error.
 *
 * **Details**
 *
 * Internal provider errors are typically transient and are retryable.
 *
 * @example Creating an internal provider error
 *
 * ```ts
 * import { AiError } from "effect/unstable/ai"
 *
 * const providerError = new AiError.InternalProviderError({
 *   description: "Server encountered an unexpected error"
 * })
 *
 * console.log(providerError.isRetryable) // true
 * console.log(providerError.message)
 * // "Internal provider error: Server encountered an unexpected error"
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class InternalProviderError extends S.ErrorClass<InternalProviderError>($I`InternalProviderError`)(
  {
    _tag: S.tag("InternalProviderError"),
    description: S.String,
    metadata: providerMetadataWithDefaults<InternalProviderErrorMetadata>(),
    http: S.optional(HttpContext),
  },
  $I.annote("InternalProviderError", {
    description: "Error indicating the AI provider experienced an internal error.",
  })
) {
  /**
   * Marks `InternalProviderError` as a semantic AI error reason for runtime guards.
   *
   * @since 0.0.0
   */
  readonly [ReasonTypeId] = ReasonTypeId;

  /**
   * Internal provider errors are typically transient and are retryable.
   *
   * @since 0.0.0
   */
  get isRetryable(): boolean {
    return true;
  }

  override get message(): string {
    return `Internal provider error: ${this.description}`;
  }
}

/**
 * Error indicating failure to parse or validate LLM output.
 *
 * **Details**
 *
 * Invalid output errors are retryable since LLM outputs are non-deterministic.
 *
 * @example Creating an invalid output error
 *
 * ```ts
 * import { AiError } from "effect/unstable/ai"
 *
 * const parseError = new AiError.InvalidOutputError({
 *   description: "Expected a string but received a number"
 * })
 *
 * console.log(parseError.isRetryable) // true
 * console.log(parseError.message)
 * // "Invalid output: Expected a string but received a number"
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class InvalidOutputError extends S.ErrorClass<InvalidOutputError>($I`InvalidOutputError`)(
  {
    _tag: S.tag("InvalidOutputError"),
    description: S.String,
    metadata: providerMetadataWithDefaults<InvalidOutputErrorMetadata>(),
    usage: S.optional(UsageInfo),
  },
  $I.annote("InvalidOutputError", {
    description: "Error indicating failure to parse or validate LLM output.",
  })
) {
  /**
   * Marks `InvalidOutputError` as a semantic AI error reason for runtime guards.
   *
   * @since 0.0.0
   */
  readonly [ReasonTypeId] = ReasonTypeId;

  /**
   * Invalid output errors are retryable since LLM outputs are non-deterministic.
   *
   * @since 0.0.0
   */
  get isRetryable(): boolean {
    return true;
  }

  /**
   * Creates an InvalidOutputError from a Schema error.
   *
   * @example Creating an invalid output error from a schema error
   *
   * ```ts
   * import { Result } from "effect"
   * import * as S from "effect/Schema"
   * import { AiError } from "effect/unstable/ai"
   *
   * const decoded = S.decodeUnknownResult(S.String)(42)
   * if (Result.isFailure(decoded)) {
   *   const parseError = AiError.InvalidOutputError.fromSchemaError(decoded.failure)
   *   console.log(parseError.message)
   * }
   * ```
   *
   * @since 0.0.0
   */
  static fromSchemaError(error: S.SchemaError): InvalidOutputError {
    return InvalidOutputError.make({
      description: error.message,
    });
  }

  override get message(): string {
    return `Invalid output: ${this.description}`;
  }
}

/**
 * Error indicating the LLM generated text that does not conform to the
 * requested structured output schema.
 *
 * **Details**
 *
 * Structured output errors are retryable since LLM outputs are non-deterministic.
 *
 * @example Creating a structured output error
 *
 * ```ts
 * import { AiError } from "effect/unstable/ai"
 *
 * const error = new AiError.StructuredOutputError({
 *   description: "Expected a valid JSON object",
 *   responseText: "{\"foo\":}"
 * })
 *
 * console.log(error.isRetryable) // true
 * console.log(error.message)
 * // "Structured output validation failed: Expected a valid JSON object"
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class StructuredOutputError extends S.ErrorClass<StructuredOutputError>($I`StructuredOutputError`)(
  {
    _tag: S.tag("StructuredOutputError"),
    description: S.String,
    responseText: S.String,
    metadata: providerMetadataWithDefaults<StructuredOutputErrorMetadata>(),
    usage: S.optional(UsageInfo),
  },
  $I.annote("StructuredOutputError", {
    description:
      "Error indicating the LLM generated text that does not conform to the requested structured output schema.",
  })
) {
  /**
   * Marks `StructuredOutputError` as a semantic AI error reason for runtime guards.
   *
   * @since 0.0.0
   */
  readonly [ReasonTypeId] = ReasonTypeId;

  /**
   * Structured output errors are retryable since LLM outputs are non-deterministic.
   *
   * @since 0.0.0
   */
  get isRetryable(): boolean {
    return true;
  }

  /**
   * Creates a StructuredOutputError from a Schema error.
   *
   * @example Creating a structured output error from a schema error
   *
   * ```ts
   * import { Result } from "effect"
   * import * as S from "effect/Schema"
   * import { AiError } from "effect/unstable/ai"
   *
   * const decoded = S.decodeUnknownResult(S.Struct({ name: S.String }))(42)
   * if (Result.isFailure(decoded)) {
   *   const parseError = AiError.StructuredOutputError.fromSchemaError(decoded.failure, "42")
   *   console.log(parseError.message)
   * }
   * ```
   *
   * @since 0.0.0
   */
  static fromSchemaError(error: S.SchemaError, responseText: string): StructuredOutputError {
    return StructuredOutputError.make({
      description: error.message,
      responseText,
    });
  }

  override get message(): string {
    return `Structured output validation failed: ${this.description}`;
  }
}

/**
 * Error indicating a codec transformer rejected a schema because it contains
 * unsupported constructs.
 *
 * **Details**
 *
 * Unsupported schema errors are not retryable because they indicate a
 * programmer error where the schema is incompatible with the provider.
 *
 * @example Creating an unsupported schema error
 *
 * ```ts
 * import { AiError } from "effect/unstable/ai"
 *
 * const error = new AiError.UnsupportedSchemaError({
 *   description: "Unions are not supported in Anthropic structured output"
 * })
 *
 * console.log(error.isRetryable) // false
 * console.log(error.message)
 * // "Unsupported schema: Unions are not supported in Anthropic structured output"
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class UnsupportedSchemaError extends S.ErrorClass<UnsupportedSchemaError>($I`UnsupportedSchemaError`)(
  {
    _tag: S.tag("UnsupportedSchemaError"),
    description: S.String,
    metadata: providerMetadataWithDefaults<UnsupportedSchemaErrorMetadata>(),
  },
  $I.annote("UnsupportedSchemaError", {
    description: "Error indicating a codec transformer rejected a schema because it contains unsupported constructs.",
  })
) {
  /**
   * Marks `UnsupportedSchemaError` as a semantic AI error reason for runtime guards.
   *
   * @since 0.0.0
   */
  readonly [ReasonTypeId] = ReasonTypeId;

  /**
   * Unsupported schema errors are not retryable because they indicate a programmer error.
   *
   * @since 0.0.0
   */
  get isRetryable(): boolean {
    return false;
  }

  override get message(): string {
    return `Unsupported schema: ${this.description}`;
  }
}

/**
 * Error data for unknown or unexpected AI failures.
 *
 * **Details**
 *
 * Unknown errors are not retryable by default since the cause is unknown.
 *
 * @example Creating an unknown error
 *
 * ```ts
 * import { AiError } from "effect/unstable/ai"
 *
 * const unknownError = new AiError.UnknownError({
 *   description: "An unexpected error occurred"
 * })
 *
 * console.log(unknownError.isRetryable) // false
 * console.log(unknownError.message)
 * // "An unexpected error occurred"
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class UnknownError extends S.ErrorClass<UnknownError>($I`UnknownError`)(
  {
    _tag: S.tag("UnknownError"),
    description: S.optional(S.String),
    metadata: providerMetadataWithDefaults<UnknownErrorMetadata>(),
    http: S.optional(HttpContext),
  },
  $I.annote("UnknownError", {
    description: "Error data for unknown or unexpected AI failures.",
  })
) {
  /**
   * Marks `UnknownError` as a semantic AI error reason for runtime guards.
   *
   * @since 0.0.0
   */
  readonly [ReasonTypeId] = ReasonTypeId;

  /**
   * Unknown errors are not retryable by default.
   *
   * @since 0.0.0
   */
  get isRetryable(): boolean {
    return false;
  }

  override get message(): string {
    return this.description ?? "Unknown error";
  }
}

// =============================================================================
// Tool Call Error Types
// =============================================================================

/**
 * Error indicating the model requested a tool that doesn't exist in the toolkit.
 *
 * **Details**
 *
 * This error is retryable because the model may self-correct when provided
 * with the list of available tools.
 *
 * @example Creating a tool not found error
 *
 * ```ts
 * import { AiError } from "effect/unstable/ai"
 *
 * const error = new AiError.ToolNotFoundError({
 *   toolName: "unknownTool",
 *   availableTools: ["GetWeather", "GetTime"]
 * })
 *
 * console.log(error.isRetryable) // true
 * console.log(error.message)
 * // "Tool 'unknownTool' not found. Available tools: GetWeather, GetTime"
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class ToolNotFoundError extends S.ErrorClass<ToolNotFoundError>($I`ToolNotFoundError`)(
  {
    _tag: S.tag("ToolNotFoundError"),
    toolName: S.String,
    availableTools: S.Array(S.String),
  },
  $I.annote("ToolNotFoundError", {
    description: "Error indicating the model requested a tool that doesn't exist in the toolkit.",
  })
) {
  /**
   * Marks `ToolNotFoundError` as a semantic AI error reason for runtime guards.
   *
   * @since 0.0.0
   */
  readonly [ReasonTypeId] = ReasonTypeId;

  /**
   * Tool not found errors are retryable because the model may self-correct.
   *
   * @since 0.0.0
   */
  get isRetryable(): boolean {
    return true;
  }

  override get message(): string {
    const availableTools = this.availableTools.length > 0 ? this.availableTools.join(", ") : "none";
    return `Tool '${this.toolName}' not found. Available tools: ${availableTools}`;
  }
}

/**
 * Error indicating the model's tool call parameters failed schema validation.
 *
 * **Details**
 *
 * This error is retryable because the model may correct its parameters
 * on subsequent attempts.
 *
 * @example Creating a tool parameter validation error
 *
 * ```ts
 * import { AiError } from "effect/unstable/ai"
 *
 * const error = new AiError.ToolParameterValidationError({
 *   toolName: "GetWeather",
 *   toolParams: { location: 123 },
 *   description: "Expected string, got number"
 * })
 *
 * console.log(error.isRetryable) // true
 * console.log(error.message)
 * // "Invalid parameters for tool 'GetWeather': Expected string, got number"
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class ToolParameterValidationError extends S.ErrorClass<ToolParameterValidationError>(
  $I`ToolParameterValidationError`
)(
  {
    _tag: S.tag("ToolParameterValidationError"),
    toolName: S.String,
    toolParams: S.Json,
    description: S.String,
  },
  $I.annote("ToolParameterValidationError", {
    description: "Error indicating the model's tool call parameters failed schema validation.",
  })
) {
  /**
   * Marks `ToolParameterValidationError` as a semantic AI error reason for runtime guards.
   *
   * @since 0.0.0
   */
  readonly [ReasonTypeId] = ReasonTypeId;

  /**
   * Parameter validation errors are retryable because the model may correct parameters.
   *
   * @since 0.0.0
   */
  get isRetryable(): boolean {
    return true;
  }

  override get message(): string {
    return `Invalid parameters for tool '${this.toolName}': ${this.description}`;
  }
}

/**
 * Error indicating the tool handler returned an invalid result that does not
 * match the tool's schema.
 *
 * **Details**
 *
 * This error is not retryable because invalid results indicate a bug in the
 * tool handler implementation.
 *
 * @example Creating an invalid tool result error
 *
 * ```ts
 * import { AiError } from "effect/unstable/ai"
 *
 * const error = new AiError.InvalidToolResultError({
 *   toolName: "GetWeather",
 *   description: "Tool handler returned invalid result: missing 'temperature' field"
 * })
 *
 * console.log(error.isRetryable) // false
 * console.log(error.message)
 * // "Tool 'GetWeather' returned invalid result: missing 'temperature' field"
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class InvalidToolResultError extends S.ErrorClass<InvalidToolResultError>($I`InvalidToolResultError`)(
  {
    _tag: S.tag("InvalidToolResultError"),
    toolName: S.String,
    description: S.String,
  },
  $I.annote("InvalidToolResultError", {
    description: "Error indicating the tool handler returned an invalid result that does not match the tool's schema.",
  })
) {
  /**
   * Marks `InvalidToolResultError` as a semantic AI error reason for runtime guards.
   *
   * @since 0.0.0
   */
  readonly [ReasonTypeId] = ReasonTypeId;

  /**
   * Invalid tool result errors are not retryable because they indicate a bug in the handler.
   *
   * @since 0.0.0
   */
  get isRetryable(): boolean {
    return false;
  }

  override get message(): string {
    return `Tool '${this.toolName}' returned invalid result: ${this.description}`;
  }
}

/**
 * Error indicating the tool result cannot be encoded for sending back to the model.
 *
 * **Details**
 *
 * This error is not retryable because encoding failures indicate a bug in the
 * tool schema definitions.
 *
 * @example Creating a tool result encoding error
 *
 * ```ts
 * import { AiError } from "effect/unstable/ai"
 *
 * const error = new AiError.ToolResultEncodingError({
 *   toolName: "GetWeather",
 *   toolResult: { temperature: 72n },
 *   description: "Cannot encode bigint values as JSON"
 * })
 *
 * console.log(error.isRetryable) // false
 * console.log(error.message)
 * // "Failed to encode result for tool 'GetWeather': Cannot encode bigint values as JSON"
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class ToolResultEncodingError extends S.ErrorClass<ToolResultEncodingError>($I`ToolResultEncodingError`)(
  {
    _tag: S.tag("ToolResultEncodingError"),
    toolName: S.String,
    toolResult: S.Unknown,
    description: S.String,
  },
  $I.annote("ToolResultEncodingError", {
    description: "Error indicating the tool result cannot be encoded for sending back to the model.",
  })
) {
  /**
   * Marks `ToolResultEncodingError` as a semantic AI error reason for runtime guards.
   *
   * @since 0.0.0
   */
  readonly [ReasonTypeId] = ReasonTypeId;

  /**
   * Encoding errors are not retryable because they indicate a code bug.
   *
   * @since 0.0.0
   */
  get isRetryable(): boolean {
    return false;
  }

  override get message(): string {
    return `Failed to encode result for tool '${this.toolName}': ${this.description}`;
  }
}

/**
 * Error indicating a provider-defined tool was configured with invalid arguments.
 *
 * **Details**
 *
 * This error is not retryable because it indicates a programming error in the
 * tool configuration that must be fixed in code.
 *
 * @example Creating a tool configuration error
 *
 * ```ts
 * import { AiError } from "effect/unstable/ai"
 *
 * const error = new AiError.ToolConfigurationError({
 *   toolName: "OpenAiCodeInterpreter",
 *   description: "Invalid container ID format"
 * })
 *
 * console.log(error.isRetryable) // false
 * console.log(error.message)
 * // "Invalid configuration for tool 'OpenAiCodeInterpreter': Invalid container ID format"
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class ToolConfigurationError extends S.ErrorClass<ToolConfigurationError>($I`ToolConfigurationError`)(
  {
    _tag: S.tag("ToolConfigurationError"),
    toolName: S.String,
    description: S.String,
  },
  $I.annote("ToolConfigurationError", {
    description: "Error indicating a provider-defined tool was configured with invalid arguments.",
  })
) {
  /**
   * Marks `ToolConfigurationError` as a semantic AI error reason for runtime guards.
   *
   * @since 0.0.0
   */
  readonly [ReasonTypeId] = ReasonTypeId;

  /**
   * Configuration errors are not retryable because they indicate a code bug.
   *
   * @since 0.0.0
   */
  get isRetryable(): boolean {
    return false;
  }

  override get message(): string {
    return `Invalid configuration for tool '${this.toolName}': ${this.description}`;
  }
}

/**
 * Error indicating an operation requires a toolkit but none was provided.
 *
 * **Details**
 *
 * This error occurs when tool approval responses are present in the prompt
 * but no toolkit was provided to resolve them.
 *
 * @example Creating a toolkit required error
 *
 * ```ts
 * import { AiError } from "effect/unstable/ai"
 *
 * const error = new AiError.ToolkitRequiredError({
 *   pendingApprovals: ["GetWeather", "SendEmail"]
 * })
 *
 * console.log(error.isRetryable) // false
 * console.log(error.message)
 * // "Toolkit required to resolve pending tool approvals: GetWeather, SendEmail"
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class ToolkitRequiredError extends S.ErrorClass<ToolkitRequiredError>($I`ToolkitRequiredError`)(
  {
    _tag: S.tag("ToolkitRequiredError"),
    pendingApprovals: S.Array(S.String),
    description: S.optional(S.String),
  },
  $I.annote("ToolkitRequiredError", {
    description: "Error indicating an operation requires a toolkit but none was provided.",
  })
) {
  /**
   * Marks `ToolkitRequiredError` as a semantic AI error reason for runtime guards.
   *
   * @since 0.0.0
   */
  readonly [ReasonTypeId] = ReasonTypeId;

  /**
   * Toolkit required errors are not retryable without providing a toolkit.
   *
   * @since 0.0.0
   */
  get isRetryable(): boolean {
    return false;
  }

  override get message(): string {
    const tools = this.pendingApprovals.join(", ");
    return `Toolkit required to resolve pending tool approvals: ${tools}`;
  }
}

/**
 * Error indicating the user provided invalid input in their prompt.
 *
 * **Details**
 *
 * This error is raised when the prompt contains content that is structurally
 * valid but not supported by the provider (e.g., unsupported media types,
 * unsupported file formats, etc.).
 *
 * @example Creating an invalid user input error
 *
 * ```ts
 * import { AiError } from "effect/unstable/ai"
 *
 * const error = new AiError.InvalidUserInputError({
 *   description: "Unsupported media type 'video/mp4'. Supported types include images, application/pdf, text/plain"
 * })
 *
 * console.log(error.isRetryable) // false
 * console.log(error.message)
 * // "Invalid user input: Unsupported media type 'video/mp4'. Supported types include images, application/pdf, text/plain"
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class InvalidUserInputError extends S.ErrorClass<InvalidUserInputError>($I`InvalidUserInputError`)(
  {
    _tag: S.tag("InvalidUserInputError"),
    description: S.String,
  },
  $I.annote("InvalidUserInputError", {
    description: "Error indicating the user provided invalid input in their prompt.",
  })
) {
  /**
   * Marks `InvalidUserInputError` as a semantic AI error reason for runtime guards.
   *
   * @since 0.0.0
   */
  readonly [ReasonTypeId] = ReasonTypeId;

  /**
   * Invalid user input errors require fixing the input and are not retryable.
   *
   * @since 0.0.0
   */
  get isRetryable(): boolean {
    return false;
  }

  override get message(): string {
    return `Invalid user input: ${this.description}`;
  }
}

// =============================================================================
// AiErrorReason Union
// =============================================================================

/**
 * Union type of all semantic error reasons that can occur during AI operations.
 *
 * **Details**
 *
 * Every reason carries a semantic `_tag`, a human-readable message, and an
 * `isRetryable` getter. Provider-facing reasons may also include retry timing,
 * provider metadata, usage information, or HTTP context.
 *
 * @category models
 * @since 0.0.0
 */
export type AiErrorReason =
  | RateLimitError
  | QuotaExhaustedError
  | AuthenticationError
  | ContentPolicyError
  | InvalidRequestError
  | InternalProviderError
  | NetworkError
  | InvalidOutputError
  | StructuredOutputError
  | UnsupportedSchemaError
  | UnknownError
  | ToolNotFoundError
  | ToolParameterValidationError
  | InvalidToolResultError
  | ToolResultEncodingError
  | ToolConfigurationError
  | ToolkitRequiredError
  | InvalidUserInputError;

/**
 * Schema for validating and parsing AI error reasons.
 *
 * **When to use**
 *
 * Use when decoding or validating unknown AI error reason values with S.
 *
 * **Details**
 *
 * This runtime schema is the union of the concrete AI error reason classes.
 *
 * @see {@link isAiErrorReason} for checking an existing value without Schema decoding
 *
 * @category schemas
 * @since 0.0.0
 */
export const AiErrorReason = S.Union([
  RateLimitError,
  QuotaExhaustedError,
  AuthenticationError,
  ContentPolicyError,
  InvalidRequestError,
  InternalProviderError,
  NetworkError,
  InvalidOutputError,
  StructuredOutputError,
  UnsupportedSchemaError,
  UnknownError,
  ToolNotFoundError,
  ToolParameterValidationError,
  InvalidToolResultError,
  ToolResultEncodingError,
  ToolConfigurationError,
  ToolkitRequiredError,
  InvalidUserInputError,
]).pipe(
  $I.annoteSchema("AiErrorReason", {
    description: "Schema for validating and parsing AI error reasons.",
  })
);

// =============================================================================
// Top-Level AiError
// =============================================================================

const TypeId = "~effect/unstable/ai/AiError/AiError" as const;

/**
 * Schema for the top-level AI error wrapper using the `reason` pattern.
 *
 * **When to use**
 *
 * Use when you need AI errors that can be handled by semantic reason with
 * `Effect.catchReason`.
 *
 * **Details**
 *
 * This error stores `module` and `method` context, the semantic `reason`, and
 * delegates `isRetryable` and `retryAfter` to the underlying reason.
 *
 * @example Handling an AI error by tag
 *
 * ```ts
 * import { Effect } from "effect"
 * import { AiError } from "effect/unstable/ai"
 *
 * const aiOperation = Effect.fail(
 *   AiError.make({
 *     module: "Example",
 *     method: "run",
 *     reason: AiError.RateLimitError.make({ retryAfter: "1 second" })
 *   })
 * )
 *
 * // Handle specific reason types
 * const handled = aiOperation.pipe(
 *   Effect.catchTag("AiError", (error) => {
 *     if (error.reason._tag === "RateLimitError") {
 *       return Effect.succeed(`Retry after ${error.retryAfter}`)
 *     }
 *     return Effect.fail(error)
 *   })
 * )
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export class AiError extends S.ErrorClass<AiError>($I`AiError`)(
  {
    _tag: S.tag("AiError"),
    module: S.String,
    method: S.String,
    reason: AiErrorReason,
  },
  $I.annote("AiError", {
    description: "Schema for the top-level AI error wrapper using the reason pattern.",
  })
) {
  readonly [TypeId] = TypeId;
  override readonly cause = this.reason;

  /**
   * Delegates to the underlying reason's `isRetryable` getter.
   *
   * @since 0.0.0
   */
  get isRetryable(): boolean {
    return this.reason.isRetryable;
  }

  /**
   * Delegates to the underlying reason's `retryAfter` if present.
   *
   * @since 0.0.0
   */
  get retryAfter(): Duration.Duration | undefined {
    return "retryAfter" in this.reason ? this.reason.retryAfter : undefined;
  }

  override get message(): string {
    return `${this.module}.${this.method}: ${this.reason.message}`;
  }
}

/**
 * The encoded (serialized) form of an `AiError`.
 *
 * @category schemas
 * @since 0.0.0
 */
export type AiErrorEncoded = (typeof AiError)["Encoded"];

/**
 * Type guard to check if a value is an `AiError`.
 *
 * @example Checking for an AI error
 *
 * ```ts
 * import { AiError } from "effect/unstable/ai"
 *
 * const someError = new Error("generic error")
 * const aiError = AiError.make({
 *   module: "Test",
 *   method: "example",
 *   reason: new AiError.RateLimitError({})
 * })
 *
 * console.log(AiError.isAiError(someError)) // false
 * console.log(AiError.isAiError(aiError)) // true
 * ```
 *
 * @category guards
 * @since 0.0.0
 */
export const isAiError = (u: unknown): u is AiError => P.hasProperty(u, TypeId);

/**
 * Type guard to check if a value is an `AiErrorReason`.
 *
 * @example Checking for an AI error reason
 *
 * ```ts
 * import { AiError } from "effect/unstable/ai"
 *
 * const rateLimitError = new AiError.RateLimitError({})
 * const genericError = new Error("generic error")
 *
 * console.log(AiError.isAiErrorReason(rateLimitError)) // true
 * console.log(AiError.isAiErrorReason(genericError)) // false
 * ```
 *
 * @category guards
 * @since 0.0.0
 */
export const isAiErrorReason = (u: unknown): u is AiErrorReason => P.hasProperty(u, ReasonTypeId);

/**
 * Creates an `AiError` with the given reason.
 *
 * @example Creating an AI error
 *
 * ```ts
 * import { Duration } from "effect"
 * import { AiError } from "effect/unstable/ai"
 *
 * const error = AiError.make({
 *   module: "OpenAI",
 *   method: "completion",
 *   reason: new AiError.RateLimitError({
 *     retryAfter: Duration.seconds(60)
 *   })
 * })
 *
 * console.log(error.message)
 * // "OpenAI.completion: Rate limit exceeded. Retry after 1 minute"
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const make = (params: {
  readonly module: string;
  readonly method: string;
  readonly reason: AiErrorReason;
}): AiError => AiError.make(params);

/**
 * Maps HTTP status codes to semantic error reasons.
 *
 * **When to use**
 *
 * Use as the base mapping when provider packages translate HTTP status codes into
 * provider-specific error reasons.
 *
 * @example Mapping an HTTP status to a reason
 *
 * ```ts
 * import { AiError } from "effect/unstable/ai"
 *
 * const reason = AiError.reasonFromHttpStatus({
 *   status: 429,
 *   body: { error: "Rate limit exceeded" }
 * })
 *
 * console.log(reason._tag) // "RateLimitError"
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const reasonFromHttpStatus = (params: {
  readonly status: number;
  readonly body?: unknown;
  readonly http?: HttpContext;
  readonly metadata?: ProviderMetadata;
  readonly description?: string | undefined;
}): AiErrorReason => {
  const { status, http, metadata, description } = params;
  const common = {
    http,
    ...(P.isNotUndefined(metadata) ? { metadata } : undefined),
    ...(P.isNotUndefined(description) ? { description } : undefined),
  };
  switch (status) {
    case 400:
      return InvalidRequestError.make(common);
    case 401:
      return AuthenticationError.make({ kind: "InvalidKey", ...common });
    case 403:
      return AuthenticationError.make({ kind: "InsufficientPermissions", ...common });
    case 429:
      return RateLimitError.make(common);
    default:
      if (status >= 500) {
        return InternalProviderError.make({ description: "Server error", ...common });
      }
      return UnknownError.make(common);
  }
};
