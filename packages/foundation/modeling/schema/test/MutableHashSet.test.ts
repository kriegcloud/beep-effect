import { isMutableHashSet, MutableHashSet, MutableHashSetFromSelf } from "@beep/schema";
import { describe, expect, it } from "@effect/vitest";
import * as MutableHashSet_ from "effect/MutableHashSet";
import * as S from "effect/Schema";

describe("MutableHashSetFromSelf", () => {
  it("preserves schema metadata and validates existing mutable hash sets", () => {
    const schema = MutableHashSetFromSelf(S.NumberFromString);
    const decoded = S.decodeUnknownSync(schema)(MutableHashSet_.make("1", "2", "1"));

    expect(schema.value).toBe(S.NumberFromString);
    expect(schema.annotate({}).value).toBe(S.NumberFromString);
    expect(isMutableHashSet(decoded)).toBe(true);
    expect(Array.from(decoded)).toEqual([1, 2]);
  });

  it("rejects non-mutable-hash-set inputs", () => {
    const schema = MutableHashSetFromSelf(S.NumberFromString);

    expect(() => S.decodeUnknownSync(schema)(null)).toThrow("Expected MutableHashSetFromSelf, got null");
  });

  it("reports member decode failures at the values path", () => {
    const schema = MutableHashSetFromSelf(S.NumberFromString);

    expect(() => S.decodeUnknownSync(schema)(MutableHashSet_.make("1", null))).toThrow(`Expected string, got null
  at ["values"][1]`);
  });

  it("derives formatter and equivalence instances", () => {
    const formatter = S.toFormatter(MutableHashSetFromSelf(S.String));
    const equivalence = S.toEquivalence(MutableHashSetFromSelf(S.String));

    expect(formatter(MutableHashSet_.make("b", "a"))).toBe(`MutableHashSet(2) { "a", "b" }`);
    expect(equivalence(MutableHashSet_.make("a", "b"), MutableHashSet_.make("b", "a"))).toBe(true);
    expect(equivalence(MutableHashSet_.make("a"), MutableHashSet_.make("b"))).toBe(false);
  });
});

describe("MutableHashSet", () => {
  it("decodes arrays into mutable hash sets and removes duplicates", () => {
    const schema = MutableHashSet(S.NumberFromString);
    const decoded = S.decodeUnknownSync(schema)(["1", "2", "1"]);

    expect(schema.value).toBe(S.NumberFromString);
    expect(schema.annotate({}).value).toBe(S.NumberFromString);
    expect(isMutableHashSet(decoded)).toBe(true);
    expect(Array.from(decoded)).toEqual([1, 2]);
  });

  it("encodes mutable hash sets back to arrays", () => {
    const schema = MutableHashSet(S.NumberFromString);

    expect(S.encodeSync(schema)(MutableHashSet_.make(1, 2, 3))).toEqual(["1", "2", "3"]);
  });

  it("expects the encoded array form at the boundary", () => {
    const schema = MutableHashSet(S.NumberFromString);

    expect(() => S.decodeUnknownSync(schema)(MutableHashSet_.make("1", null))).toThrow(
      `Expected array, got MutableHashSet(["1",null])`
    );
  });
});
