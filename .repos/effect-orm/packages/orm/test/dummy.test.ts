import * as Effect from "effect/Effect"
import { describe, expect, it } from "vitest"

describe("effect-orm", () => {
  it("should run an Effect test", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const result = yield* Effect.succeed(42)
        expect(result).toBe(42)
      }),
    ))
})
