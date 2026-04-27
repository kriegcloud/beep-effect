import { Set } from "@beep/utils";
import * as Equivalence from "effect/Equivalence";
import { pipe } from "effect/Function";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as Result from "effect/Result";
import { describe, expect, it } from "vitest";

const numberEq = Equivalence.strictEqual<number>();
const stringEq = Equivalence.strictEqual<string>();

const fromNumbers = (values: ReadonlyArray<number>): Set.Set<number> => Set.fromArray(values, numberEq);
const toNumbers = (values: Set.Set<number>): ReadonlyArray<number> => Set.toArray(values, Order.Number);

describe("@beep/utils Set constructors and boundaries", () => {
  it("exposes empty and clones mutable boundaries", () => {
    expect(Set.empty.size).toBe(0);

    const mutable = new globalThis.Set([1, 2]);
    const readonly = Set.fromMutable(mutable);
    mutable.add(3);

    expect(toNumbers(readonly)).toEqual([1, 2]);

    const mutableCopy = Set.toMutable(readonly);
    mutableCopy.add(4);

    expect(toNumbers(readonly)).toEqual([1, 2]);
    expect(Set.toArray(mutableCopy, Order.Number)).toEqual([1, 2, 4]);
    expect(toNumbers(Set.singleton(9))).toEqual([9]);
  });

  it("deduplicates from arrays and sorts in both invocation styles", () => {
    const dataFirst = Set.fromArray([3, 1, 3, 2], numberEq);
    const dataLast = pipe([2, 2, 1], Set.fromArray(numberEq));

    expect(Set.toArray(dataFirst, Order.Number)).toEqual([1, 2, 3]);
    expect(pipe(dataFirst, Set.toArray(Order.Number))).toEqual([1, 2, 3]);
    expect(Set.toArray(dataLast, Order.Number)).toEqual([1, 2]);
  });
});

describe("@beep/utils Set find helpers", () => {
  it("finds values and maps first present values", () => {
    const values = fromNumbers([1, 2, 3]);

    expect(Set.findFirst(values, (value) => value > 1)).toEqual(O.some(2));
    expect(
      pipe(
        values,
        Set.findFirst((value) => value > 4)
      )
    ).toEqual(O.none());
    expect(Set.findFirstMap(values, (value) => (value > 2 ? O.some(`${value}`) : O.none()))).toEqual(O.some("3"));
    expect(
      pipe(
        values,
        Set.findFirstMap((value) => (value > 4 ? O.some(value) : O.none()))
      )
    ).toEqual(O.none());
  });

  it("supports refinement overloads", () => {
    type Tagged =
      | { readonly _tag: "number"; readonly value: number }
      | { readonly _tag: "string"; readonly value: string };

    const isNumberTagged = (value: Tagged): value is Extract<Tagged, { readonly _tag: "number" }> =>
      value._tag === "number";
    const values: Set.Set<Tagged> = new globalThis.Set([
      { _tag: "string", value: "one" },
      { _tag: "number", value: 1 },
    ]);

    expect(Set.findFirst(values, isNumberTagged)).toEqual(O.some({ _tag: "number", value: 1 }));
  });
});

describe("@beep/utils Set predicates", () => {
  it("checks predicates, element membership, and subset relationships", () => {
    const values = fromNumbers([1, 2, 3]);

    expect(Set.some(values, (value) => value === 2)).toBe(true);
    expect(
      pipe(
        values,
        Set.some((value) => value > 3)
      )
    ).toBe(false);
    expect(Set.every(values, (value) => value > 0)).toBe(true);
    expect(
      pipe(
        values,
        Set.every((value) => value < 3)
      )
    ).toBe(false);
    expect(Set.elem(values, 2, numberEq)).toBe(true);
    expect(pipe(values, Set.elem(4, numberEq))).toBe(false);
    expect(Set.isSubset(fromNumbers([1, 2]), values, numberEq)).toBe(true);
    expect(pipe(fromNumbers([1, 4]), Set.isSubset(values, numberEq))).toBe(false);
  });
});

describe("@beep/utils Set filtering", () => {
  it("filters and partitions values", () => {
    const values = fromNumbers([1, 2, 3, 4]);

    expect(toNumbers(Set.filter(values, (value) => value > 1))).toEqual([2, 3, 4]);
    expect(
      toNumbers(
        pipe(
          values,
          Set.filter((value) => value < 3)
        )
      )
    ).toEqual([1, 2]);

    const [odds, evens] = Set.partition(values, (value) => value % 2 === 0);
    const [small, large] = pipe(
      values,
      Set.partition((value) => value > 2)
    );

    expect(toNumbers(odds)).toEqual([1, 3]);
    expect(toNumbers(evens)).toEqual([2, 4]);
    expect(toNumbers(small)).toEqual([1, 2]);
    expect(toNumbers(large)).toEqual([3, 4]);
  });

  it("filterMaps and compacts optional values with deduplication", () => {
    const values = fromNumbers([2, 3, 4]);
    const optionalValues = new globalThis.Set([O.some(1), O.none<number>(), O.some(1)]);

    expect(toNumbers(Set.filterMap(values, (value) => (value % 2 === 0 ? O.some(1) : O.none()), numberEq))).toEqual([
      1,
    ]);
    expect(
      toNumbers(
        pipe(
          values,
          Set.filterMap((value) => (value > 3 ? O.some(value) : O.none()), numberEq)
        )
      )
    ).toEqual([4]);
    expect(toNumbers(Set.compact(optionalValues, numberEq))).toEqual([1]);
    expect(toNumbers(pipe(optionalValues, Set.compact(numberEq)))).toEqual([1]);
  });

  it("partitions and separates Result values", () => {
    const values = fromNumbers([1, 2, 3, 4]);
    const split = (value: number): Result.Result<number, string> =>
      value % 2 === 0 ? Result.succeed(value / 2) : Result.fail("odd");

    const [failures, successes] = Set.partitionMap(values, split, stringEq, numberEq);
    const [noFailures, duplicateSuccesses] = pipe(
      fromNumbers([2, 4]),
      Set.partitionMap(() => Result.succeed(1), stringEq, numberEq)
    );
    const resultValues: Set.Set<Result.Result<number, string>> = new globalThis.Set([
      Result.fail("left"),
      Result.fail("left"),
      Result.succeed(1),
      Result.succeed(1),
    ]);
    const [left, right] = Set.separate(resultValues, stringEq, numberEq);
    const [leftDataLast, rightDataLast] = pipe(resultValues, Set.separate(stringEq, numberEq));

    expect(Set.toArray(failures, Order.String)).toEqual(["odd"]);
    expect(toNumbers(successes)).toEqual([1, 2]);
    expect(Set.toArray(noFailures, Order.String)).toEqual([]);
    expect(toNumbers(duplicateSuccesses)).toEqual([1]);
    expect(Set.toArray(left, Order.String)).toEqual(["left"]);
    expect(toNumbers(right)).toEqual([1]);
    expect(Set.toArray(leftDataLast, Order.String)).toEqual(["left"]);
    expect(toNumbers(rightDataLast)).toEqual([1]);
  });
});

describe("@beep/utils Set algebra", () => {
  it("maps and chains with output equivalence", () => {
    const words = new globalThis.Set(["a", "bb", "cc"]);
    const values = fromNumbers([1, 2]);

    expect(toNumbers(Set.map(words, (value) => value.length, numberEq))).toEqual([1, 2]);
    expect(
      toNumbers(
        pipe(
          words,
          Set.map((value) => value.length + 10, numberEq)
        )
      )
    ).toEqual([11, 12]);
    expect(toNumbers(Set.chain(values, (value) => fromNumbers([value, value + 1]), numberEq))).toEqual([1, 2, 3]);
    expect(
      toNumbers(
        pipe(
          values,
          Set.chain((value) => fromNumbers([value * 2]), numberEq)
        )
      )
    ).toEqual([2, 4]);
  });

  it("combines, intersects, and subtracts sets", () => {
    const left = fromNumbers([1, 2, 3]);
    const right = fromNumbers([2, 4]);

    expect(toNumbers(Set.intersection(left, right, numberEq))).toEqual([2]);
    expect(toNumbers(pipe(left, Set.intersection(right, numberEq)))).toEqual([2]);
    expect(toNumbers(Set.difference(left, right, numberEq))).toEqual([1, 3]);
    expect(toNumbers(pipe(left, Set.difference(right, numberEq)))).toEqual([1, 3]);
    expect(toNumbers(Set.union(left, right, numberEq))).toEqual([1, 2, 3, 4]);
    expect(toNumbers(pipe(left, Set.union(right, numberEq)))).toEqual([1, 2, 3, 4]);
  });

  it("inserts, removes, toggles, and reduces values", () => {
    const values = fromNumbers([1, 2]);
    const unchanged = Set.insert(values, 2, numberEq);
    const ordered = fromNumbers([3, 1, 2]);

    expect(unchanged).toBe(values);
    expect(toNumbers(pipe(values, Set.insert(3, numberEq)))).toEqual([1, 2, 3]);
    expect(toNumbers(Set.remove(values, 1, numberEq))).toEqual([2]);
    expect(toNumbers(pipe(values, Set.remove(2, numberEq)))).toEqual([1]);
    expect(toNumbers(Set.toggle(values, 1, numberEq))).toEqual([2]);
    expect(toNumbers(pipe(values, Set.toggle(3, numberEq)))).toEqual([1, 2, 3]);
    expect(Set.reduce(ordered, "", (out, value) => `${out}${value}`, Order.Number)).toBe("123");
    expect(
      pipe(
        ordered,
        Set.reduce(0, (out, value) => out + value, Order.Number)
      )
    ).toBe(6);
  });
});

describe("@beep/utils Set.make", () => {
  it("binds helpers to an ordered value domain", () => {
    const numbers = Set.make(Order.Number);
    const base = numbers.from([3, 1, 2, 2]);

    expect(numbers.empty().size).toBe(0);
    expect(numbers.toArray(base)).toEqual([1, 2, 3]);
    expect(numbers.toArray(numbers.fromArray([2, 2, 1]))).toEqual([1, 2]);
    expect(numbers.elem(base, 2)).toBe(true);
    expect(pipe(base, numbers.elem(4))).toBe(false);
    expect(numbers.isSubset(numbers.from([1, 2]), base)).toBe(true);
    expect(pipe(numbers.from([1, 4]), numbers.isSubset(base))).toBe(false);
    expect(numbers.toArray(numbers.insert(base, 4))).toEqual([1, 2, 3, 4]);
    expect(numbers.toArray(pipe(base, numbers.remove(2)))).toEqual([1, 3]);
    expect(numbers.toArray(numbers.toggle(base, 2))).toEqual([1, 3]);
    expect(numbers.toArray(pipe(base, numbers.toggle(4)))).toEqual([1, 2, 3, 4]);
    expect(numbers.toArray(numbers.concat(base, [3, 4, 4]))).toEqual([1, 2, 3, 4]);
    expect(numbers.toArray(numbers.union(base, numbers.from([3, 5])))).toEqual([1, 2, 3, 5]);
    expect(numbers.toArray(numbers.intersection(base, numbers.from([2, 4])))).toEqual([2]);
    expect(numbers.toArray(numbers.difference(base, numbers.from([2])))).toEqual([1, 3]);
    expect(numbers.toArray(numbers.map(base, (value) => value % 2))).toEqual([0, 1]);
    expect(numbers.toArray(numbers.filter(base, (value) => value > 1))).toEqual([2, 3]);
    expect(numbers.toArray(numbers.filterMap(base, (value) => (value > 1 ? O.some(value - 1) : O.none())))).toEqual([
      1, 2,
    ]);
    expect(numbers.reduce(base, "", (out, value) => `${out}${value}`)).toBe("123");
  });

  it("accepts a custom equivalence", () => {
    const caseInsensitiveEq = Equivalence.make<string>((self, that) => self.toLowerCase() === that.toLowerCase());
    const strings = Set.make(Order.String, caseInsensitiveEq);
    const values = strings.from(["a", "A", "b"]);

    expect(strings.toArray(values)).toEqual(["a", "b"]);
    expect(strings.toArray(strings.replace(values, "A"))).toEqual(["A", "b"]);
  });
});
