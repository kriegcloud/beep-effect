import { BS } from "@beep/schema";
import { HttpRequestDetails } from "@beep/schema/http";
import type { UnsafeTypes } from "@beep/types";
import type * as HttpClientError from "@effect/platform/HttpClientError";
import * as Effect from "effect/Effect";
import * as Inspectable from "effect/Inspectable";
import * as Match from "effect/Match";
import type { ParseError } from "effect/ParseResult";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";

/**
 * Unique identifier for IAM errors.
 *
 * @since 1.0.0
 * @category Type Ids
 */
export const TypeId = Symbol.for("@beep/iam/IamError");

/**
 * Type-level representation of the IAM error identifier.
 *
 * @since 1.0.0
 * @category Type Ids
 */
export type TypeId = typeof TypeId;

/**
 * Type guard to check if a value is an IAM error.
 *
 * @param u - The value to check
 * @returns `true` if the value is an `IamError`, `false` otherwise
 *
 * @example
 * ```ts
 * import { IamError } from "@beep/iam-sdk"
 *
 * const someError = new Error("generic error")
 * const iamError = new IamError.UnknownError({
 *   module: "Test",
 *   method: "example"
 * })
 *
 * console.log(IamError.isIamError(someError)) // false
 * console.log(IamError.isIamError(aiError))   // true
 * ```
 *
 * @since 1.0.0
 * @category Guards
 */
// export const isIamError = (u: unknown): u is Iam

// =====================================================================================================================
// IamError Utils
// =====================================================================================================================
/**
 * Returns a suggestion for handling an HTTP response error based on the status code.
 *
 * @param statusCode - The HTTP status code
 * @returns A suggestion for handling the error
 */
const getStatusCodeSuggestion = (statusCode: number): string => {
  if (statusCode >= 400 && statusCode < 500) {
    return Match.value(statusCode).pipe(
      Match.when(
        400,
        () => "Bad Request - Check request parameters, headers, and body format against API documentation."
      ),
      Match.when(401, () => "Unauthorized - Verify API key, authentication credentials, or token expiration."),
      Match.when(403, () => "Forbidden - Check API permissions, usage limits, or resource access rights."),
      Match.when(404, () => "Not Found - Verify the endpoint URL, API version, and resource identifiers."),
      Match.when(408, () => "Request Timeout - Consider increasing timeout duration or implementing retry logic."),
      Match.when(422, () => "Unprocessable Entity - Check request data validation, required fields, and data formats."),
      Match.when(429, () => "Rate Limited - Implement exponential backoff or reduce request frequency."),
      Match.orElse(() => "Client error - Review request format, parameters, and API documentation.")
    );
  }
  if (statusCode >= 500) {
    return "Server error - This is likely temporary. Implement retry logic with exponential backoff.";
  }
  return "Check API documentation for this status code.";
};

// =====================================================================================================================
// Http Request Error
// =====================================================================================================================

export const HttpRequestErrorReasonKit = BS.stringLiteralKit("Transport", "Encode", "InvalidUrl");

export class HttpRequestErrorReason extends HttpRequestErrorReasonKit.Schema.annotations({
  schemaId: Symbol.for("@beep/iam/IamError/HttpRequestErrorReason"),
  identifier: "HttpRequestErrorReason",
  title: "HTTP Request Error Reason",
  description: "Reason for an HTTP request error.",
}) {
  static readonly Options = HttpRequestErrorReasonKit.Options;
  static readonly Enum = HttpRequestErrorReasonKit.Enum;
}

export declare namespace HttpRequestErrorReason {
  export type Type = typeof HttpRequestErrorReason.Type;
  export type Encoded = typeof HttpRequestErrorReason.Encoded;
}

/**
 * Error that occurs during HTTP request processing.
 *
 * This error is raised when issues arise before receiving an HTTP response,
 * such as network connectivity problems, request encoding issues, or invalid
 * URLs.
 *
 * @example
 * ```ts
 * import { IamError } from "@beep/iam-sdk"
 * import { Effect } from "effect"
 *
 * const handleNetworkError = Effect.gen(function* () {
 *   const error = new IamError.HttpRequestError({
 *     module: "OpenAI",
 *     method: "createCompletion",
 *     reason: "Transport",
 *     request: {
 *       method: "POST",
 *       url: BS.URLString.make("https://api.openai.com/v1/completions"),
 *       urlParams: [],
 *       hash: Option.none(),
 *       headers: { "Content-Type": "application/json" }
 *     },
 *     description: "Connection timeout after 30 seconds"
 *   })
 *
 *   console.log(error.message)
 *   // "Transport: Connection timeout after 30 seconds (POST https://api.openai.com/v1/completions)"
 * })
 * ```
 *
 * @since 1.0.0
 * @category Errors
 */
export class HttpRequestError extends S.TaggedError<HttpRequestError>("@beep/iam-sdk/IamError/HttpRequestError")(
  "HttpRequestError",
  {
    module: S.String,
    method: S.String,
    reason: HttpRequestErrorReason,
    request: BS.HttpRequestDetails,
    description: S.optional(S.String),
    cause: S.optional(S.Defect),
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/IamError/HttpRequestError"),
    identifier: "HttpRequestError",
    title: "HTTP Request Error",
    description: "Error that occurs during HTTP request processing.",
  }
) {
  /**
   * @since 1.0.0
   */
  readonly [TypeId]: TypeId = TypeId;

  /**
   * Creates an HttpRequestError from a platform HttpClientError.RequestError.
   *
   * @example
   * ```ts
   * import { IamError } from "@beep/iam-sdk"
   * import { HttpClientError } from "@effect/platform"
   * import * as O from "effect/Option"
   *
   * declare const platformError: HttpClientError.RequestError
   *
   * const iamError = IamError.HttpRequestError.fromRequestError({
   *   module: "ChatGPT",
   *   method: "sendMessage",
   *   error: platformError
   * })
   * ```
   *
   * @since 1.0.0
   * @category Constructors
   */
  static readonly fromRequestError = ({
    error,
    ...params
  }: {
    readonly module: string;
    readonly method: string;
    readonly error: HttpClientError.RequestError;
  }): HttpRequestError =>
    new HttpRequestError({
      ...params,
      cause: error,
      description: error.description,
      reason: error.reason,
      request: {
        hash: error.request.hash,
        headers: Inspectable.redact(error.request.headers) as UnsafeTypes.UnsafeAny,
        method: error.request.method,
        url: BS.URLString.make(error.request.url),
        urlParams: error.request.urlParams,
      },
    });

  get message(): string {
    const methodAndUrl = `${this.request.method} ${this.request.url}` as const;

    let baseMessage = this.description
      ? (`${this.reason}: ${this.description}` as const)
      : `${this.reason}: An HTTP request error occurred.`;

    baseMessage += ` (${methodAndUrl})`;

    let suggestion = "";

    Match.value(this.reason).pipe(
      Match.when(HttpRequestErrorReason.Enum.Encode, () => {
        suggestion += "Check the request body for any invalid data.";
      }),
      Match.when(HttpRequestErrorReason.Enum.InvalidUrl, () => {
        suggestion += "Verify that the URL format is correct and that all required parameters have been provided.";
        suggestion += " Check for any special characters that may need encoding.";
      }),
      Match.when(HttpRequestErrorReason.Enum.Transport, () => {
        suggestion += "Check your network connection and try again.";
      }),
      Match.exhaustive
    );

    baseMessage += `\n\nSuggestion: ${suggestion}`;

    return baseMessage;
  }
}

// =====================================================================================================================
// Http Response Error
// =====================================================================================================================

/**
 * Schema for HTTP response details used in error reporting.
 *
 * Captures essential information about HTTP responses that caused errors,
 * including status codes and headers for debugging purposes.
 *
 * @example
 * ```ts
 * import { IamError } from "@beep/iam-sdk"
 *
 * const responseDetails: typeof IamError.HttpResponseDetails.Type = {
 *   status: 429,
 *   headers: {
 *     "Content-Type": "application/json",
 *     "X-RateLimit-Remaining": "0",
 *     "Retry-After": "60"
 *   }
 * }
 * ```
 *
 * @since 1.0.0
 * @category Schemas
 */
export class HttpResponseDetails extends BS.Class<HttpResponseDetails>("HttpResponseDetails")(
  {
    status: S.Number,
    headers: S.Record({ key: S.String, value: S.String }),
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/IamError/HttpResponseDetails"),
    identifier: "HttpResponseDetails",
    title: "HTTP Response Details",
    description: "Details about an HTTP response that caused an error.",
  }
) {}

export declare namespace HttpResponseDetails {
  export type Type = S.Schema.Type<typeof HttpResponseDetails>;
  export type Encoded = S.Schema.Encoded<typeof HttpResponseDetails>;
}

export const HttpResponseErrorReasonKit = BS.stringLiteralKit("StatusCode", "Decode", "EmptyBody");

export class HttpResponseErrorReason extends HttpResponseErrorReasonKit.Schema.annotations({
  schemaId: Symbol.for("@beep/iam-sdk/IamError/HttpResponseErrorReason"),
  identifier: "HttpResponseErrorReason",
  title: "HTTP Response Error Reason",
  description: "Reason for an HTTP response error.",
}) {
  static readonly Options = HttpResponseErrorReasonKit.Options;
  static readonly Enum = HttpResponseErrorReasonKit.Enum;
}

export declare namespace HttpResponseErrorReason {
  export type Type = typeof HttpRequestErrorReason.Type;
  export type Encoded = typeof HttpRequestErrorReason.Encoded;
}

/**
 * Error that occurs during HTTP response processing.
 *
 * This error is thrown when issues arise after receiving an HTTP response,
 * such as unexpected status codes, response decoding failures, or empty
 * response bodies.
 *
 * @example
 * ```ts
 * import { IamError } from "@beep/iam-sdk"
 * import * as O from "effect"
 *
 * const responseError = new IamError.HttpResponseError({
 *   module: "OpenAI",
 *   method: "createCompletion",
 *   reason: "StatusCode",
 *   request: {
 *     method: "POST",
 *     url: BS.URLString.make("https://api.openai.com/v1/completions",
 *     urlParams: [],
 *     hash: O.none(),
 *     headers: { "Content-Type": "application/json" }
 *   },
 *   response: {
 *     status: 429,
 *     headers: { "X-RateLimit-Remaining": "0" }
 *   },
 *   description: "Rate limit exceeded"
 * })
 *
 * console.log(responseError.message)
 * // "StatusCode: Rate limit exceeded (429 POST https://api.openai.com/v1/completions)"
 * ```
 *
 * @since 1.0.0
 * @category Errors
 */
export class HttpResponseError extends S.TaggedError<HttpResponseError>("@beep/iam-sdk/IamError/HttpResponseError")(
  "HttpResponseError",
  {
    module: S.String,
    method: S.String,
    request: HttpRequestDetails,
    response: HttpResponseDetails,
    body: S.optional(S.String),
    reason: HttpResponseErrorReason,
    description: S.optional(S.String),
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/IamError/HttpResponseError"),
    identifier: "HttpResponseError",
    title: "HTTP Response Error",
    description: "Error that occurs during HTTP response processing.",
  }
) {
  /**
   * @since 1.0.0
   */
  readonly [TypeId]: TypeId = TypeId;

  /**
   * Creates an HttpResponseError from a platform HttpClientError.ResponseError.
   *
   * @example
   * ```ts
   * import { IamError } from "@beep/iam-sdk"
   * import { Headers, HttpClientError } from "@effect/platform"
   * import * as O from "effect/Option"
   *
   * declare const platformError: HttpClientError.ResponseError
   *
   * const iamError = IamError.HttpResponseError.fromResponseError({
   *   module: "OpenAI",
   *   method: "completion",
   *   error: platformError
   * })
   * ```
   *
   * @since 1.0.0
   * @category Constructors
   */
  static fromResponseError = ({
    error,
    ...params
  }: {
    readonly module: string;
    readonly method: string;
    readonly error: HttpClientError.ResponseError;
  }): Effect.Effect<never, HttpResponseError> => {
    let body: Effect.Effect<unknown, HttpClientError.ResponseError> = Effect.void;
    const contentType = error.response.headers["content-type"] ?? "";
    if (contentType.includes("application/json")) {
      body = error.response.json;
    } else if (contentType.includes("text/") || contentType.includes("urlencoded")) {
      body = error.response.text;
    }
    return Effect.flatMap(
      Effect.merge(body),
      (body) =>
        new HttpResponseError({
          ...params,
          description: error.description,
          reason: error.reason,
          request: {
            hash: error.request.hash,
            headers: Inspectable.redact(error.request.headers) as any,
            method: error.request.method,
            url: BS.URLString.make(error.request.url),
            urlParams: error.request.urlParams,
          },
          response: {
            headers: Inspectable.redact(error.response.headers) as any,
            status: error.response.status,
          },
          body: Inspectable.format(body),
        })
    );
  };

  get message(): string {
    const methodUrlStatus = `${this.response.status} ${this.request.method} ${this.request.url}` as const;

    let baseMessage = this.description
      ? (`${this.reason}: ${this.description}` as const)
      : (`${this.reason}: An HTTP response error occurred.` as const);

    baseMessage += ` (${methodUrlStatus})` as const;

    let suggestion = "";
    Match.value(this.reason).pipe(
      Match.when(HttpResponseErrorReason.Enum.Decode, () => {
        suggestion +=
          "The response format does not match what is expected. " +
          "Verify API version compatibility, check response content-type, " +
          "and/or examine if the endpoint schema has changed.";
      }),
      Match.when(HttpResponseErrorReason.Enum.EmptyBody, () => {
        suggestion +=
          "The response body was empty. This may indicate a server " +
          "issue, API version mismatch, or the endpoint may have changed its response format.";
      }),
      Match.when(HttpResponseErrorReason.Enum.StatusCode, () => {
        suggestion += getStatusCodeSuggestion(this.response.status);
      }),
      Match.exhaustive
    );
    switch (this.reason) {
      case "Decode": {
        suggestion +=
          "The response format does not match what is expected. " +
          "Verify API version compatibility, check response content-type, " +
          "and/or examine if the endpoint schema has changed.";
        break;
      }
      case "EmptyBody": {
        suggestion +=
          "The response body was empty. This may indicate a server " +
          "issue, API version mismatch, or the endpoint may have changed its response format.";
        break;
      }
      case "StatusCode": {
        suggestion += getStatusCodeSuggestion(this.response.status);
        break;
      }
    }

    baseMessage += `\n\n${suggestion}`;

    if (P.isNotUndefined(this.body)) {
      baseMessage += `\n\nResponse Body: ${this.body}`;
    }

    return baseMessage;
  }
}

// =============================================================================
// Malformed Input Error
// =============================================================================

/**
 * Error thrown when input data doesn't match the expected format or schema.
 *
 * This error occurs when the data provided to an AI operation fails validation,
 * is missing required fields, or doesn't conform to the expected structure.
 *
 * @example
 * ```ts
 * import { IamError } from "@beep/iam-sdk"
 * import * as Effect from "effect/Effect"
 *
 * const validateInput = (data: unknown) =>
 *   typeof data === "string" && data.length > 0
 *     ? Effect.succeed(data)
 *     : Effect.fail(new IamError.MalformedInput({
 *         module: "ChatBot",
 *         method: "processMessage",
 *         description: "Input must be a non-empty string"
 *       }))
 *
 * const program = validateInput("").pipe(
 *   Effect.catchTag("MalformedInput", (error) => {
 *     console.log(`Input validation failed: ${error.description}`)
 *     return Effect.succeed("Please provide a valid message")
 *   })
 * )
 * ```
 *
 * @since 1.0.0
 * @category Errors
 */
export class MalformedInput extends S.TaggedError<MalformedInput>("@beep/iam-sdk/IamError/MalformedInput")(
  "MalformedInput",
  {
    module: S.String,
    method: S.String,
    description: S.optional(S.String),
    cause: S.optional(S.Defect),
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/IamError/MalformedInput"),
    identifier: "MalformedInput",
    title: "Malformed Input Error",
    description: "Error thrown when input data doesn't match the expected format or schema.",
  }
) {
  /**
   * @since 1.0.0
   */
  readonly [TypeId]: TypeId = TypeId;
}

// =============================================================================
// Malformed Output Error
// =============================================================================

/**
 * Error thrown when output data can't be parsed or validated.
 *
 * This error occurs when AI service responses don't match the expected format,
 * contain invalid data structures, or fail schema validation during parsing.
 *
 * @example
 * ```ts
 * import { IamError } from "@beep/iam-sdk"
 * import * as S from "effect/Schema";
 * import * as Effect from "effect/Effect"
 *
 * const ResponseSchema = S.Struct({
 *   message: S.String,
 *   tokens: S.Number
 * })
 *
 * const parseResponse = (data: unknown) =>
 *   S.decodeUnknown(ResponseSchema)(data).pipe(
 *     Effect.mapError(parseError =>
 *       new IamError.MalformedOutput({
 *         module: "OpenAI",
 *         method: "completion",
 *         description: "Response doesn't match expected schema",
 *         cause: parseError
 *       })
 *     )
 *   )
 *
 * const program = parseResponse({ invalid: "data" }).pipe(
 *   Effect.catchTag("MalformedOutput", (error) => {
 *     console.log(`Parsing failed: ${error.description}`)
 *     return Effect.succeed({ message: "Error", tokens: 0 })
 *   })
 * )
 * ```
 *
 * @since 1.0.0
 * @category Errors
 */
export class MalformedOutput extends S.TaggedError<MalformedOutput>("@beep/iam-sdk/IamError/MalformedOutput")(
  "MalformedOutput",
  {
    module: S.String,
    method: S.String,
    description: S.optional(S.String),
    cause: S.optional(S.Defect),
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/IamError/MalformedOutput"),
    identifier: "MalformedOutput",
    title: "Malformed Output Error",
    description: "Error thrown when output data can't be parsed or validated.",
  }
) {
  /**
   * @since 1.0.0
   */
  readonly [TypeId]: TypeId = TypeId;

  /**
   * Creates a MalformedOutput error from a Schema ParseError.
   *
   * @example
   * ```ts
   * import { IamError } from "@beep/iam-sdk";
   * import * as Effect from "effect/Effect";
   * import * as S from "effect/Schema"
   *
   * const UserSchema = S.Struct({
   *   name: S.String,
   *   age: S.Number
   * })
   *
   * const parseUser = (data: unknown) =>
   *   S.decodeUnknown(UserSchema)(data).pipe(
   *     Effect.mapError((parseError) =>
   *       IamError.MalformedOutput.fromParseError({
   *         module: "UserService",
   *         method: "parseUserData",
   *         error: parseError
   *       })
   *     )
   *   )
   * ```
   *
   * @since 1.0.0
   * @category Constructors
   */
  static fromParseError({
    error,
    ...params
  }: {
    readonly module: string;
    readonly method: string;
    readonly description?: string;
    readonly error: ParseError;
  }): MalformedOutput {
    return new MalformedOutput({
      ...params,
      cause: error,
    });
  }
}

// =============================================================================
// Unknown Error
// =============================================================================

/**
 * Catch-all error for unexpected runtime errors in AI operations.
 *
 * This error is used when an unexpected exception occurs that doesn't fit
 * into the other specific error categories. It provides context about where
 * the error occurred and preserves the original cause for debugging.
 *
 * @example
 * ```ts
 * import { IamError } from "@beep/iam-sdk"
 * import * as Effect from "effect/Effect"
 *
 * const riskyOperation = () => {
 *   try {
 *     // Some operation that might throw
 *     throw new Error("Unexpected network issue")
 *   } catch (cause) {
 *     return Effect.fail(new IamError.UnknownError({
 *       module: "ChatService",
 *       method: "sendMessage",
 *       description: "An unexpected error occurred during message processing",
 *       cause
 *     }))
 *   }
 * }
 *
 * const program = riskyOperation().pipe(
 *   Effect.catchTag("UnknownError", (error) => {
 *     console.log(error.message)
 *     // "ChatService.sendMessage: An unexpected error occurred during message processing"
 *     return Effect.succeed("Service temporarily unavailable")
 *   })
 * )
 * ```
 *
 * @since 1.0.0
 * @category Errors
 */
export class UnknownError extends S.TaggedError<UnknownError>("@beep/iam-sdk/UnknownError")(
  "UnknownError",
  {
    module: S.String,
    method: S.String,
    description: S.optional(S.String),
    cause: S.optional(S.Defect),
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/UnknownError"),
    identifier: "UnknownError",
    title: "Unknown Error",
    description: "Catch-all error for unexpected runtime errors in AI operations.",
  }
) {
  /**
   * @since 1.0.0
   */
  readonly [TypeId]: TypeId = TypeId;

  /**
   * @since 1.0.0
   */
  get message(): string {
    const moduleMethod = `${this.module}.${this.method}`;
    return P.isUndefined(this.description)
      ? `${moduleMethod}: An error occurred`
      : `${moduleMethod}: ${this.description}`;
  }
}

// =============================================================================
// IamError
// =============================================================================

/**
 * Schema for validating and parsing AI errors.
 *
 * This schema can be used to decode unknown values into properly typed AI
 * errors, ensuring type safety when handling errors from external sources or
 * serialized data.
 *
 * @example
 * ```ts
 * import { IamError } from "@beep/iam-sdk"
 * import * as S from "effect/Schema";
 * import * as Effect from "effect/Effect";
 *
 * const parseIamError = (data: unknown) =>
 *   S.decodeUnknown(IamError.IamError)(data).pipe(
 *     Effect.map(error => {
 *       console.log(`Parsed AI error: ${error._tag}`)
 *       return error
 *     }),
 *     Effect.catchAll(() =>
 *       Effect.succeed(new IamError.UnknownError({
 *         module: "Parser",
 *         method: "parseIamError",
 *         description: "Failed to parse error data"
 *       }))
 *     )
 *   )
 * ```
 *
 * @since 1.0.0
 * @category Schemas
 */

export class IamError extends S.Union(
  HttpRequestError,
  HttpResponseError,
  MalformedInput,
  MalformedOutput,
  UnknownError
).annotations({
  schemaId: Symbol.for("@beep/iam-sdk/IamError"),
  identifier: "IamError",
  title: "IamError",
  description: "Union type representing all possible AI operation errors.",
}) {}

export declare namespace IamError {
  /**
   * Union type representing all possible AI operation errors.
   *
   * This type encompasses all error cases that can occur during AI operations,
   * providing a comprehensive error handling surface for applications.
   *
   * @example
   * ```ts
   * import { IamError } from "@beep/iam-sdk"
   * import * as Effect from "effect/Effect";
   * import * as Match from "effect/Match";
   * const handleAnyIamError = Match.type<IamError.IamError>().pipe(
   *   Match.tag("HttpRequestError", (err) =>
   *     `Network error: ${err.reason}`
   *   ),
   *   Match.tag("HttpResponseError", (err) =>
   *     `Server error: HTTP ${err.response.status}`
   *   ),
   *   Match.tag("MalformedInput", (err) =>
   *     `Invalid input: ${err.description || "Data validation failed"}`
   *   ),
   *   Match.tag("MalformedOutput", (err) =>
   *     `Invalid response: ${err.description || "Response parsing failed"}`
   *   ),
   *   Match.orElse((err) =>
   *     `Unknown error: ${err.message}`
   *   )
   * )
   * ```
   *
   * @since 1.0.0
   * @category Models
   */
  export type Type = S.Schema.Type<typeof IamError>;
  export type Encoded = S.Schema.Encoded<typeof IamError>;
}

export { HttpRequestDetails };
