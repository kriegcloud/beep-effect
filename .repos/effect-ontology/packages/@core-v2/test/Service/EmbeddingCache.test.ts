/**
 * Tests for EmbeddingCache Service
 *
 * @since 2.0.0
 * @module test/Service/EmbeddingCache
 */

import { Effect, Option, TestClock, TestContext } from "effect"
import { describe, expect, it } from "vitest"
import { EmbeddingCache, EmbeddingCacheTest } from "../../src/Service/EmbeddingCache.js"

describe("EmbeddingCache", () => {
  describe("Default (in-memory)", () => {
    it("cache miss returns Option.none()", async () => {
      const result = await Effect.gen(function*() {
        const cache = yield* EmbeddingCache
        return yield* cache.get("nonexistent")
      }).pipe(Effect.provide(EmbeddingCache.Default), Effect.runPromise)

      expect(Option.isNone(result)).toBe(true)
    })

    it("stores and retrieves embeddings", async () => {
      const embedding = [0.1, 0.2, 0.3, 0.4, 0.5]

      const result = await Effect.gen(function*() {
        const cache = yield* EmbeddingCache
        yield* cache.set("test-key", embedding)
        return yield* cache.get("test-key")
      }).pipe(Effect.provide(EmbeddingCache.Default), Effect.runPromise)

      expect(Option.isSome(result)).toBe(true)
      expect(Option.getOrThrow(result)).toEqual(embedding)
    })

    it("has() returns false for missing keys", async () => {
      const result = await Effect.gen(function*() {
        const cache = yield* EmbeddingCache
        return yield* cache.has("nonexistent")
      }).pipe(Effect.provide(EmbeddingCache.Default), Effect.runPromise)

      expect(result).toBe(false)
    })

    it("has() returns true for existing keys", async () => {
      const result = await Effect.gen(function*() {
        const cache = yield* EmbeddingCache
        yield* cache.set("test-key", [0.1, 0.2])
        return yield* cache.has("test-key")
      }).pipe(Effect.provide(EmbeddingCache.Default), Effect.runPromise)

      expect(result).toBe(true)
    })

    it("overwrites existing embeddings", async () => {
      const result = await Effect.gen(function*() {
        const cache = yield* EmbeddingCache
        yield* cache.set("key", [0.1])
        yield* cache.set("key", [0.2, 0.3])
        return yield* cache.get("key")
      }).pipe(Effect.provide(EmbeddingCache.Default), Effect.runPromise)

      expect(Option.getOrThrow(result)).toEqual([0.2, 0.3])
    })

    it("size() returns correct count", async () => {
      const result = await Effect.gen(function*() {
        const cache = yield* EmbeddingCache
        yield* cache.set("key1", [0.1])
        yield* cache.set("key2", [0.2])
        yield* cache.set("key3", [0.3])
        return yield* cache.size()
      }).pipe(Effect.provide(EmbeddingCache.Default), Effect.runPromise)

      expect(result).toBe(3)
    })

    it("clear() removes all entries", async () => {
      const result = await Effect.gen(function*() {
        const cache = yield* EmbeddingCache
        yield* cache.set("key1", [0.1])
        yield* cache.set("key2", [0.2])
        yield* cache.clear()
        return yield* cache.size()
      }).pipe(Effect.provide(EmbeddingCache.Default), Effect.runPromise)

      expect(result).toBe(0)
    })
  })

  describe("TTL expiration", () => {
    it("entries expire after TTL", async () => {
      // Use custom config with short TTL (100ms)
      const shortTtlCache = EmbeddingCache.InMemory({ ttlMs: 100, maxEntries: 100 })

      const result = await Effect.gen(function*() {
        const cache = yield* EmbeddingCache
        yield* cache.set("key", [0.1, 0.2])

        // Entry exists initially
        const before = yield* cache.get("key")
        expect(Option.isSome(before)).toBe(true)

        // Advance time past TTL
        yield* TestClock.adjust(200)

        // Entry should be expired
        return yield* cache.get("key")
      }).pipe(
        Effect.provide(shortTtlCache),
        Effect.provide(TestContext.TestContext),
        Effect.runPromise
      )

      expect(Option.isNone(result)).toBe(true)
    })

    it("has() returns false for expired entries", async () => {
      const shortTtlCache = EmbeddingCache.InMemory({ ttlMs: 100, maxEntries: 100 })

      const result = await Effect.gen(function*() {
        const cache = yield* EmbeddingCache
        yield* cache.set("key", [0.1])

        yield* TestClock.adjust(200)

        return yield* cache.has("key")
      }).pipe(
        Effect.provide(shortTtlCache),
        Effect.provide(TestContext.TestContext),
        Effect.runPromise
      )

      expect(result).toBe(false)
    })
  })

  describe("LRU eviction", () => {
    it("evicts least recently used when at capacity", async () => {
      // Small cache with max 3 entries
      const smallCache = EmbeddingCache.InMemory({ ttlMs: 3600000, maxEntries: 3 })

      const result = await Effect.gen(function*() {
        const cache = yield* EmbeddingCache

        // Fill cache to capacity
        yield* cache.set("key1", [0.1])
        yield* TestClock.adjust(10)
        yield* cache.set("key2", [0.2])
        yield* TestClock.adjust(10)
        yield* cache.set("key3", [0.3])

        // Access key1 to make it recently used
        yield* TestClock.adjust(10)
        yield* cache.get("key1")

        // Add key4 - should evict key2 (least recently used)
        yield* TestClock.adjust(10)
        yield* cache.set("key4", [0.4])

        return {
          key1: yield* cache.has("key1"),
          key2: yield* cache.has("key2"),
          key3: yield* cache.has("key3"),
          key4: yield* cache.has("key4"),
          size: yield* cache.size()
        }
      }).pipe(
        Effect.provide(smallCache),
        Effect.provide(TestContext.TestContext),
        Effect.runPromise
      )

      expect(result.key1).toBe(true) // Recently accessed
      expect(result.key2).toBe(false) // Evicted (LRU)
      expect(result.key3).toBe(true) // Still present
      expect(result.key4).toBe(true) // Just added
      expect(result.size).toBe(3) // At capacity
    })
  })

  describe("EmbeddingCacheTest", () => {
    it("always returns Option.none()", async () => {
      const result = await Effect.gen(function*() {
        const cache = yield* EmbeddingCache
        yield* cache.set("key", [0.1, 0.2])
        return yield* cache.get("key")
      }).pipe(Effect.provide(EmbeddingCacheTest), Effect.runPromise)

      expect(Option.isNone(result)).toBe(true)
    })

    it("has() always returns false", async () => {
      const result = await Effect.gen(function*() {
        const cache = yield* EmbeddingCache
        yield* cache.set("key", [0.1, 0.2])
        return yield* cache.has("key")
      }).pipe(Effect.provide(EmbeddingCacheTest), Effect.runPromise)

      expect(result).toBe(false)
    })
  })
})
