import type { Effect, HashMap, HashSet } from "effect";
import { describe, expect, it } from "tstyche";
import { type CyclicDependencyError, computeTransitiveClosure, detectCycles, topologicalSort } from "../src/index.js";

declare const adjacencyList: HashMap.HashMap<string, HashSet.HashSet<string>>;

describe("Graph", () => {
  it("topologicalSort returns ReadonlyArray<string> or CyclicDependencyError", () => {
    expect(topologicalSort(adjacencyList)).type.toBe<Effect.Effect<ReadonlyArray<string>, CyclicDependencyError>>();
  });

  it("detectCycles returns ReadonlyArray<ReadonlyArray<string>>", () => {
    expect(detectCycles(adjacencyList)).type.toBe<Effect.Effect<ReadonlyArray<ReadonlyArray<string>>>>();
  });

  it("computeTransitiveClosure returns HashSet<string>", () => {
    expect(computeTransitiveClosure(adjacencyList, "pkg")).type.toBe<Effect.Effect<HashSet.HashSet<string>>>();
  });
});
