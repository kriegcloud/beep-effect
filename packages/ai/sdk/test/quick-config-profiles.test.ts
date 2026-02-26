import { expect, mock, test } from "bun:test"
import * as Effect from "effect/Effect"
import * as Option from "effect/Option"
import * as Stream from "effect/Stream"
import type { R2Bucket } from "../src/Storage/StorageR2.js"
import { defaultArtifactPrefix, defaultChatHistoryPrefix } from "../src/Storage/defaults.js"
import { managedRuntime, runtimeLayer } from "../src/QuickConfig.js"
import { AgentRuntime, QuerySupervisor, Sandbox } from "../src/index.js"

const makeR2Bucket = (map: Map<string, string>): R2Bucket => ({
  put: async (key, value) => {
    map.set(key, typeof value === "string" ? value : String(value))
    return null
  },
  get: async (key) => {
    const value = map.get(key)
    return value === undefined
      ? null
      : {
          text: async () => value,
          json: async () => JSON.parse(value),
          arrayBuffer: async () => new TextEncoder().encode(value).buffer
        }
  },
  head: async (key) => (map.has(key) ? { key, size: map.get(key)!.length, etag: "mock-etag" } : null),
  delete: async (key) => {
    if (Array.isArray(key)) {
      for (const item of key) {
        map.delete(item)
      }
    } else {
      map.delete(key)
    }
  },
  list: async (options) => {
    const keys = Array.from(map.keys())
    const start = options?.cursor ? Number(options.cursor) : 0
    const limit = options?.limit ?? keys.length
    const slice = keys.slice(start, start + limit)
    const next = start + limit
    const truncated = next < keys.length
    return truncated
      ? { objects: slice.map((key) => ({ key })), truncated: true as const, cursor: String(next), delimitedPrefixes: [] }
      : { objects: slice.map((key) => ({ key })), truncated: false as const, delimitedPrefixes: [] }
  }
})

const sdkMessages = [
  {
    type: "user",
    session_id: "quick-config-r2-session",
    message: {
      role: "user",
      content: [{ type: "text", text: "run tool" }]
    } as never,
    parent_tool_use_id: null,
    tool_use_result: { ok: true, value: 42 }
  },
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
    uuid: "quick-config-result-uuid",
    session_id: "quick-config-r2-session"
  }
] as const

let queryCalls = 0
let prompts: Array<unknown> = []

const makeSdkQuery = () => {
  async function* generator() {
    for (const message of sdkMessages) {
      yield message as never
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
  createSdkMcpServer: (_options: unknown) => ({}),
  tool: (name: string, description: string, inputSchema: unknown, handler: (args: unknown, extra: unknown) => Promise<unknown>) => ({ name, description, inputSchema, handler }),
  unstable_v2_createSession: () => ({
    sessionId: "mock-session",
    send: async () => {},
    stream: async function*() {},
    close: () => {},
    [Symbol.asyncDispose]: async () => {}
  }),
  unstable_v2_resumeSession: () => ({
    sessionId: "mock-session",
    send: async () => {},
    stream: async function*() {},
    close: () => {},
    [Symbol.asyncDispose]: async () => {}
  }),
  unstable_v2_prompt: async () => ({ type: "result", subtype: "success" })
}))

const quickConfigTypeAssertions = () => {
  // @ts-expect-error QuickConfig.sandbox does not allow bare "cloudflare".
  runtimeLayer({ apiKey: "test-key", persistence: "filesystem", sandbox: "cloudflare" })
}
void quickConfigTypeAssertions

test("runtimeLayer rejects kv+journaled profile", () => {
  expect(() =>
    runtimeLayer({
      apiKey: "test-key",
      persistence: "filesystem",
      storageBackend: "kv",
      storageMode: "journaled",
      allowUnsafeKv: true
    })
  ).toThrow("storageBackend 'kv' cannot be used with storageMode 'journaled'")
})

test("runtimeLayer rejects sync with kv backend", () => {
  expect(() =>
    runtimeLayer({
      apiKey: "test-key",
      persistence: { sync: "ws://localhost:8787" },
      storageBackend: "kv",
      allowUnsafeKv: true
    })
  ).toThrow("persistence.sync is not supported with storageBackend 'kv'")
})

test("runtimeLayer rejects sync with r2 backend", () => {
  expect(() =>
    runtimeLayer({
      apiKey: "test-key",
      persistence: { sync: "ws://localhost:8787" },
      storageBackend: "r2"
    })
  ).toThrow("persistence.sync is not supported with storageBackend 'r2'")
})

test("runtimeLayer rejects r2 backend without bindings", () => {
  expect(() =>
    runtimeLayer({
      apiKey: "test-key",
      persistence: "filesystem",
      storageBackend: "r2"
    })
  ).toThrow("backend 'r2' requires bindings.r2Bucket")
})

test("runtimeLayer rejects kv backend by default", () => {
  expect(() =>
    runtimeLayer({
      apiKey: "test-key",
      persistence: "filesystem",
      storageBackend: "kv"
    })
  ).toThrow("storageBackend 'kv' is disabled by default")
})

test("runtimeLayer rejects invalid tenant format", () => {
  expect(() =>
    runtimeLayer({
      apiKey: "test-key",
      persistence: "filesystem",
      tenant: "bad/tenant"
    })
  ).toThrow("invalid tenant format")
})

test("runtimeLayer rejects kv backend without bindings when unsafe override is enabled", () => {
  expect(() =>
    runtimeLayer({
      apiKey: "test-key",
      persistence: "filesystem",
      storageBackend: "kv",
      allowUnsafeKv: true
    })
  ).toThrow("backend 'kv' requires bindings.kvNamespace")
})

test("runtimeLayer accepts local sandbox profile", () => {
  const layer = runtimeLayer({
    apiKey: "test-key",
    persistence: "memory",
    sandbox: "local"
  })
  expect(layer).toBeDefined()
})

test("runtimeLayer local sandbox profile provides SandboxService", async () => {
  const layer = runtimeLayer({
    apiKey: "test-key",
    persistence: "memory",
    sandbox: "local"
  })

  const sandboxOption = await Effect.runPromise(
    Effect.scoped(
      Effect.serviceOption(Sandbox.SandboxService).pipe(
        Effect.provide(layer)
      )
    )
  )

  expect(Option.isSome(sandboxOption)).toBe(true)
  if (Option.isSome(sandboxOption)) {
    expect(sandboxOption.value.provider).toBe("local")
    expect(sandboxOption.value.isolated).toBe(false)
  }
})

test("runtimeLayer uses r2-backed stores when storageBackend is r2", async () => {
  queryCalls = 0
  prompts = []
  const map = new Map<string, string>()
  const layer = runtimeLayer({
    apiKey: "test-key",
    persistence: "filesystem",
    storageBackend: "r2",
    storageBindings: { r2Bucket: makeR2Bucket(map) }
  })

  await Effect.runPromise(
    Effect.scoped(
      Effect.gen(function*() {
        const runtime = yield* AgentRuntime
        const handle = yield* runtime.query("quick-config-r2-prompt")
        yield* Stream.runDrain(handle.stream)
      }).pipe(Effect.provide(layer))
    )
  )

  expect(queryCalls).toBe(1)
  expect(prompts).toEqual(["quick-config-r2-prompt"])
  const keys = Array.from(map.keys())
  expect(keys.some((key) => key.startsWith(defaultChatHistoryPrefix))).toBe(true)
  expect(keys.some((key) => key.startsWith(defaultArtifactPrefix))).toBe(true)
})

test("runtimeLayer scopes r2-backed stores by tenant when configured", async () => {
  queryCalls = 0
  prompts = []
  const map = new Map<string, string>()
  const tenant = "quick-config-tenant"
  const layer = runtimeLayer({
    apiKey: "test-key",
    persistence: "filesystem",
    storageBackend: "r2",
    storageBindings: { r2Bucket: makeR2Bucket(map) },
    tenant
  })

  await Effect.runPromise(
    Effect.scoped(
      Effect.gen(function*() {
        const runtime = yield* AgentRuntime
        const handle = yield* runtime.query("quick-config-r2-tenant-prompt")
        yield* Stream.runDrain(handle.stream)
      }).pipe(Effect.provide(layer))
    )
  )

  expect(queryCalls).toBe(1)
  expect(prompts).toEqual(["quick-config-r2-tenant-prompt"])
  const keys = Array.from(map.keys())
  expect(keys.some((key) => key.startsWith(`${defaultChatHistoryPrefix}/tenants/${tenant}`))).toBe(true)
  expect(keys.some((key) => key.startsWith(`${defaultArtifactPrefix}/tenants/${tenant}`))).toBe(true)
})

test("runtimeLayer ignores deployment profile env hints", () => {
  const originalSandboxProvider = process.env.SANDBOX_PROVIDER
  const originalStorageBackend = process.env.STORAGE_BACKEND
  const originalStorageMode = process.env.STORAGE_MODE

  process.env.SANDBOX_PROVIDER = "cloudflare"
  process.env.STORAGE_BACKEND = "kv"
  process.env.STORAGE_MODE = "journaled"

  try {
    const layer = runtimeLayer({
      apiKey: "test-key",
      persistence: "filesystem"
    })
    expect(layer).toBeDefined()
  } finally {
    if (originalSandboxProvider === undefined) {
      delete process.env.SANDBOX_PROVIDER
    } else {
      process.env.SANDBOX_PROVIDER = originalSandboxProvider
    }
    if (originalStorageBackend === undefined) {
      delete process.env.STORAGE_BACKEND
    } else {
      process.env.STORAGE_BACKEND = originalStorageBackend
    }
    if (originalStorageMode === undefined) {
      delete process.env.STORAGE_MODE
    } else {
      process.env.STORAGE_MODE = originalStorageMode
    }
  }
})

test("runtimeLayer exposes QuerySupervisor in output", async () => {
  const layer = runtimeLayer({
    apiKey: "test-key",
    persistence: "memory"
  })

  const stats = await Effect.runPromise(
    Effect.scoped(
      Effect.gen(function*() {
        const supervisor = yield* QuerySupervisor
        return yield* supervisor.stats
      }).pipe(Effect.provide(layer))
    )
  )

  expect(stats.concurrencyLimit).toBe(4)
})

test("runtimeLayer forwards supervisor config", async () => {
  const layer = runtimeLayer({
    apiKey: "test-key",
    persistence: "memory",
    supervisor: { emitEvents: true, pendingQueueCapacity: 16 }
  })

  const stats = await Effect.runPromise(
    Effect.scoped(
      Effect.gen(function*() {
        const supervisor = yield* QuerySupervisor
        return yield* supervisor.stats
      }).pipe(Effect.provide(layer))
    )
  )

  expect(stats.pendingQueueCapacity).toBe(16)
})

test("managedRuntime creates a lifecycle-managed runtime", async () => {
  const rt = managedRuntime({
    apiKey: "test-key",
    persistence: "memory"
  })

  try {
    const stats = await rt.runPromise(
      Effect.gen(function*() {
        const supervisor = yield* QuerySupervisor
        return yield* supervisor.stats
      })
    )
    expect(stats.concurrencyLimit).toBe(4)
  } finally {
    await rt.dispose()
  }
})

test("managedRuntime local sandbox profile executes queries and exposes SandboxService", async () => {
  queryCalls = 0
  prompts = []
  const rt = managedRuntime({
    apiKey: "test-key",
    persistence: "memory",
    sandbox: "local"
  })

  try {
    const sandbox = await rt.runPromise(
      Effect.scoped(
        Effect.gen(function*() {
          const sandbox = yield* Sandbox.SandboxService
          const runtime = yield* AgentRuntime
          const handle = yield* runtime.query("quick-config-local-prompt")
          yield* Stream.runDrain(handle.stream)
          return sandbox
        })
      )
    )

    expect(sandbox.provider).toBe("local")
    expect(sandbox.isolated).toBe(false)
    expect(queryCalls).toBe(1)
    expect(prompts).toEqual(["quick-config-local-prompt"])
  } finally {
    await rt.dispose()
  }
})
