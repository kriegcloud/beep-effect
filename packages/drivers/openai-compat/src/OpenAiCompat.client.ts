/**
 * OpenAI-compatible HTTP client service and layer helpers.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $OpenaiCompatId } from "@beep/identity";
import { decodeJsonString } from "@beep/schema/Json";
import { Context, Effect, flow, Layer, pipe, Stream } from "effect";
import * as A from "effect/Array";
import { identity } from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as AiError from "effect/unstable/ai/AiError";
import * as Sse from "effect/unstable/encoding/Sse";
import { FetchHttpClient } from "effect/unstable/http";
import * as Headers from "effect/unstable/http/Headers";
import type * as HttpBody from "effect/unstable/http/HttpBody";
import * as HttpClient from "effect/unstable/http/HttpClient";
import type * as HttpClientError from "effect/unstable/http/HttpClientError";
import * as HttpClientRequest from "effect/unstable/http/HttpClientRequest";
import * as HttpClientResponse from "effect/unstable/http/HttpClientResponse";
import {
  decodeChatCompletionChunk,
  type OpenAiCompatChatCompletionChunk,
  OpenAiCompatChatCompletionRequest,
  OpenAiCompatChatCompletionResponse,
} from "./OpenAiCompat.models.ts";

const $I = $OpenaiCompatId.create("OpenAiCompat.client");
const moduleName = "OpenAiCompatClient";

/**
 * Runtime configuration accepted by {@link OpenAiCompatClient.makeLayer}.
 *
 * @example
 * ```ts
 * import { Redacted } from "effect"
 * import { OpenAiCompatClientOptions } from "@beep/openai-compat"
 *
 * const options = new OpenAiCompatClientOptions({
 *   apiKey: Redacted.make("test-key"),
 *   apiUrl: "https://provider.example/v1"
 * })
 *
 * void options
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class OpenAiCompatClientOptions extends S.Class<OpenAiCompatClientOptions>($I`OpenAiCompatClientOptions`)(
  {
    apiKey: S.optionalKey(S.String.pipe(S.RedactedFromValue)),
    apiUrl: S.optionalKey(S.String),
    headers: S.optionalKey(S.Record(S.String, S.String)),
  },
  $I.annote("OpenAiCompatClientOptions", {
    description: "Runtime configuration accepted by the OpenAI-compatible client layer.",
  })
) {}

/**
 * OpenAI-compatible HTTP client service shape.
 *
 * @example
 * ```ts
 * import { Effect, Stream } from "effect"
 * import {
 *   OpenAiCompatChatCompletionResponse,
 *   type OpenAiCompatClientShape
 * } from "@beep/openai-compat"
 *
 * const client: OpenAiCompatClientShape = {
 *   createChatCompletion: () =>
 *     Effect.succeed(new OpenAiCompatChatCompletionResponse({ choices: [] })),
 *   streamChatCompletion: () => Stream.empty
 * }
 *
 * void client.createChatCompletion
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export interface OpenAiCompatClientShape {
  readonly createChatCompletion: (
    request: OpenAiCompatChatCompletionRequest
  ) => Effect.Effect<OpenAiCompatChatCompletionResponse, AiError.AiError>;
  readonly streamChatCompletion: (
    request: OpenAiCompatChatCompletionRequest
  ) => Stream.Stream<OpenAiCompatChatCompletionChunk, AiError.AiError>;
}

const makeAiError = (method: string, reason: AiError.AiErrorReason): AiError.AiError =>
  AiError.make({ method, module: moduleName, reason });

const thunkEmptyString = () => "";

const mapSchemaError =
  (method: string) =>
  (cause: S.SchemaError): AiError.AiError =>
    makeAiError(method, AiError.InvalidOutputError.fromSchemaError(cause));

const mapBodyEncodingError =
  (method: string) =>
  (cause: HttpBody.HttpBodyError): AiError.AiError =>
    makeAiError(
      method,
      new AiError.InvalidRequestError({
        description: `Unable to encode OpenAI-compatible chat completion request body (${cause.reason._tag}).`,
      })
    );

const mapStatusError = (
  method: string,
  reason: HttpClientError.StatusCodeError
): Effect.Effect<never, AiError.AiError> =>
  pipe(
    Effect.logWarning({
      component: moduleName,
      event: "non-2xx-status",
      method,
      status: reason.response.status,
    }),
    Effect.andThen(
      Effect.fail(
        makeAiError(
          method,
          AiError.reasonFromHttpStatus({
            description: "OpenAI-compatible provider returned a non-2xx status.",
            status: reason.response.status,
          })
        )
      )
    )
  );

const mapHttpClientError = (
  method: string,
  error: HttpClientError.HttpClientError
): Effect.Effect<never, AiError.AiError> =>
  error.reason._tag === "StatusCodeError"
    ? mapStatusError(method, error.reason)
    : error.reason._tag === "TransportError" ||
        error.reason._tag === "EncodeError" ||
        error.reason._tag === "InvalidUrlError"
      ? Effect.fail(makeAiError(method, AiError.NetworkError.fromRequestError(error.reason)))
      : Effect.fail(makeAiError(method, new AiError.InvalidOutputError({ description: error.message })));

const logClientFailure =
  (method: string) =>
  (error: AiError.AiError): Effect.Effect<void> =>
    Effect.logDebug({
      component: moduleName,
      event: "operation-failed",
      method,
      reason: error.reason._tag,
    });

const makeHttpClient = (client: HttpClient.HttpClient, options: OpenAiCompatClientOptions): HttpClient.HttpClient =>
  client.pipe(
    HttpClient.mapRequest((request) =>
      request.pipe(
        HttpClientRequest.prependUrl(options.apiUrl ?? "https://api.openai.com/v1"),
        options.apiKey === undefined ? identity : HttpClientRequest.bearerToken(options.apiKey),
        options.headers === undefined ? identity : HttpClientRequest.setHeaders(options.headers)
      )
    )
  );

const encodeChatCompletionRequest = HttpClientRequest.schemaBodyJson(OpenAiCompatChatCompletionRequest);

const postChatCompletionRequest = (
  method: string,
  request: OpenAiCompatChatCompletionRequest
): Effect.Effect<HttpClientRequest.HttpClientRequest, AiError.AiError> =>
  pipe(
    HttpClientRequest.post("/chat/completions"),
    encodeChatCompletionRequest(request),
    Effect.mapError(mapBodyEncodingError(method))
  );

const makeStreamingRequest = (request: OpenAiCompatChatCompletionRequest): OpenAiCompatChatCompletionRequest =>
  new OpenAiCompatChatCompletionRequest({
    ...request,
    // The client can be used directly, so it asserts streaming fields even when the language-model adapter set them.
    stream: true,
    stream_options: {
      include_usage: true,
    },
  });

const contentMediaType: (contentType: string) => string = flow(
  Str.split(";"),
  A.get(0),
  O.getOrElse(thunkEmptyString),
  Str.trim,
  Str.toLowerCase
);

const isSseContentType = (contentType: string): boolean => contentMediaType(contentType) === "text/event-stream";

const ensureSseContentType =
  (method: string) =>
  (
    response: HttpClientResponse.HttpClientResponse
  ): Effect.Effect<HttpClientResponse.HttpClientResponse, AiError.AiError> =>
    pipe(
      Headers.get(response.headers, "content-type"),
      O.filter(isSseContentType),
      O.match({
        onNone: () =>
          Effect.fail(
            makeAiError(
              method,
              new AiError.InvalidOutputError({
                description: "OpenAI-compatible stream response did not use text/event-stream.",
              })
            )
          ),
        onSome: () => Effect.succeed(response),
      })
    );

const mapSseRetry = (method: string): AiError.AiError =>
  makeAiError(
    method,
    new AiError.InvalidOutputError({
      description: "OpenAI-compatible stream response included an unsupported SSE retry directive.",
    })
  );

const parseSseData = (data: string): Effect.Effect<OpenAiCompatChatCompletionChunk, AiError.AiError> =>
  pipe(
    decodeJsonString(data),
    Effect.flatMap(decodeChatCompletionChunk),
    Effect.mapError(mapSchemaError("streamChatCompletion"))
  );

const makeService = (client: HttpClient.HttpClient, options: OpenAiCompatClientOptions): OpenAiCompatClientShape => {
  const httpClient = makeHttpClient(client, options);
  const decodeResponse = HttpClientResponse.schemaBodyJson(OpenAiCompatChatCompletionResponse);
  const createChatCompletion: OpenAiCompatClientShape["createChatCompletion"] = (request) =>
    pipe(
      postChatCompletionRequest("createChatCompletion", request),
      Effect.map(HttpClientRequest.setHeaders({ Accept: "application/json" })),
      Effect.flatMap(HttpClient.filterStatusOk(httpClient).execute),
      Effect.flatMap(decodeResponse),
      Effect.catchTags({
        HttpClientError: (error) => mapHttpClientError("createChatCompletion", error),
        SchemaError: (error) => Effect.fail(mapSchemaError("createChatCompletion")(error)),
      }),
      Effect.tapError(logClientFailure("createChatCompletion")),
      Effect.withSpan("OpenAiCompatClient.createChatCompletion", {
        attributes: {
          component: moduleName,
          operation: "createChatCompletion",
        },
      })
    );

  const streamChatCompletion: OpenAiCompatClientShape["streamChatCompletion"] = (request) =>
    pipe(
      Stream.unwrap(
        pipe(
          postChatCompletionRequest("streamChatCompletion", makeStreamingRequest(request)),
          Effect.map(HttpClientRequest.setHeaders({ Accept: "text/event-stream" })),
          Effect.flatMap(HttpClient.filterStatusOk(httpClient).execute),
          Effect.flatMap(ensureSseContentType("streamChatCompletion")),
          Effect.map((response) =>
            response.stream.pipe(
              Stream.decodeText(),
              Stream.pipeThroughChannel(Sse.decode()),
              Stream.flatMap((event) =>
                event.data === "[DONE]" ? Stream.empty : Stream.fromEffect(parseSseData(event.data))
              ),
              Stream.catchTags({
                HttpClientError: (error) => Stream.fromEffect(mapHttpClientError("streamChatCompletion", error)),
                Retry: () => Stream.fail(mapSseRetry("streamChatCompletion")),
              })
            )
          ),
          Effect.catchTag("HttpClientError", (error) => mapHttpClientError("streamChatCompletion", error))
        )
      ),
      Stream.tapError(logClientFailure("streamChatCompletion")),
      Stream.withSpan("OpenAiCompatClient.streamChatCompletion", {
        attributes: {
          component: moduleName,
          operation: "streamChatCompletion",
        },
      })
    );

  return {
    createChatCompletion,
    streamChatCompletion,
  };
};

/**
 * OpenAI-compatible HTTP client service.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { OpenAiCompatClient } from "@beep/openai-compat"
 *
 * const program = Effect.gen(function* () {
 *   const client = yield* OpenAiCompatClient
 *   return client
 * })
 *
 * void program
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export class OpenAiCompatClient extends Context.Service<OpenAiCompatClient, OpenAiCompatClientShape>()(
  $I`OpenAiCompatClient`
) {
  /**
   * Builds an OpenAI-compatible client layer from explicit configuration.
   *
   * @example
   * ```ts
   * import { Redacted } from "effect"
   * import { OpenAiCompatClient, OpenAiCompatClientOptions } from "@beep/openai-compat"
   *
   * const layer = OpenAiCompatClient.makeLayer(
   *   new OpenAiCompatClientOptions({ apiKey: Redacted.make("test-key") })
   * )
   *
   * void layer
   * ```
   *
   * @category layers
   * @since 0.0.0
   */
  static readonly makeLayer = (
    options = new OpenAiCompatClientOptions({})
  ): Layer.Layer<OpenAiCompatClient, never, HttpClient.HttpClient> =>
    Layer.effect(
      OpenAiCompatClient,
      Effect.gen(function* () {
        const client = yield* HttpClient.HttpClient;
        return OpenAiCompatClient.of(makeService(client, options));
      })
    );

  /**
   * Live OpenAI-compatible client layer backed by `FetchHttpClient.layer`.
   *
   * @example
   * ```ts
   * import { OpenAiCompatClient } from "@beep/openai-compat"
   *
   * const layer = OpenAiCompatClient.layer
   *
   * void layer
   * ```
   *
   * @category layers
   * @since 0.0.0
   */
  static readonly layer: Layer.Layer<OpenAiCompatClient> = OpenAiCompatClient.makeLayer().pipe(
    Layer.provide(FetchHttpClient.layer)
  );
}
