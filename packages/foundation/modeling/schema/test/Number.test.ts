import { NonNegativeInt } from "@beep/schema/Number";
import { Effect, Exit } from "effect";
import * as S from "effect/Schema";
import { describe, expect, it } from "vitest";

const decodeNonNegativeInt = S.decodeUnknownEffect(NonNegativeInt);
const exit = <A, E>(effect: Effect.Effect<A, E>) => Effect.runPromise(Effect.exit(effect));

describe("Number schemas", () => {
  it("exports the non-negative integer schema from the Number subpath", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        expect(yield* decodeNonNegativeInt(0)).toBe(0);
        expect(yield* decodeNonNegativeInt(42)).toBe(42);

        expect(Exit.isFailure(yield* Effect.promise(() => Promise.resolve(exit(decodeNonNegativeInt(-1)))))).toBe(true);
        expect(Exit.isFailure(yield* Effect.promise(() => Promise.resolve(exit(decodeNonNegativeInt(1.5)))))).toBe(
          true
        );
      })
    ));
});
