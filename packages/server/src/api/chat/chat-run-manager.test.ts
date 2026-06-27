import type { ChatModel } from "@/db/chat-model.js";
import { ChatRepo } from "@/db/chat-repo.js";
import { AiModels } from "@/lib/ai-models.js";
import * as Chat from "@app/domain/api/chat-rpc";
import { describe, expect, it } from "@effect/vitest";
import { withLanguageModel } from "@test/utils/with-language-model.js";
import * as Cause from "effect/Cause";
import * as DateTime from "effect/DateTime";
import * as Deferred from "effect/Deferred";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as Fiber from "effect/Fiber";
import * as Layer from "effect/Layer";
import * as Scope from "effect/Scope";
import * as Stream from "effect/Stream";
import * as AiError from "effect/unstable/ai/AiError";
import * as WorkflowEngine from "effect/unstable/workflow/WorkflowEngine";
import { ChatProcessor } from "./chat-processor.js";
import { ChatRunManager } from "./chat-run-manager.js";

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

const MockAiModels = Layer.mock(AiModels)({
  use: (_model) => (effect) =>
    withLanguageModel(effect, {
      streamText: [{ type: "text-delta" as const, id: "t1", delta: "Hello" }],
    }),
});

const FailingAiModels = Layer.mock(AiModels)({
  use: (_model) => (_effect) =>
    Effect.fail(
      new AiError.AiError({
        module: "test",
        method: "streamText",
        reason: new AiError.RateLimitError({}),
      }),
    ) as any,
});

const makeMockChatRepo = () =>
  Layer.mock(ChatRepo)({
    create: () => Effect.succeed(mockChat()),
    findById: (chatId) => Effect.succeed(mockChat({ id: chatId })),
    listByUser: () => Effect.succeed({ items: [], hasMore: false }),
    delete: () => Effect.void,
    startRun: () => Effect.succeed(true),
    finishRun: () => Effect.void,
    clearActiveRun: () => Effect.void,
  });

const makeTestLayer = (
  aiLayer: Layer.Layer<AiModels> = MockAiModels,
  repoLayer?: Layer.Layer<ChatRepo>,
) => {
  const repo = repoLayer ?? makeMockChatRepo();
  return Layer.effect(ChatRunManager, ChatRunManager.make).pipe(
    Layer.provide(aiLayer),
    Layer.provide(repo),
    Layer.provide(ChatProcessor.layer),
    Layer.provide(WorkflowEngine.layerMemory),
  );
};

describe("ChatRunManager", () => {
  it.live(
    "startGeneration streams events while the run is active",
    () => {
      const slowAi = Layer.mock(AiModels)({
        use: (_model) => (effect) =>
          withLanguageModel(effect, {
            streamText: () =>
              Stream.make({ type: "text-delta" as const, id: "t1", delta: "Hello" }).pipe(
                Stream.tap(() => Effect.sleep("100 millis")),
              ),
          }),
      });
      return Effect.gen(function*() {
        const mgr = yield* ChatRunManager;
        const chat = mockChat();

        const { runId } = yield* mgr.startGeneration({
          chat,
          message: "Hello",
        });

        const events = yield* mgr.subscribe(runId, chat.userId).pipe(Stream.runCollect);
        expect(events.some((event) => event._tag === "Chunk")).toBe(true);
      }).pipe(Effect.provide(makeTestLayer(slowAi)));
    },
    { timeout: 5000 },
  );

  it.live("startGeneration fails with GenerationInProgressError when already running", () => {
    const slowAi = Layer.mock(AiModels)({
      use: (_model) => (effect) =>
        withLanguageModel(effect, {
          streamText: () =>
            Stream.make({ type: "text-delta" as const, id: "t1", delta: "slow" }).pipe(
              Stream.tap(() => Effect.sleep("2 seconds")),
            ),
        }),
    });
    return Effect.gen(function*() {
      const mgr = yield* ChatRunManager;
      const chat = mockChat();

      yield* mgr.startGeneration({
        chat,
        message: "First",
      });
      yield* Effect.sleep("50 millis");

      const exit = yield* mgr.startGeneration({
        chat,
        message: "Second",
      }).pipe(Effect.exit);

      expect(exit._tag).toBe("Failure");
    }).pipe(Effect.provide(makeTestLayer(slowAi)));
  }, { timeout: 5000 });

  it.effect("subscribe fails with ChatRunNotFoundError when run is missing", () =>
    Effect.gen(function*() {
      const mgr = yield* ChatRunManager;
      const runId = Chat.RunId.make("00000000-0000-4000-8000-000000000099");

      const exit = yield* mgr.subscribe(runId, "user-1").pipe(Stream.runDrain, Effect.exit);
      expect(exit._tag).toBe("Failure");
      if (exit._tag === "Failure") {
        expect(
          exit.cause.reasons.some((reason) =>
            reason._tag === "Fail" && reason.error._tag === "ChatRunNotFoundError"
          ),
        ).toBe(true);
      }
    }).pipe(Effect.provide(makeTestLayer())));

  it.live(
    "subscribe fails with ChatRunNotFoundError when userId does not match",
    () =>
      Effect.gen(function*() {
        const mgr = yield* ChatRunManager;
        const chat = mockChat();

        const { runId } = yield* mgr.startGeneration({
          chat,
          message: "Hello",
        });

        const exit = yield* mgr.subscribe(runId, "user-2").pipe(Stream.runDrain, Effect.exit);
        expect(exit._tag).toBe("Failure");
        if (exit._tag === "Failure") {
          expect(
            exit.cause.reasons.some((reason) =>
              reason._tag === "Fail" && reason.error._tag === "ChatRunNotFoundError"
            ),
          ).toBe(true);
        }
      }).pipe(Effect.provide(makeTestLayer())),
    { timeout: 5000 },
  );

  it.live("failed generation fails stream with defect", () =>
    Effect.gen(function*() {
      const mgr = yield* ChatRunManager;
      const chat = mockChat();

      const { runId } = yield* mgr.startGeneration({
        chat,
        message: "Hello",
      });

      const exit = yield* mgr.subscribe(runId, chat.userId).pipe(Stream.runDrain, Effect.exit);
      expect(exit._tag).toBe("Failure");
      if (exit._tag === "Failure") {
        expect(
          exit.cause.reasons.some((reason) => reason._tag === "Die"),
        ).toBe(true);
      }
    }).pipe(Effect.provide(makeTestLayer(FailingAiModels))), { timeout: 5000 });

  it.live("failed generation releases the active chat lock when finalize fails once", () => {
    let activeRunId: Chat.RunId | null = null;
    let clearAttempts = 0;
    const repo = Layer.mock(ChatRepo)({
      create: () => Effect.succeed(mockChat()),
      findById: (chatId) => Effect.succeed(mockChat({ id: chatId, activeRunId })),
      listByUser: () => Effect.succeed({ items: [], hasMore: false }),
      delete: () => Effect.void,
      startRun: ({ runId }) =>
        Effect.sync(() => {
          if (activeRunId !== null) {
            return false;
          }
          activeRunId = runId;
          return true;
        }),
      finishRun: () => Effect.die("finishRun should not be called"),
      clearActiveRun: ({ runId }) =>
        Effect.sync(() => {
          clearAttempts++;
          if (clearAttempts === 1) {
            throw new Error("transient clear failure");
          }
          if (activeRunId === runId) {
            activeRunId = null;
          }
        }),
    });
    return Effect.gen(function*() {
      const mgr = yield* ChatRunManager;
      const chat = mockChat();

      const { runId } = yield* mgr.startGeneration({
        chat,
        message: "Hello",
      });

      yield* mgr.subscribe(runId, chat.userId).pipe(Stream.runDrain, Effect.exit);
      yield* Effect.sleep("200 millis");

      expect(activeRunId).toBeNull();
      expect(clearAttempts).toBeGreaterThan(1);

      const second = yield* mgr.startGeneration({
        chat,
        message: "Again",
      });
      expect(second.runId).toBeDefined();
    }).pipe(Effect.provide(makeTestLayer(FailingAiModels, repo)));
  }, { timeout: 5000 });

  it.live("interrupt fails active stream with interrupt-only cause", () => {
    const slowAi = Layer.mock(AiModels)({
      use: (_model) => (effect) =>
        withLanguageModel(effect, {
          streamText: () =>
            Stream.make({ type: "text-delta" as const, id: "t1", delta: "slow" }).pipe(
              Stream.tap(() => Effect.sleep("10 seconds")),
            ),
        }),
    });
    return Effect.gen(function*() {
      const mgr = yield* ChatRunManager;
      const chat = mockChat();

      const { runId } = yield* mgr.startGeneration({
        chat,
        message: "Hello",
      });
      const exitFiber = yield* mgr.subscribe(runId, chat.userId).pipe(
        Stream.runDrain,
        Effect.exit,
        Effect.forkChild,
      );

      yield* Effect.sleep("100 millis");
      yield* mgr.interrupt(chat.id);

      const exit = yield* Fiber.join(exitFiber);
      expect(exit._tag).toBe("Failure");
      if (exit._tag === "Failure") {
        expect(Cause.hasInterruptsOnly(exit.cause)).toBe(true);
      }
    }).pipe(Effect.provide(makeTestLayer(slowAi)));
  }, { timeout: 5000 });

  it.live("completed run replays events to a late subscriber", () =>
    Effect.gen(function*() {
      const mgr = yield* ChatRunManager;
      const chat = mockChat();

      const { runId } = yield* mgr.startGeneration({
        chat,
        message: "Hello",
      });
      yield* Effect.sleep("200 millis");

      const exit = yield* mgr.subscribe(runId, chat.userId).pipe(Stream.runCollect, Effect.exit);
      expect(exit._tag).toBe("Success");
      if (exit._tag === "Success") {
        expect(exit.value.some((event) => event._tag === "Chunk")).toBe(true);
      }
    }).pipe(Effect.provide(makeTestLayer())), { timeout: 5000 });

  it.live("interrupted run replays terminal interrupt to a late subscriber", () => {
    const slowAi = Layer.mock(AiModels)({
      use: (_model) => (effect) =>
        withLanguageModel(effect, {
          streamText: () =>
            Stream.make({ type: "text-delta" as const, id: "t1", delta: "slow" }).pipe(
              Stream.tap(() => Effect.sleep("10 seconds")),
            ),
        }),
    });
    return Effect.gen(function*() {
      const mgr = yield* ChatRunManager;
      const chat = mockChat();

      const { runId } = yield* mgr.startGeneration({
        chat,
        message: "Hello",
      });
      yield* Effect.sleep("100 millis");

      yield* mgr.interrupt(chat.id);
      yield* Effect.sleep("200 millis");

      const exit = yield* mgr.subscribe(runId, chat.userId).pipe(Stream.runDrain, Effect.exit);
      expect(exit._tag).toBe("Failure");
      if (exit._tag === "Failure") {
        expect(Cause.hasInterruptsOnly(exit.cause)).toBe(true);
      }
    }).pipe(Effect.provide(makeTestLayer(slowAi)));
  }, { timeout: 5000 });

  it.live("interrupted stream does not end before storage releases active run", () => {
    const slowAi = Layer.mock(AiModels)({
      use: (_model) => (effect) =>
        withLanguageModel(effect, {
          streamText: () =>
            Stream.make({ type: "text-delta" as const, id: "t1", delta: "slow" }).pipe(
              Stream.tap(() => Effect.never),
            ),
        }),
    });
    return Effect.gen(function*() {
      const clearStarted = yield* Deferred.make<void>();
      const clearGate = yield* Deferred.make<void>();
      let activeRunId: Chat.RunId | null = null;
      const repo = Layer.mock(ChatRepo)({
        create: () => Effect.succeed(mockChat()),
        findById: (chatId) => Effect.succeed(mockChat({ id: chatId, activeRunId })),
        listByUser: () => Effect.succeed({ items: [], hasMore: false }),
        delete: () => Effect.void,
        startRun: ({ runId }) =>
          Effect.sync(() => {
            if (activeRunId !== null) {
              return false;
            }
            activeRunId = runId;
            return true;
          }),
        finishRun: ({ runId }) =>
          Effect.sync(() => {
            if (activeRunId === runId) {
              activeRunId = null;
            }
          }),
        clearActiveRun: ({ runId }) =>
          Effect.gen(function*() {
            yield* Deferred.succeed(clearStarted, undefined);
            yield* Deferred.await(clearGate);
            if (activeRunId === runId) {
              activeRunId = null;
            }
          }),
      });

      yield* Effect.gen(function*() {
        const mgr = yield* ChatRunManager;
        const chat = mockChat();

        const { runId } = yield* mgr.startGeneration({
          chat,
          message: "Hello",
        });
        const exitFiber = yield* mgr.subscribe(runId, chat.userId).pipe(
          Stream.runDrain,
          Effect.exit,
          Effect.forkChild,
        );

        yield* Effect.sleep("100 millis");
        yield* mgr.interrupt(chat.id);

        yield* Deferred.await(clearStarted);
        const earlyExit = yield* Fiber.join(exitFiber).pipe(
          Effect.timeoutOption("50 millis"),
        );
        expect(earlyExit._tag).toBe("None");
        expect(activeRunId).toBe(runId);

        yield* Deferred.succeed(clearGate, undefined);
        const exit = yield* Fiber.join(exitFiber);
        expect(exit._tag).toBe("Failure");
        expect(activeRunId).toBeNull();
      }).pipe(
        Effect.provide(makeTestLayer(slowAi, repo)),
        Effect.ensuring(Deferred.succeed(clearGate, undefined)),
      );
    });
  }, { timeout: 5000 });

  it.live("completed generation releases the active chat lock", () =>
    Effect.gen(function*() {
      const mgr = yield* ChatRunManager;
      const chat = mockChat();

      yield* mgr.startGeneration({
        chat,
        message: "Hello",
      });
      yield* Effect.sleep("200 millis");

      const second = yield* mgr.startGeneration({
        chat,
        message: "Again",
      });

      expect(second.runId).toBeDefined();
    }).pipe(Effect.provide(makeTestLayer())), { timeout: 5000 });

  it.live("closing manager scope interrupts an active generation", () => {
    let finalized = false;
    const slowAi = Layer.mock(AiModels)({
      use: (_model) => (effect) =>
        withLanguageModel(effect, {
          streamText: () =>
            Stream.make({ type: "text-delta" as const, id: "t1", delta: "slow" }).pipe(
              Stream.tap(() => Effect.never),
              Stream.ensuring(
                Effect.sync(() => {
                  finalized = true;
                }),
              ),
            ),
        }),
    });
    return Effect.gen(function*() {
      const scope = yield* Scope.make();
      const mgr = yield* ChatRunManager.make.pipe(
        Effect.provide(slowAi),
        Effect.provide(makeMockChatRepo()),
        Effect.provide(ChatProcessor.layer),
        Effect.provide(WorkflowEngine.layerMemory),
        Scope.provide(scope),
      );
      const chat = mockChat();

      yield* mgr.startGeneration({
        chat,
        message: "Hello",
      });
      yield* Effect.sleep("100 millis");

      yield* Scope.close(scope, Exit.void);
      yield* Effect.sleep("100 millis");

      expect(finalized).toBe(true);
    });
  }, { timeout: 5000 });

  it.live("closing manager scope clears the active run in storage", () => {
    let activeRunId: Chat.RunId | null = null;
    const slowAi = Layer.mock(AiModels)({
      use: (_model) => (effect) =>
        withLanguageModel(effect, {
          streamText: () =>
            Stream.make({ type: "text-delta" as const, id: "t1", delta: "slow" }).pipe(
              Stream.tap(() => Effect.never),
            ),
        }),
    });
    const repo = Layer.mock(ChatRepo)({
      create: () => Effect.succeed(mockChat()),
      findById: (chatId) => Effect.succeed(mockChat({ id: chatId, activeRunId })),
      listByUser: () => Effect.succeed({ items: [], hasMore: false }),
      delete: () => Effect.void,
      startRun: ({ runId }) =>
        Effect.sync(() => {
          if (activeRunId !== null) {
            return false;
          }
          activeRunId = runId;
          return true;
        }),
      finishRun: ({ runId }) =>
        Effect.sync(() => {
          if (activeRunId === runId) {
            activeRunId = null;
          }
        }),
      clearActiveRun: ({ runId }) =>
        Effect.sync(() => {
          if (activeRunId === runId) {
            activeRunId = null;
          }
        }),
    });
    return Effect.gen(function*() {
      const scope = yield* Scope.make();
      const mgr = yield* ChatRunManager.make.pipe(
        Effect.provide(slowAi),
        Effect.provide(repo),
        Effect.provide(ChatProcessor.layer),
        Effect.provide(WorkflowEngine.layerMemory),
        Scope.provide(scope),
      );
      const chat = mockChat();

      yield* mgr.startGeneration({
        chat,
        message: "Hello",
      });
      yield* Effect.sleep("100 millis");

      yield* Scope.close(scope, Exit.void);
      yield* Effect.sleep("100 millis");

      expect(activeRunId).toBeNull();
    });
  }, { timeout: 5000 });

  it.live("closing manager scope immediately after start clears the active run in storage", () => {
    let activeRunId: Chat.RunId | null = null;
    const slowAi = Layer.mock(AiModels)({
      use: (_model) => (effect) =>
        withLanguageModel(effect, {
          streamText: () =>
            Stream.make({ type: "text-delta" as const, id: "t1", delta: "slow" }).pipe(
              Stream.tap(() => Effect.never),
            ),
        }),
    });
    const repo = Layer.mock(ChatRepo)({
      create: () => Effect.succeed(mockChat()),
      findById: (chatId) => Effect.succeed(mockChat({ id: chatId, activeRunId })),
      listByUser: () => Effect.succeed({ items: [], hasMore: false }),
      delete: () => Effect.void,
      startRun: ({ runId }) =>
        Effect.sync(() => {
          if (activeRunId !== null) {
            return false;
          }
          activeRunId = runId;
          return true;
        }),
      finishRun: ({ runId }) =>
        Effect.sync(() => {
          if (activeRunId === runId) {
            activeRunId = null;
          }
        }),
      clearActiveRun: ({ runId }) =>
        Effect.sync(() => {
          if (activeRunId === runId) {
            activeRunId = null;
          }
        }),
    });
    return Effect.gen(function*() {
      const scope = yield* Scope.make();
      const mgr = yield* ChatRunManager.make.pipe(
        Effect.provide(slowAi),
        Effect.provide(repo),
        Effect.provide(ChatProcessor.layer),
        Effect.provide(WorkflowEngine.layerMemory),
        Scope.provide(scope),
      );
      const chat = mockChat();

      yield* mgr.startGeneration({
        chat,
        message: "Hello",
      });
      yield* Scope.close(scope, Exit.void);
      yield* Effect.sleep("100 millis");

      expect(activeRunId).toBeNull();
    });
  }, { timeout: 5000 });
});
