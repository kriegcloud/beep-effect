import { expect, mock, test } from "bun:test"
import * as ConfigProvider from "effect/ConfigProvider"
import * as Effect from "effect/Effect"
import * as Either from "effect/Either"
import * as Layer from "effect/Layer"
import { runEffect } from "./effect-test.js"

let createOptions: unknown
let resumeOptions: unknown
let resumeSessionId: string | undefined
let promptOptions: unknown
let promptMessage: string | undefined

const makeSession = (sessionId = "session-1") => ({
  get sessionId() {
    return sessionId
  },
  send: async () => {},
  stream: async function*() {},
  close: () => {},
  [Symbol.asyncDispose]: async () => {}
})

mock.module("@anthropic-ai/claude-agent-sdk", () => ({
  unstable_v2_createSession: (options: unknown) => {
    createOptions = options
    return makeSession()
  },
  unstable_v2_resumeSession: (sessionId: string, options: unknown) => {
    resumeSessionId = sessionId
    resumeOptions = options
    return makeSession(sessionId)
  },
  unstable_v2_prompt: async (message: string, options: unknown) => {
    promptMessage = message
    promptOptions = options
    return { type: "result", subtype: "success" }
  }
}))

const configLayer = (entries: Record<string, string>) =>
  Layer.setConfigProvider(
    ConfigProvider.fromMap(new Map(Object.entries(entries)))
  )

test("SessionManager.create merges defaults and overrides", async () => {
  createOptions = undefined
  resumeOptions = undefined
  resumeSessionId = undefined
  promptOptions = undefined
  promptMessage = undefined

  const { SessionManager } = await import("../src/SessionManager.js")
  const { SessionConfig } = await import("../src/SessionConfig.js")

  const layer = SessionManager.layer.pipe(
    Layer.provide(
      SessionConfig.layer.pipe(
        Layer.provide(
          configLayer({
            ANTHROPIC_API_KEY: "test-key",
            EXECUTABLE: "node",
            PATH_TO_CLAUDE_CODE_EXECUTABLE: "/tmp/claude",
            EXECUTABLE_ARGS: "--inspect, --no-warnings",
            PERMISSION_MODE: "plan",
            ALLOWED_TOOLS: "Read,Edit",
            DISALLOWED_TOOLS: "Bash"
          })
        )
      )
    )
  )

  const program = Effect.scoped(
    Effect.gen(function*() {
      const manager = yield* SessionManager
      const handle = yield* manager.create({
        model: "claude-test",
        allowedTools: ["Override"]
      })
      return yield* handle.sessionId
    }).pipe(Effect.provide(layer))
  )

  const sessionId = await runEffect(program)
  expect(sessionId).toBe("session-1")
  expect((createOptions as { executable?: string })?.executable).toBe("node")
  expect((createOptions as { pathToClaudeCodeExecutable?: string })?.pathToClaudeCodeExecutable)
    .toBe("/tmp/claude")
  expect((createOptions as { executableArgs?: string[] })?.executableArgs)
    .toEqual(["--inspect", "--no-warnings"])
  expect((createOptions as { permissionMode?: string })?.permissionMode).toBe("plan")
  expect((createOptions as { allowedTools?: string[] })?.allowedTools).toEqual(["Override"])
  expect((createOptions as { disallowedTools?: string[] })?.disallowedTools).toEqual(["Bash"])
  expect((createOptions as { env?: Record<string, string> })?.env?.ANTHROPIC_API_KEY)
    .toBe("test-key")
})

test("SessionManager.resume merges defaults and overrides", async () => {
  resumeOptions = undefined
  resumeSessionId = undefined

  const { SessionManager } = await import("../src/SessionManager.js")
  const { SessionConfig } = await import("../src/SessionConfig.js")

  const layer = SessionManager.layer.pipe(
    Layer.provide(
      SessionConfig.layer.pipe(
        Layer.provide(
          configLayer({
            ANTHROPIC_API_KEY: "test-key",
            EXECUTABLE: "node",
            DISALLOWED_TOOLS: "Bash"
          })
        )
      )
    )
  )

  const program = Effect.scoped(
    Effect.gen(function*() {
      const manager = yield* SessionManager
      const handle = yield* manager.resume("session-99", {
        model: "claude-test",
        disallowedTools: ["Override"]
      })
      return yield* handle.sessionId
    }).pipe(Effect.provide(layer))
  )

  const sessionId = await runEffect(program)
  expect(sessionId).toBe("session-99")
  const capturedSessionId = resumeSessionId
  if (capturedSessionId === undefined) {
    throw new Error("resumeSessionId was not captured")
  }
  expect(String(capturedSessionId)).toBe("session-99")
  expect((resumeOptions as { executable?: string })?.executable).toBe("node")
  expect((resumeOptions as { disallowedTools?: string[] })?.disallowedTools)
    .toEqual(["Override"])
})

test("SessionManager.prompt merges defaults and overrides", async () => {
  promptOptions = undefined
  promptMessage = undefined

  const { SessionManager } = await import("../src/SessionManager.js")
  const { SessionConfig } = await import("../src/SessionConfig.js")

  const layer = SessionManager.layer.pipe(
    Layer.provide(
      SessionConfig.layer.pipe(
        Layer.provide(
          configLayer({
            ANTHROPIC_API_KEY: "test-key",
            EXECUTABLE: "node",
            PERMISSION_MODE: "plan"
          })
        )
      )
    )
  )

  const program = Effect.gen(function*() {
    const manager = yield* SessionManager
    return yield* manager.prompt("hello", {
      model: "claude-test",
      permissionMode: "dontAsk"
    })
  }).pipe(Effect.provide(layer))

  await runEffect(program)
  const capturedMessage = promptMessage
  if (capturedMessage === undefined) {
    throw new Error("promptMessage was not captured")
  }
  expect(String(capturedMessage)).toBe("hello")
  expect((promptOptions as { executable?: string })?.executable).toBe("node")
  expect((promptOptions as { permissionMode?: string })?.permissionMode).toBe("dontAsk")
})

test("SessionManager.create fails when model is missing", async () => {
  const { SessionManager } = await import("../src/SessionManager.js")
  const { SessionConfig } = await import("../src/SessionConfig.js")

  const layer = SessionManager.layer.pipe(
    Layer.provide(
      SessionConfig.layer.pipe(
        Layer.provide(
          configLayer({
            ANTHROPIC_API_KEY: "test-key"
          })
        )
      )
    )
  )

  const program = Effect.scoped(
    Effect.gen(function*() {
      const manager = yield* SessionManager
      return yield* manager.create({} as any)
    }).pipe(Effect.provide(layer))
  )

  const result = await runEffect(Effect.either(program))
  expect(Either.isLeft(result)).toBe(true)
  if (Either.isLeft(result)) {
    expect(result.left._tag).toBe("ConfigError")
  }
})
