import { expect, mock, test } from "bun:test"
import * as Effect from "effect/Effect"
import { runEffect } from "./effect-test.js"

let closeCalls = 0

mock.module("@anthropic-ai/claude-agent-sdk", () => ({
  createSdkMcpServer: (options: { name: string }) => ({
    type: "sdk",
    name: options.name,
    instance: {
      close: async () => {
        closeCalls += 1
      }
    }
  }),
  tool: () => ({})
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
