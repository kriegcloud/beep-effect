import { isMutableHashSet, MutableHashSet, MutableHashSetFromSelf } from "@beep/schema";
import * as MutableHashSet_ from "effect/MutableHashSet";
import * as S from "effect/Schema";
import { describe, expect, it } from "tstyche";

describe("MutableHashSet", () => {
  it("preserves the schema surface for existing mutable hash sets", () => {
    const schema = MutableHashSetFromSelf(S.NumberFromString);

    expect(schema.value).type.toBe<typeof S.NumberFromString>();
    expect<typeof schema.Type>().type.toBe<MutableHashSet_.MutableHashSet<number>>();
    expect<typeof schema.Encoded>().type.toBe<MutableHashSet_.MutableHashSet<string>>();
  });

  it("preserves the array-backed transform surface", () => {
    const schema = MutableHashSet(S.NumberFromString);
    const decode = S.decodeUnknownSync(schema);
    const decoded = decode(["1", "2"]);

    expect(schema.value).type.toBe<typeof S.NumberFromString>();
    expect<typeof schema.Type>().type.toBe<MutableHashSet_.MutableHashSet<number>>();
    expect<typeof schema.Encoded>().type.toBe<ReadonlyArray<string>>();
    expect(decoded).type.toBe<MutableHashSet_.MutableHashSet<number>>();
  });

  it("exposes a guard that narrows to MutableHashSet runtime values", () => {
    const value: unknown = MutableHashSet_.make(1, 2);

    if (isMutableHashSet<number>(value)) {
      expect(value).type.toBe<MutableHashSet_.MutableHashSet<number>>();
    }
  });
});
