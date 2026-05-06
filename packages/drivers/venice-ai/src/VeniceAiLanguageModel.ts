/**
 * Effect AI language-model adapter for Venice chat completions.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $VeniceAiId } from "@beep/identity";
import {
  decodeChatCompletionChunk,
  decodeChatCompletionResponse,
  makeFromProvider,
  type OpenAiCompatChatCompletionChunk,
  type OpenAiCompatChatCompletionRequest,
  type OpenAiCompatChatCompletionResponse,
  OpenAiCompatLanguageModelConfig,
} from "@beep/openai-compat";
import { Effect, Layer, pipe, Stream } from "effect";
import * as S from "effect/Schema";
import * as AiError from "effect/unstable/ai/AiError";
import * as LanguageModel from "effect/unstable/ai/LanguageModel";
import * as AiModel from "effect/unstable/ai/Model";
import {
  VeniceAI,
  type VeniceAIError,
  VeniceAIRequestOptions,
  type VeniceAIServerSentEvent,
  type VeniceAIShape,
} from "./VeniceAI.service.ts";

const $I = $VeniceAiId.create("VeniceAiLanguageModel");

/**
 * Options accepted by the Venice Effect AI language-model adapter.
 *
 * @example
 * ```ts
 * import type { VeniceAiLanguageModel } from "@beep/venice-ai"
 *
 * const options: VeniceAiLanguageModel.VeniceAiLanguageModelOptions = {
 *   model: "llama-3.3-70b"
 * }
 *
 * void options
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class VeniceAiLanguageModelOptions extends S.Class<VeniceAiLanguageModelOptions>(
  $I`VeniceAiLanguageModelOptions`
)(
  {
    config: S.optionalKey(OpenAiCompatLanguageModelConfig),
    model: S.String,
  },
  $I.annote("VeniceAiLanguageModelOptions", {
    description: "Options accepted by the Venice Effect AI language-model adapter.",
  })
) {}

const moduleName = "VeniceAiLanguageModel";

const makeAiError = (method: string, reason: AiError.AiErrorReason): AiError.AiError =>
  AiError.make({ method, module: moduleName, reason });

const errorDescription = (error: VeniceAIError): string =>
  `Venice AI driver failed with ${error.reason}${error.operation === undefined ? "" : ` during ${error.operation}`}.`;

const networkTransportError = (error: VeniceAIError): AiError.NetworkError =>
  new AiError.NetworkError({
    description: errorDescription(error),
    reason: "TransportError",
    request: {
      hash: undefined,
      headers: {},
      method: error.method ?? "POST",
      url: error.path ?? "/",
      urlParams: [],
    },
  });

const mapSchemaError =
  (method: string) =>
  (cause: S.SchemaError): AiError.AiError =>
    makeAiError(method, AiError.InvalidOutputError.fromSchemaError(cause));

const mapVeniceError =
  (method: string) =>
  (error: VeniceAIError): AiError.AiError => {
    if (error.status !== undefined) {
      return makeAiError(
        method,
        AiError.reasonFromHttpStatus({
          description: errorDescription(error),
          status: error.status,
        })
      );
    }
    if (error.reason === "response decoding" || error.reason === "sse decoding") {
      return makeAiError(method, new AiError.InvalidOutputError({ description: errorDescription(error) }));
    }
    if (error.reason === "request encoding" || error.reason === "multipart encoding" || error.reason === "config") {
      return makeAiError(method, new AiError.InvalidRequestError({ description: errorDescription(error) }));
    }
    if (error.reason === "transport") {
      return makeAiError(method, networkTransportError(error));
    }
    return makeAiError(method, new AiError.UnknownError({ description: errorDescription(error) }));
  };

const createChatCompletion = (
  venice: VeniceAIShape,
  request: OpenAiCompatChatCompletionRequest
): Effect.Effect<OpenAiCompatChatCompletionResponse, AiError.AiError> =>
  pipe(
    venice.createChatCompletion(new VeniceAIRequestOptions({ body: request })),
    Effect.mapError(mapVeniceError("createChatCompletion")),
    Effect.flatMap((response) =>
      response._tag === "Json"
        ? pipe(response.body, decodeChatCompletionResponse, Effect.mapError(mapSchemaError("createChatCompletion")))
        : Effect.fail(
            makeAiError(
              "createChatCompletion",
              new AiError.InvalidOutputError({ description: "Venice chat completion did not return a JSON response." })
            )
          )
    ),
    Effect.withSpan("VeniceAiLanguageModel.createChatCompletion", {
      attributes: {
        operation: "createChatCompletion",
        provider: "venice-ai",
      },
    })
  );

const parseStreamEvent = (
  event: VeniceAIServerSentEvent
): Effect.Effect<OpenAiCompatChatCompletionChunk, AiError.AiError> =>
  pipe(decodeChatCompletionChunk(event.data), Effect.mapError(mapSchemaError("streamChatCompletion")));

const streamChatCompletion = (
  venice: VeniceAIShape,
  request: OpenAiCompatChatCompletionRequest
): Stream.Stream<OpenAiCompatChatCompletionChunk, AiError.AiError> =>
  venice.streamChatCompletion(new VeniceAIRequestOptions({ body: request })).pipe(
    Stream.mapError(mapVeniceError("streamChatCompletion")),
    Stream.flatMap((event) => (event.done ? Stream.empty : Stream.fromEffect(parseStreamEvent(event)))),
    Stream.withSpan("VeniceAiLanguageModel.streamChatCompletion", {
      attributes: {
        operation: "streamChatCompletion",
        provider: "venice-ai",
      },
    })
  );

/**
 * Builds a Venice Effect AI language-model service.
 *
 * @example
 * ```ts
 * import { VeniceAiLanguageModel } from "@beep/venice-ai"
 *
 * const languageModel = VeniceAiLanguageModel.make({ model: "llama-3.3-70b" })
 *
 * void languageModel
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const make = (options: VeniceAiLanguageModelOptions): Effect.Effect<LanguageModel.Service, never, VeniceAI> =>
  Effect.gen(function* () {
    const venice = yield* VeniceAI;
    return yield* makeFromProvider({
      ...(options.config === undefined ? {} : { config: options.config }),
      model: options.model,
      moduleName,
      provider: {
        createChatCompletion: (request) => createChatCompletion(venice, request),
        streamChatCompletion: (request) => streamChatCompletion(venice, request),
      },
    });
  });

/**
 * Builds a Venice Effect AI language-model layer.
 *
 * @example
 * ```ts
 * import { VeniceAiLanguageModel } from "@beep/venice-ai"
 *
 * const languageModelLayer = VeniceAiLanguageModel.layer({ model: "llama-3.3-70b" })
 *
 * void languageModelLayer
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const layer = (
  options: VeniceAiLanguageModelOptions
): Layer.Layer<LanguageModel.LanguageModel, never, VeniceAI> =>
  Layer.effect(LanguageModel.LanguageModel, make(options));

/**
 * Builds an Effect AI model value for Venice.
 *
 * @example
 * ```ts
 * import { VeniceAiLanguageModel } from "@beep/venice-ai"
 *
 * const aiModel = VeniceAiLanguageModel.model("llama-3.3-70b")
 *
 * void aiModel
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const model = (
  modelName: string,
  config?: OpenAiCompatLanguageModelConfig | undefined
): AiModel.Model<"venice", LanguageModel.LanguageModel, VeniceAI> =>
  AiModel.make("venice", modelName, layer(config === undefined ? { model: modelName } : { config, model: modelName }));
