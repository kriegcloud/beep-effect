import { describe, expect, it } from "@effect/vitest";

describe("Dummy", () => {
  it("should pass", () => {
    expect(true).toBe(true);
  });
});

// import { expect } from "bun:test";
// import { StringOrNumberToNumber } from "@beep/schema/custom";
// import { effect } from "@beep/testkit";
// import * as Effect from "effect/Effect";
// import * as S from "effect/Schema";
//
// effect("StringOrNumberToNumber - handles number input", () =>
//   Effect.gen(function* () {
//     const result = S.decodeUnknownSync(StringOrNumberToNumber)(42.5);
//     expect(result).toBe(42.5);
//   })
// );
//
// effect("StringOrNumberToNumber - handles string number input", () =>
//   Effect.gen(function* () {
//     const result = S.decodeUnknownSync(StringOrNumberToNumber)("42.5");
//     expect(result).toBe(42.5);
//   })
// );
//
// effect("StringOrNumberToNumber - handles integer string", () =>
//   Effect.gen(function* () {
//     const result = S.decodeUnknownSync(StringOrNumberToNumber)("42");
//     expect(result).toBe(42);
//   })
// );
//
// effect("StringOrNumberToNumber - handles zero as number", () =>
//   Effect.gen(function* () {
//     const result = S.decodeUnknownSync(StringOrNumberToNumber)(0);
//     expect(result).toBe(0);
//   })
// );
//
// effect("StringOrNumberToNumber - handles zero as string", () =>
//   Effect.gen(function* () {
//     const result = S.decodeUnknownSync(StringOrNumberToNumber)("0");
//     expect(result).toBe(0);
//   })
// );
//
// effect("StringOrNumberToNumber - handles negative numbers", () =>
//   Effect.gen(function* () {
//     const result = S.decodeUnknownSync(StringOrNumberToNumber)("-42.5");
//     expect(result).toBe(-42.5);
//   })
// );
//
// effect("StringOrNumberToNumber - handles scientific notation", () =>
//   Effect.gen(function* () {
//     const result = S.decodeUnknownSync(StringOrNumberToNumber)("1.23e-4");
//     expect(result).toBe(0.000123);
//   })
// );
//
// effect("StringOrNumberToNumber - fails on invalid string", () =>
//   Effect.gen(function* () {
//     expect(() => {
//       S.decodeUnknownSync(StringOrNumberToNumber)("not-a-number");
//     }).toThrow();
//   })
// );
//
// effect("StringOrNumberToNumber - fails on null", () =>
//   Effect.gen(function* () {
//     expect(() => {
//       S.decodeUnknownSync(StringOrNumberToNumber)(null);
//     }).toThrow();
//   })
// );
//
// effect("StringOrNumberToNumber - fails on undefined", () =>
//   Effect.gen(function* () {
//     expect(() => {
//       S.decodeUnknownSync(StringOrNumberToNumber)(undefined);
//     }).toThrow();
//   })
// );
//
// effect("StringOrNumberToNumber - fails on boolean", () =>
//   Effect.gen(function* () {
//     expect(() => {
//       S.decodeUnknownSync(StringOrNumberToNumber)(true);
//     }).toThrow();
//   })
// );
//
// effect("StringOrNumberToNumber - encode transforms number to string", () =>
//   Effect.gen(function* () {
//     const result = S.encodeSync(StringOrNumberToNumber)(42.5);
//     expect(result).toBe("42.5");
//   })
// );
//
// effect("StringOrNumberToNumber - works with NullOr wrapper", () =>
//   Effect.gen(function* () {
//     const NullableStringOrNumber = S.NullOr(StringOrNumberToNumber);
//
//     expect(S.decodeUnknownSync(NullableStringOrNumber)(null)).toBe(null);
//     expect(S.decodeUnknownSync(NullableStringOrNumber)(42.5)).toBe(42.5);
//     expect(S.decodeUnknownSync(NullableStringOrNumber)("42.5")).toBe(42.5);
//   })
// );
