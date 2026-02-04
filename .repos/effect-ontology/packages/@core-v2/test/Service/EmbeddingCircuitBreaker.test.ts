/**
 * EmbeddingCircuitBreaker Tests
 *
 * Tests per-provider circuit breaker functionality for embedding services.
 *
 * @module test/Service/EmbeddingCircuitBreaker.test
 */

import { describe, expect, it } from "@effect/vitest"
import { Effect, Layer, TestClock, TestContext } from "effect"
import { CircuitOpenError } from "../../src/Runtime/CircuitBreaker.js"
import {
  DEFAULT_EMBEDDING_CIRCUIT_CONFIG,
  EmbeddingCircuitBreaker,
  type EmbeddingProviderId
} from "../../src/Service/EmbeddingCircuitBreaker.js"

// =============================================================================
// Test Layer
// =============================================================================

const TestLayer = EmbeddingCircuitBreaker.Default

// =============================================================================
// Tests
// =============================================================================

describe("EmbeddingCircuitBreaker", () => {
  describe("Provider Configuration", () => {
    it("should have correct default config for voyage", () => {
      expect(DEFAULT_EMBEDDING_CIRCUIT_CONFIG.voyage).toEqual({
        maxFailures: 3,
        resetTimeoutMs: 30_000,
        successThreshold: 2
      })
    })

    it("should have correct default config for nomic", () => {
      expect(DEFAULT_EMBEDDING_CIRCUIT_CONFIG.nomic).toEqual({
        maxFailures: 5,
        resetTimeoutMs: 60_000,
        successThreshold: 1
      })
    })

    it("should have correct default config for openai", () => {
      expect(DEFAULT_EMBEDDING_CIRCUIT_CONFIG.openai).toEqual({
        maxFailures: 3,
        resetTimeoutMs: 30_000,
        successThreshold: 2
      })
    })
  })

  describe("Circuit State Management", () => {
    it.effect("should start with closed circuit (available)", () =>
      Effect.gen(function*() {
        const breaker = yield* EmbeddingCircuitBreaker

        const status = yield* breaker.getStatus("voyage")
        expect(status.state).toBe("closed")
        expect(status.isAvailable).toBe(true)
      }).pipe(Effect.provide(TestLayer)))

    it.effect("should protect successful effects", () =>
      Effect.gen(function*() {
        const breaker = yield* EmbeddingCircuitBreaker

        const result = yield* breaker.protect("voyage", Effect.succeed(42))
        expect(result).toBe(42)
      }).pipe(Effect.provide(TestLayer)))

    it.effect("should open circuit after max failures", () =>
      Effect.gen(function*() {
        const breaker = yield* EmbeddingCircuitBreaker
        const providerId: EmbeddingProviderId = "voyage"

        // Trigger 3 failures (voyage config maxFailures = 3)
        for (let i = 0; i < 3; i++) {
          yield* breaker.protect(providerId, Effect.fail(new Error("API error"))).pipe(
            Effect.either
          )
        }

        // Circuit should now be open
        const status = yield* breaker.getStatus(providerId)
        expect(status.state).toBe("open")
        expect(status.isAvailable).toBe(false)
      }).pipe(Effect.provide(TestLayer)))

    it.effect("should fail fast when circuit is open", () =>
      Effect.gen(function*() {
        const breaker = yield* EmbeddingCircuitBreaker
        const providerId: EmbeddingProviderId = "voyage"

        // Open the circuit
        for (let i = 0; i < 3; i++) {
          yield* breaker.protect(providerId, Effect.fail(new Error("API error"))).pipe(
            Effect.either
          )
        }

        // Next request should fail with CircuitOpenError
        const result = yield* breaker.protect(providerId, Effect.succeed("should not run")).pipe(
          Effect.either
        )

        expect(result._tag).toBe("Left")
        if (result._tag === "Left") {
          expect(result.left).toBeInstanceOf(CircuitOpenError)
        }
      }).pipe(Effect.provide(TestLayer)))

    it.effect("should reset failure count on success", () =>
      Effect.gen(function*() {
        const breaker = yield* EmbeddingCircuitBreaker
        const providerId: EmbeddingProviderId = "voyage"

        // 2 failures (not enough to open)
        yield* breaker.protect(providerId, Effect.fail(new Error("fail"))).pipe(Effect.either)
        yield* breaker.protect(providerId, Effect.fail(new Error("fail"))).pipe(Effect.either)

        // 1 success (resets counter)
        yield* breaker.protect(providerId, Effect.succeed(1))

        // 2 more failures (total 2, not 4)
        yield* breaker.protect(providerId, Effect.fail(new Error("fail"))).pipe(Effect.either)
        yield* breaker.protect(providerId, Effect.fail(new Error("fail"))).pipe(Effect.either)

        // Should still be closed
        const status = yield* breaker.getStatus(providerId)
        expect(status.state).toBe("closed")
      }).pipe(Effect.provide(TestLayer)))
  })

  describe("Provider Isolation", () => {
    it.effect("should maintain separate circuits per provider", () =>
      Effect.gen(function*() {
        const breaker = yield* EmbeddingCircuitBreaker

        // Open voyage circuit
        for (let i = 0; i < 3; i++) {
          yield* breaker.protect("voyage", Effect.fail(new Error("voyage error"))).pipe(
            Effect.either
          )
        }

        // Voyage should be open
        const voyageStatus = yield* breaker.getStatus("voyage")
        expect(voyageStatus.state).toBe("open")

        // Nomic should still be closed
        const nomicStatus = yield* breaker.getStatus("nomic")
        expect(nomicStatus.state).toBe("closed")

        // Can still use nomic
        const result = yield* breaker.protect("nomic", Effect.succeed("nomic works"))
        expect(result).toBe("nomic works")
      }).pipe(Effect.provide(TestLayer)))

    it.effect("should have different thresholds per provider", () =>
      Effect.gen(function*() {
        const breaker = yield* EmbeddingCircuitBreaker

        // Nomic has maxFailures = 5, voyage has 3
        // 3 failures should open voyage but not nomic
        for (let i = 0; i < 3; i++) {
          yield* breaker.protect("voyage", Effect.fail(new Error("fail"))).pipe(Effect.either)
          yield* breaker.protect("nomic", Effect.fail(new Error("fail"))).pipe(Effect.either)
        }

        const voyageStatus = yield* breaker.getStatus("voyage")
        expect(voyageStatus.state).toBe("open")

        const nomicStatus = yield* breaker.getStatus("nomic")
        expect(nomicStatus.state).toBe("closed")
      }).pipe(Effect.provide(TestLayer)))
  })

  describe("Availability Checks", () => {
    it.effect("should check availability correctly", () =>
      Effect.gen(function*() {
        const breaker = yield* EmbeddingCircuitBreaker

        // Both available initially
        expect(yield* breaker.isAvailable("voyage")).toBe(true)
        expect(yield* breaker.isAvailable("nomic")).toBe(true)

        // Open voyage
        for (let i = 0; i < 3; i++) {
          yield* breaker.protect("voyage", Effect.fail(new Error("fail"))).pipe(Effect.either)
        }

        // Voyage unavailable, nomic still available
        expect(yield* breaker.isAvailable("voyage")).toBe(false)
        expect(yield* breaker.isAvailable("nomic")).toBe(true)
      }).pipe(Effect.provide(TestLayer)))

    it.effect("should find first available provider", () =>
      Effect.gen(function*() {
        const breaker = yield* EmbeddingCircuitBreaker

        // All available: returns first
        const first = yield* breaker.findAvailableProvider(["voyage", "nomic", "openai"])
        expect(first).toBe("voyage")

        // Open voyage
        for (let i = 0; i < 3; i++) {
          yield* breaker.protect("voyage", Effect.fail(new Error("fail"))).pipe(Effect.either)
        }

        // First available is now nomic
        const second = yield* breaker.findAvailableProvider(["voyage", "nomic", "openai"])
        expect(second).toBe("nomic")
      }).pipe(Effect.provide(TestLayer)))

    it.effect("should return null when no providers available", () =>
      Effect.gen(function*() {
        const breaker = yield* EmbeddingCircuitBreaker

        // Open voyage (3 failures)
        for (let i = 0; i < 3; i++) {
          yield* breaker.protect("voyage", Effect.fail(new Error("fail"))).pipe(Effect.either)
        }

        // Open nomic (5 failures)
        for (let i = 0; i < 5; i++) {
          yield* breaker.protect("nomic", Effect.fail(new Error("fail"))).pipe(Effect.either)
        }

        const result = yield* breaker.findAvailableProvider(["voyage", "nomic"])
        expect(result).toBeNull()
      }).pipe(Effect.provide(TestLayer)))
  })

  describe("Reset Operations", () => {
    it.effect("should reset individual provider circuit", () =>
      Effect.gen(function*() {
        const breaker = yield* EmbeddingCircuitBreaker

        // Open the circuit
        for (let i = 0; i < 3; i++) {
          yield* breaker.protect("voyage", Effect.fail(new Error("fail"))).pipe(Effect.either)
        }

        expect((yield* breaker.getStatus("voyage")).state).toBe("open")

        // Reset
        yield* breaker.reset("voyage")

        // Should be closed again
        expect((yield* breaker.getStatus("voyage")).state).toBe("closed")
      }).pipe(Effect.provide(TestLayer)))

    it.effect("should reset all circuits", () =>
      Effect.gen(function*() {
        const breaker = yield* EmbeddingCircuitBreaker

        // Open both circuits
        for (let i = 0; i < 3; i++) {
          yield* breaker.protect("voyage", Effect.fail(new Error("fail"))).pipe(Effect.either)
        }
        for (let i = 0; i < 5; i++) {
          yield* breaker.protect("nomic", Effect.fail(new Error("fail"))).pipe(Effect.either)
        }

        expect((yield* breaker.getStatus("voyage")).state).toBe("open")
        expect((yield* breaker.getStatus("nomic")).state).toBe("open")

        // Reset all
        yield* breaker.resetAll()

        // All should be closed
        expect((yield* breaker.getStatus("voyage")).state).toBe("closed")
        expect((yield* breaker.getStatus("nomic")).state).toBe("closed")
      }).pipe(Effect.provide(TestLayer)))
  })

  describe("Status Reporting", () => {
    it.effect("should get all statuses", () =>
      Effect.gen(function*() {
        const breaker = yield* EmbeddingCircuitBreaker

        // Trigger some activity to create circuits
        yield* breaker.protect("voyage", Effect.succeed(1))
        yield* breaker.protect("nomic", Effect.succeed(2))

        const allStatuses = yield* breaker.getAllStatuses()

        expect(allStatuses.length).toBe(2)
        expect(allStatuses.some((s) => s.providerId === "voyage")).toBe(true)
        expect(allStatuses.some((s) => s.providerId === "nomic")).toBe(true)
      }).pipe(Effect.provide(TestLayer)))

    it.effect("should return empty array when no circuits exist", () =>
      Effect.gen(function*() {
        const breaker = yield* EmbeddingCircuitBreaker

        // No activity yet
        const allStatuses = yield* breaker.getAllStatuses()
        expect(allStatuses).toEqual([])
      }).pipe(Effect.provide(TestLayer)))
  })
})
