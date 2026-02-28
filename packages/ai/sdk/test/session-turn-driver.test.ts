import { TransportError } from "@beep/ai-sdk/Errors";
import { makeSessionTurnDriver } from "@beep/ai-sdk/internal/sessionTurnDriver";
import type { SDKMessage } from "@beep/ai-sdk/Schema/Message";
import { expect, test } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Fiber from "effect/Fiber";
import * as Result from "effect/Result";
import * as Stream from "effect/Stream";
import { TestClock } from "effect/testing";
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

test("SessionTurnDriver.turn ends at first result boundary", async () => {
  const status = makeStatusMessage("u-1", "session-turn");
  const result = makeResultMessage("u-2", "session-turn");
  const trailing = makeStatusMessage("u-3", "session-turn");

  const program = Effect.scoped(
    Effect.gen(function* () {
      const sendCalls: Array<string> = [];
      const driver = yield* makeSessionTurnDriver({
        send: (message) =>
          Effect.sync(() => {
            sendCalls.push(typeof message === "string" ? message : "object");
          }),
        stream: Stream.fromIterable([status, result, trailing]),
        close: Effect.void,
      });
      const messages = yield* Stream.runCollect(driver.turn("hello"));
      return { sendCalls, messages: Array.from(messages) };
    })
  );

  const resultValue = await runEffect(program);
  expect(resultValue.sendCalls).toEqual(["hello"]);
  expect(resultValue.messages).toEqual([status, result]);
});

test("SessionTurnDriver serializes concurrent turns in FIFO order", async () => {
  const firstTurnStarted = createGate();
  const releaseFirstTurn = createGate();
  const sendCalls: Array<string> = [];
  const status1 = makeStatusMessage("u-s1", "session-turn");
  const result1 = makeResultMessage("u-r1", "session-turn");
  const status2 = makeStatusMessage("u-s2", "session-turn");
  const result2 = makeResultMessage("u-r2", "session-turn");
  let streamRuns = 0;

  const program = Effect.scoped(
    Effect.gen(function* () {
      const driver = yield* makeSessionTurnDriver({
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
      });

      const firstFiber = yield* Effect.forkChild(Stream.runCollect(driver.turn("first")));
      yield* Effect.promise(() => firstTurnStarted.promise);
      const secondFiber = yield* Effect.forkChild(Stream.runCollect(driver.turn("second")));
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
    })
  );

  const resultValue = await runEffect(program);
  expect(resultValue.beforeRelease).toEqual(["first"]);
  expect(resultValue.after).toEqual(["first", "second"]);
  expect(resultValue.first).toEqual([status1, result1]);
  expect(resultValue.second).toEqual([status2, result2]);
});

test("SessionTurnDriver rejects raw operations while turn work is active", async () => {
  const firstTurnStarted = createGate();
  const releaseFirstTurn = createGate();
  const status = makeStatusMessage("u-s1", "session-turn");
  const result = makeResultMessage("u-r1", "session-turn");

  const program = Effect.scoped(
    Effect.gen(function* () {
      const driver = yield* makeSessionTurnDriver({
        send: (_message) => Effect.void,
        stream: Stream.fromAsyncIterable(
          (async function* () {
            firstTurnStarted.open();
            yield status;
            await releaseFirstTurn.promise;
            yield result;
          })(),
          (cause) => cause as never
        ),
        close: Effect.void,
      });

      const turnFiber = yield* Effect.forkChild(Stream.runDrain(driver.turn("first")));
      yield* Effect.promise(() => firstTurnStarted.promise);
      const rawResult = yield* Effect.result(driver.sendRaw("raw"));
      releaseFirstTurn.open();
      yield* Fiber.join(turnFiber);
      return rawResult;
    })
  );

  const rawResult = await runEffect(program);
  expect(Result.isFailure(rawResult)).toBe(true);
  if (Result.isFailure(rawResult)) {
    expect(rawResult.failure._tag).toBe("TransportError");
  }
});

test("SessionTurnDriver rejects turns while raw stream is active", async () => {
  const rawStarted = createGate();
  const status = makeStatusMessage("u-s1", "session-turn");

  const program = Effect.scoped(
    Effect.gen(function* () {
      const driver = yield* makeSessionTurnDriver({
        send: (_message) => Effect.void,
        stream: Stream.fromEffect(
          Effect.sync(() => {
            rawStarted.open();
            return status;
          })
        ).pipe(Stream.concat(Stream.fromEffect(Effect.never))),
        close: Effect.void,
      });

      const rawFiber = yield* Effect.forkChild(Stream.runDrain(driver.streamRaw));
      yield* Effect.promise(() => rawStarted.promise);
      const turnResult = yield* Effect.result(Stream.runCollect(driver.turn("hello")));
      yield* Fiber.interrupt(rawFiber);
      return turnResult;
    })
  );

  const turnResult = await runEffect(program);
  expect(Result.isFailure(turnResult)).toBe(true);
  if (Result.isFailure(turnResult)) {
    expect(turnResult.failure._tag).toBe("TransportError");
  }
});

test("SessionTurnDriver continues draining to result when turn consumer cancels early", async () => {
  const firstTurnStatusSent = createGate();
  const releaseFirstTurn = createGate();
  const sendCalls: Array<string> = [];
  const status1 = makeStatusMessage("u-s1", "session-turn");
  const result1 = makeResultMessage("u-r1", "session-turn");
  const status2 = makeStatusMessage("u-s2", "session-turn");
  const result2 = makeResultMessage("u-r2", "session-turn");
  let streamRuns = 0;

  const program = Effect.scoped(
    Effect.gen(function* () {
      const driver = yield* makeSessionTurnDriver({
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
                  firstTurnStatusSent.open();
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
      });

      const firstFiber = yield* Effect.forkChild(Stream.runCollect(driver.turn("first").pipe(Stream.take(1))));
      yield* Effect.promise(() => firstTurnStatusSent.promise);
      const secondFiber = yield* Effect.forkChild(Stream.runCollect(driver.turn("second")));
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
    })
  );

  const resultValue = await runEffect(program);
  expect(resultValue.beforeRelease).toEqual(["first"]);
  expect(resultValue.after).toEqual(["first", "second"]);
  expect(resultValue.first).toEqual([status1]);
  expect(resultValue.second).toEqual([status2, result2]);
});

test("SessionTurnDriver fails a turn when send timeout elapses", async () => {
  const program = Effect.scoped(
    Effect.gen(function* () {
      const driver = yield* makeSessionTurnDriver({
        send: (_message) => Effect.never,
        stream: Stream.empty,
        close: Effect.void,
        timeouts: {
          turnSendTimeout: "20 millis",
        },
      });

      const turnFiber = yield* Effect.forkChild(Effect.result(Stream.runCollect(driver.turn("hello"))));
      yield* TestClock.adjust("50 millis");
      return yield* Fiber.join(turnFiber);
    })
  );

  const turnResult = await runEffect(program);
  expect(Result.isFailure(turnResult)).toBe(true);
  if (Result.isFailure(turnResult)) {
    expect(turnResult.failure._tag).toBe("TransportError");
    expect(turnResult.failure.message).toContain("send timed out");
  }
});

test("SessionTurnDriver fails a turn on result timeout and triggers session close", async () => {
  let closeCalls = 0;
  const status = makeStatusMessage("u-s1", "session-timeout");

  const program = Effect.scoped(
    Effect.gen(function* () {
      const driver = yield* makeSessionTurnDriver({
        send: (_message) => Effect.void,
        stream: Stream.fromEffect(Effect.succeed(status)).pipe(Stream.concat(Stream.fromEffect(Effect.never))),
        close: Effect.sync(() => {
          closeCalls += 1;
        }),
        timeouts: {
          turnResultTimeout: "20 millis",
        },
      });

      const turnFiber = yield* Effect.forkChild(Effect.result(Stream.runCollect(driver.turn("hello"))));
      yield* TestClock.adjust("50 millis");
      const result = yield* Fiber.join(turnFiber);
      yield* Effect.yieldNow;
      return { result, closeCalls };
    })
  );

  const output = await runEffect(program);
  expect(Result.isFailure(output.result)).toBe(true);
  if (Result.isFailure(output.result)) {
    expect(output.result.failure._tag).toBe("TransportError");
    expect(output.result.failure.message).toContain("timed out waiting for result");
  }
  expect(output.closeCalls).toBe(1);
});

test("SessionTurnDriver timeout recovery is not triggered by matching TransportError text", async () => {
  let closeCalls = 0;

  const program = Effect.scoped(
    Effect.gen(function* () {
      const driver = yield* makeSessionTurnDriver({
        send: (_message) => Effect.void,
        stream: Stream.fail(TransportError.make("Session turn timed out waiting for result")),
        close: Effect.sync(() => {
          closeCalls += 1;
        }),
        timeouts: {
          turnResultTimeout: "20 millis",
        },
      });

      const result = yield* Effect.result(Stream.runCollect(driver.turn("hello")));
      return { result, closeCalls };
    })
  );

  const output = await runEffect(program);
  expect(Result.isFailure(output.result)).toBe(true);
  expect(output.closeCalls).toBe(0);
});

test("SessionTurnDriver result timeout shuts down driver and fails queued turns", async () => {
  let closeCalls = 0;
  const status = makeStatusMessage("u-s-timeout", "session-timeout");

  const program = Effect.scoped(
    Effect.gen(function* () {
      const driver = yield* makeSessionTurnDriver({
        send: (_message) => Effect.void,
        stream: Stream.fromEffect(Effect.succeed(status)).pipe(Stream.concat(Stream.fromEffect(Effect.never))),
        close: Effect.sync(() => {
          closeCalls += 1;
        }),
        timeouts: {
          turnResultTimeout: "20 millis",
        },
      });

      const firstTurn = yield* Effect.forkChild(Effect.result(Stream.runCollect(driver.turn("first"))));
      yield* Effect.yieldNow;
      const secondTurn = yield* Effect.forkChild(Effect.result(Stream.runCollect(driver.turn("second"))));
      yield* TestClock.adjust("50 millis");

      return {
        first: yield* Fiber.join(firstTurn),
        second: yield* Fiber.join(secondTurn),
        closeCalls,
      };
    })
  );

  const output = await runEffect(program);
  expect(Result.isFailure(output.first)).toBe(true);
  if (Result.isFailure(output.first)) {
    expect(output.first.failure._tag).toBe("TransportError");
  }
  expect(Result.isFailure(output.second)).toBe(true);
  if (Result.isFailure(output.second)) {
    expect(output.second.failure._tag).toBe("SessionClosedError");
  }
  expect(output.closeCalls).toBe(1);
});

test("SessionTurnDriver shutdown fails pending requests and rejects new work", async () => {
  const firstTurnStarted = createGate();
  const releaseFirstTurn = createGate();
  const sendCalls: Array<string> = [];
  const status1 = makeStatusMessage("u-s1", "session-shutdown");
  const result1 = makeResultMessage("u-r1", "session-shutdown");
  const status2 = makeStatusMessage("u-s2", "session-shutdown");
  const result2 = makeResultMessage("u-r2", "session-shutdown");
  let streamRuns = 0;

  const program = Effect.scoped(
    Effect.gen(function* () {
      const driver = yield* makeSessionTurnDriver({
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
      });

      const firstTurn = yield* Effect.forkChild(Effect.result(Stream.runCollect(driver.turn("first"))));
      yield* Effect.promise(() => firstTurnStarted.promise);
      const secondTurn = yield* Effect.forkChild(Effect.result(Stream.runCollect(driver.turn("second"))));
      yield* Effect.yieldNow;

      yield* driver.shutdown;
      const pendingResult = yield* Fiber.join(secondTurn);
      const postShutdownTurn = yield* Effect.result(Stream.runCollect(driver.turn("third")));
      const postShutdownRaw = yield* Effect.result(driver.sendRaw("raw"));

      releaseFirstTurn.open();
      const firstResult = yield* Fiber.join(firstTurn);
      return {
        sendCalls: [...sendCalls],
        firstResult,
        pendingResult,
        postShutdownTurn,
        postShutdownRaw,
      };
    })
  );

  const output = await runEffect(program);
  expect(output.sendCalls).toEqual(["first"]);
  expect(Result.isSuccess(output.firstResult)).toBe(true);
  if (Result.isSuccess(output.firstResult)) {
    expect(Array.from(output.firstResult.success)).toEqual([status1, result1]);
  }
  expect(Result.isFailure(output.pendingResult)).toBe(true);
  if (Result.isFailure(output.pendingResult)) {
    expect(output.pendingResult.failure._tag).toBe("SessionClosedError");
  }
  expect(Result.isFailure(output.postShutdownTurn)).toBe(true);
  if (Result.isFailure(output.postShutdownTurn)) {
    expect(output.postShutdownTurn.failure._tag).toBe("SessionClosedError");
  }
  expect(Result.isFailure(output.postShutdownRaw)).toBe(true);
  if (Result.isFailure(output.postShutdownRaw)) {
    expect(output.postShutdownRaw.failure._tag).toBe("SessionClosedError");
  }
});
