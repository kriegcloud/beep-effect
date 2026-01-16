/**
 * Tests for MutableHashMap and MutableHashMapFromSelf schemas.
 *
 * Verifies:
 * - MutableHashMap: transform-based schema converting array of tuples to/from MutableHashMap
 * - MutableHashMapFromSelf: declare-based schema validating existing MutableHashMap instances
 * - Type guards, pretty printing, and transformation behavior
 */

import {
  isMutableHashMap,
  MutableHashMap as MHM,
  MutableHashMapFromSelf,
} from "@beep/schema/primitives/mutable-hash-map";
import { assertFalse, assertTrue, deepStrictEqual, describe, effect, it, strictEqual } from "@beep/testkit";
import type { UnsafeTypes } from "@beep/types";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as E from "effect/Either";
import * as MutableHashMap from "effect/MutableHashMap";
import * as ParseResult from "effect/ParseResult";
import * as Pretty from "effect/Pretty";
import * as S from "effect/Schema";

// -----------------------------------------------------------------------------
// MutableHashMap (transform schema)
// -----------------------------------------------------------------------------

describe("MutableHashMap", () => {
  const schema = MHM({ key: S.String, value: S.Number });

  describe("decoding", () => {
    effect("decoding - empty array to empty MutableHashMap", () =>
      Effect.gen(function* () {
        const result = S.decodeUnknownSync(schema)([]);
        assertTrue(isMutableHashMap(result));
        deepStrictEqual(A.fromIterable(result), []);
      })
    );

    effect("decoding - array with tuples to MutableHashMap", () =>
      Effect.gen(function* () {
        const input = [
          ["a", 1],
          ["b", 2],
          ["c", 3],
        ];
        const result = S.decodeUnknownSync(schema)(input);
        assertTrue(isMutableHashMap(result));

        // Compare contents - order may vary in MutableHashMap
        const entries = A.fromIterable(result);
        strictEqual(entries.length, 3);
        strictEqual(MutableHashMap.get(result, "a")._tag, "Some");
        strictEqual(MutableHashMap.get(result, "b")._tag, "Some");
        strictEqual(MutableHashMap.get(result, "c")._tag, "Some");
      })
    );

    effect("decoding - fails on null", () =>
      Effect.gen(function* () {
        const result = S.decodeUnknownEither(schema)(null);
        assertTrue(E.isLeft(result));
      })
    );

    effect("decoding - fails on undefined", () =>
      Effect.gen(function* () {
        const result = S.decodeUnknownEither(schema)(undefined);
        assertTrue(E.isLeft(result));
      })
    );

    effect("decoding - fails on non-array", () =>
      Effect.gen(function* () {
        const result = S.decodeUnknownEither(schema)("not an array");
        assertTrue(E.isLeft(result));
      })
    );

    effect("decoding - fails on invalid tuple - wrong key type", () =>
      Effect.gen(function* () {
        const input = [[123, 1]]; // key should be string, not number
        const result = S.decodeUnknownEither(schema)(input);
        assertTrue(E.isLeft(result));
      })
    );

    effect("decoding - fails on invalid tuple - wrong value type", () =>
      Effect.gen(function* () {
        const input = [["a", "not a number"]]; // value should be number
        const result = S.decodeUnknownEither(schema)(input);
        assertTrue(E.isLeft(result));
      })
    );

    effect("decoding - fails on malformed tuple - too few elements", () =>
      Effect.gen(function* () {
        const input = [["a"]]; // tuple needs two elements
        const result = S.decodeUnknownEither(schema)(input);
        assertTrue(E.isLeft(result));
      })
    );

    effect("decoding - fails on malformed tuple - not an array", () =>
      Effect.gen(function* () {
        const input = [{ key: "a", value: 1 }]; // should be tuple, not object
        const result = S.decodeUnknownEither(schema)(input);
        assertTrue(E.isLeft(result));
      })
    );
  });

  describe("encoding", () => {
    effect("encoding - empty MutableHashMap to empty array", () =>
      Effect.gen(function* () {
        const map = MutableHashMap.empty<string, number>();
        const result = S.encodeSync(schema)(map);
        deepStrictEqual(result, []);
      })
    );

    effect("encoding - MutableHashMap with entries to array of tuples", () =>
      Effect.gen(function* () {
        const map = MutableHashMap.fromIterable([
          ["a", 1],
          ["b", 2],
        ]);
        const result = S.encodeSync(schema)(map);

        // Result is array of tuples - order may vary
        strictEqual(result.length, 2);

        // Verify both entries are present
        const resultMap = new Map(result);
        strictEqual(resultMap.get("a"), 1);
        strictEqual(resultMap.get("b"), 2);
      })
    );
  });

  describe("roundtrip", () => {
    effect("decoding then encoding preserves data", () =>
      Effect.gen(function* () {
        const input: Array<readonly [string, number]> = [
          ["x", 10],
          ["y", 20],
        ];
        const decoded = S.decodeUnknownSync(schema)(input);
        const encoded = S.encodeSync(schema)(decoded);

        // Convert both to comparable format
        const inputMap = new Map(input);
        const outputMap = new Map(encoded);

        strictEqual(inputMap.get("x"), outputMap.get("x"));
        strictEqual(inputMap.get("y"), outputMap.get("y"));
        strictEqual(inputMap.size, outputMap.size);
      })
    );
  });

  describe("with transforming schemas", () => {
    const transformingSchema = MHM({
      key: S.NumberFromString,
      value: S.BooleanFromUnknown,
    });

    effect("decoding - transforms keys from strings to numbers", () =>
      Effect.gen(function* () {
        const input = [
          ["1", "true"],
          ["2", 0],
        ];
        const result = S.decodeUnknownSync(transformingSchema)(input);
        assertTrue(isMutableHashMap(result));

        // Keys should be transformed to numbers
        strictEqual(MutableHashMap.get(result, 1)._tag, "Some");
        strictEqual(MutableHashMap.get(result, 2)._tag, "Some");
      })
    );

    effect("encoding - transforms keys back to strings", () =>
      Effect.gen(function* () {
        const map = MutableHashMap.fromIterable<number, boolean>([
          [1, true],
          [2, false],
        ]);
        const result = S.encodeSync(transformingSchema)(map);

        // Keys should be encoded back to strings
        const resultMap = new Map(result);
        strictEqual(resultMap.get("1"), true);
        strictEqual(resultMap.get("2"), false);
      })
    );
  });
});

// -----------------------------------------------------------------------------
// MutableHashMapFromSelf (declare schema)
// -----------------------------------------------------------------------------

describe("MutableHashMapFromSelf", () => {
  const schema = MutableHashMapFromSelf({ key: S.String, value: S.Number });

  describe("decoding", () => {
    effect("decoding - empty MutableHashMap", () =>
      Effect.gen(function* () {
        const map = MutableHashMap.empty<string, number>();
        const result = S.decodeUnknownSync(schema)(map);
        assertTrue(isMutableHashMap(result));
        deepStrictEqual(A.fromIterable(result), []);
      })
    );

    effect("decoding - MutableHashMap with valid entries", () =>
      Effect.gen(function* () {
        const map = MutableHashMap.fromIterable([
          ["a", 1],
          ["b", 2],
        ]);
        const result = S.decodeUnknownSync(schema)(map);
        assertTrue(isMutableHashMap(result));
        strictEqual(MutableHashMap.get(result, "a")._tag, "Some");
        strictEqual(MutableHashMap.get(result, "b")._tag, "Some");
      })
    );

    effect("decoding - fails on non-MutableHashMap", () =>
      Effect.gen(function* () {
        const result = S.decodeUnknownEither(schema)([["a", 1]]);
        assertTrue(E.isLeft(result));
      })
    );

    effect("decoding - fails on null", () =>
      Effect.gen(function* () {
        const result = S.decodeUnknownEither(schema)(null);
        assertTrue(E.isLeft(result));
      })
    );

    effect("decoding - fails on undefined", () =>
      Effect.gen(function* () {
        const result = S.decodeUnknownEither(schema)(undefined);
        assertTrue(E.isLeft(result));
      })
    );

    effect("decoding - fails on plain object", () =>
      Effect.gen(function* () {
        const result = S.decodeUnknownEither(schema)({ a: 1, b: 2 });
        assertTrue(E.isLeft(result));
      })
    );
  });

  describe("decoding with transformation", () => {
    const transformingSchema = MutableHashMapFromSelf({
      key: S.NumberFromString,
      value: S.Number,
    });

    effect("decoding - transforms keys", () =>
      Effect.gen(function* () {
        // Input MutableHashMap has string keys
        const inputMap = MutableHashMap.fromIterable([
          ["1", 100],
          ["2", 200],
        ]);
        const result = S.decodeUnknownSync(transformingSchema)(inputMap);
        assertTrue(isMutableHashMap(result));

        // After transformation, keys should be numbers
        strictEqual(MutableHashMap.get(result, 1)._tag, "Some");
        strictEqual(MutableHashMap.get(result, 2)._tag, "Some");
      })
    );

    effect("decoding - fails on invalid key type", () =>
      Effect.gen(function* () {
        // Keys that can't be parsed as numbers
        const inputMap = MutableHashMap.fromIterable([
          ["notanumber", 100],
          ["2", 200],
        ]);
        const result = S.decodeUnknownEither(transformingSchema)(inputMap);
        assertTrue(E.isLeft(result));
      })
    );
  });

  describe("encoding", () => {
    effect("encoding - empty MutableHashMap", () =>
      Effect.gen(function* () {
        const map = MutableHashMap.empty<string, number>();
        const result = S.encodeSync(schema)(map);
        assertTrue(isMutableHashMap(result));
        deepStrictEqual(A.fromIterable(result), []);
      })
    );

    effect("encoding - MutableHashMap with entries", () =>
      Effect.gen(function* () {
        const map = MutableHashMap.fromIterable([
          ["a", 1],
          ["b", 2],
        ]);
        const result = S.encodeSync(schema)(map);
        assertTrue(isMutableHashMap(result));
      })
    );
  });

  describe("encoding with transformation", () => {
    const transformingSchema = MutableHashMapFromSelf({
      key: S.NumberFromString,
      value: S.Number,
    });

    effect("encoding - transforms keys back", () =>
      Effect.gen(function* () {
        // Type has number keys
        const map = MutableHashMap.fromIterable<number, number>([
          [1, 100],
          [2, 200],
        ]);
        const result = S.encodeSync(transformingSchema)(map);
        assertTrue(isMutableHashMap(result));

        // After encoding, keys should be back to strings
        strictEqual(MutableHashMap.get(result, "1")._tag, "Some");
        strictEqual(MutableHashMap.get(result, "2")._tag, "Some");
      })
    );
  });

  describe("type guard (is)", () => {
    it("is - returns true for valid MutableHashMap", () => {
      const map = MutableHashMap.fromIterable([
        ["a", 1],
        ["b", 2],
      ]);
      const is = ParseResult.is(schema);
      assertTrue(is(map));
    });

    it("is - returns true for empty MutableHashMap", () => {
      const map = MutableHashMap.empty<string, number>();
      const is = ParseResult.is(schema);
      assertTrue(is(map));
    });

    it("is - returns false for null", () => {
      const is = ParseResult.is(schema);
      assertFalse(is(null));
    });

    it("is - returns false for undefined", () => {
      const is = ParseResult.is(schema);
      assertFalse(is(undefined));
    });

    it("is - returns false for arrays", () => {
      const is = ParseResult.is(schema);
      assertFalse(
        is([
          ["a", 1],
          ["b", 2],
        ])
      );
    });

    it("is - returns false for plain objects", () => {
      const is = ParseResult.is(schema);
      assertFalse(is({ a: 1, b: 2 }));
    });

    it("is - returns false for MutableHashMap with wrong key type", () => {
      const map = MutableHashMap.fromIterable([
        [1, 1],
        [2, 2],
      ]); // number keys, not string
      const is = ParseResult.is(schema);
      assertFalse(is(map));
    });

    it("is - returns false for MutableHashMap with wrong value type", () => {
      const map = MutableHashMap.fromIterable([
        ["a", "one"],
        ["b", "two"],
      ]); // string values, not number
      const is = ParseResult.is(schema);
      assertFalse(is(map));
    });
  });

  describe("pretty printing", () => {
    it("pretty - empty MutableHashMap", () => {
      const map = MutableHashMap.empty<string, number>();
      const pretty = Pretty.make(schema);
      strictEqual(pretty(map), "HashMap([])");
    });

    it("pretty - MutableHashMap with entries", () => {
      const map = MutableHashMap.fromIterable([["hello", 42]]);
      const pretty = Pretty.make(schema);
      // The pretty output format should match the implementation
      strictEqual(pretty(map), 'HashMap([["hello", 42]])');
    });

    it("pretty - MutableHashMap with multiple entries", () => {
      const map = MutableHashMap.fromIterable([
        ["a", 1],
        ["b", 2],
      ]);
      const pretty = Pretty.make(schema);
      const result = pretty(map);

      // Verify it starts and ends correctly
      assertTrue(result.startsWith("HashMap(["));
      assertTrue(result.endsWith("])"));

      // Verify both entries are present
      assertTrue(result.includes('"a"'));
      assertTrue(result.includes('"b"'));
      assertTrue(result.includes("1"));
      assertTrue(result.includes("2"));
    });
  });
});

// -----------------------------------------------------------------------------
// isMutableHashMap type guard
// -----------------------------------------------------------------------------

describe("isMutableHashMap", () => {
  it("returns true for MutableHashMap", () => {
    const map = MutableHashMap.empty();
    assertTrue(isMutableHashMap(map));
  });

  it("returns true for non-empty MutableHashMap", () => {
    const map = MutableHashMap.fromIterable([["a", 1]]);
    assertTrue(isMutableHashMap(map));
  });

  it("returns false for null", () => {
    assertFalse(isMutableHashMap(null));
  });

  it("returns false for undefined", () => {
    assertFalse(isMutableHashMap(undefined));
  });

  it("returns false for arrays", () => {
    assertFalse(isMutableHashMap([["a", 1]]));
  });

  it("returns false for plain objects", () => {
    assertFalse(isMutableHashMap({ a: 1 }));
  });

  it("returns false for Map instances", () => {
    assertFalse(isMutableHashMap(new Map([["a", 1]])));
  });

  it("returns false for numbers", () => {
    assertFalse(isMutableHashMap(42));
  });

  it("returns false for strings", () => {
    assertFalse(isMutableHashMap("test"));
  });
});

// -----------------------------------------------------------------------------
// Schema properties
// -----------------------------------------------------------------------------

describe("Schema properties", () => {
  it("MutableHashMap has correct description", () => {
    const schema = MHM({ key: S.String, value: S.Number });
    // The transform schema should have tuple array as input
    const desc = String(schema.ast);
    assertTrue(desc.includes("Array"));
  });

  it("MutableHashMapFromSelf has correct description", () => {
    const schema = MutableHashMapFromSelf({ key: S.String, value: S.Number });
    const desc = String(schema.ast);
    assertTrue(desc.includes("HashMap"));
  });
});

// -----------------------------------------------------------------------------
// Mutation-specific tests (MutableHashMap vs immutable HashMap)
// -----------------------------------------------------------------------------

describe("Mutation behavior", () => {
  describe("MutableHashMap transform schema", () => {
    const schema = MHM({ key: S.String, value: S.Number });

    effect("encode reflects mutations made after decode", () =>
      Effect.gen(function* () {
        const input = [["a", 1]];
        const decoded = S.decodeUnknownSync(schema)(input);

        // Mutate the decoded map
        MutableHashMap.set(decoded, "b", 2);
        MutableHashMap.set(decoded, "a", 100); // update existing

        const encoded = S.encodeSync(schema)(decoded);
        const resultMap = new Map(encoded);

        strictEqual(resultMap.size, 2);
        strictEqual(resultMap.get("a"), 100); // updated value
        strictEqual(resultMap.get("b"), 2); // new entry
      })
    );

    effect("encode reflects removals made after decode", () =>
      Effect.gen(function* () {
        const input = [
          ["a", 1],
          ["b", 2],
          ["c", 3],
        ];
        const decoded = S.decodeUnknownSync(schema)(input);

        // Remove an entry
        MutableHashMap.remove(decoded, "b");

        const encoded = S.encodeSync(schema)(decoded);
        const resultMap = new Map(encoded);

        strictEqual(resultMap.size, 2);
        assertTrue(resultMap.has("a"));
        assertFalse(resultMap.has("b"));
        assertTrue(resultMap.has("c"));
      })
    );

    effect("multiple encodes of same instance reflect current state", () =>
      Effect.gen(function* () {
        const decoded = S.decodeUnknownSync(schema)([["x", 1]]);

        // First encode
        const encoded1 = S.encodeSync(schema)(decoded);
        strictEqual(new Map(encoded1).get("x"), 1);

        // Mutate
        MutableHashMap.set(decoded, "x", 999);

        // Second encode reflects mutation
        const encoded2 = S.encodeSync(schema)(decoded);
        strictEqual(new Map(encoded2).get("x"), 999);
      })
    );
  });

  describe("MutableHashMapFromSelf declare schema", () => {
    const schema = MutableHashMapFromSelf({ key: S.String, value: S.Number });

    effect("encode reflects mutations", () =>
      Effect.gen(function* () {
        const map = MutableHashMap.fromIterable<string, number>([["key", 1]]);
        const decoded = S.decodeUnknownSync(schema)(map);

        // Mutate
        MutableHashMap.set(decoded, "key", 42);
        MutableHashMap.set(decoded, "new", 100);

        const encoded = S.encodeSync(schema)(decoded);
        strictEqual(MutableHashMap.get(encoded, "key")._tag, "Some");
        strictEqual(MutableHashMap.get(encoded, "new")._tag, "Some");

        const keyVal = MutableHashMap.get(encoded, "key");
        if (keyVal._tag === "Some") {
          strictEqual(keyVal.value, 42);
        }
      })
    );

    effect("mutation to invalid type fails on encode", () =>
      Effect.gen(function* () {
        const map = MutableHashMap.fromIterable<string, number>([["a", 1]]);
        const decoded = S.decodeUnknownSync(schema)(map);

        // Force an invalid mutation (bypass TypeScript)
        MutableHashMap.set(decoded as UnsafeTypes.UnsafeAny, "bad", "not a number");

        // Encoding should fail because value is not a number
        const result = S.encodeEither(schema)(decoded);
        assertTrue(E.isLeft(result));
      })
    );
  });
});

// -----------------------------------------------------------------------------
// Immutable HashMap rejection
// -----------------------------------------------------------------------------

describe("Immutable HashMap rejection", () => {
  // Import immutable HashMap
  // Note: effect/HashMap is immutable, effect/MutableHashMap is mutable

  effect(
    "MutableHashMapFromSelf rejects immutable HashMap",
    Effect.fn(function* () {
      const schema = MutableHashMapFromSelf({ key: S.String, value: S.Number });

      // Create an immutable HashMap (different type)
      const HashMap = yield* Effect.promise(() => import("effect/HashMap"));
      const immutableMap = HashMap.fromIterable([
        ["a", 1],
        ["b", 2],
      ]);

      // Should fail - immutable HashMap is not MutableHashMap
      const result = S.decodeUnknownEither(schema)(immutableMap);
      assertTrue(E.isLeft(result));
    })
  );

  it("isMutableHashMap returns false for immutable HashMap", async () => {
    const HashMap = await import("effect/HashMap");
    const immutableMap = HashMap.fromIterable([["a", 1]]);
    assertFalse(isMutableHashMap(immutableMap));
  });
});

// -----------------------------------------------------------------------------
// Equivalence tests
// -----------------------------------------------------------------------------

describe("Equivalence", () => {
  it("maps with same content and insertion order are equivalent", () => {
    const schema = MutableHashMapFromSelf({ key: S.String, value: S.Number });
    const equivalence = S.equivalence(schema);

    // Same insertion order
    const map1 = MutableHashMap.fromIterable([
      ["a", 1],
      ["b", 2],
    ]);
    const map2 = MutableHashMap.fromIterable([
      ["a", 1],
      ["b", 2],
    ]);

    assertTrue(equivalence(map1, map2));
  });

  it("maps with different values are not equivalent", () => {
    const schema = MutableHashMapFromSelf({ key: S.String, value: S.Number });
    const equivalence = S.equivalence(schema);

    const map1 = MutableHashMap.fromIterable([["a", 1]]);
    const map2 = MutableHashMap.fromIterable([["a", 2]]);

    assertFalse(equivalence(map1, map2));
  });

  it("maps with different keys are not equivalent", () => {
    const schema = MutableHashMapFromSelf({ key: S.String, value: S.Number });
    const equivalence = S.equivalence(schema);

    const map1 = MutableHashMap.fromIterable([["a", 1]]);
    const map2 = MutableHashMap.fromIterable([["b", 1]]);

    assertFalse(equivalence(map1, map2));
  });

  it("empty maps are equivalent", () => {
    const schema = MutableHashMapFromSelf({ key: S.String, value: S.Number });
    const equivalence = S.equivalence(schema);

    const map1 = MutableHashMap.empty<string, number>();
    const map2 = MutableHashMap.empty<string, number>();

    assertTrue(equivalence(map1, map2));
  });

  it("equivalence reflects mutations", () => {
    const schema = MutableHashMapFromSelf({ key: S.String, value: S.Number });
    const equivalence = S.equivalence(schema);

    const map1 = MutableHashMap.fromIterable([["a", 1]]);
    const map2 = MutableHashMap.fromIterable([["a", 1]]);

    // Initially equivalent
    assertTrue(equivalence(map1, map2));

    // Mutate map1
    MutableHashMap.set(map1, "a", 999);

    // No longer equivalent
    assertFalse(equivalence(map1, map2));
  });

  it("single element maps are equivalent", () => {
    const schema = MutableHashMapFromSelf({ key: S.String, value: S.Number });
    const equivalence = S.equivalence(schema);

    const map1 = MutableHashMap.fromIterable([["x", 42]]);
    const map2 = MutableHashMap.fromIterable([["x", 42]]);

    assertTrue(equivalence(map1, map2));
  });
});

// -----------------------------------------------------------------------------
// Edge cases
// -----------------------------------------------------------------------------

describe("Edge cases", () => {
  describe("MutableHashMap", () => {
    effect("handles duplicate keys - last value wins", () =>
      Effect.gen(function* () {
        const schema = MHM({ key: S.String, value: S.Number });
        const input = [
          ["a", 1],
          ["a", 2], // duplicate key
        ];
        const result = S.decodeUnknownSync(schema)(input);

        // MutableHashMap.fromIterable with duplicate keys - last value should win
        const value = MutableHashMap.get(result, "a");
        strictEqual(value._tag, "Some");
        if (value._tag === "Some") {
          strictEqual(value.value, 2);
        }
      })
    );

    effect("handles special string keys", () =>
      Effect.gen(function* () {
        const schema = MHM({ key: S.String, value: S.Number });
        const input = [
          ["", 1], // empty string
          ["  ", 2], // whitespace
          ["key\nwith\nnewlines", 3],
        ];
        const result = S.decodeUnknownSync(schema)(input);

        strictEqual(MutableHashMap.get(result, "")._tag, "Some");
        strictEqual(MutableHashMap.get(result, "  ")._tag, "Some");
        strictEqual(MutableHashMap.get(result, "key\nwith\nnewlines")._tag, "Some");
      })
    );
  });

  describe("MutableHashMapFromSelf", () => {
    effect("handles large MutableHashMap", () =>
      Effect.gen(function* () {
        const schema = MutableHashMapFromSelf({ key: S.Number, value: S.String });
        const entries: Array<readonly [number, string]> = [];
        for (let i = 0; i < 1000; i++) {
          entries.push([i, `value-${i}`]);
        }
        const map = MutableHashMap.fromIterable(entries);
        const result = S.decodeUnknownSync(schema)(map);

        strictEqual(MutableHashMap.size(result), 1000);
      })
    );

    effect("handles nested schema types", () =>
      Effect.gen(function* () {
        const schema = MutableHashMapFromSelf({
          key: S.String,
          value: S.Struct({ name: S.String, age: S.Number }),
        });
        const map = MutableHashMap.fromIterable([
          ["user1", { name: "Alice", age: 30 }],
          ["user2", { name: "Bob", age: 25 }],
        ]);
        const result = S.decodeUnknownSync(schema)(map);

        assertTrue(isMutableHashMap(result));
        const user1 = MutableHashMap.get(result, "user1");
        strictEqual(user1._tag, "Some");
        if (user1._tag === "Some") {
          strictEqual(user1.value.name, "Alice");
          strictEqual(user1.value.age, 30);
        }
      })
    );
  });
});
