import {
  isMutableHashSet,
  MutableHashSet as MHS,
  MutableHashSetFromSelf,
} from "@beep/schema/primitives/mutable-hash-set";
import { assertFalse, assertTrue, deepStrictEqual, describe, effect, it, strictEqual } from "@beep/testkit";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";
import * as MutableHashSet from "effect/MutableHashSet";
import * as ParseResult from "effect/ParseResult";
import * as Pretty from "effect/Pretty";
import * as S from "effect/Schema";

// ─────────────────────────────────────────────────────────────────────────────
// MutableHashSetFromSelf (declare-based schema)
// ─────────────────────────────────────────────────────────────────────────────

describe("MutableHashSetFromSelf", () => {
  describe("decoding", () => {
    effect("succeeds with empty MutableHashSet", () =>
      Effect.gen(function* () {
        const schema = MutableHashSetFromSelf(S.Number);
        const input = MutableHashSet.empty<number>();
        const result = S.decodeUnknownSync(schema)(input);
        strictEqual(MutableHashSet.size(result), 0);
      })
    );

    effect("succeeds with populated MutableHashSet", () =>
      Effect.gen(function* () {
        const schema = MutableHashSetFromSelf(S.Number);
        const input = MutableHashSet.fromIterable([1, 2, 3]);
        const result = S.decodeUnknownSync(schema)(input);
        strictEqual(MutableHashSet.size(result), 3);
        assertTrue(MutableHashSet.has(result, 1));
        assertTrue(MutableHashSet.has(result, 2));
        assertTrue(MutableHashSet.has(result, 3));
      })
    );

    effect("succeeds with value transformation (NumberFromString)", () =>
      Effect.gen(function* () {
        const schema = MutableHashSetFromSelf(S.NumberFromString);
        const input = MutableHashSet.fromIterable(["1", "2", "3"]);
        const result = S.decodeUnknownSync(schema)(input);
        strictEqual(MutableHashSet.size(result), 3);
        assertTrue(MutableHashSet.has(result, 1));
        assertTrue(MutableHashSet.has(result, 2));
        assertTrue(MutableHashSet.has(result, 3));
      })
    );

    effect("fails with null input", () =>
      Effect.gen(function* () {
        const schema = MutableHashSetFromSelf(S.Number);
        const result = S.decodeUnknownEither(schema)(null);
        assertTrue(Either.isLeft(result));
      })
    );

    effect("fails with undefined input", () =>
      Effect.gen(function* () {
        const schema = MutableHashSetFromSelf(S.Number);
        const result = S.decodeUnknownEither(schema)(undefined);
        assertTrue(Either.isLeft(result));
      })
    );

    effect("fails with plain object input", () =>
      Effect.gen(function* () {
        const schema = MutableHashSetFromSelf(S.Number);
        const result = S.decodeUnknownEither(schema)({ a: 1 });
        assertTrue(Either.isLeft(result));
      })
    );

    effect("fails with array input", () =>
      Effect.gen(function* () {
        const schema = MutableHashSetFromSelf(S.Number);
        const result = S.decodeUnknownEither(schema)([1, 2, 3]);
        assertTrue(Either.isLeft(result));
      })
    );

    effect("fails when value transformation fails", () =>
      Effect.gen(function* () {
        const schema = MutableHashSetFromSelf(S.NumberFromString);
        const input = MutableHashSet.fromIterable(["1", "not-a-number", "3"]);
        const result = S.decodeUnknownEither(schema)(input);
        assertTrue(Either.isLeft(result));
      })
    );

    effect("fails with wrong value types", () =>
      Effect.gen(function* () {
        const schema = MutableHashSetFromSelf(S.Number);
        const input = MutableHashSet.fromIterable(["a", "b"]);
        const result = S.decodeUnknownEither(schema)(input);
        assertTrue(Either.isLeft(result));
      })
    );
  });

  describe("encoding", () => {
    effect("succeeds with empty MutableHashSet", () =>
      Effect.gen(function* () {
        const schema = MutableHashSetFromSelf(S.Number);
        const input = MutableHashSet.empty<number>();
        const result = S.encodeSync(schema)(input);
        strictEqual(MutableHashSet.size(result), 0);
      })
    );

    effect("succeeds with populated MutableHashSet", () =>
      Effect.gen(function* () {
        const schema = MutableHashSetFromSelf(S.Number);
        const input = MutableHashSet.fromIterable([1, 2, 3]);
        const result = S.encodeSync(schema)(input);
        strictEqual(MutableHashSet.size(result), 3);
        assertTrue(MutableHashSet.has(result, 1));
        assertTrue(MutableHashSet.has(result, 2));
        assertTrue(MutableHashSet.has(result, 3));
      })
    );

    effect("succeeds with value transformation (NumberFromString)", () =>
      Effect.gen(function* () {
        const schema = MutableHashSetFromSelf(S.NumberFromString);
        const input = MutableHashSet.fromIterable([1, 2, 3]);
        const result = S.encodeSync(schema)(input);
        strictEqual(MutableHashSet.size(result), 3);
        assertTrue(MutableHashSet.has(result, "1"));
        assertTrue(MutableHashSet.has(result, "2"));
        assertTrue(MutableHashSet.has(result, "3"));
      })
    );

    effect("roundtrip preserves values", () =>
      Effect.gen(function* () {
        const schema = MutableHashSetFromSelf(S.NumberFromString);
        const input = MutableHashSet.fromIterable(["1", "2", "3"]);
        const decoded = S.decodeUnknownSync(schema)(input);
        const encoded = S.encodeSync(schema)(decoded);
        strictEqual(MutableHashSet.size(encoded), 3);
        assertTrue(MutableHashSet.has(encoded, "1"));
        assertTrue(MutableHashSet.has(encoded, "2"));
        assertTrue(MutableHashSet.has(encoded, "3"));
      })
    );
  });

  describe("is (type guard)", () => {
    effect("returns true for empty MutableHashSet", () =>
      Effect.gen(function* () {
        const schema = MutableHashSetFromSelf(S.String);
        const is = ParseResult.is(schema);
        assertTrue(is(MutableHashSet.empty()));
      })
    );

    effect("returns true for MutableHashSet with correct value types", () =>
      Effect.gen(function* () {
        const schema = MutableHashSetFromSelf(S.String);
        const is = ParseResult.is(schema);
        assertTrue(is(MutableHashSet.fromIterable(["a", "b", "c"])));
      })
    );

    effect("returns false for null", () =>
      Effect.gen(function* () {
        const schema = MutableHashSetFromSelf(S.Number);
        const is = ParseResult.is(schema);
        assertFalse(is(null));
      })
    );

    effect("returns false for undefined", () =>
      Effect.gen(function* () {
        const schema = MutableHashSetFromSelf(S.Number);
        const is = ParseResult.is(schema);
        assertFalse(is(undefined));
      })
    );

    effect("returns false for plain object", () =>
      Effect.gen(function* () {
        const schema = MutableHashSetFromSelf(S.Number);
        const is = ParseResult.is(schema);
        assertFalse(is({ a: 1 }));
      })
    );

    effect("returns false for array", () =>
      Effect.gen(function* () {
        const schema = MutableHashSetFromSelf(S.Number);
        const is = ParseResult.is(schema);
        assertFalse(is([1, 2, 3]));
      })
    );

    effect("returns false for MutableHashSet with wrong value types", () =>
      Effect.gen(function* () {
        const schema = MutableHashSetFromSelf(S.Number);
        const is = ParseResult.is(schema);
        assertFalse(is(MutableHashSet.fromIterable(["a", "b"])));
      })
    );

    effect("returns false for MutableHashSet with mixed value types", () =>
      Effect.gen(function* () {
        const schema = MutableHashSetFromSelf(S.String);
        const is = ParseResult.is(schema);
        const mixedSet = MutableHashSet.fromIterable(["a", "b", 1] as unknown[]);
        assertFalse(is(mixedSet));
      })
    );
  });

  describe("pretty", () => {
    effect("formats empty MutableHashSet", () =>
      Effect.gen(function* () {
        const schema = MutableHashSetFromSelf(S.Number);
        const pretty = Pretty.make(schema);
        strictEqual(pretty(MutableHashSet.empty()), "MutableHashSet()");
      })
    );

    effect("formats MutableHashSet with numbers", () =>
      Effect.gen(function* () {
        const schema = MutableHashSetFromSelf(S.Number);
        const pretty = Pretty.make(schema);
        const set = MutableHashSet.fromIterable([1, 2]);
        const result = pretty(set);
        assertTrue(result.startsWith("MutableHashSet("));
        assertTrue(result.includes("1"));
        assertTrue(result.includes("2"));
      })
    );

    effect("formats MutableHashSet with strings", () =>
      Effect.gen(function* () {
        const schema = MutableHashSetFromSelf(S.String);
        const pretty = Pretty.make(schema);
        const set = MutableHashSet.fromIterable(["a", "b"]);
        const result = pretty(set);
        assertTrue(result.startsWith("MutableHashSet("));
        assertTrue(result.includes('"a"'));
        assertTrue(result.includes('"b"'));
      })
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// MutableHashSet (transform-based schema)
// ─────────────────────────────────────────────────────────────────────────────

describe("MutableHashSet", () => {
  describe("decoding (array to MutableHashSet)", () => {
    effect("succeeds with empty array", () =>
      Effect.gen(function* () {
        const schema = MHS(S.Number);
        const result = S.decodeUnknownSync(schema)([]);
        strictEqual(MutableHashSet.size(result), 0);
      })
    );

    effect("succeeds with populated array", () =>
      Effect.gen(function* () {
        const schema = MHS(S.Number);
        const result = S.decodeUnknownSync(schema)([1, 2, 3]);
        strictEqual(MutableHashSet.size(result), 3);
        assertTrue(MutableHashSet.has(result, 1));
        assertTrue(MutableHashSet.has(result, 2));
        assertTrue(MutableHashSet.has(result, 3));
      })
    );

    effect("handles duplicates (set behavior)", () =>
      Effect.gen(function* () {
        const schema = MHS(S.Number);
        const result = S.decodeUnknownSync(schema)([1, 2, 2, 3, 3, 3]);
        strictEqual(MutableHashSet.size(result), 3);
        assertTrue(MutableHashSet.has(result, 1));
        assertTrue(MutableHashSet.has(result, 2));
        assertTrue(MutableHashSet.has(result, 3));
      })
    );

    effect("fails with null input", () =>
      Effect.gen(function* () {
        const schema = MHS(S.Number);
        const result = S.decodeUnknownEither(schema)(null);
        assertTrue(Either.isLeft(result));
      })
    );

    effect("fails with wrong value types", () =>
      Effect.gen(function* () {
        const schema = MHS(S.Number);
        const result = S.decodeUnknownEither(schema)(["a", "b"]);
        assertTrue(Either.isLeft(result));
      })
    );

    effect("fails with mixed value types in array", () =>
      Effect.gen(function* () {
        const schema = MHS(S.Number);
        const result = S.decodeUnknownEither(schema)([1, "a"]);
        assertTrue(Either.isLeft(result));
      })
    );

    effect("succeeds with string values", () =>
      Effect.gen(function* () {
        const schema = MHS(S.String);
        const result = S.decodeUnknownSync(schema)(["a", "b", "c"]);
        strictEqual(MutableHashSet.size(result), 3);
        assertTrue(MutableHashSet.has(result, "a"));
        assertTrue(MutableHashSet.has(result, "b"));
        assertTrue(MutableHashSet.has(result, "c"));
      })
    );
  });

  describe("encoding (MutableHashSet to array)", () => {
    effect("succeeds with empty MutableHashSet", () =>
      Effect.gen(function* () {
        const schema = MHS(S.Number);
        const input = MutableHashSet.empty<number>();
        const result = S.encodeSync(schema)(input);
        deepStrictEqual(result, []);
      })
    );

    effect("succeeds with populated MutableHashSet", () =>
      Effect.gen(function* () {
        const schema = MHS(S.Number);
        const input = MutableHashSet.fromIterable([1, 2, 3]);
        const result = S.encodeSync(schema)(input);
        strictEqual(A.length(result), 3);
        assertTrue(A.contains(result, 1));
        assertTrue(A.contains(result, 2));
        assertTrue(A.contains(result, 3));
      })
    );

    effect("succeeds with string values", () =>
      Effect.gen(function* () {
        const schema = MHS(S.String);
        const input = MutableHashSet.fromIterable(["a", "b"]);
        const result = S.encodeSync(schema)(input);
        strictEqual(A.length(result), 2);
        assertTrue(A.contains(result, "a"));
        assertTrue(A.contains(result, "b"));
      })
    );

    effect("roundtrip preserves values (ignoring duplicates)", () =>
      Effect.gen(function* () {
        const schema = MHS(S.Number);
        const originalArray = [1, 2, 3];
        const decoded = S.decodeUnknownSync(schema)(originalArray);
        const encoded = S.encodeSync(schema)(decoded);
        strictEqual(A.length(encoded), 3);
        assertTrue(A.contains(encoded, 1));
        assertTrue(A.contains(encoded, 2));
        assertTrue(A.contains(encoded, 3));
      })
    );
  });

  describe("is (type guard)", () => {
    effect("returns true for MutableHashSet with correct value types", () =>
      Effect.gen(function* () {
        const schema = MHS(S.Number);
        const is = ParseResult.is(schema);
        assertTrue(is(MutableHashSet.fromIterable([1, 2, 3])));
      })
    );

    effect("returns true for empty MutableHashSet", () =>
      Effect.gen(function* () {
        const schema = MHS(S.Number);
        const is = ParseResult.is(schema);
        assertTrue(is(MutableHashSet.empty()));
      })
    );

    effect("returns false for array (input type)", () =>
      Effect.gen(function* () {
        const schema = MHS(S.Number);
        const is = ParseResult.is(schema);
        assertFalse(is([1, 2, 3]));
      })
    );

    effect("returns false for wrong value types", () =>
      Effect.gen(function* () {
        const schema = MHS(S.Number);
        const is = ParseResult.is(schema);
        assertFalse(is(MutableHashSet.fromIterable(["a", "b"])));
      })
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// isMutableHashSet helper
// ─────────────────────────────────────────────────────────────────────────────

describe("isMutableHashSet", () => {
  it("returns true for MutableHashSet.empty()", () => {
    assertTrue(isMutableHashSet(MutableHashSet.empty()));
  });

  it("returns true for MutableHashSet.fromIterable()", () => {
    assertTrue(isMutableHashSet(MutableHashSet.fromIterable([1, 2, 3])));
  });

  it("returns false for null", () => {
    assertFalse(isMutableHashSet(null));
  });

  it("returns false for undefined", () => {
    assertFalse(isMutableHashSet(undefined));
  });

  it("returns false for plain object", () => {
    assertFalse(isMutableHashSet({ a: 1 }));
  });

  it("returns false for array", () => {
    assertFalse(isMutableHashSet([1, 2, 3]));
  });

  it("returns false for Set", () => {
    assertFalse(isMutableHashSet(new Set([1, 2, 3])));
  });

  it("returns false for number", () => {
    assertFalse(isMutableHashSet(123));
  });

  it("returns false for string", () => {
    assertFalse(isMutableHashSet("test"));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// MutableHashSet-specific mutation tests
// ─────────────────────────────────────────────────────────────────────────────

describe("MutableHashSet mutation behavior", () => {
  describe("mutations after decode are preserved", () => {
    effect("add value after decode is preserved", () =>
      Effect.gen(function* () {
        const schema = MHS(S.Number);
        const decoded = S.decodeUnknownSync(schema)([1, 2]);
        MutableHashSet.add(decoded, 3);
        assertTrue(MutableHashSet.has(decoded, 3));
        strictEqual(MutableHashSet.size(decoded), 3);
      })
    );

    effect("remove value after decode is preserved", () =>
      Effect.gen(function* () {
        const schema = MHS(S.Number);
        const decoded = S.decodeUnknownSync(schema)([1, 2, 3]);
        MutableHashSet.remove(decoded, 2);
        assertFalse(MutableHashSet.has(decoded, 2));
        strictEqual(MutableHashSet.size(decoded), 2);
      })
    );

    effect("encode reflects mutations made after decode", () =>
      Effect.gen(function* () {
        const schema = MHS(S.String);
        const decoded = S.decodeUnknownSync(schema)(["a"]);
        MutableHashSet.add(decoded, "b");
        const encoded = S.encodeSync(schema)(decoded);
        strictEqual(A.length(encoded), 2);
        assertTrue(A.contains(encoded, "a"));
        assertTrue(A.contains(encoded, "b"));
      })
    );
  });

  describe("MutableHashSetFromSelf mutations", () => {
    effect("mutations are visible after decode", () =>
      Effect.gen(function* () {
        const schema = MutableHashSetFromSelf(S.Number);
        const input = MutableHashSet.fromIterable([1, 2]);
        const decoded = S.decodeUnknownSync(schema)(input);
        MutableHashSet.add(decoded, 3);
        assertTrue(MutableHashSet.has(decoded, 3));
      })
    );

    effect("encode reflects mutations", () =>
      Effect.gen(function* () {
        const schema = MutableHashSetFromSelf(S.Number);
        const input = MutableHashSet.fromIterable([1]);
        const decoded = S.decodeUnknownSync(schema)(input);
        MutableHashSet.add(decoded, 2);
        const encoded = S.encodeSync(schema)(decoded);
        strictEqual(MutableHashSet.size(encoded), 2);
        assertTrue(MutableHashSet.has(encoded, 1));
        assertTrue(MutableHashSet.has(encoded, 2));
      })
    );
  });

  describe("mutation type validation", () => {
    effect("MutableHashSetFromSelf rejects immutable HashSet", () =>
      Effect.gen(function* () {
        const schema = MutableHashSetFromSelf(S.Number);
        // Import HashSet dynamically to get the immutable version
        const HashSet = yield* Effect.promise(() => import("effect/HashSet"));
        const immutableSet = HashSet.fromIterable([1, 2, 3]);
        const result = S.decodeUnknownEither(schema)(immutableSet);
        assertTrue(Either.isLeft(result));
      })
    );

    effect("MutableHashSet transform rejects adding wrong type", () =>
      Effect.gen(function* () {
        const schema = MHS(S.Number);
        const decoded = S.decodeUnknownSync(schema)([1, 2]);
        // Attempt to add wrong type (should fail at encode time)
        // biome-ignore lint/suspicious/noExplicitAny: testing type violation
        MutableHashSet.add(decoded as any, "not a number");
        const encodeResult = S.encodeEither(schema)(decoded);
        // The encode should fail because the set now contains a non-number
        assertTrue(Either.isLeft(encodeResult));
      })
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Equivalence tests
// ─────────────────────────────────────────────────────────────────────────────

describe("MutableHashSet equivalence", () => {
  effect("empty sets are equivalent",
    Effect.fn(function* () {
      const schema = MutableHashSetFromSelf(S.Number);
      const equivalence = S.equivalence(schema);
      const set1 = MutableHashSet.empty<number>();
      const set2 = MutableHashSet.empty<number>();
      assertTrue(equivalence(set1, set2));
    })
  );

  effect("sets with same values (same order) are equivalent",
    Effect.fn(function* () {
      const schema = MutableHashSetFromSelf(S.Number);
      const equivalence = S.equivalence(schema);
      const set1 = MutableHashSet.fromIterable([1, 2, 3]);
      const set2 = MutableHashSet.fromIterable([1, 2, 3]);
      assertTrue(equivalence(set1, set2));
    })
  );

  effect("sets with different values are not equivalent",
    Effect.fn(function* () {
      const schema = MutableHashSetFromSelf(S.Number);
      const equivalence = S.equivalence(schema);
      const set1 = MutableHashSet.fromIterable([1, 2, 3]);
      const set2 = MutableHashSet.fromIterable([1, 2, 4]);
      assertFalse(equivalence(set1, set2));
    })
  );

  effect("sets with different sizes are not equivalent",
    Effect.fn(function* () {
      const schema = MutableHashSetFromSelf(S.Number);
      const equivalence = S.equivalence(schema);
      const set1 = MutableHashSet.fromIterable([1, 2]);
      const set2 = MutableHashSet.fromIterable([1, 2, 3]);
      assertFalse(equivalence(set1, set2));
    })
  );

  effect("equivalence is reflexive",
    Effect.fn(function* () {
      const schema = MutableHashSetFromSelf(S.String);
      const equivalence = S.equivalence(schema);
      const set = MutableHashSet.fromIterable(["a", "b", "c"]);
      assertTrue(equivalence(set, set));
    })
  );

  effect("equivalence is symmetric",
    Effect.fn(function* () {
      const schema = MutableHashSetFromSelf(S.Number);
      const equivalence = S.equivalence(schema);
      const set1 = MutableHashSet.fromIterable([1, 2, 3]);
      const set2 = MutableHashSet.fromIterable([1, 2, 3]);
      assertTrue(equivalence(set1, set2));
      assertTrue(equivalence(set2, set1));
    })
  );
});
