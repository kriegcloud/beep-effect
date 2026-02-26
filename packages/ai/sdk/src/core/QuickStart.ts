import * as Effect from "effect/Effect"
import * as Stream from "effect/Stream"
import { AgentRuntime } from "./AgentRuntime.js"
import { runtimeLayer, type RuntimeEntryOptions } from "./EntryPoints.js"
import * as QueryResult from "./QueryResult.js"
import type { SDKMessage, SDKResultSuccess } from "./Schema/Message.js"
import type { Options } from "./Schema/Options.js"

const extractTextFromContent = (content: unknown): ReadonlyArray<string> => {
  if (!Array.isArray(content)) return []
  const chunks: Array<string> = []
  for (const item of content) {
    if (typeof item !== "object" || item === null) continue
    const record = item as { type?: unknown; text?: unknown }
    if (record.type === "text" && typeof record.text === "string" && record.text.length > 0) {
      chunks.push(record.text)
    }
  }
  return chunks
}

const extractTextFromStreamEvent = (event: unknown): ReadonlyArray<string> => {
  if (typeof event !== "object" || event === null) return []
  const record = event as {
    text?: unknown
    delta?: { text?: unknown; content?: unknown }
    content_block?: { text?: unknown }
    message?: { content?: unknown }
    content?: unknown
  }
  if (typeof record.text === "string" && record.text.length > 0) {
    return [record.text]
  }
  if (typeof record.delta?.text === "string" && record.delta.text.length > 0) {
    return [record.delta.text]
  }
  if (typeof record.delta?.content === "string" && record.delta.content.length > 0) {
    return [record.delta.content]
  }
  if (typeof record.content_block?.text === "string" && record.content_block.text.length > 0) {
    return [record.content_block.text]
  }
  const fromMessage = extractTextFromContent(record.message?.content)
  if (fromMessage.length > 0) return fromMessage
  const fromContent = extractTextFromContent(record.content)
  return fromContent
}

export const extractTextChunks = (message: SDKMessage): ReadonlyArray<string> => {
  if (message.type === "assistant") {
    const content = (message as { message?: { content?: unknown } }).message?.content
    return extractTextFromContent(content)
  }
  if (message.type === "stream_event") {
    return extractTextFromStreamEvent(
      (message as { event?: unknown }).event
    )
  }
  return []
}

export const extractResultText = (message: SDKMessage): string | undefined =>
  message.type === "result" && message.subtype === "success"
    ? message.result
    : undefined

export const toTextStream = <E>(stream: Stream.Stream<SDKMessage, E>) =>
  stream.pipe(
    Stream.mapAccum(false, (hasText, message) => {
      const chunks = extractTextChunks(message)
      if (chunks.length > 0) {
        return [true, chunks] as const
      }
      if (!hasText) {
        const resultText = extractResultText(message)
        if (resultText && resultText.length > 0) {
          return [true, [resultText]] as const
        }
      }
      return [hasText, []] as const
    }),
    Stream.flatMap((chunks) => Stream.fromIterable(chunks))
  )

/**
 * Zero-config entry point that runs a single prompt and resolves with the final result.
 */
export const run = (
  prompt: string,
  options?: Options,
  entry?: RuntimeEntryOptions
): Promise<SDKResultSuccess> =>
  Effect.runPromise(
    Effect.scoped(
      Effect.gen(function*() {
        const runtime = yield* AgentRuntime
        return yield* QueryResult.collectResultSuccess(
          runtime.stream(prompt, options)
        )
      }).pipe(Effect.provide(runtimeLayer(entry)))
    )
  )

/**
 * Zero-config entry point that streams assistant text chunks as an AsyncIterable.
 */
export const streamText = (
  prompt: string,
  options?: Options,
  entry?: RuntimeEntryOptions
): AsyncIterable<string> =>
  (async function*() {
    const iterable = await Effect.runPromise(
      Effect.scoped(
        Effect.gen(function*() {
          const runtime = yield* AgentRuntime
          const stream = toTextStream(runtime.stream(prompt, options))
          return yield* Stream.toAsyncIterableEffect(stream)
        }).pipe(Effect.provide(runtimeLayer(entry)))
      )
    )
    for await (const chunk of iterable) {
      yield chunk
    }
  })()
