import { expect } from "bun:test";
import { StringOrNumberToNumber } from "@beep/schema/primitives";
import { effect } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";
import * as S from "effect/Schema";

effect(
  "StringOrNumberToNumber - handles number input",
  Effect.fn(function* () {
    const result = yield* S.decodeUnknown(StringOrNumberToNumber)(42.5);
    expect(result).toBe(42.5);
  })
);

effect(
  "StringOrNumberToNumber - handles string number input",
  Effect.fn(function* () {
    const result = yield* S.decodeUnknown(StringOrNumberToNumber)("42.5");
    expect(result).toBe(42.5);
  })
);

effect(
  "StringOrNumberToNumber - handles integer string",
  Effect.fn(function* () {
    const result = yield* S.decodeUnknown(StringOrNumberToNumber)("42");
    expect(result).toBe(42);
  })
);

effect(
  "StringOrNumberToNumber - handles zero as number",
  Effect.fn(function* () {
    const result = yield* S.decodeUnknown(StringOrNumberToNumber)(0);
    expect(result).toBe(0);
  })
);

effect(
  "StringOrNumberToNumber - handles zero as string",
  Effect.fn(function* () {
    const result = yield* S.decodeUnknown(StringOrNumberToNumber)("0");
    expect(result).toBe(0);
  })
);

effect(
  "StringOrNumberToNumber - handles negative numbers",
  Effect.fn(function* () {
    const result = yield* S.decodeUnknown(StringOrNumberToNumber)("-42.5");
    expect(result).toBe(-42.5);
  })
);

effect(
  "StringOrNumberToNumber - handles scientific notation",
  Effect.fn(function* () {
    const result = yield* S.decodeUnknown(StringOrNumberToNumber)("1.23e-4");
    expect(result).toBe(0.000123);
  })
);

effect(
  "StringOrNumberToNumber - fails on invalid string",
  Effect.fn(function* () {
    const result = yield* S.decodeUnknown(StringOrNumberToNumber)("not-a-number").pipe(Effect.either);
    expect(Either.isLeft(result)).toBe(true);
  })
);

effect(
  "StringOrNumberToNumber - fails on null",
  Effect.fn(function* () {
    const result = yield* S.decodeUnknown(StringOrNumberToNumber)(null).pipe(Effect.either);
    expect(Either.isLeft(result)).toBe(true);
  })
);

effect(
  "StringOrNumberToNumber - fails on undefined",
  Effect.fn(function* () {
    const result = yield* S.decodeUnknown(StringOrNumberToNumber)(undefined).pipe(Effect.either);
    expect(Either.isLeft(result)).toBe(true);
  })
);

effect(
  "StringOrNumberToNumber - fails on boolean",
  Effect.fn(function* () {
    const result = yield* S.decodeUnknown(StringOrNumberToNumber)(true).pipe(Effect.either);
    expect(Either.isLeft(result)).toBe(true);
  })
);

effect(
  "StringOrNumberToNumber - encode transforms number to string",
  Effect.fn(function* () {
    const result = yield* S.encode(StringOrNumberToNumber)(42.5);
    expect(result).toBe("42.5");
  })
);

effect(
  "StringOrNumberToNumber - works with NullOr wrapper",
  Effect.fn(function* () {
    const NullableStringOrNumber = S.NullOr(StringOrNumberToNumber);

    const result1 = yield* S.decodeUnknown(NullableStringOrNumber)(null);
    expect(result1).toBe(null);

    const result2 = yield* S.decodeUnknown(NullableStringOrNumber)(42.5);
    expect(result2).toBe(42.5);

    const result3 = yield* S.decodeUnknown(NullableStringOrNumber)("42.5");
    expect(result3).toBe(42.5);
  })
);
