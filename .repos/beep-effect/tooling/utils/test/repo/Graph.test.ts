/**
 * Tests for graph utilities.
 *
 * @module @beep/tooling-utils/test/repo/Graph
 */

import { describe, expect } from "bun:test";
import { effect, strictEqual } from "@beep/testkit";
import { computeTransitiveClosure, detectCycles, topologicalSort } from "@beep/tooling-utils";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";

describe("Graph", () => {
  describe("topologicalSort", () => {
    effect("sorts simple linear dependencies", () =>
      Effect.gen(function* () {
        // a -> b -> c (c depends on b, b depends on a)
        const graph = HashMap.make(["a", HashSet.empty<string>()], ["b", HashSet.make("a")], ["c", HashSet.make("b")]);

        const result = yield* topologicalSort(graph);

        // a should come before b, b before c
        const aIdx = A.findFirstIndex(result, (x) => x === "a");
        const bIdx = A.findFirstIndex(result, (x) => x === "b");
        const cIdx = A.findFirstIndex(result, (x) => x === "c");

        expect(aIdx._tag).toBe("Some");
        expect(bIdx._tag).toBe("Some");
        expect(cIdx._tag).toBe("Some");
        if (aIdx._tag === "Some" && bIdx._tag === "Some" && cIdx._tag === "Some") {
          expect(aIdx.value < bIdx.value).toBe(true);
          expect(bIdx.value < cIdx.value).toBe(true);
        }
      })
    );

    effect("sorts diamond dependencies", () =>
      Effect.gen(function* () {
        //     a
        //    / \
        //   b   c
        //    \ /
        //     d (d depends on b and c, both depend on a)
        const graph = HashMap.make(
          ["a", HashSet.empty<string>()],
          ["b", HashSet.make("a")],
          ["c", HashSet.make("a")],
          ["d", HashSet.make("b", "c")]
        );

        const result = yield* topologicalSort(graph);

        strictEqual(A.length(result), 4);

        // a must come before b and c
        const aIdx = A.findFirstIndex(result, (x) => x === "a");
        const bIdx = A.findFirstIndex(result, (x) => x === "b");
        const cIdx = A.findFirstIndex(result, (x) => x === "c");
        const dIdx = A.findFirstIndex(result, (x) => x === "d");

        if (aIdx._tag === "Some" && bIdx._tag === "Some" && cIdx._tag === "Some" && dIdx._tag === "Some") {
          expect(aIdx.value < bIdx.value).toBe(true);
          expect(aIdx.value < cIdx.value).toBe(true);
          expect(bIdx.value < dIdx.value).toBe(true);
          expect(cIdx.value < dIdx.value).toBe(true);
        }
      })
    );

    effect("handles empty graph", () =>
      Effect.gen(function* () {
        const graph = HashMap.empty<string, HashSet.HashSet<string>>();
        const result = yield* topologicalSort(graph);
        strictEqual(A.length(result), 0);
      })
    );

    effect("handles single node", () =>
      Effect.gen(function* () {
        const graph = HashMap.make(["a", HashSet.empty<string>()]);
        const result = yield* topologicalSort(graph);
        strictEqual(A.length(result), 1);
        strictEqual(A.get(result, 0)._tag, "Some");
      })
    );

    effect("detects simple cycle", () =>
      Effect.gen(function* () {
        // a -> b -> a
        const graph = HashMap.make(["a", HashSet.make("b")], ["b", HashSet.make("a")]);

        const exit = yield* Effect.exit(topologicalSort(graph));

        expect(Exit.isFailure(exit)).toBe(true);
        if (Exit.isFailure(exit)) {
          const cause = exit.cause;
          expect(cause._tag).toBe("Fail");
        }
      })
    );
  });

  describe("detectCycles", () => {
    effect("returns empty for acyclic graph", () =>
      Effect.gen(function* () {
        const graph = HashMap.make(["a", HashSet.empty<string>()], ["b", HashSet.make("a")], ["c", HashSet.make("b")]);

        const cycles = yield* detectCycles(graph);
        strictEqual(A.length(cycles), 0);
      })
    );

    effect("detects simple cycle", () =>
      Effect.gen(function* () {
        // a -> b -> a
        const graph = HashMap.make(["a", HashSet.make("b")], ["b", HashSet.make("a")]);

        const cycles = yield* detectCycles(graph);
        expect(A.length(cycles)).toBeGreaterThan(0);
      })
    );

    effect("detects self-loop", () =>
      Effect.gen(function* () {
        // a -> a
        const graph = HashMap.make(["a", HashSet.make("a")]);

        const cycles = yield* detectCycles(graph);
        expect(A.length(cycles)).toBeGreaterThan(0);
      })
    );
  });

  describe("computeTransitiveClosure", () => {
    effect("computes direct dependencies", () =>
      Effect.gen(function* () {
        const graph = HashMap.make(["a", HashSet.empty<string>()], ["b", HashSet.make("a")], ["c", HashSet.make("b")]);

        const deps = yield* computeTransitiveClosure(graph, "b");

        expect(HashSet.has(deps, "a")).toBe(true);
        expect(HashSet.has(deps, "b")).toBe(false); // b is not a dependency of itself
        expect(HashSet.has(deps, "c")).toBe(false); // c depends on b, not the other way
      })
    );

    effect("computes transitive dependencies", () =>
      Effect.gen(function* () {
        const graph = HashMap.make(["a", HashSet.empty<string>()], ["b", HashSet.make("a")], ["c", HashSet.make("b")]);

        const deps = yield* computeTransitiveClosure(graph, "c");

        expect(HashSet.has(deps, "a")).toBe(true);
        expect(HashSet.has(deps, "b")).toBe(true);
        expect(HashSet.has(deps, "c")).toBe(false);
      })
    );

    effect("handles no dependencies", () =>
      Effect.gen(function* () {
        const graph = HashMap.make(["a", HashSet.empty<string>()], ["b", HashSet.empty<string>()]);

        const deps = yield* computeTransitiveClosure(graph, "a");
        strictEqual(HashSet.size(deps), 0);
      })
    );

    effect("fails on cyclic graph", () =>
      Effect.gen(function* () {
        const graph = HashMap.make(["a", HashSet.make("b")], ["b", HashSet.make("a")]);

        const exit = yield* Effect.exit(computeTransitiveClosure(graph, "a"));

        expect(Exit.isFailure(exit)).toBe(true);
      })
    );
  });
});
