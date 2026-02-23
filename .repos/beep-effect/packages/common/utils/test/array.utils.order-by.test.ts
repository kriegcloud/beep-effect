import { expect } from "bun:test";
import { effect } from "@beep/testkit";
import { orderBy } from "@beep/utils/data/array.utils/order-by";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";

effect(
  "orderBy sorts strings ascending by default",
  Effect.fn(function* () {
    const data = [
      { id: 1, name: "Charlie" },
      { id: 2, name: "Alpha" },
      { id: 3, name: "Bravo" },
    ] as const;

    const sorted = orderBy(data, ["name"]);

    const names = F.pipe(
      sorted,
      A.map((item) => item.name)
    );

    expect(names).toEqual(["Alpha", "Bravo", "Charlie"]);
  })
);

effect(
  "orderBy respects direction hints and keeps nullish values last",
  Effect.fn(function* () {
    const data = [
      { id: 1, score: 90 },
      { id: 2, score: null },
      { id: 3, score: 75 },
      { id: 4, score: undefined },
      { id: 5, score: 82 },
    ] as const;

    const sorted = orderBy(data, ["score"], ["DESC "]);

    const scores = F.pipe(
      sorted,
      A.map((item) => item.score)
    );

    expect(scores).toEqual([90, 82, 75, null, undefined]);
  })
);

effect(
  "orderBy supports functional iteratees",
  Effect.fn(function* () {
    const data = [
      { id: 1, value: 3 },
      { id: 2, value: 1 },
      { id: 3, value: 2 },
    ] as const;

    const sorted = orderBy(data, [(item) => item.value], ["asc"]);

    const values = F.pipe(
      sorted,
      A.map((item) => item.value)
    );

    expect(values).toEqual([1, 2, 3]);
  })
);

effect(
  "orderBy handles multi-key sorting with fallback directions",
  Effect.fn(function* () {
    const data = [
      { id: 1, group: "beta", score: 90 },
      { id: 2, group: "alpha", score: 95 },
      { id: 3, group: "beta", score: 85 },
      { id: 4, group: "alpha", score: 92 },
      { id: 5, group: "beta", score: 92 },
    ] as const;

    const sorted = orderBy(data, ["group", "score"], ["asc", "desc"]);

    const projection = F.pipe(
      sorted,
      A.map((item) => `${item.group}:${item.score}`)
    );

    expect(projection).toEqual(["alpha:95", "alpha:92", "beta:92", "beta:90", "beta:85"]);
  })
);

effect(
  "orderBy defaults missing directions to ascending",
  Effect.fn(function* () {
    const data = [
      { id: 1, group: "alpha", priority: 2 },
      { id: 2, group: "alpha", priority: 1 },
      { id: 3, group: "beta", priority: 3 },
      { id: 4, group: "beta", priority: 2 },
    ] as const;

    const sorted = orderBy(data, ["group", "priority"], ["desc"]);

    const ids = F.pipe(
      sorted,
      A.map((item) => item.id)
    );

    expect(ids).toEqual([4, 3, 2, 1]);
  })
);

effect(
  "orderBy resolves nested paths using getNestedValue",
  Effect.fn(function* () {
    const data = [
      { id: 1, stats: { attempts: 3, score: 10 } },
      { id: 2, stats: { attempts: 4, score: 7 } },
      { id: 3, stats: { attempts: 2, score: 12 } },
      { id: 4, stats: { attempts: 2, score: 9 } },
    ] as const;

    const sorted = orderBy(data, ["stats.attempts", "stats.score"], ["asc", "desc"]);

    const attemptOrder = F.pipe(
      sorted,
      A.map((item) => item.id)
    );

    expect(attemptOrder).toEqual([3, 4, 1, 2]);
  })
);

effect(
  "orderBy does not mutate the original input array",
  Effect.fn(function* () {
    const data = [
      { id: 1, label: "c" },
      { id: 2, label: "a" },
      { id: 3, label: "b" },
    ] as const;

    const originalReference = data;

    const sorted = orderBy(data, ["label"]);

    expect(sorted).not.toBe(originalReference);
    expect(data).toEqual([
      { id: 1, label: "c" },
      { id: 2, label: "a" },
      { id: 3, label: "b" },
    ]);

    const first = F.pipe(
      sorted,
      A.head,
      O.map((item) => item.label),
      O.getOrElse(() => "")
    );

    expect(first).toBe("a");
  })
);

effect(
  "orderBy covers compareUnknown branches for various scalar types",
  Effect.fn(function* () {
    const data = [
      { id: "nan", value: Number.NaN },
      { id: "one", value: 1 },
      { id: "zero", value: 0 },
      { id: "undef", value: undefined },
      { id: "null", value: null },
    ] as const;

    const sorted = orderBy(data, [(item) => item.value], ["asc"]);
    const ids = F.pipe(
      sorted,
      A.map((item) => item.id)
    );

    expect(ids).toEqual(["zero", "one", "nan", "undef", "null"]);
  })
);

effect(
  "orderBy compares booleans, bigints, dates, symbols, arrays, and objects",
  Effect.fn(function* () {
    const bools = [
      { id: "true", value: true },
      { id: "false", value: false },
    ] as const;
    const bigints = [
      { id: "small", value: 1n },
      { id: "large", value: 2n },
    ] as const;
    const dates = [
      { id: "early", value: new Date("2023-12-31T00:00:00.000Z") },
      { id: "later", value: new Date("2024-01-02T00:00:00.000Z") },
    ] as const;
    const symbols = [
      { id: "a", value: Symbol("a") },
      { id: "b", value: Symbol("b") },
    ] as const;
    const arrays = [
      { id: "small", value: [1, 2] },
      { id: "large", value: [1, 3] },
    ] as const;
    const objects = [
      { id: "a", value: { a: 1 } },
      { id: "b", value: { a: 2 } },
    ] as const;
    const strings = [
      { id: "a", value: "alpha" },
      { id: "b", value: "beta" },
    ] as const;

    expect(orderBy(bools, [(item) => item.value], ["DESC"])).toEqual([
      { id: "true", value: true },
      { id: "false", value: false },
    ]);
    expect(orderBy(bigints, [(item) => item.value], ["DESC"])).toEqual([
      { id: "large", value: 2n },
      { id: "small", value: 1n },
    ]);
    expect(orderBy(dates, [(item) => item.value], ["DESC"])).toEqual([
      { id: "later", value: new Date("2024-01-02T00:00:00.000Z") },
      { id: "early", value: new Date("2023-12-31T00:00:00.000Z") },
    ]);
    expect(orderBy(symbols, [(item) => item.value], ["DESC"])[0]?.id).toBe("b");
    expect(orderBy(arrays, [(item) => item.value], ["DESC"])[0]?.id).toBe("large");
    expect(orderBy(objects, [(item) => item.value], ["DESC"])[0]?.id).toBe("b");
    expect(orderBy(strings, [(item) => item.value], ["DESC"])).toEqual([
      { id: "b", value: "beta" },
      { id: "a", value: "alpha" },
    ]);
  })
);

effect(
  "orderBy treats NaN as equal and sorts numbers ahead of nullish values",
  Effect.fn(function* () {
    const input = [{ value: Number.NaN }, { value: 3 }, { value: Number.NaN }, { value: 2 }, { value: null }];
    const sorted = orderBy(input, ["value"]);
    const values = F.pipe(
      sorted,
      A.map((item) => item.value)
    );

    const leadingNumbers = F.pipe(values, A.take(2));

    expect(leadingNumbers).toEqual([2, 3]);
    expect(Number.isNaN(values[2])).toBe(true);
    expect(Number.isNaN(values[3])).toBe(true);
    expect(values[4]).toBeNull();
  })
);
