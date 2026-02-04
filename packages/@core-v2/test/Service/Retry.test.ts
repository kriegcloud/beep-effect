import { describe, expect, it } from "@effect/vitest"
import { Duration, Effect } from "effect"
import { isRetryableError, makeRetryPolicy } from "../../src/Service/Retry.js"

describe("Retry Policy", () => {
  it.effect("should create retry policy with exponential backoff", () =>
    Effect.gen(function*() {
      const policy = makeRetryPolicy({
        initialDelayMs: 1000,
        maxAttempts: 3,
        serviceName: "test"
      })
      expect(policy).toBeDefined()
    }))

  it("should identify retryable errors", () => {
    // Network errors are retryable
    expect(isRetryableError(new Error("ECONNREFUSED"))).toBe(true)
    expect(isRetryableError(new Error("ETIMEDOUT"))).toBe(true)

    // 429 rate limit is retryable
    const rateLimitError = Object.assign(new Error("Too Many Requests"), { status: 429 })
    expect(isRetryableError(rateLimitError)).toBe(true)

    // 400 bad request is NOT retryable
    const badRequestError = Object.assign(new Error("Bad Request"), { status: 400 })
    expect(isRetryableError(badRequestError)).toBe(false)

    // 401 unauthorized is NOT retryable
    const authError = Object.assign(new Error("Unauthorized"), { status: 401 })
    expect(isRetryableError(authError)).toBe(false)
  })
})
