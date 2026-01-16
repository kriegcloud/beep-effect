import type * as HttpClientError from "@effect/platform/HttpClientError";
import * as Effect from "effect/Effect";
import * as Inspectable from "effect/Inspectable";
import type { ParseError } from "effect/ParseResult";
import * as Predicate from "effect/Predicate";
import * as Schema from "effect/Schema";

export const TypeId = "~@beep/iam-client/ContractError";

export type TypeId = typeof TypeId;

export const isContractError = (u: unknown): u is ContractError => Predicate.hasProperty(u, TypeId);

export const HttpRequestDetails = Schema.Struct({
  method: Schema.Literal("GET", "POST", "PATCH", "PUT", "DELETE", "HEAD", "OPTIONS"),
  url: Schema.String,
  urlParams: Schema.Array(Schema.Tuple(Schema.String, Schema.String)),
  hash: Schema.Option(Schema.String),
  headers: Schema.Record({ key: Schema.String, value: Schema.String }),
}).annotations({ identifier: "HttpRequestDetails" });

export class HttpRequestError extends Schema.TaggedError<HttpRequestError>(
  "@effect/iam-client/ContractError/HttpRequestError"
)("HttpRequestError", {
  module: Schema.String,
  method: Schema.String,
  reason: Schema.Literal("Transport", "Encode", "InvalidUrl"),
  request: HttpRequestDetails,
  description: Schema.optional(Schema.String),
  cause: Schema.optional(Schema.Defect),
}) {
  /**
   * @since 1.0.0
   */
  readonly [TypeId]: TypeId = TypeId;

  static fromRequestError({
    error,
    ...params
  }: {
    readonly module: string;
    readonly method: string;
    readonly error: HttpClientError.RequestError;
  }): HttpRequestError {
    return new HttpRequestError({
      ...params,
      cause: error,
      description: error.description,
      reason: error.reason,
      request: {
        hash: error.request.hash,
        headers: Inspectable.redact(error.request.headers) as any,
        method: error.request.method,
        url: error.request.url,
        urlParams: error.request.urlParams,
      },
    });
  }

  override get message(): string {
    const methodAndUrl = `${this.request.method} ${this.request.url}`;

    let baseMessage = this.description
      ? `${this.reason}: ${this.description}`
      : `${this.reason}: An HTTP request error occurred.`;

    baseMessage += ` (${methodAndUrl})`;

    let suggestion = "";
    switch (this.reason) {
      case "Encode": {
        suggestion += "Check that the request body data is properly formatted and matches the expected content type.";
        break;
      }

      case "InvalidUrl": {
        suggestion += "Verify that the URL format is correct and that all required parameters have been provided.";
        suggestion += " Check for any special characters that may need encoding.";
        break;
      }

      case "Transport": {
        suggestion += "Check your network connection and verify that the requested URL is accessible.";
        break;
      }
    }

    baseMessage += `\n\nSuggestion: ${suggestion}`;

    return baseMessage;
  }
}

export const HttpResponseDetails = Schema.Struct({
  status: Schema.Number,
  headers: Schema.Record({ key: Schema.String, value: Schema.String }),
}).annotations({ identifier: "HttpResponseDetails" });

export class HttpResponseError extends Schema.TaggedError<HttpResponseError>(
  "@effect/iam-client/ContractError/HttpResponseError"
)("HttpResponseError", {
  module: Schema.String,
  method: Schema.String,
  request: HttpRequestDetails,
  response: HttpResponseDetails,
  body: Schema.optional(Schema.String),
  reason: Schema.Literal("StatusCode", "Decode", "EmptyBody"),
  description: Schema.optional(Schema.String),
}) {
  /**
   * @since 1.0.0
   */
  readonly [TypeId]: TypeId = TypeId;

  static fromResponseError({
    error,
    ...params
  }: {
    readonly module: string;
    readonly method: string;
    readonly error: HttpClientError.ResponseError;
  }): Effect.Effect<never, HttpResponseError> {
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
            url: error.request.url,
            urlParams: error.request.urlParams,
          },
          response: {
            headers: Inspectable.redact(error.response.headers) as any,
            status: error.response.status,
          },
          body: Inspectable.format(body),
        })
    );
  }

  override get message(): string {
    const methodUrlStatus = `${this.response.status} ${this.request.method} ${this.request.url}`;

    let baseMessage = this.description
      ? `${this.reason}: ${this.description}`
      : `${this.reason}: An HTTP response error occurred.`;

    baseMessage += ` (${methodUrlStatus})`;

    let suggestion = "";
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

    if (Predicate.isNotUndefined(this.body)) {
      baseMessage += `\n\nResponse Body: ${this.body}`;
    }

    return baseMessage;
  }
}

export class MalformedInput extends Schema.TaggedError<MalformedInput>(
  "@effect/iam-client/ContractError/MalformedInput"
)("MalformedInput", {
  module: Schema.String,
  method: Schema.String,
  description: Schema.optional(Schema.String),
  cause: Schema.optional(Schema.Defect),
}) {
  /**
   * @since 1.0.0
   */
  readonly [TypeId]: TypeId = TypeId;
}

export class MalformedOutput extends Schema.TaggedError<MalformedOutput>(
  "@effect/iam-client/ContractError/MalformedOutput"
)("MalformedOutput", {
  module: Schema.String,
  method: Schema.String,
  description: Schema.optional(Schema.String),
  cause: Schema.optional(Schema.Defect),
}) {
  /**
   * @since 1.0.0
   */
  readonly [TypeId]: TypeId = TypeId;

  static fromParseError({
    error,
    ...params
  }: {
    readonly module: string;
    readonly method: string;
    readonly description?: string;
    readonly error: ParseError;
  }): MalformedOutput {
    // TODO(Max): enhance
    return new MalformedOutput({
      ...params,
      cause: error,
    });
  }
}

export class UnknownError extends Schema.TaggedError<UnknownError>("@effect/iam-client/UnknownError")("UnknownError", {
  module: Schema.String,
  method: Schema.String,
  description: Schema.optional(Schema.String),
  cause: Schema.optional(Schema.Defect),
}) {
  /**
   * @since 1.0.0
   */
  readonly [TypeId]: TypeId = TypeId;

  /**
   * @since 1.0.0
   */
  override get message(): string {
    const moduleMethod = `${this.module}.${this.method}`;
    return Predicate.isUndefined(this.description)
      ? `${moduleMethod}: An error occurred`
      : `${moduleMethod}: ${this.description}`;
  }
}

export type ContractError = HttpRequestError | HttpResponseError | MalformedInput | MalformedOutput | UnknownError;

export const ContractError: Schema.Union<
  [
    typeof HttpRequestError,
    typeof HttpResponseError,
    typeof MalformedInput,
    typeof MalformedOutput,
    typeof UnknownError,
  ]
> = Schema.Union(HttpRequestError, HttpResponseError, MalformedInput, MalformedOutput, UnknownError);

// =============================================================================
// Utilities
// =============================================================================

const getStatusCodeSuggestion = (statusCode: number): string => {
  if (statusCode >= 400 && statusCode < 500) {
    switch (statusCode) {
      case 400:
        return "Bad Request - Check request parameters, headers, and body format against API documentation.";
      case 401:
        return "Unauthorized - Verify API key, authentication credentials, or token expiration.";
      case 403:
        return "Forbidden - Check API permissions, usage limits, or resource access rights.";
      case 404:
        return "Not Found - Verify the endpoint URL, API version, and resource identifiers.";
      case 408:
        return "Request Timeout - Consider increasing timeout duration or implementing retry logic.";
      case 422:
        return "Unprocessable Entity - Check request data validation, required fields, and data formats.";
      case 429:
        return "Rate Limited - Implement exponential backoff or reduce request frequency.";
      default:
        return "Client error - Review request format, parameters, and API documentation.";
    }
  }
  if (statusCode >= 500) {
    return "Server error - This is likely temporary. Implement retry logic with exponential backoff.";
  }
  return "Check API documentation for this status code.";
};
