import type { ChatModel } from "@/db/chat-model.js";
import * as Chat from "@app/domain/api/chat-rpc";
import { describe, expect, it } from "@effect/vitest";
import { withLanguageModel } from "@test/utils/with-language-model.js";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as PubSub from "effect/PubSub";
import * as Stream from "effect/Stream";
import type * as Take from "effect/Take";
import { ChatProcessor, makePrompt } from "./chat-processor.js";
import { HandlersLive } from "./chat-toolkit-live.js";
import { ChatMailbox } from "./chat-toolkit.js";
import { JokeApi } from "./joke-api.js";
import { WeatherApi } from "./weather-api.js";

const makeMailbox = Effect.gen(function*() {
  const mailbox = yield* PubSub.unbounded<
    Take.Take<Chat.ChatEvent>
  >({
    replay: 100,
  });
  const events = (n: number) =>
    Stream.fromPubSubTake(mailbox).pipe(
      Stream.take(n),
      Stream.runCollect,
    );
  return { mailbox, events };
});

const MockWeatherApi = Layer.mock(WeatherApi)({
  getForecast: () => Effect.succeed("Sunny, 22°C"),
});

const MockJokeApi = Layer.mock(JokeApi)({
  fetchRandom: () => Effect.succeed("Why did the chicken cross the road?"),
});

const TestHandlers = HandlersLive.pipe(
  Layer.provide(MockWeatherApi),
  Layer.provide(MockJokeApi),
);

const mockChat = (overrides?: Partial<typeof ChatModel.Type>): typeof ChatModel.Type => ({
  id: Chat.ChatId.make("00000000-0000-4000-8000-000000000001"),
  userId: "user-1",
  title: "Test Chat",
  model: "llama3.2",
  messages: [],
  activeRunId: null,
  createdAt: DateTime.nowUnsafe(),
  updatedAt: DateTime.nowUnsafe(),
  ...overrides,
});

describe("makePrompt", () => {
  it("empty messages returns only system message", () => {
    const result = makePrompt([]);
    expect(result).toHaveLength(1);
    expect(result[0]!.role).toBe("system");
  });

  it("user string message forwarded verbatim", () => {
    const result = makePrompt([{ role: "user", content: "hello" }]);
    expect(result).toHaveLength(2);
    expect(result[1]).toEqual({ role: "user", content: "hello" });
  });

  it("user array message maps text parts", () => {
    const result = makePrompt([{ role: "user", content: [{ type: "text", text: "hello" }] }]);
    expect(result).toHaveLength(2);
    expect(result[1]).toEqual({ role: "user", content: [{ type: "text", text: "hello" }] });
  });

  it("assistant string message wrapped in text array", () => {
    const result = makePrompt([{ role: "assistant", content: "reply" }]);
    expect(result).toHaveLength(2);
    expect(result[1]).toEqual({ role: "assistant", content: [{ type: "text", text: "reply" }] });
  });

  it("assistant array with reasoning, text, and tool-call parts forwarded", () => {
    const result = makePrompt([{
      role: "assistant",
      content: [
        { type: "reasoning", text: "Thinking" },
        { type: "text", text: "Using tool" },
        { type: "tool-call", id: "c1", name: "getCurrentDateTime", params: {} },
      ],
    }]);
    expect(result).toHaveLength(2);
    expect(result[1]).toEqual({
      role: "assistant",
      content: [
        { type: "reasoning", text: "Thinking" },
        { type: "text", text: "Using tool" },
        { type: "tool-call", id: "c1", name: "getCurrentDateTime", params: {} },
      ],
    });
  });

  it("tool message forwarded", () => {
    const result = makePrompt([{
      role: "tool",
      content: [{
        type: "tool-result",
        id: "c1",
        name: "getCurrentDateTime",
        result: "2024-01-01T00:00:00Z",
        isFailure: false,
      }],
    }]);
    expect(result).toHaveLength(2);
    expect(result[1]).toEqual({
      role: "tool",
      content: [{
        type: "tool-result",
        id: "c1",
        name: "getCurrentDateTime",
        result: "2024-01-01T00:00:00Z",
        isFailure: false,
      }],
    });
  });
});

describe("ChatProcessor", () => {
  it.effect("text-delta parts become Chunk mailbox events", () =>
    Effect.gen(function*() {
      const { mailbox, events } = yield* makeMailbox;
      const processor = yield* ChatProcessor;

      yield* processor.run(mockChat(), "Hello").pipe(
        withLanguageModel({
          streamText: [{ type: "text-delta", id: "t1", delta: "Hello!" }],
        }),
        Effect.provideService(ChatMailbox, mailbox),
        Effect.provide(TestHandlers),
      );

      const evts = yield* events(1);
      expect(evts).toHaveLength(1);
      expect(evts[0]).toEqual({ _tag: "Chunk", delta: "Hello!" });
    }).pipe(Effect.provide(ChatProcessor.layer)));

  it.effect("reasoning-delta parts become ReasoningChunk mailbox events", () =>
    Effect.gen(function*() {
      const { mailbox, events } = yield* makeMailbox;
      const processor = yield* ChatProcessor;

      const result = yield* processor.run(mockChat(), "Think carefully").pipe(
        withLanguageModel({
          streamText: [{ type: "reasoning-delta", id: "r1", delta: "Thinking..." }],
        }),
        Effect.provideService(ChatMailbox, mailbox),
        Effect.provide(TestHandlers),
      );

      const evts = yield* events(1);
      expect(evts).toHaveLength(1);
      expect(evts[0]).toEqual({ _tag: "ReasoningChunk", delta: "Thinking..." });
      expect(result).toEqual([{
        role: "assistant",
        content: [{ type: "reasoning", text: "Thinking..." }],
      }]);
    }).pipe(Effect.provide(ChatProcessor.layer)));

  it.effect("reasoning and text response is returned as assistant message parts", () =>
    Effect.gen(function*() {
      const { mailbox } = yield* makeMailbox;
      const processor = yield* ChatProcessor;

      const result = yield* processor.run(mockChat(), "Think then answer").pipe(
        withLanguageModel({
          streamText: [
            { type: "reasoning-delta", id: "r1", delta: "Thinking" },
            { type: "reasoning-delta", id: "r1", delta: "..." },
            { type: "text-delta", id: "t1", delta: "Answer" },
          ],
        }),
        Effect.provideService(ChatMailbox, mailbox),
        Effect.provide(TestHandlers),
      );

      expect(result).toEqual([{
        role: "assistant",
        content: [
          { type: "reasoning", text: "Thinking..." },
          { type: "text", text: "Answer" },
        ],
      }]);
    }).pipe(Effect.provide(ChatProcessor.layer)));

  it.effect("loop continues on tool-calls finish reason and stops on stop", () =>
    Effect.gen(function*() {
      const { mailbox } = yield* makeMailbox;
      const processor = yield* ChatProcessor;
      let calls = 0;

      yield* processor.run(mockChat(), "What time is it?").pipe(
        withLanguageModel({
          streamText: () => {
            calls += 1;
            if (calls === 1) {
              return [{
                type: "finish" as const,
                reason: "tool-calls" as const,
                usage: {
                  inputTokens: {
                    uncached: undefined,
                    total: undefined,
                    cacheRead: undefined,
                    cacheWrite: undefined,
                  },
                  outputTokens: { total: undefined, text: undefined, reasoning: undefined },
                },
                response: undefined,
              }];
            }
            return [{ type: "text-delta" as const, id: "t1", delta: "It is noon." }];
          },
        }),
        Effect.provideService(ChatMailbox, mailbox),
        Effect.provide(TestHandlers),
      );

      expect(calls).toBe(2);
    }).pipe(Effect.provide(ChatProcessor.layer)));

  it.effect("text response is returned as assistant message", () =>
    Effect.gen(function*() {
      const { mailbox } = yield* makeMailbox;
      const processor = yield* ChatProcessor;

      const result = yield* processor.run(mockChat(), "Hello").pipe(
        withLanguageModel({
          streamText: [{ type: "text-delta", id: "t1", delta: "Hi there" }],
        }),
        Effect.provideService(ChatMailbox, mailbox),
        Effect.provide(TestHandlers),
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ role: "assistant", content: "Hi there" });
    }).pipe(Effect.provide(ChatProcessor.layer)));

  it.effect("user message is NOT in returned array", () =>
    Effect.gen(function*() {
      const { mailbox } = yield* makeMailbox;
      const processor = yield* ChatProcessor;

      const result = yield* processor.run(mockChat(), "Hello").pipe(
        withLanguageModel({
          streamText: [{ type: "text-delta", id: "t1", delta: "Reply" }],
        }),
        Effect.provideService(ChatMailbox, mailbox),
        Effect.provide(TestHandlers),
      );

      expect(result.every((m) => m.role !== "user")).toBe(true);
    }).pipe(Effect.provide(ChatProcessor.layer)));
});
