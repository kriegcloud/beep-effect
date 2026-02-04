/**
 * Tests for HealthCheckService
 *
 * @module test/Runtime/HealthCheck
 */

import { describe, expect, it } from "@effect/vitest"
import { ConfigProvider, Effect, Layer, Option } from "effect"
import { HealthCheckService } from "../../src/Runtime/HealthCheck.js"
import { ConfigServiceDefault } from "../../src/Service/Config.js"
import { StorageService } from "../../src/Service/Storage.js"

// Mock StorageService that returns test data for ontology file
const MockStorageService = Layer.succeed(StorageService, {
  get: (key: string) => {
    if (key.endsWith(".ttl") || key === "/tmp/test.ttl") {
      return Effect.succeed(Option.some("# Test ontology content"))
    }
    return Effect.succeed(Option.none())
  },
  put: () => Effect.succeed(undefined),
  delete: () => Effect.succeed(undefined),
  list: () => Effect.succeed([]),
  exists: (key: string) => {
    if (key.endsWith(".ttl") || key === "/tmp/test.ttl") {
      return Effect.succeed(true)
    }
    return Effect.succeed(false)
  }
} as unknown as StorageService)

describe("HealthCheckService", () => {
  const TestConfigProvider = ConfigProvider.fromMap(
    new Map([
      ["ONTOLOGY_PATH", "/tmp/test.ttl"],
      ["LLM_API_KEY", "test-key"]
    ]),
    { pathDelim: "_" }
  )

  const TestLayers = HealthCheckService.Default.pipe(
    Layer.provideMerge(MockStorageService),
    Layer.provideMerge(ConfigServiceDefault),
    Layer.provideMerge(Layer.setConfigProvider(TestConfigProvider))
  )

  it.effect("liveness returns ok", () =>
    Effect.gen(function*() {
      const health = yield* HealthCheckService
      const result = yield* health.liveness()

      expect(result.status).toBe("ok")
    }).pipe(Effect.provide(TestLayers)))

  it.effect("readiness checks config", () =>
    Effect.gen(function*() {
      const health = yield* HealthCheckService
      const result = yield* health.readiness()

      expect(result.status).toBe("ok")
      expect(result.checks?.config).toBe("ok")
    }).pipe(Effect.provide(TestLayers)))

  it.effect("deepCheck verifies all dependencies", () =>
    Effect.gen(function*() {
      const health = yield* HealthCheckService
      const result = yield* health.deepCheck()

      expect(result.status).toBe("ok")
      expect(result.checks).toBeDefined()
    }).pipe(Effect.provide(TestLayers)))
})
