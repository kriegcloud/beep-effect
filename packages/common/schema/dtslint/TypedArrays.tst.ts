import {
  Float16ArrayFromArray,
  type Float16ArrayFromArray as Float16ArrayFromArrayType,
  type Float16Arr as Float16ArrType,
} from "@beep/schema/Float16Array";
import {
  Float32ArrayFromArray,
  type Float32ArrayFromArray as Float32ArrayFromArrayType,
  type Float32Arr as Float32ArrType,
} from "@beep/schema/Float32Array";
import {
  Float64ArrayFromArray,
  type Float64ArrayFromArray as Float64ArrayFromArrayType,
  type Float64Arr as Float64ArrType,
} from "@beep/schema/Float64Array";
import type { Effect } from "effect";
import * as S from "effect/Schema";
import { describe, expect, it } from "tstyche";

describe("Float16Array schemas", () => {
  it("preserve the typed-array schema surface", () => {
    expect<Float16ArrType>().type.toBe<Float16ArrayFromArrayType>();
    expect<Float16ArrayFromArray.Encoded>().type.toBe<ReadonlyArray<number>>();
    expect<typeof Float16ArrayFromArray.Type>().type.toBe<Float16ArrayFromArrayType>();
  });

  it("exposes decode and encode helpers with the expected effect types", () => {
    const decode = S.decodeUnknownEffect(Float16ArrayFromArray);
    const encode = S.encodeEffect(Float16ArrayFromArray);
    const value = new Float16Array([1, 2, 3]);

    expect(decode([1, 2, 3])).type.toBe<Effect.Effect<Float16ArrayFromArrayType, S.SchemaError, never>>();
    expect(encode(value)).type.toBe<Effect.Effect<ReadonlyArray<number>, S.SchemaError, never>>();
  });
});

describe("Float32Array schemas", () => {
  it("preserve the typed-array schema surface", () => {
    expect<Float32ArrType>().type.toBe<Float32ArrayFromArrayType>();
    expect<Float32ArrayFromArray.Encoded>().type.toBe<ReadonlyArray<number>>();
    expect<typeof Float32ArrayFromArray.Type>().type.toBe<Float32ArrayFromArrayType>();
  });

  it("exposes decode and encode helpers with the expected effect types", () => {
    const decode = S.decodeUnknownEffect(Float32ArrayFromArray);
    const encode = S.encodeEffect(Float32ArrayFromArray);
    const value = new Float32Array([1, 2, 3]);

    expect(decode([1, 2, 3])).type.toBe<Effect.Effect<Float32ArrayFromArrayType, S.SchemaError, never>>();
    expect(encode(value)).type.toBe<Effect.Effect<ReadonlyArray<number>, S.SchemaError, never>>();
  });
});

describe("Float64Array schemas", () => {
  it("preserve the typed-array schema surface", () => {
    expect<Float64ArrType>().type.toBe<Float64ArrayFromArrayType>();
    expect<Float64ArrayFromArray.Encoded>().type.toBe<ReadonlyArray<number>>();
    expect<typeof Float64ArrayFromArray.Type>().type.toBe<Float64ArrayFromArrayType>();
  });

  it("exposes decode and encode helpers with the expected effect types", () => {
    const decode = S.decodeUnknownEffect(Float64ArrayFromArray);
    const encode = S.encodeEffect(Float64ArrayFromArray);
    const value = new Float64Array([1, 2, 3]);

    expect(decode([1, 2, 3])).type.toBe<Effect.Effect<Float64ArrayFromArrayType, S.SchemaError, never>>();
    expect(encode(value)).type.toBe<Effect.Effect<ReadonlyArray<number>, S.SchemaError, never>>();
  });
});
