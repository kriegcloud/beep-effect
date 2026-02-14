import { expect, mock, test } from "bun:test"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Stream from "effect/Stream"
import {
  AgentRuntime,
  AgentRuntimeConfig,
  AgentSdk,
  AgentSdkConfig,
  QuerySupervisor,
  QuerySupervisorConfig,
  Sandbox,
  Storage
} from "../src/index.js"
import type { QueryHandle } from "../src/Query.js"
import type { SDKMessage } from "../src/Schema/Message.js"
import { runEffect } from "./effect-test.js"

const sdkMessages: ReadonlyArray<SDKMessage> = [
  {
    type: "user",
    session_id: "sandbox-local-session",
    message: {
      role: "user",
      content: [{ type: "text", text: "run tool" }]
    } as never,
    parent_tool_use_id: null,
    tool_use_result: { ok: true, value: 42 }
  } as SDKMessage,
  {
    type: "result",
    subtype: "success",
    duration_ms: 1,
    duration_api_ms: 1,
    is_error: false,
    num_turns: 1,
    result: "done",
    total_cost_usd: 0,
    usage: {},
    modelUsage: {},
    permission_denials: [],
    uuid: "result-local-uuid",
    session_id: "sandbox-local-session"
  } as SDKMessage
]

let queryCalls = 0
let prompts: Array<unknown> = []

const makeSdkQuery = () => {
  async function* generator() {
    for (const message of sdkMessages) {
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

mock.module("@anthropic-ai/claude-agent-sdk", () => ({
  query: ({ prompt }: { prompt: unknown }) => {
    queryCalls += 1
    prompts.push(prompt)
    return makeSdkQuery()
  },
  createSdkMcpServer: (_options: unknown) => ({})
}))

test("end-to-end with layerLocal sandbox and memory persistence", async () => {
  queryCalls = 0
  prompts = []

  const sdkLayer = AgentSdk.layer.pipe(
    Layer.provide(
      AgentSdkConfig.layerWithOverrides({
        apiKey: "test-api-key"
      })
    )
  )

  const supervisorLayer = QuerySupervisor.layer.pipe(
    Layer.provide(
      QuerySupervisorConfig.layerWith({
        concurrencyLimit: 1,
        pendingQueueCapacity: 4
      })
    ),
    Layer.provide(sdkLayer)
  )

  const sandboxLocalLayer = Sandbox.layerLocal.pipe(
    Layer.provide(supervisorLayer)
  )

  const runtimeCoreLayer = AgentRuntime.layer.pipe(
    Layer.provide(AgentRuntimeConfig.layerWith({})),
    Layer.provide(supervisorLayer)
  )

  const chatHistoryLayer = Storage.ChatHistoryStore.layerMemory
  const artifactLayer = Storage.ArtifactStore.layerMemory

  const layer = Layer.mergeAll(
    AgentRuntime.layerWithPersistence({
      layers: {
        runtime: runtimeCoreLayer,
        chatHistory: chatHistoryLayer,
        artifacts: artifactLayer
      }
    }),
    sandboxLocalLayer,
    chatHistoryLayer,
    artifactLayer
  )

  const program = Effect.scoped(
    Effect.gen(function*() {
      const sandbox = yield* Sandbox.SandboxService
      const runtime = yield* AgentRuntime

      expect(sandbox.provider).toBe("local")
      expect(sandbox.isolated).toBe(false)

      const handle = yield* runtime.query("hello from integration")
      yield* Stream.runDrain(handle.stream)

      const chat = yield* Storage.ChatHistoryStore
      const artifacts = yield* Storage.ArtifactStore
      const events = yield* chat.list("sandbox-local-session")
      const records = yield* artifacts.list("sandbox-local-session")

      return { events, records }
    }).pipe(Effect.provide(layer))
  )

  const result = await runEffect(program)

  expect(queryCalls).toBe(1)
  expect(prompts).toEqual(["hello from integration"])
  expect(result.events.length).toBe(1)
  expect(result.records.length).toBe(1)
})
