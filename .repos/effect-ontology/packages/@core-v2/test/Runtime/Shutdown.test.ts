/**
 * Tests for Graceful Shutdown Handler
 *
 * @module test/Runtime/Shutdown
 */

import { Effect } from "effect"
import { describe, expect, it } from "vitest"
import { ShutdownService } from "../../src/Runtime/Shutdown.js"

describe("GracefulShutdown", () => {
  it("tracks in-flight count without forking", () =>
    Effect.gen(function*() {
      const shutdown = yield* ShutdownService

      // Track a simple request synchronously
      const result = yield* shutdown.trackRequest(Effect.succeed("done"))
      expect(result).toBe("done")

      // After completion, count should be 0
      const countAfter = yield* shutdown.inFlightCount()
      expect(countAfter).toBe(0)
    }).pipe(Effect.provide(ShutdownService.Default), Effect.runPromise))

  it("drain completes when no in-flight requests", () =>
    Effect.gen(function*() {
      const shutdown = yield* ShutdownService

      // Drain should complete immediately when nothing in flight
      yield* shutdown.drain()

      // Should reach here
      expect(true).toBe(true)
    }).pipe(Effect.provide(ShutdownService.Default), Effect.runPromise))

  it("ensuring decrements count even on failure", () =>
    Effect.gen(function*() {
      const shutdown = yield* ShutdownService

      // Track a request that fails
      const result = yield* shutdown.trackRequest(
        Effect.fail("error" as const)
      ).pipe(Effect.either)

      expect(result._tag).toBe("Left")

      // After failure, count should still be 0
      const countAfter = yield* shutdown.inFlightCount()
      expect(countAfter).toBe(0)
    }).pipe(Effect.provide(ShutdownService.Default), Effect.runPromise))

  it("isShuttingDown returns correct state", () =>
    Effect.gen(function*() {
      const shutdown = yield* ShutdownService

      // Initially not shutting down
      const before = yield* shutdown.isShuttingDown()
      expect(before).toBe(false)

      // After initiating shutdown
      yield* shutdown.initiateShutdown()
      const after = yield* shutdown.isShuttingDown()
      expect(after).toBe(true)
    }).pipe(Effect.provide(ShutdownService.Default), Effect.runPromise))

  it("rejects new requests after shutdown initiated", () =>
    Effect.gen(function*() {
      const shutdown = yield* ShutdownService

      // Initiate shutdown
      yield* shutdown.initiateShutdown()

      // Try to track a new request - should fail
      const result = yield* shutdown.trackRequest(
        Effect.succeed("should not run")
      ).pipe(Effect.either)

      expect(result._tag).toBe("Left")
    }).pipe(Effect.provide(ShutdownService.Default), Effect.runPromise))
})
