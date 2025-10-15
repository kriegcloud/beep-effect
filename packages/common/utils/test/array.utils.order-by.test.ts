import { expect } from "bun:test";
import { effect } from "@beep/testkit";
import { orderBy } from "@beep/utils/data/array.utils/order-by";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";

effect("orderBy sorts strings ascending by default", () =>
  Effect.gen(function* () {
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

effect("orderBy respects direction hints and keeps nullish values last", () =>
  Effect.gen(function* () {
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

effect("orderBy supports functional iteratees", () =>
  Effect.gen(function* () {
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

effect("orderBy handles multi-key sorting with fallback directions", () =>
  Effect.gen(function* () {
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

effect("orderBy defaults missing directions to ascending", () =>
  Effect.gen(function* () {
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

effect("orderBy resolves nested paths using getNestedValue", () =>
  Effect.gen(function* () {
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

effect("orderBy does not mutate the original input array", () =>
  Effect.gen(function* () {
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
