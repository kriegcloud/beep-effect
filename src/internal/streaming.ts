import * as Effect from "effect/Effect"
import * as Queue from "effect/Queue"
import * as Stream from "effect/Stream"
import { TransportError } from "../Errors.js"
import type { AgentSdkError } from "../Errors.js"
import type { SDKUserMessage } from "../Schema/Message.js"

export type InputQueue = {
  readonly queue: Queue.Queue<SDKUserMessage>
  readonly input: AsyncIterable<SDKUserMessage>
  readonly send: (message: SDKUserMessage) => Effect.Effect<void, AgentSdkError>
  readonly sendAll: (messages: Iterable<SDKUserMessage>) => Effect.Effect<void, AgentSdkError>
  readonly closeInput: Effect.Effect<void, AgentSdkError>
}

const queueError = (message: string, cause: unknown) =>
  TransportError.make({
    message,
    cause
  })

export const createInputQueue = (capacity = 16) =>
  Effect.gen(function*() {
    const queue = yield* Queue.bounded<SDKUserMessage>(capacity)
    const input = yield* Stream.fromQueue(queue).pipe(Stream.toAsyncIterableEffect)

    const send = (message: SDKUserMessage) =>
      Queue.offer(queue, message).pipe(
        Effect.asVoid,
        Effect.catchAllCause((cause) => Effect.fail(queueError("Input queue is closed", cause)))
      )

    const sendAll = (messages: Iterable<SDKUserMessage>) =>
      Queue.offerAll(queue, messages).pipe(
        Effect.asVoid,
        Effect.catchAllCause((cause) => Effect.fail(queueError("Input queue is closed", cause)))
      )

    const closeInput = Queue.shutdown(queue).pipe(
      Effect.catchAllCause((cause) =>
        Effect.fail(queueError("Failed to close input queue", cause))
      )
    )

    return { queue, input, send, sendAll, closeInput } as const
  })

export const pumpInput = (
  queue: Queue.Queue<SDKUserMessage>,
  prompt: AsyncIterable<SDKUserMessage>
) =>
  Stream.fromAsyncIterable(
    prompt,
    (cause) => queueError("Input stream failed", cause)
  ).pipe(
    Stream.runForEach((message) => Queue.offer(queue, message)),
    Effect.tapError(() => Queue.shutdown(queue).pipe(Effect.ignore)),
    Effect.asVoid
  )
