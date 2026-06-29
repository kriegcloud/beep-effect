import type * as Chat from "@app/domain/api/chat-rpc";
import { describe, expect, it } from "@effect/vitest";
import { withLanguageModel } from "@test/utils/with-language-model.js";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as PubSub from "effect/PubSub";
import * as Stream from "effect/Stream";
import type * as Take from "effect/Take";
import { LanguageModel } from "effect/unstable/ai";
import { HandlersLive } from "./chat-toolkit-live.js";
import { ChatMailbox, ChatToolkit } from "./chat-toolkit.js";
import { JokeApi, JokeApiError } from "./joke-api.js";
import { WeatherApi, WeatherApiError } from "./weather-api.js";

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
  getForecast: () => Effect.succeed("Temperature: 22°C, Weather code: 0, Wind: 10 km/h"),
});

const MockJokeApi = Layer.mock(JokeApi)({
  fetchRandom: () => Effect.succeed("Why did the chicken cross the road?"),
});

const TestHandlers = HandlersLive.pipe(
  Layer.provide(MockWeatherApi),
  Layer.provide(MockJokeApi),
);

describe("chat toolkit handlers", () => {
  it.effect("getCurrentDateTime returns ISO date and emits events", () =>
    Effect.gen(function*() {
      const { mailbox, events } = yield* makeMailbox;

      const response = yield* LanguageModel.generateText({
        prompt: "What time is it?",
        toolkit: ChatToolkit,
      }).pipe(
        withLanguageModel({
          generateText: [{
            type: "tool-call",
            id: "t1",
            name: "getCurrentDateTime",
            params: {},
          }],
        }),
        Effect.provideService(ChatMailbox, mailbox),
        Effect.provide(TestHandlers),
      );

      expect(response.toolResults).toHaveLength(1);
      expect(response.toolResults[0]!.isFailure).toBe(false);

      const evts = yield* events(2);
      expect(evts).toHaveLength(2);
      expect(evts[0]!._tag).toBe("ToolStart");
      expect(evts[1]!._tag).toBe("ToolSuccess");
    }));

  it.effect("getWeather success returns formatted weather and emits events", () =>
    Effect.gen(function*() {
      const { mailbox, events } = yield* makeMailbox;

      const response = yield* LanguageModel.generateText({
        prompt: "What's the weather?",
        toolkit: ChatToolkit,
      }).pipe(
        withLanguageModel({
          generateText: [{
            type: "tool-call",
            id: "t1",
            name: "getWeather",
            params: { latitude: 40.7, longitude: -74.0 },
          }],
        }),
        Effect.provideService(ChatMailbox, mailbox),
        Effect.provide(TestHandlers),
      );

      expect(response.toolResults).toHaveLength(1);
      expect(response.toolResults[0]!.isFailure).toBe(false);

      const evts = yield* events(2);
      expect(evts).toHaveLength(2);
      expect(evts[0]!._tag).toBe("ToolStart");
      expect(evts[1]!._tag).toBe("ToolSuccess");
    }));

  it.effect("getWeather accepts numeric string coordinates from local model tool calls", () =>
    Effect.gen(function*() {
      const { mailbox, events } = yield* makeMailbox;

      const response = yield* LanguageModel.generateText({
        prompt: "What's the weather?",
        toolkit: ChatToolkit,
      }).pipe(
        withLanguageModel({
          generateText: [{
            type: "tool-call",
            id: "t1",
            name: "getWeather",
            params: { latitude: "40.7", longitude: "-74.0" },
          }],
        }),
        Effect.provideService(ChatMailbox, mailbox),
        Effect.provide(TestHandlers),
      );

      expect(response.toolResults).toHaveLength(1);
      expect(response.toolResults[0]!.isFailure).toBe(false);

      const evts = yield* events(2);
      expect(evts[0]).toMatchObject({
        _tag: "ToolStart",
        input: JSON.stringify({ latitude: 40.7, longitude: -74 }),
      });
      expect(evts[1]!._tag).toBe("ToolSuccess");
    }));

  it.effect("getWeather failure emits ToolFailure and returns error to model", () =>
    Effect.gen(function*() {
      const { mailbox, events } = yield* makeMailbox;

      const FailingWeatherApi = Layer.mock(WeatherApi)({
        getForecast: () =>
          Effect.fail(new WeatherApiError({ reason: "RequestFailed", message: "500" })),
      });
      const FailHandlers = HandlersLive.pipe(
        Layer.provide(FailingWeatherApi),
        Layer.provide(MockJokeApi),
      );

      const response = yield* LanguageModel.generateText({
        prompt: "What's the weather?",
        toolkit: ChatToolkit,
      }).pipe(
        withLanguageModel({
          generateText: [{
            type: "tool-call",
            id: "t1",
            name: "getWeather",
            params: { latitude: 40.7, longitude: -74.0 },
          }],
        }),
        Effect.provideService(ChatMailbox, mailbox),
        Effect.provide(FailHandlers),
      );

      expect(response.toolResults).toHaveLength(1);
      expect(response.toolResults[0]!.isFailure).toBe(true);

      const evts = yield* events(2);
      expect(evts).toHaveLength(2);
      expect(evts[0]!._tag).toBe("ToolStart");
      expect(evts[1]!._tag).toBe("ToolFailure");
    }));

  it.effect("fetchRandomJoke success returns joke and emits events", () =>
    Effect.gen(function*() {
      const { mailbox, events } = yield* makeMailbox;

      const response = yield* LanguageModel.generateText({
        prompt: "Tell me a joke",
        toolkit: ChatToolkit,
      }).pipe(
        withLanguageModel({
          generateText: [{
            type: "tool-call",
            id: "t1",
            name: "fetchRandomJoke",
            params: {},
          }],
        }),
        Effect.provideService(ChatMailbox, mailbox),
        Effect.provide(TestHandlers),
      );

      expect(response.toolResults).toHaveLength(1);
      expect(response.toolResults[0]!.isFailure).toBe(false);

      const evts = yield* events(2);
      expect(evts).toHaveLength(2);
      expect(evts[0]!._tag).toBe("ToolStart");
      expect(evts[1]!._tag).toBe("ToolSuccess");
    }));

  it.effect("fetchRandomJoke failure emits ToolFailure and returns error to model", () =>
    Effect.gen(function*() {
      const { mailbox, events } = yield* makeMailbox;

      const FailingJokeApi = Layer.mock(JokeApi)({
        fetchRandom: () =>
          Effect.fail(new JokeApiError({ reason: "RequestFailed", message: "500" })),
      });
      const FailHandlers = HandlersLive.pipe(
        Layer.provide(MockWeatherApi),
        Layer.provide(FailingJokeApi),
      );

      const response = yield* LanguageModel.generateText({
        prompt: "Tell me a joke",
        toolkit: ChatToolkit,
      }).pipe(
        withLanguageModel({
          generateText: [{
            type: "tool-call",
            id: "t1",
            name: "fetchRandomJoke",
            params: {},
          }],
        }),
        Effect.provideService(ChatMailbox, mailbox),
        Effect.provide(FailHandlers),
      );

      expect(response.toolResults).toHaveLength(1);
      expect(response.toolResults[0]!.isFailure).toBe(true);

      const evts = yield* events(2);
      expect(evts).toHaveLength(2);
      expect(evts[0]!._tag).toBe("ToolStart");
      expect(evts[1]!._tag).toBe("ToolFailure");
    }));

  it.effect("streams tool events through mailbox during streamText", () =>
    Effect.gen(function*() {
      const { mailbox, events } = yield* makeMailbox;

      const parts = yield* LanguageModel.streamText({
        prompt: "What time is it?",
        toolkit: ChatToolkit,
      }).pipe(
        Stream.runCollect,
        withLanguageModel({
          streamText: [
            { type: "tool-call", id: "t1", name: "getCurrentDateTime", params: {} },
          ],
        }),
        Effect.provideService(ChatMailbox, mailbox),
        Effect.provide(TestHandlers),
      );

      const toolResults = parts.filter((p) => p.type === "tool-result");
      expect(toolResults).toHaveLength(1);

      const evts = yield* events(2);
      expect(evts.some((e) => e._tag === "ToolStart")).toBe(true);
      expect(evts.some((e) => e._tag === "ToolSuccess")).toBe(true);
    }));
});
