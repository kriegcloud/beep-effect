import { Float16Arr, Float16ArrayFromArray } from "@beep/schema/Float16Array";
import { Float32Arr, Float32ArrayFromArray } from "@beep/schema/Float32Array";
import { Float64Arr, Float64ArrayFromArray } from "@beep/schema/Float64Array";
import { describe, expect, it } from "@effect/vitest";
import * as S from "effect/Schema";

describe("Float16Array schemas", () => {
  it("accepts native Float16Array instances", () => {
    const value = new Float16Array([1, 2, 3]);

    expect(S.decodeUnknownSync(Float16Arr)(value)).toBe(value);
  });

  it("round-trips numeric arrays through Float16Array instances", () => {
    const value = S.decodeUnknownSync(Float16ArrayFromArray)([1, 2, 3]);
    const encoded = S.encodeSync(Float16ArrayFromArray)(value);

    expect(value).toBeInstanceOf(Float16Array);
    expect(Array.from(value)).toEqual([1, 2, 3]);
    expect(encoded).toEqual([1, 2, 3]);
  });
});

describe("Float32Array schemas", () => {
  it("accepts native Float32Array instances", () => {
    const value = new Float32Array([1, 2, 3]);

    expect(S.decodeUnknownSync(Float32Arr)(value)).toBe(value);
  });

  it("round-trips numeric arrays through Float32Array instances", () => {
    const value = S.decodeUnknownSync(Float32ArrayFromArray)([1, 2, 3]);
    const encoded = S.encodeSync(Float32ArrayFromArray)(value);

    expect(value).toBeInstanceOf(Float32Array);
    expect(Array.from(value)).toEqual([1, 2, 3]);
    expect(encoded).toEqual([1, 2, 3]);
  });
});

describe("Float64Array schemas", () => {
  it("accepts native Float64Array instances", () => {
    const value = new Float64Array([1, 2, 3]);

    expect(S.decodeUnknownSync(Float64Arr)(value)).toBe(value);
  });

  it("round-trips numeric arrays through Float64Array instances", () => {
    const value = S.decodeUnknownSync(Float64ArrayFromArray)([1, 2, 3]);
    const encoded = S.encodeSync(Float64ArrayFromArray)(value);

    expect(value).toBeInstanceOf(Float64Array);
    expect(Array.from(value)).toEqual([1, 2, 3]);
    expect(encoded).toEqual([1, 2, 3]);
  });
});
