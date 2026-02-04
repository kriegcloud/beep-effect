/**
 * Tests for ConfigService
 *
 * @module test/Service/Config
 */

import { describe, expect, it } from "@effect/vitest"
import { ConfigProvider, Effect, Layer } from "effect"
import { ConfigService, ConfigServiceDefault } from "../../src/Service/Config.js"

describe("ConfigService", () => {
  const TestConfigProvider = ConfigProvider.fromMap(
    new Map([
      ["ONTOLOGY_PATH", "/data/test-ontology.ttl"],
      ["LLM_PROVIDER", "anthropic"],
      ["LLM_MODEL", "claude-haiku-4-5"],
      ["LLM_API_KEY", "test-key-for-testing"],
      ["RUNTIME_CONCURRENCY", "4"],
      ["RUNTIME_ENABLE_TRACING", "false"]
    ]),
    { pathDelim: "_" }
  )

  it.effect("loads config from environment", () =>
    Effect.gen(function*() {
      const config = yield* ConfigService

      expect(config.ontology.path).toBe("/data/test-ontology.ttl")
      expect(config.llm.provider).toBe("anthropic")
      expect(config.llm.model).toBe("claude-haiku-4-5")
      expect(config.runtime.concurrency).toBe(4)
    }).pipe(
      Effect.provide(ConfigServiceDefault),
      Effect.provide(Layer.setConfigProvider(TestConfigProvider))
    ))

  it.effect("uses defaults when env vars missing", () =>
    Effect.gen(function*() {
      const config = yield* ConfigService

      // Defaults from Config definitions
      expect(config.llm.timeoutMs).toBe(60_000)
      expect(config.llm.maxTokens).toBe(4096)
    }).pipe(
      Effect.provide(ConfigServiceDefault),
      Effect.provide(Layer.setConfigProvider(ConfigProvider.fromMap(
        new Map([
          // Required fields with no defaults
          ["ONTOLOGY_PATH", "test.ttl"],
          ["LLM_API_KEY", "test-key"]
        ]),
        { pathDelim: "_" }
      )))
    ))
})
