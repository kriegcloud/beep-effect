import type { SDKMessage, SDKResultMessage } from "@beep/ai-sdk/Schema/Message";
import { ChatEvent } from "@beep/ai-sdk/Schema/Storage";
import type { SessionHandle } from "@beep/ai-sdk/Session";
import { SessionManager } from "@beep/ai-sdk/SessionManager";
import { SessionService } from "@beep/ai-sdk/SessionService";
import { ChatHistoryStore } from "@beep/ai-sdk/Storage/ChatHistoryStore";
import { expect, test } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Fiber from "effect/Fiber";
import * as Layer from "effect/Layer";
import * as Result from "effect/Result";
import * as Stream from "effect/Stream";
import { runEffect } from "./effect-test.js";

const createGate = () => {
  let open = false;
  let resolve: (() => void) | undefined;
  const promise = new Promise<void>((resolvePromise) => {
    resolve = () => {
      open = true;
      resolvePromise();
    };
  });
  return {
    promise,
    open: () => resolve?.(),
    get isOpen() {
      return open;
    },
  };
};

const makeStatusMessage = (uuid: string, sessionId: string): SDKMessage =>
  ({
    type: "system",
    subtype: "status",
    status: null,
    uuid,
    session_id: sessionId,
  }) as SDKMessage;

const makeResultMessage = (uuid: string, sessionId: string): SDKMessage =>
  ({
    type: "result",
    subtype: "success",
    result: "ok",
    duration_ms: 1,
    duration_api_ms: 1,
    is_error: false,
    num_turns: 1,
    total_cost_usd: 0,
    usage: {},
    modelUsage: {},
    permission_denials: [],
    uuid,
    session_id: sessionId,
  }) as SDKMessage;

test("SessionService.layer wires SessionManager and exposes handle methods", async () => {
  let capturedOptions: { model?: string } | undefined;
  const handle: SessionHandle = {
    sessionId: Effect.succeed("session-1"),
    send: (_message) => Effect.void,
    stream: Stream.empty,
    close: Effect.void,
  };

  const manager = SessionManager.of({
    create: (options) => {
      capturedOptions = options;
      return Effect.succeed(handle);
    },
    resume: (_sessionId, _options) => Effect.succeed(handle),
    prompt: (_message, _options) => Effect.succeed({} as SDKResultMessage),
    withSession: (_options, use) =>
      use({
        handle,
        sessionId: handle.sessionId,
        send: handle.send,
        turn: (_message) => Stream.empty,
        stream: handle.stream,
        close: handle.close,
      }),
  });

  const layer = SessionService.layer({ model: "claude-test" }).pipe(
    Layer.provide(Layer.succeed(SessionManager, manager))
  );

  const program = Effect.scoped(
    Effect.gen(function* () {
      const session = yield* SessionService;
      return yield* session.sessionId;
    }).pipe(Effect.provide(layer))
  );

  const sessionId = await runEffect(program);
  expect(sessionId).toBe("session-1");
  expect(capturedOptions?.model).toBe("claude-test");
});

test("SessionService.turn sends once and ends at the first result", async () => {
  const sendCalls: Array<string> = [];
  const status = makeStatusMessage("u-1", "session-turn");
  const result = makeResultMessage("u-2", "session-turn");
  const trailing = makeStatusMessage("u-3", "session-turn");

  const handle: SessionHandle = {
    sessionId: Effect.succeed("session-turn"),
    send: (message) =>
      Effect.sync(() => {
        sendCalls.push(typeof message === "string" ? message : "object");
      }),
    stream: Stream.fromIterable([status, result, trailing]),
    close: Effect.void,
  };

  const manager = SessionManager.of({
    create: (_options) => Effect.succeed(handle),
    resume: (_sessionId, _options) => Effect.succeed(handle),
    prompt: (_message, _options) => Effect.succeed({} as SDKResultMessage),
    withSession: (_options, use) =>
      use({
        handle,
        sessionId: handle.sessionId,
        send: handle.send,
        turn: (_message) => Stream.empty,
        stream: handle.stream,
        close: handle.close,
      }),
  });

  const layer = SessionService.layer({ model: "claude-test" }).pipe(
    Layer.provide(Layer.succeed(SessionManager, manager))
  );

  const program = Effect.scoped(
    Effect.gen(function* () {
      const session = yield* SessionService;
      const messages = yield* Stream.runCollect(session.turn("hello"));
      return Array.from(messages);
    }).pipe(Effect.provide(layer))
  );

  const messages = await runEffect(program);
  expect(sendCalls).toEqual(["hello"]);
  expect(messages).toEqual([status, result]);
});

test("SessionService.turn serializes concurrent turns", async () => {
  const firstTurnStarted = createGate();
  const releaseFirstTurn = createGate();
  const sendCalls: Array<string> = [];
  const status1 = makeStatusMessage("u-s1", "session-turn");
  const result1 = makeResultMessage("u-r1", "session-turn");
  const status2 = makeStatusMessage("u-s2", "session-turn");
  const result2 = makeResultMessage("u-r2", "session-turn");
  let streamRuns = 0;

  const handle: SessionHandle = {
    sessionId: Effect.succeed("session-turn"),
    send: (message) =>
      Effect.sync(() => {
        sendCalls.push(typeof message === "string" ? message : "object");
      }),
    stream: Stream.unwrap(
      Effect.sync(() => {
        streamRuns += 1;
        if (streamRuns === 1) {
          return Stream.fromAsyncIterable(
            (async function* () {
              firstTurnStarted.open();
              yield status1;
              await releaseFirstTurn.promise;
              yield result1;
            })(),
            (cause) => cause as never
          );
        }
        return Stream.fromIterable([status2, result2]);
      })
    ),
    close: Effect.void,
  };

  const manager = SessionManager.of({
    create: (_options) => Effect.succeed(handle),
    resume: (_sessionId, _options) => Effect.succeed(handle),
    prompt: (_message, _options) => Effect.succeed({} as SDKResultMessage),
    withSession: (_options, use) =>
      use({
        handle,
        sessionId: handle.sessionId,
        send: handle.send,
        turn: (_message) => Stream.empty,
        stream: handle.stream,
        close: handle.close,
      }),
  });

  const layer = SessionService.layer({ model: "claude-test" }).pipe(
    Layer.provide(Layer.succeed(SessionManager, manager))
  );

  const program = Effect.scoped(
    Effect.gen(function* () {
      const session = yield* SessionService;
      const firstFiber = yield* Effect.forkChild(Stream.runCollect(session.turn("first")));
      yield* Effect.promise(() => firstTurnStarted.promise);
      const secondFiber = yield* Effect.forkChild(Stream.runCollect(session.turn("second")));
      yield* Effect.yieldNow;
      const beforeRelease = [...sendCalls];
      releaseFirstTurn.open();
      const first = yield* Fiber.join(firstFiber);
      const second = yield* Fiber.join(secondFiber);
      return {
        beforeRelease,
        after: [...sendCalls],
        first: Array.from(first),
        second: Array.from(second),
      };
    }).pipe(Effect.provide(layer))
  );

  const result = await runEffect(program);
  expect(result.beforeRelease).toEqual(["first"]);
  expect(result.after).toEqual(["first", "second"]);
  expect(result.first).toEqual([status1, result1]);
  expect(result.second).toEqual([status2, result2]);
});

test("SessionService.send fails while turn work is active", async () => {
  const turnStarted = createGate();
  const releaseTurn = createGate();
  const status = makeStatusMessage("u-s1", "session-turn");
  const result = makeResultMessage("u-r1", "session-turn");

  const handle: SessionHandle = {
    sessionId: Effect.succeed("session-turn"),
    send: (_message) => Effect.void,
    stream: Stream.fromAsyncIterable(
      (async function* () {
        turnStarted.open();
        yield status;
        await releaseTurn.promise;
        yield result;
      })(),
      (cause) => cause as never
    ),
    close: Effect.void,
  };

  const manager = SessionManager.of({
    create: (_options) => Effect.succeed(handle),
    resume: (_sessionId, _options) => Effect.succeed(handle),
    prompt: (_message, _options) => Effect.succeed({} as SDKResultMessage),
    withSession: (_options, use) =>
      use({
        handle,
        sessionId: handle.sessionId,
        send: handle.send,
        turn: (_message) => Stream.empty,
        stream: handle.stream,
        close: handle.close,
      }),
  });

  const layer = SessionService.layer({ model: "claude-test" }).pipe(
    Layer.provide(Layer.succeed(SessionManager, manager))
  );

  const program = Effect.scoped(
    Effect.gen(function* () {
      const session = yield* SessionService;
      const turnFiber = yield* Effect.forkChild(Stream.runDrain(session.turn("first")));
      yield* Effect.promise(() => turnStarted.promise);
      const rawResult = yield* Effect.result(session.send("raw"));
      releaseTurn.open();
      yield* Fiber.join(turnFiber);
      return rawResult;
    }).pipe(Effect.provide(layer))
  );

  const rawResult = await runEffect(program);
  expect(Result.isFailure(rawResult)).toBe(true);
  if (Result.isFailure(rawResult)) {
    expect(rawResult.failure._tag).toBe("TransportError");
  }
});

test("SessionService.turn fails while raw stream is active", async () => {
  const rawStarted = createGate();
  const status = makeStatusMessage("u-s1", "session-turn");

  const handle: SessionHandle = {
    sessionId: Effect.succeed("session-turn"),
    send: (_message) => Effect.void,
    stream: Stream.fromEffect(
      Effect.sync(() => {
        rawStarted.open();
        return status;
      })
    ).pipe(Stream.concat(Stream.fromEffect(Effect.never))),
    close: Effect.void,
  };

  const manager = SessionManager.of({
    create: (_options) => Effect.succeed(handle),
    resume: (_sessionId, _options) => Effect.succeed(handle),
    prompt: (_message, _options) => Effect.succeed({} as SDKResultMessage),
    withSession: (_options, use) =>
      use({
        handle,
        sessionId: handle.sessionId,
        send: handle.send,
        turn: (_message) => Stream.empty,
        stream: handle.stream,
        close: handle.close,
      }),
  });

  const layer = SessionService.layer({ model: "claude-test" }).pipe(
    Layer.provide(Layer.succeed(SessionManager, manager))
  );

  const program = Effect.scoped(
    Effect.gen(function* () {
      const session = yield* SessionService;
      const rawFiber = yield* Effect.forkChild(Stream.runDrain(session.stream));
      yield* Effect.promise(() => rawStarted.promise);
      const turnResult = yield* Effect.result(Stream.runCollect(session.turn("hello")));
      yield* Fiber.interrupt(rawFiber);
      return turnResult;
    }).pipe(Effect.provide(layer))
  );

  const turnResult = await runEffect(program);
  expect(Result.isFailure(turnResult)).toBe(true);
  if (Result.isFailure(turnResult)) {
    expect(turnResult.failure._tag).toBe("TransportError");
  }
});

test("SessionService.layerWithHistory records turn output after consumer cancellation", async () => {
  const turnStarted = createGate();
  const releaseTurn = createGate();
  const resultReady = createGate();
  const status = makeStatusMessage("u-s1", "session-history");
  const result = makeResultMessage("u-r1", "session-history");
  const recordedTypes: Array<string> = [];

  const handle: SessionHandle = {
    sessionId: Effect.succeed("session-history"),
    send: (_message) => Effect.void,
    stream: Stream.fromAsyncIterable(
      (async function* () {
        turnStarted.open();
        yield status;
        await releaseTurn.promise;
        resultReady.open();
        yield result;
      })(),
      (cause) => cause as never
    ),
    close: Effect.void,
  };

  const manager = SessionManager.of({
    create: (_options) => Effect.succeed(handle),
    resume: (_sessionId, _options) => Effect.succeed(handle),
    prompt: (_message, _options) => Effect.succeed({} as SDKResultMessage),
    withSession: (_options, use) =>
      use({
        handle,
        sessionId: handle.sessionId,
        send: handle.send,
        turn: (_message) => Stream.empty,
        stream: handle.stream,
        close: handle.close,
      }),
  });

  const historyLayer = Layer.succeed(
    ChatHistoryStore,
    ChatHistoryStore.of({
      appendMessage: (_sessionId, message) =>
        Effect.sync(() => {
          recordedTypes.push(message.type);
          return ChatEvent.make({
            sessionId: "session-history",
            sequence: recordedTypes.length,
            timestamp: 0,
            source: "sdk",
            message,
          });
        }),
      appendMessages: (_sessionId, messages) =>
        Effect.sync(() =>
          Array.from(messages).map((message) => {
            recordedTypes.push(message.type);
            return ChatEvent.make({
              sessionId: "session-history",
              sequence: recordedTypes.length,
              timestamp: 0,
              source: "sdk",
              message,
            });
          })
        ),
      list: (_sessionId, _options) => Effect.succeed([]),
      stream: (_sessionId, _options) => Stream.empty,
      purge: (_sessionId) => Effect.void,
    })
  );
  const sessionLayer = SessionService.layerWithHistory(
    { model: "claude-test" },
    {
      recordOutput: true,
    }
  ).pipe(Layer.provide(Layer.succeed(SessionManager, manager)), Layer.provide(historyLayer));

  const program = Effect.scoped(
    Effect.gen(function* () {
      const session = yield* SessionService;
      const firstMessageFiber = yield* Effect.forkChild(Stream.runCollect(session.turn("hello").pipe(Stream.take(1))));
      yield* Effect.promise(() => turnStarted.promise);
      releaseTurn.open();
      yield* Effect.promise(() => resultReady.promise);
      const firstMessage = yield* Fiber.join(firstMessageFiber);
      return Array.from(firstMessage);
    }).pipe(Effect.provide(sessionLayer))
  );

  const output = await runEffect(program);
  expect(output).toEqual([status]);
  expect(recordedTypes).toEqual(["system", "result"]);
});
