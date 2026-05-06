import { NonNegativeInt } from "@beep/schema/Number";
import { Effect, Exit } from "effect";
import * as S from "effect/Schema";
import { describe, expect, it } from "vitest";

const decodeNonNegativeInt = S.decodeUnknownEffect(NonNegativeInt);
const exit = <A, E>(effect: Effect.Effect<A, E>) => Effect.runPromise(Effect.exit(effect));

describe("Number schemas", () => {
  it("exports the non-negative integer schema from the Number subpath", async () => {
    await expect(Effect.runPromise(decodeNonNegativeInt(0))).resolves.toBe(0);
    await expect(Effect.runPromise(decodeNonNegativeInt(42))).resolves.toBe(42);

    expect(Exit.isFailure(await exit(decodeNonNegativeInt(-1)))).toBe(true);
    expect(Exit.isFailure(await exit(decodeNonNegativeInt(1.5)))).toBe(true);
  });
});
