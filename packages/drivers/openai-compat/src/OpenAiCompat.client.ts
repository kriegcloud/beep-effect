/**
 * OpenAI-compatible HTTP client service and layer helpers.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $OpenaiCompatId } from "@beep/identity";
import { Context, Effect, Layer, pipe, Stream } from "effect";
import { identity } from "effect/Function";
import * as S from "effect/Schema";
import * as AiError from "effect/unstable/ai/AiError";
import * as Sse from "effect/unstable/encoding/Sse";
import { FetchHttpClient } from "effect/unstable/http";
import * as HttpClient from "effect/unstable/http/HttpClient";
import type * as HttpClientError from "effect/unstable/http/HttpClientError";
import * as HttpClientRequest from "effect/unstable/http/HttpClientRequest";
import * as HttpClientResponse from "effect/unstable/http/HttpClientResponse";
import {
  decodeChatCompletionChunk,
  type OpenAiCompatChatCompletionChunk,
  type OpenAiCompatChatCompletionRequest,
  OpenAiCompatChatCompletionResponse,
} from "./OpenAiCompat.models.ts";

const $I = $OpenaiCompatId.create("OpenAiCompat.client");

const decodeSseJson = S.decodeUnknownEffect(S.UnknownFromJsonString);

/**
 * Runtime configuration accepted by {@link OpenAiCompatClient.makeLayer}.
 *
 * @example
 * ```ts
 * import { OpenAiCompatClientOptions } from "@beep/openai-compat"
 *
 * const options = new OpenAiCompatClientOptions({
 *   apiKey: "test-key",
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
    apiKey: S.optionalKey(S.String),
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
 * import type { OpenAiCompatClientShape } from "@beep/openai-compat"
 *
 * declare const client: OpenAiCompatClientShape
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
  AiError.make({ method, module: "OpenAiCompatClient", reason });

const mapSchemaError =
  (method: string) =>
  (cause: S.SchemaError): AiError.AiError =>
    makeAiError(method, AiError.InvalidOutputError.fromSchemaError(cause));

const mapStatusError = (
  method: string,
  reason: HttpClientError.StatusCodeError
): Effect.Effect<never, AiError.AiError> =>
  pipe(
    reason.response.text,
    Effect.orElseSucceed(() => ""),
    Effect.flatMap((body) =>
      Effect.fail(
        makeAiError(
          method,
          AiError.reasonFromHttpStatus({
            body,
            description: reason.description,
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

const makeHttpClient = (client: HttpClient.HttpClient, options: OpenAiCompatClientOptions): HttpClient.HttpClient =>
  client.pipe(
    HttpClient.mapRequest((request) =>
      request.pipe(
        HttpClientRequest.prependUrl(options.apiUrl ?? "https://api.openai.com/v1"),
        options.apiKey === undefined ? identity : HttpClientRequest.bearerToken(options.apiKey),
        options.headers === undefined ? identity : HttpClientRequest.setHeaders(options.headers),
        HttpClientRequest.acceptJson
      )
    )
  );

const parseSseData = (data: string): Effect.Effect<OpenAiCompatChatCompletionChunk, AiError.AiError> =>
  pipe(
    decodeSseJson(data),
    Effect.flatMap(decodeChatCompletionChunk),
    Effect.mapError(mapSchemaError("streamChatCompletion"))
  );

const makeService = (client: HttpClient.HttpClient, options: OpenAiCompatClientOptions): OpenAiCompatClientShape => {
  const httpClient = makeHttpClient(client, options);
  const decodeResponse = HttpClientResponse.schemaBodyJson(OpenAiCompatChatCompletionResponse);
  const createChatCompletion: OpenAiCompatClientShape["createChatCompletion"] = (request) =>
    pipe(
      HttpClientRequest.post("/chat/completions"),
      HttpClientRequest.bodyJsonUnsafe(request),
      HttpClient.filterStatusOk(httpClient).execute,
      Effect.flatMap(decodeResponse),
      Effect.catchTags({
        HttpClientError: (error) => mapHttpClientError("createChatCompletion", error),
        SchemaError: (error) => Effect.fail(mapSchemaError("createChatCompletion")(error)),
      })
    );

  const streamChatCompletion: OpenAiCompatClientShape["streamChatCompletion"] = (request) =>
    Stream.unwrap(
      pipe(
        HttpClientRequest.post("/chat/completions"),
        HttpClientRequest.bodyJsonUnsafe({
          ...request,
          stream: true,
          stream_options: {
            include_usage: true,
          },
        }),
        HttpClient.filterStatusOk(httpClient).execute,
        Effect.map((response) =>
          response.stream.pipe(
            Stream.decodeText(),
            Stream.pipeThroughChannel(Sse.decode()),
            Stream.flatMap((event) =>
              event.data === "[DONE]" ? Stream.empty : Stream.fromEffect(parseSseData(event.data))
            ),
            Stream.catchTags({
              HttpClientError: (error) => Stream.fromEffect(mapHttpClientError("streamChatCompletion", error)),
              Retry: (error) => Stream.die(error),
            })
          )
        ),
        Effect.catchTag("HttpClientError", (error) => mapHttpClientError("streamChatCompletion", error))
      )
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
   * import { OpenAiCompatClient, OpenAiCompatClientOptions } from "@beep/openai-compat"
   *
   * const layer = OpenAiCompatClient.makeLayer(
   *   new OpenAiCompatClientOptions({ apiKey: "test-key" })
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
