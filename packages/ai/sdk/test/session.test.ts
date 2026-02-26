import { test, expect } from "bun:test"
import * as Effect from "effect/Effect"
import * as Either from "effect/Either"
import * as Fiber from "effect/Fiber"
import * as Option from "effect/Option"
import * as Stream from "effect/Stream"
import * as TestClock from "effect/TestClock"
import { fromSdkSession } from "../src/Session.js"
import type { SDKMessage, SDKSession, SDKUserMessage } from "@anthropic-ai/claude-agent-sdk"
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

const makeInitMessage = (sessionId: string): SDKMessage => ({
  type: "system",
  subtype: "init",
  agents: [],
  apiKeySource: "user",
  betas: [],
  claude_code_version: "0.0.0",
  cwd: "/tmp",
  tools: [],
  mcp_servers: [],
  model: "claude-3-5-sonnet-20240620",
  permissionMode: "default",
  slash_commands: [],
  output_style: "markdown",
  skills: [],
  plugins: [],
  uuid: "00000000-0000-0000-0000-000000000000",
  session_id: sessionId
})

const createSdkSession = (options: {
  readonly initialSessionId?: string
  readonly messages?: ReadonlyArray<SDKMessage>
}): SDKSession => {
  let closed = false
  let sessionIdValue = options.initialSessionId

  async function* generator() {
    for (const message of options.messages ?? []) {
      if (message.type === "system" && message.subtype === "init") {
        sessionIdValue = message.session_id
      }
      yield message
    }
  }

  return {
    get sessionId() {
      if (!sessionIdValue) {
        throw new Error("Session not initialized")
      }
      return sessionIdValue
    },
    send: async (_message: string | SDKUserMessage) => {
      if (closed) {
        throw new Error("Session closed")
      }
    },
    stream: () => generator(),
    close: () => {
      closed = true
    },
    [Symbol.asyncDispose]: async () => {
      closed = true
    }
  }
}

test("Session.sessionId resolves after init message", async () => {
  const sessionId = "session-1"
  const sdkSession = createSdkSession({
    messages: [makeInitMessage(sessionId)]
  })
  const handle = await runEffect(fromSdkSession(sdkSession))

  const program = Effect.gen(function*() {
    const drainFiber = yield* Effect.fork(Stream.runDrain(handle.stream))
    const resolved = yield* handle.sessionId
    yield* Fiber.join(drainFiber)
    return resolved
  })

  const resolved = await runEffect(program)
  expect(resolved).toBe(sessionId)
})

test("Session.sessionId resolves immediately for resumed session", async () => {
  const sdkSession = createSdkSession({ initialSessionId: "resume-1" })
  const handle = await runEffect(fromSdkSession(sdkSession))
  const resolved = await runEffect(handle.sessionId)
  expect(resolved).toBe("resume-1")
})

test("Session.close fails sessionId and send after close", async () => {
  const sdkSession = createSdkSession({})
  const handle = await runEffect(fromSdkSession(sdkSession))

  await runEffect(handle.close)

  const sessionIdResult = await runEffect(Effect.either(handle.sessionId))
  expect(Either.isLeft(sessionIdResult)).toBe(true)
  if (Either.isLeft(sessionIdResult)) {
    expect(sessionIdResult.left._tag).toBe("SessionClosedError")
  }

  const sendResult = await runEffect(Effect.either(handle.send("hi")))
  expect(Either.isLeft(sendResult)).toBe(true)
  if (Either.isLeft(sendResult)) {
    expect(sendResult.left._tag).toBe("SessionClosedError")
  }
})

test("Session.send serializes concurrent sends", async () => {
  const firstStarted = createGate()
  const secondStarted = createGate()
  const releaseFirst = createGate()

  const sdkSession: SDKSession = {
    get sessionId() {
      return "session-1"
    },
    send: async (message: string | SDKUserMessage) => {
      if (message === "first") {
        firstStarted.open()
        await releaseFirst.promise
      } else {
        secondStarted.open()
      }
    },
    stream: async function*() {},
    close: () => {},
    [Symbol.asyncDispose]: async () => {}
  }

  const program = Effect.gen(function*() {
    const handle = yield* fromSdkSession(sdkSession)
    const firstFiber = yield* Effect.fork(handle.send("first"))
    const secondFiber = yield* Effect.fork(handle.send("second"))

    yield* Effect.promise(() => firstStarted.promise)
    yield* Effect.yieldNow()
    const blocked = !secondStarted.isOpen

    releaseFirst.open()
    yield* Effect.promise(() => secondStarted.promise)
    yield* Effect.all([Fiber.join(firstFiber), Fiber.join(secondFiber)], {
      concurrency: "unbounded"
    })

    return blocked
  })

  const blocked = await runEffect(program)
  expect(blocked).toBe(true)
})

test("Session.stream starts a new SDK stream for each run", async () => {
  let streamCalls = 0

  const sdkSession: SDKSession = {
    get sessionId() {
      return "session-1"
    },
    send: async () => {},
    stream: () => {
      streamCalls += 1
      async function* generator() {
        yield makeInitMessage(`session-${streamCalls}`)
      }
      return generator()
    },
    close: () => {},
    [Symbol.asyncDispose]: async () => {}
  }

  const program = Effect.gen(function*() {
    const handle = yield* fromSdkSession(sdkSession)
    yield* Stream.runDrain(handle.stream)
    yield* Stream.runDrain(handle.stream)
  })

  await runEffect(program)
  expect(streamCalls).toBe(2)
})

test("Session.close waits for in-flight send to finish", async () => {
  const sendStarted = createGate()
  const releaseSend = createGate()

  const sdkSession: SDKSession = {
    get sessionId() {
      return "session-1"
    },
    send: async () => {
      sendStarted.open()
      await releaseSend.promise
    },
    stream: async function*() {},
    close: () => {},
    [Symbol.asyncDispose]: async () => {}
  }

  const program = Effect.gen(function*() {
    const handle = yield* fromSdkSession(sdkSession)
    const sendFiber = yield* Effect.fork(handle.send("hi"))
    yield* Effect.promise(() => sendStarted.promise)

    const closeFiber = yield* Effect.fork(handle.close)
    yield* Effect.yieldNow()
    const closePending = yield* Fiber.poll(closeFiber)

    releaseSend.open()
    yield* Fiber.join(sendFiber)
    yield* Fiber.join(closeFiber)

    return Option.isNone(closePending)
  })

  const closeBlocked = await runEffect(program)
  expect(closeBlocked).toBe(true)
})

test("Session.close waits for active stream to finish", async () => {
  const streamStarted = createGate()
  const releaseStream = createGate()

  const sdkSession: SDKSession = {
    get sessionId() {
      return "session-1"
    },
    send: async () => {},
    stream: () => {
      async function* generator() {
        streamStarted.open()
        await releaseStream.promise
      }
      return generator()
    },
    close: () => {},
    [Symbol.asyncDispose]: async () => {}
  }

  const program = Effect.gen(function*() {
    const handle = yield* fromSdkSession(sdkSession)
    const streamFiber = yield* Effect.fork(Stream.runDrain(handle.stream))
    yield* Effect.promise(() => streamStarted.promise)

    const closeFiber = yield* Effect.fork(handle.close)
    yield* Effect.yieldNow()
    const closePending = yield* Fiber.poll(closeFiber)

    releaseStream.open()
    yield* Fiber.join(streamFiber)
    yield* Fiber.join(closeFiber)

    return Option.isNone(closePending)
  })

  const closeBlocked = await runEffect(program)
  expect(closeBlocked).toBe(true)
})

test("Session.close respects closeDrainTimeout override", async () => {
  const streamStarted = createGate()
  const releaseStream = createGate()
  let closeCalls = 0

  const sdkSession: SDKSession = {
    get sessionId() {
      return "session-1"
    },
    send: async () => {},
    stream: () => {
      async function* generator() {
        streamStarted.open()
        await releaseStream.promise
      }
      return generator()
    },
    close: () => {
      closeCalls += 1
    },
    [Symbol.asyncDispose]: async () => {}
  }

  const program = Effect.gen(function*() {
    const handle = yield* fromSdkSession(sdkSession, {
      closeDrainTimeout: "20 millis"
    })
    const streamFiber = yield* Effect.fork(Stream.runDrain(handle.stream))
    yield* Effect.promise(() => streamStarted.promise)

    const closeFiber = yield* Effect.fork(handle.close)
    yield* TestClock.adjust("60 millis")
    yield* Effect.yieldNow()

    const closeStatus = yield* Fiber.poll(closeFiber)
    releaseStream.open()
    yield* Fiber.join(streamFiber)
    yield* Fiber.join(closeFiber)
    return closeStatus
  })

  const closeStatus = await runEffect(program)
  expect(Option.isSome(closeStatus)).toBe(true)
  expect(closeCalls).toBe(1)
})

test("Session.fromSdkSession fails with TransportError on invalid closeDrainTimeout", async () => {
  const sdkSession: SDKSession = {
    get sessionId() {
      return "session-1"
    },
    send: async () => {},
    stream: async function*() {},
    close: () => {},
    [Symbol.asyncDispose]: async () => {}
  }

  const result = await runEffect(
    Effect.either(
      fromSdkSession(sdkSession, {
        closeDrainTimeout: "not-a-duration" as unknown as import("effect/Duration").DurationInput
      })
    )
  )

  expect(Either.isLeft(result)).toBe(true)
  if (Either.isLeft(result)) {
    expect(result.left._tag).toBe("TransportError")
    expect(result.left.message).toBe("Invalid session close drain timeout")
  }
})

test("Session.close propagates close failures to concurrent callers", async () => {
  const streamStarted = createGate()
  const releaseStream = createGate()

  const sdkSession: SDKSession = {
    get sessionId() {
      return "session-1"
    },
    send: async () => {},
    stream: () => {
      async function* generator() {
        streamStarted.open()
        await releaseStream.promise
      }
      return generator()
    },
    close: () => {
      throw new Error("close failed")
    },
    [Symbol.asyncDispose]: async () => {}
  }

  const program = Effect.gen(function*() {
    const handle = yield* fromSdkSession(sdkSession)
    const streamFiber = yield* Effect.fork(Stream.runDrain(handle.stream))
    yield* Effect.promise(() => streamStarted.promise)

    const closeFiberA = yield* Effect.fork(Effect.either(handle.close))
    yield* Effect.yieldNow()
    const closeFiberB = yield* Effect.fork(Effect.either(handle.close))

    releaseStream.open()
    yield* Effect.either(Fiber.join(streamFiber))

    const closeA = yield* Fiber.join(closeFiberA)
    const closeB = yield* Fiber.join(closeFiberB)
    return { closeA, closeB }
  })

  const result = await runEffect(program)
  expect(Either.isLeft(result.closeA)).toBe(true)
  expect(Either.isLeft(result.closeB)).toBe(true)
  if (Either.isLeft(result.closeA)) {
    expect(result.closeA.left._tag).toBe("TransportError")
  }
  if (Either.isLeft(result.closeB)) {
    expect(result.closeB.left._tag).toBe("TransportError")
  }
})

test("Session.send fails after close begins", async () => {
  const closeStarted = createGate()
  const sdkSession: SDKSession = {
    get sessionId() {
      return "session-1"
    },
    send: async () => {},
    stream: async function*() {},
    close: () => {
      closeStarted.open()
    },
    [Symbol.asyncDispose]: async () => {}
  }

  const program = Effect.gen(function*() {
    const handle = yield* fromSdkSession(sdkSession)
    const closeFiber = yield* Effect.fork(handle.close)
    yield* Effect.promise(() => closeStarted.promise)
    const sendResult = yield* Effect.either(handle.send("late"))
    yield* Fiber.join(closeFiber)
    return sendResult
  })

  const sendResult = await runEffect(program)
  expect(Either.isLeft(sendResult)).toBe(true)
  if (Either.isLeft(sendResult)) {
    expect(sendResult.left._tag).toBe("SessionClosedError")
  }
})

test("Session.stream fails after close begins", async () => {
  const closeStarted = createGate()
  const sdkSession: SDKSession = {
    get sessionId() {
      return "session-1"
    },
    send: async () => {},
    stream: async function*() {},
    close: () => {
      closeStarted.open()
    },
    [Symbol.asyncDispose]: async () => {}
  }

  const program = Effect.gen(function*() {
    const handle = yield* fromSdkSession(sdkSession)
    const closeFiber = yield* Effect.fork(handle.close)
    yield* Effect.promise(() => closeStarted.promise)
    const streamResult = yield* Effect.either(Stream.runDrain(handle.stream))
    yield* Fiber.join(closeFiber)
    return streamResult
  })

  const streamResult = await runEffect(program)
  expect(Either.isLeft(streamResult)).toBe(true)
  if (Either.isLeft(streamResult)) {
    expect(streamResult.left._tag).toBe("SessionClosedError")
  }
})
