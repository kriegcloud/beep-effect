import { describe, expect, it } from "@effect/vitest"
import { Duration, Effect } from "effect"
import { CircuitOpenError, makeCircuitBreaker } from "../../src/Runtime/CircuitBreaker.js"

describe("Circuit Breaker", () => {
  it.effect("should allow requests when closed", () =>
    Effect.gen(function*() {
      const breaker = yield* makeCircuitBreaker({
        maxFailures: 3,
        resetTimeout: Duration.seconds(30),
        successThreshold: 2
      })

      const result = yield* breaker.protect(Effect.succeed(42))
      expect(result).toBe(42)
    }))

  it.effect("should open after max failures", () =>
    Effect.gen(function*() {
      const breaker = yield* makeCircuitBreaker({
        maxFailures: 3,
        resetTimeout: Duration.seconds(30),
        successThreshold: 2
      })

      // Trigger 3 failures
      for (let i = 0; i < 3; i++) {
        yield* breaker.protect(Effect.fail(new Error("fail"))).pipe(
          Effect.either
        )
      }

      // Circuit should be open
      const state = yield* breaker.getState()
      expect(state).toBe("open")

      // Next request should fail fast
      const result = yield* breaker.protect(Effect.succeed(42)).pipe(
        Effect.either
      )
      expect(result._tag).toBe("Left")
      if (result._tag === "Left") {
        expect(result.left).toBeInstanceOf(CircuitOpenError)
      }
    }))

  it.effect("should reset failure count on success", () =>
    Effect.gen(function*() {
      const breaker = yield* makeCircuitBreaker({
        maxFailures: 3,
        resetTimeout: Duration.seconds(30),
        successThreshold: 2
      })

      // 2 failures
      yield* breaker.protect(Effect.fail(new Error("fail"))).pipe(Effect.either)
      yield* breaker.protect(Effect.fail(new Error("fail"))).pipe(Effect.either)

      // 1 success (resets counter)
      yield* breaker.protect(Effect.succeed(1))

      // 2 more failures (total 2, not 4)
      yield* breaker.protect(Effect.fail(new Error("fail"))).pipe(Effect.either)
      yield* breaker.protect(Effect.fail(new Error("fail"))).pipe(Effect.either)

      // Should still be closed (2 failures, not 3)
      const state = yield* breaker.getState()
      expect(state).toBe("closed")
    }))
})
