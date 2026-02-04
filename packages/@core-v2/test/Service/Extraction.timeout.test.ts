/**
 * Tests for StageTimeoutService integration with extractors
 *
 * Verifies that extraction services properly integrate with StageTimeoutService
 * for soft/hard timeout protection.
 *
 * @since 2.0.0
 * @module test/Service/Extraction.timeout
 */

import { Duration, Effect, Layer, Ref } from "effect"
import { describe, expect, it } from "vitest"
import {
  StageTimeoutService,
  StageTimeoutServiceTest,
  TimeoutError
} from "../../src/Service/LlmControl/StageTimeout.js"

describe("StageTimeoutService integration", () => {
  describe("StageTimeoutService behavior", () => {
    it("allows operations that complete within timeout", async () => {
      const TestLayer = StageTimeoutServiceTest({
        entity_extraction: { softMs: 1000, hardMs: 2000 }
      })

      const result = await Effect.gen(function*() {
        const timeout = yield* StageTimeoutService
        return yield* timeout.withTimeout(
          "entity_extraction",
          Effect.succeed("completed"),
          () => Effect.logWarning("soft timeout")
        )
      }).pipe(
        Effect.provide(TestLayer),
        Effect.runPromise
      )

      expect(result).toBe("completed")
    })

    it("fails with TimeoutError when hard timeout exceeded", async () => {
      const TestLayer = StageTimeoutServiceTest({
        entity_extraction: { softMs: 10, hardMs: 50 }
      })

      const result = await Effect.gen(function*() {
        const timeout = yield* StageTimeoutService
        return yield* timeout.withTimeout(
          "entity_extraction",
          Effect.sleep(Duration.millis(100)).pipe(Effect.map(() => "completed")),
          () => Effect.void
        )
      }).pipe(
        Effect.provide(TestLayer),
        Effect.either,
        Effect.runPromise
      )

      expect(result._tag).toBe("Left")
      if (result._tag === "Left") {
        expect(result.left).toBeInstanceOf(TimeoutError)
        expect((result.left as TimeoutError).stage).toBe("entity_extraction")
        expect((result.left as TimeoutError).timeoutMs).toBe(50)
      }
    })

    it("calls soft timeout callback when soft timeout exceeded but hard not reached", async () => {
      const TestLayer = StageTimeoutServiceTest({
        entity_extraction: { softMs: 20, hardMs: 200 }
      })

      const softTimeoutCalled = await Effect.gen(function*() {
        const timeout = yield* StageTimeoutService
        const called = yield* Ref.make(false)

        yield* timeout.withTimeout(
          "entity_extraction",
          // Sleep past soft timeout but before hard timeout
          Effect.sleep(Duration.millis(50)).pipe(Effect.map(() => "completed")),
          () => Ref.set(called, true)
        )

        return yield* Ref.get(called)
      }).pipe(
        Effect.provide(TestLayer),
        Effect.runPromise
      )

      expect(softTimeoutCalled).toBe(true)
    })

    it("does not call soft timeout callback when operation completes quickly", async () => {
      const TestLayer = StageTimeoutServiceTest({
        entity_extraction: { softMs: 100, hardMs: 200 }
      })

      const softTimeoutCalled = await Effect.gen(function*() {
        const timeout = yield* StageTimeoutService
        const called = yield* Ref.make(false)

        yield* timeout.withTimeout(
          "entity_extraction",
          // Complete immediately
          Effect.succeed("completed"),
          () => Ref.set(called, true)
        )

        // Give some time for the soft timeout fiber to potentially run
        yield* Effect.sleep(Duration.millis(10))

        return yield* Ref.get(called)
      }).pipe(
        Effect.provide(TestLayer),
        Effect.runPromise
      )

      expect(softTimeoutCalled).toBe(false)
    })
  })

  describe("getConfig", () => {
    it("returns configured timeout for known stages", async () => {
      const TestLayer = StageTimeoutServiceTest({
        entity_extraction: { softMs: 45000, hardMs: 60000 }
      })

      const config = await Effect.gen(function*() {
        const timeout = yield* StageTimeoutService
        return yield* timeout.getConfig("entity_extraction")
      }).pipe(
        Effect.provide(TestLayer),
        Effect.runPromise
      )

      expect(config.softMs).toBe(45000)
      expect(config.hardMs).toBe(60000)
    })

    it("returns default timeout for unknown stages", async () => {
      const TestLayer = StageTimeoutServiceTest()

      const config = await Effect.gen(function*() {
        const timeout = yield* StageTimeoutService
        return yield* timeout.getConfig("unknown_stage")
      }).pipe(
        Effect.provide(TestLayer),
        Effect.runPromise
      )

      // Default timeout is 10s soft / 15s hard
      expect(config.softMs).toBe(10000)
      expect(config.hardMs).toBe(15000)
    })
  })

  describe("wouldTimeout", () => {
    it("returns true when duration exceeds hard timeout", async () => {
      const TestLayer = StageTimeoutServiceTest({
        entity_extraction: { softMs: 1000, hardMs: 2000 }
      })

      const result = await Effect.gen(function*() {
        const timeout = yield* StageTimeoutService
        return yield* timeout.wouldTimeout("entity_extraction", 3000)
      }).pipe(
        Effect.provide(TestLayer),
        Effect.runPromise
      )

      expect(result).toBe(true)
    })

    it("returns false when duration is within hard timeout", async () => {
      const TestLayer = StageTimeoutServiceTest({
        entity_extraction: { softMs: 1000, hardMs: 2000 }
      })

      const result = await Effect.gen(function*() {
        const timeout = yield* StageTimeoutService
        return yield* timeout.wouldTimeout("entity_extraction", 1500)
      }).pipe(
        Effect.provide(TestLayer),
        Effect.runPromise
      )

      expect(result).toBe(false)
    })
  })
})
