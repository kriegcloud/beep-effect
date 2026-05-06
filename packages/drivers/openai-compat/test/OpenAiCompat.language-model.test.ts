import {
  decodeChatCompletionChunk,
  makeFromProvider,
  type OpenAiCompatChatCompletionChunk,
  OpenAiCompatChatCompletionRequest,
  type OpenAiCompatChatCompletionResponse,
  OpenAiCompatClient,
  OpenAiCompatClientOptions,
} from "@beep/openai-compat";
import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer, pipe, Redacted, Ref, Stream } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as AiError from "effect/unstable/ai/AiError";
import * as Prompt from "effect/unstable/ai/Prompt";
import * as Tool from "effect/unstable/ai/Tool";
import * as Toolkit from "effect/unstable/ai/Toolkit";
import * as HttpClient from "effect/unstable/http/HttpClient";
import type * as HttpClientError from "effect/unstable/http/HttpClientError";
import type * as HttpClientRequest from "effect/unstable/http/HttpClientRequest";
import * as HttpClientResponse from "effect/unstable/http/HttpClientResponse";

const makeResponse = (content: string, finishReason: string | null = "stop"): OpenAiCompatChatCompletionResponse => ({
  choices: [
    {
      finish_reason: O.fromNullishOr(finishReason),
      index: 0,
      message: O.some({
        content: O.some(content),
        role: "assistant",
        tool_calls: O.none(),
      }),
    },
  ],
  usage: O.some({
    completion_tokens: O.some(2),
    prompt_tokens: O.some(1),
    prompt_tokens_details: O.none(),
    total_tokens: O.some(3),
  }),
});

type TestRespond = (
  request: HttpClientRequest.HttpClientRequest
) => Effect.Effect<Response, HttpClientError.HttpClientError>;

const makeHttpClientLayer = (respond: TestRespond): Layer.Layer<HttpClient.HttpClient> =>
  Layer.effect(
    HttpClient.HttpClient,
    Effect.succeed(
      HttpClient.make((request) =>
        pipe(
          respond(request),
          Effect.map((response) => HttpClientResponse.fromWeb(request, response))
        )
      )
    )
  );

const makeOpenAiCompatClientLayer = (respond: TestRespond) =>
  OpenAiCompatClient.makeLayer(new OpenAiCompatClientOptions({ apiKey: Redacted.make("test-key") })).pipe(
    Layer.provide(makeHttpClientLayer(respond))
  );

describe("OpenAiCompat language model", () => {
  it.effect("translates Effect prompts into chat completion requests", () =>
    Effect.gen(function* () {
      const requests = yield* Ref.make<ReadonlyArray<OpenAiCompatChatCompletionRequest>>([]);
      const languageModel = yield* makeFromProvider({
        model: "compat-model",
        moduleName: "OpenAiCompatLanguageModelTest",
        provider: {
          createChatCompletion: (request) =>
            pipe(Ref.update(requests, A.append(request)), Effect.as(makeResponse("hello from compat"))),
          streamChatCompletion: () => Stream.empty,
        },
      });

      const response = yield* languageModel.generateText({ prompt: "hello" });
      const captured = yield* Ref.get(requests);

      expect(response.text).toBe("hello from compat");
      expect(response.finishReason).toBe("stop");
      expect(response.usage.inputTokens.total).toBe(1);
      expect(captured).toHaveLength(1);
      expect(captured[0]?.model).toBe("compat-model");
      expect(captured[0]?.messages).toEqual([{ content: [{ text: "hello", type: "text" }], role: "user" }]);
    })
  );

  it.effect("decodes tool calls from chat completion responses", () =>
    Effect.gen(function* () {
      const languageModel = yield* makeFromProvider({
        model: "compat-model",
        moduleName: "OpenAiCompatLanguageModelTest",
        provider: {
          createChatCompletion: () =>
            Effect.succeed({
              choices: [
                {
                  finish_reason: O.some("tool_calls"),
                  index: 0,
                  message: O.some({
                    content: O.none(),
                    role: "assistant",
                    tool_calls: O.some([
                      {
                        function: {
                          arguments: '{"city":"Austin"}',
                          name: "weather",
                        },
                        id: "call_1",
                        type: "function",
                      },
                    ]),
                  }),
                },
              ],
              usage: O.none(),
            }),
          streamChatCompletion: () => Stream.empty,
        },
      });

      const WeatherTool = Tool.make("weather", {
        parameters: S.Struct({ city: S.String }),
        success: S.String,
      });
      const response = yield* languageModel.generateText({
        disableToolCallResolution: true,
        prompt: "weather",
        toolkit: Toolkit.make(WeatherTool),
      });

      expect(response.finishReason).toBe("tool-calls");
      expect(response.toolCalls[0]?.id).toBe("call_1");
      expect(response.toolCalls[0]?.name).toBe("weather");
      expect(response.toolCalls[0]?.params).toEqual({ city: "Austin" });
    })
  );

  it.effect("streams chat completion chunks as Effect AI stream parts", () =>
    Effect.gen(function* () {
      const chunk = (content: string, finishReason?: string | null): OpenAiCompatChatCompletionChunk => ({
        choices: [
          {
            delta: O.some({ content: O.some(content), role: "assistant", tool_calls: O.none() }),
            finish_reason: O.fromNullishOr(finishReason),
            index: 0,
          },
        ],
        usage: O.none(),
      });
      const languageModel = yield* makeFromProvider({
        model: "compat-model",
        moduleName: "OpenAiCompatLanguageModelTest",
        provider: {
          createChatCompletion: () => Effect.succeed(makeResponse("unused")),
          streamChatCompletion: () => Stream.make(chunk("hi "), chunk("there", "stop")),
        },
      });

      const parts = yield* pipe(
        languageModel.streamText({ prompt: "hello" }),
        Stream.runCollect,
        Effect.map(A.fromIterable)
      );

      expect(A.map(parts, (part) => part.type)).toEqual([
        "text-start",
        "text-delta",
        "text-delta",
        "text-end",
        "finish",
      ]);
      expect(
        pipe(
          parts,
          A.filter((part) => part.type === "text-delta"),
          A.map((part) => part.delta),
          A.join("")
        )
      ).toBe("hi there");
    })
  );

  it.effect("decodes partial streaming tool-call deltas", () =>
    Effect.gen(function* () {
      const chunk = yield* decodeChatCompletionChunk({
        choices: [
          {
            delta: {
              tool_calls: [
                {
                  function: {
                    arguments: '{"city"',
                  },
                  index: 0,
                },
              ],
            },
            index: 0,
          },
        ],
      });
      const toolCalls = pipe(
        chunk.choices,
        A.head,
        O.flatMap((choice) => choice.delta),
        O.flatMap((delta) => delta.tool_calls),
        O.getOrElse(A.empty)
      );

      expect(toolCalls[0]?.id).toBeUndefined();
      expect(toolCalls[0]?.function?.name).toBeUndefined();
      expect(toolCalls[0]?.function?.arguments).toBe('{"city"');
    })
  );

  it.effect("buffers streaming tool-call argument deltas until JSON is complete", () =>
    Effect.gen(function* () {
      const chunk = (
        toolCalls: OpenAiCompatChatCompletionChunk["choices"][number]["delta"],
        finishReason?: string
      ): OpenAiCompatChatCompletionChunk => ({
        choices: [
          {
            delta: toolCalls,
            finish_reason: O.fromUndefinedOr(finishReason),
            index: 0,
          },
        ],
        id: "chatcmpl_test",
        usage: O.none(),
      });
      const WeatherTool = Tool.make("weather", {
        parameters: S.Struct({ city: S.String }),
        success: S.String,
      });
      const languageModel = yield* makeFromProvider({
        model: "compat-model",
        moduleName: "OpenAiCompatLanguageModelTest",
        provider: {
          createChatCompletion: () => Effect.succeed(makeResponse("unused")),
          streamChatCompletion: () =>
            Stream.make(
              chunk(
                O.some({
                  content: O.none(),
                  role: "assistant",
                  tool_calls: O.some([
                    {
                      function: {
                        arguments: '{"city"',
                        name: "weather",
                      },
                      id: "call_1",
                      index: 0,
                      type: "function",
                    },
                  ]),
                })
              ),
              chunk(
                O.some({
                  content: O.none(),
                  tool_calls: O.some([
                    {
                      function: {
                        arguments: ':"Austin"}',
                      },
                      index: 0,
                    },
                  ]),
                }),
                "tool_calls"
              )
            ),
        },
      });

      const parts = yield* pipe(
        languageModel.streamText({
          disableToolCallResolution: true,
          prompt: "weather",
          toolkit: Toolkit.make(WeatherTool),
        }),
        Stream.runCollect,
        Effect.map(A.fromIterable)
      );
      const toolCall = pipe(
        parts,
        A.findFirst((part) => part.type === "tool-call"),
        O.getOrThrow
      );
      if (toolCall.type !== "tool-call") {
        return yield* Effect.die("Expected streamed parts to include a completed tool call.");
      }

      expect(A.map(parts, (part) => part.type)).toEqual([
        "tool-params-start",
        "tool-params-delta",
        "tool-params-delta",
        "tool-params-end",
        "tool-call",
        "finish",
      ]);
      expect(toolCall.params).toEqual({ city: "Austin" });
    })
  );

  it.effect("rejects non-image file parts before provider calls", () =>
    Effect.gen(function* () {
      const languageModel = yield* makeFromProvider({
        model: "compat-model",
        moduleName: "OpenAiCompatLanguageModelTest",
        provider: {
          createChatCompletion: () => Effect.die("provider should not be called"),
          streamChatCompletion: () => Stream.empty,
        },
      });

      const error = yield* pipe(
        languageModel.generateText({
          prompt: Prompt.make([
            {
              content: [
                Prompt.filePart({
                  data: new URL("https://example.com/document.pdf"),
                  mediaType: "application/pdf",
                }),
              ],
              role: "user",
            },
          ]),
        }),
        Effect.flip
      );

      expect(AiError.isAiError(error)).toBe(true);
      expect(error.method).toBe("prepareMessages");
      expect(error.reason._tag).toBe("UnsupportedSchemaError");
      expect(error.reason.message).toContain("application/pdf");
    })
  );

  it.effect("maps tool schema conversion failures to UnsupportedSchemaError before provider calls", () =>
    Effect.gen(function* () {
      const languageModel = yield* makeFromProvider({
        model: "compat-model",
        moduleName: "OpenAiCompatLanguageModelTest",
        provider: {
          createChatCompletion: () => Effect.die("provider should not be called"),
          streamChatCompletion: () => Stream.empty,
        },
      });
      const UnsupportedTool = Tool.make("unsupported_schema", {
        parameters: S.Unknown,
        success: S.String,
      });

      const error = yield* pipe(
        languageModel.generateText({
          prompt: "use tool",
          toolkit: Toolkit.make(UnsupportedTool),
        }),
        Effect.flip
      );

      expect(AiError.isAiError(error)).toBe(true);
      expect(error.method).toBe("prepareTools");
      expect(error.reason._tag).toBe("UnsupportedSchemaError");
    })
  );

  it.effect("maps structured response schema conversion failures to UnsupportedSchemaError before provider calls", () =>
    Effect.gen(function* () {
      const languageModel = yield* makeFromProvider({
        model: "compat-model",
        moduleName: "OpenAiCompatLanguageModelTest",
        provider: {
          createChatCompletion: () => Effect.die("provider should not be called"),
          streamChatCompletion: () => Stream.empty,
        },
      });

      const error = yield* pipe(
        languageModel.generateObject({
          prompt: "return object",
          schema: S.Unknown,
        }),
        Effect.flip
      );

      expect(AiError.isAiError(error)).toBe(true);
      expect(error.method).toBe("prepareResponseFormat");
      expect(error.reason._tag).toBe("UnsupportedSchemaError");
    })
  );

  it.effect("maps JSON body encoding failures to AiError", () =>
    Effect.gen(function* () {
      const request = new OpenAiCompatChatCompletionRequest({
        messages: [],
        model: "compat-model",
        stream_options: {
          retry_after: 1n,
        },
      });

      const error = yield* pipe(
        Effect.gen(function* () {
          const client = yield* OpenAiCompatClient;
          return yield* client.createChatCompletion(request).pipe(Effect.flip);
        }),
        Effect.provide(makeOpenAiCompatClientLayer(() => Effect.die("body encoding should fail before execute")))
      );

      expect(AiError.isAiError(error)).toBe(true);
      expect(error.method).toBe("createChatCompletion");
      expect(error.reason._tag).toBe("InvalidRequestError");
    })
  );

  it.effect("maps non-2xx client responses without exposing response bodies", () =>
    Effect.gen(function* () {
      const request = new OpenAiCompatChatCompletionRequest({
        messages: [],
        model: "compat-model",
      });

      const error = yield* pipe(
        Effect.gen(function* () {
          const client = yield* OpenAiCompatClient;
          return yield* client.createChatCompletion(request).pipe(Effect.flip);
        }),
        Effect.provide(
          makeOpenAiCompatClientLayer(() =>
            Effect.succeed(
              new Response('{"secret":"prompt text"}', {
                status: 401,
              })
            )
          )
        )
      );

      expect(AiError.isAiError(error)).toBe(true);
      expect(error.method).toBe("createChatCompletion");
      expect(error.reason._tag).toBe("AuthenticationError");
      expect(error.reason.message).not.toContain("prompt text");
    })
  );

  it.effect("rejects stream responses whose leading content type is not text/event-stream", () =>
    Effect.gen(function* () {
      const request = new OpenAiCompatChatCompletionRequest({
        messages: [],
        model: "compat-model",
      });

      const error = yield* pipe(
        Effect.gen(function* () {
          const client = yield* OpenAiCompatClient;
          return yield* client.streamChatCompletion(request).pipe(Stream.runCollect, Effect.flip);
        }),
        Effect.provide(
          makeOpenAiCompatClientLayer(() =>
            Effect.succeed(
              new Response("{}", {
                headers: {
                  "content-type": "application/json; note=text/event-stream",
                },
              })
            )
          )
        )
      );

      expect(AiError.isAiError(error)).toBe(true);
      expect(error.method).toBe("streamChatCompletion");
      expect(error.reason._tag).toBe("InvalidOutputError");
    })
  );

  it.effect("maps SSE retry directives to typed AiError", () =>
    Effect.gen(function* () {
      const request = new OpenAiCompatChatCompletionRequest({
        messages: [],
        model: "compat-model",
      });

      const error = yield* pipe(
        Effect.gen(function* () {
          const client = yield* OpenAiCompatClient;
          return yield* client.streamChatCompletion(request).pipe(Stream.runCollect, Effect.flip);
        }),
        Effect.provide(
          makeOpenAiCompatClientLayer(() =>
            Effect.succeed(
              new Response("retry: 1000\n\n", {
                headers: {
                  "content-type": "text/event-stream",
                },
              })
            )
          )
        )
      );

      expect(AiError.isAiError(error)).toBe(true);
      expect(error.method).toBe("streamChatCompletion");
      expect(error.reason._tag).toBe("InvalidOutputError");
    })
  );
});
