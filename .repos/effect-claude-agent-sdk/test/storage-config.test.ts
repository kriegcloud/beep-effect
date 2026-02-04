import { test, expect } from "bun:test"
import * as ConfigProvider from "effect/ConfigProvider"
import * as Duration from "effect/Duration"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import { Storage } from "../src/index.js"
import { runEffect } from "./effect-test.js"

const configLayer = (entries: Record<string, string>) =>
  Layer.setConfigProvider(
    ConfigProvider.fromMap(new Map(Object.entries(entries)))
  )

test("StorageConfig reads overrides from config provider", async () => {
  const layer = Storage.StorageConfig.layer.pipe(
    Layer.provide(
      configLayer({
        STORAGE_CHAT_ENABLED: "false",
        STORAGE_ARTIFACTS_ENABLED: "true",
        STORAGE_AUDIT_ENABLED: "true",
        STORAGE_CHAT_MAX_EVENTS: "42",
        STORAGE_CHAT_MAX_AGE: "2 days",
        STORAGE_ARTIFACT_MAX_COUNT: "3",
        STORAGE_ARTIFACT_MAX_BYTES: "1024",
        STORAGE_ARTIFACT_MAX_AGE: "1 day",
        STORAGE_AUDIT_MAX_ENTRIES: "7",
        STORAGE_AUDIT_MAX_AGE: "3 days",
        STORAGE_CHAT_PAGE_SIZE: "5",
        STORAGE_ARTIFACT_PAGE_SIZE: "6",
        STORAGE_INDEX_PAGE_SIZE: "9",
        STORAGE_CLEANUP_ENABLED: "false",
        STORAGE_CLEANUP_INTERVAL: "10 minutes",
        STORAGE_CLEANUP_RUN_ON_START: "true",
        STORAGE_SYNC_INTERVAL: "2 minutes"
      })
    )
  )

  const program = Effect.gen(function*() {
    const config = yield* Storage.StorageConfig
    return config.settings
  }).pipe(Effect.provide(layer))

  const settings = await runEffect(program)
  expect(settings.enabled.chatHistory).toBe(false)
  expect(settings.enabled.artifacts).toBe(true)
  expect(settings.enabled.auditLog).toBe(true)
  expect(settings.retention.chat.maxEvents).toBe(42)
  expect(Duration.toMillis(settings.retention.chat.maxAge)).toBe(2 * 24 * 60 * 60 * 1000)
  expect(settings.retention.artifacts.maxArtifacts).toBe(3)
  expect(settings.retention.artifacts.maxArtifactBytes).toBe(1024)
  expect(Duration.toMillis(settings.retention.artifacts.maxAge)).toBe(24 * 60 * 60 * 1000)
  expect(settings.retention.audit.maxEntries).toBe(7)
  expect(Duration.toMillis(settings.retention.audit.maxAge)).toBe(3 * 24 * 60 * 60 * 1000)
  expect(settings.pagination.chatPageSize).toBe(5)
  expect(settings.pagination.artifactPageSize).toBe(6)
  expect(settings.kv.indexPageSize).toBe(9)
  expect(settings.cleanup.enabled).toBe(false)
  expect(Duration.toMillis(settings.cleanup.interval)).toBe(10 * 60 * 1000)
  expect(settings.cleanup.runOnStart).toBe(true)
  expect(Duration.toMillis(settings.sync.interval)).toBe(2 * 60 * 1000)
})
