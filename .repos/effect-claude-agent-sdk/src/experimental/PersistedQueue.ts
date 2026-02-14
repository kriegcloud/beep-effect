import * as PersistedQueue from "@effect/experimental/PersistedQueue"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Stream from "effect/Stream"
import { AgentSdk } from "../AgentSdk.js"
import type { AgentSdkError } from "../Errors.js"
import { TransportError } from "../Errors.js"
import type { QueryHandle } from "../Query.js"
import type { Options } from "../Schema/Options.js"
import { SDKUserMessage } from "../Schema/Message.js"

export * from "@effect/experimental/PersistedQueue"

/**
 * In-memory persisted queue layer for development and tests.
 */
export const layerMemory = PersistedQueue.layer.pipe(
  Layer.provide(PersistedQueue.layerStoreMemory)
)

/**
 * Create a persisted queue for SDK user messages.
 *
 * @example
 * ```ts
 * const program = Effect.gen(function*() {
 *   const queue = yield* makeUserMessageQueue()
 *   return queue
 * }).pipe(Effect.provide(layerMemory))
 * ```
 */
export const makeUserMessageQueue = (options?: { readonly name?: string }) =>
  PersistedQueue.make({
    name: options?.name ?? "claude-sdk-user-messages",
    schema: SDKUserMessage
  })

/**
 * Adapter that exposes a persisted queue as query input.
 */
export type PersistedInputAdapter = {
  readonly input: AsyncIterable<SDKUserMessage>
  readonly send: (message: SDKUserMessage) => Effect.Effect<void, AgentSdkError>
  readonly sendAll: (messages: Iterable<SDKUserMessage>) => Effect.Effect<void, AgentSdkError>
  readonly closeInput: Effect.Effect<void, AgentSdkError>
}

const toTransportError = (message: string, cause: unknown) =>
  TransportError.make({
    message,
    cause
  })

/**
 * Build an input adapter from a persisted queue.
 */
export const makeInputAdapter = (
  queue: PersistedQueue.PersistedQueue<SDKUserMessage>,
  options?: { readonly maxAttempts?: number }
) =>
  Effect.gen(function*() {
    const stream = Stream.repeatEffect(
      queue.take((message) => Effect.succeed(message), {
        maxAttempts: options?.maxAttempts
      })
    ).pipe(
      Stream.mapError((cause) => toTransportError("Persisted queue input failed", cause))
    )
    const input = yield* stream.pipe(Stream.toAsyncIterableEffect)

    const send = (message: SDKUserMessage) =>
      queue.offer(message).pipe(
        Effect.asVoid,
        Effect.mapError((cause) =>
          toTransportError("Failed to enqueue persisted input message", cause)
        )
      )

    const sendAll = (messages: Iterable<SDKUserMessage>) =>
      Effect.forEach(messages, send, { discard: true })

    return {
      input,
      send,
      sendAll,
      closeInput: Effect.void
    } satisfies PersistedInputAdapter
  })

/**
 * Override a QueryHandle's input methods with a persisted queue adapter.
 */
export const withPersistedInputQueue = (
  handle: QueryHandle,
  adapter: PersistedInputAdapter
): QueryHandle => ({
  ...handle,
  send: adapter.send,
  sendAll: adapter.sendAll,
  sendForked: (message) => Effect.forkScoped(adapter.send(message)).pipe(Effect.asVoid),
  closeInput: adapter.closeInput.pipe(Effect.zipRight(handle.closeInput))
})

/**
 * Create a query wired to a persisted queue for streaming input.
 *
 * @example
 * ```ts
 * const program = Effect.scoped(
 *   Effect.gen(function*() {
 *     const queue = yield* makeUserMessageQueue()
 *     const handle = yield* queryWithPersistedInput(queue)
 *     yield* handle.send({
 *       type: "user",
 *       session_id: "",
 *       message: { role: "user", content: [{ type: "text", text: "Hi" }] },
 *       parent_tool_use_id: null
 *     })
 *     return yield* Stream.runCollect(handle.stream)
 *   }).pipe(
 *     Effect.provide(layerMemory),
 *     Effect.provide(AgentSdk.layerDefault)
 *   )
 * )
 * ```
 */
export const queryWithPersistedInput = Effect.fn("PersistedQueue.queryWithPersistedInput")(function*(
  queue: PersistedQueue.PersistedQueue<SDKUserMessage>,
  options?: Options
) {
  const adapter = yield* makeInputAdapter(queue)
  const agentSdk = yield* AgentSdk
  const handle = yield* agentSdk.query(adapter.input, options)
  return withPersistedInputQueue(handle, adapter)
})
