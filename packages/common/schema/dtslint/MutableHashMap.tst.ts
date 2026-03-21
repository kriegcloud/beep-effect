import { isMutableHashMap, MutableHashMap, MutableHashMapFromSelf } from "@beep/schema";
import * as MutableHashMap_ from "effect/MutableHashMap";
import * as S from "effect/Schema";
import { describe, expect, it } from "tstyche";

describe("MutableHashMap", () => {
  it("preserves the schema surface for existing mutable hash maps", () => {
    const schema = MutableHashMapFromSelf({
      key: S.String,
      value: S.NumberFromString,
    });

    expect(schema.key).type.toBe<typeof S.String>();
    expect(schema.value).type.toBe<typeof S.NumberFromString>();
    expect<typeof schema.Type>().type.toBe<MutableHashMap_.MutableHashMap<string, number>>();
    expect<typeof schema.Encoded>().type.toBe<MutableHashMap_.MutableHashMap<string, string>>();
  });

  it("preserves the entry-array-backed transform surface", () => {
    const schema = MutableHashMap({
      key: S.String,
      value: S.NumberFromString,
    });
    const decode = S.decodeUnknownSync(schema);
    const decoded = decode([["a", "1"]]);

    expect(schema.key).type.toBe<typeof S.String>();
    expect(schema.value).type.toBe<typeof S.NumberFromString>();
    expect<typeof schema.Type>().type.toBe<MutableHashMap_.MutableHashMap<string, number>>();
    expect<typeof schema.Encoded>().type.toBe<ReadonlyArray<readonly [string, string]>>();
    expect(decoded).type.toBe<MutableHashMap_.MutableHashMap<string, number>>();
  });

  it("exposes a guard that narrows to MutableHashMap runtime values", () => {
    const value: unknown = MutableHashMap_.make(["a", 1]);

    if (isMutableHashMap<string, number>(value)) {
      expect(value).type.toBe<MutableHashMap_.MutableHashMap<string, number>>();
    }
  });
});
