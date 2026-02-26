import { expect, mock, test } from "bun:test"
import * as Effect from "effect/Effect"
import * as Either from "effect/Either"
import type * as Scope from "effect/Scope"
import * as Stream from "effect/Stream"
import type { SDKMessage, SDKUserMessage } from "../src/Schema/Message.js"
import type { CloudflareSandboxOptions } from "../src/Sandbox/SandboxCloudflare.js"
import { SandboxService } from "../src/Sandbox/SandboxService.js"
import { runEffect } from "./effect-test.js"

type MockSandboxCall = {
  readonly binding: unknown
  readonly id: string
  readonly options?: { sleepAfter?: string }
}

type MockSandboxState = {
  readonly getSandboxCalls: Array<MockSandboxCall>
  readonly execCalls: Array<string>
  readonly execStreamCalls: Array<string>
  readonly execStreamOptions: Array<{
    readonly timeout?: number
    readonly env?: Record<string, string | undefined>
    readonly signal?: AbortSignal
  }>
  readonly writeFileCalls: Array<{ path: string; content: string }>
  readonly readFileCalls: Array<string>
  readonly setEnvVarsCalls: Array<Record<string, string | undefined>>
  readonly destroyCalls: { value: number }
  readonly streamCancelCalls: { value: number }
  readonly execResult: {
    success: boolean
    stdout: string
    stderr: string
    exitCode: number
  }
  readFileContent: string
  execStreamFactory: () => ReadableStream<Uint8Array>
  sseEventsQueue?: Array<ReadonlyArray<{
    readonly type: "start" | "stdout" | "stderr" | "complete" | "error"
    readonly data?: string
    readonly exitCode?: number
    readonly error?: string
  }>>
  sseEvents?: ReadonlyArray<{
    readonly type: "start" | "stdout" | "stderr" | "complete" | "error"
    readonly data?: string
    readonly exitCode?: number
    readonly error?: string
  }>
}

const makeReadable = (
  chunks: ReadonlyArray<Uint8Array>,
  options?: { readonly close?: boolean }
) =>
  new ReadableStream<Uint8Array>({
    start: (controller) => {
      for (const chunk of chunks) {
        controller.enqueue(chunk)
      }
      if (options?.close ?? true) {
        controller.close()
      }
    },
    cancel: () => {
      state.streamCancelCalls.value += 1
    }
  })

const makeState = (): MockSandboxState => ({
  getSandboxCalls: [],
  execCalls: [],
  execStreamCalls: [],
  execStreamOptions: [],
  writeFileCalls: [],
  readFileCalls: [],
  setEnvVarsCalls: [],
  destroyCalls: { value: 0 },
  streamCancelCalls: { value: 0 },
  execResult: {
    success: true,
    stdout: "stdout",
    stderr: "stderr",
    exitCode: 7
  },
  readFileContent: "",
  execStreamFactory: () => makeReadable([])
})

let state = makeState()

mock.module("@cloudflare/sandbox", () => ({
  parseSSEStream: async function* <T>(stream: ReadableStream): AsyncIterable<T> {
    const queuedEvents = state.sseEventsQueue?.shift()
    if (queuedEvents) {
      for (const event of queuedEvents) {
        yield event as T
      }
      return
    }

    if (state.sseEvents) {
      for (const event of state.sseEvents) {
        yield event as T
      }
      return
    }

    const reader = stream.getReader()
    const decoder = new TextDecoder()
    let buffer = ""
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        while (true) {
          const newlineIndex = buffer.indexOf("\n")
          if (newlineIndex < 0) break
          const line = buffer.slice(0, newlineIndex)
          buffer = buffer.slice(newlineIndex + 1)
          if (line.length === 0) continue
          yield { type: "stdout", data: line } as T
        }
      }
      buffer += decoder.decode()
      if (buffer.length > 0) {
        yield { type: "stdout", data: buffer } as T
      }
    } finally {
      reader.releaseLock()
    }
  },
  getSandbox: (
    binding: unknown,
    id: string,
    options?: { sleepAfter?: string }
  ) => {
    state.getSandboxCalls.push({
      binding,
      id,
      ...(options !== undefined ? { options } : {})
    })
    return {
      exec: async (command: string) => {
        state.execCalls.push(command)
        return state.execResult
      },
      execStream: async (
        command: string,
        options?: {
          timeout?: number
          env?: Record<string, string | undefined>
          signal?: AbortSignal
        }
      ) => {
        state.execStreamCalls.push(command)
        state.execStreamOptions.push({
          ...(options?.timeout !== undefined ? { timeout: options.timeout } : {}),
          ...(options?.env !== undefined ? { env: options.env } : {}),
          ...(options?.signal !== undefined ? { signal: options.signal } : {})
        })
        return state.execStreamFactory()
      },
      writeFile: async (path: string, content: string) => {
        state.writeFileCalls.push({ path, content })
      },
      readFile: async (path: string) => {
        state.readFileCalls.push(path)
        return { content: state.readFileContent, encoding: "utf-8" }
      },
      setEnvVars: async (envVars: Record<string, string | undefined>) => {
        state.setEnvVarsCalls.push(envVars)
      },
      destroy: async () => {
        state.destroyCalls.value += 1
      }
    }
  }
}))

const defaultBinding = { name: "sandbox-binding" }

const makeOptions = (
  overrides?: Partial<CloudflareSandboxOptions>
): CloudflareSandboxOptions => ({
  env: { Sandbox: defaultBinding },
  sandboxId: "sandbox-test",
  sleepAfter: "15m",
  apiKey: "test-api-key",
  ...overrides
})

const runInSandbox = async <A>(
  effect: Effect.Effect<A, unknown, SandboxService | Scope.Scope>,
  options?: Partial<CloudflareSandboxOptions>
) => {
  const { layerCloudflare } = await import("../src/Sandbox/SandboxCloudflare.js")
  return runEffect(
    Effect.scoped(
      effect.pipe(
        Effect.provide(layerCloudflare(makeOptions(options)))
      )
    )
  )
}

const textEncoder = new TextEncoder()
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const toUuid = (value: string) => {
  if (uuidPattern.test(value)) return value
  const compact = value.replace(/[^0-9a-f]/gi, "").toLowerCase()
  const tail = compact.padEnd(12, "0").slice(0, 12)
  return `00000000-0000-4000-8000-${tail}`
}

const makeSuccessResultMessage = (
  result: string,
  uuid: string,
  sessionId: string
): SDKMessage =>
  ({
    type: "result",
    subtype: "success",
    result,
    duration_ms: 1,
    duration_api_ms: 1,
    is_error: false,
    num_turns: 1,
    total_cost_usd: 0,
    usage: {},
    modelUsage: {},
    permission_denials: [],
    uuid: toUuid(uuid),
    session_id: sessionId
  }) as SDKMessage

const assertSandboxError = (
  result: Either.Either<unknown, unknown>,
  operation: string
) => {
  expect(Either.isLeft(result)).toBe(true)
  if (Either.isLeft(result)) {
    const error = result.left as { _tag?: string; operation?: string }
    expect(error._tag).toBe("SandboxError")
    expect(error.operation).toBe(operation)
  }
}

test("SandboxCloudflare wires lifecycle and core methods", async () => {
  state = makeState()
  state.readFileContent = "file-content"

  const output = await runInSandbox(
    Effect.gen(function*() {
      const sandbox = yield* SandboxService
      const execResult = yield* sandbox.exec("echo", ["hello world", "it's me"])
      yield* sandbox.writeFile("/tmp/input.txt", "payload")
      const read = yield* sandbox.readFile("/tmp/input.txt")
      return { execResult, read }
    })
  )

  expect(output.execResult).toEqual({
    stdout: "stdout",
    stderr: "stderr",
    exitCode: 7
  })
  expect(output.read).toBe("file-content")
  expect(state.getSandboxCalls).toEqual([
    {
      binding: defaultBinding,
      id: "sandbox-test",
      options: { sleepAfter: "15m" }
    }
  ])
  expect(state.setEnvVarsCalls).toEqual([{ ANTHROPIC_API_KEY: "test-api-key" }])
  expect(state.execCalls[0]).toBe("'echo' 'hello world' 'it'\\''s me'")
  expect(state.writeFileCalls).toContainEqual({
    path: "/tmp/input.txt",
    content: "payload"
  })
  expect(state.readFileCalls).toEqual(["/tmp/input.txt"])
  expect(state.destroyCalls.value).toBe(1)
})

test("SandboxCloudflare.runAgent parses split NDJSON and strips empty lines", async () => {
  state = makeState()

  const first: SDKMessage = {
    type: "system",
    subtype: "status",
    status: null,
    uuid: toUuid("u-1"),
    session_id: "s-1"
  }
  const second = makeSuccessResultMessage("second", "u-2", "s-1")
  const third = makeSuccessResultMessage("third", "u-3", "s-1")

  const secondLine = JSON.stringify(second)
  const chunkA = `${JSON.stringify(first)}\n${secondLine.slice(0, 9)}`
  const chunkB = `${secondLine.slice(9)}\n\n${JSON.stringify(third)}\n`

  state.execStreamFactory = () =>
    makeReadable([
      textEncoder.encode(chunkA),
      textEncoder.encode(chunkB)
    ])

  const messages = await runInSandbox(
    Effect.gen(function*() {
      const sandbox = yield* SandboxService
      const handle = yield* sandbox.runAgent("prompt-text", {
        model: "haiku",
        maxTurns: 2,
        permissionMode: "bypassPermissions"
      })
      const collected = yield* Stream.runCollect(handle.stream)
      return Array.from(collected)
    })
  )

  expect(messages).toEqual([first, second, third])
  expect(state.writeFileCalls[0]?.content).toBe("prompt-text")
  expect(state.writeFileCalls[0]?.path).toMatch(/^\/tmp\/\.claude-prompt-[^/]+\.txt$/)
  expect(state.execStreamCalls[0]).toMatch(
    /^cat '\/tmp\/\.claude-prompt-[^']+\.txt' \| claude --output-format stream-json --verbose --model 'haiku' --max-turns 2 --dangerously-skip-permissions$/
  )
  expect(state.execCalls.some((command) =>
    command.startsWith("rm -f '/tmp/.claude-prompt-")
  )).toBe(true)
})

test("SandboxCloudflare.runAgent passes --session-id when resume is set", async () => {
  state = makeState()
  const resultMessage = makeSuccessResultMessage("resumed", "u-resumed", "s-resumed")
  state.execStreamFactory = () =>
    makeReadable([textEncoder.encode(`${JSON.stringify(resultMessage)}\n`)])

  await runInSandbox(
    Effect.gen(function*() {
      const sandbox = yield* SandboxService
      const handle = yield* sandbox.runAgent("continue chat", {
        model: "haiku",
        resume: "abc-session-123"
      })
      yield* Stream.runCollect(handle.stream)
    })
  )

  expect(state.execStreamCalls[0]).toMatch(
    /--resume 'abc-session-123'/
  )
  expect(state.execStreamCalls[0]).toMatch(
    /--model 'haiku'/
  )
  // Should NOT have --dangerously-skip-permissions since not requested
  expect(state.execStreamCalls[0]).not.toMatch(
    /--dangerously-skip-permissions/
  )
})

test("SandboxCloudflare.runAgent retries once without --resume on stale session failures", async () => {
  state = makeState()
  const fallbackMessage = makeSuccessResultMessage("fallback", "u-fallback", "s-fallback")
  state.sseEventsQueue = [
    [
      { type: "stderr", data: "Error: session not found while attempting resume" },
      { type: "complete", exitCode: 1 }
    ],
    [
      { type: "stdout", data: JSON.stringify(fallbackMessage) },
      { type: "complete", exitCode: 0 }
    ]
  ]

  const messages = await runInSandbox(
    Effect.gen(function*() {
      const sandbox = yield* SandboxService
      const handle = yield* sandbox.runAgent("continue chat", {
        model: "haiku",
        resume: "abc-session-123"
      })
      const collected = yield* Stream.runCollect(handle.stream)
      return Array.from(collected)
    })
  )

  expect(messages).toEqual([fallbackMessage])
  expect(state.execStreamCalls).toHaveLength(2)
  expect(state.execStreamCalls[0]).toMatch(/--resume 'abc-session-123'/)
  expect(state.execStreamCalls[1]).not.toMatch(/--resume 'abc-session-123'/)
})

test("SandboxCloudflare.runAgent returns error when resume fallback retry also fails", async () => {
  state = makeState()
  state.sseEventsQueue = [
    [
      { type: "stderr", data: "resume failed: no such session" },
      { type: "complete", exitCode: 1 }
    ],
    [
      { type: "stderr", data: "network unavailable" },
      { type: "complete", exitCode: 2 }
    ]
  ]

  const result = await runInSandbox(
    Effect.gen(function*() {
      const sandbox = yield* SandboxService
      const handle = yield* sandbox.runAgent("continue chat", {
        model: "haiku",
        resume: "abc-session-123"
      })
      return yield* Effect.either(Stream.runCollect(handle.stream))
    })
  )

  assertSandboxError(result, "runAgent.exec")
  expect(state.execStreamCalls).toHaveLength(2)
})

test("SandboxCloudflare.runAgent does not retry non-stale resume failures", async () => {
  state = makeState()
  state.sseEventsQueue = [
    [
      { type: "stderr", data: "permission denied while accessing model" },
      { type: "complete", exitCode: 1 }
    ]
  ]

  const result = await runInSandbox(
    Effect.gen(function*() {
      const sandbox = yield* SandboxService
      const handle = yield* sandbox.runAgent("continue chat", {
        model: "haiku",
        resume: "abc-session-123"
      })
      return yield* Effect.either(Stream.runCollect(handle.stream))
    })
  )

  assertSandboxError(result, "runAgent.exec")
  expect(state.execStreamCalls).toHaveLength(1)
  expect(state.execStreamCalls[0]).toMatch(/--resume 'abc-session-123'/)
})

test("SandboxCloudflare.runAgent handles split stdout events without newline delimiters", async () => {
  state = makeState()

  const message = makeSuccessResultMessage("split-stdout", "u-split", "s-split")
  const line = JSON.stringify(message)

  state.sseEvents = [
    { type: "stdout", data: line.slice(0, 24) },
    { type: "stdout", data: line.slice(24) },
    { type: "complete", exitCode: 0 }
  ]

  const messages = await runInSandbox(
    Effect.gen(function*() {
      const sandbox = yield* SandboxService
      const handle = yield* sandbox.runAgent("split-stdout")
      const collected = yield* Stream.runCollect(handle.stream)
      return Array.from(collected)
    })
  )

  expect(messages).toEqual([message])
})

test("SandboxCloudflare.runAgent handles UTF-8 chunk boundaries", async () => {
  state = makeState()

  const message = makeSuccessResultMessage("utf8 🙂 split", "u-utf8", "s-utf8")
  const bytes = textEncoder.encode(`${JSON.stringify(message)}\n`)
  const splitIndex = bytes.findIndex((byte) => byte > 0x7f) + 1

  expect(splitIndex).toBeGreaterThan(0)

  state.execStreamFactory = () =>
    makeReadable([
      bytes.slice(0, splitIndex),
      bytes.slice(splitIndex)
    ])

  const messages = await runInSandbox(
    Effect.gen(function*() {
      const sandbox = yield* SandboxService
      const handle = yield* sandbox.runAgent("utf8")
      const collected = yield* Stream.runCollect(handle.stream)
      return Array.from(collected)
    })
  )

  expect(messages).toEqual([message])
})

test("SandboxCloudflare.runAgent handles one-byte chunk streams", async () => {
  state = makeState()

  const messages = [
    makeSuccessResultMessage("one", "u-one", "s-one"),
    makeSuccessResultMessage("two", "u-two", "s-one")
  ]
  const payload = `${messages.map((message) => JSON.stringify(message)).join("\n")}\n`
  const chunks = Array.from(textEncoder.encode(payload), (byte) => Uint8Array.of(byte))

  state.execStreamFactory = () => makeReadable(chunks)

  const collected = await runInSandbox(
    Effect.gen(function*() {
      const sandbox = yield* SandboxService
      const handle = yield* sandbox.runAgent("tiny-chunks")
      return yield* Stream.runCollect(handle.stream)
    })
  )

  expect(Array.from(collected)).toEqual(messages)
})

test("SandboxCloudflare.runAgent returns SandboxError for unsupported input methods", async () => {
  state = makeState()
  const userMessage = {
    type: "user",
    message: { role: "user", content: "ping" },
    parent_tool_use_id: null,
    uuid: toUuid("u-user"),
    session_id: "s-user"
  } as SDKUserMessage

  const results = await runInSandbox(
    Effect.gen(function*() {
      const sandbox = yield* SandboxService
      const handle = yield* sandbox.runAgent("unsupported")
      const send = yield* Effect.either(handle.send(userMessage))
      const sendAll = yield* Effect.either(handle.sendAll([userMessage]))
      const sendForked = yield* Effect.either(handle.sendForked(userMessage))
      const setMcpServers = yield* Effect.either(handle.setMcpServers({}))
      const accountInfo = yield* Effect.either(handle.accountInfo)
      yield* handle.closeInput
      const supportedCommands = yield* handle.supportedCommands
      const supportedModels = yield* handle.supportedModels
      const mcpServerStatus = yield* handle.mcpServerStatus
      return {
        send,
        sendAll,
        sendForked,
        setMcpServers,
        accountInfo,
        supportedCommands,
        supportedModels,
        mcpServerStatus
      }
    })
  )

  assertSandboxError(results.send, "send")
  assertSandboxError(results.sendAll, "sendAll")
  assertSandboxError(results.sendForked, "sendForked")
  assertSandboxError(results.setMcpServers, "setMcpServers")
  assertSandboxError(results.accountInfo, "accountInfo")
  expect(results.supportedCommands).toEqual([])
  expect(results.supportedModels).toEqual([])
  expect(results.mcpServerStatus).toEqual([])
})

test("SandboxCloudflare.runAgent interrupt cancels underlying stream", async () => {
  state = makeState()
  state.execStreamFactory = () => makeReadable([], { close: false })

  const canceledAfterInterrupt = await runInSandbox(
    Effect.gen(function*() {
      const sandbox = yield* SandboxService
      const handle = yield* sandbox.runAgent("interrupt-me")
      yield* handle.interrupt
      return state.streamCancelCalls.value
    })
  )

  expect(canceledAfterInterrupt).toBe(1)
})

test("SandboxCloudflare.runAgent forwards env/timeout options and cancels stream on interrupt", async () => {
  state = makeState()
  state.execStreamFactory = () => makeReadable([], { close: false })

  await runInSandbox(
    Effect.gen(function*() {
      const sandbox = yield* SandboxService
      const handle = yield* sandbox.runAgent("interrupt-me", {
        env: {
          CUSTOM_ENV: "value"
        } as Record<string, string | undefined>
      })
      yield* handle.interrupt
    }),
    { execTimeoutMs: 1234 }
  )

  expect(state.execStreamOptions[0]?.timeout).toBe(1234)
  expect(state.execStreamOptions[0]?.env?.CUSTOM_ENV).toBe("value")
  // AbortSignal is NOT passed to execStream (can't cross DO boundary).
  // Interrupt relies on stream.cancel() instead.
  expect(state.execStreamOptions[0]?.signal).toBeUndefined()
})

test("SandboxCloudflare.runAgent supports no-op control methods and rewindFiles", async () => {
  state = makeState()
  const resultMessage = makeSuccessResultMessage("done", "u-done", "s-done")
  state.execStreamFactory = () =>
    makeReadable([textEncoder.encode(`${JSON.stringify(resultMessage)}\n`)])

  const result = await runInSandbox(
    Effect.gen(function*() {
      const sandbox = yield* SandboxService
      const handle = yield* sandbox.runAgent("controls")
      yield* handle.setPermissionMode("default")
      yield* handle.setModel("sonnet")
      yield* handle.setMaxThinkingTokens(128)
      const rewind = yield* handle.rewindFiles("user-message-id")
      const supportedCommands = yield* handle.supportedCommands
      const supportedModels = yield* handle.supportedModels
      const mcpServerStatus = yield* handle.mcpServerStatus
      const messages = yield* Stream.runCollect(handle.stream)
      return {
        rewind,
        supportedCommands,
        supportedModels,
        mcpServerStatus,
        messages: Array.from(messages)
      }
    })
  )

  expect(result.rewind).toEqual({ canRewind: false })
  expect(result.supportedCommands).toEqual([])
  expect(result.supportedModels).toEqual([])
  expect(result.mcpServerStatus).toEqual([])
  expect(result.messages).toEqual([resultMessage])
})

test("SandboxCloudflare.runAgent share and broadcast fan out output", async () => {
  state = makeState()
  const messages = [
    makeSuccessResultMessage("left", "u-left", "s-share"),
    makeSuccessResultMessage("right", "u-right", "s-share")
  ]
  state.execStreamFactory = () =>
    makeReadable([textEncoder.encode(`${messages.map((m) => JSON.stringify(m)).join("\n")}\n`)])

  const sharedCollected = await runInSandbox(
    Effect.gen(function*() {
      const sandbox = yield* SandboxService
      const handle = yield* sandbox.runAgent("share")
      const shared = yield* handle.share()
      const [first, second] = yield* Effect.all([
        Stream.runCollect(shared),
        Stream.runCollect(shared)
      ], { concurrency: "unbounded" })
      return [Array.from(first), Array.from(second)] as const
    })
  )

  expect(sharedCollected[0]).toEqual(messages)
  expect(sharedCollected[1]).toEqual(messages)

  state = makeState()
  state.execStreamFactory = () =>
    makeReadable([textEncoder.encode(`${messages.map((m) => JSON.stringify(m)).join("\n")}\n`)])

  const broadcastCollected = await runInSandbox(
    Effect.gen(function*() {
      const sandbox = yield* SandboxService
      const handle = yield* sandbox.runAgent("broadcast")
      const [left, right] = yield* handle.broadcast(2)
      const [first, second] = yield* Effect.all([
        Stream.runCollect(left),
        Stream.runCollect(right)
      ], { concurrency: "unbounded" })
      return [Array.from(first), Array.from(second)] as const
    })
  )

  expect(broadcastCollected[0]).toEqual(messages)
  expect(broadcastCollected[1]).toEqual(messages)
})

test("SandboxCloudflare.runAgent maps stream failures and still cleans prompt file", async () => {
  state = makeState()
  const streamError = new Error("sandbox process died")
  state.execStreamFactory = () =>
    new ReadableStream<Uint8Array>({
      start: (controller) => {
        controller.error(streamError)
      },
      cancel: () => {
        state.streamCancelCalls.value += 1
      }
    })

  const result = await runInSandbox(
    Effect.gen(function*() {
      const sandbox = yield* SandboxService
      const handle = yield* sandbox.runAgent("explode")
      return yield* Effect.either(Stream.runCollect(handle.stream))
    })
  )

  expect(Either.isLeft(result)).toBe(true)
  if (Either.isLeft(result)) {
    const error = result.left as { _tag?: string; operation?: string }
    expect(error._tag).toBe("SandboxError")
    expect(error.operation !== undefined).toBe(true)
    if (error.operation !== undefined) {
      expect(["runAgent.stream", "runAgent.ndjson"]).toContain(error.operation)
    }
  }
  expect(state.execCalls.some((command) =>
    command.startsWith("rm -f '/tmp/.claude-prompt-")
  )).toBe(true)
})

test("SandboxCloudflare.runAgent fails when sandbox emits an error SSE event", async () => {
  state = makeState()
  state.sseEvents = [
    {
      type: "error",
      error: "sandbox process failed"
    }
  ]

  const result = await runInSandbox(
    Effect.gen(function*() {
      const sandbox = yield* SandboxService
      const handle = yield* sandbox.runAgent("explode")
      return yield* Effect.either(Stream.runCollect(handle.stream))
    })
  )

  assertSandboxError(result, "runAgent.exec")
})

test("SandboxCloudflare.runAgent fails on non-zero complete exit code", async () => {
  state = makeState()
  state.sseEvents = [
    {
      type: "complete",
      exitCode: 9
    }
  ]

  const result = await runInSandbox(
    Effect.gen(function*() {
      const sandbox = yield* SandboxService
      const handle = yield* sandbox.runAgent("exit")
      return yield* Effect.either(Stream.runCollect(handle.stream))
    })
  )

  assertSandboxError(result, "runAgent.exec")
})
