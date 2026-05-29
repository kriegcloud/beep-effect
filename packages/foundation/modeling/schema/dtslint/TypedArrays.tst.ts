import { Float16ArrayFromArray } from "@beep/schema/Float16Array";
import { Float32ArrayFromArray } from "@beep/schema/Float32Array";
import { Float64ArrayFromArray } from "@beep/schema/Float64Array";
import * as S from "effect/Schema";
import { describe, expect, it } from "tstyche";
import type {
  Float16ArrayFromArray as Float16ArrayFromArrayType,
  Float16Arr as Float16ArrType,
} from "@beep/schema/Float16Array";
import type {
  Float32ArrayFromArray as Float32ArrayFromArrayType,
  Float32Arr as Float32ArrType,
} from "@beep/schema/Float32Array";
import type {
  Float64ArrayFromArray as Float64ArrayFromArrayType,
  Float64Arr as Float64ArrType,
} from "@beep/schema/Float64Array";
import type { Effect } from "effect";

describe("Float16Array schemas", () => {
  it("preserve the typed-array schema surface", () => {
    expect<Float16ArrType>().type.toBe<Float16ArrayFromArrayType>();
    expect<Float16ArrayFromArray.Encoded>().type.toBe<ReadonlyArray<number>>();
    expect<Float16ArrayFromArray>().type.toBe<Float16ArrayFromArrayType>();
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
    expect<Float32ArrayFromArray>().type.toBe<Float32ArrayFromArrayType>();
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
    expect<Float64ArrayFromArray>().type.toBe<Float64ArrayFromArrayType>();
  });

  it("exposes decode and encode helpers with the expected effect types", () => {
    const decode = S.decodeUnknownEffect(Float64ArrayFromArray);
    const encode = S.encodeEffect(Float64ArrayFromArray);
    const value = new Float64Array([1, 2, 3]);

    expect(decode([1, 2, 3])).type.toBe<Effect.Effect<Float64ArrayFromArrayType, S.SchemaError, never>>();
    expect(encode(value)).type.toBe<Effect.Effect<ReadonlyArray<number>, S.SchemaError, never>>();
  });
});
