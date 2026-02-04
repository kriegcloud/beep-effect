import { expect, test } from "bun:test"
import * as ConfigProvider from "effect/ConfigProvider"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import { SessionConfig } from "../src/SessionConfig.js"
import { runEffect } from "./effect-test.js"

const configLayer = (entries: Record<string, string>) =>
  Layer.setConfigProvider(
    ConfigProvider.fromMap(new Map(Object.entries(entries)))
  )

test("SessionConfig reads defaults from config provider", async () => {
  const layer = SessionConfig.layer.pipe(
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

  const program = Effect.gen(function*() {
    const config = yield* SessionConfig
    return config
  }).pipe(Effect.provide(layer))

  const config = await runEffect(program)
  expect(config.defaults.executable).toBe("node")
  expect(config.defaults.pathToClaudeCodeExecutable).toBe("/tmp/claude")
  expect(config.defaults.executableArgs).toEqual(["--inspect", "--no-warnings"])
  expect(config.defaults.permissionMode).toBe("plan")
  expect(config.defaults.allowedTools).toEqual(["Read", "Edit"])
  expect(config.defaults.disallowedTools).toEqual(["Bash"])
  expect(config.defaults.env?.ANTHROPIC_API_KEY).toBe("test-key")
  expect("model" in (config.defaults as Record<string, unknown>)).toBe(false)
})

test("SessionConfig defaults executable to bun", async () => {
  const layer = SessionConfig.layer.pipe(
    Layer.provide(
      configLayer({})
    )
  )

  const program = Effect.gen(function*() {
    const config = yield* SessionConfig
    return config
  }).pipe(Effect.provide(layer))

  const config = await runEffect(program)
  expect(config.defaults.executable).toBe("bun")
})

test("SessionConfig uses API_KEY fallback for env injection", async () => {
  const layer = SessionConfig.layer.pipe(
    Layer.provide(
      configLayer({
        API_KEY: "fallback-key"
      })
    )
  )

  const program = Effect.gen(function*() {
    const config = yield* SessionConfig
    return config
  }).pipe(Effect.provide(layer))

  const config = await runEffect(program)
  expect(config.defaults.env?.ANTHROPIC_API_KEY).toBe("fallback-key")
})
