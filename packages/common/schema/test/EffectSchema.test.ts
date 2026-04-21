import { EffectSchema, isEffect } from "@beep/schema/EffectSchema";
import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import * as S from "effect/Schema";

describe("EffectSchema", () => {
  it("accepts Effect runtime values", () => {
    const value = Effect.succeed(1);

    expect(isEffect(value)).toBe(true);
    expect(S.decodeUnknownSync(EffectSchema)(value)).toBe(value);
  });

  it("accepts composed effects", () => {
    const value = Effect.gen(function* () {
      const count = yield* Effect.succeed(1);
      return count + 1;
    });

    expect(isEffect(value)).toBe(true);
    expect(S.decodeUnknownSync(EffectSchema)(value)).toBe(value);
  });

  it("rejects non-effect values", () => {
    expect(isEffect(globalThis.Promise.resolve(1))).toBe(false);
    expect(isEffect("nope")).toBe(false);
    expect(() => S.decodeUnknownSync(EffectSchema)("nope")).toThrow(/Expected Effect/);
  });
});
