import {
  makeFromProvider,
  type OpenAiCompatChatCompletionChunk,
  type OpenAiCompatChatCompletionRequest,
  type OpenAiCompatChatCompletionResponse,
} from "@beep/openai-compat";
import { describe, expect, it } from "@effect/vitest";
import { Array as A, Effect, pipe, Ref, Stream } from "effect";
import * as S from "effect/Schema";
import * as Tool from "effect/unstable/ai/Tool";
import * as Toolkit from "effect/unstable/ai/Toolkit";

const makeResponse = (content: string, finishReason: string | null = "stop"): OpenAiCompatChatCompletionResponse => ({
  choices: [
    {
      finish_reason: finishReason,
      index: 0,
      message: {
        content,
        role: "assistant",
      },
    },
  ],
  usage: {
    completion_tokens: 2,
    prompt_tokens: 1,
    total_tokens: 3,
  },
});

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
                  finish_reason: "tool_calls",
                  index: 0,
                  message: {
                    role: "assistant",
                    tool_calls: [
                      {
                        function: {
                          arguments: '{"city":"Austin"}',
                          name: "weather",
                        },
                        id: "call_1",
                        type: "function",
                      },
                    ],
                  },
                },
              ],
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
            delta: { content, role: "assistant" },
            finish_reason: finishReason,
            index: 0,
          },
        ],
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
});
