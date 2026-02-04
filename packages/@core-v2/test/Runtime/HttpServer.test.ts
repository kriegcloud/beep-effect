/**
 * Tests for HTTP Server Routes
 *
 * @module test/Runtime/HttpServer
 */

import { describe, expect, it } from "@effect/vitest"
import { ConfigProvider, Effect, Layer, Option } from "effect"
import { HealthCheckService } from "../../src/Runtime/HealthCheck.js"
import { ExtractionRouter } from "../../src/Runtime/HttpServer.js"
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

describe("ExtractionRouter", () => {
  it("exports router with health routes", () => {
    // Router should be defined
    expect(ExtractionRouter).toBeDefined()
  })
})

describe("Health Routes Integration", () => {
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

  it.effect("health service integration works", () =>
    Effect.gen(function*() {
      const health = yield* HealthCheckService

      // Liveness should always work
      const liveness = yield* health.liveness()
      expect(liveness.status).toBe("ok")

      // Readiness checks dependencies
      const readiness = yield* health.readiness()
      expect(readiness.status).toBe("ok")
      expect(readiness.checks?.config).toBe("ok")
    }).pipe(Effect.provide(TestLayers)))
})
