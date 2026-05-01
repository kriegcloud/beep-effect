import { DurationFromInput, DurationInput, DurationObject } from "@beep/schema";
import { describe, expect, it } from "@effect/vitest";
import * as D from "effect/Duration";
import * as O from "effect/Option";
import * as S from "effect/Schema";

describe("DurationInput", () => {
  const decode = S.decodeUnknownSync(DurationInput);

  it("accepts additive duration objects with populated fields", () => {
    const decoded = decode({
      minutes: 1,
      seconds: 30,
    });

    expect(decoded).toBeInstanceOf(DurationObject);
    expect(decoded).toEqual(new DurationObject({ minutes: 1, seconds: 30 }));
  });

  it("rejects empty duration objects", () => {
    expect(() => decode({})).toThrow("Duration object must include at least one populated unit field.");
  });
});

describe("DurationFromInput", () => {
  const decode = S.decodeUnknownSync(DurationFromInput);
  const encode = S.encodeSync(DurationFromInput);

  it("passes through existing Duration values", () => {
    const input = D.seconds(2);

    expect(decode(input)).toBe(input);
  });

  it("decodes non-negative integers as milliseconds", () => {
    expect(D.toMillis(decode(1_500))).toBe(1_500);
  });

  it("decodes non-negative bigints as nanoseconds", () => {
    expect(O.getOrUndefined(D.toNanos(decode(1_500_000n)))).toBe(1_500_000n);
  });

  it("decodes hrtime tuples into high-resolution durations", () => {
    expect(O.getOrUndefined(D.toNanos(decode([2, 3])))).toBe(2_000_000_003n);
  });

  it("decodes duration strings", () => {
    expect(D.toMillis(decode("3 minutes"))).toBe(180_000);
  });

  it("decodes additive duration objects", () => {
    const decoded = decode(
      new DurationObject({
        minutes: 1,
        seconds: 30,
        microseconds: 4,
        nanoseconds: 5,
      })
    );

    expect(O.getOrUndefined(D.toNanos(decoded))).toBe(90_000_004_005n);
  });

  it("preserves DurationInput validation failures", () => {
    expect(() => decode({})).toThrow("Duration object must include at least one populated unit field.");
  });

  it("forbids encoding normalized Duration values back to the source boundary", () => {
    expect(() => encode(D.seconds(1))).toThrow(
      "Encoding DurationFromInput results back to the original duration input is not supported"
    );
  });
});
