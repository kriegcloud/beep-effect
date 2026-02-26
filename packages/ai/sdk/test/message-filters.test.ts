import { expect, test } from "bun:test"
import * as Effect from "effect/Effect"
import * as Match from "effect/Match"
import * as Stream from "effect/Stream"
import {
  MessageFilters
} from "../src/index.js"
import type { SDKMessage } from "../src/Schema/Message.js"

// ---------------------------------------------------------------------------
// Minimal mock messages
// ---------------------------------------------------------------------------

const assistantMsg = {
  type: "assistant",
  message: { content: [{ type: "text", text: "hello" }] },
  parent_tool_use_id: null,
  uuid: "a-uuid",
  session_id: "s1"
} as unknown as SDKMessage

const streamEventMsg = {
  type: "stream_event",
  event: { delta: { text: "chunk" } },
  parent_tool_use_id: null,
  uuid: "se-uuid",
  session_id: "s1"
} as unknown as SDKMessage

const userMsg = {
  type: "user",
  message: { role: "user", content: [{ type: "text", text: "hi" }] },
  parent_tool_use_id: null,
  session_id: "s1"
} as unknown as SDKMessage

const userReplayMsg = {
  type: "user",
  isReplay: true,
  message: { role: "user", content: [{ type: "text", text: "hi" }] },
  parent_tool_use_id: null,
  uuid: "ur-uuid",
  session_id: "s1"
} as unknown as SDKMessage

const resultSuccessMsg = {
  type: "result",
  subtype: "success",
  duration_ms: 100,
  duration_api_ms: 50,
  is_error: false,
  num_turns: 1,
  result: "done",
  total_cost_usd: 0.01,
  usage: {},
  modelUsage: {},
  permission_denials: [],
  uuid: "rs-uuid",
  session_id: "s1"
} as unknown as SDKMessage

const resultErrorMsg = {
  type: "result",
  subtype: "error_during_execution",
  duration_ms: 100,
  duration_api_ms: 50,
  is_error: true,
  num_turns: 1,
  total_cost_usd: 0,
  usage: {},
  modelUsage: {},
  permission_denials: [],
  errors: ["boom"],
  uuid: "re-uuid",
  session_id: "s1"
} as unknown as SDKMessage

const systemInitMsg = {
  type: "system",
  subtype: "init",
  apiKeySource: "env",
  claude_code_version: "1.0",
  cwd: "/tmp",
  tools: [],
  mcp_servers: [],
  model: "sonnet",
  permissionMode: "default",
  slash_commands: [],
  output_style: "text",
  skills: [],
  plugins: [],
  uuid: "si-uuid",
  session_id: "s1"
} as unknown as SDKMessage

const toolProgressMsg = {
  type: "tool_progress",
  tool_use_id: "tu1",
  tool_name: "Read",
  parent_tool_use_id: null,
  elapsed_time_seconds: 1,
  uuid: "tp-uuid",
  session_id: "s1"
} as unknown as SDKMessage

const toolUseSummaryMsg = {
  type: "tool_use_summary",
  summary: "Read a file",
  preceding_tool_use_ids: ["tu1"],
  uuid: "tus-uuid",
  session_id: "s1"
} as unknown as SDKMessage

const authStatusMsg = {
  type: "auth_status",
  isAuthenticating: false,
  output: [],
  uuid: "as-uuid",
  session_id: "s1"
} as unknown as SDKMessage

const statusMsg = {
  type: "system",
  subtype: "status",
  status: null,
  uuid: "st-uuid",
  session_id: "s1"
} as unknown as SDKMessage

const allMessages: ReadonlyArray<SDKMessage> = [
  assistantMsg,
  streamEventMsg,
  userMsg,
  userReplayMsg,
  resultSuccessMsg,
  resultErrorMsg,
  systemInitMsg,
  toolProgressMsg,
  toolUseSummaryMsg,
  authStatusMsg,
  statusMsg
]

// ---------------------------------------------------------------------------
// Type guard tests
// ---------------------------------------------------------------------------

test("isAssistant narrows assistant messages", () => {
  expect(MessageFilters.isAssistant(assistantMsg)).toBe(true)
  expect(MessageFilters.isAssistant(userMsg)).toBe(false)
  expect(MessageFilters.isAssistant(resultSuccessMsg)).toBe(false)
})

test("isStreamEvent narrows stream_event messages", () => {
  expect(MessageFilters.isStreamEvent(streamEventMsg)).toBe(true)
  expect(MessageFilters.isStreamEvent(assistantMsg)).toBe(false)
})

test("isUser narrows user messages (including replays)", () => {
  expect(MessageFilters.isUser(userMsg)).toBe(true)
  expect(MessageFilters.isUser(userReplayMsg)).toBe(true)
  expect(MessageFilters.isUser(assistantMsg)).toBe(false)
})

test("isResult narrows result messages", () => {
  expect(MessageFilters.isResult(resultSuccessMsg)).toBe(true)
  expect(MessageFilters.isResult(resultErrorMsg)).toBe(true)
  expect(MessageFilters.isResult(assistantMsg)).toBe(false)
})

test("isResultSuccess narrows only success results", () => {
  expect(MessageFilters.isResultSuccess(resultSuccessMsg)).toBe(true)
  expect(MessageFilters.isResultSuccess(resultErrorMsg)).toBe(false)
  expect(MessageFilters.isResultSuccess(assistantMsg)).toBe(false)
})

test("isResultError narrows only error results", () => {
  expect(MessageFilters.isResultError(resultErrorMsg)).toBe(true)
  expect(MessageFilters.isResultError(resultSuccessMsg)).toBe(false)
})

test("isSystem narrows system init messages", () => {
  expect(MessageFilters.isSystem(systemInitMsg)).toBe(true)
  expect(MessageFilters.isSystem(statusMsg)).toBe(false)
})

test("isToolProgress narrows tool_progress messages", () => {
  expect(MessageFilters.isToolProgress(toolProgressMsg)).toBe(true)
  expect(MessageFilters.isToolProgress(toolUseSummaryMsg)).toBe(false)
})

test("isToolUseSummary narrows tool_use_summary messages", () => {
  expect(MessageFilters.isToolUseSummary(toolUseSummaryMsg)).toBe(true)
  expect(MessageFilters.isToolUseSummary(toolProgressMsg)).toBe(false)
})

test("isAuthStatus narrows auth_status messages", () => {
  expect(MessageFilters.isAuthStatus(authStatusMsg)).toBe(true)
  expect(MessageFilters.isAuthStatus(assistantMsg)).toBe(false)
})

// ---------------------------------------------------------------------------
// Stream filter tests
// ---------------------------------------------------------------------------

test("filterAssistant keeps only assistant messages", async () => {
  const result = await Effect.runPromise(
    MessageFilters.filterAssistant(Stream.fromIterable(allMessages)).pipe(
      Stream.runCollect
    )
  )
  const items = Array.from(result)
  expect(items).toHaveLength(1)
  expect(items[0]!.type).toBe("assistant")
})

test("filterResultSuccess keeps only success results", async () => {
  const result = await Effect.runPromise(
    MessageFilters.filterResultSuccess(Stream.fromIterable(allMessages)).pipe(
      Stream.runCollect
    )
  )
  const items = Array.from(result)
  expect(items).toHaveLength(1)
  expect(items[0]!.subtype).toBe("success")
})

test("filterResultError keeps only error results", async () => {
  const result = await Effect.runPromise(
    MessageFilters.filterResultError(Stream.fromIterable(allMessages)).pipe(
      Stream.runCollect
    )
  )
  const items = Array.from(result)
  expect(items).toHaveLength(1)
  expect(items[0]!.subtype).toBe("error_during_execution")
})

test("filterUser keeps user and replay messages", async () => {
  const result = await Effect.runPromise(
    MessageFilters.filterUser(Stream.fromIterable(allMessages)).pipe(
      Stream.runCollect
    )
  )
  expect(Array.from(result)).toHaveLength(2)
})

test("filterStreamEvents keeps only stream_event messages", async () => {
  const result = await Effect.runPromise(
    MessageFilters.filterStreamEvents(Stream.fromIterable(allMessages)).pipe(
      Stream.runCollect
    )
  )
  const items = Array.from(result)
  expect(items).toHaveLength(1)
  expect(items[0]!.type).toBe("stream_event")
})

test("filterToolProgress keeps only tool_progress messages", async () => {
  const result = await Effect.runPromise(
    MessageFilters.filterToolProgress(Stream.fromIterable(allMessages)).pipe(
      Stream.runCollect
    )
  )
  const items = Array.from(result)
  expect(items).toHaveLength(1)
  expect(items[0]!.type).toBe("tool_progress")
})

// ---------------------------------------------------------------------------
// Text utility tests
// ---------------------------------------------------------------------------

test("extractTextChunks extracts text from assistant content blocks", () => {
  const chunks = MessageFilters.extractTextChunks(assistantMsg)
  expect(chunks).toEqual(["hello"])
})

test("extractTextChunks extracts text from stream_event delta", () => {
  const chunks = MessageFilters.extractTextChunks(streamEventMsg)
  expect(chunks).toEqual(["chunk"])
})

test("extractTextChunks returns empty for non-text messages", () => {
  expect(MessageFilters.extractTextChunks(resultSuccessMsg)).toEqual([])
  expect(MessageFilters.extractTextChunks(userMsg)).toEqual([])
})

test("extractResultText returns result text for success messages", () => {
  expect(MessageFilters.extractResultText(resultSuccessMsg)).toBe("done")
})

test("extractResultText returns undefined for non-result messages", () => {
  expect(MessageFilters.extractResultText(assistantMsg)).toBeUndefined()
  expect(MessageFilters.extractResultText(resultErrorMsg)).toBeUndefined()
})

test("toTextStream extracts text chunks from assistant and stream messages", async () => {
  const stream = Stream.fromIterable([assistantMsg, streamEventMsg, resultSuccessMsg])
  const result = await Effect.runPromise(
    MessageFilters.toTextStream(stream).pipe(Stream.runCollect)
  )
  // assistant "hello" + stream_event "chunk" (result text not emitted because hasText is true)
  expect([...result]).toEqual(["hello", "chunk"])
})

test("toTextStream falls back to result text when no text chunks seen", async () => {
  const stream = Stream.fromIterable([resultSuccessMsg])
  const result = await Effect.runPromise(
    MessageFilters.toTextStream(stream).pipe(Stream.runCollect)
  )
  expect([...result]).toEqual(["done"])
})

// ---------------------------------------------------------------------------
// Match utility tests
// ---------------------------------------------------------------------------

test("match starter can be extended with Match.when and Match.orElse", () => {
  const handler = MessageFilters.match.pipe(
    Match.when({ type: "assistant" }, () => "assistant"),
    Match.when({ type: "result", subtype: "success" }, () => "success"),
    Match.orElse(() => "other")
  )

  expect(handler(assistantMsg)).toBe("assistant")
  expect(handler(resultSuccessMsg)).toBe("success")
  expect(handler(userMsg)).toBe("other")
  expect(handler(toolProgressMsg)).toBe("other")
})

test("fold routes each message category to the correct handler", () => {
  const describe = MessageFilters.fold({
    assistant: () => "assistant",
    user: () => "user",
    result: () => "result",
    system: () => "system",
    stream_event: () => "stream_event",
    tool: () => "tool",
    auth_status: () => "auth_status"
  })

  expect(describe(assistantMsg)).toBe("assistant")
  expect(describe(userMsg)).toBe("user")
  expect(describe(userReplayMsg)).toBe("user")
  expect(describe(resultSuccessMsg)).toBe("result")
  expect(describe(resultErrorMsg)).toBe("result")
  expect(describe(systemInitMsg)).toBe("system")
  expect(describe(statusMsg)).toBe("system")
  expect(describe(streamEventMsg)).toBe("stream_event")
  expect(describe(toolProgressMsg)).toBe("tool")
  expect(describe(toolUseSummaryMsg)).toBe("tool")
  expect(describe(authStatusMsg)).toBe("auth_status")
})

test("fold handles all result error subtypes", () => {
  const describe = MessageFilters.fold({
    assistant: () => "assistant",
    user: () => "user",
    result: (msg) => `result:${msg.subtype}`,
    system: () => "system",
    stream_event: () => "stream_event",
    tool: () => "tool",
    auth_status: () => "auth_status"
  })

  const errorSubtypes = [
    "error_during_execution",
    "error_max_turns",
    "error_max_budget_usd",
    "error_max_structured_output_retries"
  ] as const

  for (const subtype of errorSubtypes) {
    const msg = { ...resultErrorMsg, subtype } as unknown as SDKMessage
    expect(describe(msg)).toBe(`result:${subtype}`)
  }
})
