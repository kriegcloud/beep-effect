import { expect, mock, test } from "bun:test"
import * as Effect from "effect/Effect"
import { runEffect } from "./effect-test.js"

let closeCalls = 0

mock.module("@anthropic-ai/claude-agent-sdk", () => ({
  query: () => {
    async function* generator() {
      return
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
  },
  createSdkMcpServer: (options: { name: string }) => ({
    type: "sdk",
    name: options.name,
    instance: {
      close: async () => {
        closeCalls += 1
      }
    }
  }),
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

test("Mcp.createSdkMcpServerScoped closes server on scope exit", async () => {
  closeCalls = 0
  const { createSdkMcpServerScoped } = await import("../src/Mcp/index.js")

  const program = Effect.scoped(
    Effect.gen(function*() {
      const server = yield* createSdkMcpServerScoped({ name: "test" })
      expect(server.name).toBe("test")
    })
  )

  await runEffect(program)
  expect(closeCalls).toBe(1)
})
