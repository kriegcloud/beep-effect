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
  OpenAiCompatLanguageModelConfig,
} from "@beep/openai-compat";
import * as O from "@beep/utils/Option";
import { Effect, Layer, pipe, Stream } from "effect";
import * as S from "effect/Schema";
import * as AiError from "effect/unstable/ai/AiError";
import * as LanguageModel from "effect/unstable/ai/LanguageModel";
import * as AiModel from "effect/unstable/ai/Model";
import { XAiRequestOptions, XAiResponse } from "./XAi.models.ts";
import { XAi } from "./XAi.service.ts";
import type {
  OpenAiCompatChatCompletionChunk,
  OpenAiCompatChatCompletionRequest,
  OpenAiCompatChatCompletionResponse,
} from "@beep/openai-compat";
import type { XAiError } from "./XAi.errors.ts";
import type { XAiServerSentEvent } from "./XAi.models.ts";
import type { XAiShape } from "./XAi.service.ts";

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
 * console.log(options)
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
  AiError.NetworkError.make({
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
      return makeAiError(method, AiError.InvalidOutputError.make({ description: errorDescription(error) }));
    }
    if (error.reason === "request encoding" || error.reason === "multipart encoding" || error.reason === "config") {
      return makeAiError(method, AiError.InvalidRequestError.make({ description: errorDescription(error) }));
    }
    if (error.reason === "transport" || error.reason === "websocket") {
      return makeAiError(method, networkTransportError(error));
    }
    return makeAiError(method, AiError.UnknownError.make({ description: errorDescription(error) }));
  };

const nonJsonChatCompletionError = (responseTag: "Binary" | "NoBody" | "Text"): AiError.AiError =>
  makeAiError(
    "createChatCompletion",
    AiError.InvalidOutputError.make({
      description: `xAI chat completion returned a ${responseTag} response instead of JSON.`,
    })
  );

const createChatCompletion = (
  xai: XAiShape,
  request: OpenAiCompatChatCompletionRequest
): Effect.Effect<OpenAiCompatChatCompletionResponse, AiError.AiError> =>
  pipe(
    xai.createChatCompletion(XAiRequestOptions.make({ body: request })),
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
  xai.streamChatCompletion(XAiRequestOptions.make({ body: request })).pipe(
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
 * import { Effect } from "effect"
 * import { XAi, XAiLanguageModel } from "@beep/xai"
 *
 * const ready = Effect.runSync(
 *   XAiLanguageModel.make({ model: "grok-3" }).pipe(
 *     Effect.provide(XAi.layer),
 *     Effect.map(() => "language-model-ready")
 *   )
 * )
 *
 * console.log(ready) // "language-model-ready"
 * ```
 *
 * @effects
 * Reads the `XAi` service from context and builds an Effect AI language-model
 * adapter. The returned service sends future chat completion and streaming
 * requests through xAI and maps driver failures into Effect AI errors.
 *
 * @category constructors
 * @since 0.0.0
 */
export const make: (options: XAiLanguageModelOptions) => Effect.Effect<LanguageModel.Service, never, XAi> = Effect.fn(
  "XAiLanguageModel.make"
)(function* (options) {
  const xai = yield* XAi;
  const optionalConfig = O.getSomesStruct({ config: O.fromUndefinedOr(options.config) });

  return yield* makeFromProvider({
    ...optionalConfig,
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
 * console.log(languageModelLayer)
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
 * console.log(aiModel)
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
