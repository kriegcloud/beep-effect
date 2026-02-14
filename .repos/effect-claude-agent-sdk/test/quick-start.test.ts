import { expect, test } from "bun:test"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Stream from "effect/Stream"
import { AgentRuntime, run, streamText } from "../src/index.js"
import type { SDKMessage } from "../src/Schema/Message.js"

const makeSuccessMessage = (result: string): SDKMessage => ({
  type: "result",
  subtype: "success",
  duration_ms: 1,
  duration_api_ms: 1,
  is_error: false,
  num_turns: 1,
  result,
  total_cost_usd: 0,
  usage: {},
  modelUsage: {},
  permission_denials: [],
  uuid: "00000000-0000-0000-0000-000000000000",
  session_id: "session-1"
})

const makeDeltaMessage = (text: string): SDKMessage =>
  ({
    type: "stream_event",
    event: {
      type: "content_block_delta",
      delta: { text }
    },
    parent_tool_use_id: null,
    uuid: "00000000-0000-0000-0000-000000000000",
    session_id: "session-1"
  }) as SDKMessage

const makeRuntime = (stream: Stream.Stream<SDKMessage>) => {
  const notUsed = Effect.dieMessage("not used") as Effect.Effect<any, any, any>
  return AgentRuntime.make({
    query: () => notUsed as any,
    queryRaw: () => notUsed as any,
    stream: () => stream,
    stats: Effect.succeed({
      active: 0,
      pending: 0,
      concurrencyLimit: 1,
      pendingQueueCapacity: 0,
      pendingQueueStrategy: "disabled"
    }),
    interruptAll: Effect.void,
    events: Stream.empty
  })
}

const collect = async (iterable: AsyncIterable<string>) => {
  const chunks: Array<string> = []
  for await (const chunk of iterable) {
    chunks.push(chunk)
  }
  return chunks
}

test("run returns the final result without Effect plumbing", async () => {
  const runtime = makeRuntime(Stream.fromIterable([makeSuccessMessage("ok")]))
  const entry = {
    layers: { runtime: Layer.succeed(AgentRuntime, runtime) }
  }

  const result = await run("hello", undefined, entry)
  expect(result.result).toBe("ok")
})

test("streamText yields streamed chunks and ignores result duplication", async () => {
  const runtime = makeRuntime(
    Stream.fromIterable([
      makeDeltaMessage("Hel"),
      makeDeltaMessage("lo"),
      makeSuccessMessage("Hello")
    ])
  )
  const entry = {
    layers: { runtime: Layer.succeed(AgentRuntime, runtime) }
  }

  const chunks = await collect(streamText("hello", undefined, entry))
  expect(chunks.join("")).toBe("Hello")
  expect(chunks).toEqual(["Hel", "lo"])
})

test("streamText falls back to result text when no deltas exist", async () => {
  const runtime = makeRuntime(Stream.fromIterable([makeSuccessMessage("Only result")]))
  const entry = {
    layers: { runtime: Layer.succeed(AgentRuntime, runtime) }
  }

  const chunks = await collect(streamText("hello", undefined, entry))
  expect(chunks).toEqual(["Only result"])
})
