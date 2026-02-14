import { test, expect, mock } from "bun:test"
import * as Effect from "effect/Effect"
import * as Either from "effect/Either"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"
import * as Stream from "effect/Stream"
import { runEffect } from "./effect-test.js"

const makeSdkQuery = (prompt: unknown) => {
  async function* generator() {
    if (typeof prompt === "string") {
      return
    }
    for await (const message of prompt as AsyncIterable<unknown>) {
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
  query: ({ prompt }: { prompt: unknown }) => makeSdkQuery(prompt),
  createSdkMcpServer: (_options: unknown) => ({})
}))

test("AgentSdk.query surfaces failures from streaming prompt", async () => {
  const { AgentSdk } = await import("../src/AgentSdk.js")
  const { AgentSdkConfig } = await import("../src/AgentSdkConfig.js")

  async function* failingPrompt() {
    throw new Error("boom")
  }

  const layer = AgentSdk.layer.pipe(
    Layer.provide(
      Layer.succeed(
        AgentSdkConfig,
        AgentSdkConfig.make({
          options: {},
          sandboxProvider: Option.some("local"),
          sandboxId: Option.none(),
          sandboxSleepAfter: Option.none(),
          storageBackend: Option.some("bun"),
          storageMode: Option.some("standard"),
          r2BucketBinding: Option.some("BUCKET"),
          kvNamespaceBinding: Option.some("KV")
        })
      )
    )
  )

  const program = Effect.scoped(
    Effect.gen(function*() {
      const sdk = yield* AgentSdk
      const handle = yield* sdk.query(failingPrompt())
      return yield* Effect.either(Stream.runCollect(handle.stream))
    }).pipe(Effect.provide(layer))
  )

  const result = await runEffect(program)
  expect(Either.isLeft(result)).toBe(true)
  if (Either.isLeft(result)) {
    expect(result.left._tag).toBe("TransportError")
    expect(result.left.message).toBe("Input stream failed")
  }
})

test("AgentSdk.query closeInput does not fail output stream", async () => {
  const { AgentSdk } = await import("../src/AgentSdk.js")
  const { AgentSdkConfig } = await import("../src/AgentSdkConfig.js")

  async function* emptyPrompt() {
    return
  }

  const layer = AgentSdk.layer.pipe(
    Layer.provide(
      Layer.succeed(
        AgentSdkConfig,
        AgentSdkConfig.make({
          options: {},
          sandboxProvider: Option.some("local"),
          sandboxId: Option.none(),
          sandboxSleepAfter: Option.none(),
          storageBackend: Option.some("bun"),
          storageMode: Option.some("standard"),
          r2BucketBinding: Option.some("BUCKET"),
          kvNamespaceBinding: Option.some("KV")
        })
      )
    )
  )

  const program = Effect.scoped(
    Effect.gen(function*() {
      const sdk = yield* AgentSdk
      const handle = yield* sdk.query(emptyPrompt())
      yield* handle.closeInput
      return yield* Effect.either(Stream.runCollect(handle.stream))
    }).pipe(Effect.provide(layer))
  )

  const result = await runEffect(program)
  expect(Either.isRight(result)).toBe(true)
})
