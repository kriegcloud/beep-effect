/**
 * Property-based tests ("proofs") for Monoid laws.
 *
 * Verifies that each monoid instance satisfies:
 * 1. Left identity:  empty ⊕ x = x
 * 2. Right identity: x ⊕ empty = x
 * 3. Associativity:  (x ⊕ y) ⊕ z = x ⊕ (y ⊕ z)
 *
 * Property-based coverage for Effect v4's
 * `effect/testing/FastCheck`. These proofs are the fidelity gate for the port.
 */

import * as Monoid from "@beep/nlp/Algebra/Monoid";
import { describe, expect, it } from "@effect/vitest";
import { FastCheck as fc } from "effect/testing";

const testMonoidLaws = <A>(
  name: string,
  monoid: Monoid.Monoid<A>,
  arbitrary: fc.Arbitrary<A>,
  equals: (a: A, b: A) => boolean = (a, b) => a === b
) => {
  describe(`${name} Monoid Laws`, () => {
    it("satisfies left identity: empty ⊕ x = x", () => {
      fc.assert(fc.property(arbitrary, (x) => equals(monoid.combine(monoid.empty, x), x)));
    });

    it("satisfies right identity: x ⊕ empty = x", () => {
      fc.assert(fc.property(arbitrary, (x) => equals(monoid.combine(x, monoid.empty), x)));
    });

    it("satisfies associativity: (x ⊕ y) ⊕ z = x ⊕ (y ⊕ z)", () => {
      fc.assert(
        fc.property(arbitrary, arbitrary, arbitrary, (x, y, z) => {
          const left = monoid.combine(monoid.combine(x, y), z);
          const right = monoid.combine(x, monoid.combine(y, z));
          return equals(left, right);
        })
      );
    });
  });
};

// String monoids
testMonoidLaws("StringConcat", Monoid.StringConcat, fc.string());
testMonoidLaws("StringJoin(' ')", Monoid.StringJoin(" "), fc.string());
testMonoidLaws("StringJoin(', ')", Monoid.StringJoin(", "), fc.string());

// Numeric monoids
testMonoidLaws("NumberSum", Monoid.NumberSum, fc.integer());
testMonoidLaws("NumberProduct", Monoid.NumberProduct, fc.integer({ min: -100_000, max: 100_000 }));
testMonoidLaws("NumberMax", Monoid.NumberMax, fc.integer({ min: -1000, max: 1000 }));
testMonoidLaws("NumberMin", Monoid.NumberMin, fc.integer({ min: -1000, max: 1000 }));

// Array monoid
testMonoidLaws(
  "ArrayConcat<number>",
  Monoid.ArrayConcat<number>(),
  fc.array(fc.integer()),
  (a, b) => a.length === b.length && a.every((x, i) => x === b[i])
);

// Boolean monoids
testMonoidLaws("BooleanAll", Monoid.BooleanAll, fc.boolean());
testMonoidLaws("BooleanAny", Monoid.BooleanAny, fc.boolean());

// Product monoid
describe("Product Monoid Laws", () => {
  const productMonoid = Monoid.Product(Monoid.NumberSum, Monoid.StringConcat);
  const arbitrary = fc.tuple(fc.integer(), fc.string());
  const equals = (a: readonly [number, string], b: readonly [number, string]) => a[0] === b[0] && a[1] === b[1];
  testMonoidLaws("Product(NumberSum, StringConcat)", productMonoid, arbitrary, equals);
});

// Endomorphism monoid
describe("Endo<number> Monoid Laws", () => {
  const endoMonoid = Monoid.Endo<number>();
  const funcArbitrary = fc.func<[number], number>(fc.integer());
  const equals = (f: (n: number) => number, g: (n: number) => number) =>
    [0, 1, -1, 42, 100].every((input) => f(input) === g(input));
  testMonoidLaws("Endo<number>", endoMonoid, funcArbitrary, equals);
});

// Dual monoid
describe("Dual Monoid", () => {
  const dualConcat = Monoid.Dual(Monoid.StringConcat);
  it("reverses combination order", () => {
    expect(dualConcat.combine("Hello", " world")).toBe(" worldHello");
  });
  testMonoidLaws("Dual(StringConcat)", dualConcat, fc.string());
});

// Vector monoid
describe("VectorAdd Monoid", () => {
  const vectorMonoid = Monoid.VectorAdd(3);
  it("has the zero vector as identity", () => {
    expect(vectorMonoid.empty).toEqual([0, 0, 0]);
  });
  it("adds vectors element-wise", () => {
    expect(vectorMonoid.combine([1, 2, 3], [4, 5, 6])).toEqual([5, 7, 9]);
  });
  testMonoidLaws(
    "VectorAdd(3)",
    vectorMonoid,
    fc.array(fc.integer(), { minLength: 3, maxLength: 3 }),
    (a, b) => a.length === b.length && a.every((x, i) => x === b[i])
  );
});

// fold / combineAll
describe("Monoid.fold and combineAll", () => {
  it("folds an empty array to the identity", () => {
    expect(Monoid.fold(Monoid.NumberSum)([])).toBe(0);
  });
  it("folds multiple elements correctly", () => {
    expect(Monoid.fold(Monoid.NumberSum)([1, 2, 3, 4, 5])).toBe(15);
  });
  it("joins strings via fold", () => {
    expect(Monoid.fold(Monoid.StringJoin(" "))(["Hello", "world", "from", "Effect"])).toBe("Hello world from Effect");
  });
  it("combineAll combines all elements", () => {
    expect(Monoid.combineAll(Monoid.NumberSum)([1, 2, 3, 4, 5])).toBe(15);
  });
  it("combineAll handles the empty array", () => {
    expect(Monoid.combineAll(Monoid.NumberSum)([])).toBe(0);
  });
});
