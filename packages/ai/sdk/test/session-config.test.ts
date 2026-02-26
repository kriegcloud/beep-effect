import { expect, test } from "bun:test"
import * as ConfigProvider from "effect/ConfigProvider"
import * as Duration from "effect/Duration"
import * as Effect from "effect/Effect"
import * as Either from "effect/Either"
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
  expect(Duration.toMillis(Duration.decode(config.runtime.closeDrainTimeout))).toBe(15_000)
  expect(config.runtime.turnSendTimeout).toBeUndefined()
  expect(config.runtime.turnResultTimeout).toBeUndefined()
  expect("model" in (config.defaults as Record<string, unknown>)).toBe(false)
})

test("SessionConfig defaults executable to bun", async () => {
  const layer = SessionConfig.layer.pipe(
    Layer.provide(
      configLayer({
        ANTHROPIC_API_KEY: "test-key"
      })
    )
  )

  const program = Effect.gen(function*() {
    const config = yield* SessionConfig
    return config
  }).pipe(Effect.provide(layer))

  const config = await runEffect(program)
  expect(config.defaults.executable).toBe("bun")
  expect(Duration.toMillis(Duration.decode(config.runtime.closeDrainTimeout))).toBe(15_000)
  expect(config.runtime.turnSendTimeout).toBeUndefined()
  expect(config.runtime.turnResultTimeout).toBeUndefined()
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
  expect(Duration.toMillis(Duration.decode(config.runtime.closeDrainTimeout))).toBe(15_000)
  expect(config.runtime.turnSendTimeout).toBeUndefined()
  expect(config.runtime.turnResultTimeout).toBeUndefined()
})

test("SessionConfig reads CLOSE_DRAIN_TIMEOUT override", async () => {
  const layer = SessionConfig.layer.pipe(
    Layer.provide(
      configLayer({
        ANTHROPIC_API_KEY: "test-key",
        CLOSE_DRAIN_TIMEOUT: "45 seconds"
      })
    )
  )

  const program = Effect.gen(function*() {
    const config = yield* SessionConfig
    return config
  }).pipe(Effect.provide(layer))

  const config = await runEffect(program)
  expect(Duration.toMillis(Duration.decode(config.runtime.closeDrainTimeout))).toBe(45_000)
  expect(config.runtime.turnSendTimeout).toBeUndefined()
  expect(config.runtime.turnResultTimeout).toBeUndefined()
})

test("SessionConfig reads turn timeout overrides", async () => {
  const layer = SessionConfig.layer.pipe(
    Layer.provide(
      configLayer({
        ANTHROPIC_API_KEY: "test-key",
        TURN_SEND_TIMEOUT: "12 seconds",
        TURN_RESULT_TIMEOUT: "90 seconds"
      })
    )
  )

  const program = Effect.gen(function*() {
    const config = yield* SessionConfig
    return config
  }).pipe(Effect.provide(layer))

  const config = await runEffect(program)
  expect(Duration.toMillis(Duration.decode(config.runtime.turnSendTimeout!))).toBe(12_000)
  expect(Duration.toMillis(Duration.decode(config.runtime.turnResultTimeout!))).toBe(90_000)
})

test("SessionConfig fails fast when credentials are missing", async () => {
  const layer = SessionConfig.layer.pipe(
    Layer.provide(configLayer({}))
  )

  const program = SessionConfig.pipe(Effect.provide(layer))

  const result = await runEffect(Effect.either(program))
  expect(Either.isLeft(result)).toBe(true)
  if (Either.isLeft(result)) {
    expect(result.left._tag).toBe("ConfigError")
    expect(result.left.message).toContain("Missing API credentials")
    expect(result.left.message).toContain("ANTHROPIC_API_KEY")
    expect(result.left.message).toContain("CLAUDE_CODE_SESSION_ACCESS_TOKEN")
  }
})
