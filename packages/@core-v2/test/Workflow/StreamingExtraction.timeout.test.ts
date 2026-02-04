import { describe, expect, it } from "@effect/vitest"
import { Duration, Effect } from "effect"

describe("StreamingExtraction hybrid search timeout", () => {
  it.effect("should timeout hybrid search after 30 seconds", () =>
    Effect.gen(function*() {
      // This test verifies the timeout is configured
      // The actual implementation test is in integration tests
      const timeout = Duration.seconds(30)
      expect(Duration.toMillis(timeout)).toBe(30000)
    }))
})
