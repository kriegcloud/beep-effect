/**
 * Effect AI language-model adapter for xAI chat completions.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $XaiId } from "@beep/identity";
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
import type { XAiError } from "./XAi.errors.ts";
import { XAiRequestOptions, XAiResponse, type XAiServerSentEvent } from "./XAi.models.ts";
import { XAi, type XAiShape } from "./XAi.service.ts";

const $I = $XaiId.create("XAiLanguageModel.service");

/**
 * Options accepted by the xAI Effect AI language-model adapter.
 *
 * @example
 * ```ts
 * import type { XAiLanguageModel } from "@beep/xai"
 *
 * const options: XAiLanguageModel.XAiLanguageModelOptions = {
 *   model: "grok-3"
 * }
 *
 * void options
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class XAiLanguageModelOptions extends S.Class<XAiLanguageModelOptions>($I`XAiLanguageModelOptions`)(
  {
    config: S.optionalKey(OpenAiCompatLanguageModelConfig),
    model: S.String,
  },
  $I.annote("XAiLanguageModelOptions", {
    description: "Options accepted by the xAI Effect AI language-model adapter.",
  })
) {}

const moduleName = "XAiLanguageModel.service";

const makeAiError = (method: string, reason: AiError.AiErrorReason): AiError.AiError =>
  AiError.make({ method, module: moduleName, reason });

const errorDescription = (error: XAiError): string =>
  `xAI driver failed with ${error.reason}${error.methodName === undefined ? "" : ` during ${error.methodName}`}.`;

const networkTransportError = (error: XAiError): AiError.NetworkError =>
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

const mapXAiError =
  (method: string) =>
  (error: XAiError): AiError.AiError => {
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
    if (error.reason === "transport" || error.reason === "websocket") {
      return makeAiError(method, networkTransportError(error));
    }
    return makeAiError(method, new AiError.UnknownError({ description: errorDescription(error) }));
  };

const nonJsonChatCompletionError = (responseTag: "Binary" | "NoBody" | "Text"): AiError.AiError =>
  makeAiError(
    "createChatCompletion",
    new AiError.InvalidOutputError({
      description: `xAI chat completion returned a ${responseTag} response instead of JSON.`,
    })
  );

const createChatCompletion = (
  xai: XAiShape,
  request: OpenAiCompatChatCompletionRequest
): Effect.Effect<OpenAiCompatChatCompletionResponse, AiError.AiError> =>
  pipe(
    xai.createChatCompletion(new XAiRequestOptions({ body: request })),
    Effect.mapError(mapXAiError("createChatCompletion")),
    Effect.flatMap((response) =>
      XAiResponse.match(response, {
        Json: (json) =>
          pipe(json.body, decodeChatCompletionResponse, Effect.mapError(mapSchemaError("createChatCompletion"))),
        Binary: () => Effect.fail(nonJsonChatCompletionError("Binary")),
        NoBody: () => Effect.fail(nonJsonChatCompletionError("NoBody")),
        Text: () => Effect.fail(nonJsonChatCompletionError("Text")),
      })
    ),
    Effect.withSpan("XAiLanguageModel.createChatCompletion", {
      attributes: {
        operation: "createChatCompletion",
        provider: "xai",
      },
    })
  );

const parseStreamEvent = (event: XAiServerSentEvent): Effect.Effect<OpenAiCompatChatCompletionChunk, AiError.AiError> =>
  pipe(decodeChatCompletionChunk(event.data), Effect.mapError(mapSchemaError("streamChatCompletion")));

const streamChatCompletion = (
  xai: XAiShape,
  request: OpenAiCompatChatCompletionRequest
): Stream.Stream<OpenAiCompatChatCompletionChunk, AiError.AiError> =>
  xai.streamChatCompletion(new XAiRequestOptions({ body: request })).pipe(
    Stream.mapError(mapXAiError("streamChatCompletion")),
    Stream.flatMap((event) => (event.done ? Stream.empty : Stream.fromEffect(parseStreamEvent(event)))),
    Stream.withSpan("XAiLanguageModel.streamChatCompletion", {
      attributes: {
        operation: "streamChatCompletion",
        provider: "xai",
      },
    })
  );

/**
 * Builds an xAI Effect AI language-model service.
 *
 * @example
 * ```ts
 * import { XAiLanguageModel } from "@beep/xai"
 *
 * const languageModel = XAiLanguageModel.make({ model: "grok-3" })
 *
 * void languageModel
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const make: (options: XAiLanguageModelOptions) => Effect.Effect<LanguageModel.Service, never, XAi> = Effect.fn(
  "XAiLanguageModel.make"
)(function* (options) {
  const xai = yield* XAi;
  return yield* makeFromProvider({
    ...(options.config === undefined ? {} : { config: options.config }),
    model: options.model,
    moduleName,
    provider: {
      createChatCompletion: (request) => createChatCompletion(xai, request),
      streamChatCompletion: (request) => streamChatCompletion(xai, request),
    },
  });
});

/**
 * Builds an xAI Effect AI language-model layer.
 *
 * @example
 * ```ts
 * import { XAiLanguageModel } from "@beep/xai"
 *
 * const languageModelLayer = XAiLanguageModel.layer({ model: "grok-3" })
 *
 * void languageModelLayer
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const layer = (options: XAiLanguageModelOptions): Layer.Layer<LanguageModel.LanguageModel, never, XAi> =>
  Layer.effect(LanguageModel.LanguageModel, make(options));

/**
 * Builds an Effect AI model value for xAI.
 *
 * @example
 * ```ts
 * import { XAiLanguageModel } from "@beep/xai"
 *
 * const aiModel = XAiLanguageModel.model("grok-3")
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
): AiModel.Model<"xai", LanguageModel.LanguageModel, XAi> =>
  AiModel.make("xai", modelName, layer(config === undefined ? { model: modelName } : { config, model: modelName }));
