import { test, expect } from "bun:test"
import * as Chunk from "effect/Chunk"
import * as Deferred from "effect/Deferred"
import * as Effect from "effect/Effect"
import * as Either from "effect/Either"
import * as Fiber from "effect/Fiber"
import * as Option from "effect/Option"
import * as Queue from "effect/Queue"
import * as Stream from "effect/Stream"
import * as TestClock from "effect/TestClock"
import { makeQueryHandle, type SdkQueryLike } from "../src/internal/queryHandle.js"
import { makeUserMessage } from "../src/internal/messages.js"
import { createInputQueue } from "../src/internal/streaming.js"
import type { SDKMessage } from "../src/Schema/Message.js"
import { runEffect } from "./effect-test.js"

const createSdkQuery = (messages: ReadonlyArray<SDKMessage>): SdkQueryLike => {
  async function* generator() {
    for (const message of messages) {
      yield message
    }
  }

  const iterator = generator()
  return Object.assign(iterator, {
    interrupt: async () => {},
    setPermissionMode: async () => {},
    setModel: async () => {},
    setMaxThinkingTokens: async () => {},
    rewindFiles: async () => ({ canRewind: false }),
    supportedCommands: async () => [],
    supportedModels: async () => [],
    mcpServerStatus: async () => [],
    setMcpServers: async () => ({ added: [], removed: [], errors: {} }),
    accountInfo: async () => ({})
  })
}

const createControlledSdkQuery = (): {
  readonly query: SdkQueryLike
  readonly returned: Promise<void>
  readonly start: () => void
} => {
  let resolveStart: (() => void) | undefined
  let resolveReturn: (() => void) | undefined
  let resolveNext: ((value: IteratorResult<SDKMessage>) => void) | undefined
  let emitted = false

  const start = new Promise<void>((resolve) => {
    resolveStart = resolve
  })
  const returned = new Promise<void>((resolve) => {
    resolveReturn = resolve
  })

  const iterator: AsyncIterator<SDKMessage> & AsyncIterable<SDKMessage> = {
    next: () => {
      if (!emitted) {
        emitted = true
        return start.then(() => ({
          done: false,
          value: makeUserMessage("ready")
        }))
      }
      return new Promise<IteratorResult<SDKMessage>>((resolve) => {
        resolveNext = resolve
      })
    },
    return: () => {
      resolveReturn?.()
      if (resolveNext) {
        resolveNext({ done: true, value: undefined as never })
        resolveNext = undefined
      }
      return Promise.resolve({ done: true, value: undefined as never })
    },
    [Symbol.asyncIterator]() {
      return this
    }
  }

  const query = Object.assign(iterator, {
    interrupt: async () => {},
    setPermissionMode: async () => {},
    setModel: async () => {},
    setMaxThinkingTokens: async () => {},
    rewindFiles: async () => ({ canRewind: false }),
    supportedCommands: async () => [],
    supportedModels: async () => [],
    mcpServerStatus: async () => [],
    setMcpServers: async () => ({ added: [], removed: [], errors: {} }),
    accountInfo: async () => ({})
  })

  return {
    query,
    returned,
    start: () => resolveStart?.()
  }
}

const createStagedSdkQuery = (messages: ReadonlyArray<SDKMessage>): {
  readonly query: SdkQueryLike
  readonly release: (index: number) => void
} => {
  const gates = messages.map(() => {
    let resolve: (() => void) | undefined
    const promise = new Promise<void>((resolvePromise) => {
      resolve = resolvePromise
    })
    return {
      promise,
      release: () => resolve?.()
    }
  })

  async function* generator() {
    for (let index = 0; index < messages.length; index++) {
      const gate = gates[index]!
      const message = messages[index]!
      await gate.promise
      yield message
    }
  }

  const iterator = generator()
  const query = Object.assign(iterator, {
    interrupt: async () => {},
    setPermissionMode: async () => {},
    setModel: async () => {},
    setMaxThinkingTokens: async () => {},
    rewindFiles: async () => ({ canRewind: false }),
    supportedCommands: async () => [],
    supportedModels: async () => [],
    mcpServerStatus: async () => [],
    setMcpServers: async () => ({ added: [], removed: [], errors: {} }),
    accountInfo: async () => ({})
  })

  return {
    query,
    release: (index: number) => gates[index]?.release()
  }
}

const awaitReturn = (returned: Promise<void>) =>
  Effect.promise(() => returned).pipe(
    Effect.timeoutFail({
      duration: "200 millis",
      onTimeout: () => new TimeoutError("timed out waiting for iterator return")
    })
  )

class TimeoutError {
  readonly _tag = "TimeoutError"
  readonly message: string

  constructor(message: string) {
    this.message = message
  }
}

test("QueryHandle.share multicasts within scope", async () => {
  const messages = [makeUserMessage("first"), makeUserMessage("second")]
  const handle = makeQueryHandle(createSdkQuery(messages))

  const program = Effect.scoped(
    Effect.gen(function*() {
      const shared = yield* handle.share()
      const [left, right] = yield* Effect.all(
        [Stream.runCollect(shared), Stream.runCollect(shared)],
        { concurrency: "unbounded" }
      )

      return [
        Chunk.toReadonlyArray(left),
        Chunk.toReadonlyArray(right)
      ]
    })
  )

  const [left, right] = await runEffect(program)
  expect(left).toEqual(messages)
  expect(right).toEqual(messages)
})

test("QueryHandle.broadcast fans out streams within scope", async () => {
  const messages = [makeUserMessage("alpha"), makeUserMessage("beta")]
  const handle = makeQueryHandle(createSdkQuery(messages))

  const program = Effect.scoped(
    Effect.gen(function*() {
      const [first, second] = yield* handle.broadcast(2)
      const [left, right] = yield* Effect.all(
        [Stream.runCollect(first), Stream.runCollect(second)],
        { concurrency: "unbounded" }
      )

      return [
        Chunk.toReadonlyArray(left),
        Chunk.toReadonlyArray(right)
      ]
    })
  )

  const [left, right] = await runEffect(program)
  expect(left).toEqual(messages)
  expect(right).toEqual(messages)
})

test("QueryHandle.share replays to late subscribers while upstream is active", async () => {
  const messages = [makeUserMessage("first"), makeUserMessage("second")]
  const { query, release } = createStagedSdkQuery(messages)
  const handle = makeQueryHandle(query)

  const program = Effect.scoped(
    Effect.gen(function*() {
      const shared = yield* handle.share({ capacity: 16, replay: 1 })
      const firstSeen = yield* Deferred.make<void>()
      const firstFiber = yield* Effect.forkScoped(
        shared.pipe(
          Stream.tap(() => Deferred.succeed(firstSeen, undefined).pipe(Effect.asVoid)),
          Stream.runCollect
        )
      )

      yield* Effect.sync(() => release(0))
      yield* Deferred.await(firstSeen)

      const secondFiber = yield* Effect.forkScoped(Stream.runCollect(shared))
      yield* Effect.yieldNow()
      yield* Effect.sync(() => release(1))

      const [firstChunk, secondChunk] = yield* Effect.all(
        [Fiber.join(firstFiber), Fiber.join(secondFiber)],
        { concurrency: "unbounded" }
      )

      return {
        first: Chunk.toReadonlyArray(firstChunk),
        second: Chunk.toReadonlyArray(secondChunk)
      }
    })
  )

  const { first, second } = await runEffect(program)
  expect(first).toEqual(messages)
  expect(second).toEqual(messages)
})

test("QueryHandle.broadcast buffers for late consumers within maximum lag", async () => {
  const messages = [makeUserMessage("alpha"), makeUserMessage("beta")]
  const handle = makeQueryHandle(createSdkQuery(messages))

  const program = Effect.scoped(
    Effect.gen(function*() {
      const [left, right] = yield* handle.broadcast(2, { capacity: "unbounded" })
      const first = yield* Stream.runCollect(left)
      const second = yield* Stream.runCollect(right)
      return {
        first: Chunk.toReadonlyArray(first),
        second: Chunk.toReadonlyArray(second)
      }
    })
  )

  const { first, second } = await runEffect(program)
  expect(first).toEqual(messages)
  expect(second).toEqual(messages)
})

test("QueryHandle.sendForked enqueues within scope", async () => {
  const message = makeUserMessage("forked")

  const program = Effect.scoped(
    Effect.gen(function*() {
      const inputQueue = yield* createInputQueue(1)
      const handle = makeQueryHandle(createSdkQuery([]), inputQueue, inputQueue.closeInput)

      yield* handle.sendForked(message)
      return yield* Queue.take(inputQueue.queue)
    })
  )

  const received = await runEffect(program)
  expect(received).toEqual(message)
})

test("QueryHandle.sendForked cancels when scope closes", async () => {
  const inputQueue = await runEffect(createInputQueue(1))
  const first = makeUserMessage("first")
  const blocked = makeUserMessage("blocked")

  await runEffect(Queue.offer(inputQueue.queue, first))
  await runEffect(
    Effect.scoped(
      Effect.gen(function*() {
        const handle = makeQueryHandle(createSdkQuery([]), inputQueue, inputQueue.closeInput)
        yield* handle.sendForked(blocked)
      })
    )
  )

  const received = await runEffect(Queue.take(inputQueue.queue))
  expect(received).toEqual(first)

  const pending = await runEffect(
    Effect.gen(function*() {
      yield* Effect.yieldNow()
      return yield* Queue.poll(inputQueue.queue)
    })
  )
  expect(Option.isNone(pending)).toBe(true)
})

test("QueryHandle.stream is single-use across runs", async () => {
  const messages = [makeUserMessage("once"), makeUserMessage("twice")]
  const handle = makeQueryHandle(createSdkQuery(messages))

  const program = Effect.gen(function*() {
    const first = yield* Stream.runCollect(handle.stream)
    const second = yield* Stream.runCollect(handle.stream)
    return [
      Chunk.toReadonlyArray(first),
      Chunk.toReadonlyArray(second)
    ]
  })

  const [first, second] = await runEffect(program)
  expect(first).toEqual(messages)
  expect(second).toEqual([])
})

test("QueryHandle.send fails after closeInput", async () => {
  const program = Effect.scoped(
    Effect.gen(function*() {
      const inputQueue = yield* createInputQueue(1)
      const handle = makeQueryHandle(createSdkQuery([]), inputQueue, inputQueue.closeInput)

      yield* handle.closeInput
      return yield* Effect.either(handle.send(makeUserMessage("late")))
    })
  )

  const result = await runEffect(program)
  expect(Either.isLeft(result)).toBe(true)
  if (Either.isLeft(result)) {
    expect(result.left._tag).toBe("TransportError")
  }
})

test("QueryHandle.sendAll fails after closeInput", async () => {
  const program = Effect.scoped(
    Effect.gen(function*() {
      const inputQueue = yield* createInputQueue(1)
      const handle = makeQueryHandle(createSdkQuery([]), inputQueue, inputQueue.closeInput)

      yield* handle.closeInput
      return yield* Effect.either(
        handle.sendAll([makeUserMessage("first"), makeUserMessage("second")])
      )
    })
  )

  const result = await runEffect(program)
  expect(Either.isLeft(result)).toBe(true)
  if (Either.isLeft(result)) {
    expect(result.left._tag).toBe("TransportError")
  }
})

test("QueryHandle.sendForked returns after closeInput", async () => {
  const program = Effect.scoped(
    Effect.gen(function*() {
      const inputQueue = yield* createInputQueue(1)
      const handle = makeQueryHandle(createSdkQuery([]), inputQueue, inputQueue.closeInput)

      yield* handle.closeInput
      return yield* Effect.either(handle.sendForked(makeUserMessage("late")))
    })
  )

  const result = await runEffect(program)
  expect(Either.isRight(result)).toBe(true)
})

test("QueryHandle.interrupt maps sdk errors to TransportError", async () => {
  const query = Object.assign(createSdkQuery([]), {
    interrupt: async () => {
      throw new Error("boom")
    }
  })
  const handle = makeQueryHandle(query)

  const result = await runEffect(Effect.either(handle.interrupt))
  expect(Either.isLeft(result)).toBe(true)
  if (Either.isLeft(result)) {
    expect(result.left._tag).toBe("TransportError")
  }
})

test("QueryHandle.send blocks when queue is full", async () => {
  const first = makeUserMessage("first")
  const second = makeUserMessage("second")
  const program = Effect.gen(function*() {
    const inputQueue = yield* createInputQueue(1)
    const handle = makeQueryHandle(createSdkQuery([]), inputQueue, inputQueue.closeInput)

    yield* Queue.offer(inputQueue.queue, first)
    const sendFiber = yield* Effect.fork(handle.send(second))
    const pending = yield* Fiber.poll(sendFiber)
    const blocked = Option.isNone(pending)

    yield* Queue.take(inputQueue.queue)
    yield* Fiber.join(sendFiber)
    const next = yield* Queue.take(inputQueue.queue)

    return { blocked, next }
  })

  const { blocked, next } = await runEffect(program)
  expect(blocked).toBe(true)
  expect(next).toEqual(second)
})

test("QueryHandle.sendForked leaves a pending offer when queue is full", async () => {
  const first = makeUserMessage("first")
  const second = makeUserMessage("second")
  const program = Effect.scoped(
    Effect.gen(function*() {
      const inputQueue = yield* createInputQueue(1)
      const handle = makeQueryHandle(createSdkQuery([]), inputQueue, inputQueue.closeInput)

      yield* Queue.offer(inputQueue.queue, first)
      yield* handle.sendForked(second)
      yield* Effect.yieldNow()

      const sizeWhileBlocked = yield* Queue.size(inputQueue.queue)
      const drained = yield* Queue.take(inputQueue.queue)
      const enqueued = yield* Queue.take(inputQueue.queue)

      return { sizeWhileBlocked, drained, enqueued }
    })
  )

  const { sizeWhileBlocked, drained, enqueued } = await runEffect(program)
  expect(sizeWhileBlocked).toBe(2)
  expect(drained).toEqual(first)
  expect(enqueued).toEqual(second)
})

test("QueryHandle.stream closes input when stream completes", async () => {
  const program = Effect.scoped(
    Effect.gen(function*() {
      const inputQueue = yield* createInputQueue(1)
      const closed = yield* Deferred.make<void>()
      const closeInput = inputQueue.closeInput.pipe(
        Effect.zipRight(Deferred.succeed(closed, undefined)),
        Effect.asVoid
      )
      const handle = makeQueryHandle(createSdkQuery([]), inputQueue, closeInput)

      yield* Stream.runDrain(handle.stream)
      return yield* Deferred.isDone(closed)
    })
  )

  const closed = await runEffect(program)
  expect(closed).toBe(true)
})

test("QueryHandle.share closes upstream on scope exit", async () => {
  const { query, returned, start } = createControlledSdkQuery()
  const handle = makeQueryHandle(query)

  await runEffect(
    Effect.scoped(
      Effect.gen(function*() {
        const shared = yield* handle.share()
        const headFiber = yield* Effect.forkScoped(Stream.runHead(shared))
        yield* Effect.sync(start)
        yield* Fiber.join(headFiber)
      })
    )
  )

  await runEffect(
    Effect.gen(function*() {
      const fiber = yield* Effect.fork(awaitReturn(returned))
      yield* TestClock.adjust("200 millis")
      yield* Fiber.join(fiber)
    })
  )
})

test("QueryHandle.broadcast closes upstream on scope exit", async () => {
  const { query, returned, start } = createControlledSdkQuery()
  const handle = makeQueryHandle(query)

  await runEffect(
    Effect.scoped(
      Effect.gen(function*() {
        const [left, right] = yield* handle.broadcast(2)
        const leftFiber = yield* Effect.forkScoped(Stream.runHead(left))
        const rightFiber = yield* Effect.forkScoped(Stream.runHead(right))
        yield* Effect.sync(start)
        yield* Effect.all([Fiber.join(leftFiber), Fiber.join(rightFiber)], {
          concurrency: "unbounded"
        })
      })
    )
  )

  await runEffect(
    Effect.gen(function*() {
      const fiber = yield* Effect.fork(awaitReturn(returned))
      yield* TestClock.adjust("200 millis")
      yield* Fiber.join(fiber)
    })
  )
})
