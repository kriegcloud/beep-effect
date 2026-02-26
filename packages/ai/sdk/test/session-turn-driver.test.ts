import { expect, test } from "bun:test"
import * as Effect from "effect/Effect"
import * as Either from "effect/Either"
import * as Fiber from "effect/Fiber"
import * as Stream from "effect/Stream"
import * as TestClock from "effect/TestClock"
import { TransportError } from "../src/Errors.js"
import { makeSessionTurnDriver } from "../src/internal/sessionTurnDriver.js"
import type { SDKMessage } from "../src/Schema/Message.js"
import { runEffect } from "./effect-test.js"

const createGate = () => {
  let open = false
  let resolve: (() => void) | undefined
  const promise = new Promise<void>((resolvePromise) => {
    resolve = () => {
      open = true
      resolvePromise()
    }
  })
  return {
    promise,
    open: () => resolve?.(),
    get isOpen() {
      return open
    }
  }
}

const makeStatusMessage = (uuid: string, sessionId: string): SDKMessage =>
  ({
    type: "system",
    subtype: "status",
    status: null,
    uuid,
    session_id: sessionId
  }) as SDKMessage

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
    session_id: sessionId
  }) as SDKMessage

test("SessionTurnDriver.turn ends at first result boundary", async () => {
  const status = makeStatusMessage("u-1", "session-turn")
  const result = makeResultMessage("u-2", "session-turn")
  const trailing = makeStatusMessage("u-3", "session-turn")

  const program = Effect.scoped(
    Effect.gen(function*() {
      const sendCalls: Array<string> = []
      const driver = yield* makeSessionTurnDriver({
        send: (message) =>
          Effect.sync(() => {
            sendCalls.push(typeof message === "string" ? message : "object")
          }),
        stream: Stream.fromIterable([status, result, trailing]),
        close: Effect.void
      })
      const messages = yield* Stream.runCollect(driver.turn("hello"))
      return { sendCalls, messages: Array.from(messages) }
    })
  )

  const resultValue = await runEffect(program)
  expect(resultValue.sendCalls).toEqual(["hello"])
  expect(resultValue.messages).toEqual([status, result])
})

test("SessionTurnDriver serializes concurrent turns in FIFO order", async () => {
  const firstTurnStarted = createGate()
  const releaseFirstTurn = createGate()
  const sendCalls: Array<string> = []
  const status1 = makeStatusMessage("u-s1", "session-turn")
  const result1 = makeResultMessage("u-r1", "session-turn")
  const status2 = makeStatusMessage("u-s2", "session-turn")
  const result2 = makeResultMessage("u-r2", "session-turn")
  let streamRuns = 0

  const program = Effect.scoped(
    Effect.gen(function*() {
      const driver = yield* makeSessionTurnDriver({
        send: (message) =>
          Effect.sync(() => {
            sendCalls.push(typeof message === "string" ? message : "object")
          }),
        stream: Stream.unwrapScoped(
          Effect.sync(() => {
            streamRuns += 1
            if (streamRuns === 1) {
              return Stream.fromAsyncIterable(
                (async function*() {
                  firstTurnStarted.open()
                  yield status1
                  await releaseFirstTurn.promise
                  yield result1
                })(),
                (cause) => cause as never
              )
            }
            return Stream.fromIterable([status2, result2])
          })
        ),
        close: Effect.void
      })

      const firstFiber = yield* Effect.fork(Stream.runCollect(driver.turn("first")))
      yield* Effect.promise(() => firstTurnStarted.promise)
      const secondFiber = yield* Effect.fork(Stream.runCollect(driver.turn("second")))
      yield* Effect.yieldNow()

      const beforeRelease = [...sendCalls]
      releaseFirstTurn.open()

      const first = yield* Fiber.join(firstFiber)
      const second = yield* Fiber.join(secondFiber)
      return {
        beforeRelease,
        after: [...sendCalls],
        first: Array.from(first),
        second: Array.from(second)
      }
    })
  )

  const resultValue = await runEffect(program)
  expect(resultValue.beforeRelease).toEqual(["first"])
  expect(resultValue.after).toEqual(["first", "second"])
  expect(resultValue.first).toEqual([status1, result1])
  expect(resultValue.second).toEqual([status2, result2])
})

test("SessionTurnDriver rejects raw operations while turn work is active", async () => {
  const firstTurnStarted = createGate()
  const releaseFirstTurn = createGate()
  const status = makeStatusMessage("u-s1", "session-turn")
  const result = makeResultMessage("u-r1", "session-turn")

  const program = Effect.scoped(
    Effect.gen(function*() {
      const driver = yield* makeSessionTurnDriver({
        send: (_message) => Effect.void,
        stream: Stream.fromAsyncIterable(
          (async function*() {
            firstTurnStarted.open()
            yield status
            await releaseFirstTurn.promise
            yield result
          })(),
          (cause) => cause as never
        ),
        close: Effect.void
      })

      const turnFiber = yield* Effect.fork(Stream.runDrain(driver.turn("first")))
      yield* Effect.promise(() => firstTurnStarted.promise)
      const rawResult = yield* Effect.either(driver.sendRaw("raw"))
      releaseFirstTurn.open()
      yield* Fiber.join(turnFiber)
      return rawResult
    })
  )

  const rawResult = await runEffect(program)
  expect(Either.isLeft(rawResult)).toBe(true)
  if (Either.isLeft(rawResult)) {
    expect(rawResult.left._tag).toBe("TransportError")
  }
})

test("SessionTurnDriver rejects turns while raw stream is active", async () => {
  const rawStarted = createGate()
  const status = makeStatusMessage("u-s1", "session-turn")

  const program = Effect.scoped(
    Effect.gen(function*() {
      const driver = yield* makeSessionTurnDriver({
        send: (_message) => Effect.void,
        stream: Stream.fromEffect(
          Effect.sync(() => {
            rawStarted.open()
            return status
          })
        ).pipe(Stream.concat(Stream.fromEffect(Effect.never))),
        close: Effect.void
      })

      const rawFiber = yield* Effect.fork(Stream.runDrain(driver.streamRaw))
      yield* Effect.promise(() => rawStarted.promise)
      const turnResult = yield* Effect.either(Stream.runCollect(driver.turn("hello")))
      yield* Fiber.interrupt(rawFiber)
      return turnResult
    })
  )

  const turnResult = await runEffect(program)
  expect(Either.isLeft(turnResult)).toBe(true)
  if (Either.isLeft(turnResult)) {
    expect(turnResult.left._tag).toBe("TransportError")
  }
})

test("SessionTurnDriver continues draining to result when turn consumer cancels early", async () => {
  const firstTurnStatusSent = createGate()
  const releaseFirstTurn = createGate()
  const sendCalls: Array<string> = []
  const status1 = makeStatusMessage("u-s1", "session-turn")
  const result1 = makeResultMessage("u-r1", "session-turn")
  const status2 = makeStatusMessage("u-s2", "session-turn")
  const result2 = makeResultMessage("u-r2", "session-turn")
  let streamRuns = 0

  const program = Effect.scoped(
    Effect.gen(function*() {
      const driver = yield* makeSessionTurnDriver({
        send: (message) =>
          Effect.sync(() => {
            sendCalls.push(typeof message === "string" ? message : "object")
          }),
        stream: Stream.unwrapScoped(
          Effect.sync(() => {
            streamRuns += 1
            if (streamRuns === 1) {
              return Stream.fromAsyncIterable(
                (async function*() {
                  firstTurnStatusSent.open()
                  yield status1
                  await releaseFirstTurn.promise
                  yield result1
                })(),
                (cause) => cause as never
              )
            }
            return Stream.fromIterable([status2, result2])
          })
        ),
        close: Effect.void
      })

      const firstFiber = yield* Effect.fork(
        Stream.runCollect(driver.turn("first").pipe(Stream.take(1)))
      )
      yield* Effect.promise(() => firstTurnStatusSent.promise)
      const secondFiber = yield* Effect.fork(Stream.runCollect(driver.turn("second")))
      yield* Effect.yieldNow()
      const beforeRelease = [...sendCalls]

      releaseFirstTurn.open()
      const first = yield* Fiber.join(firstFiber)
      const second = yield* Fiber.join(secondFiber)

      return {
        beforeRelease,
        after: [...sendCalls],
        first: Array.from(first),
        second: Array.from(second)
      }
    })
  )

  const resultValue = await runEffect(program)
  expect(resultValue.beforeRelease).toEqual(["first"])
  expect(resultValue.after).toEqual(["first", "second"])
  expect(resultValue.first).toEqual([status1])
  expect(resultValue.second).toEqual([status2, result2])
})

test("SessionTurnDriver fails a turn when send timeout elapses", async () => {
  const program = Effect.scoped(
    Effect.gen(function*() {
      const driver = yield* makeSessionTurnDriver({
        send: (_message) => Effect.never,
        stream: Stream.empty,
        close: Effect.void,
        timeouts: {
          turnSendTimeout: "20 millis"
        }
      })

      const turnFiber = yield* Effect.fork(
        Effect.either(Stream.runCollect(driver.turn("hello")))
      )
      yield* TestClock.adjust("50 millis")
      return yield* Fiber.join(turnFiber)
    })
  )

  const turnResult = await runEffect(program)
  expect(Either.isLeft(turnResult)).toBe(true)
  if (Either.isLeft(turnResult)) {
    expect(turnResult.left._tag).toBe("TransportError")
    expect(turnResult.left.message).toContain("send timed out")
  }
})

test("SessionTurnDriver fails a turn on result timeout and triggers session close", async () => {
  let closeCalls = 0
  const status = makeStatusMessage("u-s1", "session-timeout")

  const program = Effect.scoped(
    Effect.gen(function*() {
      const driver = yield* makeSessionTurnDriver({
        send: (_message) => Effect.void,
        stream: Stream.fromEffect(Effect.succeed(status)).pipe(
          Stream.concat(Stream.fromEffect(Effect.never))
        ),
        close: Effect.sync(() => {
          closeCalls += 1
        }),
        timeouts: {
          turnResultTimeout: "20 millis"
        }
      })

      const turnFiber = yield* Effect.fork(
        Effect.either(Stream.runCollect(driver.turn("hello")))
      )
      yield* TestClock.adjust("50 millis")
      const result = yield* Fiber.join(turnFiber)
      yield* Effect.yieldNow()
      return { result, closeCalls }
    })
  )

  const output = await runEffect(program)
  expect(Either.isLeft(output.result)).toBe(true)
  if (Either.isLeft(output.result)) {
    expect(output.result.left._tag).toBe("TransportError")
    expect(output.result.left.message).toContain("timed out waiting for result")
  }
  expect(output.closeCalls).toBe(1)
})

test("SessionTurnDriver timeout recovery is not triggered by matching TransportError text", async () => {
  let closeCalls = 0

  const program = Effect.scoped(
    Effect.gen(function*() {
      const driver = yield* makeSessionTurnDriver({
        send: (_message) => Effect.void,
        stream: Stream.fail(
          TransportError.make({
            message: "Session turn timed out waiting for result"
          })
        ),
        close: Effect.sync(() => {
          closeCalls += 1
        }),
        timeouts: {
          turnResultTimeout: "20 millis"
        }
      })

      const result = yield* Effect.either(Stream.runCollect(driver.turn("hello")))
      return { result, closeCalls }
    })
  )

  const output = await runEffect(program)
  expect(Either.isLeft(output.result)).toBe(true)
  expect(output.closeCalls).toBe(0)
})

test("SessionTurnDriver result timeout shuts down driver and fails queued turns", async () => {
  let closeCalls = 0
  const status = makeStatusMessage("u-s-timeout", "session-timeout")

  const program = Effect.scoped(
    Effect.gen(function*() {
      const driver = yield* makeSessionTurnDriver({
        send: (_message) => Effect.void,
        stream: Stream.fromEffect(Effect.succeed(status)).pipe(
          Stream.concat(Stream.fromEffect(Effect.never))
        ),
        close: Effect.sync(() => {
          closeCalls += 1
        }),
        timeouts: {
          turnResultTimeout: "20 millis"
        }
      })

      const firstTurn = yield* Effect.fork(
        Effect.either(Stream.runCollect(driver.turn("first")))
      )
      yield* Effect.yieldNow()
      const secondTurn = yield* Effect.fork(
        Effect.either(Stream.runCollect(driver.turn("second")))
      )
      yield* TestClock.adjust("50 millis")

      return {
        first: yield* Fiber.join(firstTurn),
        second: yield* Fiber.join(secondTurn),
        closeCalls
      }
    })
  )

  const output = await runEffect(program)
  expect(Either.isLeft(output.first)).toBe(true)
  if (Either.isLeft(output.first)) {
    expect(output.first.left._tag).toBe("TransportError")
  }
  expect(Either.isLeft(output.second)).toBe(true)
  if (Either.isLeft(output.second)) {
    expect(output.second.left._tag).toBe("SessionClosedError")
  }
  expect(output.closeCalls).toBe(1)
})

test("SessionTurnDriver shutdown fails pending requests and rejects new work", async () => {
  const firstTurnStarted = createGate()
  const releaseFirstTurn = createGate()
  const sendCalls: Array<string> = []
  const status1 = makeStatusMessage("u-s1", "session-shutdown")
  const result1 = makeResultMessage("u-r1", "session-shutdown")
  const status2 = makeStatusMessage("u-s2", "session-shutdown")
  const result2 = makeResultMessage("u-r2", "session-shutdown")
  let streamRuns = 0

  const program = Effect.scoped(
    Effect.gen(function*() {
      const driver = yield* makeSessionTurnDriver({
        send: (message) =>
          Effect.sync(() => {
            sendCalls.push(typeof message === "string" ? message : "object")
          }),
        stream: Stream.unwrapScoped(
          Effect.sync(() => {
            streamRuns += 1
            if (streamRuns === 1) {
              return Stream.fromAsyncIterable(
                (async function*() {
                  firstTurnStarted.open()
                  yield status1
                  await releaseFirstTurn.promise
                  yield result1
                })(),
                (cause) => cause as never
              )
            }
            return Stream.fromIterable([status2, result2])
          })
        ),
        close: Effect.void
      })

      const firstTurn = yield* Effect.fork(Effect.either(Stream.runCollect(driver.turn("first"))))
      yield* Effect.promise(() => firstTurnStarted.promise)
      const secondTurn = yield* Effect.fork(Effect.either(Stream.runCollect(driver.turn("second"))))
      yield* Effect.yieldNow()

      yield* driver.shutdown
      const pendingResult = yield* Fiber.join(secondTurn)
      const postShutdownTurn = yield* Effect.either(Stream.runCollect(driver.turn("third")))
      const postShutdownRaw = yield* Effect.either(driver.sendRaw("raw"))

      releaseFirstTurn.open()
      const firstResult = yield* Fiber.join(firstTurn)
      return {
        sendCalls: [...sendCalls],
        firstResult,
        pendingResult,
        postShutdownTurn,
        postShutdownRaw
      }
    })
  )

  const output = await runEffect(program)
  expect(output.sendCalls).toEqual(["first"])
  expect(Either.isRight(output.firstResult)).toBe(true)
  if (Either.isRight(output.firstResult)) {
    expect(Array.from(output.firstResult.right)).toEqual([status1, result1])
  }
  expect(Either.isLeft(output.pendingResult)).toBe(true)
  if (Either.isLeft(output.pendingResult)) {
    expect(output.pendingResult.left._tag).toBe("SessionClosedError")
  }
  expect(Either.isLeft(output.postShutdownTurn)).toBe(true)
  if (Either.isLeft(output.postShutdownTurn)) {
    expect(output.postShutdownTurn.left._tag).toBe("SessionClosedError")
  }
  expect(Either.isLeft(output.postShutdownRaw)).toBe(true)
  if (Either.isLeft(output.postShutdownRaw)) {
    expect(output.postShutdownRaw.left._tag).toBe("SessionClosedError")
  }
})
