import { expect, test } from "bun:test"
import * as ConfigProvider from "effect/ConfigProvider"
import * as Duration from "effect/Duration"
import * as Effect from "effect/Effect"
import * as Either from "effect/Either"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"
import { AgentRuntimeConfig } from "../src/AgentRuntimeConfig.js"
import { AgentSdkConfig } from "../src/AgentSdkConfig.js"
import { QuerySupervisorConfig } from "../src/QuerySupervisorConfig.js"
import { runEffect } from "./effect-test.js"

const configLayer = (entries: Record<string, string>) =>
  Layer.setConfigProvider(
    ConfigProvider.fromMap(new Map(Object.entries(entries)))
  )

test("AgentSdkConfig reads options from config provider", async () => {
  const layer = AgentSdkConfig.layer.pipe(
    Layer.provide(
      configLayer({
        ANTHROPIC_API_KEY: "test-key",
        MODEL: "claude-test",
        SETTING_SOURCES: "project,local",
        EXECUTABLE: "bun",
        PERMISSION_MODE: "plan"
      })
    )
  )

  const program = Effect.gen(function*() {
    const config = yield* AgentSdkConfig
    return config.options
  }).pipe(Effect.provide(layer))

  const options = await runEffect(program)
  expect(options.model).toBe("claude-test")
  expect(options.settingSources).toEqual(["project", "local"])
  expect(options.env?.ANTHROPIC_API_KEY).toBe("test-key")
  expect(options.executable).toBe("bun")
  expect(options.permissionMode).toBe("plan")
})

test("AgentSdkConfig reads sandbox settings from config provider", async () => {
  const layer = AgentSdkConfig.layer.pipe(
    Layer.provide(
      configLayer({
        ANTHROPIC_API_KEY: "test-key",
        SANDBOX_ENABLED: "true",
        SANDBOX_AUTO_ALLOW_BASH_IF_SANDBOXED: "true",
        SANDBOX_ALLOW_UNSANDBOXED_COMMANDS: "false",
        SANDBOX_ENABLE_WEAKER_NESTED_SANDBOX: "true",
        SANDBOX_EXCLUDED_COMMANDS: "rm, shutdown",
        SANDBOX_NETWORK_ALLOWED_DOMAINS: "example.com, api.example.com",
        SANDBOX_NETWORK_ALLOW_UNIX_SOCKETS: "/tmp/socket1,/tmp/socket2",
        SANDBOX_NETWORK_ALLOW_ALL_UNIX_SOCKETS: "false",
        SANDBOX_NETWORK_ALLOW_LOCAL_BINDING: "true",
        SANDBOX_NETWORK_HTTP_PROXY_PORT: "8080",
        SANDBOX_NETWORK_SOCKS_PROXY_PORT: "1080",
        SANDBOX_RIPGREP_COMMAND: "rg",
        SANDBOX_RIPGREP_ARGS: "--hidden,--glob,!node_modules",
        SANDBOX_IGNORE_VIOLATIONS:
          "{\"rg\":[\"line-too-long\"],\"bash\":[\"unsafe-flag\"]}"
      })
    )
  )

  const program = Effect.gen(function*() {
    const config = yield* AgentSdkConfig
    return config.options
  }).pipe(Effect.provide(layer))

  const options = await runEffect(program)
  expect(options.sandbox?.enabled).toBe(true)
  expect(options.sandbox?.autoAllowBashIfSandboxed).toBe(true)
  expect(options.sandbox?.allowUnsandboxedCommands).toBe(false)
  expect(options.sandbox?.enableWeakerNestedSandbox).toBe(true)
  expect(options.sandbox?.excludedCommands).toEqual(["rm", "shutdown"])
  expect(options.sandbox?.network?.allowedDomains).toEqual([
    "example.com",
    "api.example.com"
  ])
  expect(options.sandbox?.network?.allowUnixSockets).toEqual([
    "/tmp/socket1",
    "/tmp/socket2"
  ])
  expect(options.sandbox?.network?.allowAllUnixSockets).toBe(false)
  expect(options.sandbox?.network?.allowLocalBinding).toBe(true)
  expect(options.sandbox?.network?.httpProxyPort).toBe(8080)
  expect(options.sandbox?.network?.socksProxyPort).toBe(1080)
  expect(options.sandbox?.ripgrep?.command).toBe("rg")
  expect(options.sandbox?.ripgrep?.args).toEqual([
    "--hidden",
    "--glob",
    "!node_modules"
  ])
  expect(options.sandbox?.ignoreViolations).toEqual({
    rg: ["line-too-long"],
    bash: ["unsafe-flag"]
  })
})

test("AgentSdkConfig reads deployment profile hints", async () => {
  const layer = AgentSdkConfig.layer.pipe(
    Layer.provide(
      configLayer({
        ANTHROPIC_API_KEY: "test-key",
        SANDBOX_PROVIDER: "cloudflare",
        SANDBOX_ID: "sandbox-123",
        SANDBOX_SLEEP_AFTER: "15m",
        STORAGE_BACKEND: "r2",
        STORAGE_MODE: "journaled",
        R2_BUCKET_BINDING: "ARTIFACTS_BUCKET",
        KV_NAMESPACE_BINDING: "SESSIONS_KV"
      })
    )
  )

  const program = AgentSdkConfig.pipe(Effect.provide(layer))

  const config = await runEffect(program)
  expect(config.sandboxProvider).toEqual(Option.some("cloudflare"))
  expect(config.sandboxId).toEqual(Option.some("sandbox-123"))
  expect(config.sandboxSleepAfter).toEqual(Option.some("15m"))
  expect(config.storageBackend).toEqual(Option.some("r2"))
  expect(config.storageMode).toEqual(Option.some("journaled"))
  expect(config.r2BucketBinding).toEqual(Option.some("ARTIFACTS_BUCKET"))
  expect(config.kvNamespaceBinding).toEqual(Option.some("SESSIONS_KV"))
})

test("AgentSdkConfig rejects invalid setting sources", async () => {
  const layer = AgentSdkConfig.layer.pipe(
    Layer.provide(
      configLayer({
        ANTHROPIC_API_KEY: "test-key",
        SETTING_SOURCES: "project,banana"
      })
    )
  )

  const program = AgentSdkConfig.pipe(Effect.provide(layer))

  const result = await runEffect(Effect.either(program))
  expect(Either.isLeft(result)).toBe(true)
  if (Either.isLeft(result)) {
    expect(result.left._tag).toBe("ConfigError")
  }
})

test("AgentSdkConfig fails fast when credentials are missing", async () => {
  const layer = AgentSdkConfig.layer.pipe(
    Layer.provide(configLayer({}))
  )

  const program = AgentSdkConfig.pipe(Effect.provide(layer))

  const result = await runEffect(Effect.either(program))
  expect(Either.isLeft(result)).toBe(true)
  if (Either.isLeft(result)) {
    expect(result.left._tag).toBe("ConfigError")
    expect(result.left.message).toContain("Missing API credentials")
    expect(result.left.message).toContain("ANTHROPIC_API_KEY")
    expect(result.left.message).toContain("CLAUDE_CODE_SESSION_ACCESS_TOKEN")
  }
})

test("AgentRuntimeConfig bounds retry settings and parses durations", async () => {
  const layer = AgentRuntimeConfig.layer.pipe(
    Layer.provide(
      configLayer({
        QUERY_TIMEOUT: "5 seconds",
        FIRST_MESSAGE_TIMEOUT: "2 seconds",
        RETRY_MAX_RETRIES: "-3",
        RETRY_BASE_DELAY: "250 millis"
      })
    )
  )

  const program = Effect.gen(function*() {
    const config = yield* AgentRuntimeConfig
    return config.settings
  }).pipe(Effect.provide(layer))

  const settings = await runEffect(program)
  expect(Duration.toMillis(settings.queryTimeout!)).toBe(5000)
  expect(Duration.toMillis(settings.firstMessageTimeout!)).toBe(2000)
  expect(settings.retryMaxRetries).toBe(0)
  expect(Duration.toMillis(settings.retryBaseDelay)).toBe(250)
})

test("QuerySupervisorConfig enforces minimums", async () => {
  const layer = QuerySupervisorConfig.layer.pipe(
    Layer.provide(
      configLayer({
        CONCURRENCY_LIMIT: "0",
        PENDING_QUEUE_CAPACITY: "-1",
        PENDING_QUEUE_STRATEGY: "dropping",
        MAX_PENDING_TIME: "5 seconds",
        EMIT_EVENTS: "true",
        EVENT_BUFFER_CAPACITY: "0",
        EVENT_BUFFER_STRATEGY: "sliding",
        METRICS_ENABLED: "true",
        TRACING_ENABLED: "true"
      })
    )
  )

  const program = Effect.gen(function*() {
    const config = yield* QuerySupervisorConfig
    return config.settings
  }).pipe(Effect.provide(layer))

  const settings = await runEffect(program)
  expect(settings.concurrencyLimit).toBe(1)
  expect(settings.pendingQueueCapacity).toBe(0)
  expect(settings.pendingQueueStrategy).toBe("dropping")
  expect(Duration.toMillis(settings.maxPendingTime!)).toBe(5000)
  expect(settings.emitEvents).toBe(true)
  expect(settings.eventBufferCapacity).toBe(1)
  expect(settings.eventBufferStrategy).toBe("sliding")
  expect(settings.metricsEnabled).toBe(true)
  expect(settings.tracingEnabled).toBe(true)
})
