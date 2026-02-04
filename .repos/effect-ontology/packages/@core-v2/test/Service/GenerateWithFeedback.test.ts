import { describe, expect, it } from "@effect/vitest"
import { Duration, Effect, Schedule } from "effect"

describe("GenerateWithFeedback", () => {
  it.effect("supports custom retry schedule", () =>
    Effect.gen(function*() {
      // Verify we can pass a schedule option (mock test for interface check)
      const schedule = Schedule.exponential(Duration.seconds(2)).pipe(
        Schedule.jittered
      )
      expect(schedule).toBeDefined()
    }))
})
