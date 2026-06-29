import { isInt64 as rootIsInt64 } from "@beep/schema";
import { Int64, Int64FromString } from "@beep/schema/Int";
import * as S from "effect/Schema";
import { describe, expect, it } from "tstyche";
import type { Int64 as RootInt64, Int64FromString as RootInt64FromString } from "@beep/schema";
import type { Int64FromString as Int64FromStringType, Int64 as Int64Type, isInt64 } from "@beep/schema/Int";
import type { Effect } from "effect";
import type * as Brand from "effect/Brand";

describe("Int", () => {
  it("preserves the branded signed int64 schema surface", () => {
    expect<Int64>().type.toBe<bigint & Brand.Brand<"Int64">>();
    expect<typeof Int64.Encoded>().type.toBe<bigint>();
    expect<Int64Type>().type.toBe<bigint & Brand.Brand<"Int64">>();
  });

  it("tracks the signed int64 string codec types", () => {
    expect<Int64FromString>().type.toBe<Int64Type>();
    expect<typeof Int64FromString.Encoded>().type.toBe<string>();
    expect<Int64FromStringType>().type.toBe<Int64Type>();
  });

  it("exposes decode and encode helpers with expected effect types", () => {
    const decode = S.decodeUnknownEffect(Int64);
    const decodeString = S.decodeUnknownEffect(Int64FromString);
    const encodeString = S.encodeEffect(Int64FromString);
    const value = S.decodeSync(Int64)(BigInt(0));

    expect(value).type.toBe<Int64Type>();
    expect(decode(BigInt(0))).type.toBe<Effect.Effect<Int64Type, S.SchemaError, never>>();
    expect(decodeString("0")).type.toBe<Effect.Effect<Int64Type, S.SchemaError, never>>();
    expect(encodeString(value)).type.toBe<Effect.Effect<string, S.SchemaError, never>>();
  });

  it("exports signed int64 helpers from the package root barrel", () => {
    expect<typeof RootInt64>().type.toBe<typeof Int64>();
    expect<typeof RootInt64FromString>().type.toBe<typeof Int64FromString>();
    expect(rootIsInt64).type.toBe<typeof isInt64>();
  });
});
