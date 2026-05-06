/**
 * Effect AI language-model adapter for OpenAI-compatible chat completions.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $OpenaiCompatId } from "@beep/identity";
import { Effect, Layer, pipe, Stream, Tuple } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as AiError from "effect/unstable/ai/AiError";
import * as LanguageModel from "effect/unstable/ai/LanguageModel";
import * as AiModel from "effect/unstable/ai/Model";
import { toCodecOpenAI } from "effect/unstable/ai/OpenAiStructuredOutput";
import type * as Prompt from "effect/unstable/ai/Prompt";
import * as Response from "effect/unstable/ai/Response";
import * as Tool from "effect/unstable/ai/Tool";
import { OpenAiCompatClient, type OpenAiCompatClientShape } from "./OpenAiCompat.client.ts";
import {
  OpenAiCompatAssistantChatMessage,
  type OpenAiCompatChatCompletionChunk,
  OpenAiCompatChatCompletionRequest,
  type OpenAiCompatChatCompletionResponse,
  type OpenAiCompatChatMessage,
  OpenAiCompatFunctionTool,
  OpenAiCompatJsonSchemaResponseFormat,
  type OpenAiCompatResponseFormat,
  OpenAiCompatSystemChatMessage,
  OpenAiCompatToolCall,
  OpenAiCompatToolCallFunction,
  OpenAiCompatToolChatMessage,
  OpenAiCompatUserChatMessage,
} from "./OpenAiCompat.models.ts";

const $I = $OpenaiCompatId.create("OpenAiCompat.language-model");
const decodeUnknownJson = S.decodeUnknownEffect(S.UnknownFromJsonString);
const encodeUnknownJson = S.encodeUnknownEffect(S.UnknownFromJsonString);
const decodeUnknownRecordOption = S.decodeUnknownOption(S.Record(S.String, S.Unknown));

/**
 * Request-time tuning options shared by OpenAI-compatible language-model adapters.
 *
 * @example
 * ```ts
 * import type { OpenAiCompatLanguageModelConfig } from "@beep/openai-compat"
 *
 * const config: OpenAiCompatLanguageModelConfig = {
 *   maxTokens: 512,
 *   temperature: 0.2
 * }
 *
 * void config
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class OpenAiCompatLanguageModelConfig extends S.Class<OpenAiCompatLanguageModelConfig>(
  $I`OpenAiCompatLanguageModelConfig`
)(
  {
    maxCompletionTokens: S.optionalKey(S.Number),
    maxTokens: S.optionalKey(S.Number),
    parallelToolCalls: S.optionalKey(S.Boolean),
    seed: S.optionalKey(S.Number),
    strictJsonSchema: S.optionalKey(S.Boolean),
    temperature: S.Number.pipe(S.NullOr, S.optionalKey),
    topP: S.Number.pipe(S.NullOr, S.optionalKey),
    user: S.optionalKey(S.String),
  },
  $I.annote("OpenAiCompatLanguageModelConfig", {
    description: "Request-time tuning options shared by OpenAI-compatible language-model adapters.",
  })
) {}

/**
 * Provider callbacks used by the OpenAI-compatible language-model factory.
 *
 * @example
 * ```ts
 * import { Effect, Stream } from "effect"
 * import type { OpenAiCompatProvider } from "@beep/openai-compat"
 *
 * const provider: OpenAiCompatProvider = {
 *   createChatCompletion: () => Effect.succeed({ choices: [] }),
 *   streamChatCompletion: () => Stream.empty
 * }
 *
 * void provider
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type OpenAiCompatProvider = OpenAiCompatClientShape;

/**
 * Options accepted by {@link makeFromProvider}.
 *
 * @example
 * ```ts
 * import { Effect, Stream } from "effect"
 * import type { OpenAiCompatLanguageModelOptions } from "@beep/openai-compat"
 *
 * const provider: OpenAiCompatLanguageModelOptions["provider"] = {
 *   createChatCompletion: () => Effect.succeed({ choices: [] }),
 *   streamChatCompletion: () => Stream.empty
 * }
 *
 * const options: OpenAiCompatLanguageModelOptions = {
 *   model: "gpt-compatible",
 *   moduleName: "ExampleLanguageModel",
 *   provider
 * }
 *
 * void options
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type OpenAiCompatLanguageModelOptions = OpenAiCompatLanguageModelClientOptions & {
  readonly model: string;
  readonly moduleName: string;
  readonly provider: OpenAiCompatProvider;
};

/**
 * Options accepted by the default OpenAI-compatible language-model constructor.
 *
 * @example
 * ```ts
 * import type { OpenAiCompatLanguageModelClientOptions } from "@beep/openai-compat"
 *
 * const options: OpenAiCompatLanguageModelClientOptions = {
 *   model: "gpt-compatible"
 * }
 *
 * void options
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class OpenAiCompatLanguageModelClientOptions extends S.Class<OpenAiCompatLanguageModelClientOptions>(
  $I`OpenAiCompatLanguageModelClientOptions`
)(
  {
    config: S.optionalKey(OpenAiCompatLanguageModelConfig),
    model: S.String,
  },
  $I.annote("OpenAiCompatLanguageModelClientOptions", {
    description: "Options accepted by the default OpenAI-compatible language-model constructor.",
  })
) {}

type StreamState = {
  readonly finished: boolean;
  readonly textEnded: boolean;
  readonly textStarted: boolean;
};

const initialStreamState = (): StreamState => ({
  finished: false,
  textEnded: false,
  textStarted: false,
});

const makeAiError = (moduleName: string, method: string, reason: AiError.AiErrorReason): AiError.AiError =>
  AiError.make({ method, module: moduleName, reason });

const makeInvalidOutput = (moduleName: string, method: string, description: string): AiError.AiError =>
  makeAiError(moduleName, method, new AiError.InvalidOutputError({ description }));

const makeInvalidUserInput = (moduleName: string, method: string, description: string): AiError.AiError =>
  makeAiError(moduleName, method, new AiError.InvalidUserInputError({ description }));

const mapSchemaError =
  (moduleName: string, method: string) =>
  (cause: S.SchemaError): AiError.AiError =>
    makeAiError(moduleName, method, AiError.InvalidOutputError.fromSchemaError(cause));

const jsonObjectOrEmpty = (value: unknown): Readonly<Record<string, unknown>> =>
  pipe(
    decodeUnknownRecordOption(value),
    O.getOrElse((): Readonly<Record<string, unknown>> => ({}))
  );

const optionalString = (value: string | null | undefined): O.Option<string> =>
  P.isString(value) && value.length > 0 ? O.some(value) : O.none();

const toFinishReason = (reason: string | null | undefined): Response.FinishReason => {
  if (reason === "stop") {
    return "stop";
  }
  if (reason === "length") {
    return "length";
  }
  if (reason === "tool_calls" || reason === "function_call") {
    return "tool-calls";
  }
  if (reason === "content_filter") {
    return "content-filter";
  }
  return reason === undefined || reason === null ? "unknown" : "other";
};

const usageFromCompat = (usage: OpenAiCompatChatCompletionResponse["usage"]): Response.Usage =>
  new Response.Usage({
    inputTokens: {
      cacheRead: undefined,
      cacheWrite: undefined,
      total: usage?.prompt_tokens,
      uncached: usage?.prompt_tokens,
    },
    outputTokens: {
      reasoning: undefined,
      text: usage?.completion_tokens,
      total: usage?.completion_tokens,
    },
  });

const makeFinishPart = (
  usage: OpenAiCompatChatCompletionResponse["usage"],
  reason: string | null | undefined
): Response.FinishPart =>
  Response.makePart("finish", {
    reason: toFinishReason(reason),
    response: undefined,
    usage: usageFromCompat(usage),
  });

const encodeToolParams = (
  moduleName: string,
  method: string,
  params: unknown
): Effect.Effect<string, AiError.AiError> =>
  pipe(encodeUnknownJson(params), Effect.mapError(mapSchemaError(moduleName, method)));

const decodeToolParams = (
  moduleName: string,
  method: string,
  source: string
): Effect.Effect<unknown, AiError.AiError> =>
  pipe(decodeUnknownJson(source), Effect.mapError(mapSchemaError(moduleName, method)));

const textContentPart = (part: Prompt.TextPart): Readonly<Record<string, unknown>> => ({
  text: part.text,
  type: "text",
});

const fileContentPart = (
  moduleName: string,
  part: Prompt.FilePart
): Effect.Effect<Readonly<Record<string, unknown>>, AiError.AiError> => {
  if (P.isString(part.data)) {
    return Effect.succeed({
      image_url: { url: part.data },
      type: "image_url",
    });
  }
  if (part.data instanceof URL) {
    return Effect.succeed({
      image_url: { url: part.data.toString() },
      type: "image_url",
    });
  }
  return Effect.fail(
    makeInvalidUserInput(
      moduleName,
      "prepareMessages",
      "OpenAI-compatible chat requests require file parts to use string or URL data."
    )
  );
};

const userContentPart = (
  moduleName: string,
  part: Prompt.UserMessagePart
): Effect.Effect<Readonly<Record<string, unknown>>, AiError.AiError> => {
  if (part.type === "text") {
    return Effect.succeed(textContentPart(part));
  }
  return fileContentPart(moduleName, part);
};

const assistantTextContent = (parts: ReadonlyArray<Prompt.AssistantMessagePart>): string | null => {
  const text = pipe(
    parts,
    A.filter((part) => part.type === "text" || part.type === "reasoning"),
    A.map((part) => part.text),
    A.join("")
  );
  return text.length > 0 ? text : null;
};

const assistantToolCall = (
  moduleName: string,
  toolNameMapper: Tool.NameMapper<ReadonlyArray<Tool.Any>>,
  part: Prompt.ToolCallPart
): Effect.Effect<OpenAiCompatToolCall, AiError.AiError> =>
  pipe(
    encodeToolParams(moduleName, "prepareMessages", part.params),
    Effect.map(
      (args) =>
        new OpenAiCompatToolCall({
          function: new OpenAiCompatToolCallFunction({
            arguments: args,
            name: toolNameMapper.getProviderName(part.name),
          }),
          id: part.id,
          type: "function",
        })
    )
  );

const assistantToolCalls = (
  moduleName: string,
  toolNameMapper: Tool.NameMapper<ReadonlyArray<Tool.Any>>,
  parts: ReadonlyArray<Prompt.AssistantMessagePart>
): Effect.Effect<ReadonlyArray<OpenAiCompatToolCall>, AiError.AiError> =>
  pipe(
    parts,
    A.filter((part): part is Prompt.ToolCallPart => part.type === "tool-call"),
    Effect.forEach((part) => assistantToolCall(moduleName, toolNameMapper, part))
  );

const toolResultMessage = (
  moduleName: string,
  toolNameMapper: Tool.NameMapper<ReadonlyArray<Tool.Any>>,
  part: Prompt.ToolMessagePart
): Effect.Effect<OpenAiCompatChatMessage, AiError.AiError> => {
  if (part.type !== "tool-result") {
    return Effect.fail(
      makeInvalidUserInput(
        moduleName,
        "prepareMessages",
        "OpenAI-compatible chat requests do not support tool approval response parts."
      )
    );
  }
  return pipe(
    encodeToolParams(moduleName, "prepareMessages", part.result),
    Effect.map(
      (content) =>
        new OpenAiCompatToolChatMessage({
          content,
          name: toolNameMapper.getProviderName(part.name),
          role: "tool",
          tool_call_id: part.id,
        })
    )
  );
};

const prepareMessage = (
  moduleName: string,
  toolNameMapper: Tool.NameMapper<ReadonlyArray<Tool.Any>>,
  message: Prompt.Message
): Effect.Effect<ReadonlyArray<OpenAiCompatChatMessage>, AiError.AiError> => {
  if (message.role === "system") {
    return Effect.succeed([new OpenAiCompatSystemChatMessage({ content: message.content, role: "system" })]);
  }
  if (message.role === "user") {
    return pipe(
      message.content,
      Effect.forEach((part) => userContentPart(moduleName, part)),
      Effect.map((content) => [new OpenAiCompatUserChatMessage({ content, role: "user" })])
    );
  }
  if (message.role === "assistant") {
    return pipe(
      assistantToolCalls(moduleName, toolNameMapper, message.content),
      Effect.map((toolCalls) => [
        new OpenAiCompatAssistantChatMessage({
          content: assistantTextContent(message.content),
          role: "assistant",
          ...R.getSomes({
            tool_calls: A.isReadonlyArrayNonEmpty(toolCalls) ? O.some(toolCalls) : O.none(),
          }),
        }),
      ])
    );
  }
  return pipe(
    message.content,
    Effect.forEach((part) => toolResultMessage(moduleName, toolNameMapper, part))
  );
};

const prepareMessages = (
  moduleName: string,
  toolNameMapper: Tool.NameMapper<ReadonlyArray<Tool.Any>>,
  prompt: Prompt.Prompt
): Effect.Effect<OpenAiCompatChatCompletionRequest["messages"], AiError.AiError> =>
  pipe(
    prompt.content,
    Effect.forEach((message) => prepareMessage(moduleName, toolNameMapper, message)),
    Effect.map(A.flatten),
    Effect.map((messages) =>
      A.isReadonlyArrayNonEmpty(messages) ? messages : [new OpenAiCompatUserChatMessage({ content: "", role: "user" })]
    )
  );

const prepareTool = (
  moduleName: string,
  config: OpenAiCompatLanguageModelConfig,
  tool: Tool.Any
): Effect.Effect<OpenAiCompatFunctionTool, AiError.AiError> =>
  Effect.try({
    catch: () => makeInvalidOutput(moduleName, "prepareTools", "Unable to convert tool parameters to JSON Schema."),
    try: () => {
      const name = Tool.isProviderDefined(tool) ? tool.providerName : tool.name;
      const parameters = Tool.getJsonSchema(tool, { transformer: toCodecOpenAI });
      return new OpenAiCompatFunctionTool({
        function: {
          description: Tool.getDescription(tool) ?? null,
          name,
          parameters: jsonObjectOrEmpty(parameters),
          strict: Tool.getStrictMode(tool) ?? config.strictJsonSchema ?? true,
        },
        type: "function",
      });
    },
  });

const prepareTools = (
  moduleName: string,
  config: OpenAiCompatLanguageModelConfig,
  options: LanguageModel.ProviderOptions
): Effect.Effect<O.Option<ReadonlyArray<OpenAiCompatFunctionTool>>, AiError.AiError> =>
  A.isReadonlyArrayNonEmpty(options.tools)
    ? pipe(
        options.tools,
        Effect.forEach((tool) => prepareTool(moduleName, config, tool)),
        Effect.map(O.some)
      )
    : Effect.succeed(O.none());

const prepareToolChoice = (
  toolNameMapper: Tool.NameMapper<ReadonlyArray<Tool.Any>>,
  toolChoice: LanguageModel.ProviderOptions["toolChoice"]
): O.Option<unknown> => {
  if (toolChoice === "auto" || toolChoice === "none" || toolChoice === "required") {
    return O.some(toolChoice);
  }
  if (P.isUndefined(toolChoice)) {
    return O.none();
  }
  if ("tool" in toolChoice) {
    return O.some({
      function: { name: toolNameMapper.getProviderName(toolChoice.tool) },
      type: "function",
    });
  }
  if (toolChoice.oneOf.length === 1 && toolChoice.mode === "required") {
    return O.some({
      function: { name: toolNameMapper.getProviderName(toolChoice.oneOf[0] ?? "") },
      type: "function",
    });
  }
  return O.some(toolChoice.mode === "required" ? "required" : "auto");
};

const prepareResponseFormat = (
  moduleName: string,
  config: OpenAiCompatLanguageModelConfig,
  responseFormat: LanguageModel.ProviderOptions["responseFormat"]
): Effect.Effect<O.Option<OpenAiCompatResponseFormat>, AiError.AiError> => {
  if (responseFormat.type === "text") {
    return Effect.succeed(O.none());
  }
  return Effect.try({
    catch: () =>
      makeInvalidOutput(
        moduleName,
        "prepareResponseFormat",
        "Unable to convert structured response schema to JSON Schema."
      ),
    try: () =>
      O.some(
        new OpenAiCompatJsonSchemaResponseFormat({
          json_schema: {
            name: responseFormat.objectName,
            schema: jsonObjectOrEmpty(
              Tool.getJsonSchemaFromSchema(responseFormat.schema, { transformer: toCodecOpenAI })
            ),
            strict: config.strictJsonSchema ?? true,
          },
          type: "json_schema",
        })
      ),
  });
};

const makeRequest = (
  moduleName: string,
  model: string,
  config: OpenAiCompatLanguageModelConfig,
  options: LanguageModel.ProviderOptions,
  toolNameMapper: Tool.NameMapper<ReadonlyArray<Tool.Any>>,
  stream: boolean
): Effect.Effect<OpenAiCompatChatCompletionRequest, AiError.AiError> =>
  Effect.gen(function* () {
    const messages = yield* prepareMessages(moduleName, toolNameMapper, options.prompt);
    const tools = yield* prepareTools(moduleName, config, options);
    const responseFormat = yield* prepareResponseFormat(moduleName, config, options.responseFormat);
    return new OpenAiCompatChatCompletionRequest({
      messages,
      model,
      ...R.getSomes({
        max_completion_tokens: O.fromUndefinedOr(config.maxCompletionTokens),
        max_tokens: O.fromUndefinedOr(config.maxTokens),
        parallel_tool_calls: O.fromUndefinedOr(config.parallelToolCalls),
        response_format: responseFormat,
        seed: O.fromUndefinedOr(config.seed),
        stream: stream ? O.some(true) : O.none(),
        stream_options: stream ? O.some({ include_usage: true }) : O.none(),
        temperature: O.fromUndefinedOr(config.temperature),
        tool_choice: prepareToolChoice(toolNameMapper, options.toolChoice),
        tools,
        top_p: O.fromUndefinedOr(config.topP),
        user: O.fromUndefinedOr(config.user),
      }),
    });
  });

const makeToolCallPart = (
  moduleName: string,
  toolNameMapper: Tool.NameMapper<ReadonlyArray<Tool.Any>>,
  toolCall: OpenAiCompatToolCall
): Effect.Effect<Response.ToolCallPartEncoded, AiError.AiError> =>
  pipe(
    decodeToolParams(moduleName, "makeResponse", toolCall.function.arguments),
    Effect.map(
      (params): Response.ToolCallPartEncoded =>
        Response.makePart("tool-call", {
          id: toolCall.id,
          name: toolNameMapper.getCustomName(toolCall.function.name),
          params,
          providerExecuted: false,
        })
    )
  );

const makeChoiceParts = (
  moduleName: string,
  toolNameMapper: Tool.NameMapper<ReadonlyArray<Tool.Any>>,
  response: OpenAiCompatChatCompletionResponse
): Effect.Effect<Array<Response.PartEncoded>, AiError.AiError> =>
  Effect.gen(function* () {
    const choice = pipe(response.choices, A.head, O.getOrUndefined);
    if (P.isUndefined(choice)) {
      return yield* makeInvalidOutput(moduleName, "makeResponse", "Provider response did not include a choice.");
    }
    const textParts = pipe(
      optionalString(choice.message?.content),
      O.match({
        onNone: A.empty<Response.PartEncoded>,
        onSome: (text) => [Response.makePart("text", { text })],
      })
    );
    const toolParts = yield* pipe(
      choice.message?.tool_calls ?? [],
      Effect.forEach((toolCall) => makeToolCallPart(moduleName, toolNameMapper, toolCall))
    );
    return [...textParts, ...toolParts, makeFinishPart(response.usage, choice.finish_reason)];
  });

const finishStreamParts = (state: StreamState): ReadonlyArray<Response.StreamPartEncoded> =>
  state.finished
    ? []
    : [
        ...(state.textStarted && !state.textEnded ? [Response.makePart("text-end", { id: "0" })] : []),
        makeFinishPart(undefined, undefined),
      ];

const makeStreamChoiceParts = (
  moduleName: string,
  toolNameMapper: Tool.NameMapper<ReadonlyArray<Tool.Any>>,
  state: StreamState,
  chunk: OpenAiCompatChatCompletionChunk
): Effect.Effect<readonly [StreamState, ReadonlyArray<Response.StreamPartEncoded>], AiError.AiError> =>
  Effect.gen(function* () {
    const choiceParts = yield* pipe(
      chunk.choices,
      Effect.forEach((choice) =>
        Effect.gen(function* () {
          const textParts = pipe(
            optionalString(choice.delta?.content),
            O.match({
              onNone: A.empty<Response.StreamPartEncoded>,
              onSome: (delta) => [
                ...(state.textStarted ? [] : [Response.makePart("text-start", { id: "0" })]),
                Response.makePart("text-delta", { delta, id: "0" }),
              ],
            })
          );
          const toolParts = yield* pipe(
            choice.delta?.tool_calls ?? [],
            Effect.forEach((toolCall) => makeToolCallPart(moduleName, toolNameMapper, toolCall))
          );
          const hasFinish = !P.isNullish(choice.finish_reason);
          const parts: ReadonlyArray<Response.StreamPartEncoded> = [
            ...textParts,
            ...toolParts,
            ...(hasFinish && (state.textStarted || textParts.length > 0)
              ? [Response.makePart("text-end", { id: "0" })]
              : []),
            ...(hasFinish ? [makeFinishPart(chunk.usage, choice.finish_reason)] : []),
          ];
          return parts;
        })
      )
    );
    const parts: Array<Response.StreamPartEncoded> = pipe(choiceParts, A.flatten);
    const textStarted =
      state.textStarted ||
      pipe(
        parts,
        A.some((part) => part.type === "text-start")
      );
    const textEnded =
      state.textEnded ||
      pipe(
        parts,
        A.some((part) => part.type === "text-end")
      );
    const finished =
      state.finished ||
      pipe(
        parts,
        A.some((part) => part.type === "finish")
      );
    return Tuple.make({ finished, textEnded, textStarted }, parts);
  });

const makeStreamResponse = (
  moduleName: string,
  toolNameMapper: Tool.NameMapper<ReadonlyArray<Tool.Any>>,
  stream: Stream.Stream<OpenAiCompatChatCompletionChunk, AiError.AiError>
): Stream.Stream<Response.StreamPartEncoded, AiError.AiError> =>
  stream.pipe(
    Stream.mapAccumEffect(
      initialStreamState,
      (state, chunk) => makeStreamChoiceParts(moduleName, toolNameMapper, state, chunk),
      { onHalt: finishStreamParts }
    )
  );

/**
 * Builds an Effect AI language-model service from OpenAI-compatible provider callbacks.
 *
 * @example
 * ```ts
 * import { Effect, Stream } from "effect"
 * import { makeFromProvider } from "@beep/openai-compat"
 *
 * const model = makeFromProvider({
 *   model: "gpt-compatible",
 *   moduleName: "ExampleLanguageModel",
 *   provider: {
 *     createChatCompletion: () => Effect.succeed({ choices: [] }),
 *     streamChatCompletion: () => Stream.empty
 *   }
 * })
 *
 * void model
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const makeFromProvider: (options: OpenAiCompatLanguageModelOptions) => Effect.Effect<LanguageModel.Service> =
  Effect.fn("OpenAiCompatLanguageModel.makeFromProvider")(function* (options) {
    const { config = new OpenAiCompatLanguageModelConfig({}), model, moduleName, provider } = options;

    return yield* LanguageModel.make({
      codecTransformer: toCodecOpenAI,
      generateText: Effect.fnUntraced(function* (options) {
        const toolNameMapper = new Tool.NameMapper(options.tools);
        const request = yield* makeRequest(moduleName, model, config, options, toolNameMapper, false);
        const response = yield* provider.createChatCompletion(request);
        return yield* makeChoiceParts(moduleName, toolNameMapper, response);
      }),
      streamText: (options) => {
        const toolNameMapper = new Tool.NameMapper(options.tools);
        return pipe(
          makeRequest(moduleName, model, config, options, toolNameMapper, true),
          Effect.map((request) =>
            makeStreamResponse(moduleName, toolNameMapper, provider.streamChatCompletion(request))
          ),
          Stream.unwrap
        );
      },
    });
  });

/**
 * Builds a layer for an OpenAI-compatible language model from provider callbacks.
 *
 * @example
 * ```ts
 * import { Effect, Stream } from "effect"
 * import { layerFromProvider } from "@beep/openai-compat"
 *
 * const layer = layerFromProvider({
 *   model: "gpt-compatible",
 *   moduleName: "ExampleLanguageModel",
 *   provider: {
 *     createChatCompletion: () => Effect.succeed({ choices: [] }),
 *     streamChatCompletion: () => Stream.empty
 *   }
 * })
 *
 * void layer
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const layerFromProvider = (
  options: OpenAiCompatLanguageModelOptions
): Layer.Layer<LanguageModel.LanguageModel> => Layer.effect(LanguageModel.LanguageModel, makeFromProvider(options));

/**
 * Builds an OpenAI-compatible language-model service backed by {@link OpenAiCompatClient}.
 *
 * @example
 * ```ts
 * import { make } from "@beep/openai-compat"
 *
 * const model = make({ model: "gpt-compatible" })
 *
 * void model
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const make: (
  options: OpenAiCompatLanguageModelClientOptions
) => Effect.Effect<LanguageModel.Service, never, OpenAiCompatClient> = Effect.fn("OpenAiCompatLanguageModel.make")(
  function* (options) {
    const client = yield* OpenAiCompatClient;
    return yield* makeFromProvider({
      ...(options.config === undefined ? {} : { config: options.config }),
      model: options.model,
      moduleName: "OpenAiCompatLanguageModel",
      provider: {
        createChatCompletion: client.createChatCompletion,
        streamChatCompletion: client.streamChatCompletion,
      },
    });
  }
);

/**
 * Builds a language-model layer backed by {@link OpenAiCompatClient}.
 *
 * @example
 * ```ts
 * import { layer } from "@beep/openai-compat"
 *
 * const modelLayer = layer({ model: "gpt-compatible" })
 *
 * void modelLayer
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const layer = (
  options: OpenAiCompatLanguageModelClientOptions
): Layer.Layer<LanguageModel.LanguageModel, never, OpenAiCompatClient> =>
  Layer.effect(LanguageModel.LanguageModel, make(options));

/**
 * Builds an Effect AI model value for a generic OpenAI-compatible provider.
 *
 * @example
 * ```ts
 * import { model } from "@beep/openai-compat"
 *
 * const aiModel = model("gpt-compatible")
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
): AiModel.Model<"openai-compat", LanguageModel.LanguageModel, OpenAiCompatClient> =>
  AiModel.make(
    "openai-compat",
    modelName,
    layer(config === undefined ? { model: modelName } : { config, model: modelName })
  );
