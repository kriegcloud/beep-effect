/**
 * Proofs for the EffectGraph engine: construction, child/root queries, the
 * catamorphism/anamorphism duality, and the Functor map.
 *
 * Ported from the `adjunct` repo's graph tests to Effect v4 + `@effect/vitest`.
 * Node construction is effectful (Clock + Random id), so tests run under the
 * default test runtime.
 */

import { describe, expect, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as EG from "../../src/Graph/EffectGraph.ts";

describe("EffectGraph construction", () => {
  it.effect("singleton has one root node", () =>
    Effect.gen(function* () {
      const g = yield* EG.singleton("root");
      expect(EG.size(g)).toBe(1);
      const roots = EG.getRoots(g);
      expect(roots).toHaveLength(1);
      expect(roots[0]?.data).toBe("root");
    })
  );

  it.effect("addNode links a child under its parent", () =>
    Effect.gen(function* () {
      const g0 = yield* EG.singleton("parent");
      const parent = EG.getRoots(g0)[0]!;
      const childNode = yield* EG.makeNode("child", O.some(parent.id));
      const g1 = EG.addNode(g0, childNode);
      expect(EG.size(g1)).toBe(2);
      const children = EG.getChildren(g1, parent.id);
      expect(children).toHaveLength(1);
      expect(children[0]?.data).toBe("child");
      expect(children[0]?.metadata.depth).toBe(1);
    })
  );

  it.effect("generates distinct node ids", () =>
    Effect.gen(function* () {
      const a = yield* EG.makeNode("a");
      const b = yield* EG.makeNode("b");
      expect(a.id).not.toBe(b.id);
    })
  );
});

describe("Catamorphism", () => {
  it.effect("counts nodes via a bottom-up fold (1 + sum of children)", () =>
    Effect.gen(function* () {
      // build: root -> [c1, c2]; c1 -> [gc]
      const g0 = yield* EG.singleton("root");
      const root = EG.getRoots(g0)[0]!;
      const c1 = yield* EG.makeNode("c1", O.some(root.id));
      const g1 = EG.addNode(g0, c1);
      const c2 = yield* EG.makeNode("c2", O.some(root.id));
      const g2 = EG.addNode(g1, c2);
      const gc = yield* EG.makeNode("gc", O.some(c1.id));
      const g3 = EG.addNode(g2, gc);

      const counts = yield* EG.cata(g3, (_node, children) => 1 + children.reduce((s, n) => s + n, 0));
      // single root, total nodes = 4
      expect(counts).toHaveLength(1);
      expect(counts[0]).toBe(4);
    })
  );

  it.effect("collects data bottom-up", () =>
    Effect.gen(function* () {
      const g0 = yield* EG.singleton("root");
      const root = EG.getRoots(g0)[0]!;
      const c1 = yield* EG.makeNode("a", O.some(root.id));
      const g1 = EG.addNode(g0, c1);
      const collected = yield* EG.cata(
        g1,
        (node, children) => [node.data, ...children.flat()] as ReadonlyArray<string>
      );
      expect(collected[0]).toContain("root");
      expect(collected[0]).toContain("a");
    })
  );
});

describe("Anamorphism", () => {
  it.effect("unfolds a bounded tree from a numeric seed", () =>
    Effect.gen(function* () {
      // seed n -> data `n`, children [n-1] until 0
      const g = yield* EG.ana<string, number>(2, (n) => Effect.succeed([`n${n}`, n > 0 ? [n - 1] : []] as const));
      // 2 -> 1 -> 0  => 3 nodes
      expect(EG.size(g)).toBe(3);
      expect(EG.getRoots(g)).toHaveLength(1);
    })
  );
});

describe("Functor map", () => {
  it.effect("map preserves structure and transforms data", () =>
    Effect.gen(function* () {
      const g0 = yield* EG.singleton("root");
      const root = EG.getRoots(g0)[0]!;
      const c1 = yield* EG.makeNode("child", O.some(root.id));
      const g1 = EG.addNode(g0, c1);
      const mapped = EG.map(g1, (s) => s.toUpperCase());
      expect(EG.size(mapped)).toBe(2);
      const mappedRoot = EG.getRoots(mapped)[0]!;
      expect(mappedRoot.data).toBe("ROOT");
      const children = EG.getChildren(mapped, mappedRoot.id);
      expect(children[0]?.data).toBe("CHILD");
    })
  );
});
